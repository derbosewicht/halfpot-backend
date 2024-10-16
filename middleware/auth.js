// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Use an environment variable or a default value

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer'

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided.' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    try {
      // Find the user by ID
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      req.user = user; // Store user data in request for further use
      next(); // Call next middleware or route handler
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ message: 'Server error.' });
    }
  });
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied, admin privileges required.' });
  }
  next(); // If the user is admin, continue to the next middleware or route handler
};

module.exports = { authenticateToken, isAdmin };
