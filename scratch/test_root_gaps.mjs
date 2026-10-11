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

for (let y = 480; y <= 600; y += 20) {
  let inGap = false, gapStart = -1;
  let gaps = [];
  for (let x = 500; x <= 770; x++) {
    const i = (y * width + x) * 4;
    const r = pixels[i], g = pixels[i+1], b = pixels[i+2];
    const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
    const lum = (r+g+b)/3;
    // A gap pixel is neutral studio background: diff <= 2 and lum >= 242
    const isBgGap = (diff <= 2 && lum >= 242);
    if (isBgGap && !inGap) {
      inGap = true;
      gapStart = x;
    } else if (!isBgGap && inGap) {
      inGap = false;
      gaps.push(`Gap [${gapStart} - ${x - 1}] (width ${x - gapStart})`);
    }
  }
  if (inGap) gaps.push(`Gap [${gapStart} - 770]`);
  console.log(`y=${y}: ${gaps.length > 0 ? gaps.join(', ') : 'No gaps (solid bridge)'}`);
}
