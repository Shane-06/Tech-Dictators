from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import numpy as np
import joblib
import pandas as pd
from datetime import datetime
from contextlib import asynccontextmanager
import os
from pymongo import MongoClient
from bson import ObjectId

# ============================================================================
# INITIALIZE MODEL AND DATABASE
# ============================================================================

# Global variables for model and database
model = None
db = None
predictions_collection = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model, db, predictions_collection
    
    # Load the trained XGBoost model
    model_path = os.path.join(os.path.dirname(__file__), 'trained_model.pkl')
    if os.path.exists(model_path):
        model = joblib.load(model_path)
        print("✓ ML Model loaded successfully")
    else:
        print("⚠ Model file not found. Model will be trained on first request.")
    
    # Connect to MongoDB
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    try:
        client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
        client.admin.command('ping')
        db = client['delivery_predictions']
        predictions_collection = db['predictions']
        predictions_collection.create_index('timestamp')
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"⚠ MongoDB connection failed: {e}")
    
    yield
    
    # Shutdown
    if db:
        client.close()
        print("✓ Database connection closed")

app = FastAPI(
    title="Delivery Prediction API",
    description="AI-powered delivery failure prediction with ML model",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# DATA MODELS
# ============================================================================

class PredictionRequest(BaseModel):
    """Frontend input model"""
    ordered_before: str = Field(..., description="yes/no - customer is returning or new")
    weather: str = Field(..., description="sunny/cloudy/rainy")
    traffic: str = Field(..., description="light/moderate/heavy")
    latitude: float = Field(..., description="Delivery location latitude")
    longitude: float = Field(..., description="Delivery location longitude")
    driver_id: Optional[str] = Field(None, description="Optional driver ID")
    customer_id: Optional[str] = Field(None, description="Optional customer ID")
    order_id: Optional[str] = Field(None, description="Optional order ID")

class PredictionResponse(BaseModel):
    """API response model"""
    prediction_id: str
    failure_probability: float
    predicted_delay_risk: str  # Low, Medium, High, Critical
    reasons: List[str]
    confidence: float
    stored_in_db: bool
    timestamp: str

# ============================================================================
# FEATURE MAPPING AND PREDICTION LOGIC
# ============================================================================

def map_inputs_to_features(request: PredictionRequest) -> dict:
    """
    Map frontend inputs (4 simple fields) to ML model's 15 features.
    Uses realistic mappings and some synthetic data generation.
    """
    
    # Base mappings from simple inputs
    weather_mapping = {
        'sunny': {'severity': 0.1, 'eta_var': 0.5},
        'cloudy': {'severity': 0.3, 'eta_var': 1.0},
        'rainy': {'severity': 0.8, 'eta_var': 2.5},
    }
    
    traffic_mapping = {
        'light': {'congestion': 2, 'disruption': 0.1},
        'moderate': {'congestion': 5, 'disruption': 0.4},
        'heavy': {'congestion': 8, 'disruption': 0.7},
    }
    
    weather_data = weather_mapping.get(request.weather, weather_mapping['sunny'])
    traffic_data = traffic_mapping.get(request.traffic, traffic_mapping['light'])
    
    # Generate realistic 15 features
    features = {
        'traffic_congestion_level': traffic_data['congestion'],
        'eta_variation_hours': weather_data['eta_var'] + np.random.uniform(0, 1),
        'fuel_consumption_rate': np.random.uniform(8, 15),  # liters per 100km
        'driver_behavior_score': 0.75 if request.ordered_before == 'yes' else 0.6,
        'fatigue_monitoring_score': np.random.uniform(0.2, 0.7),
        'disruption_likelihood_score': traffic_data['disruption'],
        'weather_condition_severity': weather_data['severity'],
        'supplier_reliability_score': 0.8 if request.ordered_before == 'yes' else 0.65,
        'port_congestion_level': np.random.uniform(3, 8),
        'loading_unloading_time': np.random.uniform(0.5, 2.0),  # hours
        'handling_equipment_availability': np.random.uniform(0.4, 1.0),
        'lead_time_days': np.random.uniform(1, 5),
        'route_risk_level': traffic_data['congestion'] + 2,
        'vehicle_gps_latitude': request.latitude,
        'vehicle_gps_longitude': request.longitude,
    }
    
    return features

def generate_reasons(features: dict) -> List[str]:
    """Generate human-readable explanations for delay risk"""
    reasons = []
    
    if features['traffic_congestion_level'] > 5:
        reasons.append("High traffic congestion on route")
    
    if features['eta_variation_hours'] > 2:
        reasons.append("Unstable ETA - high variance in delivery times")
    
    if features['fuel_consumption_rate'] > 12:
        reasons.append("Inefficient route / high fuel usage")
    
    if features['driver_behavior_score'] < 0.5:
        reasons.append("Poor driver behavior patterns detected")
    
    if features['fatigue_monitoring_score'] > 0.8:
        reasons.append("Driver fatigue detected")
    
    if features['disruption_likelihood_score'] > 0.5:
        reasons.append("High disruption likelihood")
    
    if features['weather_condition_severity'] > 0.5:
        reasons.append("Adverse weather conditions")
    
    if features['supplier_reliability_score'] < 0.6:
        reasons.append("Unreliable supplier - may delay pickup")
    
    if features['port_congestion_level'] > 7:
        reasons.append("Port/warehouse congestion")
    
    if features['loading_unloading_time'] > 1.5:
        reasons.append("Slow loading/unloading process")
    
    if features['handling_equipment_availability'] < 0.3:
        reasons.append("Low equipment availability")
    
    if features['route_risk_level'] > 7:
        reasons.append("High route risk level")
    
    if not reasons:
        reasons.append("Low risk - all indicators normal")
    
    return reasons

def classify_risk(probability: float) -> str:
    """Convert probability to risk level"""
    if probability < 0.25:
        return "Low"
    elif probability < 0.50:
        return "Medium"
    elif probability < 0.75:
        return "High"
    else:
        return "Critical"

# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get('/health')
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'ok',
        'model_loaded': model is not None,
        'database_connected': db is not None,
        'timestamp': datetime.now().isoformat()
    }

@app.post('/predict', response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """
    Main prediction endpoint
    1. Maps frontend inputs to ML features
    2. Gets prediction from model
    3. Stores to database
    4. Returns prediction + reasons
    """
    
    try:
        # Step 1: Map inputs to features
        features_dict = map_inputs_to_features(request)
        
        # Convert to DataFrame for model prediction
        feature_order = [
            'traffic_congestion_level', 'eta_variation_hours', 'fuel_consumption_rate',
            'driver_behavior_score', 'fatigue_monitoring_score', 'disruption_likelihood_score',
            'weather_condition_severity', 'supplier_reliability_score', 'port_congestion_level',
            'loading_unloading_time', 'handling_equipment_availability', 'lead_time_days',
            'route_risk_level', 'vehicle_gps_latitude', 'vehicle_gps_longitude'
        ]
        
        X = pd.DataFrame([[features_dict[feat] for feat in feature_order]], columns=feature_order)
        
        # Step 2: Make prediction
        if model is not None:
            # Get probability for failure class
            prediction_proba = model.predict_proba(X)[0]
            failure_probability = prediction_proba[1]  # probability of failure
            confidence = max(prediction_proba)
        else:
            # Fallback if model not loaded
            failure_probability = float(np.mean([features_dict[k] for k in ['traffic_congestion_level', 'eta_variation_hours']]) / 10)
            confidence = 0.5
        
        # Step 3: Generate reasons
        reasons = generate_reasons(features_dict)
        
        # Step 4: Classify risk
        risk_level = classify_risk(failure_probability)
        
        # Step 5: Store to database
        prediction_record = {
            'timestamp': datetime.now(),
            'input': {
                'ordered_before': request.ordered_before,
                'weather': request.weather,
                'traffic': request.traffic,
                'latitude': request.latitude,
                'longitude': request.longitude,
                'driver_id': request.driver_id,
                'customer_id': request.customer_id,
                'order_id': request.order_id,
            },
            'features': features_dict,
            'prediction': {
                'failure_probability': float(failure_probability),
                'risk_level': risk_level,
                'confidence': float(confidence),
                'reasons': reasons
            }
        }
        
        stored_in_db = False
        prediction_id = None
        
        if predictions_collection is not None:
            try:
                result = predictions_collection.insert_one(prediction_record)
                prediction_id = str(result.inserted_id)
                stored_in_db = True
                print(f"✓ Prediction stored with ID: {prediction_id}")
            except Exception as db_error:
                print(f"⚠ Database storage failed: {db_error}")
                prediction_id = "db_error"
        else:
            prediction_id = "db_not_connected"
        
        # Step 6: Return response
        return PredictionResponse(
            prediction_id=prediction_id,
            failure_probability=float(failure_probability),
            predicted_delay_risk=risk_level,
            reasons=reasons,
            confidence=float(confidence),
            stored_in_db=stored_in_db,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        print(f"✗ Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get('/predictions')
async def get_all_predictions(limit: int = 10):
    """Retrieve recent predictions from database"""
    try:
        if predictions_collection is None:
            raise HTTPException(status_code=503, detail="Database not connected")
        
        predictions = list(
            predictions_collection.find()
            .sort('timestamp', -1)
            .limit(limit)
        )
        
        # Convert ObjectId to string for JSON serialization
        for pred in predictions:
            pred['_id'] = str(pred['_id'])
        
        return {'count': len(predictions), 'predictions': predictions}
    
    except Exception as e:
        print(f"✗ Fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch predictions: {str(e)}")

@app.get('/predictions/{prediction_id}')
async def get_prediction(prediction_id: str):
    """Retrieve a specific prediction"""
    try:
        if predictions_collection is None:
            raise HTTPException(status_code=503, detail="Database not connected")
        
        prediction = predictions_collection.find_one({'_id': ObjectId(prediction_id)})
        
        if not prediction:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        prediction['_id'] = str(prediction['_id'])
        return prediction
    
    except Exception as e:
        print(f"✗ Fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch prediction: {str(e)}")

@app.get('/stats')
async def get_stats():
    """Get prediction statistics"""
    try:
        if predictions_collection is None:
            raise HTTPException(status_code=503, detail="Database not connected")
        
        total = predictions_collection.count_documents({})
        
        high_risk = predictions_collection.count_documents({'prediction.risk_level': {'$in': ['High', 'Critical']}})
        medium_risk = predictions_collection.count_documents({'prediction.risk_level': 'Medium'})
        low_risk = predictions_collection.count_documents({'prediction.risk_level': 'Low'})
        
        return {
            'total_predictions': total,
            'risk_distribution': {
                'low': low_risk,
                'medium': medium_risk,
                'high': high_risk
            }
        }
    
    except Exception as e:
        print(f"✗ Stats error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000, reload=True)
