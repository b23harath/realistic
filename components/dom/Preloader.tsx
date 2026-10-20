'use client';

import React, { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

export default function Preloader() {
  const { progress, active, item } = useProgress();
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Smoothly increment counter to prevent sudden jumps
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev < progress) {
          const step = Math.max(1, Math.ceil((progress - prev) * 0.2));
          return Math.min(100, prev + step);
        }
        return prev;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [progress]);

  useEffect(() => {
    if (displayProgress >= 100 && !active) {
      const timer = setTimeout(() => {
        setIsFading(true);
        const removeTimer = setTimeout(() => {
          setIsDone(true);
        }, 800);
        return () => clearTimeout(removeTimer);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [displayProgress, active]);

  if (isDone) return null;

  const formattedPercent = String(Math.floor(displayProgress)).padStart(2, '0');

  return (
    <div
      role="progressbar"
      aria-label="Loading 3D architectural scene"
      aria-valuenow={displayProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed inset-0 z-50 flex flex-col justify-between bg-black p-8 sm:p-12 md:p-16 transition-opacity duration-700 pointer-events-auto ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-white animate-pulse" />
          <span className="font-mono text-xs sm:text-sm tracking-[0.25em] text-white uppercase font-medium">
            STUDIO // SPACES
          </span>
        </div>
        <div className="font-mono text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest hidden sm:block">
          ARCHITECTURAL RESIDENCE 016 // MILAN
        </div>
      </div>

      {/* Center Counter */}
      <div className="my-auto">
        <div className="font-mono text-[11px] sm:text-xs tracking-widest text-neutral-500 uppercase mb-4 flex items-center gap-2">
          <span className="w-1 h-1 bg-neutral-400" />
          <span>COMPILING GEOMETRY &amp; PBR SHADER BUFFERS</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-7xl sm:text-9xl md:text-[14rem] font-bold tracking-tighter text-white font-sans leading-none select-none">
            {formattedPercent}
          </span>
          <span className="text-3xl sm:text-5xl md:text-7xl font-mono text-neutral-500">
            %
          </span>
        </div>

        {/* Progress Bar with brutalist tick marks */}
        <div className="mt-8 relative w-full max-w-xl">
          <div className="h-[2px] w-full bg-neutral-900 relative overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-150 ease-out"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3 text-[10px] font-mono text-neutral-600">
            <span>CALIBRATION</span>
            <span className="truncate max-w-[200px] text-neutral-400">
              {item ? item.split('/').pop() : 'INTERIOR_SCENE.GLB'}
            </span>
            <span>100% READY</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Monograph */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-neutral-900 pt-6">
        <p className="text-[11px] font-mono text-neutral-500 max-w-md uppercase leading-relaxed tracking-wider">
          &ldquo;Architecture is the masterly, correct and magnificent play of masses brought together in light.&rdquo;
        </p>
        <div className="font-mono text-[10px] text-neutral-600 tracking-widest uppercase">
          INITIALIZING WEBGL 2.0 // HIGH-PERFORMANCE PIPELINE
        </div>
      </div>
    </div>
  );
}
