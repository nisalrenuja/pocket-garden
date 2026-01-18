import { GESTURE_CONFIG, HAND_LANDMARK_INDICES } from '@/constants';
import { Landmark, HandFrame } from '@/types';

function calculateRoll(landmarks: Landmark[]): number {
  const indexMCP = landmarks[HAND_LANDMARK_INDICES.INDEX_MCP];
  const pinkyMCP = landmarks[HAND_LANDMARK_INDICES.PINKY_MCP];
  const dx = pinkyMCP.x - indexMCP.x;
  const dy = pinkyMCP.y - indexMCP.y;
  const rollVal = Math.atan2(dy, dx);
  return Math.max(-1, Math.min(1, -rollVal * GESTURE_CONFIG.ROLL_MULTIPLIER));
}

function isFingerExtended(tip: Landmark, pip: Landmark, wrist: Landmark): boolean {
  const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
  const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
  return dTip > dPip * GESTURE_CONFIG.EXTENSION_MULTIPLIER;
}

function detectPinch(thumbTip: Landmark, indexTip: Landmark): boolean {
  const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
  return distance < GESTURE_CONFIG.PINCH_DISTANCE_THRESHOLD;
}

export function processLandmarks(landmarks: Landmark[]): HandFrame {
  const wrist = landmarks[HAND_LANDMARK_INDICES.WRIST];
  const thumbTip = landmarks[HAND_LANDMARK_INDICES.THUMB_TIP];
  const indexTip = landmarks[HAND_LANDMARK_INDICES.INDEX_TIP];
  const middleTip = landmarks[HAND_LANDMARK_INDICES.MIDDLE_TIP];
  const ringTip = landmarks[HAND_LANDMARK_INDICES.RING_TIP];
  const pinkyTip = landmarks[HAND_LANDMARK_INDICES.PINKY_TIP];

  const indexExt = isFingerExtended(indexTip, landmarks[HAND_LANDMARK_INDICES.INDEX_PIP], wrist);
  const middleExt = isFingerExtended(middleTip, landmarks[HAND_LANDMARK_INDICES.MIDDLE_PIP], wrist);
  const ringExt = isFingerExtended(ringTip, landmarks[HAND_LANDMARK_INDICES.RING_PIP], wrist);
  const pinkyExt = isFingerExtended(pinkyTip, landmarks[HAND_LANDMARK_INDICES.PINKY_PIP], wrist);

  return {
    x: wrist.x,
    y: wrist.y,
    roll: calculateRoll(landmarks),
    pinch: detectPinch(thumbTip, indexTip),
    fist: !indexExt && !middleExt && !ringExt && !pinkyExt,
    peace: indexExt && middleExt && !pinkyExt,
  };
}
