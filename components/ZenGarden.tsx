"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { HandFrame, ZenGardenHandle } from '@/types';
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

const ZenGarden = React.forwardRef<ZenGardenHandle, {}>((props, ref) => {
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
  }>({
    gardenGroup: null,
    stones: [],
    soil: null,
    dragPlane: null,
    trailLine: null,
    hemiLight: null,
    dirLight: null,
  });

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

    // Store references
    sceneObjectsRef.current = {
      gardenGroup,
      stones,
      soil,
      dragPlane,
      trailLine,
      hemiLight,
      dirLight,
    };

    // Initialize interaction hooks
    const rotationHook = useGardenRotation(gardenGroup);
    const levitationHook = useStoneLevitation(
      stones,
      gardenGroup,
      raycasterRef.current,
      dragPlane
    );
    const rakingHook = useSandRaking(
      soil,
      gardenGroup,
      trailLine,
      raycasterRef.current
    );
    const timeHook = useTimeControl();

    // Animation loop
    let frameId: number;

    function animate() {
      frameId = requestAnimationFrame(animate);

      const frame = handFrameRef.current;
      const raycaster = raycasterRef.current;

      // Update raycaster
      const ndc = getNormalizedDeviceCoords(frame.x, frame.y);
      raycaster.setFromCamera(ndc, camera);

      // Update interactions
      rotationHook.updateRotation(frame);
      levitationHook.updateLevitation(frame);
      rakingHook.updateRaking(frame);
      timeHook.updateTime(frame);

      // Update day/night cycle
      updateDayNightCycle(
        timeHook.getTimeOfDay(),
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

ZenGarden.displayName = "ZenGarden";
export default ZenGarden;
