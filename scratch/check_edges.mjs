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
  const p = a - b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
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

const pts = [
  [450, 200], [465, 200], [470, 200], [475, 200], [520, 200], // left crown edge
  [800, 200], [808, 200], [814, 200], [820, 200], [830, 200], // right crown edge
  [400, 100], [640, 100], [900, 100],                         // top background
  [580, 500], [640, 500], [700, 500],                         // between roots / roots
  [640, 625], [640, 640], [640, 670]                          // shadow & floor
];
console.log('Sample points:');
for (const [x, y] of pts) {
  const i = (y * width + x) * 4;
  console.log(`(${x}, ${y}): R=${pixels[i]} G=${pixels[i+1]} B=${pixels[i+2]} delta=${Math.max(Math.abs(pixels[i]-pixels[i+1]), Math.abs(pixels[i+1]-pixels[i+2]))}`);
}
