import { useRef } from 'react';
import { HandFrame } from '@/types';
import { GESTURE_CONFIG } from '@/constants';

export function useTimeControl() {
  const timeOfDayRef = useRef(0);

  const updateTime = (frame: HandFrame): void => {
    if (frame.fist && frame.y < GESTURE_CONFIG.SKY_CONTROL_Y_THRESHOLD) {
      const targetTime = frame.x;
      timeOfDayRef.current +=
        (targetTime - timeOfDayRef.current) * GESTURE_CONFIG.TIME_LERP_SPEED;
    }
  };

  const getTimeOfDay = (): number => timeOfDayRef.current;

  return { updateTime, getTimeOfDay };
}
