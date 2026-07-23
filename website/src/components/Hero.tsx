import React from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, ShieldCheck, Database, Zap } from 'lucide-react';
import heroImg from '../assets/hero_illustration.png';

const Hero = ({ onOpenDemo }: { onOpenDemo?: () => void }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 bg-gradient-premium"></div>
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-primary-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-semibold mb-6">
              <span className="flex h-2 w-2 rounded-full bg-primary-500"></span>
              The Future of Healthcare Infrastructure
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
              Enterprise Healthcare <br className="hidden lg:block" />
              Technology for <span className="text-gradient">Every Clinic</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-lg">
              Transform your clinic into a modern digital healthcare experience with AI-powered workflows, patient engagement, and connected infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button onClick={onOpenDemo} className="bg-slate-900 text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-600 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 group">
                Book a Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-500" /> HIPAA Compliant
              </div>
              <div className="flex items-center gap-2">
                <Database size={18} className="text-blue-500" /> FHIR Ready
              </div>
              <div className="flex items-center gap-2">
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
              <div className="glass rounded-3xl p-2 shadow-2xl relative z-20 animate-float overflow-hidden">
                <img src={heroImg} alt="AIIENS Health Interface" className="w-full h-auto rounded-2xl border border-slate-100 object-cover" />
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
