# Schoology Enhancer

A modern, intelligent academic planning application that enhances the Schoology learning management system with proactive planning, AI-powered insights, and a beautiful user interface.

## 🎯 Project Goals

- **Schoology Integration**: Seamless OAuth 1.0a authentication with Schoology's API
- **Modern Interface**: Beautiful, responsive UI built with Next.js and Shadcn/ui
- **Proactive Planning**: Intelligent deadline tracking and course management
- **AI-Ready Architecture**: Data structures optimized for LLM processing, RAG applications, and semantic search
- **Performance**: Smart caching strategy with Firestore for offline-first experience

## 🚀 Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Backend**: Firebase Functions, Firestore, Authentication
- **Data Layer**: Modern, semantic data models optimized for AI/ML applications
- **Testing**: Jest for backend integration, Playwright for E2E testing
- **Development**: Firebase Emulator Suite for local development

## 🏗️ Architecture Highlights

### Modern Data Structure

Our data models are designed for the future of AI-powered education:

- **Rich Metadata**: Academic information, difficulty levels, learning objectives
- **LLM Optimization**: Embedding fields, semantic keywords, AI-generated summaries
- **RAG-Ready**: Structured relationships and searchable content
- **Protocol Buffer Compatible**: Clean interfaces for serialization
- **Backward Compatible**: Maintains compatibility with legacy Schoology API

### Data Sources & Caching

- **Live Data**: Real-time Schoology API integration
- **Cached Data**: Firestore-based performance optimization
- **Mock Data**: Comprehensive testing and development support
- **Clear Indicators**: UI shows data source and freshness

## 📋 Prerequisites

- Node.js 18+ and npm
- Google/Firebase account
- Schoology Developer Account
- Docker (for containerized development)

## 🚀 Quick Start

### Automated Setup (Recommended)

The easiest way to start development:

```bash
npm run dev:full
```

This script will:

1. 🌐 Start ngrok tunnel and get a public URL
2. 📝 Automatically update `.env.local` with the callback URL
3. 🔥 Start Firebase emulators
4. ⚡ Start Next.js dev server
5. 🎉 Display all URLs and configuration

**Note**: You'll need to update your Schoology Developer App domain once with the ngrok domain (the script will show you what to paste).

### Manual Setup

If you prefer manual control:

### 1. Clone and Install

```bash
git clone <repository-url>
cd schoology-enhancer
npm install
```

### 2. Firebase Configuration

```bash
# Login to Firebase
firebase login

# Initialize project (use existing project ID)
firebase use schoology-testing

# Set up local secrets for development
cp .secret.local.example .secret.local
# Edit .secret.local with your Schoology API credentials
```

### 3. Development Environment (Cursor on Mac)

```bash
# Start development server
npm run dev

# In another terminal, start Firebase emulators
firebase emulators:start --only hosting,functions,firestore --project schoology-testing
```

### 4. Testing (MCP-first)

```bash
# Backend integration tests (Jest)
npm run test:emu

# MCP-first: Use Chrome DevTools MCP tools to validate journeys in your open Chrome
# If MCP is unavailable, use Playwright via our scripts only
npm run test:simple
npm run test:runner
```

## 🔧 Environment Configuration

### Firebase Emulators

The project uses Firebase Emulator Suite for local development:

- **Functions**: Port 5001
- **Firestore**: Port 8080
- **Hosting**: Port 5000
- **Auth**: Port 9099

### Schoology API Setup

1. Create a Schoology Developer App
2. Set redirect URL to your local development URL
3. Store credentials in `.secret.local` for development
4. Use Google Secret Manager for production

## 📊 Current Status

### ✅ Completed

- [x] Modern, LLM-optimized data structures
- [x] Firebase Functions for OAuth 1.0a flow
- [x] Comprehensive testing framework
- [x] MSW integration for API mocking
- [x] Beautiful UI components and layout
- [x] Data caching and source tracking

### 🔄 In Progress

- [ ] MSW integration in Playwright test environment
- [ ] End-to-end OAuth flow testing
- [ ] Complete dashboard data display

### 📋 Next Steps

1. Fix MSW integration for Playwright tests
2. Complete OAuth flow end-to-end testing
3. Implement live Schoology API integration
4. Add AI-powered insights and recommendations

## 🧪 Testing Strategy

### Backend Tests (Jest)

- **Location**: `src/test/`
- **Command**: `npm run test:emu`
- **Coverage**: OAuth logic, data services, Firebase integration

### End-to-End Tests (Playwright)

- **Location**: `tests/e2e/`
- **Command**: `npm run test:simple`
- **Coverage**: Complete user flows, UI interactions, data display

### Test Data

- **Mock Data**: Comprehensive test scenarios
- **MSW Handlers**: API endpoint mocking
- **Firebase Emulators**: Local database and functions

## 🔐 Security

- **Local Development**: Credentials stored in `.secret.local` (gitignored)
- **Production**: Credentials managed via Google Secret Manager
- **OAuth Flow**: Secure token exchange with Schoology
- **Data Privacy**: User data isolated by Firebase Auth UID

## 🤝 Contributing

This is an open-source project. We welcome contributions!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📚 Documentation

- **`README.md`**: Project overview and setup instructions
- **`.cursorrules`**: Cursor IDE rules and AI session guidelines
- **`docs/LOG.md`**: Session logs and progress tracking
- **`docs/action-plan.md`**: Development roadmap and milestones
- **`docs/session-context.md`**: Current session context and debugging notes
- **`docs/quick-reference.md`**: Quick status and command reference
- **`.idx/airules.md`**: Firebase Studio-specific AI guidelines

## 🆘 Troubleshooting

### Common Issues

- **404 Errors**: Ensure Firebase emulators are running and functions are built
- **MSW Not Working**: Check browser console for service worker registration
- **Test Failures**: Verify Firebase emulator connectivity and mock data setup

### Environment Reset

If you encounter persistent issues:

1. Use "Firebase Studio: Hard Restart" command
2. Rebuild environment after configuration changes
3. Check emulator logs for startup errors

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for modern education technology**
