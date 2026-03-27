"use client"

import { useEffect, useState } from 'react'

export interface HourglassLoaderProps {
  size?: number | string
  color?: string
  bgOpacity?: number
  speed?: number | string
}

export function HourglassLoader({ 
  size = 40, 
  color = "#3b82f6", 
  bgOpacity = 0.1, 
  speed = 1.5 
}: HourglassLoaderProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const displaySize = typeof size === 'number' ? `${size}px` : size.toString().endsWith('%') || size.toString().endsWith('px') || size.toString().endsWith('rem') ? size.toString() : `${size}px`

  // SSR placeholder
  if (!isMounted) return <div style={{ width: displaySize, height: displaySize }} />

  // We use a custom SVG implementation to be 100% SSR-safe and avoid "HTMLElement is not defined" issues
  // which are common when using Web Component libraries like 'ldrs' in Next.js.
  return (
    <div className="flex items-center justify-center p-4">
      <div 
        style={{ 
          width: displaySize, 
          height: displaySize,
          animation: `hourglass-spin ${speed}s linear infinite`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          <path
            d="M5 2H19V7L14 12L19 17V22H5V17L10 12L5 7V2Z"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M7 4H17V6.5L12 11.5L7 6.5V4Z"
            fill={color}
            style={{ 
                animation: `fillSandTop ${speed}s ease-in-out infinite`,
                transformOrigin: 'top',
                opacity: 0.8 
            }}
          />
          <path
            d="M12 12.5L17 17.5V20H7V17.5L12 12.5Z"
            fill={color}
            style={{ 
                animation: `fillSandBottom ${speed}s ease-in-out infinite`,
                transformOrigin: 'bottom',
                opacity: 0.8 
            }}
          />
          {/* Falling sand drip */}
          <line 
            x1="12" y1="12" x2="12" y2="13" 
            stroke={color} 
            strokeWidth="1" 
            strokeLinecap="round"
            style={{ animation: `sandDrip ${speed}s linear infinite` }} 
          />
        </svg>
      </div>

      <style>{`
        @keyframes hourglass-spin {
          0% { transform: rotate(0deg); }
          45% { transform: rotate(0deg); }
          55% { transform: rotate(180deg); }
          100% { transform: rotate(180deg); }
        }
        @keyframes fillSandTop {
          0% { transform: scaleY(1); }
          45% { transform: scaleY(0); }
          55% { transform: scaleY(0); }
          100% { transform: scaleY(0); }
        }
        @keyframes fillSandBottom {
          0% { transform: scaleY(0); }
          45% { transform: scaleY(1); }
          55% { transform: scaleY(1); }
          100% { transform: scaleY(1); }
        }
        @keyframes sandDrip {
          0% { transform: translateY(-5px); opacity: 0; }
          10% { opacity: 1; }
          45% { transform: translateY(5px); opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
