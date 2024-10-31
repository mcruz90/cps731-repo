const { verifyToken } = require('../utils/jwt');

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        // If no token is provided, return 401 Unauthorized
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify token
        const decoded = verifyToken(token);
        req.user = decoded;
        next();


    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};


// Role-based middleware -- Client, Practitioner, Admin, Staff
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};

// Activity middleware to track user activity and log them out if inactive for a certain amount of time
const activityMiddleware = (req, res, next) => {
    const currentTime = new Date();

    // Check if user is authenticated
    if (req.user) {
        // If user is active, update their last activity timestamp
        req.user.lastActivity = currentTime;

        // Calculate time since last activity
        const lastActivity = req.user.lastActivity;
        const timeSinceLastActivity = currentTime - lastActivity;

        // set 30 minutes as the time limit for user inactivity
        if (timeSinceLastActivity > 30 * 60 * 1000) {
            // Log user out by clearing the token 
            return res.status(401).json({ message: 'User has been inactive for too long' });
        }
    }

    next();
};

module.exports = { authMiddleware, requireRole, activityMiddleware };