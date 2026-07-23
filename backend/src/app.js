const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const corsOptions = require('./config/cors');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const { errorHandler, notFound } = require('./middlewares/error.middleware');
const logger = require('./config/logger');

const authRoutes        = require('./modules/auth/auth.routes');
const patientRoutes     = require('./modules/patients/patient.routes');
const doctorRoutes      = require('./modules/doctors/doctor.routes');
const appointmentRoutes = require('./modules/appointments/appointment.routes');
const consultationRoutes = require('./modules/consultations/consultation.routes');
const prescriptionRoutes = require('./modules/prescriptions/prescription.routes');
const vitalsRoutes      = require('./modules/vitals/vitals.routes');
const billingRoutes     = require('./modules/billing/billing.routes');
const pharmacyRoutes    = require('./modules/pharmacy/pharmacy.routes');
const laboratoryRoutes  = require('./modules/laboratory/laboratory.routes');
const wardRoutes        = require('./modules/wards/ward.routes');
const reportRoutes      = require('./modules/reports/reports.routes');
const hospitalRoutes    = require('./modules/hospitals/hospital.routes');
const departmentRoutes  = require('./modules/departments/department.routes');
const staffRoutes       = require('./modules/staff/staff.routes');
const hrRoutes          = require('./modules/hr/hr.routes');
const notificationRoutes = require('./modules/notifications/notification.routes');
const dashboardRoutes   = require('./modules/dashboard/dashboard.routes');
const saasRoutes        = require('./modules/saas/saas.routes');
const settingsRoutes    = require('./modules/settings/settings.routes');
const roleRoutes        = require('./modules/roles/role.routes');

const app = express();

// ── Security Middlewares ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(rateLimiter);
app.use(compression());

// ── Request Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ───────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
  }));
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/hospitals`, hospitalRoutes);
app.use(`${API}/departments`, departmentRoutes);
app.use(`${API}/staff`, staffRoutes);
app.use(`${API}/settings`, settingsRoutes);
app.use(`${API}/roles`, roleRoutes);
app.use(`${API}/patients`, patientRoutes);
app.use(`${API}/doctors`, doctorRoutes);
app.use(`${API}/appointments`, appointmentRoutes);
app.use(`${API}/consultations`, consultationRoutes);
app.use(`${API}/prescriptions`, prescriptionRoutes);
app.use(`${API}/vitals`, vitalsRoutes);
app.use(`${API}/billing`, billingRoutes);
app.use(`${API}/pharmacy`, pharmacyRoutes);
app.use(`${API}/laboratory`, laboratoryRoutes);
app.use(`${API}/wards`, wardRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/hr`, hrRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/dashboard`, dashboardRoutes);
app.use(`${API}/saas`, saasRoutes);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
