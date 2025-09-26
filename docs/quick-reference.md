# Quick Reference Guide

## 🚀 Current Status (Hello World focus)

**Phase:** Hello World flows with MCP-first testing  
**Status:** Build out demo mode, dashboard, and parent switching; OAuth completion pending real credentials  
**Next Milestone:** Reliable MCP-driven smoke across landing, demo, dashboard, switch, logout

## 🎯 Key Commands

### Development

```bash
npm run dev          # Start Next.js dev server (port 9000)
npm run build        # Build Firebase Functions
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint code quality check
```

### Testing (MCP-first)

```bash
npm run test:emu     # Jest backend tests (✅ Working)
# Prefer Chrome DevTools MCP to validate flows in your open Chrome.
# Fallback only:
npm run test:simple  # Playwright E2E tests
npm run test:runner  # Interactive test runner
```

### Firebase

```bash
firebase emulators:start  # Start emulators (not needed in Firebase Studio)
firebase deploy            # Deploy to production
```

## 🏗️ Architecture Overview

### Data Models (`src/lib/schoology-data.ts`)

- **Modern & LLM-Ready**: Rich metadata, semantic fields, embedding support
- **RAG-Optimized**: Structured relationships, searchable content
- **Backward Compatible**: Works with legacy Schoology API
- **Protocol Buffer Ready**: Clean interfaces for serialization

### Key Interfaces

- `SchoologyCourse`: Academic metadata, objectives, difficulty levels
- `SchoologyAssignment`: Coursework, deadlines, grading information
- `SchoologyAnnouncement`: Updates, notifications, engagement tracking
- `SchoologyGrade`: Performance data, feedback, analytics
- `SchoologyUser`: Profile, preferences, academic information

### Data Sources

- **Live**: Real-time Schoology API
- **Cached**: Firestore-based performance optimization
- **Mock**: Comprehensive testing and development support

## 🧪 Testing Strategy

### Backend Tests (Jest)

- **Location**: `src/test/`
- **Coverage**: OAuth logic, data services, Firebase integration
- **Status**: ✅ All tests passing

### End-to-End Tests (Playwright)

- **Location**: `tests/e2e/`
- **Coverage**: Complete user flows, UI interactions
- **Status**: ❌ MSW integration issue blocking tests

### Test Data

- **Mock Data**: Rich, realistic test scenarios
- **MSW Handlers**: API endpoint mocking
- **Firebase Emulators**: Local database and functions

## 🔧 E2E Validation Strategy (MCP)

- Use Chrome DevTools MCP to assert DOM, console events (see Cursor Rules), and network requests.
- Avoid curl; avoid launching new browsers. Drive your already-open Chrome.

## 📱 UI Components

### Dashboard (`src/components/dashboard/UserDashboard.tsx`)

- **Data Source Indicators**: Clear Mock/Cached/Live badges
- **Responsive Design**: Mobile-first approach
- **Loading States**: Proper feedback during data loading
- **Error Handling**: Graceful fallbacks for failures

### Authentication (`src/components/auth/LoginButton.tsx`)

- **OAuth Flow**: Redirects to Schoology for authentication (uses `oauth-1.0a` library)
- **Session Management**: Handles login/logout states
- **User Display**: Shows authenticated user information

## 🔐 Security & Configuration

### Local Development

- **Credentials**: Stored in `.secret.local` (gitignored)
- **Emulators**: Firebase services running locally
- **Ports**: Functions(5001), Firestore(8080), Hosting(5000)

### Production

- **Credentials**: Managed via Google Secret Manager
- **Deployment**: Firebase Hosting + Functions
- **Security**: OAuth 1.0a with proper token management

## 📚 Key Documentation

- **`README.md`**: Project overview and setup instructions
- **`docs/LOG.md`**: Session logs and progress tracking
- **`docs/action-plan.md`**: Development roadmap and milestones
- **`docs/session-context.md`**: Current session context and debugging notes
- **`.idx/airules.md`**: AI assistant guidelines and environment rules

## 🚨 Common Issues & Solutions

### Playwright Tests Hanging

- **Solution**: Use `npm run test:simple` instead of direct Playwright commands
- **Reason**: Inline chat compatibility issues

### MSW Not Working

- **Check**: Browser console for service worker registration
- **Verify**: API calls are being intercepted
- **Fallback**: Consider direct API route mocking

### Firebase Functions 404

- **Check**: Functions are built (`npm run build`)
- **Verify**: Emulators are running and accessible
- **Reset**: Use "Firebase Studio: Hard Restart" if needed

## 🎯 Next Steps

1. **Fix MSW Integration**: Resolve service worker registration in Playwright
2. **Complete OAuth Testing**: Verify end-to-end authentication flow
3. **Dashboard Validation**: Ensure all components render with mock data
4. **Live API Integration**: Connect to real Schoology API endpoints

---

**Last Updated:** 2025-07-27  
**For AI Agents**: See `.idx/airules.md` for detailed interaction guidelines
