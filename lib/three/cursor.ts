import * as THREE from 'three';
import { CURSOR_CONFIG } from '@/constants';

export interface CursorState {
  isPinching: boolean;
  isHoveringStone: boolean;
}

export function updateCursor(
  cursor: THREE.Group,
  position: THREE.Vector3,
  state: CursorState
): void {
  cursor.position.copy(position);
  cursor.position.y = CURSOR_CONFIG.Y_POSITION;
  cursor.visible = true;

  const ring = cursor.children[0] as THREE.Mesh;
  const dot = cursor.children[1] as THREE.Mesh;
  const ringMat = ring.material as THREE.MeshBasicMaterial;
  const dotMat = dot.material as THREE.MeshBasicMaterial;

  if (state.isPinching) {
    ringMat.color.setHex(CURSOR_CONFIG.COLOR_GRAB);
    dotMat.color.setHex(CURSOR_CONFIG.COLOR_GRAB);
    cursor.scale.setScalar(CURSOR_CONFIG.SCALE_GRAB);
  } else if (state.isHoveringStone) {
    ringMat.color.setHex(CURSOR_CONFIG.COLOR_HOVER);
    dotMat.color.setHex(CURSOR_CONFIG.COLOR_HOVER);
    cursor.scale.setScalar(CURSOR_CONFIG.SCALE_HOVER);
  } else {
    ringMat.color.setHex(CURSOR_CONFIG.COLOR_NORMAL);
    dotMat.color.setHex(CURSOR_CONFIG.COLOR_NORMAL);
    cursor.scale.setScalar(CURSOR_CONFIG.SCALE_NORMAL);
  }
}
