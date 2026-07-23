const mongoose = require('mongoose');

// TODO: Define report schema fields
const reportSchema = new mongoose.Schema(
  {
    // Add fields here
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);
module.exports = { Report };
