#!/bin/bash
set -e

echo "🚀 Starting Modern Teaching Development Environment"
echo "=================================================="
echo "Using static ngrok domain: modernteaching.ngrok.dev"
echo "=================================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill ngrok 2>/dev/null || true
pkill -f "firebase emulators" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

sleep 1

# Start ngrok with static domain (pointing to Next.js on port 9000)
echo "🌐 Starting ngrok tunnel with static domain..."
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "⏳ Waiting for ngrok to initialize..."
sleep 3

# Verify ngrok is running
if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
    echo "❌ Error: Ngrok failed to start"
    exit 1
fi

echo "✅ Ngrok tunnel active: https://modernteaching.ngrok.dev"

# Start Firebase emulators
echo "🔥 Starting Firebase emulators..."
cd /workspaces/schoology-enhancer
firebase emulators:start > /tmp/firebase.log 2>&1 &
FIREBASE_PID=$!

echo "⏳ Waiting for Firebase emulators to initialize..."
sleep 5

# Start Next.js dev server
echo "⚡ Starting Next.js dev server..."
npm run dev > /tmp/nextjs.log 2>&1 &
NPM_PID=$!

echo "⏳ Waiting for Next.js to start..."
sleep 3

echo ""
echo "=================================================="
echo "✅ All services started!"
echo "=================================================="
echo "App URL:        https://modernteaching.ngrok.dev"
echo "Ngrok Dashboard: http://localhost:4040"
echo "Next.js Local:  http://localhost:9000"
echo "Firebase UI:    http://localhost:4000"
echo "Firestore:      http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Trap Ctrl+C to clean up
trap "echo 'Stopping services...'; pkill ngrok; pkill -f 'firebase emulators'; pkill -f 'next dev'; exit" INT

# Keep script running
wait

