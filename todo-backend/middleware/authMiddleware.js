// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET exists
if (!JWT_SECRET) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
}

const protect = (req, res, next) => {
    let token;

    // 1. Check if the token is present in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token using the secret key
            const decoded = jwt.verify(token, JWT_SECRET);

            // 3. Attach the user ID to the request object for use in routes
            req.userId = decoded.id; 
            
            // Move on to the next function (the actual route logic)
            next(); 

        } catch (error) {
            // If verification fails or token is invalid
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
