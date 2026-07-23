const mongoose = require('mongoose');

// TODO: Define ward schema fields
const wardSchema = new mongoose.Schema(
  {
    // Add fields here
  },
  { timestamps: true }
);

const Ward = mongoose.model('Ward', wardSchema);
module.exports = { Ward };
