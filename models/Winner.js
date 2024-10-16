// backend/models/Winner.js

const mongoose = require('mongoose');

const WinnerSchema = new mongoose.Schema({
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
}, { timestamps: true }); // Adds `createdAt` and `updatedAt` fields automatically

module.exports = mongoose.model('Winner', WinnerSchema);
