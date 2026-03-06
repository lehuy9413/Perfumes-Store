const mongoose = require('mongoose');
const brandSchema = new mongoose.Schema(
  { 
    brandName: String,
    uri: { type: String, default: '' }
  },
  { timestamps: true, collection: 'brands' }
);

module.exports = mongoose.model('Brand', brandSchema);