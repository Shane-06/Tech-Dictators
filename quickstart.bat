@echo off
REM Quick Start Script for Hack Helix - ML Delivery Prediction System
REM This script sets up and starts all services

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║  🚀 HACK HELIX - Last Mile Delivery Prediction System         ║
echo ║     Quick Start Setup                                         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Check if .env file exists in ml-service
if not exist "ml-service\.env" (
    echo ⚠️  SETUP REQUIRED: MongoDB Configuration
    echo.
    echo 1. Copy .env.example to .env:
    cd ml-service
    copy .env.example .env
    cd ..
    echo.
    echo 2. Edit ml-service\.env with your MongoDB URI:
    echo    - Go to MongoDB Atlas: https://account.mongodb.com/
    echo    - Find your connection string
    echo    - Update MONGODB_URI in ml-service\.env
    echo.
    echo Press any key after updating ml-service\.env...
    pause
)

echo.
echo ═══════════════════════════════════════════════════════════════
echo 📚 Step 1: Setting up ML Service (FastAPI)
echo ═══════════════════════════════════════════════════════════════
echo.

cd ml-service

if not exist "venv" (
    echo 🔧 Creating Python virtual environment...
    python -m venv venv
)

echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📦 Installing dependencies...
pip install -q -r requirements.txt

if not exist "app\trained_model.pkl" (
    echo.
    echo 🤖 Training ML Model...
    echo (This may take a minute on first run)
    python train_model.py
)

cd ..

echo.
echo ═══════════════════════════════════════════════════════════════
echo 📚 Step 2: Setting up Frontend (React)
echo ═══════════════════════════════════════════════════════════════
echo.

cd frontend

if not exist "node_modules" (
    echo 📦 Installing npm dependencies...
    echo (This may take a few minutes)
    npm install --silent
)

cd ..

echo.
echo ═══════════════════════════════════════════════════════════════
echo ✅ Setup Complete!
echo ═══════════════════════════════════════════════════════════════
echo.
echo 🎯 To start the system, run these commands in separate terminals:
echo.
echo   Terminal 1 (ML Service):
echo   ─────────────────────────
cd ml-service
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --port 8000
echo.
echo   Terminal 2 (Frontend):
echo   ────────────────────
cd frontend
npm run dev
echo.
echo 🌐 Access the application at: http://localhost:5173
echo 📖 API Docs at: http://localhost:8000/docs
echo.
echo 💡 Tip: Check SETUP_GUIDE.md for detailed instructions
echo.
pause
