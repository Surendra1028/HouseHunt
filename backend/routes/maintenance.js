const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const { auth, authorize } = require('../middleware/auth');

// Get maintenance requests
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'tenant') {
      const requests = await Maintenance.find({ tenant: req.user._id })
        .populate('property', 'title address')
        .sort({ createdAt: -1 });
      res.json(requests);
    } else {
      // Landlord: Find owned properties
      const properties = await Property.find({ owner: req.user._id });
      const propertyIds = properties.map(p => p._id);

      const requests = await Maintenance.find({ property: { $in: propertyIds } })
        .populate('tenant', 'name email phone')
        .populate('property', 'title address')
        .sort({ createdAt: -1 });

      res.json(requests);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// File maintenance request (Tenant only)
router.post('/', auth, authorize('tenant'), async (req, res) => {
  try {
    const { propertyId, issue, description, priority } = req.body;
    if (!propertyId || !issue || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Verify tenant actually rents this property
    const lease = await Lease.findOne({ tenant: req.user._id, property: propertyId, status: 'active' });
    if (!lease) {
      return res.status(400).json({ message: 'You do not have an active lease for this property' });
    }

    const request = new Maintenance({
      tenant: req.user._id,
      property: propertyId,
      issue,
      description,
      priority: priority || 'medium'
    });

    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update maintenance request status (Landlord only)
router.put('/:id', auth, authorize('landlord'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'in-progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await Maintenance.findById(req.params.id).populate('property');
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    // Verify landlord owns the property
    if (request.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized: not your property' });
    }

    request.status = status;
    await request.save();

    res.json({ message: 'Status updated successfully', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
