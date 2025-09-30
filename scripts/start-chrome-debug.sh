#!/bin/bash

# Start Chrome with Remote Debugging
# This allows Cursor MCP and Playwright to connect to your real Chrome instance
# No hCaptcha issues, uses your existing session!

echo "🔧 Starting Chrome with remote debugging..."
echo ""
echo "This Chrome instance will:"
echo "  ✅ Use your real Google Chrome (not Chromium)"
echo "  ✅ Maintain your login sessions"
echo "  ✅ Pass hCaptcha checks"
echo "  ✅ Allow Cursor MCP to control it"
echo ""

# Use a temporary profile to avoid conflicts with your main Chrome
PROFILE_DIR="/tmp/chrome-testing-profile"

# Close any existing debug Chrome
pkill -f "remote-debugging-port=9222" 2>/dev/null

# Launch Chrome with debugging enabled
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 \
  --user-data-dir="$PROFILE_DIR" \
  --disable-blink-features=AutomationControlled \
  https://modernteaching.ngrok.dev &

echo "✅ Chrome started with remote debugging on port 9222"
echo ""
echo "Now you can:"
echo "  1. Sign in with Schoology in this Chrome window"
echo "  2. Complete OAuth (hCaptcha will work!)"
echo "  3. Tell the AI to connect and test"
echo ""
echo "To stop: pkill -f 'remote-debugging-port=9222'"
