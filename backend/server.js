const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crop-recommend', require('./routes/crop'));
app.use('/api/disease-detect', require('./routes/disease'));
app.use('/api/yield-predict', require('./routes/yield'));
app.use('/api/price-forecast', require('./routes/price'));
app.use('/api/weather', require('./routes/weather'));
app.use('/api/pests', require('./routes/pests'));
app.use('/api/markets', require('./routes/markets'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'KesaanConnect API is running' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agriadvisory';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected natively');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(async (err) => {
    console.error('❌ Native MongoDB connection failed:', err.message);
    console.log('⚡ Starting in-memory MongoDB fallback...');
    
    try {
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log('✅ In-memory MongoDB connected successfully');
      app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT} (In-Memory DB)`));
    } catch (memErr) {
      console.error('❌ In-memory MongoDB also failed:', memErr.message);
      app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT} (NO DB)`));
    }
  });
