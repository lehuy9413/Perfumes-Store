const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
  try {
    console.log('\n=== ADMIN AUTH MIDDLEWARE ===');
    console.log('Path:', req.path);
    console.log('Authorization Header:', req.header('Authorization'));
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    console.log('Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('✗ No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('✓ Token verified');
    console.log('User ID:', verified._id);
    console.log('User Role:', verified.role);
    
    // Check if user has admin role
    if (verified.role !== 'admin') {
      console.log('✗ User is not admin, role:', verified.role);
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
    
    console.log('✓ Admin access granted');
    req.user = verified;
    next();
  } catch (err) {
    console.error('✗ Admin auth error:', err.message);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Session expired. Please login again.',
        error: 'TOKEN_EXPIRED'
      });
    }
    res.status(401).json({ 
      message: 'Invalid token', 
      error: err.message 
    });
  }
};

module.exports = adminAuth;


