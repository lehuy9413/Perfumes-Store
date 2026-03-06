const express = require('express');
const Brand = require('../models/Brand');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all brands (public)
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ brandName: 1 });
    res.json(brands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get brand by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create brand (admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { brandName, uri } = req.body;
    
    if (!brandName || brandName.trim() === '') {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ 
      brandName: { $regex: `^${brandName}$`, $options: 'i' } 
    });
    
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand already exists' });
    }

    const brand = new Brand({ 
      brandName: brandName.trim(),
      uri: uri || ''
    });
    const newBrand = await brand.save();
    res.status(201).json(newBrand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update brand (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { brandName, uri } = req.body;
    
    if (!brandName || brandName.trim() === '') {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Check if another brand with the same name exists
    const existingBrand = await Brand.findOne({ 
      _id: { $ne: req.params.id },
      brandName: { $regex: `^${brandName}$`, $options: 'i' } 
    });
    
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand name already exists' });
    }

    const updateData = { brandName: brandName.trim() };
    if (uri) updateData.uri = uri;

    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete brand (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
