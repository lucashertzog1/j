# Speakids (Firebase Studio Project)

This is a Next.js application built with Firebase Studio. It's a language-learning platform for children, featuring interactive games, AI-powered story generation, and progress tracking.

## Running the Project Locally

Yes, you can run this entire project on your local machine using VS Code or any other editor. Here’s how:

### Step 1: Prerequisites

Make sure you have the following installed on your computer:
- [Node.js](https://nodejs.org/) (which includes `npm`)

### Step 2: Firebase Project Setup

The application relies on Firebase for authentication and the Firestore database.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Add a Web App:** Inside your new project, add a new web application. Firebase will provide you with a `firebaseConfig` object containing your project's keys. You will need these for the next step.
3.  **Enable Authentication:** In the Firebase Console, go to the "Authentication" section and enable the "Email/Password" sign-in method.
4.  **Enable Firestore:** Go to the "Firestore Database" section and create a new database in **Test mode** to get started easily.

### Step 3: Google AI (Gemini) API Key

The AI features (story generation, translation, etc.) use the Google AI API.

1.  Go to the [Google AI Studio](https://aistudio.google.com/).
2.  Create a new API key. You will need this key for the next step.

### Step 4: Configure Environment Variables

In the root folder of your project, create a new file named `.env.local`. This file will store your secret keys. **Do not share this file with anyone.**

Copy the content below into your `.env.local` file and replace the placeholder values with the keys you obtained in the previous steps.

```
# Firebase Configuration (from your Firebase project settings)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abcdef..."

# Google AI (Gemini) API Key
GEMINI_API_KEY="your-gemini-api-key"
```

### Step 5: Install Dependencies and Run

Now you are ready to run the application.

1.  **Open a terminal** in the root of your project folder.
2.  **Install dependencies** by running:
    ```bash
    npm install
    ```
3.  **Run the development server**:
    ```bash
    npm run dev
    ```

The application should now be running on `http://localhost:3000`. Any changes you make to the code will be reflected locally.
