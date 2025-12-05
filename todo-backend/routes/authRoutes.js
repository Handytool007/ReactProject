// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the new User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET exists
if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
}

// Utility function to generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Validation middleware for registration
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores')
        .escape(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation middleware for login
const loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .escape(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// POST /api/auth/register - Handles user sign-up
router.post('/register', registerValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array().map(err => err.msg) 
        });
    }
    try {
        const { username, password } = req.body;
        // 1. Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });
        
        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // 3. Create and save the new user
        const user = new User({
            username,
            password: hashedPassword,
        });
        const savedUser = await user.save();
        
        // 4. Generate token and send response
        const token = generateToken(savedUser._id);
        res.status(201).json({ token, userId: savedUser._id });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login - Handles user sign-in
router.post('/login', loginValidation, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array().map(err => err.msg) 
        });
    }
    
    try {
        const { username, password } = req.body;
        
        // 1. Check for user existence
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });
        
        // 2. Compare passwords (hashed vs. provided)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });
        
        // 3. Generate token and send response
        const token = generateToken(user._id);
        res.json({ token, userId: user._id });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
