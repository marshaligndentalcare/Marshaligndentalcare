import fs from 'fs';
import zlib from 'zlib';

const srcBuf = fs.readFileSync('scratch/extracted_frame.original.png');
let offset = 8, width = 0, height = 0, idats = [];
while (offset < srcBuf.length) {
  const len = srcBuf.readUInt32BE(offset);
  const type = srcBuf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IHDR') {
    width = srcBuf.readUInt32BE(offset + 8);
    height = srcBuf.readUInt32BE(offset + 12);
  } else if (type === 'IDAT') idats.push(srcBuf.slice(offset + 8, offset + 8 + len));
  offset += 12 + len;
}
const stride = 1 + width * 4;
const uncompressed = zlib.inflateSync(Buffer.concat(idats));
const pixels = Buffer.alloc(width * height * 4);
function paeth(a, b, c) {
  const p = a - b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
}
for (let y = 0; y < height; y++) {
  const filter = uncompressed[y * stride], lineStart = y * stride + 1;
  const prevLinePixels = (y - 1) * width * 4, curLinePixels = y * width * 4;
  for (let x = 0; x < width * 4; x++) {
    const rawVal = uncompressed[lineStart + x];
    const left = x >= 4 ? pixels[curLinePixels + x - 4] : 0;
    const up = y > 0 ? pixels[prevLinePixels + x] : 0;
    const upleft = (y > 0 && x >= 4) ? pixels[prevLinePixels + x - 4] : 0;
    let val = 0;
    if (filter === 0) val = rawVal;
    else if (filter === 1) val = (rawVal + left) & 0xff;
    else if (filter === 2) val = (rawVal + up) & 0xff;
    else if (filter === 3) val = (rawVal + Math.floor((left + up) / 2)) & 0xff;
    else if (filter === 4) val = (rawVal + paeth(left, up, upleft)) & 0xff;
    pixels[curLinePixels + x] = val;
  }
}

// Compute Sobel gradient magnitude
const grad = new Float32Array(width * height);
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const getLum = (ox, oy) => {
      const i = ((y + oy) * width + (x + ox)) * 4;
      return 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    };
    const gx = -getLum(-1, -1) + getLum(1, -1) - 2 * getLum(-1, 0) + 2 * getLum(1, 0) - getLum(-1, 1) + getLum(1, 1);
    const gy = -getLum(-1, -1) - 2 * getLum(0, -1) - getLum(1, -1) + getLum(-1, 1) + 2 * getLum(0, 1) + getLum(1, 1);
    grad[y * width + x] = Math.sqrt(gx * gx + gy * gy);
  }
}

// Trace precise left and right outer boundaries for the crown and upper roots (y: 138 to 460)
const leftEdge = new Int32Array(height).fill(-1);
const rightEdge = new Int32Array(height).fill(-1);

for (let y = 138; y <= 460; y++) {
  // Left outer edge
  for (let x = 450; x <= 640; x++) {
    const i = (y * width + x) * 4;
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
    const gVal = grad[y * width + x];
    const lum = (r+g+b)/3;
    if (gVal >= 10 || (diff >= 3 && lum < 240) || (r > b + 3 && lum < 242)) {
      leftEdge[y] = x;
      break;
    }
  }

  // Right outer edge
  for (let x = 830; x >= 640; x--) {
    const i = (y * width + x) * 4;
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
    const gVal = grad[y * width + x];
    const lum = (r+g+b)/3;
    if (gVal >= 10 || (diff >= 3 && lum < 240) || (r > b + 3 && lum < 242)) {
      rightEdge[y] = x;
      break;
    }
  }
}

// Segmentation mask:
// 0 = Transparent Background
// 1 = 100% Solid Tooth (Exact original RGB)
// 2 = Grounding Contact Shadow
const mask = new Uint8Array(width * height);

// 1. Crown (y: 138 to 460): 100% solid between left and right boundary
for (let y = 138; y <= 460; y++) {
  const lx = leftEdge[y];
  const rx = rightEdge[y];
  if (lx === -1 || rx === -1) continue;
  for (let x = lx; x <= rx; x++) {
    mask[y * width + x] = 1;
  }
}

// 2. Individual Roots (y: 461 to 611):
// - Left root: x in [490, 575], natural apex terminates at y=589
// - Center root: naturally tapers towards apex at (636, 611)
// - Right root: x in [690, 782], natural apex terminates at y=591
for (let y = 461; y <= 611; y++) {
  for (let x = 490; x <= 782; x++) {
    // Check if within anatomical root zones
    const isLeftRootZone = (x >= 490 && x <= 575 && y <= 589);
    const isCenterRootZone = (
      (y <= 550 && x >= 580 && x <= 680) ||
      (y > 550 && y <= 585 && x >= 595 && x <= 670) ||
      (y > 585 && y <= 611 && x >= 615 && x <= 655)
    );
    const isRightRootZone = (x >= 690 && x <= 782 && y <= 591);

    if (!isLeftRootZone && !isCenterRootZone && !isRightRootZone) continue;

    const i = (y * width + x) * 4;
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const lum = (r+g+b)/3;
    const rbDiff = r - b;

    // Genuine root dentin has strong warm tone (R-B >= 7) and is darker than studio white
    const isRootPixel = (rbDiff >= 7 && lum < 238) || (rbDiff >= 5 && lum < 232);
    if (isRootPixel) {
      mask[y * width + x] = 1;
    }
  }
}

// Fill any tiny subpixel pinholes within root interiors
for (let y = 465; y <= 610; y++) {
  for (let x = 495; x <= 775; x++) {
    const idx = y * width + x;
    if (mask[idx] === 0) {
      if (mask[idx - 1] === 1 && mask[idx + 1] === 1) mask[idx] = 1;
      if (mask[idx - width] === 1 && mask[idx + width] === 1) mask[idx] = 1;
    }
  }
}

// 3. Grounding Contact Shadow below roots (y: 618 to 658, x: 520 to 760)
// Centered directly beneath the center root at x=640, y=630
for (let y = 618; y <= 656; y++) {
  for (let x = 520; x <= 760; x++) {
    const idx = y * width + x;
    if (mask[idx] === 1) continue; // Root tips take precedence

    const i = idx * 4;
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const lum = (r+g+b)/3;

    const dx = (x - 640) / 115;
    const dy = (y - 630) / 18;
    const distSq = dx * dx + dy * dy;

    if (distSq <= 1.0 && lum < 228) {
      mask[idx] = 2; // Shadow
    }
  }
}

// Build RGBA output
const outPixels = Buffer.alloc(width * height * 4);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const pidx = y * width + x;
    const bidx = pidx * 4;
    const m = mask[pidx];

    if (m === 1) {
      // Tooth: preserve 100% original RGB values
      outPixels[bidx] = pixels[bidx];
      outPixels[bidx + 1] = pixels[bidx + 1];
      outPixels[bidx + 2] = pixels[bidx + 2];

      // Edge antialiasing: soften alpha only on outer 1-pixel boundary
      let bgCount = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (mask[ny * width + nx] === 0) bgCount++;
        }
      }
      outPixels[bidx + 3] = bgCount > 0 ? 215 : 255;
    } else {
      // Background: clean transparent
      outPixels[bidx] = 0;
      outPixels[bidx + 1] = 0;
      outPixels[bidx + 2] = 0;
      outPixels[bidx + 3] = 0;
    }
  }
}

// Grounding Contact Shadow: render silky-smooth mathematical ellipse directly under the roots
// Shadow center at x = 636, y = 626 (just below center root apex at y=618)
const shadowCenterX = 636;
const shadowCenterY = 626;
const shadowRadiusX = 85;
const shadowRadiusY = 9.5;

for (let y = Math.floor(shadowCenterY - shadowRadiusY * 1.5); y <= Math.ceil(shadowCenterY + shadowRadiusY * 1.5); y++) {
  for (let x = Math.floor(shadowCenterX - shadowRadiusX * 1.5); x <= Math.ceil(shadowCenterX + shadowRadiusX * 1.5); x++) {
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const pidx = y * width + x;
    if (mask[pidx] === 1) continue; // Root tips take precedence

    const dx = (x - shadowCenterX) / shadowRadiusX;
    const dy = (y - shadowCenterY) / shadowRadiusY;
    const distSq = dx * dx + dy * dy;

    if (distSq < 1.0) {
      const dist = Math.sqrt(distSq);
      // Smooth Hermite / cosine falloff
      const falloff = 0.5 * (1 + Math.cos(dist * Math.PI));
      const shadowAlpha = Math.round(falloff * falloff * 115); // Max opacity ~45% for natural studio ambient shadow

      const bidx = pidx * 4;
      outPixels[bidx] = 40;     // Deep charcoal
      outPixels[bidx + 1] = 45; // Subtle cool slate
      outPixels[bidx + 2] = 55;
      outPixels[bidx + 3] = Math.max(outPixels[bidx + 3], shadowAlpha);
    }
  }
}

// Crop to optimal hero canvas: 520 x 640 px
// Tooth center is at x=640, top at y=138, bottom of shadow at y=656
// Crop box: X [380, 900] (width 520), Y [80, 720] (height 640)
const cropW = 520;
const cropH = 640;
const startX = 380;
const startY = 80;

const croppedPixels = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  const srcY = startY + y;
  for (let x = 0; x < cropW; x++) {
    const srcX = startX + x;
    const srcIdx = (srcY * width + srcX) * 4;
    const destIdx = (y * cropW + x) * 4;

    if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
      croppedPixels[destIdx] = outPixels[srcIdx];
      croppedPixels[destIdx + 1] = outPixels[srcIdx + 1];
      croppedPixels[destIdx + 2] = outPixels[srcIdx + 2];
      croppedPixels[destIdx + 3] = outPixels[srcIdx + 3];
    }
  }
}

function encodePNG(pix, w, h) {
  const lineStride = 1 + w * 4;
  const uncomp = Buffer.alloc(lineStride * h);
  for (let y = 0; y < h; y++) {
    uncomp[y * lineStride] = 0;
    pix.copy(uncomp, y * lineStride + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idatData = zlib.deflateSync(uncomp, { level: 9 });

  function crc32(buf) {
    let table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[i] = c;
    }
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    return (crc ^ (-1)) >>> 0;
  }

  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(combined), 0);
    return Buffer.concat([lenBuf, combined, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdrData),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

const finalPng = encodePNG(croppedPixels, cropW, cropH);

fs.writeFileSync('scratch/extracted_frame.png', finalPng);
fs.writeFileSync('public/extracted_frame.png', finalPng);
console.log(`Successfully generated flawless extracted_frame.png! Size: ${(finalPng.length / 1024).toFixed(1)} KB, dimensions: ${cropW} x ${cropH}`);
