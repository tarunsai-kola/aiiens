const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

// Inventory Model
const inventorySchema = new mongoose.Schema({
  brandName: { type: String, required: true, trim: true },
  genericName: { type: String, required: true, trim: true },
  manufacturer: { type: String, trim: true },
  barcode: { type: String, trim: true },
  
  batchNumber: { type: String, trim: true },
  expiryDate: { type: Date, required: true },
  
  stockQuantity: { type: Number, required: true, default: 0, min: 0 },
  reorderLevel: { type: Number, default: 10 },
  
  unitPrice: { type: Number, required: true, min: 0 },
  taxPercentage: { type: Number, default: 0 }
}, { timestamps: true });

inventorySchema.index({ hospitalId: 1, stockQuantity: 1 }); // Dashboard Low Stock alerts

inventorySchema.plugin(tenantPlugin);

// Pharmacy Sale Model
const saleItemSchema = new mongoose.Schema({
  inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicineInventory', required: true },
  brandName: { type: String, required: true }, // Snapshotted in case inventory changes
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  taxPercentage: { type: Number, default: 0 },
  subtotal: { type: Number, required: true } // quantity * unitPrice
}, { _id: false });

const pharmacySaleSchema = new mongoose.Schema({
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' }, // Optional (could be walk-in)
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }, // Optional if anonymous walk-in
  pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [saleItemSchema],
  
  subTotal: { type: Number, required: true },
  taxTotal: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'paid' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'upi'], default: 'cash' },
}, { timestamps: true });

pharmacySaleSchema.plugin(tenantPlugin);

const MedicineInventory = mongoose.model('MedicineInventory', inventorySchema);
const PharmacySale = mongoose.model('PharmacySale', pharmacySaleSchema);

module.exports = { MedicineInventory, PharmacySale };
