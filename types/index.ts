import * as THREE from 'three';

/**
 * Hand tracking frame data from MediaPipe
 */
export interface HandFrame {
  x: number;      // 0..1 (Screen X, 0=Left)
  y: number;      // 0..1 (Screen Y, 0=Top)
  roll: number;   // -1..1 (Hand tilt)
  pinch: boolean; // Thumb+index touching
  fist: boolean;  // Fingers folded
  peace: boolean; // Index+middle extended
}

/**
 * PocketGarden component API
 */
export interface PocketGardenHandle {
  updateHandFrame: (frame: HandFrame) => void;
}

/**
 * 3D position data
 */
export interface Position3D {
  x: number;
  y: number;
  z: number;
}

/**
 * Stone configuration
 */
export interface StoneConfig {
  x: number;
  z: number;
  s: number; // scale
}

/**
 * Leaf configuration
 */
export interface LeafConfig {
  x: number;
  y: number;
  z: number;
}

/**
 * MediaPipe hand landmark
 */
export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

/**
 * Scene objects ref - mutable state for hooks
 */
export interface SceneObjectsRef {
  gardenGroup: THREE.Group | null;
  stones: THREE.Mesh[];
  soil: THREE.Mesh | null;
  dragPlane: THREE.Mesh | null;
  trailLine: THREE.Line | null;
  hemiLight: THREE.HemisphereLight | null;
  dirLight: THREE.DirectionalLight | null;
  handCursor: THREE.Group | null;
}
