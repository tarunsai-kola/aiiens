import React from 'react';
import { motion } from 'framer-motion';
import { Server, Lock, Globe, Database, Network } from 'lucide-react';

const SecurityTech = () => {
  return (
    <section id="platform" className="py-24 bg-slate-50 border-y border-slate-200/50">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6">
            Enterprise Architecture
          </h2>
          <p className="text-lg text-slate-600">
            Built on a modern, scalable, and highly secure technology stack designed specifically for healthcare organizations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl p-8 border border-slate-200"
          >
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
              <Lock size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Enterprise Security</h3>
            <ul className="space-y-4 text-slate-600 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                End-to-end Encryption (In-transit & At-rest)
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Granular Role-Based Access Control
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Comprehensive Audit Logging
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Privacy-First Architecture
              </li>
              <li className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                ABDM & FHIR Ready
              </li>
            </ul>
          </motion.div>

          {/* Tech Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-8 border border-slate-200"
          >
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
              <Server size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Modern Stack</h3>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Globe className="text-blue-500" size={20} />
                <span className="font-semibold text-slate-700">React 19</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Server className="text-green-600" size={20} />
                <span className="font-semibold text-slate-700">Node.js</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Database className="text-emerald-500" size={20} />
                <span className="font-semibold text-slate-700">MongoDB</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Network className="text-purple-500" size={20} />
                <span className="font-semibold text-slate-700">Cloud API</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SecurityTech;
