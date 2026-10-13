"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── Curved Cylindrical Image Strip ──────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * A CSS box can't bend, so every tile is cut into SLICES vertical strips,
 * each a flat facet of the cylinder showing its share of the image. The
 * strips sit still inside their tile, each turned its own few degrees
 * round the cylinder's axis, and the tile (preserve-3d) is what moves: one
 * rotateY about that same axis carries the whole tile along the arc.
 * ─────────────────────────────────────────────────────────────── */

// Strips per tile for smooth cylindrical curvature without faceted edges.
const SLICES = 16;

// Camera distance from the screen as a multiple of cylinder radius.
const CAMERA = 1.6;

/**
 * Cylinder radius, as a share of the hero's width, that puts the frame's
 * edge `bend` radians round the arc as seen through the camera:
 * r·sinθ · CAMERA / (CAMERA − 1 + cosθ) = width / 2, solved for r.
 */
function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

// A tile is never wider than this share of the container on narrow screens.
const MAX_WIDTH = 55;

/**
 * Lays the loop on the cylinder.
 */
function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const h = Math.min(
    (tile / 100) * height,
    ((MAX_WIDTH / 100) * width) / aspect,
  );
  const radius = width * arc(bend);
  if (!(h > 0) || !(radius > 0))
    return { columns: 2, sweep: 0, unit: 0, limit: 0 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  // Capped so container cannot mount runaway numbers of tiles.
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
  label?: string;
  id?: string;
  onClick?: () => void;
};

export type TiltedGridHeroProps = {
  /**
   * Images run along the row in order. A tile takes its next image each
   * time it wraps off-screen, so the whole list plays through smoothly.
   */
  images: TiltedGridImage[];
  /**
   * Seconds for the row to advance by one tile. Speed is per tile.
   * @default 4
   */
  speed?: number;
  /** Tile height, as a percentage of the container's height. @default 28 */
  tileHeight?: number;
  /** Tile width divided by tile height. @default 16 / 9 */
  aspectRatio?: number;
  /** Space between tiles, as a percentage of a tile's height. @default 6 */
  gap?: number;
  /** Vertical centre of the row, as a percentage of container height. @default 54 */
  axis?: number;
  /**
   * How far the row has bent round by the frame's edge, in degrees.
   * Clamped to 5–85.
   * @default 75
   */
  curve?: number;
  /** Width of the fade at each end, as a percentage of container width. @default 12 */
  fade?: number;
  /** Optional click handler when a tile is pressed */
  onTileClick?: (image: TiltedGridImage, index: number) => void;
  /** Content rendered above or inside the band. */
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images = [],
  speed = 4.5,
  tileHeight = 28,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 54,
  curve = 75,
  fade = 12,
  onTileClick,
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  // Initialized with standard dimensions so first render is immediately visible
  const [layout, setLayout] = React.useState<ReturnType<typeof measure>>(() =>
    measure(1200, 560, tileHeight, aspectRatio, gap, bend),
  );

  // The image each tile shows, as a position in the run of images.
  const [shown, setShown] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      const next = measure(width, height, tileHeight, aspectRatio, gap, bend);
      setLayout((prev) =>
        prev?.columns === next.columns &&
          prev.sweep === next.sweep &&
          prev.unit === next.unit
          ? prev
          : next,
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [tileHeight, aspectRatio, gap, bend]);

  // Preload every image safely.
  React.useEffect(() => {
    if (!images || images.length === 0) return;
    for (const img of images) {
      if (img?.src) {
        const imageObj = new Image();
        imageObj.src = img.src;
      }
    }
  }, [images]);

  const { columns, sweep, unit, limit } =
    layout ?? measure(1200, 560, tileHeight, aspectRatio, gap, bend);

  // Every length is a multiple of the tile's height, which follows the
  // container's height until MAX_WIDTH caps it on narrow screens.
  const u = (n: number) =>
    `calc(${+n.toFixed(4)} * min(${tileHeight}cqh, ${+(
      MAX_WIDTH / aspectRatio
    ).toFixed(4)}cqw))`;

  const r = 100 * arc(bend);
  const radius = `${+r.toFixed(3)}cqw`;

  const turn = (deg: number) =>
    `translateZ(${radius}) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius})`;

  const rawHide = ((sweep - limit) / (2 * sweep || 1)) * 100;
  const hide = Math.min(49.9, Math.max(0, +rawHide.toFixed(4)));

  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused !important}}`;

  const share = aspectRatio / SLICES;
  const duration = columns * speed;
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade
    }%,transparent)`;

  const hasImages = images && images.length > 0;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden select-none", className)}
      {...props}
      style={{
        position: "relative",
        overflow: "hidden",
        userSelect: "none",
        containerType: "size",
        ...props.style,
      }}
    >
      <style>{css}</style>

      {hasImages && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 1,
            perspective: `${+(r * CAMERA).toFixed(3)}cqw`,
            perspectiveOrigin: `50% ${axis}%`,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        >
          {Array.from({ length: columns }, (_, t) => {
            const first = columns - 1 - t;
            const imgIndex = (shown[t] ?? first) % Math.max(images.length, 1);
            const img = images[imgIndex];

            const handleTileClick = () => {
              if (img?.onClick) {
                img.onClick();
              } else if (onTileClick && img) {
                onTileClick(img, imgIndex);
              }
            };

            return (
              <div
                key={t}
                className={cn(tile, "absolute", (onTileClick || img?.onClick) ? "pointer-events-auto cursor-pointer" : "")}
                style={{
                  position: "absolute",
                  left: `calc(50% - ${u(aspectRatio / 2)})`,
                  top: `calc(${axis}% - ${u(0.5)})`,
                  width: u(aspectRatio),
                  height: u(1),
                  transformStyle: "preserve-3d",
                  animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
                }}
                onClick={handleTileClick}
                onAnimationIteration={(e) => {
                  const lap = Math.round(e.elapsedTime / duration);
                  setShown((prev) => {
                    const next = lap * columns + first;
                    return prev[t] === next ? prev : { ...prev, [t]: next };
                  });
                }}
              >
                {Array.from({ length: SLICES }, (_, k) => (
                  <div
                    key={k}
                    className={cn(
                      "absolute top-0 overflow-hidden bg-muted",
                      k === 0 && "rounded-l-lg",
                      k === SLICES - 1 && "rounded-r-lg",
                    )}
                    style={{
                      position: "absolute",
                      top: 0,
                      overflow: "hidden",
                      borderTopLeftRadius: k === 0 ? "0.5rem" : 0,
                      borderBottomLeftRadius: k === 0 ? "0.5rem" : 0,
                      borderTopRightRadius: k === SLICES - 1 ? "0.5rem" : 0,
                      borderBottomRightRadius: k === SLICES - 1 ? "0.5rem" : 0,
                      left: u((aspectRatio - share) / 2),
                      width:
                        k === SLICES - 1 ? u(share) : `calc(${u(share)} + 1px)`,
                      height: u(1),
                      backgroundColor: "#EDEAE7",
                      transform: turn(
                        (aspectRatio / 2 - (k + 0.5) * share) * unit,
                      ),
                    }}
                  >
                    {img?.src ? (
                      <img
                        src={img.src}
                        alt={k === 0 ? (img.alt ?? "") : ""}
                        draggable={false}
                        className="absolute top-0 max-w-none object-cover"
                        style={{
                          position: "absolute",
                          top: 0,
                          maxWidth: "none",
                          objectFit: "cover",
                          left: u(-k * share),
                          width: u(aspectRatio),
                          height: u(1),
                        }}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}

export default TiltedGridHero;
