# Frontend Structure

This document outlines the structure of the React frontend for the Todo List application.

## Overview

The frontend is a single-page application (SPA) built with React and Vite. It uses React Router for navigation and Axios for making API requests to the backend.

## Component Hierarchy

The application has a simple component hierarchy.

### `App.jsx`

This is the main component of the application. It is responsible for:

*   **Routing:** It uses React Router to define the application's routes.
*   **Authentication:** It manages user authentication, including login, registration, and logout. It stores the user's authentication token in local storage.
*   **State Management:** It manages the state of the todo list and the authentication forms.
*   **UI Rendering:** It conditionally renders the login/register forms or the todo list based on the user's authentication status.
*   **API Requests:** It uses Axios to make API requests to the backend for authentication and CRUD operations on todos.

### `ForgotPassword.jsx`

This component is located in the `src/pages` directory. It provides a form for users to reset their password. The process involves two steps:

1.  **Request OTP:** The user enters their mobile number to request a One-Time Password (OTP).
2.  **Verify OTP and Reset Password:** The user enters the OTP and their new password to reset their password.

## File Structure

The main files for the frontend are located in the `src/` directory.

*   `main.jsx`: The entry point of the application.
*   `App.jsx`: The main application component.
*   `index.css` and `App.css`: CSS files for styling.
*   `pages/`: A directory for page components.
    *   `ForgotPassword.jsx`: The component for the "Forgot Password" page.
