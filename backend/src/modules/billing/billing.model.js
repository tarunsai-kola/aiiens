const mongoose = require('mongoose');
const tenantPlugin = require('../../plugins/tenantPlugin');

const billItemSchema = new mongoose.Schema({
  itemType: { type: String, enum: ['consultation', 'pharmacy', 'laboratory', 'procedure', 'other'], required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // e.g. Appointment ID, PharmacySale ID
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 }, // Amount discounted on this item
  taxPercentage: { type: Number, default: 0, min: 0 },
  subTotal: { type: Number, required: true } // (qty * unitPrice) - discount + tax
}, { _id: true });

const billSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [billItemSchema],
  
  grossTotal: { type: Number, required: true, default: 0 }, // Sum of (qty * unitPrice)
  totalDiscount: { type: Number, required: true, default: 0 }, // Line item discounts + bill level discount
  taxTotal: { type: Number, required: true, default: 0 },
  netTotal: { type: Number, required: true, default: 0 }, // Gross - Discount + Tax
  
  insuranceCoverage: { type: Number, default: 0 }, // Amount covered by TPA
  
  amountPaid: { type: Number, default: 0 },
  amountDue: { type: Number, required: true }, // Net - Insurance - Paid
  
  status: { 
    type: String, 
    enum: ['draft', 'unpaid', 'partial', 'paid', 'refunded', 'cancelled'], 
    default: 'unpaid' 
  },
  notes: { type: String, trim: true }
}, { timestamps: true });

billSchema.plugin(tenantPlugin);

const paymentSchema = new mongoose.Schema({
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  amount: { type: Number, required: true, min: 0.01 },
  method: { type: String, enum: ['cash', 'card', 'upi', 'insurance'], required: true },
  transactionId: { type: String, trim: true },
  
  type: { type: String, enum: ['payment', 'refund'], default: 'payment' },
  notes: { type: String, trim: true }
}, { timestamps: true });

paymentSchema.index({ hospitalId: 1, paymentDate: -1, status: 1 }); // Dashboard Revenue aggregation

paymentSchema.plugin(tenantPlugin);

const Bill = mongoose.model('Bill', billSchema);
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Bill, Payment };
