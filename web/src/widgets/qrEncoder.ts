/**
 * Pure TypeScript ISO/IEC 18004 QR Code Generator (Byte Mode, ECC Level L, Versions 1–4).
 * Zero external dependencies — encodes URLs up to 78 UTF-8 bytes into a crisp boolean matrix
 * so GitHub README SVGs can embed genuinely scannable vector QR codes via <path>.
 */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array<number>(poly.length + 1).fill(0);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= poly[j];
      next[j + 1] ^= gfMul(poly[j], factor);
    }
    poly = next;
  }
  return poly;
}

function rsRemainder(data: number[], ecLen: number): number[] {
  const gen = rsGeneratorPoly(ecLen);
  const rem = new Array<number>(ecLen).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem[0];
    rem.shift();
    rem.push(0);
    if (factor !== 0) {
      for (let i = 0; i < ecLen; i++) {
        rem[i] ^= gfMul(gen[i + 1], factor);
      }
    }
  }
  return rem;
}

interface QrVersionSpec {
  version: number;
  size: number;
  dataCodewords: number;
  ecCodewords: number;
  maxBytes: number;
  alignCenter: number | null;
}

// Single-block ECC-L specs (ISO/IEC 18004 Table 9)
const VERSION_SPECS: QrVersionSpec[] = [
  { version: 1, size: 21, dataCodewords: 19, ecCodewords: 7, maxBytes: 17, alignCenter: null },
  { version: 2, size: 25, dataCodewords: 34, ecCodewords: 10, maxBytes: 32, alignCenter: 18 },
  { version: 3, size: 29, dataCodewords: 55, ecCodewords: 15, maxBytes: 53, alignCenter: 22 },
  { version: 4, size: 33, dataCodewords: 80, ecCodewords: 20, maxBytes: 78, alignCenter: 26 },
];

function computeFormatBits(mask: number): number {
  // ECC-L indicator is 01 (2 bits), mask is 3 bits
  const data = (0b01 << 3) | (mask & 0b111);
  let rem = data << 10;
  const poly = 0x537;
  for (let bit = 14; bit >= 10; bit--) {
    if ((rem >> bit) & 1) {
      rem ^= poly << (bit - 10);
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function maskBit(mask: number, r: number, c: number): boolean {
  switch (mask) {
    case 0:
      return (r + c) % 2 === 0;
    case 1:
      return r % 2 === 0;
    case 2:
      return c % 3 === 0;
    case 3:
      return (r + c) % 3 === 0;
    case 4:
      return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
    case 5:
      return ((r * c) % 2) + ((r * c) % 3) === 0;
    case 6:
      return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
    default:
      return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
  }
}

function evaluatePenalty(mat: boolean[][]): number {
  const n = mat.length;
  let score = 0;
  // Horizontal & vertical runs
  for (let r = 0; r < n; r++) {
    let runH = 1;
    let runV = 1;
    for (let c = 1; c < n; c++) {
      if (mat[r][c] === mat[r][c - 1]) runH++;
      else {
        if (runH >= 5) score += 3 + (runH - 5);
        runH = 1;
      }
      if (mat[c][r] === mat[c - 1][r]) runV++;
      else {
        if (runV >= 5) score += 3 + (runV - 5);
        runV = 1;
      }
    }
    if (runH >= 5) score += 3 + (runH - 5);
    if (runV >= 5) score += 3 + (runV - 5);
  }
  // 2x2 blocks
  for (let r = 0; r < n - 1; r++) {
    for (let c = 0; c < n - 1; c++) {
      const v = mat[r][c];
      if (v === mat[r][c + 1] && v === mat[r + 1][c] && v === mat[r + 1][c + 1]) {
        score += 3;
      }
    }
  }
  return score;
}

export function encodeQrMatrix(rawText: string): boolean[][] {
  const clean = (rawText || "https://gitskins.blessc.com").trim();
  const encoder = new TextEncoder();
  let bytes = Array.from(encoder.encode(clean));
  if (bytes.length > 78) {
    bytes = bytes.slice(0, 78);
  }
  const spec =
    VERSION_SPECS.find((s) => bytes.length <= s.maxBytes) ??
    VERSION_SPECS[VERSION_SPECS.length - 1];

  // Build bit buffer: 4-bit Byte mode (0100) + 8-bit length + payload + terminator
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1);
  };
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  for (const b of bytes) pushBits(b, 8);

  const maxDataBits = spec.dataCodewords * 8;
  const term = Math.min(4, maxDataBits - bits.length);
  for (let i = 0; i < term; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const dataCw: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let k = 0; k < 8; k++) byte = (byte << 1) | bits[i + k];
    dataCw.push(byte);
  }
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (dataCw.length < spec.dataCodewords) {
    dataCw.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  const ecCw = rsRemainder(dataCw, spec.ecCodewords);
  const allCodewords = [...dataCw, ...ecCw];
  const allBits: number[] = [];
  for (const cw of allCodewords) {
    for (let i = 7; i >= 0; i--) allBits.push((cw >> i) & 1);
  }

  const n = spec.size;
  const base: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
  const isFunc: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));

  const setFunc = (r: number, c: number, dark: boolean) => {
    if (r >= 0 && r < n && c >= 0 && c < n) {
      base[r][c] = dark;
      isFunc[r][c] = true;
    }
  };

  // Finder patterns + 1-module white separator
  const drawFinder = (tr: number, tc: number) => {
    for (let dr = -1; dr <= 7; dr++) {
      for (let dc = -1; dc <= 7; dc++) {
        const r = tr + dr;
        const c = tc + dc;
        if (r < 0 || r >= n || c < 0 || c >= n) continue;
        const inOuter = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
        const onRing = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const inCore = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        setFunc(r, c, inOuter && (onRing || inCore));
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, n - 7);
  drawFinder(n - 7, 0);

  // Timing patterns
  for (let i = 8; i < n - 8; i++) {
    setFunc(6, i, i % 2 === 0);
    setFunc(i, 6, i % 2 === 0);
  }

  // Alignment pattern (Versions 2–4)
  if (spec.alignCenter !== null) {
    const ac = spec.alignCenter;
    for (let dr = -2; dr <= 2; dr++) {
      for (let dc = -2; dc <= 2; dc++) {
        const dist = Math.max(Math.abs(dr), Math.abs(dc));
        setFunc(ac + dr, ac + dc, dist === 2 || dist === 0);
      }
    }
  }

  // Dark module
  setFunc(n - 8, 8, true);

  // Reserve format info cells
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      isFunc[8][i] = true;
      isFunc[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunc[8][n - 1 - i] = true;
  }
  for (let i = 0; i < 7; i++) {
    isFunc[n - 1 - i][8] = true;
  }

  // Place data bits in standard zigzag order
  let bitIdx = 0;
  let upward = true;
  for (let col = n - 1; col >= 1; col -= 2) {
    if (col === 6) col--;
    for (let step = 0; step < n; step++) {
      const r = upward ? n - 1 - step : step;
      for (let dc = 0; dc < 2; dc++) {
        const c = col - dc;
        if (!isFunc[r][c]) {
          base[r][c] = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
        }
      }
    }
    upward = !upward;
  }

  // Try all 8 masks and keep lowest penalty
  let bestMat = base;
  let bestScore = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const candidate = base.map((row) => [...row]);
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (!isFunc[r][c] && maskBit(mask, r, c)) {
          candidate[r][c] = !candidate[r][c];
        }
      }
    }
    // Write 15-bit format info (MSB bit 14 -> LSB bit 0)
    const fmt = computeFormatBits(mask);
    const fmtBit = (i: number) => ((fmt >> i) & 1) === 1;
    // Strip 1 around top-left finder
    const coordsA: [number, number][] = [
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
      [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
    ];
    // Strip 2 split across bottom-left & top-right
    const coordsB: [number, number][] = [
      [n - 1, 8], [n - 2, 8], [n - 3, 8], [n - 4, 8], [n - 5, 8], [n - 6, 8], [n - 7, 8],
      [8, n - 8], [8, n - 7], [8, n - 6], [8, n - 5], [8, n - 4], [8, n - 3], [8, n - 2], [8, n - 1],
    ];
    for (let i = 0; i < 15; i++) {
      const dark = fmtBit(14 - i);
      const [ra, ca] = coordsA[i];
      const [rb, cb] = coordsB[i];
      candidate[ra][ca] = dark;
      candidate[rb][cb] = dark;
    }

    const score = evaluatePenalty(candidate);
    if (score < bestScore) {
      bestScore = score;
      bestMat = candidate;
    }
  }

  return bestMat;
}

export function qrMatrixToSvgPath(
  mat: boolean[][],
  ox: number,
  oy: number,
  moduleSize: number
): string {
  const n = mat.length;
  const segs: string[] = [];
  const s = Number(moduleSize.toFixed(2));
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (mat[r][c]) {
        const start = c;
        while (c < n && mat[r][c]) c++;
        const x = Number((ox + start * moduleSize).toFixed(2));
        const y = Number((oy + r * moduleSize).toFixed(2));
        const w = Number(((c - start) * moduleSize).toFixed(2));
        segs.push(`M${x} ${y}h${w}v${s}h-${w}z`);
      } else {
        c++;
      }
    }
  }
  return segs.join("");
}
