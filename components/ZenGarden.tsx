"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HandFrame } from './HandGestureController';

export interface ZenGardenHandle {
    updateHandFrame: (frame: HandFrame) => void;
}

const ZenGarden = React.forwardRef<ZenGardenHandle, {}>((props, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isNight, setIsNight] = useState(false);
  
  // State Refs
  const handFrameRef = useRef<HandFrame>({ x: 0.5, y: 0.5, roll: 0, pinch: false, fist: false, peace: false });
  const timeOfDayRef = useRef(0); // 0 = Noon, 1 = Midnight (Mapped from 0..1)
  
  // Interaction State
  const grabbedObjectRef = useRef<THREE.Object3D | null>(null);
  
  React.useImperativeHandle(ref, () => ({
    updateHandFrame: (frame: HandFrame) => {
        handFrameRef.current = frame;
    }
  }));

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE & CAMERA ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xddeeff); 
    scene.fog = new THREE.Fog(0xddeeff, 5, 20);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const container = mountRef.current;
    container.appendChild(renderer.domElement);
    
    // RAYCASTER
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Horizontal plane at y=0


    // --- LIGHTING ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffeedd, 1.2);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    // --- OBJECTS ---
    const gardenGroup = new THREE.Group();
    scene.add(gardenGroup);

    // 1. Base / Sand
    const soilGeo = new THREE.CylinderGeometry(4, 4, 0.5, 32);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0xe0d5c1, roughness: 1 }); // Sand color
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -0.25;
    soil.receiveShadow = true;
    gardenGroup.add(soil);
    
    // Invisible Ground Plane for Raycasting drags
    const dragPlaneGeo = new THREE.PlaneGeometry(20, 20);
    const dragPlaneMat = new THREE.MeshBasicMaterial({ visible: false });
    const dragPlane = new THREE.Mesh(dragPlaneGeo, dragPlaneMat);
    dragPlane.rotation.x = -Math.PI / 2;
    scene.add(dragPlane); // Static in scene, not rotating with garden? 
    // Actually, if we rotate garden, we want to place stones ON the rotating garden.
    // Simplifying: Rotate the CAMERA around the garden instead of rotating the garden object?
    // OR: Rotate the garden group. 
    // If we rotate garden group, Raycasting needs to account for that. 
    // Three.js Raycaster handles scene graph transforms automatically.
    
    // 2. Stones (Interactable)
    const stones: THREE.Mesh[] = [];
    const stoneGeo = new THREE.DodecahedronGeometry(0.4, 0);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x888888, flatShading: true });
    
    // Initial stones
    [
        { x: -1.5, z: 0.5, s: 1.2 },
        { x: 1.2, z: -1.0, s: 1.5 },
        { x: 0.5, z: 1.5, s: 0.8 }
    ].forEach(data => {
        const s = new THREE.Mesh(stoneGeo, stoneMat.clone());
        s.position.set(data.x, 0.4, data.z);
        s.scale.setScalar(data.s);
        s.castShadow = true;
        s.receiveShadow = true;
        s.userData = { isDraggable: true };
        gardenGroup.add(s);
        stones.push(s);
    });

    // 3. Bonsai (Static)
    const treeGroup = new THREE.Group();
    gardenGroup.add(treeGroup);
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.3, 1.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x5d4037 })
    );
    trunk.position.set(0, 0.75, 0);
    trunk.castShadow = true;
    treeGroup.add(trunk);
    
    const leafGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x66bb6a });
    const leaves: THREE.Mesh[] = [];
    
    [
        { x: 0.5, y: 1.5, z: 0 },
        { x: -0.4, y: 1.3, z: 0.3 },
        { x: 0, y: 1.7, z: -0.3 }
    ].forEach(p => {
        const l = new THREE.Mesh(leafGeo, leafMat);
        l.position.set(p.x, p.y, p.z);
        l.castShadow = true;
        treeGroup.add(l);
        leaves.push(l);
    });


    // --- ANIMATION & LOGIC ---
    let frameId: number;
    let targetRotation = 0;
    
    // Raking State
    const trailPoints: THREE.Vector3[] = [];
    // Create a Line for trails
    const trailGeo = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0x8d6e63, linewidth: 2 });
    const trailLine = new THREE.Line(trailGeo, trailMat);
    gardenGroup.add(trailLine);


    function animate() {
        frameId = requestAnimationFrame(animate);

        const frame = handFrameRef.current;
        
        // 1. ROTATION (The Force)
        // Hand Roll -> Rotation Speed
        // LOCK/STOP: If Fist is held LOW (y > 0.4), freeze rotation targeting.
        const isBraking = frame.fist && frame.y >= 0.4;
        
        // Deadzone at 0
        if (!isBraking && Math.abs(frame.roll) > 0.1) {
            targetRotation += frame.roll * 0.02;
        }
        // Smooth interpolate
        gardenGroup.rotation.y += (targetRotation - gardenGroup.rotation.y) * 0.1;


        // 2. RAYCASTING (Hand Position -> 3D World)
        // frame.x/y are 0..1. Map to ND (Normalized Device Coords) -1..1
        const ndc = new THREE.Vector2(
            (frame.x * 2) - 1,   
            -( (frame.y * 2) - 1 ) // Invert Y
        );
        ndc.x = -ndc.x; // Flip X because camera is usually embodied mirror

        raycaster.setFromCamera(ndc, camera);
        
        
        // 5. RAKING (Peace Sign)
        if (frame.peace) {
             const groundIntersects = raycaster.intersectObject(soil); // Raycast against soil
             if (groundIntersects.length > 0) {
                 const point = groundIntersects[0].point;
                 
                 // Add to trail
                 // Convert to local space of garden to stick to it?
                 gardenGroup.worldToLocal(point);
                 // Lift slightly above soil
                 point.y = -0.24; 
                 
                 trailPoints.push(point);
                 if (trailPoints.length > 500) trailPoints.shift(); // Max length
                 
                 trailGeo.setFromPoints(trailPoints);
             }
        }




        // 3. LEVITATION (Pinch to Grab)
        const isPinching = frame.pinch;
        
        if (isPinching) {
            if (!grabbedObjectRef.current) {
                // Try to grab
                const intersects = raycaster.intersectObjects(stones);
                if (intersects.length > 0) {
                    grabbedObjectRef.current = intersects[0].object;
                    // Highlight
                    const mat = (grabbedObjectRef.current as THREE.Mesh).material as THREE.MeshStandardMaterial;
                    mat.emissive.setHex(0x444444);
                }
            } else {
                // Already holding: Move it
                // Raycast against infinite Drag Plane (at y=0.5 approx height)
                // We want to drag parallel to ground.
                const dragIntersects = raycaster.intersectObject(dragPlane);
                if (dragIntersects.length > 0) {
                    const point = dragIntersects[0].point;
                    
                    // We need to apply inverse rotation of gardenGroup to place correctly inside the group?
                    // Or is DragPlane inside GardenGroup? No, DragPlane is in Scene.
                    // Stones are in GardenGroup.
                    // To set Stone position (local), we need World Point -> Local Point.
                    
                    const worldPoint = point.clone();
                    // Set height to hover
                    worldPoint.y = 1.0; 
                    
                    // Convert World -> Local (GardenGroup)
                    gardenGroup.worldToLocal(worldPoint);
                    
                    // Apply smooth lerp
                    grabbedObjectRef.current.position.lerp(worldPoint, 0.2);
                    
                    // Levitation effect (Hover)
                    grabbedObjectRef.current.position.y = 1.0 + Math.sin(Date.now() * 0.005) * 0.1;
                }
            }
        } else {
            // Release
            if (grabbedObjectRef.current) {
                const mat = (grabbedObjectRef.current as THREE.Mesh).material as THREE.MeshStandardMaterial;
                mat.emissive.setHex(0x000000);
                
                // Drop to ground
                if (grabbedObjectRef.current.position.y > 0.4) {
                     grabbedObjectRef.current.position.y -= 0.1;
                }
                
                // If close enough to ground, release ref ? 
                // Better: Just null ref immediately, let physics/logic handle drop in future.
                // For now, snap to floor z=0.4
                grabbedObjectRef.current.position.y = 0.4;
                grabbedObjectRef.current = null;
            }
        }


        // 4. SKY MANIPULATION (Fist + High Y)
        // If Fist and Hand Y < 0.3 (Top of screen)
        if (frame.fist && frame.y < 0.4) {
             // Map Hand X (0..1) to Time (0..1)
             // Smooth lerp
             const targetTime = frame.x; // 0=Left=Day? 
             // Let's say 0.5 is Noon. 0/1 is Night.
             // Actually let's just map linearly: 0=Sunrise, 1=Sunset.
             // Visual x is flipped, so 0 (Visual Left) -> 1 (Visual Right).
             
             timeOfDayRef.current += (targetTime - timeOfDayRef.current) * 0.35;
             
             // Update Lights/Fog based on Time
             // Simple Gradient: Blue (Day) -> Orange (Sunset) -> Purple (Night)
        }
        
        // --- TIME VISUALS ---
        const t = timeOfDayRef.current;
        // Simple day/night cycle logic
        // 0.5 = Noon (Brightest)
        // 0.0 / 1.0 = Dark
        
        // Actually user wants "Drag Sun/Moon".
        // Let's assume X controls sun position.
        const sunX = (timeOfDayRef.current - 0.5) * 20;
        const sunY = Math.sin(timeOfDayRef.current * Math.PI) * 10;
        const sunZ = 5;
        
        dirLight.position.set(sunX, Math.max(0, sunY), sunZ);
        
        // Color Interpolation
        // Day (0.5) -> Night (0 or 1)
        const brightness = Math.max(0, Math.sin(timeOfDayRef.current * Math.PI));
        
        const dayColor = new THREE.Color(0xddeeff);
        const nightColor = new THREE.Color(0x110520);
        
        const currentColor = nightColor.clone().lerp(dayColor, brightness);
        
        scene.background = currentColor;
        scene.fog?.color.copy(currentColor);
        
        hemiLight.intensity = 0.2 + brightness * 0.6;
        dirLight.intensity = brightness * 1.5;


        renderer.render(scene, camera);
    }
    
    animate();
    
    // Resize Listener
    const handleResize = () => {
         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(frameId);
        container.removeChild(renderer.domElement);
        
        // Cleanup geometries
        soilGeo.dispose();
        soilMat.dispose();
        stoneGeo.dispose();
        stoneMat.dispose();
        leafGeo.dispose();
        leafMat.dispose();
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
