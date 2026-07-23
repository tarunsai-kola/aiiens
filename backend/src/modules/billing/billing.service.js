const { Bill, Payment } = require('./billing.model');
const ApiError = require('../../utils/ApiError');
const mongoose = require('mongoose');
const { withTransaction } = require('../../utils/transaction');

class BillingService {
  async createBill(data, hospitalId, cashierId) {
    let grossTotal = 0;
    let totalDiscount = 0;
    let taxTotal = 0;

    // Calculate totals based on items
    const processedItems = data.items.map(item => {
      const qty = item.quantity || 1;
      const baseTotal = qty * item.unitPrice;
      const discount = item.discount || 0;
      const taxPerc = item.taxPercentage || 0;
      
      const taxableAmount = baseTotal - discount;
      const tax = (taxableAmount * taxPerc) / 100;
      const subTotal = taxableAmount + tax;

      grossTotal += baseTotal;
      totalDiscount += discount;
      taxTotal += tax;

      return {
        ...item,
        quantity: qty,
        discount,
        taxPercentage: taxPerc,
        subTotal
      };
    });

    // Handle bill level discount if any
    const billDiscount = data.billDiscount || 0;
    totalDiscount += billDiscount;

    let netTotal = grossTotal - totalDiscount + taxTotal;
    // ensure no negative nets
    if (netTotal < 0) netTotal = 0;

    const insuranceCoverage = data.insuranceCoverage || 0;
    let amountDue = netTotal - insuranceCoverage;
    if (amountDue < 0) amountDue = 0;

    const billStatus = amountDue === 0 ? 'paid' : 'unpaid';

    const bill = await Bill.create({
      patientId: data.patientId,
      hospitalId,
      cashierId,
      items: processedItems,
      grossTotal,
      totalDiscount,
      taxTotal,
      netTotal,
      insuranceCoverage,
      amountDue,
      amountPaid: 0,
      status: billStatus,
      notes: data.notes
    });

    return bill;
  }

  async getBills(hospitalId, query = {}) {
    return Bill.find({ hospitalId, ...query })
      .populate('patientId', 'firstName lastName uhid')
      .populate('cashierId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async getBillById(id, hospitalId) {
    const bill = await Bill.findOne({ _id: id, hospitalId })
      .populate('patientId', 'firstName lastName uhid phone age gender')
      .populate('cashierId', 'firstName lastName');
    
    if (!bill) throw ApiError.notFound('Bill not found');

    const payments = await Payment.find({ billId: id, hospitalId }).sort({ createdAt: -1 });
    return { bill, payments };
  }

  async addPayment(billId, data, hospitalId, cashierId) {
    return withTransaction(async (session) => {
      const bill = await Bill.findOne({ _id: billId, hospitalId }).session(session);
      if (!bill) throw new Error('Bill not found');

      if (data.type !== 'refund' && data.amount > bill.amountDue) {
        throw new Error('Payment amount exceeds amount due');
      }

      // Create Payment
      const payment = await Payment.create([{
        billId,
        patientId: bill.patientId,
        hospitalId,
        cashierId,
        amount: data.amount,
        method: data.method,
        transactionId: data.transactionId,
        type: data.type || 'payment',
        notes: data.notes
      }], { session });

      // Update Bill Status
      if (data.type === 'refund') {
        bill.amountPaid -= data.amount;
        bill.amountDue += data.amount;
      } else {
        bill.amountPaid += data.amount;
        bill.amountDue -= data.amount;
      }

      // Safe rounding
      bill.amountDue = Math.round(bill.amountDue * 100) / 100;
      bill.amountPaid = Math.round(bill.amountPaid * 100) / 100;

      if (bill.amountDue === 0) {
        bill.status = 'paid';
      } else if (bill.amountPaid > 0) {
        bill.status = 'partial';
      } else {
        bill.status = 'unpaid';
      }

      await bill.save({ session });
      
      return { bill, payment: payment[0] };
    }).catch(error => {
      throw ApiError.badRequest(error.message);
    });
  }

  async getCollectionReport(hospitalId, dateRange) {
    // Basic daily collection aggregation
    const matchStage = { hospitalId: new mongoose.Types.ObjectId(hospitalId) };
    if (dateRange && dateRange.start && dateRange.end) {
      matchStage.createdAt = { 
        $gte: new Date(dateRange.start), 
        $lte: new Date(dateRange.end) 
      };
    }

    const report = await Payment.aggregate([
      { $match: matchStage },
      { 
        $group: {
          _id: '$method',
          totalCollected: {
            $sum: {
              $cond: [{ $eq: ['$type', 'payment'] }, '$amount', { $multiply: ['$amount', -1] }]
            }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return report;
  }
}

module.exports = new BillingService();
