'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type LightingMood = 'day' | 'golden' | 'night' | 'monochrome';

// Configurable pendant lamp & switch constants
export const LAMP_LEFT_PERCENT = 50; // Horizontal position: exact centre of viewport (50%)
export const LAMP_CORD_LENGTH_VH = 20; // Cord length: 20% of viewport height (20vh)
export const SWITCH_CORNER: 'top-left' | 'top-right' = 'top-left'; // Switch placement corner
export const LAMP_DIM_LEVEL = 0.45; // Dim scene to 45% of brightness when lamp is off
export const LAMP_FADE_DURATION = 0.6; // Light fade duration in seconds
export const DEFAULT_LAMP_STATE = true; // Default state: ON

interface InteriorContextType {
  lightingMood: LightingMood;
  setLightingMood: (m: LightingMood) => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
  toggleSound: () => void;
  lampOn: boolean;
  setLampOn: (on: boolean) => void;
  toggleLamp: () => void;
}

const InteriorContext = createContext<InteriorContextType | undefined>(undefined);

// Web Audio Ambient Synthesizer for luxury architectural ambiance
class AmbientSoundGenerator {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 3);
      this.masterGain.connect(this.ctx.destination);

      // Warm low-frequency drone (55Hz / A1)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, this.ctx.currentTime);

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(110, this.ctx.currentTime);

      // Lowpass filter for smooth warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.6, this.ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(droneGain);
      droneGain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      this.isRunning = true;
    } catch {
      // AudioContext blocked or not supported
    }
  }

  stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.5);
      setTimeout(() => {
        this.ctx?.close();
        this.ctx = null;
        this.isRunning = false;
      }, 1600);
    } catch {
      this.isRunning = false;
    }
  }
}

const ambientAudio = new AmbientSoundGenerator();

export function InteriorProvider({ children }: { children: ReactNode }) {
  const [lightingMood, setLightingMood] = useState<LightingMood>('day');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [lampOn, setLampOn] = useState<boolean>(DEFAULT_LAMP_STATE);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (next) {
        ambientAudio.start();
      } else {
        ambientAudio.stop();
      }
      return next;
    });
  }, []);

  const toggleLamp = useCallback(() => {
    setLampOn((prev) => !prev);
  }, []);

  return (
    <InteriorContext.Provider
      value={{
        lightingMood,
        setLightingMood,
        soundEnabled,
        setSoundEnabled,
        toggleSound,
        lampOn,
        setLampOn,
        toggleLamp,
      }}
    >
      {children}
    </InteriorContext.Provider>
  );
}

export function useInterior() {
  const context = useContext(InteriorContext);
  if (!context) {
    throw new Error('useInterior must be used within an InteriorProvider');
  }
  return context;
}
