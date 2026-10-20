"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import * as THREE from "three";

export function InteriorModel() {
  const { scene } = useGLTF("/models/interior.glb");

  useEffect(() => {
    const emissiveMatches: { mesh: string; material: string }[] = [];

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.raycast = () => null; // Disable all click/hotspot raycasting

        if (mesh.material) {
          const mat = mesh.material as THREE.MeshStandardMaterial;
          const matName = mat.name || "";
          const meshName = mesh.name || "";

          // 1. SHOJI SCREENS & FLOOR LANTERNS (Material.005)
          // Plane.006 is the main left shoji wall; Cube / Cube.001 are lanterns; Plane.004 / Plane.023 are shoji panels
          if (matName === "Material.005") {
            const isLantern = (
              meshName.includes("Cube_Material.005") ||
              meshName.includes("Cube.001_Material.005")
            );

            mesh.material = (mesh.material as THREE.Material).clone();
            const shojiMat = mesh.material as THREE.MeshStandardMaterial;
            // Warm cream glow that softens edges without clipping to pure white
            shojiMat.emissive = new THREE.Color("#ffebd0");
            shojiMat.emissiveIntensity = isLantern ? 1.8 : 1.35;
            shojiMat.roughness = 0.70;
            shojiMat.metalness = 0.0;
            shojiMat.toneMapped = true;
            shojiMat.needsUpdate = true;
          }

          // 2. PLANTS & FOLIAGE LEAVES (Material.010 and Material.012)
          // Strictly non-emissive wabi-sabi leaves in vases and planters
          else if (matName === "Material.010" || matName === "Material.012") {
            mesh.material = (mesh.material as THREE.Material).clone();
            const leafMat = mesh.material as THREE.MeshStandardMaterial;
            leafMat.transparent = true;
            leafMat.alphaTest = 0.5;
            leafMat.depthWrite = true;
            leafMat.emissive = new THREE.Color(0, 0, 0);
            leafMat.emissiveIntensity = 0.0;
            leafMat.color.set("#363a2e"); // Natural muted wabi-sabi olive green
            leafMat.roughness = 0.82;
            leafMat.metalness = 0.0;
            leafMat.toneMapped = true;
            leafMat.needsUpdate = true;
          }

          // 3. WET WOOD FLOOR (Material.001)
          // Warm dark wood that looks wet (roughness 0.18 in 0.15 - 0.25 range, catching soft yellow shoji glint)
          else if (matName === "Material.001") {
            const floorMat = mesh.material as THREE.MeshStandardMaterial;
            floorMat.color.set("#2a221a"); // Warm dark wood
            floorMat.roughness = 0.18;    // Wet wood finish in 0.15 - 0.25 range
            floorMat.metalness = 0.03;
            floorMat.envMapIntensity = 1.50; // Catches soft yellow shoji glints
            floorMat.needsUpdate = true;
          }

          // 4. LACQUERED BROWN WOOD CEILING (Material.004)
          // Warm lacquered brown wood with soft reflections catching warm light from shoji
          else if (matName === "Material.004") {
            const ceilingMat = mesh.material as THREE.MeshStandardMaterial;
            ceilingMat.color.set("#58412e"); // Warm rich lacquered brown wood
            ceilingMat.roughness = 0.20;    // Soft lacquer reflections
            ceilingMat.metalness = 0.04;
            ceilingMat.envMapIntensity = 1.80; // Catches warm ambient light from shoji
            ceilingMat.needsUpdate = true;
          }

          // 5. WOVEN CREAM RUG (Material.002 - Plane.001)
          // Neutral cream textured rug under coffee table and sofa
          else if (matName === "Material.002") {
            const rugMat = mesh.material as THREE.MeshStandardMaterial;
            rugMat.color.set("#e2d8c7"); // Elegant warm cream tone
            rugMat.roughness = 0.90;
            rugMat.metalness = 0.0;
            mesh.castShadow = false; // Flat against floor, prevent self-shadow acne
            mesh.receiveShadow = true;
            rugMat.needsUpdate = true;
          }

          // 6. MODULAR SOFA (Material.008 - node_0.002_S-Remesh.003)
          // Warm charcoal architectural fabric
          else if (matName === "Material.008") {
            const sofaMat = mesh.material as THREE.MeshStandardMaterial;
            sofaMat.color.set("#282522"); // Warm charcoal sofa
            sofaMat.roughness = 0.84;
            sofaMat.metalness = 0.0;
            sofaMat.needsUpdate = true;
          }

          // 7. LOW COFFEE TABLE (Material.009 - Cube.003)
          // Charred warm dark timber
          else if (matName === "Material.009") {
            const tableMat = mesh.material as THREE.MeshStandardMaterial;
            tableMat.color.set("#201d19"); // Warm charred timber
            tableMat.roughness = 0.70;
            tableMat.metalness = 0.02;
            tableMat.needsUpdate = true;
          }

          // 8. CERAMIC VASES, ACCESSORIES & LANTERN FRAMES (Material.006)
          // Niche vases (Cube.002, Cube.004, Cube.005) read clearly under spotlight with soft ceramic sheen
          else if (matName === "Material.006") {
            mesh.material = (mesh.material as THREE.Material).clone();
            const ceramicMat = mesh.material as THREE.MeshStandardMaterial;
            ceramicMat.color.set("#282521"); // Deep warm charcoal ceramic
            ceramicMat.roughness = 0.48;     // Soft sheen revealing vase contour under spotlight
            ceramicMat.metalness = 0.03;
            ceramicMat.emissive = new THREE.Color(0, 0, 0);
            ceramicMat.emissiveIntensity = 0;
            ceramicMat.needsUpdate = true;
          }

          // 9. GEISHA ARTWORK (Material.011 - Plane.020)
          else if (matName === "Material.011") {
            const artMat = mesh.material as THREE.MeshStandardMaterial;
            artMat.roughness = 0.85;
            artMat.metalness = 0.0;
            artMat.needsUpdate = true;
          }

          // 10. WALLS & MATTE PLASTER (Material.003 - Plane.002 right wall, Plane.005 far niche wall)
          // Warm grey-green tone letting plaster bump and texture read clearly under spotlight
          else {
            const wallMat = mesh.material as THREE.MeshStandardMaterial;
            wallMat.color.set("#92968a"); // Warm grey-green plaster
            wallMat.roughness = 0.84;
            wallMat.metalness = 0.0;
            wallMat.needsUpdate = true;
          }
        }
      }
    });

    console.log(`=== TOTAL MESHES RECEIVING EMISSIVE TREATMENT: ${emissiveMatches.length} ===`);
    console.table(emissiveMatches);
  }, [scene]);

  return <primitive object={scene} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
}

useGLTF.preload("/models/interior.glb");
