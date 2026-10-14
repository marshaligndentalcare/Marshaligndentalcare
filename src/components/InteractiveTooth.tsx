/**
 * InteractiveTooth — R3F hero visual for Marshalign Dental Care
 *
 * Visuals (unchanged):
 *   - Height-based vertex-color gradient: cream root (#E6D9BC) to enamel (#F7F5F0)
 *   - Responsive camera framing: fits narrower dimension so tooth never clips
 *   - Dynamic ContactShadows positioned at actual model bottom (minY - gap)
 *   - Over-bright correction: ACESFilmic exposure 1.0, env map intensity ~1.0
 *   - Inside-container hint caption, bottom-centered
 *
 * Interaction (ToothController):
 *   - LEFT mouse / pen drag rotates 1:1 with no delay
 *   - Release springs back to upright with a natural bounce
 *   - Idle auto-spin + gentle bob when nothing is happening
 *   - Touch: one-finger horizontal swipe → yaw only (pan-y preserved)
 *   - Right-click shows normal browser context menu (no onContextMenu override)
 */

import React, {
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useMemo,
  Suspense,
  type PointerEvent as RPointerEvent,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { ToothController } from './toothController';

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS — visuals only (interaction config lives in ToothController)
// ═══════════════════════════════════════════════════════════════

/** If true, show hint below the tooth until the first interaction. */
const SHOW_HINT = true;

/** Material tweaks — enamel crown (MeshPhysicalMaterial). */
const CROWN_CLEARCOAT     = 0.55;
const CROWN_ROUGHNESS     = 0.28;
const CROWN_METALNESS     = 0.01;
const CROWN_ENV_INTENSITY = 1.0;

/** ACESFilmic tone mapping exposure. */
const TONE_MAPPING_EXPOSURE = 1.0;

/** ContactShadows tweaks: placed right under root tips (almost touching at bob bottom). */
const SHADOW_GAP     = 0.075;
const SHADOW_OPACITY = 0.32;
const SHADOW_BLUR    = 2.4;
const SHADOW_SCALE   = 3.4;

// ─────────────────────────────────────────────────────────────────────────────
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ═══════════════════════════════════════════════════════════════
//  ToothModel — GLB loading, vertex colours, materials, animation
// ═══════════════════════════════════════════════════════════════

interface ToothModelProps {
  controller: ToothController;
  onMinYComputed?: (minY: number) => void;
}

const ToothModel: React.FC<ToothModelProps> = ({ controller, onMinYComputed }) => {
  const { scene } = useGLTF('/models/tooth.glb');

  /** Outer group: receives rotation + bob from controller. */
  const outerRef = useRef<THREE.Group>(null);
  /** Inner group: receives centering offset + scale only (never rotated). */
  const innerRef = useRef<THREE.Group>(null);

  /** The centred Y offset of the model (inner group's position.y after centering). */
  const baseYRef = useRef(0);

  // ── Scale + centre the model inside the inner group ──────────
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    // Reset transform to base state before measuring to prevent cumulative scaling
    inner.scale.set(1, 1, 1);
    inner.position.set(0, 0, 0);
    inner.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(inner);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;

    // Target size 1.55 scene units gives ~440px on desktop (in the 420-470px requested range)
    const TARGET_SIZE = 1.55;
    inner.scale.setScalar(TARGET_SIZE / maxDim);

    // Re-compute box after scaling, then translate the inner group so its
    // geometric centre sits at the outer group's origin. This makes the outer
    // group's rotation pivot around the model's own centre.
    const scaledBox = new THREE.Box3().setFromObject(inner);
    const centre = new THREE.Vector3();
    scaledBox.getCenter(centre);
    inner.position.set(-centre.x, -centre.y, -centre.z);

    // Base Y for the outer group's bob: after centering the inner group the
    // outer group's natural Y is 0, so baseY is 0.
    baseYRef.current = 0;

    // Report the model's actual bottom (in outer-group space) for shadow placement.
    const finalBox = new THREE.Box3().setFromObject(inner);
    onMinYComputed?.(finalBox.min.y);
  }, [scene, onMinYComputed]);

  // ── Material Tuning (smooth shading, visible crown grooves & root separation) ──
  useLayoutEffect(() => {
    const meshes: THREE.Mesh[] = [];
    scene.traverse((n) => { if (n instanceof THREE.Mesh) meshes.push(n); });

    if (meshes.length === 0) {
      console.warn('[InteractiveTooth] GLB has no meshes — nothing to display.');
      return;
    }

    meshes.forEach((mesh) => {
      // Remove any previously set artificial vertex color attribute causing hard horizontal lines
      if (mesh.geometry && mesh.geometry.attributes.color) {
        mesh.geometry.deleteAttribute('color');
      }

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      mats.forEach((mat, idx) => {
        if (!(mat instanceof THREE.MeshStandardMaterial)) return;

        let phys: THREE.MeshPhysicalMaterial;
        if (mat instanceof THREE.MeshPhysicalMaterial) {
          phys = mat;
        } else {
          phys = new THREE.MeshPhysicalMaterial();
          // Use Standard prototype copy so we never read physical-only props from standard source
          THREE.MeshStandardMaterial.prototype.copy.call(phys, mat);
          if (Array.isArray(mesh.material)) {
            (mesh.material as THREE.Material[])[idx] = phys;
          } else {
            mesh.material = phys;
          }
        }

        // Retain original baked texture map for natural anatomical surface detail
        if (mat.map) {
          phys.map = mat.map;
        }
        phys.color.set('#FBF9F5');
        phys.roughness          = CROWN_ROUGHNESS;
        phys.metalness          = CROWN_METALNESS;
        phys.clearcoat          = CROWN_CLEARCOAT;
        phys.clearcoatRoughness = 0.12;
        phys.envMapIntensity    = CROWN_ENV_INTENSITY;
        phys.vertexColors       = false;
        phys.needsUpdate        = true;
      });
    });
  }, [scene]);

  // ── Animation loop (3 lines from the wiring example) ─────────
  useFrame((_, delta) => {
    const outer = outerRef.current;
    if (!outer) return;
    controller.update(delta);                                   // (3a) advance spring / idle spin / bob
    outer.quaternion.copy(controller.quaternion);               // (3b) orientation
    outer.position.y = baseYRef.current + controller.bobY;     // (3c) bob
  });

  return (
    <group ref={outerRef}>
      {/* Inner group centres the model so the outer group rotates about its geometric centre */}
      <group ref={innerRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
};

// ═══════════════════════════════════════════════════════════════
//  SceneSetup — tone mapping & responsive camera framing
// ═══════════════════════════════════════════════════════════════

const SceneSetup: React.FC = () => {
  const { gl, camera, size } = useThree();

  useLayoutEffect(() => {
    gl.toneMapping         = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = TONE_MAPPING_EXPOSURE;
  }, [gl]);

  // Frame camera so tooth fills ~80% of the narrower dimension — no clipping on narrow viewports
  useLayoutEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;
    const aspect   = size.width / Math.max(size.height, 1);
    const fovRad   = (camera.fov * Math.PI) / 180;
    const halfTan  = Math.tan(fovRad / 2);
    const targetSpan = 2.65; // scene units to keep in view
    let dist = targetSpan / (2 * halfTan);
    if (aspect < 1) {
      dist = targetSpan / (2 * halfTan * aspect);
    }
    camera.position.set(0, 0.04, dist);
    camera.lookAt(0, -0.04, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
};

// ═══════════════════════════════════════════════════════════════
//  Hint pill styles — inside container, bottom-centered
// ═══════════════════════════════════════════════════════════════

const HINT_WRAPPER_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: '14px',
  left: 0,
  right: 0,
  textAlign: 'center',
  pointerEvents: 'none',
  userSelect: 'none',
  zIndex: 10,
};

const HINT_TEXT_STYLE: React.CSSProperties = {
  display: 'inline-block',
  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
  fontSize: '0.72rem',
  fontWeight: 500,
  letterSpacing: '0.07em',
  color: '#8C827A',
  background: 'rgba(255, 255, 255, 0.55)',
  padding: '4px 12px',
  borderRadius: '20px',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  boxShadow: '0 2px 8px rgba(60, 89, 128, 0.06)',
  opacity: 0.9,
  transition: 'opacity 0.6s ease',
};

// ═══════════════════════════════════════════════════════════════
//  InteractiveTooth — public component
// ═══════════════════════════════════════════════════════════════

interface InteractiveToothProps {
  className?: string;
}

const InteractiveTooth: React.FC<InteractiveToothProps> = ({ className }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // One controller, created once. prefersReducedMotion read at mount time.
  const controller = useMemo(
    () => new ToothController({ reducedMotion: prefersReducedMotion() }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Shadow position driven by actual model bottom
  const [minY, setMinY] = useState(-0.95);
  const shadowY = minY - SHADOW_GAP;

  // Pause the render loop when the hero is off-screen
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { threshold: 0.05 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Hint — hidden after first interaction
  const [hintVisible, setHintVisible] = useState(SHOW_HINT);
  const [isTouch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false,
  );

  const dismissHint = () => setHintVisible(false);

  // ── Pointer handlers (exact wiring from InteractiveToothWiring.example.tsx) ──

  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (!controller.pointerDown(e.nativeEvent)) return;  // left mouse/pen only
    e.currentTarget.setPointerCapture(e.pointerId);       // track outside the box
    e.currentTarget.style.cursor = 'grabbing';
    e.preventDefault();                                    // no text-selection drag
    dismissHint();
  };

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!controller.dragging) return;
    const batch = e.nativeEvent.getCoalescedEvents?.();   // every sample, not one per frame
    (batch && batch.length ? batch : [e.nativeEvent]).forEach((ev) => controller.pointerMove(ev));
  };

  const onPointerEnd = (e: RPointerEvent<HTMLDivElement>) => {
    controller.pointerUp(e.nativeEvent);                  // starts the bounce-back
    e.currentTarget.style.cursor = 'grab';
  };

  // Touch: one-finger horizontal swipe = yaw only; vertical scroll stays with the page
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    controller.beginDrag(-1, t.clientX, t.clientY, true);
    dismissHint();
  };
  const onTouchMove  = (e: React.TouchEvent<HTMLDivElement>) => {
    const t = e.touches[0];
    controller.moveTo(-1, t.clientX, t.clientY);
  };
  const onTouchEnd   = () => controller.endDrag(-1);

  // ── Hint text ────────────────────────────────────────────────
  const hintText = isTouch ? 'Swipe to rotate' : 'Click and drag to rotate';

  return (
    <div
      ref={wrapperRef}
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onLostPointerCapture={onPointerEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
      style={{
        touchAction: 'pan-y',
        width: '100%',
        height: '100%',
        position: 'relative',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      } as React.CSSProperties}
      role="img"
      aria-label="Interactive 3D model of a molar tooth. Click and drag to rotate."
    >
      <Canvas
        camera={{ fov: 30, position: [0, 0, 5.5], near: 0.1, far: 50 }}
        dpr={[1, 2]}
        frameloop={inView ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <SceneSetup />
        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 5, 4]} intensity={1.6} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.55} color="#8BA0BA" />
        <pointLight position={[0, -3, 2]} intensity={0.3} color="#BCC8D0" />
        <Environment files="/env/studio_small_03_1k.hdr" />
        <Suspense fallback={null}>
          <ToothModel controller={controller} onMinYComputed={setMinY} />
        </Suspense>
        <ContactShadows
          position={[0, shadowY, 0]}
          opacity={SHADOW_OPACITY}
          scale={SHADOW_SCALE}
          blur={SHADOW_BLUR}
          far={3}
          color="#3C5980"
        />
      </Canvas>

      {SHOW_HINT && hintVisible && (
        <div style={HINT_WRAPPER_STYLE} aria-hidden="true">
          <span style={HINT_TEXT_STYLE}>{hintText}</span>
        </div>
      )}
    </div>
  );
};

// ── Bootstrap: local Draco decoder + GLB preload ─────────────────────────
useGLTF.setDecoderPath('/draco/');
useGLTF.preload('/models/tooth.glb');

export default InteractiveTooth;