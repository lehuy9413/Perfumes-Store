const express = require('express');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Add or update feedback (only members)
router.post('/', auth, async (req, res) => {
  const { perfumeId, rating, comment } = req.body;
  
  try {
    console.log('\n=== CREATE/UPDATE FEEDBACK ===');
    console.log('User:', req.user._id);
    console.log('User Role:', req.user.role);
    console.log('Perfume:', perfumeId);
    console.log('Rating:', rating);
    
    // ✅ Only members can post feedback, Admin cannot
    if (req.user.role !== 'member') {
      return res.status(403).json({ 
        message: 'Only members can leave feedback. Admins can only view feedback.' 
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 3) {
      return res.status(400).json({ message: 'Rating must be between 1 and 3' });
    }

    // Comment is optional - user can just rate without comment
    const updateData = { rating, updatedAt: new Date() };
    if (comment && comment.trim().length > 0) {
      updateData.comment = comment.trim();
    }

    const feedback = await Feedback.findOneAndUpdate(
      { userId: req.user._id, perfumeId },
      updateData,
      { new: true, upsert: true }
    ).populate('userId', 'fullName email username role').populate('perfumeId', 'perfumeName price');

    console.log('✓ Feedback created/updated:', feedback._id);
    res.json(feedback);
  } catch (err) {
    console.error('✗ Feedback error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You already rated this perfume once. You cannot rate again.' });
    }
    res.status(400).json({ message: err.message });
  }
});

// Get all feedbacks for a specific perfume (public)
router.get('/perfume/:perfumeId', async (req, res) => {
  try {
    const { perfumeId } = req.params;
    console.log('\n=== GET PERFUME FEEDBACKS ===');
    console.log('Perfume ID:', perfumeId);
    
    const feedbacks = await Feedback.find({ perfumeId })
      .populate({
        path: 'userId',
        select: 'fullName email username'
      })
      .populate({
        path: 'perfumeId',
        select: 'perfumeName price'
      })
      .sort({ createdAt: -1 });
    
    console.log('✓ Found feedbacks:', feedbacks.length);
    console.log('Feedbacks:', JSON.stringify(feedbacks, null, 2));
    
    res.json(feedbacks);
  } catch (err) {
    console.error('✗ Error fetching perfume feedbacks:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Get user's all feedbacks (members only)
router.get('/', auth, async (req, res) => {
  try {
    console.log('Getting feedbacks for user:', req.user._id);
    
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .populate('perfumeId', 'perfumeName price')
      .sort({ createdAt: -1 });
    
    res.json(feedbacks);
  } catch (err) {
    console.error('Error fetching user feedbacks:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Delete feedback (members only)
router.delete('/:feedbackId', auth, async (req, res) => {
  try {
    console.log('\n=== DELETE FEEDBACK ===');
    console.log('Feedback ID:', req.params.feedbackId);
    console.log('User ID:', req.user._id);

    const feedback = await Feedback.findById(req.params.feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if the user owns this feedback
    if (feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only delete your own feedback' });
    }

    await Feedback.findByIdAndDelete(req.params.feedbackId);
    
    console.log('✓ Feedback deleted successfully');
    res.json({ message: 'Feedback deleted successfully' });
  } catch (err) {
    console.error('✗ Error deleting feedback:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// Update feedback (members only)
router.put('/:feedbackId', auth, async (req, res) => {
  try {
    console.log('\n=== UPDATE FEEDBACK ===');
    console.log('Feedback ID:', req.params.feedbackId);
    console.log('User ID:', req.user._id);

    const { rating, comment } = req.body;

    const feedback = await Feedback.findById(req.params.feedbackId);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if the user owns this feedback
    if (feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own feedback' });
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 3)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 3' });
    }

    // Validate comment
    if (comment && comment.trim().length === 0) {
      return res.status(400).json({ message: 'Comment cannot be empty' });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.feedbackId,
      { 
        rating: rating || feedback.rating, 
        comment: comment ? comment.trim() : feedback.comment,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'fullName email username role').populate('perfumeId', 'perfumeName price');

    console.log('✓ Feedback updated:', updatedFeedback._id);
    res.json(updatedFeedback);
  } catch (err) {
    console.error('✗ Error updating feedback:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;