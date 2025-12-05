// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { sendSMS } = require('../services/smsService'); // Import SMS service

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

// Validation middleware for forgot password request OTP
const forgotPasswordRequestOtpValidation = [
    body('mobileNumber')
        .trim()
        .isMobilePhone('any') // Adjust locale if needed, 'any' for general mobile numbers
        .withMessage('A valid mobile number is required')
];

// Validation middleware for forgot password verify OTP and reset password
const forgotPasswordVerifyOtpResetValidation = [
    body('mobileNumber')
        .trim()
        .isMobilePhone('any')
        .withMessage('A valid mobile number is required'),
    body('otp')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be 6 digits'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
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
        const { username, password, mobileNumber } = req.body;
        // 1. Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        // Optional: Check if mobile number already exists if provided
        if (mobileNumber) {
            const existingMobileUser = await User.findOne({ mobileNumber });
            if (existingMobileUser) return res.status(400).json({ message: 'Mobile number already registered' });
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create and save the new user
        const user = new User({
            username,
            password: hashedPassword,
            mobileNumber: mobileNumber || null, // Store mobileNumber if provided, otherwise null
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

// POST /api/auth/forgot-password-request-otp - Request OTP for password reset
router.post('/forgot-password-request-otp', forgotPasswordRequestOtpValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => err.msg)
        });
    }

    try {
        const { mobileNumber } = req.body;

        const user = await User.findOne({ mobileNumber });
        if (!user) {
            // For security reasons, don't indicate if the mobile number exists or not
            return res.status(200).json({ message: 'If a matching account is found, an OTP will be sent.' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP via SMS (placeholder)
        await sendSMS(mobileNumber, `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`);

        res.status(200).json({ message: 'If a matching account is found, an OTP will be sent.' });

    } catch (err) {
        console.error('Error in forgot-password-request-otp:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// POST /api/auth/forgot-password-verify-otp-reset - Verify OTP and reset password
router.post('/forgot-password-verify-otp-reset', forgotPasswordVerifyOtpResetValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => err.msg)
        });
    }

    try {
        const { mobileNumber, otp, newPassword } = req.body;

        const user = await User.findOne({ mobileNumber });
        if (!user) {
            return res.status(400).json({ message: 'Invalid mobile number or OTP.' });
        }

        if (user.otp !== otp || user.otpExpires < new Date()) {
            user.otp = undefined; // Clear OTP on failed attempt
            user.otpExpires = undefined;
            await user.save();
            return res.status(400).json({ message: 'Invalid or expired OTP.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.otp = undefined; // Clear OTP after successful reset
        user.otpExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (err) {
        console.error('Error in forgot-password-verify-otp-reset:', err);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

module.exports = router;
