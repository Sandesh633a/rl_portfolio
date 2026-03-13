#!/bin/bash
echo "========================================================"
echo "Installing all requirements and starting the project..."
echo "========================================================"
echo ""

# Exit immediately if a command exits with a non-zero status
set -e

echo "[1/4] Setting up Python backend (rlproject)..."
cd rlproject

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

echo "Installing Python requirements..."
pip install -qr requirements.txt > /dev/null

echo "Starting backend server..."
python run.py &
BACKEND_PID=$!
cd ..
echo ""

echo "[2/4] Setting up Node frontend..."
cd frontend
echo "Installing Node modules..."
npm install > /dev/null

echo "Starting React frontend..."
npm run dev &
FRONTEND_PID=$!
cd ..
echo ""

echo "========================================================"
echo "Setup complete! Both servers are running in the background."
echo " - FastAPI backend is at http://localhost:8000"
echo " - React frontend is at http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers."
echo "========================================================"

# Wait for both processes to keep the script running
wait $BACKEND_PID
wait $FRONTEND_PID
