import { useRef, MutableRefObject } from 'react';
import * as THREE from 'three';
import { HandFrame } from '@/types';
import { GESTURE_CONFIG } from '@/constants';

interface SceneObjects {
  gardenGroup: THREE.Group | null;
}

export function useGardenRotation(
  sceneObjectsRef: MutableRefObject<SceneObjects>
) {
  const targetRotationRef = useRef(0);

  const updateRotation = (frame: HandFrame): void => {
    const gardenGroup = sceneObjectsRef.current.gardenGroup;
    if (!gardenGroup) return;

    // Don't rotate when making a fist (controlling time)
    const isControllingTime = frame.fist;

    if (!isControllingTime && Math.abs(frame.roll) > GESTURE_CONFIG.ROTATION_DEADZONE) {
      targetRotationRef.current += frame.roll * GESTURE_CONFIG.ROTATION_SPEED;
    }

    gardenGroup.rotation.y +=
      (targetRotationRef.current - gardenGroup.rotation.y) *
      GESTURE_CONFIG.ROTATION_SMOOTHING;
  };

  return { updateRotation };
}
