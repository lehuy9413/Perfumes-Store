const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = verified;
    next();
  } catch (err) {
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

module.exports = auth;