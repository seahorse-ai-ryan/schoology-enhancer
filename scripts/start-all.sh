#!/bin/bash
# Modern Teaching - Development Environment Startup
# This script starts all required services in the background

set -e

echo "🧹 Cleaning up any existing processes..."
pkill ngrok 2>/dev/null || true
pkill -f "firebase emulators" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Modern Teaching - Development Environment"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Start ngrok
echo "🌐 [1/3] Starting ngrok tunnel..."
cd /workspaces/schoology-enhancer
ngrok http --url=modernteaching.ngrok.dev 9000 --log stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
echo "    → Process ID: $NGROK_PID"
echo "    → Log: /tmp/ngrok.log"

sleep 3

# Verify ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | jq -r '.tunnels[0].public_url' 2>/dev/null || echo "")
if [ -n "$NGROK_URL" ]; then
    echo "    ✅ Tunnel active: $NGROK_URL"
else
    echo "    ❌ Failed to start ngrok"
    exit 1
fi

# Start Firebase Emulators
echo ""
echo "🔥 [2/3] Starting Firebase Emulators..."
firebase emulators:start --project demo-project > /tmp/firebase.log 2>&1 &
FIREBASE_PID=$!
echo "    → Process ID: $FIREBASE_PID"
echo "    → Log: /tmp/firebase.log"
echo "    → Waiting for emulators to initialize..."

# Wait for Firebase to be ready
for i in {1..15}; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo "    ✅ Emulators ready"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "    ❌ Emulators failed to start (timeout)"
        exit 1
    fi
    sleep 1
done

# Start Next.js
echo ""
echo "⚡ [3/3] Starting Next.js dev server..."
npm run dev > /tmp/nextjs.log 2>&1 &
NPM_PID=$!
echo "    → Process ID: $NPM_PID"
echo "    → Log: /tmp/nextjs.log"
echo "    → Waiting for Next.js to initialize..."

# Wait for Next.js to be ready
for i in {1..10}; do
    if curl -s http://localhost:9000 > /dev/null 2>&1; then
        echo "    ✅ Next.js ready"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "    ⚠️  Next.js may still be starting..."
    fi
    sleep 1
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ All Services Running"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "  📱 Application:     $NGROK_URL"
echo "  🏠 Next.js Local:   http://localhost:9000"
echo "  🎛️  Emulator UI:     http://localhost:4000"
echo "  📦 Firestore:       http://localhost:8080"
echo "  ⚙️  Functions:       http://localhost:5001"
echo "  🌐 Ngrok Dashboard: http://localhost:4040"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📝 Logs:"
echo "   tail -f /tmp/ngrok.log     (ngrok tunnel)"
echo "   tail -f /tmp/firebase.log  (Firebase emulators)"
echo "   tail -f /tmp/nextjs.log    (Next.js dev server)"
echo ""
echo "🛑 Stop all services:"
echo "   pkill ngrok && pkill -f 'firebase emulators' && pkill -f 'next dev'"
echo ""
