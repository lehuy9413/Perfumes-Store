const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  perfumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Perfume', required: true },
  rating: { type: Number, required: true, min: 1, max: 3 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Ensure one feedback per user per perfume
feedbackSchema.index({ userId: 1, perfumeId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);