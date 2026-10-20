'use client';

import React, { useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import { InteriorProvider } from '@/context/InteriorContext';
import Overlay from '@/components/dom/Overlay';
import Preloader from '@/components/dom/Preloader';

// Dynamically import Three.js Scene to avoid SSR issues
const Scene = dynamic(() => import('@/components/canvas/Scene'), {
  ssr: false,
});

function InteriorExperience() {
  return (
    <main className="fixed inset-0 w-screen h-screen bg-[#050505] text-white overflow-hidden selection:bg-white selection:text-black">
      {/* 3D WebGL Canvas Layer */}
      <Scene />

      {/* Editorial Brutalist UI Overlay with real computed HUD */}
      <Overlay />

      {/* Preloader with useProgress (fades out automatically) */}
      <Preloader />
    </main>
  );
}

const emptySubscribe = () => () => {};

export default function Home() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div className="fixed inset-0 bg-black" />;
  }

  return (
    <InteriorProvider>
      <InteriorExperience />
    </InteriorProvider>
  );
}
