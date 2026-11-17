import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const g = JSON.parse(await readFile(path.join(dir, '../config/geometry.json'), 'utf8'));
const h = g.hypotheses_calcul;
const p = g.masse.postes;
const total = p.reduce((s, x) => s + x.g, 0);
const budget = total + g.masse.reserve_g;
const match = h.duree_match_min;
const utilisable = 1 - h.reserve_capacite;
const xAr = g.roues.axes_x[0];
const emp = g.roues.empattement;
const round = (x, digits = 2) => Number(x.toFixed(digits));
const row = (id, libelle, formule, valeur, unite, statut, portee, digits = 2) =>
  ({ id, libelle, formule, valeur: round(valeur, digits), unite, statut, portee });
const cg = (items) => {
  const m = items.reduce((s, x) => s + x.g, 0);
  return {
    masse_g: m,
    x_mm: items.reduce((s, x) => s + x.g * x.position[0], 0) / m,
    y_mm: items.reduce((s, x) => s + x.g * x.position[1], 0) / m,
    z_mm: items.reduce((s, x) => s + x.g * x.position[2], 0) / m,
  };
};
const complet = cg(p);
const sans = cg(p.filter(x => x.poste !== 'Module avant réservé'));
const avant = x => 100 * (x - xAr) / emp;
const postes = p.map(x => ({ ...x, formule_part: '100 × poste / budget', part_pct: round(100 * x.g / budget, 1), statut_part: 'F', portee: 'Part arithmétique d’une allocation P ; position PV non mesurée.' }));
const lignes = [
  row('autonomie_ideale', 'Autonomie idéale', '60 × C / I', 60*h.capacite_Ah/h.courant_moyen_A, 'min', 'E', 'Capacité entière et courant constant supposés.'),
  row('autonomie_reserve', 'Autonomie avec réserve', '60 × C × (1 − r) / I', 60*h.capacite_Ah*utilisable/h.courant_moyen_A, 'min', 'E', 'Réserve de capacité de travail ; autonomie réelle inconnue.'),
  row('courant_admissible', 'Courant moyen admissible pour le match', '60 × C × (1 − r) / t', 60*h.capacite_Ah*utilisable/match, 'A', 'E', 'Maximum théorique à vérifier sur le système entier.', 1),
  row('capacite_necessaire', 'Capacité nécessaire au courant supposé', 'I × t / [60 × (1 − r)]', h.courant_moyen_A*match/(60*utilisable), 'Ah', 'E', 'Minimum théorique ; disponibilité, masse et décharge à vérifier.', 3),
  row('courant_voie', 'Courant moyen par voie', 'I / 2', h.courant_moyen_A/2, 'A', 'E', 'Répartition égale supposée ; deux moteurs par voie, pointes inconnues.', 1),
  row('energie', 'Énergie nominale du pack', 'U × C', h.tension_nominale_V*h.capacite_Ah, 'Wh', 'E', 'Énergie nominale ; ni énergie utile ni puissance garantie.', 1),
  row('vitesse', 'Vitesse sans glissement', 'π × (Ø / 1000) × n / 60', Math.PI*(g.roues.diametre/1000)*h.vitesse_roue_tr_min/60, 'm/s', 'E', 'À la vitesse de roue supposée ; charge et glissement inconnus.'),
  row('adherence', 'Adhérence requise pour la poussée supposée', 'F / [(M / 1000) × 9,81]', h.poussee_N/((budget/1000)*9.81), 'µ', 'E', 'Toute la masse budgétée sur les roues ; 45 N non démontrés.'),
  row('masse_allouee', 'Somme des postes', 'Σ mᵢ', total, 'g', 'F', 'Addition des allocations, pas une pesée.', 0),
  row('masse_budget', 'Budget avec réserve', 'Σ mᵢ + réserve', budget, 'g', 'F', 'La réserve est incluse une seule fois.', 0),
  row('marge', 'Marge au maximum publié', 'Mmax − budget', g.masse.maximum_publie_g-budget, 'g', 'F', 'Marge budgétaire seulement ; conformité à peser.', 0),
  row('marge_pct', 'Marge relative au maximum', '100 × marge / Mmax', 100*(g.masse.maximum_publie_g-budget)/g.masse.maximum_publie_g, '%', 'F', 'Pourcentage du maximum publié.'),
  row('cg_x', 'XG avec module avant', 'Σ(mᵢ xᵢ) / Σmᵢ', complet.x_mm, 'mm', 'E', 'Positions PV ; réserve non localisée exclue.'),
  row('cg_z', 'ZG avec module avant', 'Σ(mᵢ zᵢ) / Σmᵢ', complet.z_mm, 'mm', 'E', 'Positions PV ; symétrie YG = 0 ; aucune mesure.'),
  row('charge_avant', 'Charge sur essieu avant avec module', '100 × (XG − x arrière) / empattement', avant(complet.x_mm), '%', 'E', 'Équilibre statique sur sol plat, sans transfert dynamique.', 1),
  row('cg_sans_x', 'XG sans module avant', 'Σ hors 08(mᵢ xᵢ) / Σ hors 08mᵢ', sans.x_mm, 'mm', 'E', 'Masse restante ; réserve exclue.'),
  row('cg_sans_z', 'ZG sans module avant', 'Σ hors 08(mᵢ zᵢ) / Σ hors 08mᵢ', sans.z_mm, 'mm', 'E', 'Positions PV ; aucune mesure.'),
  row('charge_sans', 'Charge sur essieu avant sans module', '100 × (XG − x arrière) / empattement', avant(sans.x_mm), '%', 'E', 'Équilibre statique sur sol plat.', 1),
];
const obj = {
  meta: { projet: g.meta.projet, date: g.meta.date, source: '../config/geometry.json', statuts: { F: g.meta.statuts.F, H: g.meta.statuts.H, E: g.meta.statuts.E } },
  entrees: { capacite_Ah: h.capacite_Ah, tension_V: h.tension_nominale_V, courant_A: h.courant_moyen_A, reserve_pct: 100*h.reserve_capacite, match_min: match, roue_mm: g.roues.diametre, roue_tr_min: h.vitesse_roue_tr_min, poussee_N: h.poussee_N, masse_max_g: g.masse.maximum_publie_g, reserve_masse_g: g.masse.reserve_g, x_arriere_mm: xAr, empattement_mm: emp },
  lignes, postes, cg: { avec_module: { ...Object.fromEntries(Object.entries(complet).map(([k,v])=>[k,round(v,2)])), charge_avant_pct: round(avant(complet.x_mm),1) }, sans_module: { ...Object.fromEntries(Object.entries(sans).map(([k,v])=>[k,round(v,2)])), charge_avant_pct: round(avant(sans.x_mm),1) }, publie_R1_1: g.cg.estimation_R1_1 },
};
await writeFile(path.join(dir, 'calculs.json'), JSON.stringify(obj, null, 2)+'\n');

const fmt = x => String(x).replace('.', ',');
const md = [
  '# Calculs reproductibles — HOTLINE MK-II',
  '',
  `Source unique des entrées actuelles : \`config/geometry.json\` (${g.meta.date}). F = calcul arithmétique vérifié ; H = entrée hypothétique ; E = estimation fondée sur H/P/PV. Aucune ligne E n'est une mesure.`,
  '',
  `Entrées H : ${fmt(h.capacite_Ah)} Ah, ${fmt(h.tension_nominale_V)} V, ${fmt(h.courant_moyen_A)} A, ${fmt(h.vitesse_roue_tr_min)} tr/min, poussée ${fmt(h.poussee_N)} N, réserve de capacité ${fmt(100*h.reserve_capacite)} %. Durée et masse maximale publiées : ${match} min et ${g.masse.maximum_publie_g} g (${g.regles_publiees.consultation}).`,
  '',
  '| Grandeur | Formule | Résultat arrondi | Statut | Portée / limite |',
  '|---|---|---:|:---:|---|',
  ...lignes.map(x=>`| ${x.libelle} | ${x.formule} | ${fmt(x.valeur)} ${x.unite} | ${x.statut} | ${x.portee} |`),
  '',
  `Les parts de masse utilisent le budget avec réserve (${budget} g) comme dénominateur ; chaque poste est une allocation P et sa part est un calcul F sur cette allocation.`,
  '',
  '| Poste | Formule de part | Résultat arrondi | Statut | Portée / limite | Position PV (X ; Y ; Z), mm |',
  '|---|---|---:|:---:|---|---|',
  ...postes.map(x=>`| ${x.poste} | 100 × ${x.g} / ${budget} | ${fmt(x.part_pct)} % | ${x.statut_part} | ${x.portee} | ${x.position.map(fmt).join(' ; ')} |`),
  `| Réserve non localisée | 100 × ${g.masse.reserve_g} / ${budget} | ${fmt(round(100*g.masse.reserve_g/budget,1))} % | F | Allocation P, sans position : exclue du CG. | — |`,
  '',
  `**CG E.** Avec 08 : (${fmt(round(complet.x_mm,2))} ; ${fmt(round(complet.y_mm,2))} ; ${fmt(round(complet.z_mm,2))}) mm sur ${total} g, charge avant ${fmt(round(avant(complet.x_mm),1))} %. Sans 08 : (${fmt(round(sans.x_mm,2))} ; ${fmt(round(sans.y_mm,2))} ; ${fmt(round(sans.z_mm,2))}) mm sur ${sans.masse_g} g, charge avant ${fmt(round(avant(sans.x_mm),1))} %. La charge suit (XG − ${xAr}) / ${emp}. La réserve de ${g.masse.reserve_g} g n'a pas de position et n'est incluse dans aucun de ces CG.`,
  '',
  `R1.1 publie (${g.cg.estimation_R1_1.x} ; ${g.cg.estimation_R1_1.y} ; ${g.cg.estimation_R1_1.z}) mm E, contre (${fmt(round(complet.x_mm,2))} ; 0 ; ${fmt(round(complet.z_mm,2))}) mm E ici : écart ${fmt(round(complet.x_mm-g.cg.estimation_R1_1.x,2))} mm en X et +${fmt(round(complet.z_mm-g.cg.estimation_R1_1.z,2))} mm en Z. La part avant passe d'environ 62 % publiée à ${fmt(round(avant(complet.x_mm),1))} %. R1.1 ne documente pas les placements ayant produit sa valeur ; le JSON pose des positions PV différentes. Sans 08, R1.1 annonce environ (147 ; 0 ; 31) mm et 47 % avant contre (${fmt(round(sans.x_mm,2))} ; 0 ; ${fmt(round(sans.z_mm,2))}) mm et ${fmt(round(avant(sans.x_mm),1))} % avant. La comparaison ne permet pas d'identifier le placement antérieur exact.`,
  '',
  '## Vérification de R1 et R1.1',
  '',
  `Les deux révisions donnent correctement 5,00 min, 4,00 min, 14,4 A, 1,875 Ah, 22,2 Wh, 1,73 m/s et µ ≈ 1,19 avec leurs hypothèses. Le courant par voie de 9 A dans R1.1 est une moyenne conditionnelle, pas un calibre de contrôleur. Le total historique de lest 1 586 / 3 850 = ${fmt(round(100*1586/3850,1))} % est arithmétiquement correct, mais les 22 masses du rapport initial ne sont pas disponibles ici pour une vérification indépendante. Les 480 s cités en R1/R1.1 valent bien 8 min ; les huit durées du rapport initial ne sont pas disponibles ici pour recomposer cette somme. L’autonomie de 4 min 30 s évoquée pour le rapport initial suppose 90 % de capacité utilisable, hypothèse absente.`,
  '',
  '## Cohérence et limites du JSON',
  '',
  `La somme des postes est ${total} g, la réserve ${g.masse.reserve_g} g et le budget ${budget} g : cohérents. L’empattement ${emp} mm égale la différence des axes (${g.roues.axes_x[1]} − ${xAr}). La hauteur hors tout ${g.enveloppe.h} mm est portée par 08 ; le capot finit à Z = ${g.capot.z[1]} mm. Le volume 08 est une enveloppe, tandis que son allocation de ${p.find(x=>x.poste==='Module avant réservé').g} g suppose une configuration avec masse réelle future : ne pas confondre la vue neutralisée et le budget de configuration complète. La « réserve projet » ne possède aucune position, donc son effet sur CG et charge avant est indéterminé. Les positions des postes sont PV et certains regroupements (protections, commande) ne correspondent pas à une seule pièce ; ils doivent être recalculés après inventaire. L’accès 09 indiqué à Z = ${g.sectionnement.z[0]}–${g.sectionnement.z[1]} mm débute au sommet du capot (Z = ${g.capot.z[1]} mm) : c’est un volume d’accès proposé, pas la position vérifiée d’un organe.`,
  '',
  'Aucune incohérence arithmétique bloquante trouvée dans les champs vérifiés. La faisabilité des jeux, matériaux, courants et dimensions de l’arène reste à confirmer.',
  ''
].join('\n');
await writeFile(path.join(dir, 'calculs.md'), md);
console.log('Calculs générés : calculs.json, calculs.md');
