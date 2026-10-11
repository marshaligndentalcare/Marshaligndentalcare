const fs = require('fs');
const zlib = require('zlib');

const srcBuf = fs.readFileSync('C:/Users/New/.gemini/antigravity-ide/brain/bf21b380-35d7-4662-841c-339c5c3c2cb4/.user_uploaded/media_1791615341404.png');

let offset = 8;
let width = 0;
let height = 0;
let idats = [];

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

// Reconstruct raw scanlines
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

// Flood fill from corners and border where color is strictly background (>= 254)
const visited = new Uint8Array(width * height);
const queue = [];

function isPureBg(x, y) {
  const idx = (y * width + x) * 4;
  return pixels[idx] >= 254 && pixels[idx + 1] >= 254 && pixels[idx + 2] >= 254;
}

// Add top corners and bottom edges
for (let x = 0; x < width; x++) {
  if (isPureBg(x, 0) && !visited[x]) { queue.push(x, 0); visited[x] = 1; }
  if (isPureBg(x, height - 1) && !visited[(height - 1) * width + x]) { queue.push(x, height - 1); visited[(height - 1) * width + x] = 1; }
}
for (let y = 0; y < height; y++) {
  if (isPureBg(0, y) && !visited[y * width]) { queue.push(0, y); visited[y * width] = 1; }
  if (isPureBg(width - 1, y) && !visited[y * width + width - 1]) { queue.push(width - 1, y); visited[y * width + width - 1] = 1; }
}

let head = 0;
while (head < queue.length) {
  const x = queue[head++];
  const y = queue[head++];

  const neighbors = [
    [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
  ];

  for (const [nx, ny] of neighbors) {
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      const nidx = ny * width + nx;
      if (!visited[nidx] && isPureBg(nx, ny)) {
        visited[nidx] = 1;
        queue.push(nx, ny);
      }
    }
  }
}

// Set alpha = 0 for all background pixels
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const pidx = y * width + x;
    const bidx = pidx * 4;
    if (visited[pidx]) {
      pixels[bidx + 3] = 0;
    } else {
      // Soft antialiasing for border edge pixels
      let hasTransparentNeighbor = false;
      for (const [dx, dy] of [[1,0], [-1,0], [0,1], [0,-1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && visited[ny * width + nx]) {
          hasTransparentNeighbor = true;
          break;
        }
      }
      if (hasTransparentNeighbor) {
        const avg = (pixels[bidx] + pixels[bidx + 1] + pixels[bidx + 2]) / 3;
        if (avg >= 252) {
          pixels[bidx + 3] = 120;
        } else if (avg >= 248) {
          pixels[bidx + 3] = 200;
        }
      }
    }
  }
}

// Re-encode PNG
const newUncompressed = Buffer.alloc(stride * height);
for (let y = 0; y < height; y++) {
  newUncompressed[y * stride] = 0;
  pixels.copy(newUncompressed, y * stride + 1, y * width * 4, (y + 1) * width * 4);
}

const newIdatData = zlib.deflateSync(newUncompressed, { level: 9 });

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
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8;
ihdrData[9] = 6;
ihdrData[10] = 0;
ihdrData[11] = 0;
ihdrData[12] = 0;

const finalPng = Buffer.concat([
  signature,
  makeChunk('IHDR', ihdrData),
  makeChunk('IDAT', newIdatData),
  makeChunk('IEND', Buffer.alloc(0))
]);

fs.writeFileSync('public/tooth.png', finalPng);
console.log('Successfully re-generated clean tooth.png, size:', finalPng.length);
