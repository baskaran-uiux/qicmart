"use client";

import React from 'react';

const Navbar: React.FC = () => {
  const scrollToPricing = () => {
    const section = document.getElementById('pricing');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
        {/* Qicmart Logo */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-black rounded-xl overflow-hidden flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <img src="/logo.png" alt="QICMART Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-normal font-instrument tracking-tight italic uppercase text-black">
            QIC<span className="text-[#6F6F6F]">MART</span>
          </span>
        </div>

        {/* Menu Items */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-inter">
          <a href="#" className="text-black transition-colors">Home</a>
          <a href="#features" className="text-[#6F6F6F] hover:text-black transition-colors">Features</a>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollToPricing(); }} className="text-[#6F6F6F] hover:text-black transition-colors">Pricing</a>
          <a href="#" className="text-[#6F6F6F] hover:text-black transition-colors">Resources</a>
          <a href="#" className="text-[#6F6F6F] hover:text-black transition-colors">Reach Us</a>
        </div>

        {/* CTA Button */}
        <button 
          onClick={scrollToPricing}
          className="rounded-full px-6 py-2.5 text-sm bg-black text-white hover:scale-[1.03] transition-transform duration-300 font-inter font-medium shadow-sm"
        >
          Get ₹399
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
