# Technology Stack

This document provides an overview of the technologies used in the MERN stack Todo List application.

## Backend

*   **Node.js:** A JavaScript runtime environment that executes JavaScript code outside a web browser. It is used to build the backend of the application.
*   **Express:** A fast, unopinionated, minimalist web framework for Node.js. It is used to create the RESTful API.
*   **MongoDB:** A NoSQL document-oriented database. It is used to store the application's data.
*   **Mongoose:** An Object Data Modeling (ODM) library for MongoDB and Node.js. It provides a straight-forward, schema-based solution to model your application data.
*   **JSON Web Tokens (JWT):** A compact, URL-safe means of representing claims to be transferred between two parties. It is used for authentication.
*   **bcrypt:** A library for hashing passwords.
*   **dotenv:** A zero-dependency module that loads environment variables from a `.env` file into `process.env`.
*   **Helmet:** A middleware for Express that helps secure your apps by setting various HTTP headers.
*   **CORS:** A middleware for Express that enables Cross-Origin Resource Sharing.
*   **express-rate-limit:** A middleware for Express that limits repeated requests to public APIs and/or endpoints.
*   **express-validator:** A middleware for Express that provides validation and sanitization functions.
*   **Nodemailer:** A module for Node.js applications to allow easy as cake email sending. (Note: Nodemailer is a dependency but not currently used in the provided code.)
*   **Twilio (or similar SMS service):** The `smsService.js` file suggests the use of an SMS service like Twilio for sending OTPs, although the implementation is a placeholder.

## Frontend

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A build tool that aims to provide a faster and leaner development experience for modern web projects.
*   **React Router:** A standard library for routing in React.
*   **Axios:** A promise-based HTTP client for the browser and Node.js.
*   **ESLint:** A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
