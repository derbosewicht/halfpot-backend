// backend/models/leaderboard.js
const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  month: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);
