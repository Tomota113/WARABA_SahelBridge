// Géométrie commune aux dessins et contrôles ; aucune cote mécanique propre à ce module.
import { readFile } from 'node:fs/promises';
export const g = JSON.parse(await readFile(new URL('../config/geometry.json', import.meta.url), 'utf8'));
export const span = a => a[1] - a[0];
export const mid = a => (a[0] + a[1]) / 2;
export const fmt = n => Number(n.toFixed(3)).toString().replace('.', ',');
export const signed = (a, s) => s > 0 ? [...a] : [-a[1], -a[0]];
export const box = (id, rep, x, y, z, extra = {}) => ({ id, rep, x, y, z, ...extra });
export function volumes() {
  const c = g.caisson, p = c.paroi, f = g.protections.flancs, a = g.protections.arriere;
  const out = [
    box('01-plancher', '01', c.x, c.y, c.plancher.z),
    box('01-paroi-arrière', '01', [c.x[0], c.x[0] + p], c.y, [c.plancher.z[1], c.z[1]]),
    box('01-paroi-avant', '01', [c.x[1] - p, c.x[1]], c.y, [c.plancher.z[1], c.z[1]]),
    box('03-arrière', '03', a.x, a.y, a.z),
    ...['batterie', 'commande', 'module_avant', 'sectionnement', 'capot'].map(k => ({ id: `${g[k].rep}-${k}`, ...g[k] })),
  ];
  for (const s of [-1, 1]) {
    const cote = s > 0 ? 'G' : 'D';
    out.push(box(`01-flanc-${cote}`, '01', [c.x[0] + p, c.x[1] - p], signed([c.y[1] - p, c.y[1]], s), [c.plancher.z[1], c.z[1]]));
    out.push(box(`03-flanc-${cote}`, '03', f.x, signed(f.y_abs, s), f.z));
    for (const k of ['controleurs', 'pods']) out.push(box(`${g[k].rep}-${cote}`, g[k].rep, g[k].x, signed(g[k].y_abs, s), g[k].z, { rayon: g[k].rayon }));
    for (const x of g.roues.axes_x) {
      const r = g.roues.diametre / 2, m = g.motoreducteurs.enveloppe_diametre / 2;
      out.push(box(`02-roue-${cote}-${x}`, '02', [x - r, x + r], signed([g.roues.voie_y - g.roues.largeur / 2, g.roues.voie_y + g.roues.largeur / 2], s), [g.roues.axe_z - r, g.roues.axe_z + r], { cylindre: true, roue: true }));
      out.push(box(`02-moteur-${cote}-${x}`, '02', [x - m, x + m], signed([g.motoreducteurs.y_interieur, g.motoreducteurs.y_paroi], s), [g.roues.axe_z - m, g.roues.axe_z + m], { cylindre: true, moteur: true }));
    }
    for (const x of g.protections.entretoises.x) {
      const r = g.protections.entretoises.diametre / 2, z = g.protections.entretoises.z;
      out.push(box(`03-entretoise-${cote}-${x}`, '03', [x-r, x+r], signed([c.y[1], f.y_abs[0]], s), [z-r, z+r], { cylindre: true, statut: g.protections.entretoises.statut }));
    }
  }
  return out;
}
export function limites(vs = volumes()) {
  return Object.fromEntries(['x', 'y', 'z'].map(k => [k, [Math.min(...vs.map(v => v[k][0])), Math.max(...vs.map(v => v[k][1]))]]));
}
export const jeux = () => ({
  roueCaisson: g.roues.voie_y - g.roues.largeur / 2 - g.caisson.y[1],
  roueProtection: g.protections.flancs.y_abs[0] - g.roues.voie_y - g.roues.largeur / 2,
  moteurAvant: g.caisson.x[1] - g.caisson.paroi - Math.max(...g.roues.axes_x) - g.motoreducteurs.enveloppe_diametre / 2,
});
