const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, sparse: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  fullName: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  yob: { type: Number }, // Year of birth
  googleId: { type: String, sparse: true },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  role: { type: String, default: 'member' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);