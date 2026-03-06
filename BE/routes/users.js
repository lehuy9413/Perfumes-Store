const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all collectors (members) - Admin only - MUST BE FIRST
router.get('/collectors', adminAuth, async (req, res) => {
  try {
    console.log('\n=== GET COLLECTORS ===');
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);
    
    const collectors = await User.find({ role: 'member' }).select('-password').sort({ createdAt: -1 });
    console.log('Found collectors:', collectors.length);
    res.json(collectors);
  } catch (err) {
    console.error('Error fetching collectors:', err);
    res.status(500).json({ message: err.message });
  }
});

// Create a new collector - Admin only
router.post('/collectors', adminAuth, async (req, res) => {
  const { username, email, password, fullName, gender, yob } = req.body;
  try {
    console.log('\n=== CREATE COLLECTOR ===');
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      return res.status(400).json({ message: 'Username already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || '',
      gender: gender || undefined,
      yob: yob || undefined,
      role: 'member',
      authProvider: 'local',
      active: true,
    });

    await newUser.save();
    const userResponse = newUser.toObject();
    delete userResponse.password;
    console.log('✓ Collector created:', userResponse.email);
    res.status(201).json({ message: 'Collector created successfully', user: userResponse });
  } catch (err) {
    console.error('✗ Error creating collector:', err);
    res.status(500).json({ message: err.message });
  }
});

// Soft delete a collector (set active to false) - Admin only
router.patch('/:id/deactivate', adminAuth, async (req, res) => {
  try {
    console.log('\n=== DEACTIVATE COLLECTOR ===');
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot deactivate an admin account' });
    }
    user.active = false;
    await user.save();
    console.log('✓ User deactivated:', user.email);
    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    console.error('✗ Error deactivating user:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile - ONLY allow user to update their own profile
router.put('/profile', auth, async (req, res) => {
  const { fullName, email, gender, yob } = req.body;
  try {
    console.log('\n=== UPDATE PROFILE ===');
    console.log('User ID from token:', req.user._id);
    console.log('User Role:', req.user.role);
    console.log('Updating fields:', { fullName, email, gender, yob });
    
    // Only update fields that are actually provided and not empty
    const updateData = {};
    if (fullName !== undefined && fullName !== '') updateData.fullName = fullName;
    if (email !== undefined && email !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|io|co|vn|info|biz|me|us|uk|ca|au|de|fr|jp|kr|cn|in|br|ru|za)(\.[a-zA-Z]{2,3})?$/i;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      updateData.email = email;
    }
    if (gender !== undefined && gender !== '') updateData.gender = gender;
    if (yob !== undefined && yob !== '' && yob !== null) updateData.yob = yob;

    // ✅ IMPORTANT: Always use req.user._id (from JWT token)
    // User CANNOT update anyone else's profile
    const user = await User.findByIdAndUpdate(
      req.user._id,  // 🔐 From JWT token - Cannot be spoofed
      updateData, 
      { new: true }
    ).select('-password');
    
    console.log('✓ Profile updated successfully for user:', user.email);
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error('✗ Error updating profile:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// Change password - ONLY for current user's own password
router.put('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    console.log('\n=== CHANGE PASSWORD ===');
    console.log('User ID from token:', req.user._id);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Google/OAuth users cannot change password
    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'This account uses Google Sign-In and does not have a password.' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    console.log('Verifying old password...');
    const validPass = await bcrypt.compare(oldPassword, user.password);
    if (!validPass) {
      console.log('✗ Invalid old password');
      return res.status(400).json({ message: 'Invalid old password' });
    }

    console.log('✓ Old password verified');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    console.log('✓ Password changed successfully');
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('✗ Error changing password:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;