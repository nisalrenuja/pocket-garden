import * as THREE from 'three';
import { StoneConfig, LeafConfig } from '@/types';

// Scene & Camera
export const SCENE_CONFIG = {
  BACKGROUND_COLOR: 0xddeeff,
  FOG_COLOR: 0xddeeff,
  FOG_NEAR: 5,
  FOG_FAR: 20,
} as const;

export const CAMERA_CONFIG = {
  FOV: 50,
  NEAR: 0.1,
  FAR: 100,
  // Camera positioned behind the garden, lower angle for immersive view
  POSITION: new THREE.Vector3(0, 2.5, -7),
  LOOK_AT: new THREE.Vector3(0, 0, 1),
} as const;

export const RENDERER_CONFIG = {
  ANTIALIAS: true,
  SHADOW_MAP_SIZE: 1024,
  SHADOW_MAP_TYPE: THREE.PCFSoftShadowMap,
} as const;

// Lighting
export const LIGHTING_CONFIG = {
  HEMISPHERE_SKY_COLOR: 0xffffff,
  HEMISPHERE_GROUND_COLOR: 0x444444,
  HEMISPHERE_INTENSITY: 0.6,
  DIRECTIONAL_COLOR: 0xffeedd,
  DIRECTIONAL_INTENSITY: 1.2,
  DIRECTIONAL_POSITION: new THREE.Vector3(5, 10, 5),
} as const;

// Garden Objects
export const SOIL_CONFIG = {
  RADIUS: 4,
  HEIGHT: 0.5,
  RADIAL_SEGMENTS: 32,
  Y_POSITION: -0.25,
  COLOR: 0xe0d5c1,
  ROUGHNESS: 1,
} as const;

export const DRAG_PLANE_CONFIG = {
  WIDTH: 20,
  HEIGHT: 20,
  ROTATION_X: -Math.PI / 2,
} as const;

export const STONE_CONFIG = {
  RADIUS: 0.4,
  DETAIL: 0,
  COLOR: 0x888888,
  HOVER_HEIGHT: 1.0,
  GROUND_HEIGHT: 0.4,
  EMISSIVE_NORMAL: 0x000000,
  EMISSIVE_HOVER: 0x222222,
  EMISSIVE_GRAB: 0x444444,
} as const;

export const INITIAL_STONES: StoneConfig[] = [
  { x: -1.5, z: 0.5, s: 1.2 },
  { x: 1.2, z: -1.0, s: 1.5 },
  { x: 0.5, z: 1.5, s: 0.8 },
];

export const BONSAI_CONFIG = {
  TRUNK: {
    RADIUS_TOP: 0.1,
    RADIUS_BOTTOM: 0.3,
    HEIGHT: 1.5,
    RADIAL_SEGMENTS: 6,
    Y_POSITION: 0.75,
    COLOR: 0x5d4037,
  },
  LEAF: {
    RADIUS: 0.5,
    DETAIL: 0,
    COLOR: 0x66bb6a,
  },
} as const;

export const INITIAL_LEAVES: LeafConfig[] = [
  { x: 0.5, y: 1.5, z: 0 },
  { x: -0.4, y: 1.3, z: 0.3 },
  { x: 0, y: 1.7, z: -0.3 },
];

export const TRAIL_CONFIG = {
  COLOR: 0x8d6e63,
  LINE_WIDTH: 2,
  MAX_POINTS: 500,
  Y_OFFSET: -0.24,
} as const;

export const CURSOR_CONFIG = {
  Y_POSITION: 0.1,
  RING_INNER_RADIUS: 0.15,
  RING_OUTER_RADIUS: 0.2,
  DOT_RADIUS: 0.05,
  COLOR_NORMAL: 0x00ffaa,
  COLOR_HOVER: 0xffff00,
  COLOR_GRAB: 0xff8800,
  SCALE_NORMAL: 1.0,
  SCALE_HOVER: 1.2,
  SCALE_GRAB: 0.8,
  OPACITY_RING: 0.8,
  OPACITY_DOT: 0.9,
} as const;

// Day/Night Cycle
export const DAY_NIGHT_CONFIG = {
  DAY_COLOR: 0xddeeff,
  NIGHT_COLOR: 0x110520,
  HEMI_LIGHT_MIN_INTENSITY: 0.2,
  HEMI_LIGHT_BRIGHTNESS_MULTIPLIER: 0.6,
  DIR_LIGHT_BRIGHTNESS_MULTIPLIER: 1.5,
  SUN_X_MULTIPLIER: 20,
  SUN_Y_MULTIPLIER: 10,
  SUN_Z_OFFSET: 5,
} as const;
