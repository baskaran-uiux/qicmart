"use client"

import { HourglassLoader } from "@/components/ui/HourglassLoader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-blue-500/10 blur-2xl animate-pulse"></div>
        <HourglassLoader size="64" color="#3b82f6" speed="1.2" />
      </div>
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 animate-pulse text-center">
          Preparing your experience
        </p>
        <div className="w-12 h-0.5 bg-zinc-100 rounded-full overflow-hidden">
          <div className="w-full h-full bg-blue-500 origin-left animate-loading-bar"></div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
