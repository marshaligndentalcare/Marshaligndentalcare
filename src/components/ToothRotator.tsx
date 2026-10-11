import React, { useEffect, useRef, useState, useCallback } from 'react';
import styles from './ToothRotator.module.css';

// 8 Turnaround frames from user's multi-angle turnaround sheet
// Total image: 1024 x 682
// 6 Columns: colWidth = 1024 / 6 = 170.666
// Row 1 (y: 28 to 228, h: 200)
// Row 2 (y: 264 to 464, h: 200)
const FRAMES = [
  { name: 'Front', col: 0, row: 0 },         // 0° Front
  { name: 'Front-Right', col: 1, row: 1 },   // 45° 3/4 Front Right
  { name: 'Right', col: 2, row: 0 },         // 90° Right Side
  { name: 'Back-Right', col: 3, row: 1 },    // 135° 3/4 Back Right
  { name: 'Back', col: 3, row: 0 },          // 180° Back
  { name: 'Back-Left', col: 2, row: 1 },     // 225° 3/4 Back Left
  { name: 'Left', col: 1, row: 0 },          // 270° Left Side
  { name: 'Front-Left', col: 0, row: 1 },    // 315° 3/4 Front Left
];

const ToothRotator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(0);
  const frameCanvases = useRef<HTMLCanvasElement[]>([]);
  const currentAngleRef = useRef(0);

  // Pre-process and crop the 8 pristine photorealistic turnaround frames
  useEffect(() => {
    const img = new Image();
    img.src = '/tooth-turnaround.jpg';

    img.onload = () => {
      const colWidth = img.width / 6;
      const row1Y = 28;
      const row1H = 200;
      const row2Y = 264;
      const row2H = 200;

      const processed: HTMLCanvasElement[] = [];

      FRAMES.forEach((frame) => {
        const offCanvas = document.createElement('canvas');
        const sx = frame.col * colWidth + 5;
        const sy = frame.row === 0 ? row1Y : row2Y;
        const sw = colWidth - 10;
        const sh = frame.row === 0 ? row1H : row2H;

        offCanvas.width = 300;
        offCanvas.height = 360;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) return;

        // Render cropped angle preserving 100% of the glossy highlights and natural root shading
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, offCanvas.width, offCanvas.height);
        processed.push(offCanvas);
      });

      frameCanvases.current = processed;
      setIsLoaded(true);
    };
  }, []);

  // Draw current frame to main canvas
  const renderFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !frameCanvases.current[index]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frameCanvases.current[index], 0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      renderFrame(frameIndex);
    }
  }, [isLoaded, frameIndex, renderFrame]);

  // Handle Mouse Hover across container to spin 360°
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetFrame = Math.floor(normX * 8) % 8;
    if (targetFrame !== frameIndex) {
      setFrameIndex(targetFrame);
      currentAngleRef.current = targetFrame;
    }
  };

  // Handle Mouse Drag (click and drag to rotate 360°)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartFrame.current = currentAngleRef.current;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      const frameDelta = Math.round(deltaX / 28);
      let nextFrame = (dragStartFrame.current + frameDelta) % 8;
      if (nextFrame < 0) nextFrame += 8;
      setFrameIndex(nextFrame);
      currentAngleRef.current = nextFrame;
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={styles.rotatorWrap}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      aria-label="Interactive 3D Tooth Turnaround — Drag or move mouse to rotate 360°"
    >
      <div className={styles.canvasHolder}>
        <canvas
          ref={canvasRef}
          width={300}
          height={360}
          className={`${styles.toothCanvas} ${isDragging ? styles.dragging : ''}`}
        />
        {/* Soft realistic studio ground shadow */}
        <div className={styles.groundShadow} />
      </div>

      <div className={styles.hintBadge}>
        <span>↔ Drag or move cursor to spin 360°</span>
      </div>
    </div>
  );
};

export default ToothRotator;
