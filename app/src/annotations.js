// Callout labels (01–12) and overall dimension lines, built from geometry.json.
import * as THREE from 'three';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

function label(html, cls, pos) {
  const el = document.createElement('div');
  el.className = cls;
  el.innerHTML = html;
  const o = new CSS2DObject(el);
  o.position.copy(pos);
  return o;
}

export function buildCallouts(G, onPick) {
  const g = new THREE.Group();
  g.name = 'Repères';
  const C = G.chassis, W = G.roues, F = G.flancs, Bt = G.batterie, O = G.commande, Tc = G.controleurs, D = G.pods, V = G.module_avant, S = G.sectionnement, K = G.capot, Fk = G.fourches;
  const items = [
    ['01', 'Châssis', [C.rails_int.x[0] + 30, -C.rails_int.y_abs[1], C.rails_int.z[1]]],
    ['02', 'Roue + transmission', [W.axes_x[0], -W.voie_y - W.largeur / 2, 4]],
    ['03', 'Flanc', [60, -F.y_abs[1], 38]],
    ['04', 'Batterie', [(Bt.x[0] + Bt.x[1]) / 2, 0, Bt.z[1]]],
    ['05', 'Commande', [(O.x[0] + O.x[1]) / 2, (O.y[0] + O.y[1]) / 2, G.capot.z[0]]],
    ['06', 'Contrôleur', [(Tc.x[0] + Tc.x[1]) / 2, -(Tc.y_abs[0] + Tc.y_abs[1]) / 2, Tc.z[1]]],
    ['07', 'Pod avant', [D.x[1] - 8, -(D.y_abs[0] + D.y_abs[1]) / 2, D.z[1]]],
    ['08', 'Module avant (enveloppe)', [V.axe_x, 0, V.axe_z + V.rayon]],
    ['09', 'Coupe-circuit', [(S.x[0] + S.x[1]) / 2, 0, S.z[1]]],
    ['10', 'Capot', [120, 30, K.z[1]]],
    ['11', 'Arceau', [213, -G.arceaux.y_abs[1], 95]],
    ['12', 'Fourche passive', [300, -(Fk.y_abs[0] + Fk.y_abs[1]) / 2, 10]],
  ];
  for (const [rep, name, p] of items) {
    const o = label(`<b>${rep}</b><span>${name}</span>`, 'callout', new THREE.Vector3(...p));
    o.userData.rep = rep;
    o.element.addEventListener('pointerdown', (e) => { e.stopPropagation(); onPick(rep); });
    g.add(o);
  }
  return g;
}

const DIM_MAT = new THREE.LineBasicMaterial({ color: 0x1b2a41, depthTest: false, transparent: true, opacity: 0.9 });
const EXT_MAT = new THREE.LineBasicMaterial({ color: 0x1b2a41, depthTest: false, transparent: true, opacity: 0.35 });
const ARROW_GEO = new THREE.ConeGeometry(2.2, 8, 12);
const ARROW_MAT = new THREE.MeshBasicMaterial({ color: 0x1b2a41, depthTest: false });

function line(a, b, m) {
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([a, b]), m);
  l.renderOrder = 20;
  return l;
}
function arrow(at, dir) {
  const c = new THREE.Mesh(ARROW_GEO, ARROW_MAT);
  c.position.copy(at).addScaledVector(dir, -4);
  c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  c.renderOrder = 21;
  return c;
}
function dim(a, b, text, ext = [], views = 'pdfc') {
  const g = new THREE.Group();
  g.userData.views = views;
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
  const d = B.clone().sub(A).normalize();
  g.add(line(A, B, DIM_MAT), arrow(A, d.clone().negate()), arrow(B, d));
  for (const [p, q] of ext) g.add(line(new THREE.Vector3(...p), new THREE.Vector3(...q), EXT_MAT));
  g.add(label(text, 'dimlabel', A.clone().add(B).multiplyScalar(0.5)));
  return g;
}

export function buildDimensions(G) {
  const g = new THREE.Group();
  g.name = 'Cotes';
  const E = G.enveloppe, W = G.roues, V = G.module_avant, gs = G.garde_sol, F = G.flancs;
  const yR = -E.l / 2;
  const tag = (v, s) => `${v} <i>${s}</i>`;
  const tip = Math.max(...G.fourches.profil_xz.map((p) => p[0]));
  const front08 = V.axe_x + V.rayon;

  g.add(dim([0, yR - 70, 0], [tip, yR - 70, 0], tag(`${E.L} avec fourches`, E.statut), [[[0, yR, 0], [0, yR - 76, 0]], [[tip, -G.fourches.y_abs[1], 0], [tip, yR - 76, 0]]], 'pdc'));
  g.add(dim([0, yR - 45, 0], [front08, yR - 45, 0], tag(E.L_sans_fourches, E.statut), [[[front08, -V.y_abs, V.axe_z], [front08, yR - 51, 0]]], 'dc'));
  g.add(dim([W.axes_x[0], yR - 20, 0], [W.axes_x[1], yR - 20, 0], tag(`empattement ${W.empattement}`, W.statut), [[[W.axes_x[0], -W.voie_y, 0], [W.axes_x[0], yR - 26, 0]], [[W.axes_x[1], -W.voie_y, 0], [W.axes_x[1], yR - 26, 0]]], 'dc'));
  g.add(dim([-50, -E.l / 2, 0], [-50, E.l / 2, 0], tag(E.l, E.statut), [[[F.x[0], -E.l / 2, 12], [-56, -E.l / 2, 0]], [[F.x[0], E.l / 2, 12], [-56, E.l / 2, 0]]], 'pdf'));
  g.add(dim([-14, -W.voie_y, 0], [-14, W.voie_y, 0], tag(`voie ${W.voie}`, W.statut), [[[W.axes_x[0], -W.voie_y, 0], [-20, -W.voie_y, 0]], [[W.axes_x[0], W.voie_y, 0], [-20, W.voie_y, 0]]], 'df'));
  g.add(dim([front08 + 18, -V.y_abs, 0], [front08 + 18, -V.y_abs, E.h], tag(E.h, E.statut), [[[V.axe_x, -V.y_abs, E.h], [front08 + 24, -V.y_abs, E.h]]], 'pfc'));
  g.add(dim([-12, yR, 0], [-12, yR, G.chassis.rails_int.z[1]], tag(`caisse ${G.chassis.rails_int.z[1]}`, G.chassis.statut), [[[G.pare_chocs.x[0], yR, G.chassis.rails_int.z[1]], [-18, yR, G.chassis.rails_int.z[1]]]], 'fc'));
  const xw = W.axes_x[0], yw = -W.voie_y - W.largeur / 2 - 1;
  g.add(dim([xw, yw - 20, 0], [xw, yw - 20, W.diametre], tag(`Ø${W.diametre}`, W.statut_diametre), [[[xw, yw, W.diametre], [xw, yw - 26, W.diametre]]], 'c'));
  g.add(dim([130, 0, 0], [130, 0, gs.plancher], tag(`garde ${gs.plancher}`, gs.statut), [], 'fc'));
  return g;
}
