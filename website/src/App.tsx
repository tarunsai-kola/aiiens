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
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary-500 selection:text-white">
      <Navbar onOpenDemo={() => setIsDemoModalOpen(true)} />
      <main>
        <Hero onOpenDemo={() => setIsDemoModalOpen(true)} />
        <Introduction />
        <Products />
        <Features />
        <Transformation />
        <AISection />
        <CTAContact onOpenDemo={() => setIsDemoModalOpen(true)} />
      </main>
      <Footer />
      <DemoModal isOpen={isDemoModalOpen} onClose={() => setIsDemoModalOpen(false)} />
    </div>
  );
}

export default App;
