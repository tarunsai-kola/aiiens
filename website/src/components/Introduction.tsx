import React from 'react';
import { motion } from 'framer-motion';

const Introduction = () => {
  return (
    <section className="py-24 bg-white relative">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 tracking-tight">
            Healthcare has changed. <br className="hidden md:block" />
            <span className="text-slate-400 font-medium">Patients expect more.</span>
          </h2>
          
          <div className="text-lg md:text-2xl text-slate-600 leading-relaxed space-y-6 font-medium">
            <p>
              Today's patients expect online booking, digital prescriptions, queue tracking, and instant access to their health records.
            </p>
            <p>
              Large hospital networks provide this modern experience. <span className="text-slate-900 font-bold">Independent clinics deserve the same technology.</span>
            </p>
            <p className="text-primary-600 font-bold">
              AIIENS Health makes that possible.
            </p>
          </div>
        </motion.div>

        {/* Expectations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-16">
          {['Online Booking', 'Digital Rx', 'Queue Tracking', 'Health Records', 'AI Assistance'].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="font-semibold text-slate-800 text-sm md:text-base">{item}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Introduction;
