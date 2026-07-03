const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get properties with advanced search filters
router.get('/', auth, async (req, res) => {
  try {
    let query = {};

    // Role-based scoping
    if (req.user.role === 'tenant') {
      // Tenants see all landlord property postings
    } else if (req.user.role === 'landlord') {
      query.owner = req.user._id; // Landlords view their own properties
    } // Admins see all listings (for approval/deletion)

    // Apply filters
    if (req.query.location) {
      query.address = { $regex: req.query.location, $options: 'i' };
    }
    if (req.query.propertyType) {
      query.propertyType = req.query.propertyType;
    }
    if (req.query.beds && !isNaN(Number(req.query.beds))) {
      query.beds = Number(req.query.beds);
    }
    if (req.query.baths && !isNaN(Number(req.query.baths))) {
      query.baths = Number(req.query.baths);
    }
    if (req.query.minPrice || req.query.maxPrice) {
      const min = Number(req.query.minPrice);
      const max = Number(req.query.maxPrice);
      let rentQuery = {};
      if (req.query.minPrice && !isNaN(min)) rentQuery.$gte = min;
      if (req.query.maxPrice && !isNaN(max)) rentQuery.$lte = max;
      if (Object.keys(rentQuery).length > 0) {
        query.rent = rentQuery;
      }
    }
    if (req.query.amenities) {
      // Split comma separated list of amenities
      const amenitiesList = req.query.amenities.split(',');
      query.amenities = { $all: amenitiesList };
    }

    const properties = await Property.find(query).populate('owner', 'name email phone');
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's favorites
router.get('/favorites', auth, authorize('tenant'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: { path: 'owner', select: 'name email phone' }
    });
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a single property by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email phone bio');
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create property (Landlord only - defaults to unapproved)
router.post('/', auth, authorize('landlord'), async (req, res) => {
  try {
    const { title, description, address, rent, beds, baths, propertyType, amenities, images } = req.body;
    if (!title || !address || !rent || !beds || !baths || !propertyType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newProperty = new Property({
      title,
      description,
      address,
      rent,
      beds,
      baths,
      propertyType,
      amenities: amenities || [],
      images: images || [],
      owner: req.user._id,
      isApproved: true // Approved by default for instant visibility
    });

    const savedProperty = await newProperty.save();
    res.status(201).json(savedProperty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update property (Landlord & Owner or Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Verify ownership or Admin role
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, address, rent, beds, baths, propertyType, amenities, images, status, isApproved } = req.body;
    property.title = title || property.title;
    property.description = description || property.description;
    property.address = address || property.address;
    property.rent = rent !== undefined ? rent : property.rent;
    property.beds = beds !== undefined ? beds : property.beds;
    property.baths = baths !== undefined ? baths : property.baths;
    property.propertyType = propertyType || property.propertyType;
    property.amenities = amenities || property.amenities;
    property.images = images || property.images;
    property.status = status || property.status;

    // Only Admin can directly approve/unapprove
    if (req.user.role === 'admin') {
      property.isApproved = isApproved !== undefined ? isApproved : property.isApproved;
    } else {
      // Landlord edits keep approval active
      property.isApproved = true;
    }

    const updatedProperty = await property.save();
    res.json(updatedProperty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete property (Landlord & Owner or Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle Favorite (Tenant only)
router.post('/:id/favorite', auth, authorize('tenant'), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(property._id);
    if (index >= 0) {
      user.favorites.splice(index, 1);
      await user.save();
      res.json({ message: 'Removed from favorites', favorites: user.favorites });
    } else {
      user.favorites.push(property._id);
      await user.save();
      res.json({ message: 'Added to favorites', favorites: user.favorites });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leave Ratings and Reviews (Tenant only)
router.post('/:id/review', auth, authorize('tenant'), async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    if (!rating || !reviewText) {
      return res.status(400).json({ message: 'Rating and review text are required' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    property.reviews.push({
      tenant: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      reviewText
    });

    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
