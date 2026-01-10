import { useRef } from 'react';
import * as THREE from 'three';
import { HandFrame } from '@/types';
import { GESTURE_CONFIG } from '@/constants';

export function useGardenRotation(gardenGroup: THREE.Group | null) {
  const targetRotationRef = useRef(0);

  const updateRotation = (frame: HandFrame): void => {
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
