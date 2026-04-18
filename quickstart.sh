#!/bin/bash
# Quick Start Script for Hack Helix - ML Delivery Prediction System
# This script sets up and starts all services

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  🚀 HACK HELIX - Last Mile Delivery Prediction System         ║"
echo "║     Quick Start Setup                                         ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Check if .env file exists in ml-service
if [ ! -f "ml-service/.env" ]; then
    echo "⚠️  SETUP REQUIRED: MongoDB Configuration"
    echo ""
    echo "1. Copy .env.example to .env:"
    cp ml-service/.env.example ml-service/.env
    echo ""
    echo "2. Edit ml-service/.env with your MongoDB URI:"
    echo "   - Go to MongoDB Atlas: https://account.mongodb.com/"
    echo "   - Find your connection string"
    echo "   - Update MONGODB_URI in ml-service/.env"
    echo ""
    echo "Press Enter after updating ml-service/.env..."
    read
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📚 Step 1: Setting up ML Service (FastAPI)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

cd ml-service

if [ ! -d "venv" ]; then
    echo "🔧 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "🔌 Activating virtual environment..."
source venv/bin/activate

echo "📦 Installing dependencies..."
pip install -q -r requirements.txt

if [ ! -f "app/trained_model.pkl" ]; then
    echo ""
    echo "🤖 Training ML Model..."
    echo "(This may take a minute on first run)"
    python train_model.py
fi

cd ..

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "📚 Step 2: Setting up Frontend (React)"
echo "═══════════════════════════════════════════════════════════════"
echo ""

cd frontend

if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    echo "(This may take a few minutes)"
    npm install --silent
fi

cd ..

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ Setup Complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎯 To start the system, run these commands in separate terminals:"
echo ""
echo "   Terminal 1 (ML Service):"
echo "   ─────────────────────────"
echo "   cd ml-service"
echo "   source venv/bin/activate"
echo "   python -m uvicorn app.main:app --reload --port 8000"
echo ""
echo "   Terminal 2 (Frontend):"
echo "   ────────────────────"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🌐 Access the application at: http://localhost:5173"
echo "📖 API Docs at: http://localhost:8000/docs"
echo ""
echo "💡 Tip: Check SETUP_GUIDE.md for detailed instructions"
echo ""
