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

// Find lowest point of root tips and contact shadow
let bottomY = -1;
for (let y = 700; y >= 550; y--) {
  let isToothOrShadow = false;
  for (let x = 450; x < 850; x++) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    // Root has warm color (maxDiff >= 6) or shadow is darker (lum < 225)
    const lum = (r + g + b) / 3;
    if (maxDiff >= 5 || lum < 228) {
      isToothOrShadow = true;
      break;
    }
  }
  if (isToothOrShadow && bottomY === -1) {
    bottomY = y;
  }
}

console.log('Estimated bottom of root/shadow Y:', bottomY);

// Leftmost and Rightmost X of tooth:
let leftmostX = width, rightmostX = 0;
for (let y = 140; y <= bottomY; y++) {
  for (let x = 400; x < 900; x++) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    const lum = (r + g + b) / 3;
    // Tooth crown has warm pearl (r-b >= 4) or shadow (lum < 228) or specular reflection (lum > 248)
    if (maxDiff >= 4 || lum < 228) {
      if (x < leftmostX) leftmostX = x;
      if (x > rightmostX) rightmostX = x;
    }
  }
}
console.log(`Leftmost X: ${leftmostX}, Rightmost X: ${rightmostX}`);
console.log(`Tooth width: ${rightmostX - leftmostX + 1} px`);
console.log(`Tooth height: ${bottomY - 143 + 1} px`);
