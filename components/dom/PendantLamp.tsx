'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  useInterior,
  LAMP_LEFT_PERCENT,
  LAMP_CORD_LENGTH_VH,
} from '@/context/InteriorContext';

/**
 * Vertical pill-shaped lamp switch toggle.
 * 22px by 40px pill track with 44px min touch target, keyboard accessible.
 * Highly legible over bright shoji with dark backing pill and text shadow.
 */
export function LampSwitch() {
  const { lampOn, toggleLamp } = useInterior();

  return (
    <div className="flex items-center gap-2 pointer-events-auto">
      <button
        type="button"
        role="switch"
        aria-checked={lampOn}
        aria-label="Toggle lamp"
        onClick={toggleLamp}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggleLamp();
          }
        }}
        className="group relative min-w-[44px] min-h-[44px] flex items-center justify-center p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full cursor-pointer"
      >
        {/* Vertical pill track: 22px wide by 40px tall */}
        <div
          className={`w-[22px] h-[40px] rounded-full p-[3px] flex flex-col justify-between transition-all duration-300 border ${
            lampOn
              ? 'bg-[#332214] border-amber-300/70 shadow-[0_0_16px_rgba(255,217,160,0.5)]'
              : 'bg-black/75 border-white/30 shadow-none'
          }`}
        >
          {/* Sliding Knob: 14px diameter, top when ON, bottom when OFF */}
          <div
            className={`w-[14px] h-[14px] rounded-full transition-all duration-300 transform ${
              lampOn
                ? 'translate-y-0 bg-[#fff5e6] shadow-[0_0_10px_rgba(255,217,160,1)]'
                : 'translate-y-[18px] bg-neutral-300 shadow-none'
            }`}
          />
        </div>
      </button>

      {/* Subtle dark backing pill with high-contrast text and shadow for legibility over bright shoji */}
      <span className="hidden sm:inline-flex items-center px-2.5 py-1 bg-black/75 border border-white/20 rounded-md backdrop-blur-md shadow-md font-mono text-[10px] tracking-widest uppercase font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] select-none">
        {lampOn ? 'LIGHT: ON' : 'LIGHT: OFF'}
      </span>
    </div>
  );
}

/**
 * Minimal Scandinavian Pendant Lamp (DOM overlay).
 * Sits at LAMP_LEFT_PERCENT (50% centre line) with cord length LAMP_CORD_LENGTH_VH (20vh).
 * Features pendulum sway, two-step turn-on flicker, hot white-warm bulb, large radial halo,
 * 65° downward light cone, and broad warm light pool on the floor.
 */
export function PendantLamp() {
  const { lampOn } = useInterior();
  const [swayKey, setSwayKey] = useState(0);
  const isFirstMount = useRef(true);

  // Trigger pendulum sway on toggle (skip initial page load)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setSwayKey((prev) => prev + 1);
  }, [lampOn]);

  return (
    <div
      className="fixed top-0 pointer-events-none select-none z-15"
      style={{
        left: `${LAMP_LEFT_PERCENT}%`,
        transform: 'translateX(-50%)',
      }}
      aria-hidden="true"
    >
            {/* Ceiling Anchor Cap */}
            <div className="relative z-20 mx-auto w-[16px] h-[4px] bg-[#221f1c] border-b border-white/10 rounded-b-sm shadow-sm" />

            {/* Upward light spread onto the ceiling around the cap (pendant radiates in all directions) */}
            {lampOn && (
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[260px] sm:w-[340px] h-[90px] sm:h-[120px] rounded-full blur-[20px] sm:blur-[26px] pointer-events-none transition-opacity duration-500 ${
                  swayKey > 0 ? 'animate-lamp-flicker' : ''
                }`}
                style={{
                  background:
                    'radial-gradient(ellipse 50% 50% at 50% 40%, rgba(255, 238, 204, 0.32) 0%, rgba(255, 212, 142, 0.16) 40%, rgba(245, 175, 80, 0.05) 75%, transparent 100%)',
                  mixBlendMode: 'screen',
                }}
              />
            )}

            {/* Pendulum sway wrapper pivoting strictly from the ceiling cap anchor */}
            <div
              key={swayKey}
              className={`flex flex-col items-center ${swayKey > 0 ? 'animate-lamp-sway' : ''}`}
              style={{ transformOrigin: 'top center' }}
            >
              {/* Thin Hanging Cord - kept clearly visible in front of ceiling glow */}
              <div
                className="relative z-10 w-[1.5px] bg-[#2b2724] border-x border-black/40"
                style={{ height: `${LAMP_CORD_LENGTH_VH}vh` }}
              />

              {/* Lamp Shade & Light Effects Assembly */}
              <div className="relative flex flex-col items-center">
                {/* Minimal Scandinavian Capsule Shade: 26px wide by 56px tall on desktop (20px by 44px on mobile) */}
                <svg
                  className="w-[20px] h-[44px] md:w-[26px] md:h-[56px] transition-all duration-500 overflow-visible"
                  viewBox="0 0 26 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Metallic gradient for dark brass/bronze shade */}
                    <linearGradient id="pendantMetalOn" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2e2720" />
                      <stop offset="35%" stopColor="#4a3e32" />
                      <stop offset="70%" stopColor="#362d24" />
                      <stop offset="100%" stopColor="#1e1a17" />
                    </linearGradient>
                    <linearGradient id="pendantMetalOff" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1c1917" />
                      <stop offset="50%" stopColor="#2a2724" />
                      <stop offset="100%" stopColor="#131110" />
                    </linearGradient>

                    {/* Hotter white-warm bulb gradient (#fff1c9 core fading to amber) */}
                    <radialGradient id="pendantBulb" cx="50%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="25%" stopColor="#fff1c9" />
                      <stop offset="65%" stopColor="#ffd285" />
                      <stop offset="100%" stopColor="#ff9a2b" />
                    </radialGradient>
                  </defs>

                  {/* Socket Neck */}
                  <rect
                    x="9"
                    y="0"
                    width="8"
                    height="6"
                    rx="1"
                    fill={lampOn ? '#3a3229' : '#1a1816'}
                  />

                  {/* Main Capsule Body */}
                  <rect
                    x="2"
                    y="6"
                    width="22"
                    height="34"
                    rx="2"
                    fill={lampOn ? 'url(#pendantMetalOn)' : 'url(#pendantMetalOff)'}
                    stroke={lampOn ? '#5c4d3d' : '#2b2724'}
                    strokeWidth="0.75"
                  />

                  {/* Rounded Bottom Bowl */}
                  <path
                    d="M 2 40 C 2 52, 24 52, 24 40 Z"
                    fill={lampOn ? 'url(#pendantMetalOn)' : 'url(#pendantMetalOff)'}
                    stroke={lampOn ? '#5c4d3d' : '#2b2724'}
                    strokeWidth="0.75"
                  />

                  {/* Hot White-Warm Bulb at base opening */}
                  {lampOn ? (
                    <g className={swayKey > 0 ? 'animate-lamp-flicker' : ''}>
                      <ellipse
                        cx="13"
                        cy="44"
                        rx="6.5"
                        ry="3.5"
                        fill="url(#pendantBulb)"
                        style={{
                          filter:
                            'drop-shadow(0 0 5px #ffffff) drop-shadow(0 0 12px #ffd285) drop-shadow(0 0 24px #ff9e3b)',
                        }}
                      />
                      {/* Hot core filament */}
                      <ellipse
                        cx="13"
                        cy="43.5"
                        rx="3.2"
                        ry="1.6"
                        fill="#ffffff"
                        style={{ opacity: 0.96 }}
                      />
                    </g>
                  ) : (
                    <ellipse
                      cx="13"
                      cy="44"
                      rx="6"
                      ry="2.5"
                      fill="#1f1d1b"
                    />
                  )}
                </svg>

                {/* ON STATE: Layered soft gradients anchored exactly to the bulb at the bottom of shade */}
                {lampOn && (
                  <div
                    className={`absolute left-1/2 top-[34.5px] md:top-[44px] pointer-events-none transition-opacity duration-500 ${
                      swayKey > 0 ? 'animate-lamp-flicker' : ''
                    }`}
                  >
                    {/* Layer 1: Tight, bright core (about 1.5x shade width), near-white warm (#fff1c9) fading to transparent */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-[30px] h-[30px] md:w-[40px] md:h-[40px] rounded-full blur-[2px] md:blur-[3px]"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 50%, #ffffff 0%, #fff1c9 35%, rgba(255, 241, 201, 0.65) 60%, rgba(255, 241, 201, 0) 100%)',
                        mixBlendMode: 'screen',
                      }}
                    />

                    {/* Layer 2: Medium halo (about 5x shade width), amber, with smooth eased falloff */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-[105px] h-[105px] md:w-[135px] md:h-[135px] rounded-full blur-[8px] md:blur-[12px]"
                      style={{
                        background:
                          'radial-gradient(circle at 50% 50%, rgba(255, 222, 142, 0.90) 0%, rgba(255, 192, 92, 0.65) 26%, rgba(245, 150, 45, 0.35) 54%, rgba(230, 115, 20, 0.10) 78%, rgba(220, 90, 10, 0) 100%)',
                        mixBlendMode: 'screen',
                      }}
                    />

                    {/* Layer 3: Very large, faint elliptical wash, wider than tall (60vw wide by 45vh high), warm tone, long falloff */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[45vh] rounded-full blur-[24px] md:blur-[32px]"
                      style={{
                        background:
                          'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 226, 170, 0.26) 0%, rgba(255, 204, 138, 0.17) 28%, rgba(245, 172, 92, 0.08) 58%, rgba(232, 136, 52, 0.02) 80%, transparent 100%)',
                        mixBlendMode: 'screen',
                      }}
                    />

                    {/* Layer 4: Soft elliptical pool below lamp spreading across coffee table and rug (45vw wide), centred lower */}
                    <div
                      className="absolute -translate-x-1/2 -translate-y-1/2 top-[36vh] md:top-[38vh] w-[45vw] h-[26vh] md:h-[30vh] rounded-full blur-[22px] md:blur-[30px]"
                      style={{
                        background:
                          'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255, 230, 172, 0.38) 0%, rgba(255, 208, 138, 0.22) 34%, rgba(248, 175, 90, 0.09) 64%, rgba(236, 142, 58, 0.02) 84%, transparent 100%)',
                        mixBlendMode: 'screen',
                      }}
                    />
                  </div>
                )}
        </div>
      </div>
    </div>
  );
}
