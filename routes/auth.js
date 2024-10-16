// backend/routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User'); // Import the User model

// Secret key for JWT (In real use, store this securely, like in a .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Received login request with email:', email); // Log received email

    // Check if the user exists
    const user = await User.findOne({ email });
    console.log('User found in DB:', user); // Log the user fetched from the DB

    if (!user) {
      console.log('User not found in database.');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch); // Log result of password comparison

    if (!isMatch) {
      console.log('Password does not match.');
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT token:', token); // Log the generated JWT token

    res.json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route (Client-side can just discard the token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
