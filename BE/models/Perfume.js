const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

const perfumeSchema = new Schema({
    perfumeName: { type: String, required: true },
    uri: { type: String, default: '' },
    price: { type: Number, required: true },
    concentration: { type: String, required: true },
    description: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    volume: { type: String, default: '' },
    targetAudience: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    comments: [commentSchema],
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Perfume', perfumeSchema);