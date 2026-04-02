"use client";

import React from 'react';
import Navbar from './Navbar';
import VideoBackground from './VideoBackground';

const AetheraHero: React.FC = () => {
  const scrollToPricing = () => {
    const section = document.getElementById('pricing');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white selection:bg-black selection:text-white">
      {/* Background Video Layer */}
      <VideoBackground />

      {/* Navigation Layer */}
      <Navbar />

      {/* Hero Content Section */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen" 
               style={{ paddingTop: 'calc(8rem - 75px)' }}>
        <div className="max-w-7xl mx-auto pb-40">
          
          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-normal font-instrument leading-[0.95] tracking-[-2.46px] text-black animate-fade-rise">
            Scale faster. <span className="text-[#6F6F6F] italic">Sell smarter.</span><br />
            Build your <span className="text-[#6F6F6F] italic">Digital Empire.</span>
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-2xl mx-auto text-base sm:text-lg text-[#6F6F6F] leading-relaxed animate-fade-rise-delay font-inter">
            The ultimate SaaS platform for modern store owners. Launch your boutique, 
            manage your growth, and dominate the market with Qicmart.
          </p>

          {/* Hero CTA Button */}
          <div className="mt-12 animate-fade-rise-delay-2">
            <button 
              onClick={scrollToPricing}
              className="rounded-full px-14 py-5 text-base bg-black text-white hover:scale-[1.03] transition-transform duration-300 shadow-xl font-inter font-medium"
            >
              Get ₹399
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AetheraHero;
