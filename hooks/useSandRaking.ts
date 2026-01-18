import { useRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { HandFrame, SceneObjectsRef } from '@/types';
import { TRAIL_CONFIG } from '@/constants';

type RequiredObjects = Pick<SceneObjectsRef, 'soil' | 'gardenGroup' | 'trailLine'>;

export function useSandRaking(
  sceneObjectsRef: MutableRefObject<RequiredObjects>,
  raycasterRef: MutableRefObject<THREE.Raycaster>
) {
  const trailPointsRef = useRef<THREE.Vector3[]>([]);

  const updateRaking = (frame: HandFrame): void => {
    const { soil, gardenGroup, trailLine } = sceneObjectsRef.current;
    const raycaster = raycasterRef.current;
    if (!frame.peace || !soil || !gardenGroup || !trailLine) return;

    const groundIntersects = raycaster.intersectObject(soil);
    if (groundIntersects.length > 0) {
      const point = groundIntersects[0].point;
      gardenGroup.worldToLocal(point);
      point.y = TRAIL_CONFIG.Y_OFFSET;

      trailPointsRef.current.push(point);
      if (trailPointsRef.current.length > TRAIL_CONFIG.MAX_POINTS) {
        trailPointsRef.current.shift();
      }

      trailLine.geometry.setFromPoints(trailPointsRef.current);
    }
  };

  return { updateRaking };
}
