const app = require('../src/app');
const connectDB = require('../src/config/db');

// Connect to the database
connectDB();

module.exports = app;
