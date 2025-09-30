# AI Workflow Guide for Modern Teaching

**For:** Human developers working with AI agents  
**Last Updated:** September 30, 2025

---

## Vibe Coding Philosophy

"Vibe Coding" is a documentation-driven development approach optimized for AI collaboration. We maintain clear state through markdown files, allowing AI agents to pick up context quickly and make autonomous progress.

---

## Core Workflow

### AI Agent Interaction

**"YOLO Mode":**
- AI agent's directive: Make autonomous progress
- AI proposes action → immediately executes tool call
- Developer approves by clicking "Run..." button
- Fast iteration without constant confirmation

**When to Interrupt:**
- AI proposes code refactoring (blocked until testing complete)
- Unclear requirements or ambiguous goals
- Major architectural decisions needed

---

## Starting a New Session

### For AI Agents

**"Let's get back to work" - Read these files:**

1. `.cursor/rules/core.md` - Current status, priorities, what's allowed
2. `docs/CURRENT-STATUS.md` - Active TODOs, blockers, recent decisions
3. `docs/USER-JOURNEYS.md` - What's currently implemented
4. Previous chat context (Cursor may summarize)

**This gives you:**
- Where we left off
- What's in progress
- What's blocked
- Next steps

### For Human Developers

**Resuming after break:**

1. Read `docs/CURRENT-STATUS.md` for latest state
2. Check Cursor's TODO list for active tasks
3. Review recent Git commits for changes
4. Ask AI: "What's our current status and next priority?"

---

## Documentation Structure

### For AI Context

**Primary Rules:**
- `.cursor/rules/core.md` - Status, priorities, critical rules
- `.cursor/rules/workflow.md` - Dev environment, testing
- `.cursorrules` - Minimal delegator to above files

**Technical Details:**
- `docs/ARCHITECTURE.md` - Data flow, caching, API endpoints
- `docs/USER-JOURNEYS.md` - Implemented features
- `docs/CURRENT-STATUS.md` - Active work

**Reference:**
- `docs/STARTUP.md` - Environment setup
- `docs/SCHOOLOGY-CSV-IMPORT.md` - Bulk import guide
- `docs/SCHOOLOGY-SEED-DATA-GUIDE.md` - Mock data practices

### Why This Structure?

**Modular Rules:**
- Cursor now supports `.cursor/rules/` directory
- Easier to maintain than monolithic `.cursorrules`
- Clear separation of concerns
- No duplication

**Session Continuity:**
- `CURRENT-STATUS.md` acts as session memory
- Cursor TODOs tracked in file (not just UI)
- Can resume work in new chat easily

---

## Testing Strategy

### Browser-First Approach

**1. Chrome DevTools MCP (Primary)**

**What it is:**
- AI agent controls Chrome browser via MCP protocol
- See: https://github.com/ChromeDevTools/chrome-devtools-mcp/

**When to use:**
- E2E user journey testing
- Verifying UI changes
- Debugging issues
- Visual regression testing

**Benefits:**
- AI can see what's happening
- Real-time debugging
- Screenshots for verification
- Network/console inspection

**2. Jest (Backend/Unit Only)**

**When to use:**
- Data transformation logic
- API route behavior
- Firebase integration
- Server-side utilities

**Command:** `npm run test:emu`

**3. Playwright (Minimal)**

**When to use:**
- Headless CI/CD testing (future)
- Special cases where browser automation isn't suitable

**Command:** `npm run test:simple`

### Why Browser-First?

**Vibe coding requires interaction:**
- See changes immediately
- Debug in real-time
- Verify UX visually
- AI can report findings with evidence

**Traditional testing is too slow:**
- Write test → run → check results → repeat
- Browser MCP: make change → verify → iterate

---

## File Organization

### Where Things Live

```
.cursor/
├── rules/
│   ├── core.md           # Project status, DO NOT REFACTOR rule
│   └── workflow.md       # Dev environment, testing strategy
└── ai-workflow.md        # This file (for humans)

docs/
├── ARCHITECTURE.md       # Technical architecture
├── CURRENT-STATUS.md     # Session continuity (AI + human)
├── USER-JOURNEYS.md      # Implemented features catalog
├── STARTUP.md            # Environment setup
├── TESTING.md            # Testing guide (coming soon)
└── product-requirements.md  # Product roadmap

src/
├── app/api/              # Next.js API routes
├── components/           # React components
├── lib/                  # Shared utilities (data models)
├── functions/            # Firebase Functions
└── test/                 # Jest backend tests

tests/
└── e2e/                  # Playwright E2E tests
```

---

## Working with AI Agents

### Providing Context

**Good prompts:**
- "Let's get back to work" (AI reads CURRENT-STATUS.md)
- "Review the parent-child switching code and add tests"
- "Check the dashboard using Chrome MCP"

**Avoid:**
- Vague requests without context
- Asking AI to refactor code (blocked until testing complete)
- Requesting features not in product-requirements.md

### Reviewing AI Changes

**Before approving:**
- Read the proposed changes
- Check if it aligns with current priorities (CURRENT-STATUS.md)
- Verify it doesn't refactor code (if testing incomplete)
- Ensure documentation is updated

**Git commits:**
- AI should propose clear commit messages
- Review before approving
- Can always revert via Git

---

## Common Patterns

### MCP-First Testing Flow

1. **Make code change**
2. Wait for Next.js hot reload ("✓ Compiled" in terminal)
3. Ask AI to verify with Chrome MCP:
   - Navigate to page
   - Check console
   - Verify network requests
   - Take screenshot
4. AI reports findings
5. Iterate or move on

### Documentation Updates

When AI completes work:
1. Update `docs/CURRENT-STATUS.md` TODOs
2. Update `docs/USER-JOURNEYS.md` if feature added
3. Git commit with clear message

### Firebase Studio vs Cursor

**Use Cursor (Primary):**
- Daily development
- Feature implementation
- Testing
- Documentation

**Use Firebase Studio (Secondary):**
- Cloud deployment
- Firebase console work
- Production debugging

---

## Tips for Effective Vibe Coding

1. **Trust the AI** - Let it make autonomous progress
2. **Clear Context** - Keep CURRENT-STATUS.md updated
3. **Document Decisions** - Update docs as you go
4. **Test First** - Don't refactor without tests
5. **Git Frequently** - Commit working states

---

## When Things Go Wrong

### AI Makes Wrong Assumption

- Correct it immediately
- AI will update its understanding
- May update docs to prevent repeat

### Changes Break Something

- `git revert` to last known-good commit
- Review what changed
- Add test to prevent regression
- Try again with better approach

### Lost Context After Restart

- Say "Let's get back to work"
- AI reads CURRENT-STATUS.md
- Resumes from last checkpoint

---

## Questions?

- **AI agent rules:** `.cursor/rules/`
- **Technical architecture:** `docs/ARCHITECTURE.md`
- **Current work:** `docs/CURRENT-STATUS.md`
- **Features:** `docs/USER-JOURNEYS.md`
