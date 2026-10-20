"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Room constants measured from interior.glb CAD coordinate space:
// Long axis is X (running from +X entrance to -X far wall niche).
// Side walls: Z = +6.53 (Shoji screen wall on the left) and Z = -7.47 (Geisha art wall on the right).
// Far wall: X = -7.30 (recessed alcove niche with 3 vases).
// Floor top: Y ≈ 0.68. Ceiling bottom: Y ≈ 8.15.

export const ROOM_CONSTANTS = {
  FLOOR_Y: 0.68,
  CEILING_Y: 8.15,
  FAR_WALL_X: -7.30,
  FLOOR_EDGE_X: 7.47,
  SHOJI_WALL_Z: 6.53, // Left wall
  ART_WALL_Z: -7.47,  // Right wall
  MIDPOINT_Z: -0.47,  // Midpoint between side walls: (6.53 + -7.47) / 2 ≈ -0.47
};

// Named camera framing constants (fine-tunable)
// If the right wall is cropped: increase CAMERA_FOV.
// If the image looks stretched at edges: lower CAMERA_FOV and move CAMERA_X back as far as floor allows.
// Named camera framing constants (verified one-point perspective)
export const CAMERA_X = 14.0;  // Camera moved back just outside the open +X floor edge
export const CAMERA_Y = 4.40;  // Eye elevation keeping horizon at mid-frame
export const CAMERA_Z = -0.47; // Midpoint between side walls (Z = 6.53 and Z = -7.47, ~ -0.5)

export const TARGET_X = -7.30; // Aim down the long axis at far wall niche
export const TARGET_Y = CAMERA_Y - 0.50; // 3.90: 0.5 below camera Y
export const TARGET_Z = -0.47; // Symmetrical central axis (~ -0.5)

export const CAMERA_FOV = 52; // Calm, undistorted perspective capturing both side walls
export const CAMERA_NEAR = 0.05;
export const CAMERA_FAR = 150;

// Named window parallax constants (head-tracking window peering effect)
export const PARALLAX_HORIZONTAL = 1.0; // Horizontal travel at full deflection (±1.0 world units)
export const PARALLAX_VERTICAL = 0.4;   // Vertical travel at full deflection (±0.4 world units)
export const PARALLAX_DAMPING = 0.05;   // Delta-time based smoothing (~0.05 per frame at 60 fps)
export const PARALLAX_INVERT_X = 1;     // 1: pointer right -> camera right; -1: invert
export const PARALLAX_INVERT_Y = 1;     // 1: pointer up -> camera up; -1: invert

// Static orientation vectors
const BASE_POSITION = new THREE.Vector3(CAMERA_X, CAMERA_Y, CAMERA_Z);
const BASE_TARGET = new THREE.Vector3(TARGET_X, TARGET_Y, TARGET_Z);
const WORLD_UP = new THREE.Vector3(0, 1, 0);

// Camera's horizontal right vector derived dynamically from view direction
// (cross product of forward and up ensures correct right axis whether room is along X or Z)
const BASE_FORWARD = new THREE.Vector3()
  .subVectors(BASE_TARGET, BASE_POSITION)
  .normalize();
const CAMERA_RIGHT = new THREE.Vector3()
  .crossVectors(BASE_FORWARD, WORLD_UP)
  .normalize();

export function CameraRig() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);

  const currentOffsetX = useRef(0);
  const currentOffsetY = useRef(0);
  const isPointerInside = useRef(false);

  // Touch device gyro tracking
  const hasDeviceOrientation = useRef(false);
  const deviceOffsetX = useRef(0);
  const deviceOffsetY = useRef(0);

  // Scratch vector to avoid per-frame GC allocations
  const tempPos = useRef(new THREE.Vector3());

  useEffect(() => {
    const datum = CAMERA_Y - ROOM_CONSTANTS.FLOOR_Y; // Real eye height above floor
    console.log("=== CAMERA RIG INITIALIZED ===");
    console.log(`floorY: ${ROOM_CONSTANTS.FLOOR_Y.toFixed(2)}`);
    console.log(`cameraPosition: [${CAMERA_X.toFixed(2)}, ${CAMERA_Y.toFixed(2)}, ${CAMERA_Z.toFixed(2)}]`);
    console.log(`lookTarget: [${TARGET_X.toFixed(2)}, ${TARGET_Y.toFixed(2)}, ${TARGET_Z.toFixed(2)}]`);
    console.log(`FOV: ${CAMERA_FOV}, Near: ${CAMERA_NEAR}`);
    console.log(`Real Eye Height Datum (Y - floorY): ${datum.toFixed(2)}m`);
    console.log(`Camera Right Vector: [${CAMERA_RIGHT.x.toFixed(2)}, ${CAMERA_RIGHT.y.toFixed(2)}, ${CAMERA_RIGHT.z.toFixed(2)}]`);
  }, []);

  // Listen for pointer activity and window leave/blur to ease back to center
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "touch") {
        isPointerInside.current = true;
      }
    };

    const handlePointerLeave = () => {
      isPointerInside.current = false;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave, { passive: true });
    window.addEventListener("blur", handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, []);

  // Optional DeviceOrientation on touch devices
  useEffect(() => {
    let hasOrientationListener = false;
    let baselineBeta: number | null = null;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma === null && e.beta === null) return;
      hasDeviceOrientation.current = true;

      if (baselineBeta === null && e.beta !== null) {
        baselineBeta = e.beta;
      }

      // Gamma: left-right tilt (±30° mapped to ±1)
      const rawGamma = e.gamma ?? 0;
      const normGamma = Math.max(-1, Math.min(1, rawGamma / 30));

      // Beta: front-back tilt relative to baseline (~45°, ±25° mapped to ±1)
      const rawBeta = (e.beta ?? (baselineBeta ?? 45)) - (baselineBeta ?? 45);
      const normBeta = Math.max(-1, Math.min(1, rawBeta / 25));

      deviceOffsetX.current = normGamma * PARALLAX_HORIZONTAL * PARALLAX_INVERT_X;
      deviceOffsetY.current = normBeta * PARALLAX_VERTICAL * PARALLAX_INVERT_Y;
    };

    const requestOrientationPermission = () => {
      try {
        const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<string>;
        };
        if (typeof DeviceOrientationEventAny?.requestPermission === "function") {
          DeviceOrientationEventAny.requestPermission()
            .then((res) => {
              if (res === "granted" && !hasOrientationListener) {
                hasOrientationListener = true;
                window.addEventListener("deviceorientation", handleOrientation, { passive: true });
              }
            })
            .catch(() => {
              // Silently ignore rejection or errors
            });
        }
      } catch {
        // Silently ignore
      }
    };

    // Attach passive orientation listener on standard devices where requestPermission is not needed
    try {
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<string>;
      };
      if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
        if (typeof DeviceOrientationEventAny?.requestPermission !== "function") {
          hasOrientationListener = true;
          window.addEventListener("deviceorientation", handleOrientation, { passive: true });
        }
      }
    } catch {
      // Silently ignore
    }

    // iOS requires permission requested upon a user gesture
    window.addEventListener("pointerdown", requestOrientationPermission, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", requestOrientationPermission);
      if (hasOrientationListener) {
        window.removeEventListener("deviceorientation", handleOrientation);
      }
    };
  }, []);

  useFrame((state, delta) => {
    let targetOffsetX = 0;
    let targetOffsetY = 0;

    if (isPointerInside.current) {
      const px = Math.max(-1, Math.min(1, state.pointer.x));
      const py = Math.max(-1, Math.min(1, state.pointer.y));
      targetOffsetX = px * PARALLAX_HORIZONTAL * PARALLAX_INVERT_X;
      targetOffsetY = py * PARALLAX_VERTICAL * PARALLAX_INVERT_Y;
    } else if (hasDeviceOrientation.current) {
      targetOffsetX = deviceOffsetX.current;
      targetOffsetY = deviceOffsetY.current;
    }

    // Delta-time scaled exponential damping: identical feel across 30Hz, 60Hz, 120Hz+
    const dt = Math.min(delta, 0.1);
    const dampingStep = 1 - Math.exp(-PARALLAX_DAMPING * 60 * dt);

    currentOffsetX.current = THREE.MathUtils.lerp(currentOffsetX.current, targetOffsetX, dampingStep);
    currentOffsetY.current = THREE.MathUtils.lerp(currentOffsetY.current, targetOffsetY, dampingStep);

    // Compute shifted camera position along camera's horizontal right vector and vertical up axis
    // Depth position is unchanged so zoom level never pulses
    tempPos.current
      .copy(BASE_POSITION)
      .addScaledVector(CAMERA_RIGHT, currentOffsetX.current)
      .addScaledVector(WORLD_UP, currentOffsetY.current);

    state.camera.position.copy(tempPos.current);

    // Look target stays firmly locked on the far wall niche.
    // As the camera translates sideways and vertically, lookAt naturally angles
    // the camera back toward the locked target (natural rotational lean without artificial yaw).
    state.camera.lookAt(TARGET_X, TARGET_Y, TARGET_Z);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={CAMERA_FOV}
      position={[CAMERA_X, CAMERA_Y, CAMERA_Z]}
      near={CAMERA_NEAR}
      far={CAMERA_FAR}
    />
  );
}
