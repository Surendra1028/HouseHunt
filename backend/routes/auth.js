const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, bio, upiId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }
    
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    if (role === 'admin') {
      return res.status(400).json({ message: 'Administrator registration is disabled.' });
    }
    
    user = new User({ name, email, password, role, phone, bio, upiId: upiId || '' });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key_123', { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, bio: user.bio, upiId: user.upiId }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Access denied: your account has been suspended by the administrator.' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret_key_123', { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, bio: user.bio, upiId: user.upiId }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, password, phone, bio, upiId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
      user.email = email.toLowerCase();
    }

    if (password) {
      user.password = password;
    }

    user.name = name || user.name;
    user.phone = phone !== undefined ? phone : user.phone;
    user.bio = bio !== undefined ? bio : user.bio;
    user.upiId = upiId !== undefined ? upiId : user.upiId;

    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      upiId: user.upiId
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

module.exports = router;
