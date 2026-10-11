const THREE = require('three');
const fs = require('fs');

function buildMolarGeometry() {
  // Let's create a crown geometry and two root geometries that unite smoothly
  // Crown: SphereGeometry or subdivided cylinder modified
  const crownGeo = new THREE.CylinderGeometry(0.72, 0.58, 0.9, 48, 32, true);
  const pos = crownGeo.attributes.position;
  
  // Modify crown vertices to form 4 realistic cusps and anatomical bell shape
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    
    // Normalize angle
    let angle = Math.atan2(z, x);
    let r = Math.sqrt(x * x + z * z);
    
    // Quad-lobed shape (molar shape is squarish with rounded lobes)
    let lobeFactor = 1 + 0.12 * Math.cos(4 * angle) - 0.04 * Math.cos(2 * angle);
    x *= lobeFactor;
    z *= lobeFactor;
    
    // Add cusps at top (y > 0.2)
    if (y > 0.1) {
      let cusp1 = Math.exp(-((x - 0.35)**2 + (z - 0.3)**2) / 0.1) * 0.22;
      let cusp2 = Math.exp(-((x + 0.35)**2 + (z - 0.3)**2) / 0.1) * 0.22;
      let cusp3 = Math.exp(-((x - 0.35)**2 + (z + 0.3)**2) / 0.1) * 0.2;
      let cusp4 = Math.exp(-((x + 0.35)**2 + (z + 0.3)**2) / 0.1) * 0.2;
      let depression = Math.exp(-(x**2 + z**2) / 0.15) * -0.12;
      y += cusp1 + cusp2 + cusp3 + cusp4 + depression;
    }
    
    // Taper towards bottom
    if (y < 0) {
      let t = (0 - y) / 0.45;
      x *= (1 - 0.18 * t);
      z *= (1 - 0.18 * t);
    }
    
    pos.setXYZ(i, x, y, z);
  }
  
  crownGeo.computeVertexNormals();
  console.log('Crown vertices created:', pos.count);
  return crownGeo;
}

buildMolarGeometry();
