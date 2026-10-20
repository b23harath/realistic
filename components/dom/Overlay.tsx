'use client';

import React, { useState } from 'react';
import { useInterior, LightingMood, SWITCH_CORNER } from '@/context/InteriorContext';
import { LampSwitch, PendantLamp } from './PendantLamp';
import {
  Volume2,
  VolumeX,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  X,
  ArrowUpRight,
} from 'lucide-react';

export default function Overlay() {
  const {
    lightingMood,
    setLightingMood,
    soundEnabled,
    toggleSound,
  } = useInterior();

  const [showContactModal, setShowContactModal] = useState(false);

  const moodButtons: { id: LightingMood; label: string; icon: React.ReactNode }[] = [
    { id: 'day', label: 'DAYLIGHT', icon: <Sun size={12} /> },
    { id: 'golden', label: 'GOLDEN', icon: <Sunset size={12} /> },
    { id: 'night', label: 'NOCTURNE', icon: <Moon size={12} /> },
    { id: 'monochrome', label: 'MONO', icon: <Sparkles size={12} /> },
  ];

  return (
    <>
      {/* ========================================================= */}
      {/* PENDANT LAMP (DOM OVERLAY)                                */}
      {/* ========================================================= */}
      <PendantLamp />

      <div className="fixed top-0 inset-x-0 z-20 pointer-events-none p-6 sm:p-8 md:p-12 text-white select-none">
        {/* ========================================================= */}
        {/* TOP NAVIGATION BAR                                        */}
        {/* ========================================================= */}
        <header
          className={`flex items-center ${
            SWITCH_CORNER === 'top-left' ? 'justify-between' : 'justify-end'
          } border-b border-white/10 pb-4 backdrop-blur-[2px]`}
        >
          {/* Switch placed at top-left corner */}
          {SWITCH_CORNER === 'top-left' && <LampSwitch />}

          {/* Lighting Mode Controls & Sound & Inquire */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pointer-events-auto">
            {/* Switch placed at top-right corner if configured */}
            {SWITCH_CORNER === 'top-right' && <LampSwitch />}
            {/* Lighting Mode Switcher */}
            <div className="flex items-center bg-black/60 border border-white/15 p-0.5 rounded-none backdrop-blur-md">
              {moodButtons.map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setLightingMood(btn.id)}
                  title={`Switch lighting mood to ${btn.label}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono tracking-wider transition-all uppercase ${
                    lightingMood === btn.id
                      ? 'bg-white text-black font-bold shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {btn.icon}
                  <span className="hidden sm:inline">{btn.label}</span>
                </button>
              ))}
            </div>

            {/* Ambient Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 border text-[10px] font-mono tracking-widest transition-all uppercase backdrop-blur-md ${
                soundEnabled
                  ? 'bg-white/10 border-white text-white'
                  : 'bg-black/40 border-white/15 text-neutral-400 hover:text-white hover:border-white/40'
              }`}
            >
              {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
              <span className="hidden sm:inline">
                {soundEnabled ? 'AUDIO: ON' : 'AUDIO: OFF'}
              </span>
            </button>

            {/* Inquire CTA */}
            <button
              onClick={() => setShowContactModal(true)}
              className="px-3.5 py-1.5 text-[11px] font-mono tracking-widest bg-white text-black hover:bg-neutral-200 font-bold transition-colors uppercase border border-white"
            >
              INQUIRE
            </button>
          </div>
        </header>
      </div>

      {/* ========================================================= */}
      {/* SOFT BOTTOM LEGIBILITY GRADIENT                           */}
      {/* ========================================================= */}
      <div
        className="fixed bottom-0 inset-x-0 h-44 sm:h-56 md:h-64 pointer-events-none bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"
        aria-hidden="true"
      />

      {/* ========================================================= */}
      {/* HERO TEXT BLOCK (BOTTOM-LEFT)                             */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 z-20 pointer-events-none p-6 sm:p-8 md:p-12 text-white select-none max-w-full">
        <div className="flex flex-col-reverse md:flex-row md:items-end gap-5 sm:gap-6 md:gap-8 max-w-full">
          {/* Headline on the left */}
          <h1
            className="font-sans font-bold uppercase tracking-[-0.03em] leading-[0.88] text-white shrink-0 drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] hero-headline-animate"
            style={{
              fontSize: 'clamp(54px, 10vw, 200px)',
            }}
          >
            UNTOLD
          </h1>

          {/* Paragraph to the right of headline (desktop) / stacked above (mobile) */}
          <p className="font-sans text-[12px] md:text-[13.5px] text-white/80 leading-[1.5] max-w-[420px] text-left drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] md:pb-1.5 hero-paragraph-animate">
            Every brand has a powerful story waiting beneath the surface, but few ever find the voice to tell it. At UNTOLD, we channel boundless, untapped creativity to craft visual narratives that resonate deeply with your audience. We transform your hidden potential into an unmistakable identity that commands attention and leaves a lasting impression.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* INQUIRY / CONTACT MODAL                                   */}
      {/* ========================================================= */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 p-8 text-white flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="font-mono text-xs tracking-widest uppercase text-neutral-400">
                STUDIO // ARCHITECTURAL INQUIRY
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight uppercase">
                LOFT 16 RESIDENCE
              </h2>
              <p className="mt-2 text-xs font-mono text-neutral-400 leading-relaxed">
                Complete architectural dossiers, engineering drawings, and high-resolution material specifications are available for licensed fabrication or private commissions.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you. The studio architectural dossier has been dispatched.');
                setShowContactModal(false);
              }}
              className="flex flex-col gap-4 font-mono text-xs"
            >
              <div>
                <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
                  REPRESENTATIVE EMAIL
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@atelier.com"
                  className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-[10px] text-neutral-500 uppercase tracking-widest mb-1">
                  COMMISSION INQUIRY TYPE
                </label>
                <select className="w-full bg-neutral-900 border border-neutral-800 px-3 py-2.5 text-white focus:outline-none focus:border-white">
                  <option>Full Architectural Blueprint Package</option>
                  <option>Bespoke Basalt &amp; Timber Millwork Commission</option>
                  <option>Private Residence Consultation</option>
                </select>
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 bg-white text-black font-mono text-xs py-3 font-bold uppercase hover:bg-neutral-200 transition-colors"
              >
                <span>REQUEST COMPLETE BLUEPRINT DOSSIER</span>
                <ArrowUpRight size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
