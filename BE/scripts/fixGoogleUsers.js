require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/asg_sdn');
  
  // Find Google users without fullName
  const users = await User.find({ 
    authProvider: 'google', 
    $or: [{ fullName: null }, { fullName: '' }, { fullName: { $exists: false } }]
  });
  
  console.log('Google users without fullName:', users.length);
  
  for (const user of users) {
    // Use username (which was set from Google name with _ replacing spaces) to restore fullName
    const fullName = user.username ? user.username.replace(/_/g, ' ') : user.email.split('@')[0];
    console.log(`  Fixing: ${user.email} -> fullName: "${fullName}"`);
    user.fullName = fullName;
    await user.save();
  }
  
  console.log('Done!');
  await mongoose.disconnect();
}

fix().catch(console.error);
