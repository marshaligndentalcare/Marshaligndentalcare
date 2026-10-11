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

// For each y from 138 to 630:
// Find left outer edge and right outer edge
for (let y = 138; y <= 630; y += 30) {
  let left = -1, right = -1;
  // Scan from x=450 to 830
  for (let x = 450; x <= 640; x++) {
    const i = (y * width + x) * 4;
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
    const gVal = grad[y * width + x];
    const lum = (r+g+b)/3;
    // Edge of tooth
    if (gVal >= 12 || (diff >= 3 && lum < 240) || (r > b + 3 && lum < 242)) {
      left = x;
      break;
    }
  }

  for (let x = 830; x >= 640; x--) {
    const i = (y * width + x) * 4;
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
    const gVal = grad[y * width + x];
    const lum = (r+g+b)/3;
    if (gVal >= 12 || (diff >= 3 && lum < 240) || (r > b + 3 && lum < 242)) {
      right = x;
      break;
    }
  }

  console.log(`y=${y}: left=${left}, right=${right}, span=${right - left}`);
}
