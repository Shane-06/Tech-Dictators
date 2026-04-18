# Multi-Modal Last-Mile Delivery Failure Predictor

## Overview
This system predicts delivery failure probability and optimizes routes dynamically.

## Architecture
```
Frontend (React) <--> Backend (Express) <--> ML Service (FastAPI) & MongoDB
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB
- Docker (optional)

### Local Setup

1. **Clone and navigate:**
   ```bash
   cd hack-helix
   ```

2. **Setup ML Service:**
   ```bash
   cd ml-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app/train.py
   uvicorn app.main:app --reload
   ```

3. **Setup Backend:**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

4. **Setup Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

5. **MongoDB:**
   Ensure MongoDB is running on localhost:27017 or set MONGODB_URI in .env

### Docker Setup
```bash
cd docker
docker-compose up --build
```

## API Endpoints
- POST /deliveries: Create delivery with prediction
- GET /deliveries: Fetch all deliveries (optimized)
- POST /deliveries/optimize: Optimize specific deliveries

## ML Features
- Hour of day, day of week, distance, success rate, weather, area risk

## Route Optimization
Cost = distance + (failure_prob * 100), sorted ascending.