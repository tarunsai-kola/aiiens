const mongoose = require('mongoose');
const { Payment, Bill } = require('../billing/billing.model');
const { PharmacySale } = require('../pharmacy/pharmacy.model');
const { Appointment } = require('../appointments/appointment.model');
const Patient = require('../patients/patient.model');

class ReportsService {
  getDateMatch(hospitalId, startDate, endDate) {
    const match = { hospitalId: new mongoose.Types.ObjectId(hospitalId) };
    if (startDate && endDate) {
      match.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    return match;
  }

  // --- REVENUE REPORTS ---
  async getRevenueTrend(hospitalId, startDate, endDate, groupBy = 'day') {
    const match = this.getDateMatch(hospitalId, startDate, endDate);
    
    let groupFormat;
    if (groupBy === 'day') groupFormat = "%Y-%m-%d";
    else if (groupBy === 'month') groupFormat = "%Y-%m";
    else groupFormat = "%Y-%m-%d";

    const report = await Payment.aggregate([
      { $match: match },
      { 
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalCollected: {
            $sum: {
              $cond: [{ $eq: ['$type', 'payment'] }, '$amount', { $multiply: ['$amount', -1] }]
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    return report;
  }

  async getRevenueByDepartment(hospitalId, startDate, endDate) {
    const match = this.getDateMatch(hospitalId, startDate, endDate);
    
    // We get this from Bills since payments don't know what they paid for.
    // Unwind items and group by itemType
    return Bill.aggregate([
      { $match: match },
      { $unwind: "$items" },
      { 
        $group: {
          _id: "$items.itemType",
          revenue: { $sum: "$items.subTotal" },
          volume: { $sum: "$items.quantity" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);
  }

  // --- PHARMACY SALES ---
  async getTopMedicines(hospitalId, startDate, endDate) {
    const match = this.getDateMatch(hospitalId, startDate, endDate);
    
    return PharmacySale.aggregate([
      { $match: match },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.brandName",
          volume: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { volume: -1 } },
      { $limit: 10 }
    ]);
  }

  // --- CLINICAL OPERATIONS ---
  async getAppointmentStats(hospitalId, startDate, endDate) {
    const match = { hospitalId: new mongoose.Types.ObjectId(hospitalId) };
    if (startDate && endDate) {
      match.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const byStatus = await Appointment.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const byDoctor = await Appointment.aggregate([
      { $match: match },
      { $group: { _id: "$doctorId", count: { $sum: 1 } } },
      { 
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'doctor'
        }
      },
      { $unwind: "$doctor" },
      { 
        $project: {
          name: { $concat: ["$doctor.firstName", " ", "$doctor.lastName"] },
          count: 1
        }
      },
      { $sort: { count: -1 } }
    ]);

    return { byStatus, byDoctor };
  }

  // --- PATIENT DEMOGRAPHICS ---
  async getPatientDemographics(hospitalId, startDate, endDate) {
    // If date range is provided, it means "new registrations in this period"
    const match = this.getDateMatch(hospitalId, startDate, endDate);
    
    const byGender = await Patient.aggregate([
      { $match: match },
      { $group: { _id: "$gender", count: { $sum: 1 } } }
    ]);

    const byAge = await Patient.aggregate([
      { $match: match },
      { 
        $bucket: {
          groupBy: "$age",
          boundaries: [0, 18, 30, 45, 60, 120],
          default: "Unknown",
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    return { byGender, byAge };
  }
}

module.exports = new ReportsService();
