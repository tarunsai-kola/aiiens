import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HeartPulse, 
  Stethoscope, 
  Activity, 
  Building2, 
  ShieldCheck, 
  Zap,
  Globe2,
  Users
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: "Electronic Medical Records",
      description: "Comprehensive patient histories, digital prescriptions, and SOAP notes in one unified interface.",
      icon: <Stethoscope className="text-blue-400" size={32} />
    },
    {
      title: "Pharmacy & LIMS",
      description: "Integrated POS, barcode scanning, live inventory tracking, and complete Laboratory Information Management.",
      icon: <Activity className="text-emerald-400" size={32} />
    },
    {
      title: "Centralized Billing",
      description: "Multi-payment support (UPI, Card, Cash), automated tax calculations, and insurance claim tracking.",
      icon: <ShieldCheck className="text-purple-400" size={32} />
    },
    {
      title: "Multi-Tenant Architecture",
      description: "Run 1,000+ isolated hospitals from a single deployment. Bulletproof data separation.",
      icon: <Globe2 className="text-pink-400" size={32} />
    },
    {
      title: "Omnichannel Notifications",
      description: "Real-time WebSockets, automated SMS, Email, and WhatsApp alerts for appointments and billing.",
      icon: <Zap className="text-yellow-400" size={32} />
    },
    {
      title: "HR & Staff Management",
      description: "Duty rosters, automated payroll, attendance tracking, and granular role-based access control.",
      icon: <Users className="text-indigo-400" size={32} />
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 font-sans">
      
      {/* ── Navbar ────────────────────────────────────────────────────────────── */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-xl flex items-center justify-center">
              <HeartPulse className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">Aiiens<span className="text-blue-500">Global</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
             <a href="#features" className="hover:text-white transition-colors">Features</a>
             <a href="#scale" className="hover:text-white transition-colors">Enterprise</a>
             <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="px-6 py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-200 font-black text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  Register Hospital
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm mb-8 animate-fade-in-up">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            v2.0 Production Ready
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            The Ultimate OS for <br />
            <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Modern Hospitals.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            A fully integrated, highly scalable platform designed to manage patients, pharmacies, laboratories, and billing from a single, intelligent interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2">
              Start Free Trial
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg transition-all flex items-center justify-center gap-2">
              Book a Demo
            </button>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="max-w-6xl mx-auto px-6 mt-20 relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
           <div className="rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-sm p-2 shadow-2xl relative">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
                 <div className="w-3 h-3 rounded-full bg-red-500/80" />
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                 <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="h-[400px] w-full bg-slate-950/80 rounded-b-xl flex items-center justify-center overflow-hidden relative">
                 {/* Abstract UI Representation */}
                 <div className="absolute inset-0 p-8 grid grid-cols-4 gap-6 opacity-40">
                    <div className="col-span-1 border-r border-white/5 space-y-4 pr-6">
                       <div className="h-8 w-full bg-white/5 rounded" />
                       <div className="h-8 w-3/4 bg-white/5 rounded" />
                       <div className="h-8 w-5/6 bg-white/5 rounded" />
                    </div>
                    <div className="col-span-3 space-y-6">
                       <div className="flex gap-4">
                          <div className="h-32 flex-1 bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 rounded-xl" />
                          <div className="h-32 flex-1 bg-gradient-to-br from-emerald-500/20 to-transparent border border-emerald-500/20 rounded-xl" />
                          <div className="h-32 flex-1 bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-500/20 rounded-xl" />
                       </div>
                       <div className="h-64 w-full bg-white/5 border border-white/5 rounded-xl" />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-white/5 relative bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Everything you need. <br/> Nothing you don't.</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">10 fully integrated modules designed to replace the fragmented, legacy software holding your hospital back.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-default">
                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scale Banner ──────────────────────────────────────────────────────── */}
      <section id="scale" className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
           <Building2 className="text-blue-400 mb-6" size={48} />
           <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Engineered for Enterprise</h2>
           <p className="text-xl text-blue-200 max-w-3xl mb-12">Built on a strict Multi-Tenant discriminator pattern. We securely isolate data for over 1,000+ hospital branches while allowing central SaaS administration.</p>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl border-t border-b border-blue-500/20 py-12">
              <div>
                <h4 className="text-5xl font-black text-white mb-2">10+</h4>
                <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">Core Modules</p>
              </div>
              <div>
                <h4 className="text-5xl font-black text-white mb-2">99.9%</h4>
                <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">Uptime</p>
              </div>
              <div>
                <h4 className="text-5xl font-black text-white mb-2">0</h4>
                <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">Data Leaks</p>
              </div>
              <div>
                <h4 className="text-5xl font-black text-white mb-2">∞</h4>
                <p className="text-blue-300 font-bold uppercase tracking-widest text-sm">Scalability</p>
              </div>
           </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12 bg-slate-950 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
           <HeartPulse className="text-emerald-400" size={24} />
           <span className="text-xl font-black text-white tracking-tight">Aiiens<span className="text-blue-500">Global</span></span>
        </div>
        <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Aiiens Global Health Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
