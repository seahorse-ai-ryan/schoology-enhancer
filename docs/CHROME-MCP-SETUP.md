# Chrome DevTools MCP Setup

**Last Updated:** September 30, 2025  
**Status:** ✅ Chromium Installed, ⏳ MCP Configuration Pending

---

## Overview

Chrome DevTools MCP enables AI agents to control a Chrome browser for automated testing, debugging, and verification. This is critical for vibe coding workflows.

**See:** [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp/)

---

## Installation Status

### ✅ Chromium Installed in Container

**Version:** Chromium 140.0.7339.185  
**OS:** Debian GNU/Linux 12 (bookworm)  
**Architecture:** ARM64 (aarch64)

**Required Flags for Container:**
```bash
--no-sandbox              # Container can't create its own sandboxes
--disable-dev-shm-usage   # Prevent /dev/shm issues
--disable-gpu             # No GPU in container
```

**Wrapper Script:** `scripts/chrome-container.sh`
```bash
#!/bin/bash
exec chromium \
  --no-sandbox \
  --disable-dev-shm-usage \
  --disable-gpu \
  "$@"
```

---

## Cursor MCP Configuration

### Manual Step Required

Add to Cursor's MCP settings (Settings → MCP → New MCP Server):

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--executablePath=/usr/bin/chromium",
        "--isolated=true"
      ],
      "env": {
        "CHROMIUM_FLAGS": "--no-sandbox --disable-dev-shm-usage --disable-gpu"
      }
    }
  }
}
```

**Key Configuration:**
- `--executablePath=/usr/bin/chromium` - Use installed Chromium
- `--isolated=true` - Clean profile for each test run
- `env.CHROMIUM_FLAGS` - Pass container-required flags

### Alternative: Use Wrapper Script

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "-y",
        "chrome-devtools-mcp@latest",
        "--executablePath=/workspaces/schoology-enhancer/scripts/chrome-container.sh"
      ]
    }
  }
}
```

---

## Testing Chrome MCP

### After Configuration

1. Restart Cursor
2. Open new chat or inline chat
3. Try prompt: "Check the performance of https://www.google.com"
4. AI should open browser and record trace

### Expected Behavior

**MCP Tools Available:**
- `navigate_page` - Open URLs
- `take_screenshot` - Capture page visuals
- `evaluate_script` - Run JavaScript
- `list_console_messages` - Read console logs
- `get_network_request` - Inspect network calls
- `click`, `fill`, `hover` - User interactions
- And more...

---

## Usage Examples

### Verify Dashboard After Changes

```
Prompt: "Start the dev servers, navigate to the dashboard, 
         take a screenshot, and check console for errors"
```

AI will:
1. Start ngrok, firebase, npm
2. Open https://modernteaching.ngrok.dev/dashboard
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
2. Click elements
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

## Known Limitations

### Container Sandbox Restrictions

**Issue:** Chromium can't create its own sandboxes in container  
**Solution:** Use `--no-sandbox` flag  
**Risk:** Slightly less secure (acceptable for development)

**From Chrome DevTools MCP docs:**
> Some MCP clients allow sandboxing the MCP server using macOS Seatbelt or Linux containers. 
> If sandboxes are enabled, chrome-devtools-mcp is not able to start Chrome that requires 
> permissions to create its own sandboxes.

### D-Bus Errors (Normal)

**Error:** "Failed to connect to the bus..."  
**Impact:** None - browser still works  
**Why:** Container doesn't have D-Bus daemon  
**Solution:** Ignore these errors

---

## Troubleshooting

### Chrome Won't Start

```bash
# Test manually
chromium --version
chromium --headless --no-sandbox --disable-gpu --dump-dom https://www.google.com
```

### MCP Not Connecting

1. Check Cursor MCP settings
2. Verify `--executablePath` points to `/usr/bin/chromium`
3. Restart Cursor
4. Check Cursor logs for MCP errors

### Cursor Browser Feature

If Cursor's built-in browser feature still doesn't work:
- Focus on Chrome DevTools MCP (separate from Cursor Browser)
- Chrome MCP is what AI agents use programmatically
- Cursor Browser is for visual display (nice-to-have)

---

## Next Steps

**Manual (User):**
1. Add MCP configuration to Cursor settings
2. Restart Cursor
3. Test with simple prompt
4. Report if working

**Automated (AI Agent):**
1. Create browser-first testing examples
2. Document usage patterns
3. Update TESTING.md with Chrome MCP guide

---

**Status:** Chrome installed, awaiting MCP configuration
