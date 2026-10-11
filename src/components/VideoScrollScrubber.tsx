/**
 * VideoScrollScrubber
 * -------------------
 * Scroll-driven video scrubbing using GSAP ScrollTrigger.
 *
 * Config knobs (all at the top of the file):
 *   SCROLL_DURATION_VH  — how many viewport-heights of scroll the full
 *                         animation spans.  Increase to slow it down,
 *                         decrease to speed it up.  Default: 3 (= 300 vh).
 *
 *   SCRUB_SMOOTHNESS    — GSAP scrub smoothing factor (seconds of lag).
 *                         0 = instant/frame-perfect, 1.5 = silky smooth.
 *
 * The video is NEVER autoplayed.  It only moves when the user scrolls.
 * A hidden <video> element is used as the decode source; frames are
 * painted to a <canvas> to avoid any browser-native playback artefacts.
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './VideoScrollScrubber.module.css';

gsap.registerPlugin(ScrollTrigger);

// ─── Configurable constants ───────────────────────────────────────────────────
/** Total scroll distance for the full animation, in viewport-height units. */
const SCROLL_DURATION_VH = 3;

/** GSAP scrub smoothness in seconds. 0 = instant. 1.5 = very smooth. */
const SCRUB_SMOOTHNESS = 1.2;

/** Path to the video asset served from /public */
const VIDEO_SRC = '/animated-video.mp4';
// ─────────────────────────────────────────────────────────────────────────────

const VideoScrollScrubber: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const isReadyRef = useRef(false);
  const dprRef = useRef(1);

  // ── Paint one frame to canvas ──────────────────────────────────────────────
  const paintFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isReadyRef.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width / dprRef.current;
    const h = canvas.height / dprRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, w, h);
  }, []);

  // ── Resize canvas to match wrapper DPR ────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (!canvas || !sticky) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dprRef.current = dpr;
    const w = sticky.clientWidth;
    const h = sticky.clientHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    paintFrame();
  }, [paintFrame]);

  // ── Seek the hidden video to the current progress ─────────────────────────
  const seekTo = useCallback((progress: number) => {
    const video = videoRef.current;
    if (!video || !isReadyRef.current) return;

    const clampedProgress = Math.max(0, Math.min(1, progress));
    const targetTime = clampedProgress * video.duration;

    if (Math.abs(video.currentTime - targetTime) < 0.001) return;

    video.currentTime = targetTime;
  }, []);

  useEffect(() => {
    // ── Create hidden video element ──────────────────────────────────────────
    const video = document.createElement('video');
    video.src = VIDEO_SRC;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.pause();
    videoRef.current = video;

    // ── Canvas resize observer ───────────────────────────────────────────────
    const ro = new ResizeObserver(() => resizeCanvas());
    if (stickyRef.current) ro.observe(stickyRef.current);

    const onMetadata = () => {
      resizeCanvas();
    };

    const onCanPlay = () => {
      isReadyRef.current = true;
      video.currentTime = 0;
    };

    const onSeeked = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(paintFrame);
    };

    video.addEventListener('loadedmetadata', onMetadata);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('seeked', onSeeked);

    // ── GSAP ScrollTrigger ───────────────────────────────────────────────────
    const gsapCtx = gsap.context(() => {
      const proxy = { progress: 0 };
      gsap.to(proxy, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${SCROLL_DURATION_VH * 100}%`,
          pin: stickyRef.current,
          scrub: SCRUB_SMOOTHNESS,
          anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            seekTo(self.progress);
          },
          onRefresh: () => {
            seekTo(progressRef.current);
          },
        },
      });
    });

    video.load();

    return () => {
      gsapCtx.revert();
      ro.disconnect();
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('seeked', onSeeked);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.src = '';
      videoRef.current = null;
      isReadyRef.current = false;
    };
  }, [resizeCanvas, paintFrame, seekTo]);

  return (
    <div
      ref={sectionRef}
      className={styles.scrollSection}
      style={{ height: `${(SCROLL_DURATION_VH + 1) * 100}vh` }}
      aria-label="Scroll-driven dental animation"
    >
      <div ref={stickyRef} className={styles.stickyPane}>
        <canvas
          ref={canvasRef}
          className={styles.videoCanvas}
          aria-hidden="true"
        />
        <div className={styles.fadeOverlay} aria-hidden="true" />
        <div className={styles.loadingPlaceholder} id="video-loading-placeholder" aria-hidden="true">
          <div className={styles.loadingRing} />
        </div>
      </div>
    </div>
  );
};

export default VideoScrollScrubber;
