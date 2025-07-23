# Mistakes and Learnings Log

This document chronicles the incorrect paths and strategic pivots made during the initial setup of the Schoology Enhancer project. It serves as a public-facing diary of the development journey, showing how we arrived at our current best practices.

## 1. Test Runner Hell: Vitest vs. Jest

*   **The Mistake:** I attempted to use Vitest for our backend integration tests. This was a fundamental error, as Vitest is a frontend-first tool that struggled to resolve Node.js native modules like `crypto` in our backend code. This led to a long and frustrating series of failed configuration attempts.
*   **The Learning:** The correct tool for testing Node.js backend code is a Node.js-native test runner. We successfully pivoted to **Jest**, which immediately solved the module resolution issues. This highlights the importance of choosing tools that fit the runtime environment (Node.js vs. Browser).

## 2. The Mystery of the Zombie Processes

*   **The Mistake:** I repeatedly encountered "port taken" errors when trying to run the emulators. My attempts to `kill` the processes often failed.
*   **The Learning:** As an AI agent, I cannot see or manage the multiple terminal panes in the Firebase Studio UI. Zombie processes from previous failed runs were lingering in panes that were hidden to me. The user had to manually intervene to close these panes, highlighting a key limitation of the current agent tooling. This taught us the importance of a clean environment state, which led to adopting the **"Firebase Studio: Hard Restart"** command as a standard procedure.

## 3. The Build Step for Functions

*   **The Mistake:** I failed to recognize that the TypeScript Firebase Functions needed to be explicitly compiled into JavaScript (`npm run build`) before the Firebase Emulator could run them.
*   **The Learning:** The Functions Emulator does not run the TypeScript compiler for you. The build step is a mandatory prerequisite to running the local backend. This was a key insight that led us to add the build command to the `onCreate` lifecycle hook in our `.idx/dev.nix` file, automating the process.
