const THREE = require('three');

function createCrownGeometry() {
  const geo = new THREE.SphereGeometry(0.85, 64, 48);
  const pos = geo.attributes.position;
  
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Only shape upper half and middle
    if (y > -0.2) {
      const angle = Math.atan2(z, x);
      // Squarish molar cross section
      const lobe = 1 + 0.09 * Math.cos(4 * angle) - 0.04 * Math.cos(2 * angle);
      x *= lobe * 1.12;
      z *= lobe * 1.02;

      // 4 Cusps on top
      if (y > 0.25) {
        const d1 = (x - 0.35)**2 + (z - 0.28)**2;
        const d2 = (x + 0.35)**2 + (z - 0.28)**2;
        const d3 = (x - 0.35)**2 + (z + 0.28)**2;
        const d4 = (x + 0.35)**2 + (z + 0.28)**2;
        const center = x**2 + z**2;

        const cusp1 = Math.exp(-d1 / 0.12) * 0.24;
        const cusp2 = Math.exp(-d2 / 0.12) * 0.24;
        const cusp3 = Math.exp(-d3 / 0.12) * 0.22;
        const cusp4 = Math.exp(-d4 / 0.12) * 0.22;
        const groove = -Math.exp(-center / 0.14) * 0.15;

        y += cusp1 + cusp2 + cusp3 + cusp4 + groove;
      }
    } else {
      // Cervical neck taper
      const t = (-0.2 - y) / 0.65;
      const taper = Math.max(0.7, 1 - 0.3 * t);
      x *= taper * 1.05;
      z *= taper * 0.95;
    }

    pos.setXYZ(i, x, y + 0.3, z);
  }
  geo.computeVertexNormals();
  return geo;
}

function createRootGeometry(isLeft) {
  // Tube along anatomical curve
  const sign = isLeft ? -1 : 1;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(sign * 0.28, 0.05, 0),
    new THREE.Vector3(sign * 0.38, -0.45, sign * 0.02),
    new THREE.Vector3(sign * 0.32, -0.95, -0.02),
    new THREE.Vector3(sign * 0.22, -1.4, 0),
  ]);

  const geo = new THREE.TubeGeometry(curve, 32, 0.22, 24, false);
  const pos = geo.attributes.position;

  // Taper radius from 0.26 down to 0.04
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Find progress along y: from 0.05 down to -1.4
    const t = Math.max(0, Math.min(1, (0.05 - y) / 1.45));
    // Taper factor
    const radiusScale = (1 - 0.8 * (t ** 1.1));

    // Get point on curve at t
    const centerPoint = curve.getPointAt(t);
    x = centerPoint.x + (x - centerPoint.x) * radiusScale;
    z = centerPoint.z + (z - centerPoint.z) * radiusScale * 0.85;

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

const crown = createCrownGeometry();
const leftRoot = createRootGeometry(true);
const rightRoot = createRootGeometry(false);

console.log('Crown count:', crown.attributes.position.count);
console.log('Left root count:', leftRoot.attributes.position.count);
console.log('Right root count:', rightRoot.attributes.position.count);
