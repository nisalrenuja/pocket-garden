import { useRef } from 'react';
import * as THREE from 'three';
import { HandFrame } from '@/types';
import { STONE_CONFIG, GESTURE_CONFIG } from '@/constants';

export function useStoneLevitation(
  stones: THREE.Mesh[],
  gardenGroup: THREE.Group | null,
  raycaster: THREE.Raycaster,
  dragPlane: THREE.Mesh | null
) {
  const grabbedObjectRef = useRef<THREE.Object3D | null>(null);

  const updateLevitation = (frame: HandFrame): void => {
    if (!gardenGroup || !dragPlane) return;

    if (frame.pinch) {
      if (!grabbedObjectRef.current) {
        const intersects = raycaster.intersectObjects(stones);
        if (intersects.length > 0) {
          grabbedObjectRef.current = intersects[0].object;
          const mat = (grabbedObjectRef.current as THREE.Mesh)
            .material as THREE.MeshStandardMaterial;
          mat.emissive.setHex(STONE_CONFIG.EMISSIVE_HIGHLIGHT);
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
        if (grabbedObjectRef.current.position.y > STONE_CONFIG.GROUND_HEIGHT) {
          grabbedObjectRef.current.position.y -= GESTURE_CONFIG.STONE_DROP_SPEED;
        }
        grabbedObjectRef.current.position.y = STONE_CONFIG.GROUND_HEIGHT;
        grabbedObjectRef.current = null;
      }
    }
  };

  return { updateLevitation };
}
