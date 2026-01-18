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
 * Scene objects collection
 */
export interface SceneObjects {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  gardenGroup: THREE.Group;
  stones: THREE.Mesh[];
  leaves: THREE.Mesh[];
  soil: THREE.Mesh;
  dragPlane: THREE.Mesh;
  trailLine: THREE.Line;
  lights: {
    hemiLight: THREE.HemisphereLight;
    dirLight: THREE.DirectionalLight;
  };
}

/**
 * Animation state
 */
export interface AnimationState {
  targetRotation: number;
  timeOfDay: number;
  trailPoints: THREE.Vector3[];
  grabbedObject: THREE.Object3D | null;
}
