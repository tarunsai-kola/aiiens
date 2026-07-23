import React from 'react';
import { motion } from 'framer-motion';

const featuresList = [
  'Appointment Management',
  'Queue Management',
  'Digital Prescriptions',
  'Electronic Medical Records',
  'Billing & Invoicing',
  'Clinical Analytics',
  'Pharmacy Inventory',
  'Patient Engagement',
  'AI Health Assistant',
  'Smart Notifications',
  'Custom Reports',
  'Role-based Management',
];

const Features = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
            Everything you need. <br className="hidden md:block" />
            Nothing you don't.
          </h2>
          <p className="text-lg text-slate-600">
            A comprehensive suite of features built specifically for the needs of modern clinics and healthcare professionals.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuresList.map((feature, idx) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-slate-50 border border-slate-100 p-6 rounded-2xl flex items-center justify-center text-center shadow-sm hover:shadow-lg hover:bg-white hover:border-primary-200 hover:text-primary-600 transition-colors cursor-default"
            >
              <span className="font-semibold text-slate-700">{feature}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
