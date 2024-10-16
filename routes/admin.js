const express = require('express');
const rateLimit = require('express-rate-limit'); // Import rate limiting middleware
const router = express.Router();
const authenticateToken = require('../middleware/auth').authenticateToken; // Import middleware to authenticate
const isAdmin = require('../middleware/auth').isAdmin; // Import middleware to check admin role
const Winner = require('../models/Winner'); // Import Winner model
const Purchase = require('../models/Purchase'); // Import Purchase model
const User = require('../models/User'); // Import User model

// Set up rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Apply rate limiting to all admin routes
router.use(limiter);

// Route to manually add a winner (admin only)
router.post('/add-winner', authenticateToken, isAdmin, async (req, res) => {
  console.log('Accessing /add-winner route'); // Debug log

  try {
    const { username, month, amount } = req.body;
    console.log('Request body:', req.body); // Debug log

    // Create a new Winner document using the Winner model
    const newWinner = new Winner({
      username,
      month,
      amount,
    });

    await newWinner.save();
    console.log('New winner saved successfully'); // Debug log

    res.status(201).json({ message: 'Monthly winner added successfully' });
  } catch (error) {
    console.error('Error adding monthly winner:', error);
    res.status(500).json({ error: 'Failed to add monthly winner' });
  }
});

// Route to manually trigger winner selection (admin only)
router.post('/pick-winner', authenticateToken, isAdmin, async (req, res) => {
  console.log('Accessing /pick-winner route'); // Debug log

  try {
    // Call your pickMonthlyWinner function (imported or added here if needed)
    await pickMonthlyWinner(); 
    console.log('Monthly winner picked successfully'); // Debug log

    res.status(200).json({ message: 'Monthly winner picked successfully' });
  } catch (error) {
    console.error('Error picking monthly winner:', error);
    res.status(500).json({ error: 'Failed to pick monthly winner' });
  }
});

// Admin stats route (admin only)
router.get('/stats', authenticateToken, isAdmin, async (req, res) => {
  console.log('Accessing /stats route'); // Debug log

  try {
    // Fetch some stats (e.g., number of winners and purchases)
    console.log('Fetching stats for winners and purchases'); // Debug log
    const totalWinners = await Winner.countDocuments();
    console.log('Total winners:', totalWinners); // Debug log
    const totalPurchases = await Purchase.countDocuments();
    console.log('Total purchases:', totalPurchases); // Debug log
    
    // Send the stats as response
    res.status(200).json({
      totalWinners,
      totalPurchases,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Admin route to get detailed purchase data (admin only)
router.get('/purchases', authenticateToken, isAdmin, async (req, res) => {
  console.log('Accessing /purchases route'); // Debug log

  try {
    const purchases = await Purchase.find();
    console.log('Fetched purchase data:', purchases); // Debug log

    res.status(200).json(purchases);
  } catch (error) {
    console.error('Error fetching purchase data:', error);
    res.status(500).json({ error: 'Failed to fetch purchase data' });
  }
});

// Admin route to get all users (admin only)
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
  console.log('Accessing /users route'); // Debug log

  try {
    const users = await User.find();
    console.log('Fetched user data:', users); // Debug log

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin route to delete a user (admin only)
router.delete('/users/:userId', authenticateToken, isAdmin, async (req, res) => {
  console.log('Accessing /users/:userId route'); // Debug log

  try {
    const userId = req.params.userId;
    await User.findByIdAndDelete(userId);
    console.log('User deleted successfully'); // Debug log

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Admin route to update a user's role (admin only)
router.put('/users/:userId/role', authenticateToken, isAdmin, async (req, res) => {
  console.log('Accessing /users/:userId/role route'); // Debug log

  try {
    const userId = req.params.userId;
    const { role } = req.body;
    console.log('Updating user role:', userId, role); // Debug log

    const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });
    console.log('User role updated successfully:', updatedUser); // Debug log

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

module.exports = router;