import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

const Transformation = () => {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/20 rounded-full blur-[100px] opacity-50"></div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            The Digital Transformation
          </h2>
          <p className="text-xl text-slate-400">
            From traditional clinics to a modern digital experience.
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Before */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full glass-dark rounded-3xl p-8 md:p-12 border border-slate-700"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 text-center md:text-left">
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-800 text-slate-300 font-semibold mb-4">
                  Before
                </div>
                <h3 className="text-2xl font-bold text-slate-300">Traditional Experience</h3>
              </div>
              <div className="md:w-2/3 grid grid-cols-2 gap-4 text-slate-400 font-medium">
                <div className="flex items-center gap-2">✗ Phone calls for booking</div>
                <div className="flex items-center gap-2">✗ Paper prescriptions</div>
                <div className="flex items-center gap-2">✗ Long waiting times</div>
                <div className="flex items-center gap-2">✗ Manual follow-ups</div>
                <div className="flex items-center gap-2">✗ Fragmented history</div>
                <div className="flex items-center gap-2">✗ No patient app</div>
              </div>
            </div>
          </motion.div>

          {/* Arrow */}
          <div className="my-8 text-primary-400 animate-bounce">
            <ArrowDown size={32} />
          </div>

          {/* After */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full bg-gradient-to-br from-primary-900 to-cyan-900 rounded-3xl p-8 md:p-12 border border-primary-500/30 shadow-2xl shadow-primary-500/20"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 text-center md:text-left">
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary-500 text-white font-semibold mb-4">
                  With AIIENS
                </div>
                <h3 className="text-2xl font-bold text-white">Digital Clinic</h3>
              </div>
              <div className="md:w-2/3 grid grid-cols-2 gap-4 text-primary-100 font-medium">
                <div className="flex items-center gap-2">✓ Online 24/7 Booking</div>
                <div className="flex items-center gap-2">✓ Digital Prescriptions</div>
                <div className="flex items-center gap-2">✓ Live Queue Updates</div>
                <div className="flex items-center gap-2">✓ Automated Reminders</div>
                <div className="flex items-center gap-2">✓ Centralized EMR</div>
                <div className="flex items-center gap-2">✓ Dedicated Patient App</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Transformation;
