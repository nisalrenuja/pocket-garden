import * as THREE from 'three';
import {
  SCENE_CONFIG,
  CAMERA_CONFIG,
  RENDERER_CONFIG,
  LIGHTING_CONFIG,
} from '@/constants';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SCENE_CONFIG.BACKGROUND_COLOR);
  scene.fog = new THREE.Fog(
    SCENE_CONFIG.FOG_COLOR,
    SCENE_CONFIG.FOG_NEAR,
    SCENE_CONFIG.FOG_FAR
  );
  return scene;
}

export function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR
  );
  camera.position.copy(CAMERA_CONFIG.POSITION);
  camera.lookAt(CAMERA_CONFIG.LOOK_AT);
  return camera;
}

export function createRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: RENDERER_CONFIG.ANTIALIAS,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = RENDERER_CONFIG.SHADOW_MAP_TYPE;
  return renderer;
}

export function createLights(): {
  hemiLight: THREE.HemisphereLight;
  dirLight: THREE.DirectionalLight;
} {
  const hemiLight = new THREE.HemisphereLight(
    LIGHTING_CONFIG.HEMISPHERE_SKY_COLOR,
    LIGHTING_CONFIG.HEMISPHERE_GROUND_COLOR,
    LIGHTING_CONFIG.HEMISPHERE_INTENSITY
  );

  const dirLight = new THREE.DirectionalLight(
    LIGHTING_CONFIG.DIRECTIONAL_COLOR,
    LIGHTING_CONFIG.DIRECTIONAL_INTENSITY
  );
  dirLight.position.copy(LIGHTING_CONFIG.DIRECTIONAL_POSITION);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = RENDERER_CONFIG.SHADOW_MAP_SIZE;
  dirLight.shadow.mapSize.height = RENDERER_CONFIG.SHADOW_MAP_SIZE;

  return { hemiLight, dirLight };
}

export function handleResize(
  camera: THREE.PerspectiveCamera,
  renderer: THREE.WebGLRenderer
): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
