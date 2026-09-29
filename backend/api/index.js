require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect to the database (non-blocking for serverless)
connectDB().catch((err) => {
  console.error('Failed to connect to MongoDB:', err.message);
});

module.exports = app;
