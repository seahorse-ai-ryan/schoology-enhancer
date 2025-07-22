# Schoology Enhancer

> **Project Status: Experimental & In-Progress**
>
> This is an experimental project, currently being developed by a single person. The primary goal is to explore what's possible when combining modern web technologies and AI development partners to improve the Schoology experience.
>
> While the project is open source, **I am not actively seeking contributions at this time.** Please be aware that the code is in a state of flux, and the direction may change. You are absolutely welcome to fork this repository, explore the code, and build your own versions.

**Schoology Enhancer** is an open-source project aimed at providing a modern, clean, and proactive interface for the Schoology Learning Management System. This application is being built with a "vibe-coding" methodology, leveraging AI development partners like Google's Gemini to accelerate development and iteration.

The goal is to move beyond simply displaying data and to empower students, parents, and teachers with tools for proactive planning and better time management.

## Technology Stack

This project uses a modern, robust technology stack:

*   **Framework:** [Next.js](https://nextjs.org/) (with App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Backend:** [Firebase Functions](https://firebase.google.com/docs/functions)
*   **Database:** [Firestore](https://firebase.google.com/docs/firestore)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [Shadcn/ui](https://ui.shadcn.com/)
*   **Testing:** [Vitest](https://vitest.dev/) for unit and integration tests
*   **API Mocking:** [Mock Service Worker (MSW)](https://mswjs.io/)

## Getting Started

To get a local copy up and running, please follow these steps.

### Prerequisites

You will need:
*   [Node.js](https://nodejs.org/) (v18 or later)
*   A Google Account with a [Firebase project](https://firebase.google.com/)
*   A [Schoology Developer Account](https://developers.schoology.com/) to register your own application

### Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/schoology-enhancer.git
    cd schoology-enhancer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure your Firebase Project:**
    *   This project is designed to be developed using [Firebase Studio](https://firebase.google.com/docs/studio) or another connected Google Cloud environment.
    *   Ensure you have a Firebase project created and are authenticated with the Firebase CLI (`firebase login`).

4.  **Set up Schoology API Credentials:**
    *   In the Schoology Developer Portal, create a new application. You will receive a **Consumer Key** and **Consumer Secret**.
    *   This project uses [Google Secret Manager](https://cloud.google.com/secret-manager) to handle these credentials securely. **Do not commit them to a `.env` file.**
    *   Add your credentials to your project's Secret Manager with the following names:
        *   `SCHOOLOGY_CONSUMER_KEY`
        *   `SCHOOLOGY_CONSUMER_SECRET`

5.  **Run the development server:**
    *   Because this is a Next.js project integrated with Firebase Functions, the typical `npm run dev` will only run the frontend. To run the full application, you will need to use the [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite).
    ```bash
    firebase emulators:start
    ```

### Running Tests

This project uses Vitest for testing. To run the test suite:

```bash
npm test
```

## Contributing

As noted in the status section above, this project is not actively seeking contributions at this time. However, if you are passionate about this and have suggestions, you are welcome to fork the repository and explore.

## License

Distributed under the MIT License. See `LICENSE` for more information.
