/**
 * toothController.ts
 *
 * Framework-free interaction logic for the hero tooth.
 *   - LEFT mouse button drag rotates the tooth 1:1 with the cursor (no smoothing, no delay).
 *   - Releasing the button springs the tooth back to its default upright, front-facing pose
 *     with a short natural overshoot (damped spring).
 *   - When nothing is happening the tooth auto-spins slowly and bobs gently.
 *
 * It only needs `three` (Quaternion). All numbers are in the config below.
 *
 * Usage (see InteractiveToothWiring.example.tsx):
 *   const controller = new ToothController();
 *   // DOM events  -> controller.pointerDown / pointerMove / endDrag
 *   // every frame -> controller.update(delta); group.quaternion.copy(controller.quaternion);
 *                     group.position.y = baseY + controller.bobY;
 */
import { Quaternion, Vector3 } from 'three';

export interface ToothControllerConfig {
  /** Radians of rotation per CSS pixel of drag. 0.009 rad/px = about 0.5 degree per pixel. */
  sensitivity: number;
  /** Auto-spin speed in radians per second (true speed, frame-rate independent). */
  idleSpeed: number;
  /** Seconds to wait after the tooth has settled before auto-spin starts. */
  idleDelay: number;
  /** Seconds for auto-spin and bob to ramp from 0 to full. */
  idleRamp: number;
  /** Spring stiffness k (higher = faster return). */
  springStiffness: number;
  /** Spring damping c. damping ratio = c / (2*sqrt(k)). 17 with k=300 gives ~0.49: one clear bounce, settles in about 0.8 s. */
  springDamping: number;
  /** Bob height in scene units and frequency in Hz. */
  bobAmp: number;
  bobFreq: number;
  /** A press-and-release that moves less than this many CSS px is a click: no bounce-back. */
  tapThresholdPx: number;
  /** prefers-reduced-motion: no auto-spin, no bob, spring becomes critically damped (no bounce). */
  reducedMotion: boolean;
}

export const DEFAULT_TOOTH_CONFIG: ToothControllerConfig = {
  sensitivity: 0.009,
  idleSpeed: 0.3,
  idleDelay: 0.4,
  idleRamp: 1.0,
  springStiffness: 300,
  springDamping: 17,
  bobAmp: 0.07,
  bobFreq: 0.5,
  tapThresholdPx: 3,
  reducedMotion: false,
};

const AXIS_X = new Vector3(1, 0, 0);
const AXIS_Y = new Vector3(0, 1, 0);

export interface PointerLike {
  button: number;
  pointerType: string;
  pointerId: number;
  clientX: number;
  clientY: number;
}

export class ToothController {
  /** Current orientation. Copy this onto the model every frame. */
  readonly quaternion = new Quaternion();
  /** Vertical offset for the idle bob (scene units). Add to the model's base Y. */
  bobY = 0;
  dragging = false;
  springActive = false;
  cfg: ToothControllerConfig;

  private pointerId = -1;
  private lastX = 0;
  private lastY = 0;
  private movedPx = 0;
  private yawOnly = false;

  private s = 0; // spring progress: 1 = at release pose, 0 = at rest pose, <0 = overshoot
  private v = 0;
  private readonly release = new Quaternion();

  private settledFor = 0; // seconds since the last interaction / spring end
  private time = 0;

  private readonly qa = new Quaternion();

  constructor(cfg: Partial<ToothControllerConfig> = {}) {
    this.cfg = { ...DEFAULT_TOOTH_CONFIG, ...cfg };
  }

  // ───────────────────────── DOM-facing API ─────────────────────────

  /** Returns true if this press starts a drag (left mouse/pen button only; touch is handled separately). */
  pointerDown(e: PointerLike): boolean {
    if (e.button !== 0 || e.pointerType === 'touch') return false;
    this.beginDrag(e.pointerId, e.clientX, e.clientY, false);
    return true;
  }

  /** Feed every pointermove (and every coalesced event). Rotation is applied immediately. */
  pointerMove(e: Pick<PointerLike, 'pointerId' | 'clientX' | 'clientY'>): boolean {
    return this.moveTo(e.pointerId, e.clientX, e.clientY);
  }

  /** Call on pointerup, pointercancel and lostpointercapture. */
  pointerUp(e: Pick<PointerLike, 'pointerId'>): void {
    this.endDrag(e.pointerId);
  }

  // ───────────────────── lower-level API (touch uses this) ─────────────────────

  beginDrag(id: number, x: number, y: number, yawOnly = false): void {
    this.dragging = true;
    this.pointerId = id;
    this.lastX = x;
    this.lastY = y;
    this.movedPx = 0;
    this.yawOnly = yawOnly;
    this.springActive = false; // a new drag cancels a running bounce instantly
    this.settledFor = 0;
  }

  moveTo(id: number, x: number, y: number): boolean {
    if (!this.dragging || id !== this.pointerId) return false;
    const dx = x - this.lastX;
    const dy = y - this.lastY;
    this.lastX = x;
    this.lastY = y;
    this.rotateBy(dx, dy);
    return true;
  }

  /** Rotate by a cursor delta in CSS px. Horizontal = around the screen's vertical axis, vertical = around the horizontal axis. */
  rotateBy(dxPx: number, dyPx: number): void {
    const yaw = dxPx * this.cfg.sensitivity;
    const pitch = this.yawOnly ? 0 : dyPx * this.cfg.sensitivity;
    this.movedPx += Math.abs(dxPx) + (this.yawOnly ? 0 : Math.abs(dyPx));
    if (yaw !== 0) this.quaternion.premultiply(this.qa.setFromAxisAngle(AXIS_Y, yaw));
    if (pitch !== 0) this.quaternion.premultiply(this.qa.setFromAxisAngle(AXIS_X, pitch));
    this.quaternion.normalize();
    this.settledFor = 0;
  }

  endDrag(id?: number): void {
    if (!this.dragging) return;
    if (id !== undefined && id !== this.pointerId) return;
    this.dragging = false;
    this.pointerId = -1;
    this.settledFor = 0;
    const wasDrag = this.movedPx >= this.cfg.tapThresholdPx;
    if (wasDrag && this.angleFromRest() > 0.02) {
      this.release.copy(this.quaternion);
      this.s = 1;
      this.v = 0;
      this.springActive = true; // bounce-back starts on the very next update()
    }
  }

  /** Angle (radians, 0..PI) between the current pose and the rest pose. */
  angleFromRest(): number {
    return 2 * Math.acos(Math.min(1, Math.abs(this.quaternion.w)));
  }

  // ───────────────────────── per-frame update ─────────────────────────

  update(deltaSeconds: number): void {
    const dt = Math.min(Math.max(deltaSeconds, 0), 1 / 30); // clamp tab-switch spikes
    this.time += dt;
    const cfg = this.cfg;
    let idleWeight = 0;

    if (this.springActive) {
      const k = cfg.springStiffness;
      const c = cfg.reducedMotion ? 2 * Math.sqrt(k) : cfg.springDamping;
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        this.v += (-k * this.s - c * this.v) * h; // semi-implicit Euler
        this.s += this.v * h;
      }
      if (Math.abs(this.s) < 1e-3 && Math.abs(this.v) < 1e-2) {
        this.s = 0;
        this.v = 0;
        this.springActive = false;
        this.quaternion.identity();
        this.settledFor = 0;
      } else {
        // rest pose slerped toward the release pose by s. s < 0 extrapolates past rest = the bounce.
        this.quaternion.identity().slerp(this.release, this.s);
      }
    } else if (!this.dragging) {
      this.settledFor += dt;
      if (!cfg.reducedMotion) {
        const w = Math.min(1, Math.max(0, (this.settledFor - cfg.idleDelay) / cfg.idleRamp));
        idleWeight = w * w * (3 - 2 * w); // smoothstep
        if (idleWeight > 0) {
          this.quaternion.premultiply(this.qa.setFromAxisAngle(AXIS_Y, cfg.idleSpeed * dt * idleWeight));
          this.quaternion.normalize();
        }
      }
    }

    // Bob eases toward its target so it never jumps when a drag starts.
    const bobTarget = cfg.reducedMotion ? 0 : Math.sin(this.time * Math.PI * 2 * cfg.bobFreq) * cfg.bobAmp * idleWeight;
    this.bobY += (bobTarget - this.bobY) * (1 - Math.exp(-12 * dt));
  }
}
