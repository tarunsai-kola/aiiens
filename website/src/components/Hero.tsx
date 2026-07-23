import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, ShieldCheck, Database, Zap } from 'lucide-react';
import heroImg from '../assets/hero_illustration.png';

const Hero = ({ onOpenDemo, onOpenBrochure }: { onOpenDemo?: () => void, onOpenBrochure?: () => void }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-gradient-premium"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary-300/30 rounded-full blur-[100px] opacity-60 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-[100px] opacity-60 mix-blend-multiply"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-300/20 rounded-full blur-[120px] opacity-50 mix-blend-multiply pointer-events-none"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-sm text-primary-800 text-sm font-semibold mb-8">
              <span className="flex h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse"></span>
              The Future of Healthcare Infrastructure
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6 drop-shadow-sm">
              Enterprise healthcare <br className="hidden lg:block" />
              technology for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-indigo-500 to-cyan-500">modern clinics.</span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0">
              Transform your clinic with AI-powered workflows, patient engagement tools, and connected digital infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button onClick={onOpenDemo} className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-4 rounded-full font-bold hover:from-primary-600 hover:to-indigo-600 transition-all duration-300 shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group hover:scale-105">
                Book a Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={onOpenBrochure} className="bg-white text-slate-800 px-8 py-4 rounded-full font-bold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
                Download Brochure
              </button>
            </div>
            
            <div className="mt-12 flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 backdrop-blur border border-slate-100 shadow-sm">
                <ShieldCheck size={18} className="text-green-500" /> HIPAA Compliant
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 backdrop-blur border border-slate-100 shadow-sm">
                <Database size={18} className="text-blue-500" /> FHIR Ready
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/70 backdrop-blur border border-slate-100 shadow-sm">
                <Zap size={18} className="text-amber-500" /> Real-time Sync
              </div>
            </div>
          </motion.div>

          {/* Abstract UI / Floating Elements */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:h-[600px] hidden md:block"
          >
            {/* Hero Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
              <div className="relative z-20 animate-float">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-cyan-400/20 rounded-3xl blur-2xl"></div>
                <div className="glass rounded-3xl p-3 shadow-2xl relative z-30 overflow-hidden border border-white/40">
                  <img src={heroImg} alt="AIIENS Health Interface" className="w-full h-auto rounded-2xl border border-slate-100/50 object-cover" />
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
