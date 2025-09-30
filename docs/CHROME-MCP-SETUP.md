# Chrome DevTools MCP Setup

**Last Updated:** September 30, 2025  
**Status:** ✅ Native Mac Environment with Browser Automation  
**Environment:** macOS (native development)

---

## Overview

Chrome DevTools MCP enables AI agents to control a Chrome browser for automated testing, debugging, and verification. This is critical for vibe coding workflows.

**See:** [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp/)

---

## Native Mac Setup

### Why Native?

Browser automation requires a display environment to open browser windows. While containers are great for isolation, they lack GUI support without complex X11 forwarding. Running natively on macOS provides:

- ✅ Full browser automation with visible windows
- ✅ Cursor's built-in browser integration works
- ✅ Chrome DevTools MCP can launch browsers
- ✅ AI-driven E2E testing with visual feedback
- ✅ Faster iteration with hot reload

### Prerequisites

1. **Chrome or Chromium** installed on macOS
   ```bash
   # Check if installed
   which google-chrome-stable || which chromium || which /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
   ```

2. **Cursor IDE** with MCP support

3. **Node.js 20+** for running Chrome DevTools MCP server

---

## Cursor MCP Configuration

### Option 1: Use System Chrome (Recommended)

Add to Cursor's MCP settings (Settings → MCP → New MCP Server):

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--isolated=true"
      ]
    }
  }
}
```

**Note:** Omitting `--executablePath` uses the system Chrome automatically.

### Option 2: Specify Chrome Path Explicitly

If Chrome is in a non-standard location:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--executablePath=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "--isolated=true"
      ]
    }
  }
}
```

### Configuration Details

- `--isolated=true` - Clean browser profile for each test run (prevents cache/cookie interference)
- No `--no-sandbox` or `--disable-gpu` needed on native Mac
- No wrapper scripts required

---

## Testing Chrome MCP

### After Configuration

1. Restart Cursor
2. Open new chat or inline chat
3. Try prompt: "Navigate to google.com and take a screenshot"
4. AI should open a browser window and capture the page

### Expected Behavior

**MCP Tools Available:**

- `navigate` - Open URLs
- `snapshot` - Get accessibility tree (best for understanding page structure)
- `take_screenshot` - Capture page visuals
- `evaluate` - Run JavaScript in page context
- `console_messages` - Read console logs
- `network_requests` - Inspect network calls
- `click`, `type`, `hover` - User interactions
- And more...

---

## Usage Examples

### Verify Dashboard After Changes

```
Prompt: "Navigate to https://modernteaching.ngrok.dev/dashboard,
         take a screenshot, and check console for errors"
```

AI will:

1. Open browser window
2. Navigate to URL
3. Capture screenshot
4. Read console messages
5. Report any errors

### Test Parent-Child Switching

```
Prompt: "Navigate to dashboard, click the profile menu,
         click 'Carter Mock', verify courses load,
         take a screenshot showing the courses"
```

AI will:

1. Navigate to page
2. Click elements using accessibility tree
3. Wait for data to load
4. Capture proof
5. Verify expected state

### Debug Network Issues

```
Prompt: "Navigate to dashboard, list all network requests,
         show me the response from /api/schoology/courses"
```

AI will:

1. Navigate to page
2. Monitor network tab
3. Extract specific request/response
4. Report findings

---

## Troubleshooting

### Chrome Won't Start

**Check Chrome installation:**
```bash
# Find Chrome
ls -la /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

# Or find Chromium
which chromium
```

**Test manually:**
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --version
```

### MCP Not Connecting

1. Check Cursor MCP settings (Settings → MCP)
2. Verify `chrome-devtools-mcp` is listed
3. Restart Cursor completely
4. Check Cursor logs for MCP errors
5. Try without `--executablePath` to use system default

### Browser Opens But AI Can't Control It

1. Ensure `--isolated=true` is set (clean profile)
2. Restart MCP server (restart Cursor)
3. Check console for permission errors

---

## Cursor Browser vs Chrome MCP

**Cursor's Built-in Browser:**
- Visual browser panel in IDE
- Announced Sept 29, 2025
- Good for manual inspection

**Chrome DevTools MCP:**
- Programmatic browser control for AI agents
- Can run headless or visible
- Better for automated testing

**Both work together!** Chrome MCP can drive the browser while you watch in Cursor's panel.

---

## Next Steps

**Testing Infrastructure:**

1. ✅ Native Mac environment configured
2. ✅ Browser automation working
3. ⏳ Create browser-first testing patterns
4. ⏳ Document Chrome MCP usage patterns
5. ⏳ Fill testing gaps for Hello World features

**See:** `docs/CURRENT-STATUS.md` for active TODOs

---

**Status:** Ready for AI-driven browser testing on native Mac