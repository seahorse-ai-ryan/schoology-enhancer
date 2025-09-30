#!/bin/bash
set -e

echo "🚀 Starting Schoology Enhancer Development Environment"
echo "=================================================="

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill ngrok || true
pkill -f "firebase emulators" || true
pkill -f "next dev" || true

# Start ngrok in background
echo "🌐 Starting ngrok tunnel..."
ngrok http 9000 --log stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to be ready
echo "⏳ Waiting for ngrok to initialize..."
sleep 3

# Fetch the ngrok URL
echo "🔍 Fetching ngrok URL..."
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
    echo "❌ Error: Could not fetch ngrok URL"
    kill $NGROK_PID 2>/dev/null || true
    exit 1
fi

echo "✅ Ngrok URL: $NGROK_URL"

# Extract domain for Schoology
NGROK_DOMAIN=$(echo $NGROK_URL | sed 's|https://||' | sed 's|http://||')
echo "📝 Ngrok domain: $NGROK_DOMAIN"

# Update .env.local with the callback URL
ENV_FILE=".env.local"
CALLBACK_URL="${NGROK_URL}/api/callback"

if [ -f "$ENV_FILE" ]; then
    # Check if SCHOOLOGY_CALLBACK_URL exists
    if grep -q "SCHOOLOGY_CALLBACK_URL=" "$ENV_FILE"; then
        # Update existing line (works on both macOS and Linux)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|SCHOOLOGY_CALLBACK_URL=.*|SCHOOLOGY_CALLBACK_URL=${CALLBACK_URL}|" "$ENV_FILE"
        else
            sed -i "s|SCHOOLOGY_CALLBACK_URL=.*|SCHOOLOGY_CALLBACK_URL=${CALLBACK_URL}|" "$ENV_FILE"
        fi
        echo "✅ Updated SCHOOLOGY_CALLBACK_URL in .env.local"
    else
        # Add new line
        echo "SCHOOLOGY_CALLBACK_URL=${CALLBACK_URL}" >> "$ENV_FILE"
        echo "✅ Added SCHOOLOGY_CALLBACK_URL to .env.local"
    fi
else
    echo "⚠️  Warning: .env.local not found. Creating it..."
    echo "SCHOOLOGY_CALLBACK_URL=${CALLBACK_URL}" > "$ENV_FILE"
fi

echo ""
echo "=================================================="
echo "🎉 Development environment configured!"
echo "=================================================="
echo "Ngrok URL:      $NGROK_URL"
echo "Callback URL:   $CALLBACK_URL"
echo "Ngrok Domain:   $NGROK_DOMAIN"
echo ""
echo "⚠️  IMPORTANT: Update your Schoology Developer App with:"
echo "   Domain: $NGROK_DOMAIN"
echo ""
echo "=================================================="
echo ""

# Offer to open Schoology admin page
read -p "Open Schoology Developer Console? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Try to open in browser (works on most systems)
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://app.schoology.com/api" &
    elif command -v open &> /dev/null; then
        open "https://app.schoology.com/api" &
    else
        echo "📋 Please manually open: https://app.schoology.com/api"
    fi
fi

echo ""
read -p "Press Enter once you've updated Schoology to continue..."
echo ""

# Start Firebase emulators
echo "🔥 Starting Firebase emulators..."
firebase emulators:start &
FIREBASE_PID=$!

# Wait for Firebase to be ready
echo "⏳ Waiting for Firebase emulators to initialize..."
sleep 5

# Start Next.js dev server
echo "⚡ Starting Next.js dev server..."
npm run dev &
NPM_PID=$!

echo ""
echo "=================================================="
echo "✅ All services started!"
echo "=================================================="
echo "Ngrok:          http://localhost:4040 (dashboard)"
echo "Next.js:        $NGROK_URL"
echo "Firebase UI:    http://localhost:4000"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================================="

# Wait for user to stop
wait

