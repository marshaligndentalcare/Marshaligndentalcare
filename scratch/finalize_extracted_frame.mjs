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
  } else if (type === 'IDAT') {
    idats.push(srcBuf.slice(offset + 8, offset + 8 + len));
  }
  offset += 12 + len;
}

const stride = 1 + width * 4;
const uncompressed = zlib.inflateSync(Buffer.concat(idats));
const pixels = Buffer.alloc(width * height * 4);

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

for (let y = 0; y < height; y++) {
  const filter = uncompressed[y * stride];
  const lineStart = y * stride + 1;
  const prevLinePixels = (y - 1) * width * 4;
  const curLinePixels = y * width * 4;

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

    const gx = -getLum(-1, -1) + getLum(1, -1)
               -2 * getLum(-1, 0) + 2 * getLum(1, 0)
               -getLum(-1, 1) + getLum(1, 1);

    const gy = -getLum(-1, -1) - 2 * getLum(0, -1) - getLum(1, -1)
               +getLum(-1, 1) + 2 * getLum(0, 1) + getLum(1, 1);

    grad[y * width + x] = Math.sqrt(gx * gx + gy * gy);
  }
}

// Segmentation mask: 0 = background, 1 = tooth body, 2 = soft shadow
const mask = new Uint8Array(width * height);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    const lum = (r + g + b) / 3;

    // Tooth body (crown + roots):
    // Inside horizontal range x: 464 to 815, vertical range y: 140 to 618
    if (x >= 464 && x <= 816 && y >= 140 && y <= 618) {
      // Warm roots:
      if (y >= 350 && maxDiff >= 4) {
        mask[y * width + x] = 1;
        continue;
      }
      // Crown walls & center:
      if (maxDiff >= 3 || lum > 246 || grad[y * width + x] > 4) {
        mask[y * width + x] = 1;
        continue;
      }
      // Inside crown interior:
      if (y >= 155 && y <= 380 && x >= 490 && x <= 790) {
        mask[y * width + x] = 1;
        continue;
      }
    }

    // Soft contact shadow directly under roots (y from 615 to 660, x from 500 to 780):
    if (y >= 615 && y <= 660 && x >= 500 && x <= 780) {
      // Elliptical falloff from shadow center (640, 626)
      const dx = (x - 640) / 140;
      const dy = (y - 626) / 28;
      const distSq = dx * dx + dy * dy;
      if (distSq <= 1.0 && lum < 228) {
        mask[y * width + x] = 2; // Shadow pixel
        continue;
      }
    }
  }
}

// Clean morphological closing for tooth body to ensure completely solid interior
const cleanMask = new Uint8Array(mask);
for (let iter = 0; iter < 3; iter++) {
  for (let y = 145; y < 615; y++) {
    for (let x = 470; x < 810; x++) {
      const idx = y * width + x;
      if (cleanMask[idx] === 0) {
        // If surrounded by tooth pixels on left and right, it's solid tooth interior!
        let hasLeft = false, hasRight = false;
        for (let k = 1; k < 20; k++) {
          if (cleanMask[idx - k] === 1) hasLeft = true;
          if (cleanMask[idx + k] === 1) hasRight = true;
        }
        if (hasLeft && hasRight) {
          cleanMask[idx] = 1;
        }
      }
    }
  }
}

// Build RGBA output with smooth antialiased edges
const outPixels = Buffer.alloc(width * height * 4);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const pidx = y * width + x;
    const bidx = pidx * 4;

    const m = cleanMask[pidx];
    if (m === 1) {
      // Solid tooth: 100% original RGB preserved
      outPixels[bidx] = pixels[bidx];
      outPixels[bidx + 1] = pixels[bidx + 1];
      outPixels[bidx + 2] = pixels[bidx + 2];

      // Edge antialiasing: count transparent neighbors
      let bgNeighbors = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (cleanMask[ny * width + nx] === 0) bgNeighbors++;
        }
      }
      outPixels[bidx + 3] = bgNeighbors > 0 ? 210 : 255;
    } else if (m === 2) {
      // Natural contact shadow: dark neutral shadow with soft alpha
      const r = pixels[bidx], g = pixels[bidx + 1], b = pixels[bidx + 2];
      const lum = (r + g + b) / 3;
      const dx = (x - 640) / 140;
      const dy = (y - 626) / 28;
      const falloff = Math.max(0, 1.0 - Math.sqrt(dx * dx + dy * dy));
      const shadowDensity = Math.max(0, (230 - lum) / 35);

      outPixels[bidx] = 50;
      outPixels[bidx + 1] = 55;
      outPixels[bidx + 2] = 65;
      outPixels[bidx + 3] = Math.round(Math.min(180, shadowDensity * falloff * 240));
    } else {
      // Background: completely transparent
      outPixels[bidx] = 0;
      outPixels[bidx + 1] = 0;
      outPixels[bidx + 2] = 0;
      outPixels[bidx + 3] = 0;
    }
  }
}

// ── Crop to optimal dimensions ─────────────────────────────────────
// Tooth bounds: X ~ 460 to 820 (width ~ 360), Y ~ 138 to 654 (height ~ 516)
// We crop to a centered box: 520 wide x 640 tall with balanced transparent padding!
const cropW = 520;
const cropH = 640;
const startX = Math.round(640 - cropW / 2); // 380 to 900
const startY = 80;                          // 80 to 720

console.log(`Cropping from X [${startX}, ${startX + cropW}], Y [${startY}, ${startY + cropH}]`);
console.log(`Final Canvas: ${cropW} x ${cropH} px`);

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

// Save to scratch and public
fs.writeFileSync('scratch/extracted_frame.png', finalPng);
fs.writeFileSync('public/extracted_frame.png', finalPng);
console.log(`Saved transparent extracted_frame.png successfully! File size: ${(finalPng.length / 1024).toFixed(1)} KB`);
