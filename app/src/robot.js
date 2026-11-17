// Builds the visual model from config/geometry.json.
// Everything is authored in robot coordinates (mm): X forward, Y left, Z up,
// origin on the ground, in the symmetry plane, at the back of the rear bumper.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { mat, hatchTexture, textTexture, carbonTexture } from './materials.js';

const EDGE_MAT = new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 });

const mid = (r) => (r[0] + r[1]) / 2;
const len = (r) => r[1] - r[0];
const sym = (abs, s) => (s > 0 ? [abs[0], abs[1]] : [-abs[1], -abs[0]]);

function mesh(geo, material, rep, opts = {}) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = opts.cast ?? true;
  m.receiveShadow = opts.receive ?? true;
  m.userData.rep = rep;
  m.userData.realMat = material;
  if (opts.transparent) m.userData.transparent = true;
  if (opts.edges) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 30), opts.edgeMat || EDGE_MAT);
    e.raycast = () => {};
    m.add(e);
  }
  return m;
}

function box(x, y, z, material, rep, opts = {}) {
  const r = opts.radius ?? 0;
  const geo = r > 0 ? new RoundedBoxGeometry(len(x), len(y), len(z), opts.seg ?? 3, r) : new THREE.BoxGeometry(len(x), len(y), len(z));
  const m = mesh(geo, material, rep, opts);
  m.position.set(mid(x), mid(y), mid(z));
  return m;
}

// Cylinder along robot Y between y0 and y1.
function cylY(cx, cz, y0, y1, r, material, rep, opts = {}) {
  const m = mesh(new THREE.CylinderGeometry(r, r, Math.abs(y1 - y0), opts.seg ?? 32, 1, opts.open ?? false), material, rep, opts);
  m.position.set(cx, (y0 + y1) / 2, cz);
  return m;
}
function cylZ(cx, cy, z0, z1, r, material, rep, opts = {}) {
  const g = new THREE.CylinderGeometry(r, r, z1 - z0, opts.seg ?? 24); g.rotateX(Math.PI / 2);
  const m = mesh(g, material, rep, opts); m.position.set(cx, cy, (z0 + z1) / 2); return m;
}

// Polygon in the XZ plane, extruded along Y from y0 to y1 (optional holes).
function prismXZ(points, y0, y1, material, rep, opts = {}) {
  const shape = new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, z)));
  for (const h of opts.holes || []) shape.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, z))));
  const bev = opts.bevel ?? 0.8;
  const d = Math.abs(y1 - y0) - 2 * bev;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bev > 0, bevelSize: bev, bevelThickness: bev, bevelSegments: 2, curveSegments: 16 });
  geo.rotateX(Math.PI / 2);                       // local Z (depth) → robot −Y, local Y → robot Z
  geo.translate(0, Math.max(y0, y1) - bev, 0);
  return mesh(geo, material, rep, opts);
}

function tube(points, r, material, rep) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  return mesh(new THREE.TubeGeometry(curve, 48, r, 8, false), material, rep, { cast: false });
}

// Button-head screw with hex socket. axis: 'x' | 'y' | 'z'; dir: +1 / -1 (outward normal).
const SOCKET_MAT = new THREE.MeshBasicMaterial({ color: 0x0c0c0c });
function screw(axis, x, y, z, dir, r = 2.4, rep = '01', m = 'screw', washer = false) {
  const g = new THREE.Group();
  if (washer) { const w = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.45, r * 1.45, 0.5, 24), mat('screwSilver')); w.position.y = 0.25; w.userData.rep = rep; g.add(w); }
  const head = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.82, r, 1.5, 20), mat(m));
  if (washer) head.position.y = 1.25;
  if (!washer) head.position.y = 0.75; head.castShadow = true; head.userData.rep = rep;
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.42, 0.3, 6), SOCKET_MAT);
  sock.position.y = head.position.y + 0.77; sock.userData.rep = rep;
  g.add(head, sock);
  const up = new THREE.Vector3(axis === 'x' ? dir : 0, axis === 'y' ? dir : 0, axis === 'z' ? dir : 0);
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), up);
  g.position.set(x, y, z);
  return g;
}

function group(name, rep) { const g = new THREE.Group(); g.name = name; g.userData.rep = rep; return g; }

// ---------------------------------------------------------------- wheel (urethane roller)
function buildWheel(G, side) {
  const W = G.roues, R = W.diametre / 2, half = W.largeur / 2, rimR = W.jante_diametre / 2;
  const g = new THREE.Group();
  const pts = [new THREE.Vector2(rimR, -half + 0.5)];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(R - 2.5 + 2.5 * Math.cos(a), -half + 2.5 + 2.5 * Math.sin(a))); }
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * (Math.PI / 2); pts.push(new THREE.Vector2(R - 2.5 + 2.5 * Math.cos(a), half - 2.5 + 2.5 * Math.sin(a))); }
  pts.push(new THREE.Vector2(rimR, half - 0.5));
  g.add(mesh(new THREE.LatheGeometry(pts, 72), mat('tyre'), '02'));
  // White rim with 6 holes on the outer face.
  const shape = new THREE.Shape(); shape.absarc(0, 0, rimR, 0, Math.PI * 2, false);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2, h = new THREE.Path(); h.absarc(Math.cos(a) * 9.5, Math.sin(a) * 9.5, 2.6, 0, Math.PI * 2, true); shape.holes.push(h); }
  const disc = new THREE.ExtrudeGeometry(shape, { depth: 3, bevelEnabled: true, bevelSize: 0.5, bevelThickness: 0.5, bevelSegments: 2, curveSegments: 40 });
  disc.rotateX(-Math.PI / 2);
  const d = mesh(disc, mat('rim'), '02');
  d.position.y = side > 0 ? half - 4 : -(half - 4) - 3;
  g.add(d);
  g.add(cylY(0, 0, -half + 1, half - 1, rimR, mat('rim'), '02', { open: true, seg: 48 }));
  g.add(cylY(0, 0, -half + 1, half - 1, 5, mat('rim'), '02'));
  const nut = cylY(0, 0, 0, 3, 3.6, mat('steel'), '02', { seg: 6 }); nut.position.y = side * (half - 1.5); g.add(nut);
  return g;
}

// ---------------------------------------------------------------- main build
export function buildRobot(G) {
  const root = new THREE.Group();
  const parts = {};
  const reg = (rep, g) => { parts[rep] = g; root.add(g); return g; };
  const C = G.chassis, K = G.capot, F = G.flancs, B = G.pare_chocs, W = G.roues, T = G.transmission;

  // 01 — chassis: floor, inner rails, front bulkhead
  const g01 = reg('01', group('Châssis', '01'));
  g01.add(box(C.plancher.x, C.plancher.y, C.plancher.z, mat('blackMatte'), '01', { edges: true }));
  for (const s of [1, -1]) g01.add(box(C.rails_int.x, sym(C.rails_int.y_abs, s), C.rails_int.z, mat('black'), '01', { edges: true, radius: 0.8 }));
  g01.add(box(C.cloison_av.x, C.cloison_av.y, C.cloison_av.z, mat('black'), '01', { edges: true }));
  // Brass threaded inserts on the rail tops.
  for (const s of [1, -1]) for (const x of [20, 70, 120, 170]) g01.add(cylZ(x, s * mid(C.rails_int.y_abs), C.rails_int.z[1] - 0.2, C.rails_int.z[1] + 0.6, 2.3, mat('brass'), '01', { seg: 12 }));

  g01.add(prismXZ([[163, 41], [164, 44], [186, 35.5], [185, 32.5]], -C.rails_int.y_abs[0], C.rails_int.y_abs[0], mat('black'), '01', { bevel: 0.6, edges: true }));
  for (const yy of [-45, 0, 45]) g01.add(screw('z', 170, yy, 41.9, 1, 2, '01'));

  // 10 — flat top plate (carbon look) with vents and team name
  const g10 = reg('10', group('Capot', '10'));
  g10.add(box(K.x, K.y, K.z, mat('black'), '10', { radius: 1, edges: true }));
  const top = new THREE.Mesh(new THREE.PlaneGeometry(len(K.x) - 2, len(K.y) - 2), new THREE.MeshPhysicalMaterial({ map: carbonTexture(G.meta.nom, G.meta.equipe), roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.25 }));
  top.position.set(mid(K.x), mid(K.y), K.z[1] + 0.12); top.receiveShadow = true; top.userData.rep = '10'; top.userData.decal = true;
  g10.add(top);
  const v = K.ouies;
  for (let i = 0; i < v.n; i++) for (const s of [1, -1]) g10.add(box([v.x0 + i * v.pas, v.x0 + i * v.pas + v.largeur], [s * v.y_abs - v.longueur / 2, s * v.y_abs + v.longueur / 2], [K.z[1] - 0.2, K.z[1] + 0.3], new THREE.MeshBasicMaterial({ color: 0x050505 }), '10', { cast: false }));
  for (let x = K.x[0] + 6; x <= K.x[1] - 5; x += 25.5) for (const s of [1, -1]) g10.add(screw('z', x, s * (len(K.y) / 2 - 5), K.z[1], 1, 2.3, '10'));
  for (const yy of [-35, 0, 35]) for (const x of [K.x[0] + 5, K.x[1] - 5]) g10.add(screw('z', x, yy, K.z[1], 1, 2.3, '10'));
  for (const s of [1, -1]) {
    const tri = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(24, 0), new THREE.Vector2(0, 20)]);
    const tm = new THREE.Mesh(new THREE.ShapeGeometry(tri), new THREE.MeshBasicMaterial({ color: 0x050505 }));
    tm.position.set(K.x[1] - 34, s * 22, K.z[1] + 0.3); if (s < 0) tm.scale.y = -1; tm.userData.rep = '10';
    g10.add(tm);
  }

  // 09 — removable disconnect on the top plate, at the rear, with status LED
  const S = G.sectionnement;
  const g09 = reg('09', group('Coupe-circuit', '09'));
  g09.add(box(S.x, S.y, [S.z[0], S.z[0] + 4], mat('blackPlast'), '09', { radius: 1 }));
  g09.add(box([S.x[0] + 3, S.x[1] - 3], [S.y[0] + 3, S.y[1] - 3], [S.z[0] + 4, S.z[0] + 6], mat('connector'), '09', { radius: 0.8 }));
  const loop = new THREE.Mesh(new THREE.TorusGeometry(5, 1.6, 10, 24, Math.PI), mat('safetyRed'));
  loop.rotation.x = Math.PI / 2; loop.position.set(mid(S.x), mid(S.y), S.z[0] + 6); loop.userData.rep = '09'; loop.castShadow = true;
  g09.add(loop);
  g09.add(cylZ(S.x[1] + 6, 0, S.z[0], S.z[0] + 2.5, 2.2, mat('led'), '09', { seg: 12 }));

  // 02 — wheels, axles, gearmotors, pulleys, belts
  const g02 = reg('02', group('Roues et transmission', '02'));
  const wheels = [];
  const yIn = C.rails_int.y_abs[1], yOut = F.y_abs[0];
  for (const ax of W.axes_x) for (const s of [1, -1]) {
    const pivot = new THREE.Group();
    pivot.position.set(ax, s * W.voie_y, W.axe_z);
    const wg = buildWheel(G, s); pivot.add(wg);
    pivot.userData.explode = new THREE.Vector3(0, s * 45, 0);
    g02.add(pivot); wheels.push(wg);
    g02.add(cylY(ax, W.axe_z, s * yIn, s * yOut, G.flancs.axes_roues.diametre / 2, mat('steel'), '02', { seg: 16 }));
  }
  const M = T.moteurs, P = T.poulies;
  for (const s of [1, -1]) {
    const split = s > 0 ? M.y_abs[1] - 18 : -(M.y_abs[1] - 18);
    g02.add(cylY(M.x, M.z, s * M.y_abs[0], split, M.diametre / 2, mat('motor'), '02'));
    g02.add(cylY(M.x, M.z, split, s * M.y_abs[1], M.diametre / 2, mat('gearbox'), '02'));
    g02.add(cylY(M.x, M.z, s * M.y_abs[0] - s * 3, s * M.y_abs[0], M.diametre / 2 - 3, mat('blackPlast'), '02'));
    g02.add(cylY(M.x, M.z, s * M.y_abs[1], s * P.y_abs[0], 2, mat('steel'), '02', { seg: 12 }));
    const py = sym(P.y_abs, s);
    for (const px of P.x) {
      const z = px === M.x ? M.z : W.axe_z;
      g02.add(cylY(px, z, py[0], py[1], P.diametre / 2, mat('alu'), '02'));
      for (const e of [py[0], py[1]]) g02.add(cylY(px, z, e - 0.5, e + 0.5, P.diametre / 2 + 2, mat('alu'), '02'));
    }
    // Belt: straight runs above and below the pulleys + wraps.
    const r = P.diametre / 2, bz = W.axe_z;
    g02.add(box([P.x[0], P.x[2]], [py[0] + 0.5, py[1] - 0.5], [bz + r, bz + r + 1.8], mat('belt'), '02'));
    g02.add(box([P.x[0], P.x[2]], [py[0] + 0.5, py[1] - 0.5], [bz - r - 1.8, bz - r], mat('belt'), '02'));
    for (const [px, a0] of [[P.x[0], Math.PI], [P.x[2], 0]]) {
      const wrap = new THREE.Mesh(new THREE.CylinderGeometry(r + 1.8, r + 1.8, len(py) - 1, 24, 1, true, a0, Math.PI), mat('belt'));
      wrap.position.set(px, mid(py), bz); wrap.userData.rep = '02'; wrap.material.side = THREE.DoubleSide;
      g02.add(wrap);
    }
  }
  g02.add(box(T.support.x, T.support.y, T.support.z, mat('alu'), '02', { radius: 1.5, edges: true }));

  // 03 — outer side plates (with 3 white stripes) and blue rear bumper
  const g03 = reg('03', group('Flancs et pare-chocs', '03'));
  for (const s of [1, -1]) {
    const fl = new THREE.Group();
    fl.userData.explode = new THREE.Vector3(0, s * 70, 0);
    const y = sym(F.y_abs, s);
    fl.add(prismXZ(F.profil_xz, y[0], y[1], mat('black'), '03', { edges: true }));
    const ys = s > 0 ? y[1] + 0.15 : y[0] - 0.15;
    for (let i = 0; i < F.stries.n; i++) {
      const st = new THREE.Mesh(new THREE.PlaneGeometry(16, 3), mat('white'));
      st.rotation.x = s > 0 ? -Math.PI / 2 : Math.PI / 2; if (s > 0) st.rotation.z = Math.PI;
      st.position.set(F.stries.x0 + i * 2.5, ys, F.stries.z0 + i * F.stries.pas * 0.75);
      const tilt = new THREE.Group(); tilt.position.copy(st.position); st.position.set(0, 0, 0);
      tilt.rotation.y = -0.35;
      tilt.add(st); st.userData.rep = '03'; fl.add(tilt);
    }
    for (const x of W.axes_x) { fl.add(cylY(x, W.axe_z, s * (F.y_abs[1] + 0.8), s * (F.y_abs[1] + 1.4), 3.6, mat('blackPlast'), '03', { seg: 20 })); fl.add(cylY(x, W.axe_z, s * (F.y_abs[1] + 1.4), s * (F.y_abs[1] + 2.4), 4.5, mat('screwSilver'), '03', { seg: 6 })); }
    const zTop = (x) => 46 + (32 - 46) * (x - 6) / (189 - 6);
    for (const x of [16, 70, 150, 180]) fl.add(screw('y', x, s * F.y_abs[1], zTop(x) - 5, s, 2.2, '03'));
    for (const x of [16, 84, 180]) fl.add(screw('y', x, s * F.y_abs[1], 17, s, 2.2, '03'));
    for (const x of W.axes_x) fl.add(cylY(x, W.axe_z, s * F.y_abs[1], s * (F.y_abs[1] + 0.8), 7.5, mat('steel'), '03', { seg: 28 }));
    const Pl = F.platines, py = sym(Pl.y_abs, s);
    const ps = new THREE.Shape([new THREE.Vector2(Pl.x[0], py[0]), new THREE.Vector2(Pl.x[1], py[0]), new THREE.Vector2(Pl.x[1] - 8, py[1]), new THREE.Vector2(Pl.x[0] + 8, py[1])]);
    ps.holes.push(new THREE.Path(Pl.ajour_xy.map(([x, yy]) => new THREE.Vector2(x, s * yy))));
    const pgeo = new THREE.ExtrudeGeometry(ps, { depth: len(Pl.z), bevelEnabled: false }); pgeo.translate(0, 0, Pl.z[0]);
    fl.add(mesh(pgeo, mat('black'), '03', { edges: true }));
    for (const x of [Pl.x[0] + 5, Pl.x[1] - 5]) fl.add(screw('z', x, s * (Pl.y_abs[0] + 3.5), Pl.z[1], 1, 1.8, '03'));
    g03.add(fl);
  }
  const bump = new THREE.Group(); bump.userData.explode = new THREE.Vector3(-55, 0, 0);
  bump.add(box(B.x, B.y, B.z_bleu, mat('bumper'), '03', { radius: 2, edges: true }));
  bump.add(box(B.x, B.y, [B.z_bleu[1], B.z[1]], mat('black'), '03', { radius: 1.5, edges: true }));
  for (const zr of [B.z_bleu[0] + 7]) bump.add(box([B.x[0] - 0.8, B.x[0] + 1], [B.y[0] + 6, B.y[1] - 6], [zr - 1.2, zr + 1.2], mat('bumperDark'), '03', { radius: 0.5 }));
  for (const yy of [B.y[0] + 12, B.y[1] - 12]) bump.add(screw('x', B.x[0] - 0.6, yy, B.z[1] - 9, -1, 2.4, '03', 'screwSilver'));
  g03.add(bump);

  // 04 — battery volume with straps and connector
  const Bt = G.batterie;
  const g04 = reg('04', group('Batterie', '04'));
  g04.add(box(Bt.x, Bt.y, Bt.z, mat('battery'), '04', { radius: 3 }));
  const lab = new THREE.Mesh(new THREE.PlaneGeometry(48, 20), new THREE.MeshStandardMaterial({ map: textTexture(['LiPo 4S', 'capacité à confirmer'], { w: 512, h: 200, bg: '#e9eef5', fg: '#1b2a41', font: '700 88px Inter, "DejaVu Sans", Arial, sans-serif', sub: '600 38px Inter, "DejaVu Sans", Arial, sans-serif' }), roughness: 0.6 }));
  lab.position.set(mid(Bt.x), mid(Bt.y), Bt.z[1] + 0.15); lab.userData.rep = '04';
  g04.add(lab);
  for (const xs of [Bt.x[0] + 12, Bt.x[1] - 12]) g04.add(box([xs - 5, xs + 5], [Bt.y[0] - 1, Bt.y[1] + 1], [Bt.z[0], Bt.z[1] + 0.8], mat('strap'), '04'));

  g04.add(box([Bt.x[0] - 4, Bt.x[0] + 4], [-7, 7], [Bt.z[1] - 10, Bt.z[1] - 3], mat('connector'), '04', { radius: 1 }));

  // 05 — receiver + regulation (left) and protected distribution (right)
  const O = G.commande, Dd = G.distribution;
  const g05 = reg('05', group('Commande et distribution', '05'));
  g05.add(box(O.x, O.y, [O.z[0], O.z[0] + 1.6], mat('pcbBlue'), '05'));
  g05.add(box([O.x[0] + 2, O.x[0] + 26], [O.y[0] + 2, O.y[0] + 20], [O.z[0] + 1.6, O.z[0] + 9], mat('blackPlast'), '05', { radius: 1.5, edges: true }));
  g05.add(box([O.x[0] + 4, O.x[1] - 4], [O.y[1] - 10, O.y[1] - 2], [O.z[0] + 1.6, O.z[0] + 6], mat('blackPlast'), '05', { radius: 1 }));
  for (const k of [0, 1]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 20, 8), mat('blackPlast')); a.position.set(O.x[0] + 8 + k * 10, O.y[0] + 12, O.z[0] + 18); a.rotation.z = k ? 0.6 : -0.6; a.userData.rep = '05'; g05.add(a); }
  g05.add(box(Dd.x, Dd.y, [Dd.z[0], Dd.z[0] + 1.6], mat('pcb'), '05'));
  g05.add(box([Dd.x[0] + 4, Dd.x[0] + 20], [Dd.y[0] + 6, Dd.y[1] - 6], [Dd.z[0] + 1.6, Dd.z[1]], mat('connector'), '05', { radius: 1 }));
  g05.add(cylZ(Dd.x[1] - 7, mid(Dd.y), Dd.z[0] + 1.6, Dd.z[1] - 1, 4, mat('cap'), '05'));

  // 06 — traction controllers
  const Tc = G.controleurs;
  const g06 = reg('06', group('Contrôleurs', '06'));
  for (const s of [1, -1]) {
    const y = sym(Tc.y_abs, s), z0 = Tc.z[0];
    const c = new THREE.Group(); c.userData.explode = new THREE.Vector3(0, s * 10, 55);
    c.add(box(Tc.x, y, [z0, z0 + 1.6], mat('pcb'), '06'));
    const hx = [Tc.x[0] + 6, Tc.x[1] - 10];
    c.add(box(hx, [y[0] + 5, y[1] - 5], [z0 + 1.6, z0 + 4], mat('alu'), '06'));
    for (let i = 0; i < 7; i++) { const fx = hx[0] + 1 + i * ((len(hx) - 2) / 6); c.add(box([fx - 0.7, fx + 0.7], [y[0] + 5, y[1] - 5], [z0 + 4, Tc.z[1]], mat('alu'), '06')); }
    c.add(cylZ(Tc.x[1] - 5, mid(y), z0 + 1.6, Tc.z[1] - 2, 3.4, mat('cap'), '06'));
    g06.add(c);
  }

  // Wiring (functional illustration only).
  const gW = reg('W', group('Câblage (illustration)', 'W'));
  const zc = K.z[0] - 3;
  gW.add(tube([[Bt.x[0] + 3, 8, Bt.z[1] - 4], [Bt.x[0] + 4, 6, zc], [mid(S.x), 4, zc]], 1.3, mat('wireRed'), 'W'));
  gW.add(tube([[Bt.x[0] + 3, -8, Bt.z[1] - 4], [Bt.x[0] + 4, -10, zc], [Dd.x[0] + 10, mid(Dd.y), Dd.z[1] + 2]], 1.3, mat('wireBlack'), 'W'));
  gW.add(tube([[mid(S.x), -4, zc], [Dd.x[0] + 6, mid(Dd.y) + 8, zc - 4], [Dd.x[0] + 12, mid(Dd.y), Dd.z[1] + 1]], 1.3, mat('wireRed'), 'W'));
  for (const s of [1, -1]) {
    const yc = s * mid(Tc.y_abs);
    gW.add(tube([[Dd.x[1] - 2, mid(Dd.y), Dd.z[1]], [Tc.x[0] + 4, s > 0 ? -10 : mid(Dd.y), zc - 2], [Tc.x[0] + 6, yc, Tc.z[1] + 2]], 1.1, mat('wireRed'), 'W'));
    gW.add(tube([[Tc.x[1] - 2, yc, Tc.z[1]], [Tc.x[1] + 3, s * 40, 36], [M.x - 13, s * (M.y_abs[0] + 2), M.z + 6]], 1.0, mat('wireBlack'), 'W'));
  }
  gW.add(tube([[O.x[1], mid(O.y), O.z[0] + 6], [Tc.x[0] - 2, mid(Tc.y_abs), 30], [Tc.x[0] + 3, mid(Tc.y_abs) - 6, Tc.z[1]]], 0.6, mat('wireSig'), 'W'));
  gW.add(tube([[O.x[1] - 2, mid(O.y) - 8, O.z[0] + 6], [mid(Bt.x), 29, 41], [Tc.x[0] + 3, -mid(Tc.y_abs) + 6, Tc.z[1]]], 0.6, mat('wireSig'), 'W'));

  // 11 — triangular uprights carrying the front module
  const A = G.arceaux;
  const g11 = reg('11', group('Arceaux', '11'));
  for (const s of [1, -1]) {
    const y = sym(A.y_abs, s);
    const a = new THREE.Group(); a.userData.explode = new THREE.Vector3(0, s * 30, 40);
    a.add(prismXZ(A.profil_xz, y[0], y[1], mat('black'), '11', { holes: [A.evidement_xz], edges: true, bevel: 1 }));
    a.add(cylY(G.module_avant.axe_x, G.module_avant.axe_z, s * A.y_abs[1], s * (A.y_abs[1] + 5), 7, mat('brass'), '11', { seg: 6 }));
    a.add(cylY(G.module_avant.axe_x, G.module_avant.axe_z, s * A.y_abs[1], s * (A.y_abs[1] + 1.2), 10, mat('brass'), '11', { seg: 28 }));
    for (const [x, z] of [[150, 48], [168, 48], [186, 48], [214, 88]]) a.add(screw('y', x, s * A.y_abs[1], z, s, 2.2, '11'));
    g11.add(a);
  }

  // 07 — red front pods
  const D = G.pods;
  const g07 = reg('07', group('Pods avant', '07'));
  for (const s of [1, -1]) {
    const y = sym(D.y_abs, s), c = D.chanfrein;
    const pg = new THREE.Group(); pg.userData.explode = new THREE.Vector3(45, s * 25, 0);
    const b = 3; // bevel grows the outline: inset the profile so the pod keeps its exact envelope
    pg.add(prismXZ([[D.x[0] + b, D.z[0] + b], [D.x[1] - c, D.z[0] + b], [D.x[1] - b, D.z[0] + c], [D.x[1] - b, D.z[1] - b], [D.x[0] + b, D.z[1] - b]], y[0], y[1], mat('podRed'), '07', { bevel: b, edges: true }));
    const fy = sym(G.fourches.y_abs, s);
    pg.add(box([D.x[1] - 16, D.x[1] + 0.4], [fy[0] - 1.5, fy[1] + 1.5], [D.z[0] + 2, D.z[1] - 6], new THREE.MeshBasicMaterial({ color: 0x120404 }), '07', { cast: false }));
    pg.add(box([D.x[0] + 18, D.x[1] - 12], [fy[0] - 2, fy[1] + 2], [D.z[1] - 3, D.z[1] + 0.6], mat('silicone'), '07', { radius: 1 }));
    for (const x of [D.x[0] + 9, D.x[1] - 14]) pg.add(screw('y', x, s * D.y_abs[1], 26, s, 2.4, '07', 'screwSilver', true));
    pg.add(screw('z', D.x[0] + 8, s * (D.y_abs[0] + 6), D.z[1], 1, 2.2, '07'));
    g07.add(pg);
  }

  // 12 — passive forks (simplified, no barbs)
  const Fk = G.fourches;
  const g12 = reg('12', group('Fourches passives', '12'));
  for (const s of [1, -1]) {
    const y = sym(Fk.y_abs, s);
    const fg = new THREE.Group(); fg.userData.explode = new THREE.Vector3(85, s * 25, 0);
    fg.add(prismXZ(Fk.profil_xz, y[0], y[1], mat('forkSteel'), '12', { bevel: 0.8, edges: true, holes: [[[246, 8], [290, 5.5], [250, 19]]] }));
    g12.add(fg);
  }

  // 08 — front module: reserved swept envelope only
  const V = G.module_avant;
  const g08 = reg('08', group('Module avant (enveloppe)', '08'));
  const hatch = hatchTexture(); hatch.repeat.set(3, 1.2);
  const vMat = new THREE.MeshBasicMaterial({ map: hatch, transparent: true, opacity: 0.38, depthWrite: false, side: THREE.DoubleSide });
  const env = cylY(V.axe_x, V.axe_z, -V.y_abs, V.y_abs, V.rayon, vMat, '08', { cast: false, receive: false, transparent: true, seg: 64 });
  env.renderOrder = 2; g08.add(env);
  g08.add(cylY(V.axe_x, V.axe_z, -V.y_abs, V.y_abs, V.rayon, mat('reserved'), '08', { cast: false, receive: false, transparent: true, seg: 64 }));
  for (const s of [1, -1]) {
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 64 }, (_, i) => { const a = (i / 64) * Math.PI * 2; return new THREE.Vector3(V.axe_x + V.rayon * Math.cos(a), s * V.y_abs, V.axe_z + V.rayon * Math.sin(a)); })), new THREE.LineDashedMaterial({ color: 0xc0392b, dashSize: 4, gapSize: 3 }));
    ring.computeLineDistances(); ring.raycast = () => {}; g08.add(ring);
  }
  const axle = cylY(V.axe_x, V.axe_z, -A.y_abs[1], A.y_abs[1], 4, mat('steel'), '08', { seg: 16 }); axle.userData.axle = true; g08.add(axle);
  // Simplified rotor (visual only): hollow frame turning inside the envelope.
  // No edge geometry, material, mass or speed data — presentation animation only.
  const rotor = new THREE.Group(); rotor.position.set(V.axe_x, 0, V.axe_z); rotor.name = 'Rotor simplifié'; rotor.rotation.y = -Math.PI / 3;
  const rb = V.y_abs - 12, rr = V.rayon;
  for (const s of [1, -1]) {
    rotor.add(box([-7, 7], [-rb, rb], [s * (rr - 16), s * (rr - 4)].sort((a, b) => a - b), mat('rotor'), '08', { radius: 2, edges: true }));
    rotor.add(box([-12, 12], s > 0 ? [rb, rb + 6] : [-rb - 6, -rb], [-(rr - 3), rr - 3], mat('rotorDark'), '08', { radius: 8, seg: 4, edges: true }));
  }
  rotor.add(cylY(0, 0, -rb, rb, 7, mat('brass'), '08', { seg: 24 }));
  rotor.add(cylY(0, 0, rb + 6, V.y_abs - 0.5, 15, mat('pulley'), '08', { seg: 40 }));
  for (const e of [rb + 7, V.y_abs - 1.2]) rotor.add(cylY(0, 0, e - 1, e + 1, 17, mat('pulley'), '08', { seg: 40 }));
  rotor.add(cylY(0, 0, rb + 8.5, V.y_abs - 2.6, 15.6, mat('blackPlast'), '08', { seg: 40 }));
  rotor.add(cylY(0, 0, -V.y_abs + 0.5, -rb - 6, 9, mat('steel'), '08', { seg: 24 }));
  const mark = box([-10, 10], [-rb - 6.4, -rb - 6], [rr - 14, rr - 6], mat('white'), '08', { cast: false });
  rotor.add(mark);
  const blur = cylY(0, 0, -V.y_abs + 0.5, V.y_abs - 0.5, rr - 1.5, new THREE.MeshStandardMaterial({ color: 0x9aa1a8, transparent: true, opacity: 0, depthWrite: false, roughness: 0.4, metalness: 0.5 }), '08', { cast: false, transparent: true, seg: 48 });
  blur.userData.blur = true; blur.userData.decal = true;
  rotor.add(blur);
  rotor.userData.blur = blur;
  g08.add(rotor);
  g08.userData.explode = new THREE.Vector3(60, 0, 35);

  // P3 — slow, non-cutting lifting option (principle only), replaces 08
  const L = G.option_levage, pl = L.palette;
  const gP3 = reg('P3', group('Option levage P3', 'P3'));
  const hinge = new THREE.Group(); hinge.position.set(L.pivot.x, 0, L.pivot.z);
  hinge.add(box([0, pl.longueur], pl.y, [-pl.epaisseur / 2, pl.epaisseur / 2], mat('liftPlate'), 'P3', { radius: pl.rayon_bord, edges: true }));
  hinge.add(cylY(0, 0, -A.y_abs[0], A.y_abs[0], 4, mat('steel'), 'P3'));
  gP3.add(hinge);
  gP3.add(box([L.pivot.x - 22, L.pivot.x - 6], [-18, 18], [C.rails_int.z[1], C.rails_int.z[1] + 16], mat('actuator'), 'P3', { radius: 3, edges: true }));
  gP3.userData.hinge = hinge;
  gP3.userData.explode = new THREE.Vector3(60, 0, 35);
  gP3.visible = false;

  // CG markers: target (cross) and estimate from the mass allocations (sphere).
  const gCG = reg('CG', group('Centres de gravité', 'CG'));
  const tgt = G.cg.cible;
  const cross = new THREE.Group();
  for (const r of [Math.PI / 4, -Math.PI / 4]) { const b = new THREE.Mesh(new THREE.BoxGeometry(22, 2.4, 2.4), new THREE.MeshBasicMaterial({ color: 0x2f56d6, depthTest: false })); b.rotation.y = r; b.renderOrder = 10; cross.add(b); }
  cross.position.set(tgt.x, tgt.y, tgt.z); gCG.add(cross);
  const est = estimateCG(G);
  const sph = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xc0392b, depthTest: false, transparent: true, opacity: 0.9 }));
  sph.position.set(est.x, 0, est.z); sph.renderOrder = 10; gCG.add(sph);
  gCG.visible = false;

  const defaults = { '10': [0, 0, 100], '09': [0, 0, 100], '04': [0, 0, 70], '05': [0, 0, 50] };
  for (const [rep, v2] of Object.entries(defaults)) parts[rep].userData.explode = new THREE.Vector3(...v2);

  return { root, parts, wheels, hinge, rotor, cg: est };
}

export function estimateCG(G) {
  let m = 0, x = 0, z = 0;
  for (const p of G.masse.postes) { m += p.g; x += p.g * p.position[0]; z += p.g * p.position[2]; }
  return { x: x / m, z: z / m, m };
}

// Part descriptions for the info card (derived from geometry.json).
export function partInfo(G) {
  const f = (r) => `${r[0]} → ${r[1]}`;
  const C = G.chassis, W = G.roues, T = G.transmission, F = G.flancs, Bt = G.batterie, O = G.commande, Tc = G.controleurs, D = G.pods, V = G.module_avant, S = G.sectionnement, K = G.capot, A = G.arceaux, Fk = G.fourches;
  const cg = estimateCG(G);
  return {
    '01': { t: '01 · Châssis', s: C.statut, rows: [['Plancher', `${len(C.plancher.x)} × ${len(C.plancher.y)} × ${len(C.plancher.z)}`], ['Rails intérieurs', `X ${f(C.rails_int.x)}, |Y| ${f(C.rails_int.y_abs)}`], ['Hauteur de caisse', `${C.rails_int.z[1]} mm`]], n: `${C.materiau}. ${C.note}` },
    '02': { t: '02 · Roues et transmission', s: W.statut, rows: [['Roues', `Ø${W.diametre} (H) × ${W.largeur}`], ['Empattement / voie', `${W.empattement} / ${W.voie}`], ['Motoréducteurs', `${T.moteurs.nombre} × Ø${T.moteurs.diametre}`], ['Transmission', 'courroie par côté']], n: T.note },
    '03': { t: '03 · Flancs et pare-chocs', s: F.statut, rows: [['Flancs', `X ${f(F.x)}, |Y| ${f(F.y_abs)}`], ['Pare-chocs', `X ${f(G.pare_chocs.x)}`]], n: `${F.materiau}. Pare-chocs : ${G.pare_chocs.materiau}.` },
    '04': { t: '04 · Batterie (volume réservé)', s: Bt.statut, rows: [['Volume', `${len(Bt.x)} × ${len(Bt.y)} × ${len(Bt.z)}`], ['Pack', Bt.hypothese_pack]], n: Bt.note },
    '05': { t: '05 · Commande et distribution', s: O.statut, rows: [['Récepteur + régulation', `X ${f(O.x)}, Y ${f(O.y)}`], ['Distribution', `X ${f(G.distribution.x)}, Y ${f(G.distribution.y)}`]], n: 'Modèles non figés ; protections choisies avec l\'encadrant.' },
    '06': { t: '06 · Contrôleurs G / D', s: Tc.statut, rows: [['Volume (×2)', `${len(Tc.x)} × ${len(Tc.y_abs)} × ${len(Tc.z)}`]], n: 'Une voie réversible par côté.' },
    '07': { t: '07 · Pods avant', s: D.statut, rows: [['X', f(D.x)], ['|Y|', f(D.y_abs)], ['Z', f(D.z)]], n: D.source },
    '08': { t: '08 · Module avant (enveloppe + rotor simplifié)', s: V.statut, rows: [['Enveloppe', `Ø${2 * V.rayon} × ${2 * V.y_abs}`], ['Axe', `X ${V.axe_x}, Z ${V.axe_z}`]], n: `${V.note} Le rotor affiché est une représentation visuelle ; sa vitesse d'animation n'est pas une vitesse réelle.` },
    '09': { t: '09 · Coupe-circuit amovible', s: S.statut, rows: [['X', f(S.x)], ['Z', f(S.z)]], n: 'Accessible sans ouvrir le capot ; voyant de mise sous tension. Organe à valider avec l\'encadrant.' },
    '10': { t: '10 · Capot', s: K.statut, rows: [['Dessus', `Z = ${K.z[1]}`], ['Emprise', `${len(K.x)} × ${len(K.y)}`]], n: `${K.materiau}. ${K.source}` },
    '11': { t: '11 · Arceaux triangulaires', s: A.statut, rows: [['Hauteur', '95 mm'], ['|Y|', f(A.y_abs)]], n: A.note },
    '12': { t: '12 · Fourches passives', s: Fk.statut, rows: [['Pointe', `X = ${Math.max(...Fk.profil_xz.map((p) => p[0]))}`], ['|Y|', f(Fk.y_abs)]], n: Fk.note },
    'W': { t: 'Câblage (illustration)', s: 'P', rows: [], n: 'Tracé illustratif de la chaîne énergie / commande. Ce n\'est pas un schéma de câblage.' },
    'P3': { t: 'Option levage lent non coupante (P3)', s: G.option_levage.statut, rows: [['Palette', `${G.option_levage.palette.longueur} × ${len(G.option_levage.palette.y)} × ${G.option_levage.palette.epaisseur}`]], n: G.option_levage.note },
    'CG': { t: 'Centre de gravité', s: 'E', rows: [['Estimé', `X ${cg.x.toFixed(0)} ; Z ${cg.z.toFixed(0)}`], ['Cible', `X ${G.cg.cible.x} ; Z ${G.cg.cible.z}`]], n: 'Estimation à partir des allocations de masse ; à remplacer par une mesure.' },
  };
}
