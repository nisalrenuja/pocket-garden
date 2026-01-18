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

    const isBraking = frame.fist && frame.y >= GESTURE_CONFIG.BRAKE_Y_THRESHOLD;

    if (!isBraking && Math.abs(frame.roll) > GESTURE_CONFIG.ROTATION_DEADZONE) {
      targetRotationRef.current += frame.roll * GESTURE_CONFIG.ROTATION_SPEED;
    }

    gardenGroup.rotation.y +=
      (targetRotationRef.current - gardenGroup.rotation.y) *
      GESTURE_CONFIG.ROTATION_SMOOTHING;
  };

  return { updateRotation };
}
