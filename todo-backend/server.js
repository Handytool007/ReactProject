// server.js

// 1. Load environment variables
require('dotenv').config(); 

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3001; 

// --- 🎯 Security Middleware ---

// 1. Helmet - Set security headers
app.use(helmet());

// 2. CORS - Configure allowed origins
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:5173', // Vite dev server
    credentials: true,
};
app.use(cors(corsOptions));

// 3. Rate Limiting - Prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Middleware to parse JSON bodies
app.use(express.json());

// 2. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connection established successfully.'))
  .catch(err => console.error('MongoDB connection failed:', err.message));

// --- 🎯 Model Imports ---
// We need to import the models so Mongoose knows about the schemas
const Todo = require('./models/Todo'); 
const User = require('./models/User'); 
// -------------------------

// --- 🎯 Router Imports ---
const todoRouter = require('./routes/todoRoutes');
const authRouter = require('./routes/authRoutes');
// -------------------------

// --- 🎯 API Endpoints ---

// 1. Test Route: Simple GET on the root URL
app.get('/', (req, res) => {
    res.send('Hello from the Modular Backend API!');
});

// 2. Register the To-Do router for all paths starting with /api/todos (with rate limiting)
app.use('/api/todos', apiLimiter, todoRouter); 

// 3. Register the Authentication router for all paths starting with /api/auth (with stricter rate limiting)
app.use('/api/auth', authLimiter, authRouter);

// -------------------------

// 4. Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
