const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to generate token
const generateToken = (userId, role) => {
  return jwt.sign(
    { _id: userId, role: role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '30m' } // Token expires in 30 minutes
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('\n=== REGISTER REQUEST ===');
    console.log('Raw body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('Body keys:', Object.keys(req.body || {}));
    
    let { username, email, password, fullName, gender, yob } = req.body;
    
    // Trim whitespace
    if (username) username = username.trim();
    if (email) email = email.trim();
    if (password) password = password.trim();
    if (fullName) fullName = fullName.trim();
    
    console.log('After trim:', { username, email, passwordLength: password?.length });
    
    // Validate inputs - check for null, undefined, empty string
    if (!username || username === '') {
      console.log('✗ Username: MISSING or EMPTY');
      return res.status(400).json({ 
        message: 'Username is required',
        field: 'username'
      });
    }
    
    if (!email || email === '') {
      console.log('✗ Email: MISSING or EMPTY');
      return res.status(400).json({ 
        message: 'Email is required',
        field: 'email'
      });
    }
    
    if (!password || password === '') {
      console.log('✗ Password: MISSING or EMPTY');
      return res.status(400).json({ 
        message: 'Password is required',
        field: 'password'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|io|co|vn|info|biz|me|us|uk|ca|au|de|fr|jp|kr|cn|in|br|ru|za)(\.[a-zA-Z]{2,3})?$/i;
    if (!emailRegex.test(email)) {
      console.log('✗ Email format invalid:', email);
      return res.status(400).json({ 
        message: 'Invalid email format',
        received: email 
      });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('✗ Password too short:', password.length);
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters',
        received: password.length 
      });
    }

    // Validate username length
    if (username.length < 3) {
      console.log('✗ Username too short:', username.length);
      return res.status(400).json({ 
        message: 'Username must be at least 3 characters',
        received: username.length 
      });
    }

    console.log('✓ All validation passed');

    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      console.log(`✗ ${field} already exists`);
      return res.status(400).json({ 
        message: `${field} already exists`,
        field: field
      });
    }

    console.log('Creating hash...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Saving user to database...');
    const user = new User({ 
      username, 
      email, 
      password: hashedPassword,
      fullName: fullName || '',
      gender: gender || 'Male',
      yob: yob ? parseInt(yob) : null,
      authProvider: 'local'
    });
    await user.save();
    
    console.log('✓ User registered successfully:', email);
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        yob: user.yob
      }
    });
  } catch (err) {
    console.error('✗ Register error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
});

// Login with email/username and password
router.post('/login', async (req, res) => {
  try {
    console.log('\n=== LOGIN REQUEST ===');
    console.log('Raw body:', req.body);
    
    let { identifier, password } = req.body;
    
    // Trim whitespace
    if (identifier) identifier = identifier.trim();
    if (password) password = password.trim();
    
    console.log('After trim:', { identifier, passwordLength: password?.length });
    
    if (!identifier || identifier === '') {
      console.log('✗ Identifier: MISSING or EMPTY');
      return res.status(400).json({ 
        message: 'Email or Username is required',
        field: 'identifier'
      });
    }
    
    if (!password || password === '') {
      console.log('✗ Password: MISSING or EMPTY');
      return res.status(400).json({ 
        message: 'Password is required',
        field: 'password'
      });
    }

    console.log('Finding user by:', identifier);
    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    });

    if (!user) {
      console.log('✗ User not found for identifier:', identifier);
      return res.status(400).json({ message: 'Incorrect email or password' });
    }

    console.log('✓ User found:', user.email);

    // Check if user has a password (local login)
    if (!user.password) {
      console.log('✗ User has no password (Google login)');
      return res.status(400).json({ message: 'This account uses Google login. Please use Google Sign-In.' });
    }

    // Validate password
    console.log('Comparing passwords...');
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      console.log('✗ Invalid password for user:', identifier);
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    console.log('✓ Password valid');

    // Generate token
    const token = generateToken(user._id, user.role);

    console.log('✓ User logged in successfully:', identifier);
    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        gender: user.gender,
        yob: user.yob,
        role: user.role,
        authProvider: user.authProvider
      }
    });
  } catch (err) {
    console.error('✗ Login error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
    });
  }
});

// Google OAuth Login (via access_token from useGoogleLogin hook)
router.post('/google-token', async (req, res) => {
  const { access_token } = req.body;
  try {
    if (!access_token) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    // Fetch user info from Google
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    if (!response.ok) {
      return res.status(401).json({ message: 'Invalid Google access token' });
    }
    const { sub: googleId, email, name } = await response.json();

    if (!email) {
      return res.status(401).json({ message: 'Could not retrieve email from Google' });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        username: name.replace(/\s+/g, '_'),
        fullName: name,
        googleId,
        authProvider: 'google'
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.authProvider = 'google';
      if (!user.fullName) user.fullName = name;
      await user.save();
    }

    const jwtToken = generateToken(user._id, user.role);

    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || name,
        role: user.role,
        gender: user.gender,
        yob: user.yob,
        authProvider: user.authProvider
      }
    });
  } catch (err) {
    console.error('Google token auth error:', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

// Google OAuth Login (via ID token from GoogleLogin component — legacy)
router.post('/google', async (req, res) => {
  const { token } = req.body;
  try {
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with Google info
      user = new User({
        email,
        username: name.replace(/\s+/g, '_'),
        fullName: name,
        googleId,
        authProvider: 'google'
      });
      await user.save();
    } else if (!user.googleId) {
      // Link Google account to existing email user
      user.googleId = googleId;
      user.authProvider = 'google';
      if (!user.fullName) user.fullName = name;
      await user.save();
    }

    // Generate JWT token
    const jwtToken = generateToken(user._id, user.role);

    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || name,
        role: user.role,
        gender: user.gender,
        yob: user.yob,
        authProvider: user.authProvider
      }
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

module.exports = router;