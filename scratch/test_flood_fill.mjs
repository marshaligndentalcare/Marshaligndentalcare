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

// Flood fill from border
// State: 0 = unvisited, 1 = background, 2 = tooth, 3 = shadow
const state = new Uint8Array(width * height);
const queue = [];

function isBgPixel(x, y) {
  const i = (y * width + x) * 4;
  const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  const lum = (r + g + b) / 3;

  // Contact shadow area under roots
  if (y >= 615 && y <= 665 && x >= 510 && x <= 770) {
    if (lum < 228) return false; // Shadow, don't flood fill as pure background
  }

  // Any neutral pixel with lum > 230
  if (maxDiff <= 2 && lum >= 230) return true;
  // If lum is very bright (studio high-key background)
  if (lum >= 244 && maxDiff <= 3) return true;
  
  return false;
}

// Push border pixels
for (let x = 0; x < width; x++) {
  if (isBgPixel(x, 0)) { state[x] = 1; queue.push(x); }
  if (isBgPixel(x, height - 1)) { state[(height - 1) * width + x] = 1; queue.push((height - 1) * width + x); }
}
for (let y = 0; y < height; y++) {
  if (isBgPixel(0, y)) { state[y * width] = 1; queue.push(y * width); }
  if (isBgPixel(width - 1, y)) { state[y * width + (width - 1)] = 1; queue.push(y * width + (width - 1)); }
}

let head = 0;
while (head < queue.length) {
  const cur = queue[head++];
  const cx = cur % width;
  const cy = Math.floor(cur / width);

  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = cx + dx, ny = cy + dy;
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nidx = ny * width + nx;
      if (state[nidx] === 0 && isBgPixel(nx, ny)) {
        state[nidx] = 1;
        queue.push(nidx);
      }
    }
  }
}

console.log('Background flood filled pixels:', queue.length, 'out of', width * height, `(${(queue.length / (width * height) * 100).toFixed(1)}%)`);

// Check non-background pixels in tooth bounding box
let toothCount = 0;
let minTx = width, maxTx = 0, minTy = height, maxTy = 0;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = y * width + x;
    if (state[idx] === 0) {
      toothCount++;
      if (x < minTx) minTx = x;
      if (x > maxTx) maxTx = x;
      if (y < minTy) minTy = y;
      if (y > maxTy) maxTy = y;
    }
  }
}

console.log(`Tooth bounds: X [${minTx}, ${maxTx}] (width ${maxTx - minTx}), Y [${minTy}, ${maxTy}] (height ${maxTy - minTy}), count ${toothCount}`);
