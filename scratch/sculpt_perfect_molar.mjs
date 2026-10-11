import * as THREE from 'three';

export function createSmoothAnatomicalMolarGeometry() {
  // A molar can be modeled as a continuous high-res mesh:
  // Using a CylinderGeometry with closed rounded caps or custom parametric mesh
  const radialSegments = 72;
  const heightSegments = 60;
  
  // Height from -1.5 (root tips) to +1.0 (cusp tips)
  // Let's create a BufferGeometry directly with smooth vertex coordinates
  const geometry = new THREE.CylinderGeometry(
    0.65, // top radius (below cusps)
    0.42, // bottom waist
    1.1,  // height of crown
    radialSegments,
    heightSegments,
    true
  );

  // We can combine Crown + Roots seamlessly!
  return geometry;
}
