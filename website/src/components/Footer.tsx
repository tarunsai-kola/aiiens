import React from 'react';
import { Stethoscope } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 pt-20 pb-10 text-slate-400">
      <div className="container mx-auto px-6 md:px-12 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 select-none mb-6">
              <div className="relative flex items-center justify-center bg-white text-slate-900 w-12 h-12 rounded-xl shadow-sm shrink-0">
                <Stethoscope size={26} strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[1.05rem] font-black text-white leading-[1.15] tracking-wide">
                  AIIENS HEALTH CARE<br />SYSTEMS
                </span>
                <span className="text-[0.75rem] font-medium text-slate-400 mt-0.5 tracking-wide">
                  POWERED BY AIIENS
                </span>
              </div>
            </div>
            <p className="mb-6 max-w-sm">
              Building the Future Infrastructure for Healthcare. Connecting Clinics, Empowering Doctors, and Improving Patient Care.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <span className="text-xs">IN</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <span className="text-xs">TW</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <span className="text-xs">GH</span>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Products</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Clinic Management</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Patient App</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Doctor Workspace</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Pharmacy Software</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">AI Platform</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Partners</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary-400 transition-colors">HIPAA Compliance</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} AIIENS Health. All rights reserved.</p>
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm text-center md:text-right">
            <span>hello@aiiens.com</span>
            <span>+91 8088766989</span>
            <span>+91 8297874231</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
