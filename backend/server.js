const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/property'));
app.use('/api/leases', require('./routes/lease'));
app.use('/api/invoices', require('./routes/invoice'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/messages', require('./routes/message'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/notifications', require('./routes/notification'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HouseHunt API is running smoothly' });
});

// Database connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/house-rent-db')
  .then(() => {
    console.log('MongoDB connected successfully');
    
    // Auto-approve all existing property listings in database to ensure tenant visibility
    const Property = require('./models/Property');
    Property.updateMany({}, { $set: { isApproved: true } })
      .then(() => console.log('Successfully approved all legacy property listings'))
      .catch(err => console.error('Failed to auto-approve legacy properties:', err));

    // Start Server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
