const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  reviewText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  address: { type: String, required: true },
  rent: { type: Number, required: true },
  beds: { type: Number, required: true },
  baths: { type: Number, required: true },
  propertyType: { type: String, required: true, default: 'apartment' }, // e.g. apartment, house, condo, townhouse
  amenities: [{ type: String }], // e.g. WiFi, Parking, Pool, Gym, AC, Furnished
  images: [{ type: String }], // Base64 or URLs
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  isApproved: { type: Boolean, default: false }, // Requires admin approval
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviews: [ReviewSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', PropertySchema);
