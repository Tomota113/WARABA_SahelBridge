import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import G from '../../config/geometry.json';
import { buildRobot, partInfo } from './robot.js';
import { buildCallouts, buildDimensions } from './annotations.js';
import { subMat, SUB_COLORS } from './materials.js';

const S = 0.01; // mm → scene units
const params = new URLSearchParams(location.search);
const $ = (id) => document.getElementById(id);

// ------------------------------------------------------------------ renderer
const viewport = $('viewport');
if (window.innerWidth <= 760) document.body.classList.remove('panel-open');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
viewport.appendChild(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = 'labels';
viewport.appendChild(labelRenderer.domElement);

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;

// ------------------------------------------------------------------ lights + ground
scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c0c8, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(3.5, 6, 4.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -3; key.shadow.camera.right = 3; key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
key.shadow.camera.near = 1; key.shadow.camera.far = 16;
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01; key.shadow.radius = 4;
scene.add(key);
const fill = new THREE.DirectionalLight(0xdfe8ff, 0.6);
fill.position.set(-4, 3, -3);
scene.add(fill);

const ground = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.22 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(8, 80, 0x8a96a3, 0xc3cad2);
grid.material.transparent = true; grid.material.opacity = 0.35; grid.material.depthWrite = false;
grid.position.y = 0.0005;
scene.add(grid);

// ------------------------------------------------------------------ robot
const { root, parts, wheels, hinge, rotor } = buildRobot(G);
document.title = `${G.meta.nom} — 3D`;
document.querySelectorAll('[data-name]').forEach((el) => { el.textContent = G.meta.nom; });
document.querySelectorAll('[data-team]').forEach((el) => { el.textContent = G.meta.equipe; });
root.scale.setScalar(S);
root.rotation.x = -Math.PI / 2;           // robot Z up → scene Y up, robot Y left → scene −Z
const rig = new THREE.Group();            // carries the presentation translation
rig.add(root);
root.position.x = -(G.enveloppe.L / 2) * S;
scene.add(rig);

const info = partInfo(G);
const callouts = buildCallouts(G, (rep) => select(rep));
const dims = buildDimensions(G);
root.add(callouts, dims);

const meshes = [];
root.traverse((o) => {
  if (o.userData.explode) o.userData.base = o.position.clone();
  if (o.isMesh) meshes.push(o);
});

// ------------------------------------------------------------------ cameras
const persp = new THREE.PerspectiveCamera(32, 1, 0.05, 100);
const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 100);
let camera = persp;
const controls = new OrbitControls(persp, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 1.6; controls.maxDistance = 18;
controls.maxPolarAngle = Math.PI * 0.495;

const VIEWS = {
  perspective: { cam: 'p', pos: [4.3, 2.3, 4.6], target: [0.15, 0.3, 0] },
  dessus:      { cam: 'o', pos: [0, 10, 0.0001], target: [0, 0, 0], w: 4.3, h: 3.4 },
  face:        { cam: 'o', pos: [10, 0.55, 0], target: [0, 0.55, 0], w: 3.0, h: 1.5 },
  cote:        { cam: 'o', pos: [0, 0.55, 10], target: [0, 0.55, 0], w: 4.3, h: 1.5 },
  arriere:     { cam: 'p', pos: [-4.4, 2.6, -3.6], target: [0, 0.3, 0] },
};
let currentView = 'perspective';
let fitOrtho = null;

function aspect() { return viewport.clientWidth / Math.max(1, viewport.clientHeight); }

function applyOrthoFrustum() {
  if (!fitOrtho) return;
  const a = aspect();
  const h = Math.max(fitOrtho.h / 2, fitOrtho.w / 2 / a) * 1.12;
  ortho.left = -h * a; ortho.right = h * a; ortho.top = h; ortho.bottom = -h;
  ortho.updateProjectionMatrix();
}

function setView(name, instant = false) {
  const v = VIEWS[name];
  currentView = name;
  document.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === name));
  const next = v.cam === 'o' ? ortho : persp;
  if (next !== camera) { camera = next; controls.object = camera; }
  if (v.cam === 'o') {
    fitOrtho = v; ortho.zoom = 1; applyOrthoFrustum();
    controls.maxPolarAngle = Math.PI;
    ground.visible = false;
  } else {
    fitOrtho = null; controls.maxPolarAngle = Math.PI * 0.495;
    ground.visible = true;
  }
  const k = v.cam === 'p' ? Math.max(1, 1.3 / aspect()) : 1;
  const to = new THREE.Vector3(...v.pos).sub(new THREE.Vector3(...v.target)).multiplyScalar(k).add(new THREE.Vector3(...v.target));
  tween = { from: camera.position.clone(), to, tf: controls.target.clone(), tt: new THREE.Vector3(...v.target), t: instant || v.cam === 'o' ? 1 : 0 };
  if (tween.t === 1) { camera.position.copy(tween.to); controls.target.copy(tween.tt); camera.lookAt(controls.target); }
  controls.update();
}
let tween = null;

// ------------------------------------------------------------------ state
const DEFAULTS = { rotor: true, envelope: true, capot: true, explode: false, labels: false, dims: false, cg: false, xray: false, wires: true, grid: true, colors: 'real', levage: false, anim: false, theme: 'light' };
const state = { ...DEFAULTS };
let explodeT = 0;
const hidden = new Set();

function boolParam(k) { return params.has(k) ? params.get(k) !== '0' : undefined; }
for (const k of ['rotor', 'envelope', 'capot', 'explode', 'labels', 'dims', 'cg', 'xray', 'wires', 'grid', 'levage', 'anim']) { const b = boolParam(k); if (b !== undefined) state[k] = b; }
if (params.get('colors')) state.colors = params.get('colors') === 'sub' ? 'sub' : 'real';
if (params.get('theme')) state.theme = params.get('theme');
if (params.get('explode') === '1') explodeT = 1;

const xrayMat = new THREE.MeshStandardMaterial({ color: 0xa8743a, transparent: true, opacity: 0.18, depthWrite: false, roughness: 0.5, side: THREE.DoubleSide });

function applyMaterials() {
  for (const m of meshes) {
    const rep = m.userData.rep;
    if (!m.userData.realMat || m.userData.decal) { if (m.userData.decal) m.visible = !state.xray; continue; }
    if (rep === '08') continue;
    let target = state.colors === 'sub' ? subMat(rep, { transparent: m.userData.transparent }) : m.userData.realMat;
    if (state.xray && rep === '03') target = state.colors === 'sub' ? subMat('03', { transparent: true }) : xrayMat;
    m.material = target;
    m.castShadow = !(state.xray && rep === '03') && !m.userData.transparent;
  }
}

function applyState() {
  parts['10'].visible = state.capot && !hidden.has('10');
  parts['09'].visible = state.capot && !hidden.has('09');
  parts['P3'].visible = state.levage && !hidden.has('08');
  parts['08'].visible = !state.levage && !hidden.has('08');
  parts['CG'].visible = state.cg;
  for (const rep of ['01', '02', '03', '04', '05', '06', '07', '11', '12']) parts[rep].visible = !hidden.has(rep);
  parts['W'].visible = state.wires && !hidden.has('W');
  callouts.visible = state.labels;
  dims.visible = state.dims;
  grid.visible = state.grid;
  document.documentElement.dataset.theme = state.theme;
  grid.material.color?.set?.(state.theme === 'dark' ? 0x3a4654 : 0xc3cad2);
  ground.material.opacity = state.theme === 'dark' ? 0.45 : 0.22;
  $('animBadge').hidden = !(state.anim || (spin > 0 && state.rotor && !state.levage));
  $('liftRow').hidden = !state.levage;
  $('rotorRow').hidden = state.levage;
  rotor.visible = state.rotor;
  parts['08'].children.forEach((c) => { if (c !== rotor && !c.userData.axle) c.visible = state.envelope; });
  $('btnSpin').classList.toggle('on', spin > 0);
  applyMaterials();
  syncUI();
}

function syncUI() {
  document.querySelectorAll('[data-toggle]').forEach((el) => { el.checked = !!state[el.dataset.toggle]; });
  document.querySelectorAll('[data-colors]').forEach((b) => b.classList.toggle('on', b.dataset.colors === state.colors));
  document.querySelectorAll('[data-config]').forEach((b) => b.classList.toggle('on', (b.dataset.config === 'levage') === state.levage));
  document.querySelectorAll('[data-part]').forEach((el) => { el.checked = !hidden.has(el.dataset.part); });
  document.querySelectorAll('[data-quick]').forEach((b) => b.classList.toggle('on', !!state[b.dataset.quick]));
}

// ------------------------------------------------------------------ selection
const selBox = new THREE.Box3Helper(new THREE.Box3(), 0xf5b301);
selBox.material.depthTest = false; selBox.renderOrder = 30; selBox.visible = false;
scene.add(selBox);
let selected = null;

function select(rep) {
  selected = rep;
  const d = info[rep];
  if (!rep || !d) { $('infoCard').hidden = true; selBox.visible = false; return; }
  $('infoTitle').textContent = d.t;
  $('infoStatus').textContent = d.s;
  $('infoStatus').title = G.meta.statuts[d.s] || '';
  $('infoRows').innerHTML = d.rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  $('infoNote').textContent = d.n || '';
  $('infoCard').hidden = false;
  updateSelBox();
}
function updateSelBox() {
  if (!selected || !parts[selected] || !parts[selected].visible) { selBox.visible = false; return; }
  selBox.box.setFromObject(parts[selected]);
  selBox.box.expandByScalar(0.03);
  selBox.visible = true;
}

const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
let downAt = null;
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 5) return;
  const r = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(meshes.filter((m) => isShown(m)), false).find((h) => h.object.userData.rep);
  select(hit ? hit.object.userData.rep : null);
});
function isShown(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }

// ------------------------------------------------------------------ UI wiring
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
document.querySelectorAll('[data-toggle]').forEach((el) => el.addEventListener('change', () => { state[el.dataset.toggle] = el.checked; applyState(); }));
document.querySelectorAll('[data-quick]').forEach((b) => b.addEventListener('click', () => { state[b.dataset.quick] = !state[b.dataset.quick]; applyState(); }));
document.querySelectorAll('[data-colors]').forEach((b) => b.addEventListener('click', () => { state.colors = b.dataset.colors; applyState(); }));
document.querySelectorAll('[data-config]').forEach((b) => b.addEventListener('click', () => { state.levage = b.dataset.config === 'levage'; applyState(); }));
document.querySelectorAll('[data-part]').forEach((el) => el.addEventListener('change', () => { el.checked ? hidden.delete(el.dataset.part) : hidden.add(el.dataset.part); applyState(); }));
$('liftAngle').addEventListener('input', (e) => setLift(+e.target.value));
$('btnReset').addEventListener('click', reset);
$('btnPresent').addEventListener('click', () => present(true));
$('btnExitPresent').addEventListener('click', () => present(false));
$('btnPng').addEventListener('click', exportPng);
$('btnTheme').addEventListener('click', () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; applyState(); });
$('btnPanel').addEventListener('click', () => document.body.classList.toggle('panel-open'));
$('infoClose').addEventListener('click', () => select(null));

let spin = params.has('spin') ? Math.min(100, Math.max(0, +params.get('spin'))) : 0;
let lastSpin = 60;
function setSpin(v) {
  spin = v; if (v > 0) lastSpin = v;
  $('spinSpeed').value = v; $('spinVal').textContent = `${v} %`;
  applyState();
}
$('spinSpeed').addEventListener('input', (e) => setSpin(+e.target.value));
$('btnSpin').addEventListener('click', () => setSpin(spin > 0 ? 0 : lastSpin));

function setLift(deg) {
  hinge.rotation.y = -THREE.MathUtils.degToRad(deg);
  $('liftVal').textContent = `${deg}°`;
}
setLift(params.has('lift') ? +params.get('lift') : 0);
$('spinSpeed').value = spin; $('spinVal').textContent = `${spin} %`;

function reset() {
  Object.assign(state, DEFAULTS, { theme: state.theme });
  hidden.clear(); explodeT = 0; animClock = 0; rig.position.x = 0; spin = 0; $('spinSpeed').value = 0; $('spinVal').textContent = '0 %';
  select(null); setLift(0); $('liftAngle').value = 0;
  setView('perspective'); applyState();
}

let presenting = false;
function present(on) {
  presenting = on;
  document.body.classList.toggle('presenting', on);
  controls.autoRotate = on && camera === persp;
  controls.autoRotateSpeed = 0.6;
  if (on) { state.labels = false; state.dims = false; state.cg = false; select(null); setView('perspective'); applyState(); }
  else controls.autoRotate = false;
}

function exportPng() {
  renderer.render(scene, camera);
  const a = document.createElement('a');
  a.download = `${G.meta.nom}_${currentView}.png`;
  a.href = renderer.domElement.toDataURL('image/png');
  a.click();
}

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  const map = { '1': 'perspective', '2': 'dessus', '3': 'face', '4': 'cote' };
  if (map[k]) setView(map[k]);
  else if (k === 'r') reset();
  else if (k === 'p') present(!presenting);
  else if (k === 'escape' && presenting) present(false);
  else if (k === 'c') { state.capot = !state.capot; applyState(); }
  else if (k === 'e') { state.explode = !state.explode; applyState(); }
  else if (k === 'a') { state.labels = !state.labels; applyState(); }
  else if (k === 'd') { state.dims = !state.dims; applyState(); }
  else if (k === 'w') { state.anim = !state.anim; applyState(); }
  else if (k === 'x') { state.xray = !state.xray; applyState(); }
  else if (k === 't') setSpin(spin > 0 ? 0 : lastSpin);
});

// Legend swatches = shared 2D/3D sub-assembly palette.
document.querySelectorAll('[data-swatch]').forEach((el) => { el.style.background = '#' + SUB_COLORS[el.dataset.swatch].toString(16).padStart(6, '0'); });

// ------------------------------------------------------------------ loop
function resize() {
  const w = viewport.clientWidth, h = viewport.clientHeight;
  renderer.setSize(w, h, false);
  labelRenderer.setSize(w, h);
  persp.aspect = w / Math.max(1, h); persp.updateProjectionMatrix();
  applyOrthoFrustum();
}
new ResizeObserver(resize).observe(viewport);
resize();

const ease = (t) => t * t * (3 - 2 * t);
let animClock = 0;
const clock = new THREE.Clock();
let frames = 0;
const R = G.roues.diametre / 2;

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  // Exploded view.
  const goal = state.explode ? 1 : 0;
  explodeT += (goal - explodeT) * Math.min(1, dt * 5);
  if (Math.abs(goal - explodeT) < 0.001) explodeT = goal;
  const k = ease(explodeT);
  root.traverse((o) => { if (o.userData.base) o.position.copy(o.userData.base).addScaledVector(o.userData.explode, k); });
  if (state.explode && explodeT > 0.05) parts['W'].visible = false;
  else parts['W'].visible = state.wires && !hidden.has('W');

  // Presentation animation (not a simulation): back-and-forth roll, wheels turn consistently.
  if (state.anim) {
    animClock += dt;
    const A = 70, w = (2 * Math.PI) / 7;
    const x = A * Math.sin(w * animClock);
    rig.position.x = x * S;
    for (const wg of wheels) wg.rotation.y = x / R;
  }

  // Rotor presentation animation: up to 4 rev/s on screen, blur disc at high setting.
  if (spin > 0 && rotor.visible) {
    rotor.rotation.y -= (spin / 100) * 4 * 2 * Math.PI * dt;
    rotor.userData.blur.material.opacity = Math.max(0, (spin - 55) / 45) * 0.55;
  } else rotor.userData.blur.material.opacity = 0;

  if (tween && tween.t < 1) {
    tween.t = Math.min(1, tween.t + dt * 1.8);
    const e = ease(tween.t);
    camera.position.lerpVectors(tween.from, tween.to, e);
    controls.target.lerpVectors(tween.tf, tween.tt, e);
  }
  controls.update();
  callouts.children.forEach((c) => { const p = parts[c.userData.rep]; c.visible = !!p && p.visible; });
  const vk = { perspective: 'p', arriere: 'p', dessus: 'd', face: 'f', cote: 'c' }[currentView];
  dims.children.forEach((d) => { d.visible = d.userData.views.includes(vk); });
  if (selected) updateSelBox();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  if (++frames === 8) window.__READY = true;
  requestAnimationFrame(tick);
}

setView(params.get('view') && VIEWS[params.get('view')] ? params.get('view') : 'perspective', true);
if (params.get('ui') === '0') document.body.classList.add('bare');
if (params.get('present') === '1') present(true);
if (params.get('select')) select(params.get('select'));
applyState();
$('rulesDate').textContent = G.regles_publiees.consultation;
requestAnimationFrame(tick);
