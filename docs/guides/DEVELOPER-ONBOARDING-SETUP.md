# Developer Onboarding: API Keys & Local Setup

This guide provides a one-time setup process for acquiring the necessary API keys and configuring your local development environment.

---

## 1. Prerequisites: Java Runtime Environment

The Firebase Emulator Suite requires the Java Runtime Environment (JRE) to be installed on your system. Our startup scripts will automatically check for this, but you must install it manually if it's not present.

1.  **Check for Java:** Open your terminal and run `java -version`. If you see version information, you're all set.
2.  **Install Java:** If Java is not installed, we recommend using the Homebrew OpenJDK 17 build, which is required by the Firebase emulators.
    -   **For macOS (with Homebrew):**
        ```bash
        brew install openjdk@17
        ```
    -   **For other operating systems:** Please find a way to install OpenJDK version 17.

---

## 2. Schoology Application Credentials

These keys are for the application itself and are used for the main user-facing OAuth login flow.

1.  **Navigate to the Schoology App Publisher page:**
    -   [https://app.schoology.com/apps/publisher](https://app.schoology.com/apps/publisher)
2.  **Create or select your developer application.**
3.  From the app's dashboard, you will find the `Consumer Key` and `Consumer Secret`.
4.  Copy these values into the corresponding `SCHOOLOGY_CONSUMER_KEY` and `SCHOOLOGY_CONSUMER_SECRET` fields in your `.env.local` file.

---

## 3. Schoology Admin Credentials

These keys belong to a specific Schoology user with System Admin privileges and are required for backend scripts, data seeding, and user impersonation.

### Part A: Enable API Key Generation Permission

This permission is not enabled by default for System Admins.

1.  **Navigate to the Permissions page:**
    -   [https://app.schoology.com/users/manage/permissions](https://app.schoology.com/users/manage/permissions)
2.  Select the **System Admin** role.
3.  Under the "Users" section, find the permission named **"Create new API keys"** and ensure the checkbox is checked.
4.  Save the changes.

### Part B: Generate Admin API Keys

1.  **Navigate to the API page for your admin account:**
    -   [https://app.schoology.com/api](https://app.schoology.com/api)
2.  If no keys exist, generate a new set.
3.  Copy the `Key` and `Secret` values.
4.  Paste these into the `SCHOOLOGY_ADMIN_KEY` and `SCHOOLOGY_ADMIN_SECRET` fields in your `.env.local` file.

---

## 4. Local Tunneling with ngrok

Our development environment uses a stable ngrok URL to ensure the Schoology OAuth callback works consistently.

1.  **Paid ngrok Account:** A paid ngrok account is required to reserve a static domain. The free plan generates a new, random URL on every restart, which is not practical for this project as it would require constant updates to your `.env.local` file and the Schoology App configuration.

2.  **Reserve Your Domain:** In your ngrok dashboard, reserve a static domain (e.g., `yourname-schoology.ngrok.dev`).

3.  **Configure `.env.local`:**
    -   Update the `SCHOOLOGY_CALLBACK_URL` to use your reserved ngrok domain. For example: `SCHOOLOGY_CALLBACK_URL=https://yourname-schoology.ngrok.dev/api/callback`
    -   Add your `NGROK_AUTH_TOKEN`. You can find this on your ngrok dashboard here: [https://dashboard.ngrok.com/get-started/your-authtoken](https://dashboard.ngrok.com/get-started/your-authtoken)

4.  **Configure `package.json`:**
    -   Open the `package.json` file.
    -   In the `scripts` section, find the `ngrok` command.
    -   Update the command to use your reserved domain: `"ngrok": "ngrok http --domain=yourname-schoology.ngrok.dev 9000 --log stdout"`
