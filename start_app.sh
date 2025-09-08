#!/bin/bash

echo "🚀 Starting QueryBox AI Application..."
echo "============================================"

# Kill any existing processes on ports 5001 and 5173
echo "🧹 Cleaning up existing processes..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
sleep 2

# Start backend on port 5001
echo "🔧 Starting backend server on port 5001..."
cd backend
PORT=5001 nohup python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "Backend started with PID: $BACKEND_PID"

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend health
if curl -s http://127.0.0.1:5001/health > /dev/null; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start frontend on port 5173
echo "🎨 Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "🎉 QueryBox AI is now running!"
echo "============================================"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://127.0.0.1:5001"
echo "🏥 Health:   http://127.0.0.1:5001/health"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: Check terminal output above"
echo ""
echo "🛑 To stop: Press Ctrl+C or run 'pkill -f \"python app.py|npm\""
echo "============================================"

# Keep script running and show logs
tail -f backend.log &
wait
