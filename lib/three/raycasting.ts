import * as THREE from 'three';

export function getNormalizedDeviceCoords(
  x: number,
  y: number
): THREE.Vector2 {
  const ndc = new THREE.Vector2(
    (x * 2) - 1,
    -((y * 2) - 1)
  );
  ndc.x = -ndc.x; // Flip X for mirror effect
  return ndc;
}

export function findIntersection(
  raycaster: THREE.Raycaster,
  object: THREE.Object3D | THREE.Object3D[]
): THREE.Intersection | null {
  const intersects = Array.isArray(object)
    ? raycaster.intersectObjects(object)
    : raycaster.intersectObject(object);
  return intersects.length > 0 ? intersects[0] : null;
}
