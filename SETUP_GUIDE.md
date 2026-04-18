# 🚀 Setup Guide - Complete ML + Frontend + Database Integration

This guide walks you through setting up the entire system: ML Service (FastAPI), Frontend (React), and Database (MongoDB).

## 📋 Prerequisites

- Python 3.9+ (for ML service)
- Node.js 16+ (for frontend)
- MongoDB (local or Atlas)
- Git

## 🔧 Step 1: Setup ML Service (FastAPI)

### 1.1 Navigate to ML Service Directory
```bash
cd ml-service
```

### 1.2 Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 1.3 Install Dependencies
```bash
pip install -r requirements.txt
```

### 1.4 Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your actual MongoDB URI:
```env
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/delivery_predictions
FASTAPI_ENV=development
LOG_LEVEL=INFO
```

**How to get your MongoDB URI:**
1. Go to [MongoDB Atlas](https://account.mongodb.com/)
2. Click "Connect" on your cluster
3. Choose "Drivers" → Copy the connection string
4. Replace `<username>`, `<password>`, `<database>`

### 1.5 Train and Save the ML Model

Make sure `Last_mile_delivery.csv` is in the `ml-service/app/` directory, then run:

```bash
python train_model.py
```

**Expected Output:**
```
📊 Loading data...
🎯 Creating target variable...
🔀 Splitting data...
⚖️  Class weight scale: 3.45
🤖 Training XGBoost model...
✓ Model Accuracy: 0.8523
💾 Saving model...
✓ Model saved to: app/trained_model.pkl
```

This creates `app/trained_model.pkl` which the FastAPI uses.

### 1.6 Start FastAPI Server
```bash
python -m uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
✓ ML Model loaded successfully
✓ Connected to MongoDB
```

**API Documentation Available At:**
- http://localhost:8000/docs (Interactive Swagger UI)
- http://localhost:8000/redoc (ReDoc documentation)

---

## 🎨 Step 2: Setup Frontend (React + TypeScript)

### 2.1 Navigate to Frontend Directory
```bash
cd frontend
```

### 2.2 Install Dependencies
```bash
npm install
```

### 2.3 Start Development Server
```bash
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Open http://localhost:5173 in your browser.

---

## 🗄️ Step 3: Verify Database Setup

### 3.1 Check MongoDB Connection

In a new terminal, test the database directly:

```bash
# Install MongoDB CLI (if not already installed)
npm install -g mongodb-cli

# Or use Python to test
python
```

Then in Python:
```python
from pymongo import MongoClient

uri = "your_mongodb_uri_here"
client = MongoClient(uri)
db = client['delivery_predictions']
result = db.predictions.find_one()
print("✓ Database connected!")
```

### 3.2 Create MongoDB Collections

The FastAPI automatically creates collections on first use. To manually verify:

```python
db = client['delivery_predictions']
db.predictions.create_index('timestamp')
print("Collections:", db.list_collection_names())
```

---

## ✅ Step 4: Test the Complete Flow

### 4.1 Make a Prediction via API
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "ordered_before": "yes",
    "weather": "rainy",
    "traffic": "heavy",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

**Expected Response:**
```json
{
  "prediction_id": "507f1f77bcf86cd799439011",
  "failure_probability": 0.72,
  "predicted_delay_risk": "High",
  "reasons": [
    "High traffic congestion on route",
    "Adverse weather conditions",
    "Unstable ETA - high variance in delivery times"
  ],
  "confidence": 0.84,
  "stored_in_db": true,
  "timestamp": "2024-04-19T10:30:45.123456"
}
```

### 4.2 Test via Frontend
1. Go to http://localhost:5173
2. Fill in the form:
   - Customer ordered before: **Yes**
   - Weather condition: **Rainy**
   - Current traffic level: **Heavy**
   - Click on the map to select a location
3. Click "Predict delay risk"
4. You should see the prediction with reasons

### 4.3 Check Stored Data
```bash
curl http://localhost:8000/predictions
```

Returns all predictions stored in MongoDB.

---

## 📊 API Endpoints Reference

### Predictions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Make a new prediction |
| `GET` | `/predictions` | Get all predictions (limit: 10) |
| `GET` | `/predictions/{id}` | Get specific prediction |
| `GET` | `/stats` | Get prediction statistics |

### Health & Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger UI documentation |
| `GET` | `/redoc` | ReDoc documentation |

---

## 🐳 Optional: Docker Deployment

### Build and Run with Docker

```bash
# Build Docker image
docker build -f docker/Dockerfile.ml -t delivery-ml:latest .

# Run with Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

Update `docker-compose.yml` with your MongoDB URI.

---

## 🔗 Data Flow Diagram

```
Frontend (React)
    ↓ (HTTP POST)
    ├─ orderedBefore, weather, traffic, lat/lng
    ↓
FastAPI Server (Port 8000)
    ├─ Maps simple inputs → 15 ML features
    ├─ Loads trained XGBoost model
    ├─ Gets prediction: probability + risk level
    ├─ Generates human-readable reasons
    ↓
MongoDB (Atlas/Local)
    └─ Stores prediction record with:
       - Input data
       - 15 features
       - Prediction result
       - Reasons
       - Timestamp
    ↓
Response back to Frontend
    └─ Displays: Risk Level, Probability, Reasons
```

---

## 🐛 Troubleshooting

### Problem: "Cannot find module fastapi"
```bash
# Solution: Activate virtual environment and reinstall
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Problem: "MongoDB connection refused"
```bash
# Check your MONGODB_URI in .env
# Make sure:
# 1. URI is correct
# 2. IP whitelist includes your current IP (for Atlas)
# 3. Credentials are correct
```

### Problem: "Model file not found"
```bash
# Make sure to run train_model.py first
# Check that trained_model.pkl exists in ml-service/app/
python train_model.py
```

### Problem: Frontend not calling backend
```bash
# Check CORS is enabled in main.py
# Make sure FastAPI is running on port 8000
# Check browser console for errors (F12)
```

### Problem: CORS errors
```bash
# The FastAPI already has CORS enabled for:
# - http://localhost:5173 (frontend)
# - http://localhost:3000 (alternative)
# - * (all origins in development)

# To restrict in production, update main.py:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📈 Database Schema

### Predictions Collection

```javascript
{
  "_id": ObjectId("..."),
  "timestamp": ISODate("2024-04-19T10:30:45.123Z"),
  "input": {
    "ordered_before": "yes",
    "weather": "rainy",
    "traffic": "heavy",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "driver_id": null,
    "customer_id": null,
    "order_id": null
  },
  "features": {
    "traffic_congestion_level": 8,
    "eta_variation_hours": 2.3,
    "fuel_consumption_rate": 12.5,
    // ... 12 more features
  },
  "prediction": {
    "failure_probability": 0.72,
    "risk_level": "High",
    "confidence": 0.84,
    "reasons": ["High traffic congestion...", "..."]
  }
}
```

---

## 🎯 Next Steps

1. **Add Authentication**: Protect the API with JWT tokens
2. **Add Analytics Dashboard**: Visualize prediction trends
3. **Integrate with Order System**: Auto-flag high-risk deliveries
4. **Model Improvements**: Retrain with new data periodically
5. **Performance Optimization**: Add caching, rate limiting

---

## 📝 File Structure

```
hack-helix/
├── ml-service/
│   ├── app/
│   │   ├── main.py              ← FastAPI server
│   │   ├── trained_model.pkl    ← Trained XGBoost (generated)
│   │   └── Order_prediction.ipynb
│   ├── train_model.py           ← Model training script
│   ├── requirements.txt         ← Python dependencies
│   └── .env                     ← Configuration (keep secret!)
├── frontend/
│   ├── src/
│   │   └── Components/
│   │       └── Card.tsx         ← Updated form component
│   └── package.json
└── Last_mile_delivery.csv       ← Training data
```

---

## ✨ Features Implemented

✅ Frontend form with weather, traffic, location inputs
✅ Map picker for delivery coordinates
✅ XGBoost ML model for delay prediction
✅ FastAPI backend with CORS support
✅ MongoDB integration for data persistence
✅ 15-feature mapping from simple inputs
✅ Human-readable prediction reasons
✅ Risk classification (Low/Medium/High/Critical)
✅ Prediction history and statistics endpoints
✅ API documentation (Swagger + ReDoc)

---

## 📞 Support

For issues or questions:
1. Check browser console (F12) for frontend errors
2. Check FastAPI logs for backend errors
3. Test API directly at http://localhost:8000/docs
4. Verify MongoDB connection with test script
