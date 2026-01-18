import * as THREE from 'three';

export function getNormalizedDeviceCoords(
  x: number,
  y: number
): THREE.Vector2 {
  // Convert hand position (0-1) to NDC (-1 to 1)
  // Camera is behind the garden, so no X flip needed
  // The mirrored video and behind-camera view align naturally
  const ndc = new THREE.Vector2(
    (x * 2) - 1,
    -((y * 2) - 1)
  );
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
