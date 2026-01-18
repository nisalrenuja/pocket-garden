export const MEDIAPIPE_CONFIG = {
  VISION_TASKS_CDN: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm",
  MODEL_URL: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  RUNNING_MODE: "VIDEO" as const,
  NUM_HANDS: 1,
  DELEGATE: "GPU" as const,
} as const;

export const HAND_LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  MIDDLE_TIP: 12,
  MIDDLE_PIP: 10,
  RING_TIP: 16,
  RING_PIP: 14,
  PINKY_TIP: 20,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
} as const;

export const VIDEO_CONFIG = {
  CANVAS_WIDTH: 640,
  CANVAS_HEIGHT: 480,
  FONT: "14px monospace",
} as const;

export const DRAWING_STYLES = {
  CONNECTOR_COLOR: "#00FFAA",
  CONNECTOR_WIDTH: 3,
  LANDMARK_COLOR: "#FF4444",
  LANDMARK_WIDTH: 2,
  DEBUG_TEXT_COLOR: "#00FFAA",
} as const;
