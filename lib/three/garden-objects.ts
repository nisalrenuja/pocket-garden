import * as THREE from 'three';
import {
  SOIL_CONFIG,
  DRAG_PLANE_CONFIG,
  STONE_CONFIG,
  INITIAL_STONES,
  BONSAI_CONFIG,
  INITIAL_LEAVES,
  TRAIL_CONFIG,
} from '@/constants';

export function createSoil(): THREE.Mesh {
  const geometry = new THREE.CylinderGeometry(
    SOIL_CONFIG.RADIUS,
    SOIL_CONFIG.RADIUS,
    SOIL_CONFIG.HEIGHT,
    SOIL_CONFIG.RADIAL_SEGMENTS
  );
  const material = new THREE.MeshStandardMaterial({
    color: SOIL_CONFIG.COLOR,
    roughness: SOIL_CONFIG.ROUGHNESS,
  });
  const soil = new THREE.Mesh(geometry, material);
  soil.position.y = SOIL_CONFIG.Y_POSITION;
  soil.receiveShadow = true;
  return soil;
}

export function createDragPlane(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(
    DRAG_PLANE_CONFIG.WIDTH,
    DRAG_PLANE_CONFIG.HEIGHT
  );
  const material = new THREE.MeshBasicMaterial({ visible: false });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.x = DRAG_PLANE_CONFIG.ROTATION_X;
  return plane;
}

export function createStones(): THREE.Mesh[] {
  const geometry = new THREE.DodecahedronGeometry(
    STONE_CONFIG.RADIUS,
    STONE_CONFIG.DETAIL
  );
  const baseMaterial = new THREE.MeshStandardMaterial({
    color: STONE_CONFIG.COLOR,
    flatShading: true,
  });

  return INITIAL_STONES.map((config) => {
    const stone = new THREE.Mesh(geometry, baseMaterial.clone());
    stone.position.set(config.x, STONE_CONFIG.GROUND_HEIGHT, config.z);
    stone.scale.setScalar(config.s);
    stone.castShadow = true;
    stone.receiveShadow = true;
    stone.userData = { isDraggable: true };
    return stone;
  });
}

export function createBonsai(): {
  group: THREE.Group;
  leaves: THREE.Mesh[];
} {
  const group = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(
      BONSAI_CONFIG.TRUNK.RADIUS_TOP,
      BONSAI_CONFIG.TRUNK.RADIUS_BOTTOM,
      BONSAI_CONFIG.TRUNK.HEIGHT,
      BONSAI_CONFIG.TRUNK.RADIAL_SEGMENTS
    ),
    new THREE.MeshStandardMaterial({ color: BONSAI_CONFIG.TRUNK.COLOR })
  );
  trunk.position.y = BONSAI_CONFIG.TRUNK.Y_POSITION;
  trunk.castShadow = true;
  group.add(trunk);

  const leafGeometry = new THREE.IcosahedronGeometry(
    BONSAI_CONFIG.LEAF.RADIUS,
    BONSAI_CONFIG.LEAF.DETAIL
  );
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: BONSAI_CONFIG.LEAF.COLOR,
  });

  const leaves = INITIAL_LEAVES.map((config) => {
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.position.set(config.x, config.y, config.z);
    leaf.castShadow = true;
    group.add(leaf);
    return leaf;
  });

  return { group, leaves };
}

export function createTrailLine(): THREE.Line {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.LineBasicMaterial({
    color: TRAIL_CONFIG.COLOR,
    linewidth: TRAIL_CONFIG.LINE_WIDTH,
  });
  return new THREE.Line(geometry, material);
}

// Hand cursor indicator
export function createHandCursor(): THREE.Group {
  const group = new THREE.Group();

  // Outer ring
  const ringGeometry = new THREE.RingGeometry(0.15, 0.2, 32);
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = -Math.PI / 2;
  group.add(ring);

  // Center dot
  const dotGeometry = new THREE.CircleGeometry(0.05, 16);
  const dotMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffaa,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const dot = new THREE.Mesh(dotGeometry, dotMaterial);
  dot.rotation.x = -Math.PI / 2;
  group.add(dot);

  group.visible = true;
  return group;
}
