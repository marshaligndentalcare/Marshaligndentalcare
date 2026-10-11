import React, { useRef, useEffect } from 'react';
import styles from './InteractiveTooth.module.css';

const InteractiveTooth: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Interaction tracking state
  const mouseState = useRef({
    x: 0,
    y: 0,
    active: false,
    currentRotateX: 0,
    currentRotateY: 0,
    currentTranslateY: 0,
    currentTranslateZ: 0,
  });

  useEffect(() => {
    let animationFrameId: number;
    let startTime = performance.now();

    const renderLoop = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const state = mouseState.current;

      // Autonomous idle floating motion
      const idleFloat = Math.sin(elapsed * 1.6) * 8; // ±8px vertical float
      const idleYaw = Math.sin(elapsed * 0.8) * 3;   // ±3deg yaw drift
      const idlePitch = Math.cos(elapsed * 0.6) * 2; // ±2deg pitch drift

      // Target rotations
      // When active: map mouse [-1, 1] to ±22deg yaw and ±14deg pitch
      const targetRotateY = (state.active ? state.x * 22 : 0) + idleYaw;
      const targetRotateX = (state.active ? -state.y * 14 : 0) + idlePitch;
      const targetTranslateY = (state.active ? state.y * 10 : 0) + idleFloat;
      const targetTranslateZ = state.active ? 20 : 0;

      // Smooth damped lerp for inertia
      const lerpSpeed = 0.085;
      state.currentRotateY += (targetRotateY - state.currentRotateY) * lerpSpeed;
      state.currentRotateX += (targetRotateX - state.currentRotateX) * lerpSpeed;
      state.currentTranslateY += (targetTranslateY - state.currentTranslateY) * lerpSpeed;
      state.currentTranslateZ += (targetTranslateZ - state.currentTranslateZ) * lerpSpeed;

      // Apply 3D transform to card
      if (cardRef.current) {
        cardRef.current.style.transform = `
          translateY(${state.currentTranslateY.toFixed(2)}px)
          translateZ(${state.currentTranslateZ.toFixed(2)}px)
          rotateY(${state.currentRotateY.toFixed(2)}deg)
          rotateX(${state.currentRotateX.toFixed(2)}deg)
        `;
      }

      // Parallax glow shift
      if (glowRef.current) {
        const glowX = (state.active ? state.x * 20 : 0).toFixed(2);
        const glowY = (state.active ? state.y * 20 : 0).toFixed(2);
        glowRef.current.style.transform = `translate(calc(-50% + ${glowX}px), calc(-50% + ${glowY}px))`;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    mouseState.current.x = Math.max(-1, Math.min(1, x));
    mouseState.current.y = Math.max(-1, Math.min(1, y));
    mouseState.current.active = true;

    // Update sheen highlight position
    const lightX = (((e.clientX - rect.left) / rect.width) * 100).toFixed(1);
    const lightY = (((e.clientY - rect.top) / rect.height) * 100).toFixed(1);
    containerRef.current.style.setProperty('--light-x', `${lightX}%`);
    containerRef.current.style.setProperty('--light-y', `${lightY}%`);
  };

  const handlePointerLeave = () => {
    mouseState.current.active = false;
  };

  return (
    <div
      ref={containerRef}
      className={styles.toothContainer}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Interactive 3D Molar Tooth — Move cursor to inspect"
      role="region"
    >
      {/* Soft diffused ambient glow behind tooth */}
      <div ref={glowRef} className={styles.glow} aria-hidden="true" />

      {/* 3D Interactive Card */}
      <div ref={cardRef} className={styles.card3d}>
        {/* Dynamic specular light sheen */}
        <div className={styles.sheen} aria-hidden="true" />

        {/* Real tooth image with seamless circular background blend */}
        <img
          src="/extracted_frame.png"
          alt="Marshalign Dental Care — Anatomical Molar Tooth"
          className={styles.toothImg}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default InteractiveTooth;
