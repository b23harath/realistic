'use client';

import React from 'react';
import { EffectComposer, Bloom, Vignette, ToneMapping, N8AO } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

interface EffectsProps {
  enablePostProcessing?: boolean;
}

export default function Effects({ enablePostProcessing = true }: EffectsProps) {
  if (!enablePostProcessing) return null;

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      {/* Cinematic ToneMapping */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Screen Space Ambient Occlusion for realistic corner depth */}
      <N8AO
        aoRadius={0.35}
        intensity={1.5}
        distanceFalloff={0.4}
        quality="medium"
      />

      {/* Subtle bloom on luminous highlights without whitewash */}
      <Bloom
        luminanceThreshold={0.92}
        luminanceSmoothing={0.18}
        intensity={0.25}
        radius={0.5}
        mipmapBlur
      />

      {/* Vignette to guide gaze toward the architectural focal center */}
      <Vignette
        darkness={0.45}
        offset={0.35}
        eskil={false}
      />
    </EffectComposer>
  );
}
