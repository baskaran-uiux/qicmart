"use client"

import { useEffect, useState } from 'react'

export interface DigitalLoaderProps {
  onComplete?: () => void
}

export default function DigitalLoader({ 
  onComplete 
}: DigitalLoaderProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let currentProgress = 0
    let interval: NodeJS.Timeout

    const updateProgress = () => {
      // Simulate real progress: fast at first, then slows down
      if (currentProgress < 30) {
        currentProgress += Math.random() * 5
      } else if (currentProgress < 70) {
        currentProgress += Math.random() * 2
      } else if (currentProgress < 98) {
        currentProgress += Math.random() * 0.5
      }
      
      const rounded = Math.min(99, Math.round(currentProgress))
      setProgress(rounded)

      // Dynamic interval to make it feel "organic"
      const nextTick = rounded < 30 ? 50 : rounded < 70 ? 100 : 200
      interval = setTimeout(updateProgress, nextTick)
    }

    updateProgress()

    return () => {
      if (interval) clearTimeout(interval)
      if (onComplete) onComplete()
    }
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black font-mono tracking-tighter">
      <div className="w-48 sm:w-64 md:w-80">
        <div className="mb-2 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] font-light">
          <span className="text-zinc-500">LOADING</span>
          <span className="min-w-[4ch] text-white/90">{progress}%</span>
        </div>
        
        <div className="relative h-[1.5px] w-full overflow-hidden bg-zinc-800">
          <div 
            className="h-full bg-white transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style jsx global>{`
        .font-mono {
            font-family: var(--font-mono), 'JetBrains Mono', 'Courier New', Courier, monospace !important;
        }
      `}</style>
    </div>
  )
}
