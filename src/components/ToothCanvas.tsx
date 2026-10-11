import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ——— Anatomical 3D Molar Tooth Model Matching Reference Image ———
const AnatomicalMolarTooth: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const toothGeometry = useMemo(() => {
    const shape = new THREE.Shape();

    // Start at top center occlusal groove
    shape.moveTo(0, 0.74);
    // Smooth curve up to right cusp
    shape.bezierCurveTo(0.25, 0.76, 0.48, 0.88, 0.62, 0.86);
    // Smooth convex curve down outer right crown
    shape.bezierCurveTo(0.74, 0.74, 0.75, 0.35, 0.66, 0.05);
    // Smooth transition into right cervical neck
    shape.bezierCurveTo(0.59, -0.16, 0.54, -0.32, 0.48, -0.52);
    // Smooth curve down outer right root tapering to apex
    shape.bezierCurveTo(0.42, -0.78, 0.35, -1.18, 0.28, -1.45);
    // Rounded tip of right root
    shape.bezierCurveTo(0.24, -1.52, 0.2, -1.52, 0.17, -1.45);
    // Inner curve of right root heading up to bifurcation
    shape.bezierCurveTo(0.14, -1.18, 0.1, -0.7, 0.04, -0.42);
    // Smooth rounded bifurcation arch apex
    shape.bezierCurveTo(0.02, -0.35, -0.02, -0.35, -0.04, -0.42);
    // Inner curve of left root heading down to apex
    shape.bezierCurveTo(-0.1, -0.7, -0.14, -1.18, -0.17, -1.45);
    // Rounded tip of left root
    shape.bezierCurveTo(-0.2, -1.52, -0.24, -1.52, -0.28, -1.45);
    // Smooth curve up outer left root
    shape.bezierCurveTo(-0.35, -1.18, -0.42, -0.78, -0.48, -0.52);
    // Smooth transition into left cervical neck
    shape.bezierCurveTo(-0.54, -0.32, -0.59, -0.16, -0.66, 0.05);
    // Smooth convex curve up outer left crown
    shape.bezierCurveTo(-0.75, 0.35, -0.74, 0.74, -0.62, 0.86);
    // Curve back to top center occlusal groove
    shape.bezierCurveTo(-0.48, 0.88, -0.25, 0.76, 0, 0.74);

    const extrudeSettings = {
      steps: 8,
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.34,
      bevelSize: 0.3,
      bevelOffset: 0,
      bevelSegments: 16,
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();

    // Sculpt in depth (Z) for natural rounded dental volume
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Roots are slightly flattened in Z, crown is rounded and full
      const normY = (y + 1.5) / 2.5; // 0 at root tips, 1 at crown top
      const thickness = 0.48 + 0.52 * Math.max(0, Math.min(1, normY));
      z *= thickness;

      // Add gentle occlusal cusp depth contour at top
      if (y > 0.35) {
        const cuspDepth = 1 + 0.12 * Math.sin(Math.abs(z) * 4);
        y *= cuspDepth;
      }

      pos.setXYZ(i, x, y, z);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  // Smooth real-time cursor reaction & gentle idle float
  useFrame(({ clock, pointer }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Responsive yaw and pitch reacting to cursor
    const targetRotY = pointer.x * 0.85 + Math.sin(t * 0.45) * 0.12;
    const targetRotX = -pointer.y * 0.55 + Math.cos(t * 0.38) * 0.08;

    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotY,
      0.08
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      targetRotX,
      0.08
    );
  });

  return (
    <mesh ref={meshRef} geometry={toothGeometry} castShadow receiveShadow position={[0, 0.1, 0]}>
      <meshPhysicalMaterial
        color="#FCFBF9"
        roughness={0.16}
        metalness={0.02}
        clearcoat={1.0}
        clearcoatRoughness={0.06}
        reflectivity={0.65}
        envMapIntensity={1.3}
      />
    </mesh>
  );
};

// ——— Interactive Canvas ———
const ToothCanvas: React.FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.4], fov: 42 }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true, alpha: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 5, 3]} intensity={1.5} color="#FFFFFF" castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.9} color="#3C5980" />
      <pointLight position={[0, -3, 2]} intensity={0.6} color="#A8B8C2" />
      <Environment preset="city" />

      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.6}>
        <AnatomicalMolarTooth />
      </Float>

      {/* Realistic soft contact shadow beneath */}
      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.3}
        scale={4.2}
        blur={2.4}
        far={3.5}
        color="#3C5980"
      />

      {/* Interactive 3D inspection on click & drag */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.7}
      />
    </Canvas>
  );
};

export default ToothCanvas;
