import { useRef } from 'react';
import { HandFrame } from '@/types';
import { GESTURE_CONFIG } from '@/constants';

export function useTimeControl() {
  const timeOfDayRef = useRef(0.5); // Start at midday

  const updateTime = (frame: HandFrame): void => {
    if (frame.fist) {
      // Fist up (low y value) = day (1)
      // Fist down (high y value) = night (0)
      // Invert y so that up = 1 and down = 0
      const targetTime = 1 - frame.y;
      timeOfDayRef.current +=
        (targetTime - timeOfDayRef.current) * GESTURE_CONFIG.TIME_LERP_SPEED;
    }
  };

  const getTimeOfDay = (): number => timeOfDayRef.current;

  return { updateTime, getTimeOfDay };
}
