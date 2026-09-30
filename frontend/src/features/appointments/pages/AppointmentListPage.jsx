import { useState, useEffect, useCallback, useRef } from 'react';
import { appointmentApi } from '../../../api/appointment.api';
import { adminApi } from '../../../api/admin.api';
import { vitalsApi } from '../../../api/vitals.api';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_LIMIT = 40;

const STATUS_META = {
  triage:       { label: 'Triage',      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',   dot: 'bg-yellow-500' },
  waiting:      { label: 'Waiting',     color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',           dot: 'bg-blue-500' },
  'in-progress':{ label: 'In Progress', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',   dot: 'bg-indigo-500' },
  completed:    { label: 'Completed',   color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',       dot: 'bg-green-500' },
  cancelled:    { label: 'Cancelled',   color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',               dot: 'bg-red-500' },
  missed:       { label: 'Missed',      color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',              dot: 'bg-gray-400' },
  hold:         { label: 'On Hold',     color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',   dot: 'bg-orange-500' },
  skipped:      { label: 'Skipped',     color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',           dot: 'bg-pink-500' },
  transferred:  { label: 'Transferred', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',   dot: 'bg-purple-500' },
};

const PRIORITY_META = {
  normal:    { label: 'Normal',    icon: '🟢', color: 'text-gray-500' },
  emergency: { label: 'Emergency', icon: '🔴', color: 'text-red-600 dark:text-red-400 font-bold' },
  vip:       { label: 'VIP',       icon: '⭐', color: 'text-amber-600 dark:text-amber-400 font-semibold' },
};

const ALL_STATUSES = Object.keys(STATUS_META);
const LIVE_STATUSES = ['triage', 'waiting', 'in-progress', 'hold'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(iso, type = 'time') {
  if (!iso) return '—';
  const d = new Date(iso);
  if (type === 'date') return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  if (type === 'datetime') return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function calcAge(dob) {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1e3));
}

function duration(inn, out) {
  if (!inn || !out) return null;
  const mins = Math.round((new Date(out) - new Date(inn)) / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function today() {
  return new Date().toISOString().split('T')[0];
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg, sub }) {
  return (
    <div className={`${bg} rounded-xl p-4 flex flex-col min-w-[110px]`}>
      <div className={`text-2xl font-bold ${color}`}>{value ?? '—'}</div>
      <div className="text-xs text-gray-500 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Status Action Menu ────────────────────────────────────────────────────────
function StatusActions({ appt, onUpdate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isDone = ['completed', 'cancelled', 'missed', 'skipped', 'transferred'].includes(appt.status);
  if (isDone) return null;

  const transitions = {
    triage:       [['waiting', '→ Waiting'],['cancelled', '✗ Cancel']],
    waiting:      [['in-progress', '📞 Call'],['hold', '⏸ Hold'],['cancelled', '✗ Cancel']],
    'in-progress':[['completed', '✓ Done'],['hold', '⏸ Hold']],
    hold:         [['waiting', '▶ Resume'],['cancelled', '✗ Cancel']],
  };

  const actions = transitions[appt.status] || [];

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        title="Update status"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-30 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-40 py-1" onClick={e => e.stopPropagation()}>
          {actions.map(([status, label]) => (
            <button
              key={status}
              onClick={() => { setOpen(false); onUpdate(appt._id, status); }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Appointment Detail Panel ──────────────────────────────────────────────────
function DetailPanel({ appt, onClose, onUpdate }) {
  const [vitals, setVitals] = useState(null);
  
  useEffect(() => {
    if (appt) {
      vitalsApi.getVitalsByAppointment(appt._id)
        .then(res => setVitals(res.data.data))
        .catch(err => console.error('Failed to load vitals', err));
    }
  }, [appt]);

  if (!appt) return null;
  const patient = appt.patientId || {};
  const doctor  = appt.doctorId  || {};
  const sm = STATUS_META[appt.status] || STATUS_META.triage;
  const pm = PRIORITY_META[appt.priority] || PRIORITY_META.normal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
          <div className="flex justify-between mb-4">
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <span className={`text-[11px] px-3 py-1 rounded-full font-semibold ${sm.color}`}>{sm.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              {`${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold">{patient.firstName} {patient.lastName}</h2>
              <p className="text-indigo-200 text-sm font-mono">{patient.uhid}</p>
              <p className="text-indigo-200 text-xs mt-0.5">Token #{appt.tokenNumber} · {pm.icon} {pm.label}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Appointment</h3>
            <div className="space-y-2">
              {[
                ['Date', fmt(appt.date, 'date')],
                ['Doctor', `Dr. ${doctor.firstName} ${doctor.lastName}`],
                ['Department', appt.departmentId?.name || '—'],
                ['Visit Type', appt.visitType?.replace('-', ' ')],
                ['Token', `#${appt.tokenNumber}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 capitalize">{v}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Timeline</h3>
            <div className="space-y-2">
              {[
                ['Registered', fmt(appt.createdAt)],
                ['Est. Wait', fmt(appt.estimatedTime)],
                ['Called In', fmt(appt.timeIn)],
                ['Completed', fmt(appt.timeOut)],
                ['Duration', duration(appt.timeIn, appt.timeOut)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-gray-500">{k}</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{v ?? '—'}</span>
                </div>
              ))}
            </div>
          </section>

          {appt.notes && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{appt.notes}</p>
            </section>
          )}

          {vitals && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Vital Screening</h3>
              <div className="grid grid-cols-2 gap-4">
                {vitals.bpSystolic && vitals.bpDiastolic && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Blood Pressure</div>
                    <div className="font-bold text-gray-900 dark:text-white">{vitals.bpSystolic}/{vitals.bpDiastolic} mmHg</div>
                  </div>
                )}
                {vitals.pulse && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Heart Rate</div>
                    <div className="font-bold text-gray-900 dark:text-white">{vitals.pulse} BPM</div>
                  </div>
                )}
                {vitals.temperature && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Temperature</div>
                    <div className="font-bold text-gray-900 dark:text-white">{vitals.temperature}</div>
                  </div>
                )}
                {vitals.spo2 && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">SpO2</div>
                    <div className="font-bold text-gray-900 dark:text-white">{vitals.spo2}%</div>
                  </div>
                )}
                {vitals.weight && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Weight</div>
                    <div className="font-bold text-gray-900 dark:text-white">{vitals.weight} kg</div>
                  </div>
                )}
                {vitals.height && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Height</div>
                    <div className="font-bold text-gray-900 dark:text-white">{vitals.height} cm</div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Quick actions */}
          {['triage','waiting','in-progress','hold'].includes(appt.status) && (
            <section className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                {appt.status === 'triage' && (
                  <button onClick={() => { onClose(); onUpdate(appt._id, 'waiting'); }} className="text-xs px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 font-medium transition-colors">→ Waiting Room</button>
                )}
                {appt.status === 'waiting' && (
                  <button onClick={() => { onClose(); onUpdate(appt._id, 'in-progress'); }} className="text-xs px-3 py-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 font-medium transition-colors">📞 Call Patient</button>
                )}
                {appt.status === 'in-progress' && (
                  <button onClick={() => { onClose(); onUpdate(appt._id, 'completed'); }} className="text-xs px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 font-medium transition-colors">✓ Mark Complete</button>
                )}
                {['triage','waiting','in-progress','hold'].includes(appt.status) && (
                  <button onClick={() => { onClose(); onUpdate(appt._id, 'cancelled'); }} className="text-xs px-3 py-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 font-medium transition-colors">✗ Cancel</button>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────
function AppointmentRow({ appt, onView, onUpdate }) {
  const patient = appt.patientId || {};
  const doctor  = appt.doctorId  || {};
  const sm = STATUS_META[appt.status] || STATUS_META.triage;
  const pm = PRIORITY_META[appt.priority] || PRIORITY_META.normal;
  const isLive = LIVE_STATUSES.includes(appt.status);

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer group"
      onClick={() => onView(appt)}
    >
      {/* Token */}
      <td className="px-4 py-3 w-16">
        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-xs font-bold ${isLive ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
          <span className="text-[9px] opacity-60">TKN</span>
          <span className="text-sm leading-none">{appt.tokenNumber}</span>
        </div>
      </td>

      {/* Patient */}
      <td className="px-4 py-3">
        <div className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
          {patient.firstName} {patient.lastName}
        </div>
        <div className="text-xs text-gray-500 font-mono">{patient.uhid}</div>
        {patient.dateOfBirth && (
          <div className="text-xs text-gray-400">{calcAge(patient.dateOfBirth)}y · <span className="capitalize">{patient.gender}</span></div>
        )}
      </td>

      {/* Doctor + Dept */}
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">Dr. {doctor.firstName} {doctor.lastName}</div>
        <div className="text-xs text-gray-500">{appt.departmentId?.name || '—'}</div>
      </td>

      {/* Date + Time */}
      <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600 dark:text-gray-400">
        <div>{fmt(appt.date, 'date')}</div>
        <div className="text-xs text-gray-400">{fmt(appt.createdAt)}</div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          {isLive && <span className={`w-1.5 h-1.5 rounded-full ${sm.dot} animate-pulse flex-shrink-0`} />}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${sm.color}`}>{sm.label}</span>
        </div>
      </td>

      {/* Visit Type + Priority */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize">{appt.visitType?.replace('-', ' ')}</div>
        <div className={`text-xs mt-0.5 ${pm.color}`}>{pm.icon} {pm.label}</div>
      </td>

      {/* Wait / Duration */}
      <td className="px-4 py-3 hidden xl:table-cell text-xs text-gray-500">
        {appt.timeIn && appt.timeOut
          ? <span className="font-medium text-green-600 dark:text-green-400">{duration(appt.timeIn, appt.timeOut)}</span>
          : appt.estimatedTime
            ? <span>Est: {fmt(appt.estimatedTime)}</span>
            : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <StatusActions appt={appt} onUpdate={onUpdate} />
        </div>
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AppointmentListPage() {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal]               = useState(0);
  const [page, setPage]                 = useState(1);
  const [loading, setLoading]           = useState(true);
  const [stats, setStats]               = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [doctors, setDoctors]           = useState([]);
  const [viewAppt, setViewAppt]         = useState(null);

  // Filters
  const [filterDate, setFilterDate]       = useState(today());
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterDoctor, setFilterDoctor]   = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterVisit, setFilterVisit]     = useState('');

  const autoRefreshRef = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAppointments = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: PAGE_LIMIT };
      if (filterDate)     params.date       = filterDate;
      if (filterStatus)   params.status     = filterStatus;
      if (filterDoctor)   params.doctorId   = filterDoctor;
      if (filterPriority) params.priority   = filterPriority;
      if (filterVisit)    params.visitType  = filterVisit;

      const { data } = await appointmentApi.getAll(params);
      const r = data.data;
      setAppointments(r.docs || []);
      setTotal(r.total || 0);
      setPage(r.page || 1);
    } catch {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [filterDate, filterStatus, filterDoctor, filterPriority, filterVisit]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await appointmentApi.getStats();
      setStats(data.data);
    } catch { /* non-critical */ }
    finally { setStatsLoading(false); }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data } = await adminApi.getDoctors({ limit: 100, isActive: 'true' });
      setDoctors(data.data?.docs || []);
    } catch { /* non-critical */ }
  }, []);

  // Initial load
  useEffect(() => {
    fetchAppointments(1);
    fetchStats();
    fetchDoctors();
  }, []);

  // Re-fetch when filters change (debounced via dependency change)
  useEffect(() => {
    fetchAppointments(1);
  }, [filterDate, filterStatus, filterDoctor, filterPriority, filterVisit]);

  // Auto-refresh live appointments every 30s
  useEffect(() => {
    const hasLive = !filterStatus || LIVE_STATUSES.includes(filterStatus);
    if (hasLive) {
      autoRefreshRef.current = setInterval(() => {
        fetchAppointments(page);
        fetchStats();
      }, 30000);
    }
    return () => clearInterval(autoRefreshRef.current);
  }, [page, filterStatus, fetchAppointments, fetchStats]);

  // ── Status Update ──────────────────────────────────────────────────────────
  const handleUpdate = async (id, status) => {
    try {
      await appointmentApi.updateStatus(id, status);
      toast.success(`Moved to ${STATUS_META[status]?.label || status}`);
      fetchAppointments(page);
      fetchStats();
      setViewAppt(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Status update failed');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(total / PAGE_LIMIT);
  const liveCount  = appointments.filter(a => LIVE_STATUSES.includes(a.status)).length;

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="page-header mb-0 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0 ? `${total.toLocaleString()} records` : 'No records'}
            {liveCount > 0 && (
              <span className="ml-2 font-medium text-indigo-600 dark:text-indigo-400">
                · <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse align-middle mr-1" />{liveCount} live
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => { fetchAppointments(page); fetchStats(); }}
          className="btn-secondary gap-2"
          title="Refresh"
        >
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Today's Stats Bar */}
      <div className="flex gap-3 py-4 overflow-x-auto flex-shrink-0">
        {statsLoading
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-16 w-28 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse flex-shrink-0" />
            ))
          : stats && <>
              <StatCard label="Total Today"  value={stats.total}      color="text-gray-800 dark:text-gray-200"               bg="bg-gray-50 dark:bg-gray-800/60" />
              <StatCard label="Triage"       value={stats.triage}     color="text-yellow-600 dark:text-yellow-400"            bg="bg-yellow-50 dark:bg-yellow-900/20" sub="awaiting assessment" />
              <StatCard label="Waiting"      value={stats.waiting}    color="text-blue-600 dark:text-blue-400"                bg="bg-blue-50 dark:bg-blue-900/20" sub="in queue" />
              <StatCard label="In Progress"  value={stats.inProgress} color="text-indigo-600 dark:text-indigo-400"            bg="bg-indigo-50 dark:bg-indigo-900/20" sub="with doctor" />
              <StatCard label="Completed"    value={stats.completed}  color="text-green-600 dark:text-green-400"              bg="bg-green-50 dark:bg-green-900/20" sub="today" />
              <StatCard label="Cancelled"    value={stats.cancelled}  color="text-red-600 dark:text-red-400"                  bg="bg-red-50 dark:bg-red-900/20" />
              <StatCard label="🔴 Emergency" value={stats.emergency}  color="text-red-700 dark:text-red-400 font-extrabold"   bg="bg-red-100 dark:bg-red-900/30" sub="priority tokens" />
            </>
        }
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 pb-4 flex-shrink-0">
        {/* Date */}
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="input py-2 max-w-[160px]"
        />

        {/* Status */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input py-2 max-w-[160px]">
          <option value="">All Statuses</option>
          <option value="__live__" disabled>── Live ──</option>
          {LIVE_STATUSES.map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          <option value="__done__" disabled>── Completed ──</option>
          {ALL_STATUSES.filter(s => !LIVE_STATUSES.includes(s)).map(s => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
        </select>

        {/* Doctor */}
        {doctors.length > 0 && (
          <select value={filterDoctor} onChange={e => setFilterDoctor(e.target.value)} className="input py-2 max-w-[200px]">
            <option value="">All Doctors</option>
            {doctors.map(d => (
              <option key={d._id} value={d.userId?._id}>Dr. {d.userId?.firstName} {d.userId?.lastName}</option>
            ))}
          </select>
        )}

        {/* Priority */}
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="input py-2 max-w-[150px]">
          <option value="">All Priorities</option>
          <option value="normal">🟢 Normal</option>
          <option value="emergency">🔴 Emergency</option>
          <option value="vip">⭐ VIP</option>
        </select>

        {/* Visit Type */}
        <select value={filterVisit} onChange={e => setFilterVisit(e.target.value)} className="input py-2 max-w-[150px]">
          <option value="">All Visit Types</option>
          <option value="walk-in">Walk-in</option>
          <option value="appointment">Appointment</option>
          <option value="follow-up">Follow-up</option>
        </select>

        {/* Clear filters */}
        {(filterStatus || filterDoctor || filterPriority || filterVisit || filterDate !== today()) && (
          <button
            onClick={() => { setFilterDate(today()); setFilterStatus(''); setFilterDoctor(''); setFilterPriority(''); setFilterVisit(''); }}
            className="text-xs px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            ✕ Clear filters
          </button>
        )}

        <div className="flex-1" />
        <p className="text-xs text-gray-400">Auto-refreshes every 30s for live statuses</p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="table min-w-full">
          <thead className="sticky top-0 z-10">
            <tr>
              {[
                ['Tkn', ''],
                ['Patient', ''],
                ['Doctor / Dept', 'hidden md:table-cell'],
                ['Date / Time', 'hidden sm:table-cell'],
                ['Status', ''],
                ['Type / Priority', 'hidden lg:table-cell'],
                ['Wait / Duration', 'hidden xl:table-cell'],
                ['', ''],
              ].map(([label, cls]) => (
                <th key={label} className={`px-4 py-3 text-left text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/80 ${cls}`}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {loading
              ? Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style={{ width: `${45 + (j * 11) % 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              : appointments.length === 0
                ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-20 text-center">
                      <div className="text-6xl mb-4">📋</div>
                      <p className="text-gray-600 dark:text-gray-400 font-semibold text-xl">No appointments found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {filterStatus || filterDoctor || filterDate !== today()
                          ? 'Try clearing your filters or selecting a different date'
                          : 'No appointments issued today yet'}
                      </p>
                    </td>
                  </tr>
                )
                : appointments.map(appt => (
                    <AppointmentRow
                      key={appt._id}
                      appt={appt}
                      onView={setViewAppt}
                      onUpdate={handleUpdate}
                    />
                  ))
            }
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 flex-shrink-0">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * PAGE_LIMIT + 1}–{Math.min(page * PAGE_LIMIT, total)} of {total.toLocaleString()} · Page {page}/{totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); fetchAppointments(page - 1); }} className="btn-secondary text-sm py-1.5 disabled:opacity-40">← Prev</button>
            {/* Jump to pages */}
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pg = i + 1;
              if (totalPages > 7) {
                const mid = [page - 1, page, page + 1].filter(p => p > 0 && p <= totalPages);
                const all = [...new Set([1, ...mid, totalPages])].sort((a, b) => a - b);
                pg = all[i];
                if (!pg) return null;
              }
              return (
                <button
                  key={pg}
                  onClick={() => { setPage(pg); fetchAppointments(pg); }}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${pg === page ? 'bg-primary-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                  {pg}
                </button>
              );
            })}
            <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); fetchAppointments(page + 1); }} className="btn-secondary text-sm py-1.5 disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {viewAppt && <DetailPanel appt={viewAppt} onClose={() => setViewAppt(null)} onUpdate={handleUpdate} />}
    </div>
  );
}

