import * as THREE from 'three';

// Robot palette (visual choices: the documents do not specify colours).
// Kept separate from the application UI palette (see ui.css).
const real = {
  black:      () => new THREE.MeshPhysicalMaterial({ color: 0x1b1c1f, roughness: 0.48, clearcoat: 0.35, clearcoatRoughness: 0.5 }),
  blackMatte: () => new THREE.MeshStandardMaterial({ color: 0x232428, roughness: 0.8 }),
  carbon:     () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
  white:      () => new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.5 }),
  tyre:       () => new THREE.MeshPhysicalMaterial({ color: 0xc97565, roughness: 0.55, sheen: 0.4, sheenColor: 0xffc2b8, transmission: 0.08, thickness: 4 }),
  rim:        () => new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.4 }),
  podRed:     () => new THREE.MeshPhysicalMaterial({ color: 0xd32f2f, roughness: 0.5, clearcoat: 0.2 }),
  bumper:     () => new THREE.MeshStandardMaterial({ color: 0x2f6fd0, roughness: 0.65 }),
  alu:        () => new THREE.MeshStandardMaterial({ color: 0xa9afb6, roughness: 0.42, metalness: 0.6 }),
  steel:      () => new THREE.MeshStandardMaterial({ color: 0xb0b4b8, roughness: 0.3, metalness: 0.9 }),
  brass:      () => new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.3, metalness: 0.9 }),
  forkSteel:  () => new THREE.MeshStandardMaterial({ color: 0x8c8a80, roughness: 0.38, metalness: 0.8 }),
  blackPlast: () => new THREE.MeshStandardMaterial({ color: 0x232527, roughness: 0.6 }),
  motor:      () => new THREE.MeshStandardMaterial({ color: 0x8f969d, roughness: 0.3, metalness: 0.85 }),
  gearbox:    () => new THREE.MeshStandardMaterial({ color: 0x3a3d41, roughness: 0.5, metalness: 0.3 }),
  belt:       () => new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.85 }),
  battery:    () => new THREE.MeshStandardMaterial({ color: 0x1f4e8c, roughness: 0.5 }),
  strap:      () => new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.95 }),
  pcb:        () => new THREE.MeshStandardMaterial({ color: 0x1e6b3c, roughness: 0.55 }),
  pcbBlue:    () => new THREE.MeshStandardMaterial({ color: 0x23395d, roughness: 0.55 }),
  cap:        () => new THREE.MeshStandardMaterial({ color: 0x2b2b6b, roughness: 0.4, metalness: 0.2 }),
  copper:     () => new THREE.MeshStandardMaterial({ color: 0xb87333, roughness: 0.35, metalness: 0.9 }),
  connector:  () => new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.45 }),
  wireRed:    () => new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.5 }),
  wireBlack:  () => new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }),
  wireSig:    () => new THREE.MeshStandardMaterial({ color: 0xd9a400, roughness: 0.5 }),
  safetyRed:  () => new THREE.MeshStandardMaterial({ color: 0xd0352b, roughness: 0.35 }),
  led:        () => new THREE.MeshStandardMaterial({ color: 0x32d74b, emissive: 0x1a8f2a, emissiveIntensity: 0.8 }),
  reserved:   () => new THREE.MeshBasicMaterial({ color: 0xc0392b, transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide }),
  screw:      () => new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.35, metalness: 0.8 }),
  bumperDark: () => new THREE.MeshStandardMaterial({ color: 0x1f4f9a, roughness: 0.7 }),
  silicone:   () => new THREE.MeshPhysicalMaterial({ color: 0xf48fb1, roughness: 0.35, transmission: 0.25, thickness: 3, transparent: true, opacity: 0.92 }),
  pulley:     () => new THREE.MeshStandardMaterial({ color: 0xd63a2a, roughness: 0.5 }),
  screwSilver:() => new THREE.MeshStandardMaterial({ color: 0xd9dcdf, roughness: 0.25, metalness: 0.9 }),
  rotor:      () => new THREE.MeshStandardMaterial({ color: 0xb4b9bd, roughness: 0.55, metalness: 0.85 }),
  rotorDark:  () => new THREE.MeshStandardMaterial({ color: 0x4f555b, roughness: 0.5, metalness: 0.75 }),
  liftPlate:  () => new THREE.MeshStandardMaterial({ color: 0xaeb6bf, roughness: 0.5, metalness: 0.5 }),
  actuator:   () => new THREE.MeshStandardMaterial({ color: 0x6b7178, roughness: 0.5, metalness: 0.3 }),
};

// Sub-assembly palette — identical to the 2D plans (plans/BRIEF_codex0.md).
export const SUB_COLORS = {
  '01': 0xcfd5dc, '02': 0xe9a197, '03': 0x8c939b, '04': 0x9fb8d6, '05': 0xb9c7b0, '06': 0xb9c7b0,
  '07': 0xe57373, '08': 0xc0392b, '09': 0xd0352b, '10': 0xaeb6bf, '11': 0x4b5563, '12': 0xa7adb4, 'P3': 0x8e99a6, 'W': 0x8e99a6,
};

const cache = {};
export function mat(key) {
  if (!cache[key]) cache[key] = real[key]();
  return cache[key];
}

const subCache = {};
export function subMat(rep, ref) {
  const k = rep + (ref.transparent ? 't' : '');
  if (!subCache[k]) {
    const m = new THREE.MeshStandardMaterial({ color: SUB_COLORS[rep] ?? 0xcccccc, roughness: 0.7, metalness: 0 });
    if (ref.transparent) { m.transparent = true; m.opacity = rep === '08' ? 0.18 : 0.3; m.depthWrite = false; m.side = THREE.DoubleSide; }
    subCache[k] = m;
  }
  return subCache[k];
}

// Diagonal hatch texture for the reserved volume 08 (same convention as the 2D plans).
export function hatchTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 128, 128);
  g.strokeStyle = 'rgba(192,57,43,0.42)'; g.lineWidth = 3;
  for (let i = -128; i < 256; i += 24) { g.beginPath(); g.moveTo(i, 128); g.lineTo(i + 128, 0); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Text decal (team identity on the side panels, labels on the battery).
export function textTexture(lines, { w = 1024, h = 256, bg = null, fg = '#f4efe6', font = '700 120px Inter, "DejaVu Sans", Arial, sans-serif', sub = '600 44px Inter, "DejaVu Sans", Arial, sans-serif' } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = fg; g.textBaseline = 'middle';
  g.font = font; g.fillText(lines[0], 24, lines[1] ? h * 0.38 : h / 2);
  if (lines[1]) { g.font = sub; g.globalAlpha = 0.85; g.fillText(lines[1], 28, h * 0.8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// Procedural carbon-weave texture for the top plate, with the robot and team names.
export function carbonTexture(name, team) {
  const W = 1024, H = 868, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#16171a'; g.fillRect(0, 0, W, H);
  const s = 16;
  for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
    const odd = ((x / s) + (y / s)) % 2 === 0;
    const grd = odd ? g.createLinearGradient(x, y, x + s, y) : g.createLinearGradient(x, y, x, y + s);
    grd.addColorStop(0, '#1d1f23'); grd.addColorStop(0.5, '#2d3036'); grd.addColorStop(1, '#1b1c20');
    g.fillStyle = grd; g.fillRect(x, y, s, s);
  }
  g.save(); g.translate(W * 0.56, H / 2);
  g.fillStyle = '#e53935'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'italic 800 170px "Brush Script MT", "URW Chancery L", "Z003", "DejaVu Serif", cursive';
  g.fillText(name, 0, -30);
  g.font = '700 44px Inter, "DejaVu Sans", Arial, sans-serif'; g.fillStyle = '#f2f2ee'; g.globalAlpha = 0.55;
  g.fillText(team, 0, 110);
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
