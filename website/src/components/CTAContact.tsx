import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTAContact = ({ onOpenDemo }: { onOpenDemo?: () => void }) => {
  return (
    <section className="py-24 bg-slate-950 text-white border-b border-slate-800">
      <div className="container mx-auto px-6 md:px-12 max-w-5xl">
        <div className="bg-gradient-to-br from-primary-900/50 to-cyan-900/50 rounded-3xl border border-slate-800 p-8 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Ready to upgrade your clinic?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join hundreds of healthcare organizations that are delivering world-class digital experiences with AIIENS Health.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onOpenDemo} className="bg-primary-600 text-white px-8 py-4 rounded-full font-bold hover:bg-primary-500 transition-colors shadow-lg shadow-primary-600/30 flex items-center justify-center gap-2 group">
              Book a Demo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={onOpenDemo} className="bg-slate-800 text-white px-8 py-4 rounded-full font-semibold hover:bg-slate-700 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAContact;
