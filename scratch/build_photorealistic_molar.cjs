const THREE = require('three');

function createPhotorealisticMolar() {
  const group = new THREE.Group();

  // 1. CROWN GEOMETRY (Molar occlusal table + buccal/lingual walls)
  // We use a high-density sphere deformed with molar anatomy
  const crownGeo = new THREE.SphereGeometry(0.92, 80, 60);
  const crownPos = crownGeo.attributes.position;
  const crownColors = [];

  for (let i = 0; i < crownPos.count; i++) {
    let x = crownPos.getX(i);
    let y = crownPos.getY(i);
    let z = crownPos.getZ(i);

    // Molar crown is squarish-oval in horizontal cross section
    const angle = Math.atan2(z, x);
    const squarish = 1 + 0.1 * Math.cos(4 * angle) - 0.03 * Math.cos(2 * angle);
    x *= squarish * 1.08;
    z *= squarish * 0.98;

    // Occlusal anatomy on top (y > 0.15)
    if (y > 0.15) {
      // 4 distinct anatomic cusps
      const d1 = (x - 0.42) ** 2 + (z - 0.35) ** 2; // Mesiobuccal
      const d2 = (x + 0.42) ** 2 + (z - 0.35) ** 2; // Distobuccal
      const d3 = (x - 0.42) ** 2 + (z + 0.35) ** 2; // Mesiolingual
      const d4 = (x + 0.42) ** 2 + (z + 0.35) ** 2; // Distolingual
      const centerDistSq = x ** 2 + z ** 2;

      const cusp1 = Math.exp(-d1 / 0.16) * 0.32;
      const cusp2 = Math.exp(-d2 / 0.16) * 0.30;
      const cusp3 = Math.exp(-d3 / 0.16) * 0.28;
      const cusp4 = Math.exp(-d4 / 0.16) * 0.28;
      const fissure = -Math.exp(-centerDistSq / 0.18) * 0.22;

      // Cross groove between buccal & lingual cusps
      const crossGroove = -Math.exp(-(z ** 2) / 0.06) * 0.08 * Math.exp(-(x ** 2) / 0.3);
      const sagittalGroove = -Math.exp(-(x ** 2) / 0.06) * 0.08 * Math.exp(-(z ** 2) / 0.3);

      y += cusp1 + cusp2 + cusp3 + cusp4 + fissure + crossGroove + sagittalGroove;
    } else {
      // Cervical constriction (waist)
      const t = (-y) / 0.92;
      const waist = Math.max(0.68, 1 - 0.32 * Math.sin(t * Math.PI));
      x *= waist;
      z *= waist;
    }

    crownPos.setXYZ(i, x, y + 0.35, z);

    // Vertex color: Bright pearlescent white enamel on top
    const h = (y + 0.35); // roughly -0.5 to 1.3
    if (h > 0.2) {
      crownColors.push(1.0, 0.995, 0.98); // White porcelain enamel
    } else {
      const alpha = Math.max(0, (h + 0.5) / 0.7);
      crownColors.push(
        0.95 + 0.05 * alpha,
        0.91 + 0.085 * alpha,
        0.84 + 0.14 * alpha
      );
    }
  }

  crownGeo.setAttribute('color', new THREE.Float32BufferAttribute(crownColors, 3));
  crownGeo.computeVertexNormals();

  // 2. ROOT GEOMETRY (Natural multi-rooted molar with curved tapering roots)
  function createRoot(offsetX, offsetZ, curveX, curveZ, length, radiusTop, radiusTip) {
    const segments = 40;
    const radialSegs = 24;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(offsetX, 0.0, offsetZ),
      new THREE.Vector3(offsetX + curveX * 0.35, -length * 0.35, offsetZ + curveZ * 0.35),
      new THREE.Vector3(offsetX + curveX * 0.8, -length * 0.7, offsetZ + curveZ * 0.8),
      new THREE.Vector3(offsetX + curveX, -length, offsetZ + curveZ),
    ]);

    const geo = new THREE.TubeGeometry(curve, segments, radiusTop, radialSegs, false);
    const pos = geo.attributes.position;
    const colors = [];

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      const t = Math.max(0, Math.min(1, -y / length));
      const pt = curve.getPointAt(t);

      // Anatomical root cross section is flattened mesiodistally (thinner in X, wider in Z)
      const scale = (1 - t) + (radiusTip / radiusTop) * t;
      x = pt.x + (x - pt.x) * scale * 0.88;
      z = pt.y + (z - pt.z) * scale * 1.05;

      pos.setXYZ(i, x, y, z);

      // Root vertex colors: warm natural cementum/dentin gradient
      const rootColorT = 1 - t; // 1 at top, 0 at root apex
      colors.push(
        0.94 - 0.05 * t, // R
        0.89 - 0.06 * t, // G
        0.81 - 0.08 * t  // B
      );
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }

  const leftRoot = createRoot(-0.32, 0.05, -0.06, -0.02, 1.45, 0.28, 0.06);
  const rightRoot = createRoot(0.32, 0.05, 0.06, -0.02, 1.45, 0.28, 0.06);
  const backRoot = createRoot(0.0, -0.28, 0.0, -0.08, 1.35, 0.25, 0.05);

  console.log('Photorealistic Molar Geometries created successfully!');
  console.log('Crown vertices:', crownGeo.attributes.position.count);
  console.log('Left root vertices:', leftRoot.attributes.position.count);
  console.log('Right root vertices:', rightRoot.attributes.position.count);
  console.log('Back root vertices:', backRoot.attributes.position.count);
}

createPhotorealisticMolar();
