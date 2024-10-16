// backend/models/Purchase.js

const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  potAmount: {
    type: Number,
    required: true,
  },
}, { timestamps: true }); // Automatically adds `createdAt` and `updatedAt` fields

module.exports = mongoose.model('Purchase', PurchaseSchema);
