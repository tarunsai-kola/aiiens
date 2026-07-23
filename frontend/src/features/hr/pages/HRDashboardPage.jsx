import { Link } from 'react-router-dom';
import { Users, CalendarDays, Clock, FileText, IndianRupee } from 'lucide-react';

export default function HRDashboardPage() {
  const modules = [
    { name: 'Staff Directory', icon: Users, path: '/hr/staff', color: 'bg-blue-500', desc: 'Manage employee profiles and salaries' },
    { name: 'Duty Roster', icon: CalendarDays, path: '/hr/roster', color: 'bg-purple-500', desc: 'Assign shifts and manage schedules' },
    { name: 'Daily Attendance', icon: Clock, path: '/hr/attendance', color: 'bg-green-500', desc: 'Mark and view daily staff attendance' },
    { name: 'Leave Requests', icon: FileText, path: '/hr/leaves', color: 'bg-orange-500', desc: 'Approve or reject leave applications' },
    { name: 'Payroll & Salary', icon: IndianRupee, path: '/hr/payroll', color: 'bg-teal-500', desc: 'Generate payslips and process salaries' },
  ];

  return (
    <div className="max-w-screen-xl mx-auto space-y-6 p-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Human Resources</h1>
        <p className="text-gray-500">Staff, Attendance, and Payroll Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {modules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <Link key={idx} to={mod.path} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
              <div className={`w-12 h-12 ${mod.color} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{mod.name}</h3>
              <p className="text-gray-500 text-sm">{mod.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
