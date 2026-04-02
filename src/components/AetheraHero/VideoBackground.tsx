"use client";

import React, { useEffect, useRef, useState } from 'react';

const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [opacity, setOpacity] = useState(0);
  const videoUrl = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;
    const fadeDuration = 0.5; // seconds

    const update = () => {
      if (video.duration) {
        const currentTime = video.currentTime;
        const duration = video.duration;

        // Fade in at the start (0 to 0.5s)
        if (currentTime < fadeDuration) {
          setOpacity(currentTime / fadeDuration);
        } 
        // Fade out before the end (duration - 0.5s to duration)
        else if (currentTime > duration - fadeDuration) {
          setOpacity((duration - currentTime) / fadeDuration);
        } 
        // Full opacity in the middle
        else {
          setOpacity(1);
        }
      }
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    setOpacity(0);
    setTimeout(() => {
      video.currentTime = 0;
      video.play();
    }, 100);
  };

  return (
    <div className="absolute inset-0 z-0 bg-white" 
         style={{ 
           top: '300px', 
           inset: '300px 0 0 0' 
         }}>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        className="w-full h-full object-cover transition-opacity duration-100"
        style={{ opacity }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white" />
    </div>
  );
};

export default VideoBackground;
