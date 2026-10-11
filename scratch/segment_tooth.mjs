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

// Compute Sobel gradient magnitude for edge detection
const grad = new Float32Array(width * height);
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = (y * width + x) * 4;
    // Lum
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

// Background criteria:
// Neutral gray, low saturation, low gradient, brightness in studio range
const isBg = (x, y) => {
  // If outside bounding box of tooth (x < 420 or x > 860 or y < 130):
  if (x < 430 || x > 850 || y < 135) return true;

  const idx = (y * width + x) * 4;
  const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  const lum = (r + g + b) / 3;

  // If pixel has saturation > 5, it is definitely tooth (warm crown or golden root)
  if (maxDiff > 5) return false;

  // On top of the cusps (y between 135 and 200):
  if (y >= 135 && y <= 200) {
    // Tooth cusps have specular reflections (> 248) or strong gradient (> 8)
    if (lum > 246 || grad[y * width + x] > 6) return false;
  }

  // In the roots (y > 360):
  if (y > 360) {
    // Under tooth roots, there is contact shadow where lum < 225
    if (maxDiff > 3) return false;
    // Floor shadow directly under roots (between x=480 and 800, y=615 to 645)
    if (x >= 480 && x <= 800 && y >= 615 && y <= 645 && lum < 220) {
      return false; // Preserve contact shadow
    }
  }

  // Around middle crown walls:
  if (maxDiff > 3) return false;
  if (grad[y * width + x] > 8) return false;

  // Neutral studio background
  return maxDiff <= 3 && lum >= 226;
};

// Flood fill from borders
const visited = new Uint8Array(width * height);
const queue = [];

for (let x = 0; x < width; x++) {
  if (!visited[x]) { queue.push(x, 0); visited[x] = 1; }
  if (!visited[(height - 1) * width + x]) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
}
for (let y = 0; y < height; y++) {
  if (!visited[y * width]) { queue.push(0, y); visited[y * width] = 1; }
  if (!visited[y * width + width - 1]) { queue.push(width - 1, y); visited[y * width + width - 1] = 1; }
}

let head = 0;
while (head < queue.length) {
  const cx = queue[head++];
  const cy = queue[head++];

  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = cx + dx;
    const ny = cy + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nidx = ny * width + nx;
      if (!visited[nidx] && isBg(nx, ny)) {
        visited[nidx] = 1;
        queue.push(nx, ny);
      }
    }
  }
}

console.log(`Visited ${head / 2} background pixels out of ${width * height}`);

// Create output pixels
const outPixels = Buffer.from(pixels);

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const pidx = y * width + x;
    const bidx = pidx * 4;

    if (visited[pidx]) {
      outPixels[bidx + 3] = 0; // Transparent
    } else {
      // Subpixel anti-aliasing along the boundary
      let transparentNeighbors = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && visited[ny * width + nx]) {
          transparentNeighbors++;
        }
      }

      if (transparentNeighbors > 0) {
        // Soft edge feathering
        outPixels[bidx + 3] = Math.max(0, Math.min(255, Math.round(255 - transparentNeighbors * 28)));
      } else {
        outPixels[bidx + 3] = 255;
      }
    }
  }
}

// Find actual non-transparent bounding box:
let tMinX = width, tMaxX = 0, tMinY = height, tMaxY = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    if (outPixels[idx + 3] > 0) {
      if (x < tMinX) tMinX = x;
      if (x > tMaxX) tMaxX = x;
      if (y < tMinY) tMinY = y;
      if (y > tMaxY) tMaxY = y;
    }
  }
}

console.log(`Tooth visible bounds: X [${tMinX}, ${tMaxX}] (${tMaxX - tMinX + 1}px), Y [${tMinY}, ${tMaxY}] (${tMaxY - tMinY + 1}px)`);

// Save full-frame transparent PNG first
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

const fullPng = encodePNG(outPixels, width, height);
fs.writeFileSync('scratch/segmented_full.png', fullPng);
console.log('Saved scratch/segmented_full.png, size:', fullPng.length);
