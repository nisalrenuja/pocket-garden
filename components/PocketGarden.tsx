"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HandFrame, PocketGardenHandle } from '@/types';
import {
  createScene,
  createCamera,
  createRenderer,
  createLights,
  createSoil,
  createDragPlane,
  createStones,
  createBonsai,
  createTrailLine,
  createHandCursor,
  getNormalizedDeviceCoords,
  updateDayNightCycle,
  handleResize,
} from '@/lib/three';
import {
  useGardenRotation,
  useStoneLevitation,
  useSandRaking,
  useTimeControl,
} from '@/hooks';

const PocketGarden = React.forwardRef<PocketGardenHandle, {}>((props, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const handFrameRef = useRef<HandFrame>({
    x: 0.5,
    y: 0.5,
    roll: 0,
    pinch: false,
    fist: false,
    peace: false,
  });

  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const sceneObjectsRef = useRef<{
    gardenGroup: THREE.Group | null;
    stones: THREE.Mesh[];
    soil: THREE.Mesh | null;
    dragPlane: THREE.Mesh | null;
    trailLine: THREE.Line | null;
    hemiLight: THREE.HemisphereLight | null;
    dirLight: THREE.DirectionalLight | null;
    handCursor: THREE.Group | null;
  }>({
    gardenGroup: null,
    stones: [],
    soil: null,
    dragPlane: null,
    trailLine: null,
    hemiLight: null,
    dirLight: null,
    handCursor: null,
  });

  // Initialize hooks at top level (they read from refs during updates)
  const { updateRotation } = useGardenRotation(sceneObjectsRef);
  const { updateLevitation } = useStoneLevitation(sceneObjectsRef, raycasterRef);
  const { updateRaking } = useSandRaking(sceneObjectsRef, raycasterRef);
  const { updateTime, getTimeOfDay } = useTimeControl();

  React.useImperativeHandle(ref, () => ({
    updateHandFrame: (frame: HandFrame) => {
      handFrameRef.current = frame;
    },
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialize scene
    const scene = createScene();
    const camera = createCamera();
    const renderer = createRenderer();
    const { hemiLight, dirLight } = createLights();

    scene.add(hemiLight);
    scene.add(dirLight);

    const container = mountRef.current;
    container.appendChild(renderer.domElement);

    // Create garden objects
    const gardenGroup = new THREE.Group();
    scene.add(gardenGroup);

    const soil = createSoil();
    gardenGroup.add(soil);

    const dragPlane = createDragPlane();
    scene.add(dragPlane);

    const stones = createStones();
    stones.forEach((stone) => gardenGroup.add(stone));

    const { group: bonsaiGroup } = createBonsai();
    gardenGroup.add(bonsaiGroup);

    const trailLine = createTrailLine();
    gardenGroup.add(trailLine);

    // Create hand cursor
    const handCursor = createHandCursor();
    scene.add(handCursor);

    // Store references
    sceneObjectsRef.current = {
      gardenGroup,
      stones,
      soil,
      dragPlane,
      trailLine,
      hemiLight,
      dirLight,
      handCursor,
    };

    // Animation loop
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);

      const frame = handFrameRef.current;
      const raycaster = raycasterRef.current;

      // Update raycaster
      const ndc = getNormalizedDeviceCoords(frame.x, frame.y);
      raycaster.setFromCamera(ndc, camera);

      // Update hand cursor position
      const planeIntersects = raycaster.intersectObject(dragPlane);
      if (planeIntersects.length > 0 && handCursor) {
        handCursor.position.copy(planeIntersects[0].point);
        handCursor.position.y = 0.1; // Slightly above ground
        handCursor.visible = true;

        // Update cursor color based on state
        const cursorRing = handCursor.children[0] as THREE.Mesh;
        const cursorDot = handCursor.children[1] as THREE.Mesh;
        const ringMat = cursorRing.material as THREE.MeshBasicMaterial;
        const dotMat = cursorDot.material as THREE.MeshBasicMaterial;

        if (frame.pinch) {
          // Grabbing - orange color
          ringMat.color.setHex(0xff8800);
          dotMat.color.setHex(0xff8800);
          handCursor.scale.setScalar(0.8);
        } else {
          // Check if hovering over a stone
          const stoneIntersects = raycaster.intersectObjects(stones);
          if (stoneIntersects.length > 0) {
            // Hovering over stone - yellow highlight
            ringMat.color.setHex(0xffff00);
            dotMat.color.setHex(0xffff00);
            handCursor.scale.setScalar(1.2);
          } else {
            // Normal state - cyan
            ringMat.color.setHex(0x00ffaa);
            dotMat.color.setHex(0x00ffaa);
            handCursor.scale.setScalar(1.0);
          }
        }
      }

      // Update interactions
      updateRotation(frame);
      updateLevitation(frame);
      updateRaking(frame);
      updateTime(frame);

      // Update day/night cycle
      updateDayNightCycle(
        getTimeOfDay(),
        scene,
        hemiLight,
        dirLight
      );

      renderer.render(scene, camera);
    }

    animate();

    // Resize handler
    const onResize = () => handleResize(camera, renderer);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frameId);
      container.removeChild(renderer.domElement);

      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
});

PocketGarden.displayName = "PocketGarden";
export default PocketGarden;
