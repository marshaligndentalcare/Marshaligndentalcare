const THREE = require('three');

function createExtrudedToothGeometry() {
  const shape = new THREE.Shape();

  // Start at top center dip
  shape.moveTo(0, 0.72);
  // Curve up to right cusp
  shape.bezierCurveTo(0.25, 0.74, 0.5, 0.88, 0.62, 0.86);
  // Curve down outer right crown
  shape.bezierCurveTo(0.74, 0.75, 0.75, 0.35, 0.65, 0.05);
  // Curve into right cervical neck
  shape.bezierCurveTo(0.58, -0.15, 0.54, -0.32, 0.48, -0.5);
  // Curve down outer right root to apex
  shape.bezierCurveTo(0.42, -0.75, 0.36, -1.15, 0.28, -1.45);
  // Tip of right root
  shape.bezierCurveTo(0.24, -1.5, 0.2, -1.5, 0.18, -1.45);
  // Inside of right root up to bifurcation
  shape.bezierCurveTo(0.15, -1.2, 0.1, -0.7, 0.04, -0.42);
  // Bifurcation arch top
  shape.bezierCurveTo(0.02, -0.36, -0.02, -0.36, -0.04, -0.42);
  // Inside of left root down to apex
  shape.bezierCurveTo(-0.1, -0.7, -0.15, -1.2, -0.18, -1.45);
  // Tip of left root
  shape.bezierCurveTo(-0.2, -1.5, -0.24, -1.5, -0.28, -1.45);
  // Outside of left root up
  shape.bezierCurveTo(-0.36, -1.15, -0.42, -0.75, -0.48, -0.5);
  // Curve into left cervical neck
  shape.bezierCurveTo(-0.54, -0.32, -0.58, -0.15, -0.65, 0.05);
  // Curve up outer left crown
  shape.bezierCurveTo(-0.75, 0.35, -0.74, 0.75, -0.62, 0.86);
  // Curve to top center dip
  shape.bezierCurveTo(-0.5, 0.88, -0.25, 0.74, 0, 0.72);

  const extrudeSettings = {
    steps: 16,
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.32,
    bevelSize: 0.28,
    bevelOffset: 0,
    bevelSegments: 20
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();

  // Deform vertices in Z to make depth round and organic (like a real 3D tooth)
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Rounding in Z: roots should be thinner in Z, crown thicker
    const heightFactor = (y + 1.5) / 2.5; // 0 at root tips, 1 at top crown
    const thickness = 0.45 + 0.55 * Math.max(0, heightFactor);
    z *= thickness;

    // Occlusal cusps depth rounding
    if (y > 0.4) {
      // 4 cusps depth modulation
      const depthCusp = 1 + 0.15 * Math.sin(Math.abs(z) * 3);
      y *= depthCusp;
    }

    pos.setXYZ(i, x, y, z);
  }

  geo.computeVertexNormals();
  console.log('Tooth geometry created successfully! Vertices:', pos.count);
  return geo;
}

createExtrudedToothGeometry();
