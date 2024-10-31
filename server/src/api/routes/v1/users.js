const express = require('express');
const router = express.Router();
const { authMiddleware, activityMiddleware } = require('../middleware/auth');
const User = require('../../models/User');

// Apply authentication and activity middleware to all routes
router.use(authMiddleware);
router.use(activityMiddleware);

// Get all users
router.get('/', async (req, res) => {
  try {

    // fetch all users from database
    const users = await User.find();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // fetch user by id from database
    const user = await User.findById(id);
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    // fetch user data from request body
    const { email, password, role } = req.body;

    // create new user in database
    const user = await User.create({ email, password, role });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    // fetch user data from request body
    const { id } = req.params;
    const { email, password, role } = req.body;
    const user = await User.findById(id)

    // update user in database
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // update user in database
    user.email = email;
    user.password = password;
    user.role = role;
    await user.save();
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    // delete user from database
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;