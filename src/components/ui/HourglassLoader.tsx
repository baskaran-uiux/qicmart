"use client"

import { hourglass } from 'ldrs'
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
    // Register the custom element once
    hourglass.register()
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div style={{ width: size, height: size }} />

  return (
    <div className="flex items-center justify-center p-4">
      <l-hourglass
        size={size.toString()}
        bg-opacity={bgOpacity.toString()}
        speed={speed.toString()}
        color={color}
      ></l-hourglass>
    </div>
  )
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'l-hourglass': any
    }
  }
}
