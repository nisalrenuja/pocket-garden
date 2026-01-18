import { useRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { HandFrame } from '@/types';
import { STONE_CONFIG, GESTURE_CONFIG } from '@/constants';

interface SceneObjects {
  gardenGroup: THREE.Group | null;
  stones: THREE.Mesh[];
  dragPlane: THREE.Mesh | null;
}

// Hover highlight color (subtle glow)
const HOVER_EMISSIVE = 0x222222;
// Grab highlight color (brighter)
const GRAB_EMISSIVE = 0x444444;

export function useStoneLevitation(
  sceneObjectsRef: MutableRefObject<SceneObjects>,
  raycasterRef: MutableRefObject<THREE.Raycaster>
) {
  const grabbedObjectRef = useRef<THREE.Object3D | null>(null);
  const droppingObjectsRef = useRef<Set<THREE.Object3D>>(new Set());
  const hoveredStoneRef = useRef<THREE.Mesh | null>(null);

  const updateLevitation = (frame: HandFrame): void => {
    const { gardenGroup, stones, dragPlane } = sceneObjectsRef.current;
    const raycaster = raycasterRef.current;
    if (!gardenGroup || !dragPlane) return;

    // Set larger threshold for easier grab detection
    raycaster.params.Mesh = { threshold: 0.5 };

    // Animate dropping stones
    const droppingObjects = droppingObjectsRef.current;
    for (const obj of droppingObjects) {
      if (obj.position.y > STONE_CONFIG.GROUND_HEIGHT) {
        obj.position.y -= GESTURE_CONFIG.STONE_DROP_SPEED;
      }
      if (obj.position.y <= STONE_CONFIG.GROUND_HEIGHT) {
        obj.position.y = STONE_CONFIG.GROUND_HEIGHT;
        droppingObjects.delete(obj);
      }
    }

    // Don't grab stones that are currently dropping
    const availableStones = stones.filter(s => !droppingObjects.has(s));
    const intersects = raycaster.intersectObjects(availableStones);

    // Handle hover highlighting when not grabbing
    if (!grabbedObjectRef.current && !frame.pinch) {
      // Clear previous hover highlight
      if (hoveredStoneRef.current) {
        const mat = hoveredStoneRef.current.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(STONE_CONFIG.EMISSIVE_NORMAL);
        hoveredStoneRef.current = null;
      }

      // Apply hover highlight to nearest stone
      if (intersects.length > 0) {
        hoveredStoneRef.current = intersects[0].object as THREE.Mesh;
        const mat = hoveredStoneRef.current.material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(HOVER_EMISSIVE);
      }
    }

    if (frame.pinch) {
      if (!grabbedObjectRef.current) {
        // Clear hover highlight before grabbing
        if (hoveredStoneRef.current) {
          const mat = hoveredStoneRef.current.material as THREE.MeshStandardMaterial;
          mat.emissive.setHex(STONE_CONFIG.EMISSIVE_NORMAL);
          hoveredStoneRef.current = null;
        }

        if (intersects.length > 0) {
          grabbedObjectRef.current = intersects[0].object;
          const mat = (grabbedObjectRef.current as THREE.Mesh)
            .material as THREE.MeshStandardMaterial;
          mat.emissive.setHex(GRAB_EMISSIVE);
        }
      } else {
        const dragIntersects = raycaster.intersectObject(dragPlane);
        if (dragIntersects.length > 0) {
          const worldPoint = dragIntersects[0].point.clone();
          worldPoint.y = STONE_CONFIG.HOVER_HEIGHT;
          gardenGroup.worldToLocal(worldPoint);
          grabbedObjectRef.current.position.lerp(
            worldPoint,
            GESTURE_CONFIG.DRAG_LERP_SPEED
          );
          grabbedObjectRef.current.position.y =
            STONE_CONFIG.HOVER_HEIGHT +
            Math.sin(Date.now() * GESTURE_CONFIG.LEVITATION_SPEED) *
              GESTURE_CONFIG.LEVITATION_AMPLITUDE;
        }
      }
    } else {
      if (grabbedObjectRef.current) {
        const mat = (grabbedObjectRef.current as THREE.Mesh)
          .material as THREE.MeshStandardMaterial;
        mat.emissive.setHex(STONE_CONFIG.EMISSIVE_NORMAL);
        // Add to dropping set for animated fall
        droppingObjects.add(grabbedObjectRef.current);
        grabbedObjectRef.current = null;
      }
    }
  };

  return { updateLevitation };
}
