import fs from 'fs';
import zlib from 'zlib';

const srcBuf = fs.readFileSync('scratch/extracted_frame.original.png');

let offset = 8;
let width = 0;
let height = 0;
let bitDepth = 0;
let colorType = 0;
let idats = [];

while (offset < srcBuf.length) {
  const len = srcBuf.readUInt32BE(offset);
  const type = srcBuf.toString('ascii', offset + 4, offset + 8);
  if (type === 'IHDR') {
    width = srcBuf.readUInt32BE(offset + 8);
    height = srcBuf.readUInt32BE(offset + 12);
    bitDepth = srcBuf.readUInt8(offset + 16);
    colorType = srcBuf.readUInt8(offset + 17);
  } else if (type === 'IDAT') {
    idats.push(srcBuf.slice(offset + 8, offset + 8 + len));
  }
  offset += 12 + len;
}

const bpp = colorType === 6 ? 4 : 3; // RGBA or RGB
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

  for (let x = 0; x < width; x++) {
    const rawOffset = lineStart + x * bpp;
    const destOffset = curLinePixels + x * 4;
    const prevOffset = prevLinePixels + x * 4;

    for (let c = 0; c < bpp; c++) {
      const rawVal = uncompressed[rawOffset + c];
      const left = x > 0 ? pixels[destOffset - 4 + c] : 0;
      const up = y > 0 ? pixels[prevOffset + c] : 0;
      const upleft = (y > 0 && x > 0) ? pixels[prevOffset - 4 + c] : 0;

      let val = 0;
      if (filter === 0) val = rawVal;
      else if (filter === 1) val = (rawVal + left) & 0xff;
      else if (filter === 2) val = (rawVal + up) & 0xff;
      else if (filter === 3) val = (rawVal + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) val = (rawVal + paeth(left, up, upleft)) & 0xff;
      pixels[destOffset + c] = val;
    }
    if (bpp === 3) {
      pixels[destOffset + 3] = 255;
    }
  }
}

// Corner sample pixels
function getPixel(x, y) {
  const idx = (y * width + x) * 4;
  return [pixels[idx], pixels[idx + 1], pixels[idx + 2], pixels[idx + 3]];
}

console.log('--- IMAGE METADATA ---');
console.log(`Dimensions: ${width} x ${height}`);
console.log(`Aspect Ratio: ${(width / height).toFixed(3)} (${width / 80}:${height / 80})`);
console.log(`Bit Depth: ${bitDepth}`);
console.log(`Color Type: ${colorType} (${colorType === 6 ? 'RGBA' : colorType === 2 ? 'RGB' : 'Other'})`);
console.log(`File Size: ${(srcBuf.length / 1024).toFixed(1)} KB`);

console.log('\n--- BACKGROUND SAMPLES ---');
console.log('Top-Left (0,0):', getPixel(0, 0));
console.log('Top-Right (w-1,0):', getPixel(width - 1, 0));
console.log('Bottom-Left (0,h-1):', getPixel(0, height - 1));
console.log('Bottom-Right (w-1,h-1):', getPixel(width - 1, height - 1));
console.log('Mid-Left (0, h/2):', getPixel(0, Math.floor(height / 2)));
console.log('Mid-Right (w-1, h/2):', getPixel(width - 1, Math.floor(height / 2)));

// Determine bounding box of tooth
// Background is a neutral studio gradient: R, G, B are within ±4 of each other, values around 230-244
let minX = width, maxX = 0, minY = height, maxY = 0;
let toothPixelCount = 0;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = (y * width + x) * 4;
    const r = pixels[idx];
    const g = pixels[idx + 1];
    const b = pixels[idx + 2];
    
    // Background is neutral gray with near-zero saturation: |r-g| <= 5, |g-b| <= 5, |r-b| <= 5
    // and luminance between 225 and 246
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    const isNeutralBg = maxDiff <= 5 && r >= 225 && r <= 245 && g >= 225 && g <= 245 && b >= 225 && b <= 245;

    if (!isNeutralBg) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      toothPixelCount++;
    }
  }
}

console.log('\n--- TOOTH BOUNDING BOX ---');
console.log(`X range: [${minX}, ${maxX}] -> Width: ${maxX - minX + 1} px`);
console.log(`Y range: [${minY}, ${maxY}] -> Height: ${maxY - minY + 1} px`);
console.log(`Center X: ${((minX + maxX) / 2).toFixed(1)} px, Center Y: ${((minY + maxY) / 2).toFixed(1)} px`);
console.log(`Tooth Area: ${(toothPixelCount / (width * height) * 100).toFixed(1)}% of total image`);
console.log(`Empty/Background Area: ${(100 - toothPixelCount / (width * height) * 100).toFixed(1)}% of total image`);
