import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import RoleRoute from './RoleRoute';
import Spinner from '../components/common/Spinner';
import DashboardLayout from '../components/layout/DashboardLayout';

// ── Pages: Auth ───────────────────────────────────────────────────────────────
const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const InviteAcceptPage = lazy(() => import('../features/auth/pages/InviteAcceptPage'));

// ── Admin Pages ───────────────────────────────────────────────────────────────
const AdminLayout = lazy(() => import('../features/admin/layout/AdminLayout'));
const HospitalProfilePage = lazy(() => import('../features/admin/pages/HospitalProfilePage'));
const DepartmentsPage = lazy(() => import('../features/admin/pages/DepartmentsPage'));
const StaffDirectoryPage = lazy(() => import('../features/admin/pages/StaffDirectoryPage'));
const DoctorProfilesPage = lazy(() => import('../features/admin/pages/DoctorProfilesPage'));
const RolesPermissionsPage = lazy(() => import('../features/admin/pages/RolesPermissionsPage'));
const GeneralSettingsPage = lazy(() => import('../features/admin/pages/GeneralSettingsPage'));

// ── Pages: Features ───────────────────────────────────────────────────────────
const DashboardPage    = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const PatientListPage  = lazy(() => import('../features/patients/pages/PatientListPage'));
const PatientLookupPage = lazy(() => import('../features/patients/pages/PatientLookupPage'));
const PatientRegistrationPage = lazy(() => import('../features/patients/pages/PatientRegistrationPage'));
const PatientCardPage = lazy(() => import('../features/patients/pages/PatientCardPage'));
const DoctorListPage   = lazy(() => import('../features/doctors/pages/DoctorListPage'));
const DoctorQueuePage   = lazy(() => import('../features/doctors/pages/DoctorQueuePage'));
const OPDeskPage          = lazy(() => import('../features/opdesk/pages/OPDeskPage'));
const OPDRegistrationPage = lazy(() => import('../features/opdesk/pages/OPDRegistrationPage'));
const OPDVitalsPage       = lazy(() => import('../features/opdesk/pages/OPDVitalsPage'));
const OPDHistoryPage      = lazy(() => import('../features/opdesk/pages/OPDHistoryPage'));
const OPDBillingPage      = lazy(() => import('../features/opdesk/pages/OPDBillingPage'));
const TriageQueuePage  = lazy(() => import('../features/nursing/pages/TriageQueuePage'));
const AppointmentListPage = lazy(() => import('../features/appointments/pages/AppointmentListPage'));
const BillingDashboardPage = lazy(() => import('../features/billing/pages/BillingDashboardPage'));
const BillCreatePage     = lazy(() => import('../features/billing/pages/BillCreatePage'));
const PharmacyPage     = lazy(() => import('../features/pharmacy/pages/PharmacyPage'));
const PharmacyDashboardPage = lazy(() => import('../features/pharmacy/pages/PharmacyDashboardPage'));
const PharmacyInventoryPage = lazy(() => import('../features/pharmacy/pages/PharmacyInventoryPage'));
const LabDashboardPage = lazy(() => import('../features/laboratory/pages/LabDashboardPage'));
const LabTestMasterPage = lazy(() => import('../features/laboratory/pages/LabTestMasterPage'));
const ReportsDashboardPage = lazy(() => import('../features/reports/pages/ReportsDashboardPage'));
const HRDashboardPage = lazy(() => import('../features/hr/pages/HRDashboardPage'));
const DutyRosterPage = lazy(() => import('../features/hr/pages/DutyRosterPage'));
const AttendancePage = lazy(() => import('../features/hr/pages/AttendancePage'));
const LeaveManagementPage = lazy(() => import('../features/hr/pages/LeaveManagementPage'));
const PayrollPage = lazy(() => import('../features/hr/pages/PayrollPage'));
const NotificationLogsPage = lazy(() => import('../features/notifications/pages/NotificationLogsPage'));

const SaaSLayout = lazy(() => import('../features/saas/components/SaaSLayout'));
const SaaSDashboardPage = lazy(() => import('../features/saas/pages/SaaSDashboardPage'));
const HospitalsPage = lazy(() => import('../features/saas/pages/HospitalsPage'));
const PlansPage = lazy(() => import('../features/saas/pages/PlansPage'));
const TicketsPage = lazy(() => import('../features/saas/pages/TicketsPage'));
const LogsPage = lazy(() => import('../features/saas/pages/LogsPage'));

const NotFoundPage     = lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Spinner size="lg" />
  </div>
);

function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Root Route ───────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Public Routes (redirect if authenticated) ─────────── */}
        <Route element={<PublicRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/accept-invite/:token" element={<InviteAcceptPage />} />
        </Route>

        {/* ── Protected Routes ─────────────────────────────────── */}
        <Route element={<PrivateRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* ── Admin Area (Protected & Role Restricted) ─────────── */}
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/profile" replace />} />
                <Route path="profile" element={<HospitalProfilePage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="staff" element={<StaffDirectoryPage />} />
                <Route path="doctors" element={<DoctorProfilesPage />} />
                <Route path="roles" element={<RolesPermissionsPage />} />
                <Route path="settings" element={<GeneralSettingsPage />} />
              </Route>
            </Route>

            {/* Patients Module */}
            <Route element={<RoleRoute roles={['admin', 'doctor', 'nurse', 'receptionist']} />}>
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patients/lookup" element={<PatientLookupPage />} />
              <Route path="/patients/register" element={<PatientRegistrationPage />} />
              <Route path="/patients/card/:id" element={<PatientCardPage />} />
            </Route>

            {/* Doctors — admin, doctor */}
            <Route element={<RoleRoute roles={['admin', 'doctor']} />}>
              <Route path="/doctors" element={<DoctorListPage />} />
              <Route path="/doctor/queue" element={<DoctorQueuePage />} />
            </Route>
            
            {/* OP Desk — admin, receptionist */}
            <Route element={<RoleRoute roles={['admin', 'receptionist']} />}>
              <Route path="/opdesk" element={<OPDeskPage />} />
              <Route path="/opdesk/registration" element={<OPDRegistrationPage />} />
              <Route path="/opdesk/vitals" element={<OPDVitalsPage />} />
              <Route path="/opdesk/history" element={<OPDHistoryPage />} />
              <Route path="/opdesk/billing" element={<OPDBillingPage />} />
              <Route path="/opdesk/emergency" element={<DashboardPage />} /> {/* Placeholder */}
              <Route path="/opdesk/staff" element={<StaffDirectoryPage />} /> {/* Reused from admin/hr */}
            </Route>

            {/* Nursing — admin, nurse */}
            <Route element={<RoleRoute roles={['admin', 'nurse']} />}>
              <Route path="/nursing/triage" element={<TriageQueuePage />} />
            </Route>

            {/* Appointments */}
            <Route
              element={<RoleRoute roles={['admin', 'doctor', 'nurse', 'receptionist']} />}
            >
              <Route path="/appointments" element={<AppointmentListPage />} />
            </Route>

            {/* Billing — admin, receptionist */}
            <Route element={<RoleRoute roles={['admin', 'receptionist']} />}>
              <Route path="/billing/dashboard" element={<BillingDashboardPage />} />
              <Route path="/billing/pos" element={<BillCreatePage />} />
            </Route>

            {/* Pharmacy — admin, pharmacist */}
            <Route element={<RoleRoute roles={['admin', 'pharmacist']} />}>
              <Route path="/pharmacy" element={<PharmacyPage />} />
              <Route path="/pharmacy/dashboard" element={<PharmacyDashboardPage />} />
              <Route path="/pharmacy/inventory" element={<PharmacyInventoryPage />} />
            </Route>

            {/* Laboratory — admin, lab_technician, doctor */}
            <Route element={<RoleRoute roles={['admin', 'lab_technician', 'doctor']} />}>
              <Route path="/laboratory/dashboard" element={<LabDashboardPage />} />
              <Route path="/laboratory/tests" element={<LabTestMasterPage />} />
            </Route>

            {/* Reports — admin */}
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/reports/dashboard" element={<ReportsDashboardPage />} />
            </Route>

            {/* HR / Staff Management — admin */}
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/hr/dashboard" element={<HRDashboardPage />} />
              <Route path="/hr/staff" element={<StaffDirectoryPage />} />
              <Route path="/hr/roster" element={<DutyRosterPage />} />
              <Route path="/hr/attendance" element={<AttendancePage />} />
              <Route path="/hr/leaves" element={<LeaveManagementPage />} />
              <Route path="/hr/payroll" element={<PayrollPage />} />
              <Route path="/admin/notifications" element={<NotificationLogsPage />} />
            </Route>
          </Route>
        </Route>

        {/* ── Error Pages ───────────────────────────────────────── */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ============================== */}
        {/* SAAS PLATFORM ADMIN ROUTES     */}
        {/* ============================== */}
        <Route element={<PrivateRoute />}>
          <Route element={<RoleRoute roles={['superadmin']} />}>
            <Route element={<SaaSLayout />}>
              <Route path="/saas/dashboard" element={<SaaSDashboardPage />} />
              <Route path="/saas/hospitals" element={<HospitalsPage />} />
              <Route path="/saas/plans" element={<PlansPage />} />
              <Route path="/saas/tickets" element={<TicketsPage />} />
              <Route path="/saas/logs" element={<LogsPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*"             element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRouter;
