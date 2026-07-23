import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Smartphone, Monitor, Pill, BrainCircuit, ArrowRight } from 'lucide-react';
import clinicBg from '../assets/clinic_bg.png';
import patientBg from '../assets/patient_bg.png';
import doctorBg from '../assets/doctor_bg.png';
import pharmacyBg from '../assets/pharmacy_bg.png';
import aiPlatformBg from '../assets/ai_platform_bg.png';

const products = [
  {
    icon: <Monitor className="text-blue-500" size={32} />,
    title: 'Clinic Management System',
    description: 'Complete operating system for your clinic. Manage appointments, billing, patients, EMR, reports, and staff from a single unified dashboard.',
    features: ['Appointments', 'Billing', 'Patients', 'EMR', 'Reports', 'Staff', 'Analytics'],
    color: 'bg-blue-50 border-blue-100',
    image: clinicBg,
  },
  {
    icon: <Smartphone className="text-cyan-500" size={32} />,
    title: 'Patient App',
    description: 'Give your patients a premium digital experience. Allow them to book, track queues, and access records directly from their smartphones.',
    features: ['Book appointments', 'Queue tracking', 'Medical records', 'Digital prescriptions', 'Health timeline'],
    color: 'bg-cyan-50 border-cyan-100',
    image: patientBg,
  },
  {
    icon: <Stethoscope className="text-indigo-500" size={32} />,
    title: 'Doctor Workspace',
    description: 'Designed specifically for clinical workflows. Review patient history, use our AI clinical copilot, and generate digital prescriptions effortlessly.',
    features: ['Patient history', 'AI Clinical Copilot', 'Consultation workflow', 'Digital prescriptions', 'Clinical insights'],
    color: 'bg-indigo-50 border-indigo-100',
    image: doctorBg,
  },
  {
    icon: <Pill className="text-emerald-500" size={32} />,
    title: 'Pharmacy Software',
    description: 'Integrated pharmacy management. Track inventory, manage billing, monitor expiry dates, and automatically sync with doctor prescriptions.',
    features: ['Inventory', 'Billing', 'Medicine management', 'Purchase management', 'Expiry tracking', 'Sales reports'],
    color: 'bg-emerald-50 border-emerald-100',
    image: pharmacyBg,
  },
  {
    icon: <BrainCircuit className="text-purple-500" size={32} />,
    title: 'AI Platform',
    description: 'Enterprise-grade AI models trained for healthcare. Benefit from clinical AI, patient insights, and intelligent decision support.',
    features: ['Clinical AI', 'Patient AI', 'Health recommendations', 'Documentation', 'Decision support'],
    color: 'bg-purple-50 border-purple-100',
    wide: true,
    image: aiPlatformBg,
  }
];

const Products = () => {
  return (
    <section id="products" className="py-24 bg-slate-50 border-t border-slate-200/50">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="mb-16 md:text-center max-w-3xl mx-auto">
          <h2 className="text-primary-600 font-bold text-sm tracking-wider uppercase mb-3">Our Suite</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
            A Complete Healthcare Ecosystem
          </h3>
          <p className="text-lg text-slate-600">
            Everything you need to run a modern, efficient, and patient-centric healthcare organization, all perfectly integrated.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {products.map((product, idx) => (
            <motion.div
              key={product.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative ${product.wide ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              {/* Background Image Overlay */}
              <div className="absolute inset-0 z-0">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
              </div>

              <div className="relative z-10">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${product.color}`}>
                  {product.icon}
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-3">{product.title}</h4>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-8">
                  {product.features.map(feature => (
                    <span key={feature} className="px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg shadow-sm border border-slate-200">
                      {feature}
                    </span>
                  ))}
                </div>
                
                <button className="flex items-center gap-2 text-primary-600 font-semibold group-hover:text-primary-700 transition-colors">
                  Explore Product <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Products;
