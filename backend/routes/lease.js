const express = require('express');
const router = express.Router();
const Lease = require('../models/Lease');
const Property = require('../models/Property');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const { auth, authorize } = require('../middleware/auth');

// Get tenant's active lease
router.get('/my-lease', auth, authorize('tenant'), async (req, res) => {
  try {
    const lease = await Lease.findOne({ tenant: req.user._id, status: 'active' })
      .populate('property')
      .populate({ path: 'property', populate: { path: 'owner', select: 'name email phone upiId' } });
    
    if (!lease) {
      return res.status(404).json({ message: 'No active lease found' });
    }
    res.json(lease);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get landlord's active leases
router.get('/landlord', auth, authorize('landlord'), async (req, res) => {
  try {
    // Find properties owned by the landlord
    const properties = await Property.find({ owner: req.user._id });
    const propertyIds = properties.map(p => p._id);

    // Find leases associated with those properties
    const leases = await Lease.find({ property: { $in: propertyIds } })
      .populate('tenant', 'name email phone')
      .populate('property', 'title address rent');

    res.json(leases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a lease (Landlord only)
router.post('/', auth, authorize('landlord'), async (req, res) => {
  try {
    const { tenantEmail, propertyId, rentAmount, startDate, endDate } = req.body;
    if (!tenantEmail || !propertyId || !rentAmount || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Find tenant by email
    const tenant = await User.findOne({ email: tenantEmail.toLowerCase() });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found. Make sure they have registered an account.' });
    }
    if (tenant.role !== 'tenant') {
      return res.status(400).json({ message: 'Target user is not a tenant' });
    }

    // Find property & verify ownership
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: not your property' });
    }
    if (property.status === 'occupied') {
      return res.status(400).json({ message: 'Property is already occupied' });
    }

    // Check if tenant already has an active lease
    const activeLease = await Lease.findOne({ tenant: tenant._id, status: 'active' });
    if (activeLease) {
      return res.status(400).json({ message: 'Tenant already has an active lease elsewhere' });
    }

    // Create the Lease
    const lease = new Lease({
      tenant: tenant._id,
      property: propertyId,
      rentAmount,
      startDate,
      endDate
    });
    await lease.save();

    // Mark property as occupied
    property.status = 'occupied';
    await property.save();

    // Generate first invoice due in 7 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const invoice = new Invoice({
      tenant: tenant._id,
      property: propertyId,
      lease: lease._id,
      amount: rentAmount,
      dueDate
    });
    await invoice.save();

    res.status(201).json({ lease, invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// End a lease (Landlord only)
router.post('/:id/end', auth, authorize('landlord'), async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    const property = await Property.findById(lease.property);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: not your property lease' });
    }

    // End the lease
    lease.status = 'ended';
    await lease.save();

    // Reset property to available
    property.status = 'available';
    await property.save();

    res.json({ message: 'Lease ended successfully', lease });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
