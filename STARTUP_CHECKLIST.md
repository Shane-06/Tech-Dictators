# ✅ Complete Startup & Configuration Checklist

## 🎯 System Overview
```
Frontend (React)     Backend (Node.js)    ML Service (FastAPI)    MongoDB
Port: 5173          Port: 3000            Port: 8000              Port: 27017
   ↓                    ↓                      ↓                       ↓
Vite/React          Express/Mongoose     FastAPI/XGBoost        Collections
TypeScript          Domains (Auth,       Feature Mapping         (users, 
Tailwind CSS        Deliveries,          Predictions             deliveries,
Leaflet             Drivers)             Storage                 drivers,
                                                                   predictions)
```

---

## 📋 Pre-Flight Checklist

### System Requirements
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 7+ installed (`npm --version`)
- [ ] Python 3.9+ installed (`python --version`)
- [ ] MongoDB running (local or Atlas)
- [ ] Git installed (optional)
- [ ] 4GB+ free RAM
- [ ] 2GB+ free disk space

### Network & Ports
- [ ] Port 3000 available (Backend)
- [ ] Port 5173 available (Frontend Dev)
- [ ] Port 8000 available (ML Service)
- [ ] Port 27017 available (MongoDB)
- [ ] Firewall configured

---

## 🔧 Configuration Setup

### 1️⃣ Backend Configuration

#### File: `backend/.env`
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vb
ML_SERVICE_URL=http://localhost:8000
NODE_ENV=development
```

**Checklist:**
- [ ] File exists at `backend/.env`
- [ ] PORT set to 3000
- [ ] MONGODB_URI points to your MongoDB
- [ ] ML_SERVICE_URL set to `http://localhost:8000`
- [ ] NODE_ENV set to `development`

**How to Verify:**
```bash
cd backend
cat .env
# Should show all variables
```

---

### 2️⃣ ML Service Configuration

#### File: `ml-service/.env`
```env
MONGODB_URI=mongodb+srv://[user]:[pass]@[cluster].mongodb.net/delivery_predictions
FASTAPI_ENV=development
LOG_LEVEL=INFO
```

**Checklist:**
- [ ] File created from `.env.example`
- [ ] MONGODB_URI contains correct connection string
- [ ] Connection string has username & password
- [ ] Database name is `delivery_predictions`
- [ ] FASTAPI_ENV set to `development`

**How to Get MongoDB URI:**
1. Go to MongoDB Atlas: https://account.mongodb.com/
2. Click "Connect" on your cluster
3. Choose "Drivers" → "Python"
4. Copy the connection string
5. Replace `<username>`, `<password>`, `<database>`

**How to Verify:**
```bash
cd ml-service
cat .env
# Should show MongoDB connection string
```

---

### 3️⃣ Frontend Configuration

#### File: `frontend/vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Checklist:**
- [ ] `vite.config.ts` exists
- [ ] React plugin configured
- [ ] Tailwind CSS plugin configured

#### File: `frontend/tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["dist", "build", "node_modules"]
}
```

**Checklist:**
- [ ] `tsconfig.json` exists
- [ ] Target is ES2020
- [ ] Includes DOM library

---

## 📦 Dependency Installation

### Backend Dependencies

**File: `backend/package.json`**

**Required:**
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "axios": "^1.6.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "joi": "^17.11.0"
}
```

**Installation:**
```bash
cd backend
npm install
```

**Verify:**
```bash
npm list
# Should show all packages
ls node_modules
# Should be ~200 folders
```

**Checklist:**
- [ ] `npm install` completed without errors
- [ ] `node_modules/` directory exists
- [ ] `package-lock.json` created

---

### Frontend Dependencies

**File: `frontend/package.json`**

**Required:**
```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "vite": "^8.0.4",
  "@vitejs/plugin-react": "^6.0.1",
  "tailwindcss": "^4.2.2",
  "@tailwindcss/vite": "^4.2.2",
  "leaflet": "^1.9.4",
  "@types/leaflet": "^1.9.4",
  "typescript": "~6.0.2",
  "eslint": "^9.39.4"
}
```

**Installation:**
```bash
cd frontend
npm install
```

**Verify:**
```bash
npm list
# Should show all packages
ls node_modules
# Should be ~300 folders
```

**Checklist:**
- [ ] `npm install` completed without errors
- [ ] `node_modules/` directory exists
- [ ] Leaflet and React installed
- [ ] Tailwind CSS installed
- [ ] TypeScript installed

---

### ML Service Dependencies

**File: `ml-service/requirements.txt`**

**Required:**
```
fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.0
xgboost==2.0.2
scikit-learn==1.3.2
pandas==2.1.4
numpy==1.26.2
python-multipart==0.0.6
joblib==1.3.2
pymongo==4.6.0
python-dotenv==1.0.0
```

**Installation:**
```bash
cd ml-service
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

**Verify:**
```bash
pip list
# Should show all packages

python -c "import fastapi; print(fastapi.__version__)"
# Should print version
```

**Checklist:**
- [ ] Virtual environment created
- [ ] Virtual environment activated
- [ ] `pip install` completed without errors
- [ ] All packages listed in `pip list`

---

## 🗄️ Database Setup

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Windows
mongod.exe
# macOS (with Homebrew)
brew services start mongodb-community
# Linux
sudo service mongod start
```

**Option 2: MongoDB Atlas (Cloud)**
1. Go to https://account.mongodb.com/
2. Create cluster
3. Whitelist your IP
4. Get connection string
5. Add to `.env` files

**Verification:**
```bash
# Test connection
mongo
# or use MongoDB Compass GUI

# Should connect and show:
# > _
```

**Database Initialization:**
```bash
# Create database & collections
# MongoDB auto-creates when first document inserted
```

**Checklist:**
- [ ] MongoDB running (local or Atlas)
- [ ] Connection string working
- [ ] Can connect via mongo CLI or GUI
- [ ] Database `delivery_predictions` accessible

---

## 🚂 ML Model Training

**File: `ml-service/train_model.py`**

```bash
cd ml-service
# Activate venv first!
source venv/bin/activate  # or venv\Scripts\activate on Windows

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

**Generated File:**
- [ ] `ml-service/app/trained_model.pkl` (5-10 MB)

**Troubleshooting:**
```
Error: CSV file not found
→ Make sure Last_mile_delivery.csv is in project root

Error: xgboost not installed
→ Run pip install -r requirements.txt again

Error: Model accuracy too low
→ Check CSV file has correct columns
```

**Checklist:**
- [ ] `train_model.py` runs without error
- [ ] Accuracy shown (should be >0.80)
- [ ] `trained_model.pkl` created
- [ ] File size > 1 MB

---

## 🚀 Service Startup

### Terminal 1: Backend Service

```bash
cd backend

# First time
npm install

# Every time
npm run dev
```

**Expected Output:**
```
✓ MongoDB connected: mongodb://localhost:27017/vb
✓ Backend server running on http://localhost:3000
✓ Domains loaded: /auth, /deliveries, /drivers
```

**Checklist:**
- [ ] Server starts without errors
- [ ] MongoDB connection succeeds
- [ ] Listening on port 3000
- [ ] All domains loaded

**Verify:**
```bash
curl http://localhost:3000/health
# Should return: { status: "ok", timestamp, domains }
```

---

### Terminal 2: ML Service

```bash
cd ml-service

# Activate environment
source venv/bin/activate  # or venv\Scripts\activate

# Run server
python -m uvicorn app.main:app --reload --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
✓ ML Model loaded successfully
✓ Connected to MongoDB
```

**Checklist:**
- [ ] Server starts without errors
- [ ] Model loads successfully
- [ ] MongoDB connection succeeds
- [ ] Listening on port 8000
- [ ] Ready for predictions

**Verify:**
```bash
curl http://localhost:8000/health
# Should return: { status, model_loaded, database_connected }
```

---

### Terminal 3: Frontend Service

```bash
cd frontend

# First time
npm install

# Every time
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Checklist:**
- [ ] Server starts without errors
- [ ] Listening on port 5173
- [ ] Ready for browser access

**Verify:**
```bash
# Open in browser
http://localhost:5173
# Should load with prediction form
```

---

## 🧪 Integration Testing

### Test 1: Backend Health
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-04-19T10:30:45.123Z",
  "domains": ["/auth", "/deliveries", "/drivers"]
}
```

**Checklist:**
- [ ] Response is 200 OK
- [ ] Status is "ok"
- [ ] All domains listed

---

### Test 2: ML Service Health
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "model_loaded": true,
  "database_connected": true,
  "timestamp": "2024-04-19T10:30:45.123Z"
}
```

**Checklist:**
- [ ] Response is 200 OK
- [ ] model_loaded is true
- [ ] database_connected is true

---

### Test 3: ML Prediction
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
  "reasons": ["High traffic congestion on route", ...],
  "confidence": 0.84,
  "stored_in_db": true,
  "timestamp": "2024-04-19T10:30:45.123456"
}
```

**Checklist:**
- [ ] Response is 200 OK
- [ ] Prediction ID returned
- [ ] Probability between 0-1
- [ ] Risk level is one of: Low, Medium, High, Critical
- [ ] Reasons list is populated
- [ ] Stored in DB is true

---

### Test 4: Frontend Prediction
1. Open http://localhost:5173 in browser
2. Fill form:
   - Customer ordered before: **Yes**
   - Weather: **Rainy**
   - Traffic: **Heavy**
   - Click on map to select location
3. Click "Predict delay risk"
4. Should see results within 2 seconds

**Checklist:**
- [ ] Form loads successfully
- [ ] Form submits without error
- [ ] Results display (risk level, probability, reasons)
- [ ] Prediction ID shows
- [ ] No console errors (F12)

---

### Test 5: Create Delivery (Backend)
```bash
curl -X POST http://localhost:3000/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "cust_001",
    "driverId": "drv_001",
    "address": "123 Main St",
    "lat": 40.7128,
    "lng": -74.0060,
    "scheduledTime": "2024-04-20T10:00:00Z",
    "packageWeight": 5,
    "weather": {"rain": 0.2, "temp": 25},
    "historicalSuccessRate": 0.85,
    "areaRisk": 0.3
  }'
```

**Expected Response:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "customerId": "cust_001",
  "failureProbability": 0.32,
  "riskLevel": "MEDIUM",
  "interventionStrategies": [...],
  "status": "PENDING",
  "createdAt": "2024-04-19T10:30:45.123Z"
}
```

**Checklist:**
- [ ] Response is 201 Created
- [ ] MongoDB ID returned
- [ ] Probability populated
- [ ] Risk level assigned
- [ ] Intervention strategies provided

---

## 📊 Performance Baseline

### Expected Response Times

| Endpoint | Method | Time | Status |
|----------|--------|------|--------|
| `/health` | GET | ~5ms | ✅ |
| `/auth/login` | POST | ~100ms | ✅ |
| `/deliveries` | GET | ~150ms | ✅ |
| `/deliveries/:id` | GET | ~50ms | ✅ |
| `/deliveries` | POST | ~1-2s* | ✅ |
| `/deliveries/optimize` | POST | ~300-500ms | ✅ |
| `/predict` (ML) | POST | ~800-1500ms** | ✅ |
| `/predictions` | GET | ~100ms | ✅ |

*Includes ML service call
**Network + Model inference + DB storage

**Checklist:**
- [ ] Response times reasonable
- [ ] No timeouts
- [ ] CPU usage < 50%
- [ ] Memory usage stable

---

## 🐛 Troubleshooting Quick Reference

| Issue | Solution | Verify |
|-------|----------|--------|
| **MongoDB connection refused** | Check MONGODB_URI in .env, ensure mongod running | `mongo` command |
| **Port already in use** | Change PORT in .env or kill process | `lsof -i :3000` |
| **Model file not found** | Run `python train_model.py` | Check `app/trained_model.pkl` exists |
| **npm install fails** | Clear cache: `npm cache clean --force` | `npm list` |
| **Python venv issues** | Delete venv, recreate: `python -m venv venv` | `source venv/bin/activate` |
| **CORS errors** | CORS enabled by default in FastAPI | Check console for full error |
| **Frontend can't reach backend** | Verify port 3000 open, backend running | `curl localhost:3000/health` |
| **ML service can't reach MongoDB** | Check MONGODB_URI, whitelist IP on Atlas | Test connection in MongoDB Compass |

---

## 📝 Startup Order

**Recommended startup sequence:**

1. **Start MongoDB**
   ```bash
   mongod  # or use Atlas cloud
   ```

2. **Start ML Service** (takes ~3 seconds)
   ```bash
   cd ml-service
   source venv/bin/activate
   python -m uvicorn app.main:app --reload --port 8000
   ```

3. **Start Backend** (takes ~2 seconds)
   ```bash
   cd backend
   npm run dev
   ```

4. **Start Frontend** (takes ~1 second)
   ```bash
   cd frontend
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:5173
   ```

**Total startup time:** ~10 seconds

---

## ✨ Post-Startup Verification

After all services running:

- [ ] Backend health: `curl http://localhost:3000/health`
- [ ] ML health: `curl http://localhost:8000/health`
- [ ] Frontend loads: Open http://localhost:5173
- [ ] Can make prediction: Fill form + submit
- [ ] Check MongoDB: Records appear in `delivery_predictions.predictions`
- [ ] Check backend logs: Requests logged
- [ ] Check ML logs: Predictions logged

---

## 🎯 Common Commands

### View Logs
```bash
# Frontend console
Browser F12 → Console tab

# Backend
Check terminal output

# ML Service
Check terminal output

# MongoDB
mongo
> db.deliveries.find().pretty()
> db.predictions.find().pretty()
```

### Clear Data
```bash
# MongoDB - delete all deliveries
db.deliveries.deleteMany({})

# MongoDB - delete all predictions
db.predictions.deleteMany({})
```

### Restart Services
```bash
# Kill all node processes
killall node

# Kill all Python processes
killall python

# Then restart with npm run dev or python -m uvicorn...
```

---

## 📋 Final Checklist

Before declaring system "Ready":

- [ ] All 3 services running without errors
- [ ] All 4 health checks passing
- [ ] Frontend loads at localhost:5173
- [ ] Form submission works end-to-end
- [ ] Results display correctly
- [ ] Data stored in MongoDB
- [ ] No console errors in browser (F12)
- [ ] ML model loaded successfully
- [ ] All dependencies installed
- [ ] Environment variables configured

---

**When all items checked:** ✅ System Ready for Development/Testing

**Status:** `READY FOR DEPLOYMENT`  
**Date:** April 19, 2026  
**Last Verified:** Startup procedures verified
