const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { authenticateToken, isAdmin } = require('./middleware/auth'); // Import the updated auth middleware
const mongoose = require('mongoose'); // Import Mongoose
const Purchase = require('./models/Purchase');
const Winner = require('./models/Winner'); // Import the Winner model
const cron = require('node-cron'); // Import node-cron for scheduling
const adminRoutes = require('./routes/admin');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection String
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/halfpot';

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

  // Set CORS for production domain only
const corsOptions = {
  origin: 'https://your-production-domain.com', // Replace with your actual production domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});


// Apply rate limiter to admin routes
app.use('/admin', limiter);

// Sample route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Mount the admin routes
app.use('/admin', adminRoutes);

// Leaderboard route to fetch monthly winners
app.get('/leaderboard', async (req, res) => {
  try {
    // Fetch all winners from the database, sorted by month in ascending order
    const winners = await Winner.find().sort({ month: 1 });
    res.json(winners);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard data' });
  }
});

// Route to add a monthly winner to the leaderboard (protected for admins)
app.post('/add-winner', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { username, month, amount } = req.body;

    // Create a new Winner document using the Winner model
    const newWinner = new Winner({
      username,
      month,
      amount,
    });

    await newWinner.save();

    res.status(201).json({ message: 'Monthly winner added successfully' });
  } catch (error) {
    console.error('Error adding monthly winner:', error);
    res.status(500).json({ error: 'Failed to add monthly winner' });
  }
});

// Function to pick a random winner
async function pickMonthlyWinner() {
  try {
    // Get current month's purchases
    const purchases = await Purchase.find({
      createdAt: {
        $gte: new Date(new Date().setDate(1)), // Start of the month
        $lte: new Date(), // Current date
      }
    });

    if (purchases.length === 0) {
      console.log("No purchases found for this month");
      return;
    }

    // Pick a random purchase as the winner
    const randomIndex = Math.floor(Math.random() * purchases.length);
    const winnerPurchase = purchases[randomIndex];

    // Create new winner entry
    const newWinner = new Winner({
      username: winnerPurchase.username,
      month: new Date().toLocaleString('default', { month: 'long' }),
      amount: winnerPurchase.potAmount,
    });

    await newWinner.save();

    console.log(`Winner for the month ${newWinner.month}: ${newWinner.username}`);
  } catch (error) {
    console.error('Error picking monthly winner:', error);
  }
}

// Schedule to pick a winner on the 1st of every month at midnight
cron.schedule('0 0 1 * *', pickMonthlyWinner);

// Sample route to manually trigger winner selection (protected for admins)
app.post('/pick-winner', authenticateToken, isAdmin, async (req, res) => {
  try {
    await pickMonthlyWinner();
    res.status(200).json({ message: 'Monthly winner picked successfully' });
  } catch (error) {
    console.error('Error picking monthly winner:', error);
    res.status(500).json({ error: 'Failed to pick monthly winner' });
  }
});

// Import the auth routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Protect the purchase route using the authenticateToken middleware
app.post('/purchase', authenticateToken, async (req, res) => {
  try {
    // Destructure the username and potAmount from the request body
    const { username, potAmount } = req.body;

    // Create a new Purchase document using the Purchase model
    const newPurchase = new Purchase({
      username,
      potAmount,
    });

    // Save the new purchase to the MongoDB database
    await newPurchase.save();

    // Send a success response
    res.status(201).json({ message: 'Digital sticker purchased successfully' });
  } catch (error) {
    // Log the error and send a response with a 500 status code
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'An error occurred while purchasing the sticker' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});