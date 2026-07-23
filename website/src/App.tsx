import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Introduction from './components/Introduction';
import Products from './components/Products';
import Features from './components/Features';
import Transformation from './components/Transformation';
import AISection from './components/AISection';
import CTAContact from './components/CTAContact';
import Footer from './components/Footer';
import DemoModal from './components/DemoModal';

function App() {
  const [modalMode, setModalMode] = useState<'none' | 'demo' | 'brochure'>('none');

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary-500 selection:text-white">
      <Navbar onOpenDemo={() => setModalMode('demo')} />
      <main>
        <Hero onOpenDemo={() => setModalMode('demo')} onOpenBrochure={() => setModalMode('brochure')} />
        <Introduction />
        <Products />
        <Features />
        <Transformation />
        <AISection />
        <CTAContact onOpenDemo={() => setModalMode('demo')} />
      </main>
      <Footer />
      <DemoModal isOpen={modalMode !== 'none'} mode={modalMode} onClose={() => setModalMode('none')} />
    </div>
  );
}

export default App;
