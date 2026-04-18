"""
This script trains the XGBoost model and saves it for API use.
Run this once to create the trained_model.pkl file that the FastAPI uses.
"""

import pandas as pd
import numpy as np
import joblib
import os
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# Load data
print("📊 Loading data...")
df = pd.read_csv("Last_mile_delivery.csv")

# Create target variable
print("🎯 Creating target variable...")
df["failure"] = (df["delay_probability"] > 0.6).astype(int)

# Define features
features = [
    "traffic_congestion_level",
    "eta_variation_hours",
    "fuel_consumption_rate",
    "driver_behavior_score",
    "fatigue_monitoring_score",
    "disruption_likelihood_score",
    "weather_condition_severity",
    "supplier_reliability_score",
    "port_congestion_level",
    "loading_unloading_time",
    "handling_equipment_availability",
    "lead_time_days",
    "route_risk_level",
    "vehicle_gps_latitude",
    "vehicle_gps_longitude"
]

X = df[features]
y = df["failure"]

# Split data
print("🔀 Splitting data...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Calculate class weights
neg = (y == 0).sum()
pos = (y == 1).sum()
scale = neg / pos
print(f"⚖️  Class weight scale: {scale:.2f}")

# Train model
print("🤖 Training XGBoost model...")
model = XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    scale_pos_weight=scale,
    random_state=42,
    verbosity=0
)

model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"\n✓ Model Accuracy: {accuracy:.4f}")
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Save model
print("\n💾 Saving model...")
model_path = os.path.join(os.path.dirname(__file__), 'trained_model.pkl')
joblib.dump(model, model_path)
print(f"✓ Model saved to: {model_path}")

print("\n✅ Ready to use! Start the FastAPI server with:")
print("   python -m uvicorn app.main:app --reload --port 8000")
