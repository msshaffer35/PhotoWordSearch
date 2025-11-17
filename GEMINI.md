# Project Overview

This project is a web-based photo word search game called "Photo Word Search". It allows users to upload an image, which is then analyzed by the Gemini 2.5 Flash model to generate a list of relevant words. The user can review and customize this list before the application generates a word search puzzle. As the user finds words in the puzzle, parts of the uploaded image are revealed.

## Technologies Used

*   **Frontend:** React with TypeScript
*   **Build Tool:** Vite
*   **AI Model:** Google Gemini 2.5 Flash
*   **Styling:** Tailwind CSS (inferred from class names like `min-h-screen`, `flex`, etc.)

## Architecture

The application is structured into several components and services:

*   **`App.tsx`:** The main component that manages the application's state and orchestrates the overall workflow.
*   **`components/`:** Contains the React components for different parts of the UI, such as the landing page, word review screen, and the puzzle itself.
*   **`services/`:** Houses the logic for interacting with external APIs and for core application functionality.
    *   **`geminiService.ts`:** Communicates with the Gemini API to generate words from an image.
    *   **`puzzleService.ts`:** Generates the word search puzzle from a given list of words.
*   **`types.ts`:** Defines the data structures and types used throughout the application.
*   **`constants.ts`:** Stores constant values, such as the prompt for the Gemini API and puzzle difficulty settings.

# Building and Running

## Prerequisites

*   Node.js

## Running Locally

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Create a `.env` file in the root of the project and add your Gemini API key:
    ```
    VITE_API_KEY=your_gemini_api_key_here
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## Other Commands

*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Preview the production build:**
    ```bash
    npm run preview
    ```

# Development Conventions

*   **TypeScript:** The project uses TypeScript with strict mode enabled.
*   **Component-Based Architecture:** The UI is built with React components, promoting reusability and separation of concerns.
*   **Styling:** Utility-first CSS with Tailwind CSS is used for styling.
*   **State Management:** The main application state is managed in the `App.tsx` component.
*   **API Interaction:** Communication with the Gemini API is isolated in the `geminiService.ts` file.
*   **Code Style:** The code follows standard TypeScript and React conventions.
