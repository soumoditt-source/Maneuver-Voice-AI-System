#!/bin/bash
echo "========================================================"
echo "  Maneuver Voice AI Agent - Launch Script"
echo "  Made by Soumoditya Das"
echo "========================================================"
echo ""

echo "[1/3] Setting up Next.js Frontend..."
cd apps/web
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Frontend npm install failed. Please check your Node.js installation."
    exit 1
fi
cd ../..

echo "[2/3] Setting up Python Backend..."
cd apps/agent
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

source .venv/bin/activate
echo "Installing Python dependencies (this might take a minute)..."
python3 -m pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Backend pip install failed. Please ensure you have Python 3.10-3.12 installed."
    exit 1
fi
cd ../..

echo ""
echo "========================================================"
echo "  All dependencies installed successfully!"
echo "  Launching full-stack services..."
echo "========================================================"
echo ""

# Start Next.js Frontend in background
echo "Starting Frontend (Port 5000)..."
cd apps/web && npm run dev &
FRONTEND_PID=$!
cd ../..

# Start FastAPI Lead Server in background
echo "Starting API Server (Port 8001)..."
cd apps/agent && source .venv/bin/activate && python api.py &
API_PID=$!
cd ../..

# Start LiveKit Voice Agent in background
echo "Starting LiveKit Voice Agent..."
cd apps/agent && source .venv/bin/activate && python agent.py dev &
AGENT_PID=$!
cd ../..

echo ""
echo "The app is now launching!"
echo "Please wait about 10-15 seconds for the servers to boot up,"
echo "then open your browser and navigate to: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services."

# Wait for all background processes
wait $FRONTEND_PID $API_PID $AGENT_PID
