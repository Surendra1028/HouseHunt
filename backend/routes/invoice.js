const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Property = require('../models/Property');
const Lease = require('../models/Lease');
const { auth, authorize } = require('../middleware/auth');

// Get all invoices
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'tenant') {
      const invoices = await Invoice.find({ tenant: req.user._id })
        .populate('property', 'title address')
        .sort({ dueDate: -1 });
      res.json(invoices);
    } else {
      // Landlord: Find owned properties
      const properties = await Property.find({ owner: req.user._id });
      const propertyIds = properties.map(p => p._id);
      
      const invoices = await Invoice.find({ property: { $in: propertyIds } })
        .populate('tenant', 'name email')
        .populate('property', 'title address')
        .sort({ dueDate: -1 });
      
      res.json(invoices);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create manual invoice (Landlord only)
router.post('/', auth, authorize('landlord'), async (req, res) => {
  try {
    const { tenantId, propertyId, amount, dueDate } = req.body;
    if (!tenantId || !propertyId || !amount || !dueDate) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const property = await Property.findById(propertyId);
    if (!property || property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized for this property' });
    }

    // Find active lease to link
    const lease = await Lease.findOne({ tenant: tenantId, property: propertyId, status: 'active' });
    if (!lease) {
      return res.status(400).json({ message: 'No active lease found for this tenant and property' });
    }

    const invoice = new Invoice({
      tenant: tenantId,
      property: propertyId,
      lease: lease._id,
      amount,
      dueDate
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pay invoice (Tenant only) - Simulates a credit card/bank transfer
router.post('/:id/pay', auth, authorize('tenant'), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.tenant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: not your invoice' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ message: 'Invoice is already paid' });
    }

    const { paymentMethod } = req.body;
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Please specify payment method' });
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    invoice.paymentMethod = paymentMethod;
    invoice.transactionId = req.body.transactionId || ('TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase());

    await invoice.save();
    res.json({ message: 'Payment simulated successfully', invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
