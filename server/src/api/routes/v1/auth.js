const express = require('express');
const router = express.Router();
const { generateToken } = require('../../utils/jwt');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

// Helper function to validate user
const validateUser = async (email, password) => {
    const user = await User.findOne({ where: { email } });
    
    // If user not found, return null
    if (!user) return null;

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    // Return user if password is correct, otherwise return null
    return isMatch ? user : null;
};

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate user
        const user = await validateUser(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate token
        const token = generateToken(user);

        
        res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            lastActivity: user.lastActivity
        }
    });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});

module.exports = router;