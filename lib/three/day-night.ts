import * as THREE from 'three';
import { DAY_NIGHT_CONFIG } from '@/constants';

export function updateDayNightCycle(
  timeOfDay: number,
  scene: THREE.Scene,
  hemiLight: THREE.HemisphereLight,
  dirLight: THREE.DirectionalLight
): void {
  // Sun position
  const sunX = (timeOfDay - 0.5) * DAY_NIGHT_CONFIG.SUN_X_MULTIPLIER;
  const sunY = Math.sin(timeOfDay * Math.PI) * DAY_NIGHT_CONFIG.SUN_Y_MULTIPLIER;
  const sunZ = DAY_NIGHT_CONFIG.SUN_Z_OFFSET;
  dirLight.position.set(sunX, Math.max(0, sunY), sunZ);

  // Color interpolation
  const brightness = Math.max(0, Math.sin(timeOfDay * Math.PI));
  const dayColor = new THREE.Color(DAY_NIGHT_CONFIG.DAY_COLOR);
  const nightColor = new THREE.Color(DAY_NIGHT_CONFIG.NIGHT_COLOR);
  const currentColor = nightColor.clone().lerp(dayColor, brightness);

  scene.background = currentColor;
  scene.fog?.color.copy(currentColor);

  hemiLight.intensity =
    DAY_NIGHT_CONFIG.HEMI_LIGHT_MIN_INTENSITY +
    brightness * DAY_NIGHT_CONFIG.HEMI_LIGHT_BRIGHTNESS_MULTIPLIER;
  dirLight.intensity =
    brightness * DAY_NIGHT_CONFIG.DIR_LIGHT_BRIGHTNESS_MULTIPLIER;
}
