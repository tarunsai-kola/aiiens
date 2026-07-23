import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Activity, ShieldCheck } from 'lucide-react';
import aiImg from '../assets/ai_intelligence.png';

const AISection = () => {
  return (
    <section id="ai" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-sm font-semibold mb-6">
              <Sparkles size={16} />
              AIIENS Clinical Intelligence
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-6 leading-tight">
              AI Built specifically <br />
              for Healthcare.
            </h2>
            
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              AI is only as useful as the healthcare data it can securely understand. 
              AIIENS Health combines authorized patient records, clinical workflows, and enterprise AI to help doctors make better decisions faster.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <Brain size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Clinical Copilot</h4>
                  <p className="text-slate-600">Assists doctors during consultations by analyzing patient history and suggesting relevant clinical pathways.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Patient AI Assistant</h4>
                  <p className="text-slate-600">Answers routine patient queries, triages symptoms, and helps schedule the right appointments automatically.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2">Private & Secure</h4>
                  <p className="text-slate-600">Zero data retention by base models. All AI operations run securely within your clinic's compliant boundaries.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* AI Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[600px] w-full rounded-3xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-2xl p-2"
          >
             <img src={aiImg} alt="AIIENS AI Intelligence" className="w-full h-full object-cover rounded-2xl border border-slate-800" />
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};

export default AISection;
