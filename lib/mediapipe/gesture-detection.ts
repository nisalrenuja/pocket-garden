import { GESTURE_CONFIG, HAND_LANDMARK_INDICES } from '@/constants';
import { Landmark } from '@/types';

export function calculateRoll(landmarks: Landmark[]): number {
  const indexMCP = landmarks[HAND_LANDMARK_INDICES.INDEX_MCP];
  const pinkyMCP = landmarks[HAND_LANDMARK_INDICES.PINKY_MCP];
  const dx = pinkyMCP.x - indexMCP.x;
  const dy = pinkyMCP.y - indexMCP.y;
  const rollVal = Math.atan2(dy, dx);
  return Math.max(-1, Math.min(1, rollVal * GESTURE_CONFIG.ROLL_MULTIPLIER));
}

export function isFingerExtended(
  tip: Landmark,
  pip: Landmark,
  wrist: Landmark
): boolean {
  const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
  const dPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
  return dTip > dPip * GESTURE_CONFIG.EXTENSION_MULTIPLIER;
}

export function detectPinch(
  thumbTip: Landmark,
  indexTip: Landmark
): boolean {
  const distance = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
  return distance < GESTURE_CONFIG.PINCH_DISTANCE_THRESHOLD;
}

export function detectFist(
  indexExt: boolean,
  middleExt: boolean,
  ringExt: boolean,
  pinkyExt: boolean
): boolean {
  return !indexExt && !middleExt && !ringExt && !pinkyExt;
}

export function detectPeace(
  indexExt: boolean,
  middleExt: boolean,
  ringExt: boolean,
  pinkyExt: boolean
): boolean {
  return indexExt && middleExt && !ringExt && !pinkyExt;
}
