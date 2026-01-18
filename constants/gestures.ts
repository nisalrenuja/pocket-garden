// Hand Gesture Recognition
export const GESTURE_CONFIG = {
  // Rotation
  ROTATION_DEADZONE: 0.1,
  ROTATION_SPEED: 0.02,
  ROTATION_SMOOTHING: 0.1,

  // Braking (Fist Low) - activates when y >= this value
  BRAKE_Y_THRESHOLD: 0.5,

  // Sky Control (Fist High) - activates when y < this value
  SKY_CONTROL_Y_THRESHOLD: 0.35,
  TIME_LERP_SPEED: 0.35,

  // Pinch Detection
  PINCH_DISTANCE_THRESHOLD: 0.05,

  // Finger Extension Detection
  EXTENSION_MULTIPLIER: 1.2,

  // Roll Sensitivity
  ROLL_MULTIPLIER: 2,

  // Drag Smoothing
  DRAG_LERP_SPEED: 0.2,

  // Levitation Animation
  LEVITATION_SPEED: 0.005,
  LEVITATION_AMPLITUDE: 0.1,

  // Stone Drop Speed
  STONE_DROP_SPEED: 0.1,
} as const;
