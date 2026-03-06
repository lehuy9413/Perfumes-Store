const express = require('express');
const Perfume = require('../models/Perfume');
const Brand = require('../models/Brand');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// SEED DATA - Remove this after testing
router.post('/seed-data', async (req, res) => {
  try {
    // Clear existing data
    await Brand.deleteMany({});
    await Perfume.deleteMany({});

    // Create brands
    const brandsData = [
      { brandName: 'Chanel' },
      { brandName: 'Dior' },
      { brandName: 'Tom Ford' },
      { brandName: 'Gucci' },
      { brandName: 'Givenchy' },
      { brandName: 'Giorgio Armani' },
      { brandName: 'Versace' },
      { brandName: 'Le Labo' },
      { brandName: 'Creed' },
      { brandName: 'Viktor & Rolf' },
      { brandName: 'Maison Francis Kurkdjian' },
      { brandName: 'Maison Margiela' },
      { brandName: 'Yves Saint Laurent' }
    ];

    const brands = await Brand.insertMany(brandsData);
    console.log('Brands created:', brands.map(b => ({ id: b._id.toString(), name: b.brandName })));

    // Create perfumes with correct brand references
    

    const perfumes = await Perfume.insertMany(perfumesData);
    console.log('Perfumes created:', perfumes.length);
    console.log('Perfumes:', perfumes.map(p => ({ id: p._id.toString(), name: p.perfumeName, brand: p.brand.toString() })));

    // Verify data
    const allBrands = await Brand.find();
    const allPerfumes = await Perfume.find().populate('brand');
    console.log('Verification:');
    console.log('Total Brands:', allBrands.length);
    console.log('Total Perfumes:', allPerfumes.length);
    allPerfumes.forEach(p => {
      console.log(`- ${p.perfumeName} -> Brand: ${p.brand?.brandName || 'NO BRAND'}`);
    });

    res.json({ 
      message: 'Seed data created successfully', 
      brands: brands.length, 
      perfumes: perfumes.length,
      details: {
        brands: brands.map(b => ({ id: b._id.toString(), name: b.brandName })),
        perfumesCount: perfumes.length,
        perfumesByBrand: allPerfumes.reduce((acc, p) => {
          const brandName = p.brand?.brandName || 'Unknown';
          acc[brandName] = (acc[brandName] || 0) + 1;
          return acc;
        }, {})
      }
    });
  } catch (err) {
    console.error('Error seeding data:', err);
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// DEBUG endpoint - Check all data
router.get('/debug/all-data', async (req, res) => {
  try {
    const brands = await Brand.find();
    const perfumes = await Perfume.find().populate('brand');
    
    console.log('DEBUG: All Brands:', brands);
    console.log('DEBUG: All Perfumes:', perfumes);
    
    res.json({
      brands: brands.map(b => ({ _id: b._id.toString(), brandName: b.brandName })),
      perfumes: perfumes.map(p => ({ 
        _id: p._id.toString(),
        perfumeName: p.perfumeName,
        brand: p.brand ? { _id: p.brand._id.toString(), brandName: p.brand.brandName } : null,
        brandRef: p.brand ? p.brand._id.toString() : 'NO BRAND'
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// SEED DATA - Remove this after testing

// Get all brands - MUST BE BEFORE /:id route
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await Brand.find().sort({ brandName: 1 });
    console.log('Brands fetched:', brands);
    res.json(brands);
  } catch (err) {
    console.error('Error fetching brands:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get all perfumes with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, brand, minPrice, maxPrice, targetAudience, concentration } = req.query;
    let query = {};
    
    // Search across multiple fields: name, description, ingredients
    if (search) {
      query.$or = [
        { perfumeName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { ingredients: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by brand
    if (brand) {
      if (brand.match(/^[0-9a-fA-F]{24}$/)) {
        query.brand = brand;
      } else {
        const brandDoc = await Brand.findOne({ brandName: { $regex: `^${brand}$`, $options: 'i' } });
        if (brandDoc) {
          query.brand = brandDoc._id;
        } else {
          return res.json([]);
        }
      }
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filter by target audience (Men, Women, Unisex)
    if (targetAudience) {
      query.targetAudience = { $regex: `^${targetAudience}$`, $options: 'i' };
    }
    
    // Filter by concentration
    if (concentration) {
      query.concentration = { $regex: concentration, $options: 'i' };
    }
    
    const perfumes = await Perfume.find(query)
      .populate('brand')
      .sort({ isFeatured: -1, createdAt: -1 });
    
    res.json(perfumes);
  } catch (err) {
    console.error('Error fetching perfumes:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get perfume by id with comments
router.get('/:id', async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id).populate('brand').populate('comments.user', 'fullName email');
    if (!perfume) return res.status(404).json({ message: 'Perfume not found' });
    res.json(perfume);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new perfume (admin only)
router.post('/', adminAuth, async (req, res) => {
  const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, isFeatured, brand } = req.body;
  try {
    const perfume = new Perfume({
      perfumeName,
      uri,
      price,
      concentration,
      description,
      ingredients,
      volume,
      targetAudience,
      isFeatured,
      brand,
    });
    const newPerfume = await perfume.save();
    res.status(201).json(newPerfume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update perfume (admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) return res.status(404).json({ message: 'Perfume not found' });
    
    const { perfumeName, uri, price, concentration, description, ingredients, volume, targetAudience, isFeatured, brand } = req.body;
    if (perfumeName) perfume.perfumeName = perfumeName;
    if (uri) perfume.uri = uri;
    if (price) perfume.price = price;
    if (concentration) perfume.concentration = concentration;
    if (description) perfume.description = description;
    if (ingredients) perfume.ingredients = ingredients;
    if (volume) perfume.volume = volume;
    if (targetAudience) perfume.targetAudience = targetAudience;
    if (isFeatured !== undefined) perfume.isFeatured = isFeatured;
    if (brand) perfume.brand = brand;
    
    const updatedPerfume = await perfume.save();
    res.json(updatedPerfume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete perfume (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const perfume = await Perfume.findByIdAndDelete(req.params.id);
    if (!perfume) return res.status(404).json({ message: 'Perfume not found' });
    res.json({ message: 'Perfume deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment to perfume
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const perfume = await Perfume.findById(req.params.id);
    if (!perfume) return res.status(404).json({ message: 'Perfume not found' });
    
    const { comment, rating } = req.body;
    const newComment = {
      user: req.user._id || req.user.id,
      comment,
      rating,
    };
    
    perfume.comments.push(newComment);
    const updatedPerfume = await perfume.save().then(p => p.populate('comments.user', 'fullName email'));
    res.json(updatedPerfume);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;