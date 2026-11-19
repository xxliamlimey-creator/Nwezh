import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, combined, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0;
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function distToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const lenSq = vx * vx + vy * vy;
  const t = lenSq === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / lenSq));
  const cx = ax + t * vx;
  const cy = ay + t * vy;
  return Math.hypot(px - cx, py - cy);
}

function distToTopSemicircle(px, py, cx, cy, r) {
  if (py <= cy) {
    return Math.abs(Math.hypot(px - cx, py - cy) - r);
  }
  const dLeft = Math.hypot(px - (cx - r), py - cy);
  const dRight = Math.hypot(px - (cx + r), py - cy);
  return Math.min(dLeft, dRight);
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mixColor(bg, fg, alpha) {
  return [
    Math.round(bg[0] * (1 - alpha) + fg[0] * alpha),
    Math.round(bg[1] * (1 - alpha) + fg[1] * alpha),
    Math.round(bg[2] * (1 - alpha) + fg[2] * alpha),
    255,
  ];
}

function renderNwezhIcon(size, maskable = false) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = [0x18, 0x22, 0x1e];
  const ivory = [0xfa, 0xf9, 0xf6];
  const sage = [0x9e, 0xc2, 0xb2];

  const scale = maskable ? 0.78 : 1.0;
  const cx = 0.5;
  const baseY = 0.5 + 0.219 * scale;

  // Outer ivory arch
  const outerCy = 0.5 - 0.039 * scale;
  const outerR = 0.195 * scale;
  const outerHalf = 0.0254 * scale;

  // Inner sage arch
  const innerCy = 0.5 - 0.008 * scale;
  const innerR = 0.094 * scale;
  const innerHalf = 0.0215 * scale;

  // Horizon threshold line
  const baseHalfW = 0.25 * scale;

  const aa = 1.25 / size;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) / size;
      const py = (y + 0.5) / size;

      const dInnerArc = distToTopSemicircle(px, py, cx, innerCy, innerR);
      const dInnerL = distToSegment(px, py, cx - innerR, innerCy, cx - innerR, baseY);
      const dInnerR = distToSegment(px, py, cx + innerR, innerCy, cx + innerR, baseY);
      const dSage = Math.min(dInnerArc, dInnerL, dInnerR) - innerHalf;

      const dOuterArc = distToTopSemicircle(px, py, cx, outerCy, outerR);
      const dOuterL = distToSegment(px, py, cx - outerR, outerCy, cx - outerR, baseY);
      const dOuterR = distToSegment(px, py, cx + outerR, outerCy, cx + outerR, baseY);
      const dBase = distToSegment(px, py, cx - baseHalfW, baseY, cx + baseHalfW, baseY);
      const dIvory = Math.min(dOuterArc, dOuterL, dOuterR, dBase) - outerHalf;

      const sageAlpha = 1 - smoothstep(-aa, aa, dSage);
      const ivoryAlpha = 1 - smoothstep(-aa, aa, dIvory);

      let col = [...bg, 255];
      if (sageAlpha > 0) {
        col = mixColor(col, sage, sageAlpha);
      }
      if (ivoryAlpha > 0) {
        col = mixColor(col, ivory, ivoryAlpha);
      }

      const idx = (y * size + x) * 4;
      rgba[idx] = col[0];
      rgba[idx + 1] = col[1];
      rgba[idx + 2] = col[2];
      rgba[idx + 3] = 255;
    }
  }

  return encodePNG(size, size, rgba);
}

const outDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'favicon-32x32.png'), renderNwezhIcon(32, false));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), renderNwezhIcon(180, false));
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), renderNwezhIcon(192, false));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), renderNwezhIcon(512, false));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), renderNwezhIcon(512, true));

console.log('Regenerated refined PNG icons in public/.');
