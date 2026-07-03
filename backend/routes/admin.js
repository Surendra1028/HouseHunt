const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

// Apply Admin-only access restriction globally to this router
router.use(auth, authorize('admin'));

// 1. Get all users with filters
router.get('/users', async (req, res) => {
  try {
    let query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Block/Unblock a user
router.put('/users/:id/block', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    if (isBlocked === undefined) {
      return res.status(400).json({ message: 'isBlocked status is required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block administrative accounts' });
    }

    user.isBlocked = isBlocked;
    await user.save();

    // Notify user about action
    const notification = new Notification({
      user: user._id,
      title: isBlocked ? 'Account Suspended' : 'Account Reinstated',
      message: isBlocked 
        ? 'Your HouseHunt account has been suspended due to violations of our platform rules.' 
        : 'Your HouseHunt account has been reinstated. You can log in normally.'
    });
    await notification.save();

    res.json({ message: `User account has been ${isBlocked ? 'suspended' : 'reinstated'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Platform statistics & dashboard metrics
router.get('/stats', async (req, res) => {
  try {
    const totalTenants = await User.countDocuments({ role: 'tenant' });
    const totalLandlords = await User.countDocuments({ role: 'landlord' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    const approvedProps = await Property.countDocuments({ isApproved: true });
    const pendingProps = await Property.countDocuments({ isApproved: false });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });

    // Aggregate lifetime paid rent revenue
    const revenueAggregate = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const lifetimeRevenue = revenueAggregate.length > 0 ? revenueAggregate[0].total : 0;

    // Fetch recent events for logs feed
    const recentRegistrations = await User.find().select('name role email createdAt').sort({ createdAt: -1 }).limit(5);
    const recentProperties = await Property.find().populate('owner', 'name').sort({ createdAt: -1 }).limit(5);
    const recentBookings = await Booking.find().populate('tenant', 'name').populate('property', 'title').sort({ createdAt: -1 }).limit(5);

    res.json({
      users: { tenants: totalTenants, landlords: totalLandlords, admins: totalAdmins },
      properties: { approved: approvedProps, pending: pendingProps, total: approvedProps + pendingProps },
      bookings: { total: totalBookings, pending: pendingBookings, approved: approvedBookings },
      revenue: lifetimeRevenue,
      logs: {
        registrations: recentRegistrations,
        properties: recentProperties,
        bookings: recentBookings
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Send platform-wide announcement/notification
router.post('/announcements', async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message text are required' });
    }

    const announcement = new Notification({
      user: null, // Null indicates global announcement
      title,
      message
    });

    await announcement.save();
    res.status(201).json({ message: 'Global announcement published successfully', announcement });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Approve/Unapprove property listing
router.put('/properties/:id/approve', async (req, res) => {
  try {
    const { isApproved } = req.body;
    if (isApproved === undefined) {
      return res.status(400).json({ message: 'isApproved field is required' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property listing not found' });
    }

    property.isApproved = isApproved;
    await property.save();

    // Trigger Notification to Landlord
    const notification = new Notification({
      user: property.owner,
      title: isApproved ? 'Property Listing Approved' : 'Property Listing Rejected',
      message: isApproved 
        ? `Your property listing "${property.title}" has been approved and is now active on HouseHunt.` 
        : `Your property listing "${property.title}" has been unapproved or rejected by the administrator.`
    });
    await notification.save();

    res.json({ message: `Property listing status updated to ${isApproved ? 'Approved' : 'Unapproved'}`, property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
