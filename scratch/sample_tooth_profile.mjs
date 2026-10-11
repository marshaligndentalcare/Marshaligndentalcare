import fs from 'fs';
import zlib from 'zlib';

const srcBuf = fs.readFileSync('scratch/extracted_frame.original.png');

let offset = 8;
let width = 0, height = 0, idats = [];
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

const bpp = 4;
const stride = 1 + width * bpp;
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
    const left = x >= bpp ? pixels[curLinePixels + x - bpp] : 0;
    const up = y > 0 ? pixels[prevLinePixels + x] : 0;
    const upleft = (y > 0 && x >= bpp) ? pixels[prevLinePixels + x - bpp] : 0;

    let val = 0;
    if (filter === 0) val = rawVal;
    else if (filter === 1) val = (rawVal + left) & 0xff;
    else if (filter === 2) val = (rawVal + up) & 0xff;
    else if (filter === 3) val = (rawVal + Math.floor((left + up) / 2)) & 0xff;
    else if (filter === 4) val = (rawVal + paeth(left, up, upleft)) & 0xff;
    pixels[curLinePixels + x] = val;
  }
}

function getPixel(x, y) {
  const idx = (y * width + x) * 4;
  return [pixels[idx], pixels[idx + 1], pixels[idx + 2]];
}

// Tooth has enamel with high saturation/specular or distinct root color
// Let's inspect along Y at X=640 (vertical centerline)
console.log('Vertical scan at X = 640 (center of video):');
for (let y = 100; y < 650; y += 25) {
  console.log(`y=${y}:`, getPixel(640, y));
}

console.log('\nHorizontal scan at Y = 300 (through middle of crown):');
for (let x = 350; x < 950; x += 25) {
  console.log(`x=${x}:`, getPixel(x, 300));
}

console.log('\nHorizontal scan at Y = 500 (through roots):');
for (let x = 400; x < 880; x += 25) {
  console.log(`x=${x}:`, getPixel(x, 500));
}
