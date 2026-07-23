const { MedicineInventory, PharmacySale } = require('./pharmacy.model');
const { Prescription } = require('../prescriptions/prescription.model');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');
const { withTransaction } = require('../../utils/transaction');

class PharmacyService {
  // Inventory
  async addInventory(data, hospitalId) {
    const item = await MedicineInventory.create({ ...data, hospitalId });
    return item;
  }

  async getInventory(hospitalId, query = {}) {
    return MedicineInventory.find({ ...query, hospitalId }).sort({ brandName: 1 });
  }

  async searchInventory(q, hospitalId) {
    if (!q) return [];
    const searchRegex = new RegExp(q, 'i');
    return MedicineInventory.find({
      hospitalId,
      $or: [
        { brandName: searchRegex },
        { genericName: searchRegex },
        { barcode: q } // exact match for barcode
      ]
    }).limit(20);
  }

  // Queue
  async getIncomingPrescriptions(hospitalId) {
    // Prescriptions that have medicines and are not dispensed yet
    return Prescription.find({ 
      hospitalId, 
      isDispensed: false,
      medicines: { $exists: true, $not: {$size: 0} }
    })
    .populate('patientId', 'firstName lastName uhid gender age')
    .populate('doctorId', 'firstName lastName')
    .sort({ createdAt: -1 });
  }

  // Dispensing & Billing
  async dispense(data, hospitalId, pharmacistId) {
    return withTransaction(async (session) => {
      // 1. Check stock & calculate totals
      let subTotal = 0;
      let taxTotal = 0;
      const validatedItems = [];

      for (const item of data.items) {
        const inventory = await MedicineInventory.findOne({ _id: item.inventoryId, hospitalId }).session(session);
        if (!inventory) throw new Error(`Item ${item.inventoryId} not found in inventory.`);
        if (inventory.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${inventory.brandName}. Available: ${inventory.stockQuantity}`);
        }

        // Decrement stock
        inventory.stockQuantity -= item.quantity;
        await inventory.save({ session });

        // Totals
        const itemSubtotal = inventory.unitPrice * item.quantity;
        const itemTax = (itemSubtotal * inventory.taxPercentage) / 100;
        
        subTotal += itemSubtotal;
        taxTotal += itemTax;

        validatedItems.push({
          inventoryId: inventory._id,
          brandName: inventory.brandName,
          quantity: item.quantity,
          unitPrice: inventory.unitPrice,
          taxPercentage: inventory.taxPercentage,
          subtotal: itemSubtotal
        });
      }

      const grandTotal = subTotal + taxTotal;

      // 2. Create Sale Record
      const sale = await PharmacySale.create([{
        prescriptionId: data.prescriptionId,
        patientId: data.patientId,
        pharmacistId,
        hospitalId,
        items: validatedItems,
        subTotal,
        taxTotal,
        grandTotal,
        paymentStatus: data.paymentStatus || 'paid',
        paymentMethod: data.paymentMethod || 'cash'
      }], { session });

      // 3. Mark Prescription as dispensed
      if (data.prescriptionId) {
        await Prescription.findByIdAndUpdate(
          data.prescriptionId,
          { isDispensed: true, dispenseTimestamp: new Date() },
          { session }
        );
      }

      return sale[0];
    }).catch(err => {
      throw ApiError.badRequest(err.message);
    });
  }
}

module.exports = new PharmacyService();
