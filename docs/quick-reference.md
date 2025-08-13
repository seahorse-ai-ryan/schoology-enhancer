# Quick Reference Guide

## 🚀 Current Status (2025-07-27)

**Phase:** End-to-End Testing & OAuth Flow  
**Status:** MSW Integration Blocker  
**Next Milestone:** Complete OAuth flow testing

## 🎯 Key Commands

### Development

```bash
npm run dev          # Start Next.js dev server (port 9000)
npm run build        # Build Firebase Functions
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint code quality check
```

### Testing

```bash
npm run test:emu     # Jest backend tests (✅ Working)
npm run test:simple  # Playwright E2E tests (❌ MSW Issue)
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

## 🔧 Current Blocker: MSW in Playwright

### Problem

- Playwright tests timeout waiting for dashboard content
- MSW service worker not intercepting API calls
- Dashboard never receives mock data

### Files Involved

- `src/mocks/browser.ts` - MSW browser setup
- `src/components/providers/MSWProvider.tsx` - MSW initialization
- `src/mocks/handlers.ts` - API mock handlers
- `tests/e2e/oauth-flow.spec.ts` - Failing tests

### Debugging Steps

1. Check MSW service worker registration
2. Verify API call interception
3. Test MSW in development vs. test environment
4. Consider alternative mocking approaches

## 📱 UI Components

### Dashboard (`src/components/dashboard/UserDashboard.tsx`)

- **Data Source Indicators**: Clear Mock/Cached/Live badges
- **Responsive Design**: Mobile-first approach
- **Loading States**: Proper feedback during data loading
- **Error Handling**: Graceful fallbacks for failures

### Authentication (`src/components/auth/LoginButton.tsx`)

- **OAuth Flow**: Redirects to Schoology for authentication
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
