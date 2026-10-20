"use client";

import { useMemo, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, ToneMapping, Bloom, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { InteriorModel } from "./InteriorModel";
import {
  useInterior,
  LAMP_DIM_LEVEL,
  LAMP_FADE_DURATION,
} from "@/context/InteriorContext";

function SceneLighting() {
  const { lightingMood, lampOn } = useInterior();

  // Niche wall spotlight aim target (X = -7.30, Y = 3.2, Z = -0.47)
  const nicheTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(-7.30, 3.2, -0.47);
    return obj;
  }, []);

  // Pendant lamp downward spotlight aim target at room center floor (X = 0, Y = 0.68, Z = -0.5)
  const lampTarget = useMemo(() => {
    const obj = new THREE.Object3D();
    obj.position.set(0.0, 0.68, -0.5);
    return obj;
  }, []);

  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const hemiRef = useRef<THREE.HemisphereLight>(null!);
  const sunRef = useRef<THREE.DirectionalLight>(null!);
  const fillRef = useRef<THREE.DirectionalLight>(null!);
  const upFillRef = useRef<THREE.DirectionalLight>(null!);
  const nicheSpotRef = useRef<THREE.SpotLight>(null!);
  const lampSpotRef = useRef<THREE.SpotLight>(null!);
  const lampPointRef = useRef<THREE.PointLight>(null!);
  const lampBounceRef = useRef<THREE.PointLight>(null!);

  // Lighting parameters per preset
  const lighting = useMemo(() => {
    switch (lightingMood) {
      case "golden":
        return {
          ambientColor: "#ffe6bc",
          ambientIntensity: 0.45,
          hemiSky: "#fff2db",
          hemiGround: "#6e4722",
          hemiIntensity: 0.70,
          sunColor: "#ff9d3b",
          sunIntensity: 4.5,
          fillColor: "#ffc885",
          fillIntensity: 2.5,
          nicheColor: "#ffb459",
          nicheIntensity: 18.0,
          upFillColor: "#ffcf94",
          upFillIntensity: 1.4,
          envIntensity: 1.20,
          exposure: 1.15,
        };
      case "night":
        return {
          ambientColor: "#3a2d22",
          ambientIntensity: 0.28,
          hemiSky: "#524234",
          hemiGround: "#2a1e15",
          hemiIntensity: 0.40,
          sunColor: "#856f54",
          sunIntensity: 1.2,
          fillColor: "#5c4a3b",
          fillIntensity: 1.0,
          nicheColor: "#ffa844",
          nicheIntensity: 14.0,
          upFillColor: "#66503c",
          upFillIntensity: 0.6,
          envIntensity: 0.50,
          exposure: 1.10,
        };
      case "monochrome":
        return {
          ambientColor: "#f2eee8",
          ambientIntensity: 0.32,
          hemiSky: "#faf7f2",
          hemiGround: "#36322e",
          hemiIntensity: 0.55,
          sunColor: "#ffffff",
          sunIntensity: 3.6,
          fillColor: "#ebe5dc",
          fillIntensity: 2.2,
          nicheColor: "#fffaf0",
          nicheIntensity: 15.0,
          upFillColor: "#ded7cc",
          upFillIntensity: 1.0,
          envIntensity: 0.75,
          exposure: 1.12,
        };
      case "day":
      default:
        return {
          ambientColor: "#fff4e5",
          ambientIntensity: 0.45,
          hemiSky: "#fff6ea",
          hemiGround: "#63472c",
          hemiIntensity: 0.72,
          sunColor: "#fff4e5",
          sunIntensity: 3.8,
          fillColor: "#f0e4d4",
          fillIntensity: 2.4,
          nicheColor: "#ffe7bf",
          nicheIntensity: 18.0,
          upFillColor: "#eeddc8",
          upFillIntensity: 1.2,
          envIntensity: 1.15,
          exposure: 1.14,
        };
    }
  }, [lightingMood]);

  // Smooth factor tracking lamp on/off state (~0.6s damped)
  const lampFactor = useRef(lampOn ? 1.0 : LAMP_DIM_LEVEL);

  useFrame((state, delta) => {
    const targetFactor = lampOn ? 1.0 : LAMP_DIM_LEVEL;
    const dt = Math.min(delta, 0.1);
    // Smooth damping: 0.6s fade duration
    const step = 1 - Math.exp(-(1 / LAMP_FADE_DURATION) * 4 * dt);
    lampFactor.current = THREE.MathUtils.lerp(lampFactor.current, targetFactor, step);

    const f = lampFactor.current;
    // 0 to 1 progress for the lamp's own dedicated illumination
    const lampProgress = Math.max(0, Math.min(1, (f - LAMP_DIM_LEVEL) / (1.0 - LAMP_DIM_LEVEL)));

    // 1. Dedicated Pendant Lamp 3D Lights inside room at ceiling centre [0, 6.4, -0.5]
    // Point light spreads gradually across floor, walls, ceiling, sofa and both side walls
    if (lampPointRef.current) {
      lampPointRef.current.intensity = 72.0 * lampProgress;
    }
    // Wide spotlight (85-90° spread, penumbra 1) provides extra pooling with no visible circle or edge
    if (lampSpotRef.current) {
      lampSpotRef.current.intensity = 48.0 * lampProgress;
    }
    // Gentle warm bounce fill for ceiling and far wall
    if (lampBounceRef.current) {
      lampBounceRef.current.intensity = 22.0 * lampProgress;
    }

    // 2. Ambient fill & ceiling upfill (softens shadows and adds bounce light in all presets)
    if (ambientRef.current) {
      ambientRef.current.intensity = lighting.ambientIntensity * f + (0.12 * lampProgress);
    }
    if (upFillRef.current) {
      upFillRef.current.intensity = lighting.upFillIntensity * f + (0.45 * lampProgress);
    }

    // 3. Hemisphere light
    if (hemiRef.current) {
      hemiRef.current.intensity = lighting.hemiIntensity * f;
    }

    // 4. Sunlight through shoji: stays clearly visible as the daylight even when room is dimmed
    if (sunRef.current) {
      sunRef.current.intensity = lighting.sunIntensity * (0.65 + 0.35 * f);
    }

    // 5. Secondary fill on right wall & ceiling upfill
    if (fillRef.current) {
      fillRef.current.intensity = lighting.fillIntensity * f;
    }
    if (upFillRef.current) {
      upFillRef.current.intensity = lighting.upFillIntensity * f;
    }

    // 6. Niche spot
    if (nicheSpotRef.current) {
      nicheSpotRef.current.intensity = lighting.nicheIntensity * (0.55 + 0.45 * f);
    }

    // 7. Tone mapping exposure: lowers to ~70% when lamp is off so the room looks dim at dusk
    const targetExposure = lighting.exposure * (0.70 + 0.30 * lampProgress);
    state.gl.toneMappingExposure = THREE.MathUtils.lerp(state.gl.toneMappingExposure, targetExposure, step);
  });

  return (
    <>
      {/* Soft warm ambient fill */}
      <ambientLight ref={ambientRef} intensity={lighting.ambientIntensity} color={lighting.ambientColor} />

      {/* Warm hemisphere light */}
      <hemisphereLight
        ref={hemiRef}
        args={[lighting.hemiSky, lighting.hemiGround, lighting.hemiIntensity]}
      />

      {/* Primary warm sunlight entering through the left shoji wall (Z = +6.53) */}
      <directionalLight
        ref={sunRef}
        position={[-1.0, 7.0, 10.0]}
        intensity={lighting.sunIntensity}
        color={lighting.sunColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={0.00005}
        shadow-normalBias={0.02}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
      />

      {/* Secondary warm fill light illuminating the geisha artwork wall (Z = -7.47) */}
      <directionalLight
        ref={fillRef}
        position={[-1.0, 6.0, -10.0]}
        intensity={lighting.fillIntensity}
        color={lighting.fillColor}
      />

      {/* Gentle upward warm fill light illuminating lacquered wood ceiling */}
      <directionalLight
        ref={upFillRef}
        position={[0.0, 0.5, 0.0]}
        target={nicheTarget}
        intensity={lighting.upFillIntensity}
        color={lighting.upFillColor}
      />

      {/* Targets */}
      <primitive object={nicheTarget} />
      <primitive object={lampTarget} />

      {/* Calibrated warm spotlight aimed directly at the niche wall */}
      <spotLight
        ref={nicheSpotRef}
        position={[-3.8, 6.2, -0.47]}
        target={nicheTarget}
        intensity={lighting.nicheIntensity}
        angle={0.65}
        penumbra={0.75}
        decay={1.2}
        distance={16}
        color={lighting.nicheColor}
        castShadow={false}
      />

      {/* REAL THREE.JS PENDANT LAMP LIGHTS (world space room centre under ceiling: X = 0, Y = 6.4, Z = -0.5) */}
      {/* 1. Spreading Point Light at ceiling centre line with gradual falloff: lights floor, walls, ceiling, sofa and side walls */}
      <pointLight
        ref={lampPointRef}
        position={[0.0, 6.4, -0.5]}
        color="#ffdca8"
        intensity={72.0}
        distance={34}
        decay={1.2}
      />

      {/* 2. Extra wide spotlight (about 85-90° total spread, penumbra: 1) for soft downward pool with NO visible circle on surfaces */}
      <spotLight
        ref={lampSpotRef}
        position={[0.0, 6.5, -0.5]}
        target={lampTarget}
        color="#ffd694"
        intensity={48.0}
        angle={0.76}
        penumbra={1.0}
        decay={1.3}
        distance={28}
        castShadow={false}
      />

      {/* 3. Gentle warm bounce fill so ceiling and far wall pick up soft bounce light */}
      <pointLight
        ref={lampBounceRef}
        position={[0.0, 2.8, -2.0]}
        color="#ffcf96"
        intensity={22.0}
        distance={22}
        decay={1.35}
      />

      {/* Warm studio environment with lightformers */}
      <Environment environmentIntensity={lighting.envIntensity * (lampOn ? 1.0 : 0.75)}>
        <Lightformer
          form="rect"
          intensity={4.5}
          color="#ffe2a8"
          position={[-0.5, 4.5, 6.5]}
          scale={[15, 8, 1]}
          target={[0, 4.5, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.8}
          color="#e8cca5"
          position={[0, 8.0, 0]}
          scale={[16, 16, 1]}
          rotation={[Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color="#6b4421"
          position={[0, 0.5, 0]}
          scale={[16, 16, 1]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={2.5}
          color="#ffdca0"
          position={[-7.2, 4.0, -0.47]}
          scale={[8, 8, 1]}
          target={[0, 4.0, 0]}
        />
      </Environment>
    </>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 h-screen w-screen bg-[#0a0806]">
      <Canvas
        shadows
        camera={{
          position: [14.0, 4.40, -0.47],
          fov: 52,
          near: 0.05,
          far: 150,
        }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <color attach="background" args={["#0c0a08"]} />
        <CameraRig />

        {/* Dynamic Architectural Scene Lighting with Lamp Control */}
        <SceneLighting />

        <Suspense fallback={null}>
          <InteriorModel />
        </Suspense>

        {/* Post-processing: Soft wide bloom on shoji/lanterns + filmic tone mapping + subtle vignette */}
        <EffectComposer enableNormalPass={false}>
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Bloom
            luminanceThreshold={0.88}
            luminanceSmoothing={0.25}
            intensity={0.35}
            mipmapBlur
            radius={0.7}
          />
          <Vignette offset={0.40} darkness={0.30} />
        </EffectComposer>

        <AdaptiveDpr pixelated />
      </Canvas>
    </div>
  );
}
