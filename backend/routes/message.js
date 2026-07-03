const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Lease = require('../models/Lease');
const Property = require('../models/Property');
const { auth } = require('../middleware/auth');

// Get contact list (users who have leases or message history)
router.get('/contacts', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    let contactIds = new Set();

    // 1. Get contacts from active leases
    if (req.user.role === 'landlord') {
      const properties = await Property.find({ owner: userId });
      const propertyIds = properties.map(p => p._id);
      const leases = await Lease.find({ property: { $in: propertyIds }, status: 'active' });
      leases.forEach(l => contactIds.add(l.tenant.toString()));
    } else {
      const leases = await Lease.find({ tenant: userId, status: 'active' }).populate('property');
      leases.forEach(l => {
        if (l.property && l.property.owner) {
          contactIds.add(l.property.owner.toString());
        }
      });
    }

    // 2. Get contacts from message history
    const historicalMessages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    });

    historicalMessages.forEach(msg => {
      if (msg.sender.toString() !== userId.toString()) contactIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId.toString()) contactIds.add(msg.receiver.toString());
    });

    // 3. Fetch user details for all contacts
    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } }).select('name email role phone');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get chat history with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message body are required' });
    }

    const newMessage = new Message({
      sender: req.user._id,
      receiver: receiverId,
      message
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
