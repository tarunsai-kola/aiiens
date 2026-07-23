import React, { useState, useEffect } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ onOpenDemo }: { onOpenDemo?: () => void }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center max-w-7xl">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="AIIENS Health Logo" className="h-10 w-auto" />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#products" className="hover:text-primary-600 transition-colors">Products</a>
          <a href="#platform" className="hover:text-primary-600 transition-colors">Platform</a>
          <a href="#ai" className="hover:text-primary-600 transition-colors">AI</a>
          <a href="#company" className="hover:text-primary-600 transition-colors">Company</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <button onClick={onOpenDemo} className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-600 transition-colors shadow-lg shadow-slate-900/20 block text-center">
            Book Demo
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-slate-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-slate-100 p-6 flex flex-col gap-4 md:hidden glass"
          >
            <a href="#products" className="text-lg font-medium text-slate-700">Products</a>
            <a href="#platform" className="text-lg font-medium text-slate-700">Platform</a>
            <a href="#ai" className="text-lg font-medium text-slate-700">AI</a>
            <a href="#company" className="text-lg font-medium text-slate-700">Company</a>
            <div className="h-px bg-slate-200 my-2" />
            <button onClick={() => { onOpenDemo?.(); setMobileMenuOpen(false); }} className="w-full bg-slate-900 text-white px-5 py-3 rounded-xl font-medium mt-2 block text-center">
              Book Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
