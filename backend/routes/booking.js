const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const Notification = require('../models/Notification');
const { auth, authorize } = require('../middleware/auth');

// Get bookings list based on role
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'tenant') {
      // Tenants see bookings they requested
      const bookings = await Booking.find({ tenant: req.user._id })
        .populate('property')
        .populate({ path: 'property', populate: { path: 'owner', select: 'name email phone' } })
        .sort({ visitDate: 1 });
      res.json(bookings);
    } else if (req.user.role === 'landlord') {
      // Landlords see booking requests for properties they own
      const properties = await Property.find({ owner: req.user._id });
      const propertyIds = properties.map(p => p._id);
      
      const bookings = await Booking.find({ property: { $in: propertyIds } })
        .populate('tenant', 'name email phone')
        .populate('property', 'title address rent')
        .sort({ visitDate: 1 });
      res.json(bookings);
    } else if (req.user.role === 'admin') {
      // Admins see all bookings
      const bookings = await Booking.find()
        .populate('tenant', 'name email phone')
        .populate('property', 'title address rent')
        .populate({ path: 'property', populate: { path: 'owner', select: 'name email phone' } })
        .sort({ visitDate: -1 });
      res.json(bookings);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Request a house visit booking (Tenant only)
router.post('/', auth, authorize('tenant'), async (req, res) => {
  try {
    const { propertyId, visitDate, visitTime, message } = req.body;
    if (!propertyId || !visitDate || !visitTime) {
      return res.status(400).json({ message: 'Property ID, date, and time are required' });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const booking = new Booking({
      tenant: req.user._id,
      property: propertyId,
      visitDate,
      visitTime,
      message: message || ''
    });

    await booking.save();

    // Trigger Notification to Landlord
    const notification = new Notification({
      user: property.owner,
      title: 'New Visit Booking Request',
      message: `Tenant ${req.user.name} has requested a visit to your property "${property.title}" on ${new Date(visitDate).toLocaleDateString()} at ${visitTime}.`
    });
    await notification.save();

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update booking status (Landlord or Admin only)
router.put('/:id', auth, authorize('landlord', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status update request' });
    }

    const booking = await Booking.findById(req.params.id).populate('property');
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    // Verify ownership or Admin role
    if (req.user.role === 'landlord' && booking.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: not your property listing' });
    }

    booking.status = status;
    await booking.save();

    let autoLeaseMsg = '';
    if (status === 'approved') {
      const Lease = require('../models/Lease');
      const Invoice = require('../models/Invoice');
      const Property = require('../models/Property');

      // Create lease automatically
      const startDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year lease

      const lease = new Lease({
        tenant: booking.tenant,
        property: booking.property._id,
        rentAmount: booking.property.rent,
        startDate,
        endDate
      });
      await lease.save();

      // Mark property as occupied
      await Property.findByIdAndUpdate(booking.property._id, { status: 'occupied' });

      // Generate first invoice due in 7 days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const invoice = new Invoice({
        tenant: booking.tenant,
        property: booking.property._id,
        lease: lease._id,
        amount: booking.property.rent,
        dueDate
      });
      await invoice.save();
      autoLeaseMsg = ' A new active lease contract has been automatically registered and generated for this property.';
    }

    // Trigger Notification to Tenant
    const notification = new Notification({
      user: booking.tenant,
      title: `Visit Booking Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your visit booking request for property "${booking.property.title}" has been ${status} by the landlord.${autoLeaseMsg}`
    });
    await notification.save();

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Clear/Delete a booking request (Tenant only)
router.delete('/:id', auth, authorize('tenant'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    // Verify ownership
    if (booking.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: not your booking request' });
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking history item cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
