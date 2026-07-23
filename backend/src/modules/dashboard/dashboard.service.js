const { Patient } = require('../patients/patient.model');
const { User } = require('../auth/auth.model');
const { Appointment } = require('../appointments/appointment.model');
const { Payment } = require('../billing/billing.model');
const { MedicineInventory } = require('../pharmacy/pharmacy.model');
const Notification = require('../notifications/notification.model');

class DashboardService {
  async getDashboardStats(hospitalId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      revenueData,
      todayPatients,
      todayAppointments,
      occupancyData,
      staffData,
      lowStockItems,
      recentActivities
    ] = await Promise.all([
      // 1. Today's Revenue
      (Payment?.aggregate([
        { $match: { hospitalId, paymentDate: { $gte: today }, status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]) || Promise.resolve([])),

      // 2. Today's Patients
      (Patient?.countDocuments({ hospitalId, createdAt: { $gte: today } }) || Promise.resolve(0)),

      // 3. Today's Appointments
      (Appointment?.countDocuments({ hospitalId, appointmentDate: { $gte: today } }) || Promise.resolve(0)),

      // 4. Occupancy (Mocked since Ward/Bed models are not fully implemented yet)
      Promise.resolve([
        {
          _id: null,
          totalBeds: 100,
          occupiedBeds: 45
        }
      ]),

      // 5. Staff Distribution
      (User?.aggregate([
        { $match: { hospitalId } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]) || Promise.resolve([])),

      // 6. Low Stock Inventory
      MedicineInventory.find({ hospitalId, $expr: { $lte: ['$stockQuantity', '$reorderLevel'] } })
        .limit(5),

      // 7. Recent Activities (Notifications)
      Notification.find({ hospitalId })
        .sort({ createdAt: -1 })
        .limit(8)
    ]);

    // Format Data
    const todayRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    let totalBeds = 0;
    let occupiedBeds = 0;
    if (occupancyData.length > 0) {
      totalBeds = occupancyData[0].totalBeds;
      occupiedBeds = occupancyData[0].occupiedBeds;
    }
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    let totalStaff = 0;
    let doctorsCount = 0;
    staffData.forEach(s => {
      totalStaff += s.count;
      if (s._id === 'doctor') doctorsCount += s.count;
    });

    // Generate 7-Day Trend (Mocked for speed, ideally aggregated)
    const trends = await this.getWeeklyTrend(hospitalId);

    return {
      kpis: {
        todayRevenue,
        todayPatients,
        todayAppointments,
        occupancyRate,
        doctorsCount,
        totalStaff
      },
      lowStockItems,
      recentActivities,
      trends
    };
  }

  async getWeeklyTrend(hospitalId) {
    // Generate dates for the last 7 days
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    // To keep the MVP fast, we can either do 7 separate queries or a $group by date.
    // $group by date for Appointments
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const appointmentsTrend = (await Appointment?.aggregate([
      { $match: { hospitalId, createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, 
          count: { $sum: 1 } 
        } 
      }
    ])) || [];

    const revenueTrend = (await Payment?.aggregate([
      { $match: { hospitalId, paymentDate: { $gte: sevenDaysAgo }, status: 'Completed' } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } }, 
          total: { $sum: '$amount' } 
        } 
      }
    ])) || [];

    // Merge into the dates array
    return dates.map(date => {
      const appt = appointmentsTrend.find(a => a._id === date);
      const rev = revenueTrend.find(r => r._id === date);
      return {
        date,
        appointments: appt ? appt.count : 0,
        revenue: rev ? rev.total : 0
      };
    });
  }
}

module.exports = new DashboardService();
