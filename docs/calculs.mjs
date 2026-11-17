import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dir = path.dirname(fileURLToPath(import.meta.url));
const g = JSON.parse(await readFile(path.join(dir, '../config/geometry.json'), 'utf8'));
const h = g.hypotheses_calcul;
const posts = g.masse.postes;
const number = (v, label) => { if (!Number.isFinite(v)) throw new Error(`${label} absent ou invalide`); return v; };
for (const [label, value] of Object.entries({capacite:h.capacite_Ah, capacite_alt:h.capacite_alt_Ah, tension:h.tension_nominale_V, courant:h.courant_moyen_A, reserve:h.reserve_capacite, duree:h.duree_match_min, roue:g.roues.diametre, empattement:g.roues.empattement, masse_max:g.masse.maximum_publie_g})) number(value,label);
if (h.reserve_capacite < 0 || h.reserve_capacite >= 1 || h.courant_moyen_A <= 0 || g.roues.empattement <= 0) throw new Error('Hypothèses de calcul invalides');
const round = (x, n=2) => Number(x.toFixed(n));
const fmt = x => new Intl.NumberFormat('fr-FR', {maximumFractionDigits:3}).format(x);
const sum = posts.reduce((n,p)=>n+p.g,0);
const budget = sum + g.masse.reserve_g;
const xRear = g.roues.axes_x[0];
const line = (id, libelle, formule, valeur, unite, statut, limite, digits=2) => ({id,libelle,formule,valeur:round(valeur,digits),unite,statut,limite});
const lines=[];
for (const [tag, cap] of [['15',h.capacite_Ah],['22',h.capacite_alt_Ah]]) {
  lines.push(line(`autonomie_${tag}_ideale`,`Autonomie ${fmt(cap)} Ah, idéale`,'60 × C / I',60*cap/h.courant_moyen_A,'min','E','Courant moyen constant, capacité entièrement utilisable.'));
  lines.push(line(`autonomie_${tag}_reserve`,`Autonomie ${fmt(cap)} Ah, réserve incluse`,'60 × C × (1 − r) / I',60*cap*(1-h.reserve_capacite)/h.courant_moyen_A,'min','E','Réserve de 20 % supposée ; essai global V5 nécessaire.'));
  lines.push(line(`courant_max_${tag}`,`Courant moyen maximal, ${fmt(cap)} Ah`,'60 × C × (1 − r) / t',60*cap*(1-h.reserve_capacite)/h.duree_match_min,'A','E','Pour 5 min théoriques ; pointes et capacité réelle inconnues.',1));
  lines.push(line(`energie_${tag}`,`Énergie nominale, ${fmt(cap)} Ah`,'U × C',h.tension_nominale_V*cap,'Wh','E','Énergie nominale, pas énergie réellement disponible.',1));
}
lines.push(line('capacite_necessaire','Capacité minimale à 18 A et 5 min','I × t / [60 × (1 − r)]',h.courant_moyen_A*h.duree_match_min/(60*(1-h.reserve_capacite)),'Ah','E','Minimum théorique ; compatibilité et masse à contrôler.',3));
lines.push(line('courant_voie','Courant moyen par voie et par moteur','I / 2',h.courant_moyen_A/2,'A','E','Deux voies, un motoréducteur par voie ; pointes inconnues.',1));
lines.push(line('vitesse','Vitesse théorique sans glissement','π × (Ø / 1000) × n / 60',Math.PI*g.roues.diametre/1000*h.vitesse_roue_tr_min/60,'m/s','E','600 tr/min à la roue supposés ; charge et glissement inconnus.'));
lines.push(line('adherence','Adhérence requise pour 45 N','F / [(M / 1000) × 9,81]',h.poussee_N/((budget/1000)*9.81),'µ','E','45 N hypothétiques ; masse budgétée sur les roues, sol inconnu.'));
lines.push(line('masse_allouee','Somme des postes','Σ mᵢ',sum,'g','F','Addition d’allocations P, pas une pesée.',0));
lines.push(line('masse_budget','Budget avec réserve','Σ mᵢ + réserve',budget,'g','F','La réserve est comptée une seule fois ; masses non mesurées.',0));
lines.push(line('marge','Marge au maximum publié','Mmax − budget',g.masse.maximum_publie_g-budget,'g','F','Marge budgétaire ; seule V6 peut établir la masse réelle.',0));
lines.push(line('marge_pct','Marge relative','100 × marge / Mmax',100*(g.masse.maximum_publie_g-budget)/g.masse.maximum_publie_g,'%','F','Arithmétique sur le budget P.',2));
const cg = items => {
 const m=items.reduce((n,p)=>n+p.g,0);
 return {masse_g:m,x_mm:round(items.reduce((n,p)=>n+p.g*p.position[0],0)/m),y_mm:round(items.reduce((n,p)=>n+p.g*p.position[1],0)/m),z_mm:round(items.reduce((n,p)=>n+p.g*p.position[2],0)/m)};
};
const withModule=cg(posts);
const withoutPosts=posts.filter(p=>p.poste!=='Module avant et arceaux');
if (withoutPosts.length!==posts.length-1) throw new Error('Poste « Module avant et arceaux » non identifié');
const withoutModuleAndArches=cg(withoutPosts);
const front = x => 100*(x-xRear)/g.roues.empattement;
for (const [key,label,data] of [['avec','avec poste avant',withModule],['sans','sans poste avant et arceaux',withoutModuleAndArches]]) {
 lines.push(line(`cg_${key}_x`,`XG ${label}`,'Σ(mᵢ × xᵢ) / Σmᵢ',data.x_mm,'mm','E','Positions et masses proposées ; réserve non localisée exclue.'));
 lines.push(line(`cg_${key}_y`,`YG ${label}`,'Σ(mᵢ × yᵢ) / Σmᵢ',data.y_mm,'mm','E','Symétrie postulée ; aucune mesure.'));
 lines.push(line(`cg_${key}_z`,`ZG ${label}`,'Σ(mᵢ × zᵢ) / Σmᵢ',data.z_mm,'mm','E','Positions et masses proposées ; réserve non localisée exclue.'));
 lines.push(line(`charge_${key}`,`Part statique essieu avant ${label}`,'100 × (XG − 44) / 120',front(data.x_mm),'%','E','Sol plat, deux essieux ; transferts dynamiques et appui des fourches exclus.',1));
 lines.push(line(`ecart_cible_${key}_x`,`Écart XG à la cible ${label}`,'XG − Xcible',data.x_mm-g.cg.cible.x,'mm','E','Cible P ; un écart ne prouve pas la stabilité.'));
 lines.push(line(`ecart_cible_${key}_z`,`Écart ZG à la cible ${label}`,'ZG − Zcible',data.z_mm-g.cg.cible.z,'mm','E','Cible P ; positions réelles à relever.'));
}
const parts=posts.map(p=>({poste:p.poste,g:p.g,position:p.position,part_pct:round(100*p.g/budget,1),statut:'P → F',formule:`100 × ${p.g} / ${budget}`,limite:'Allocation et position proposées, non mesurées.'}));
const checks=[
 {id:'empattement',ok:g.roues.axes_x[1]-xRear===g.roues.empattement,note:'Différence des axes et empattement déclaré.'},
 {id:'hauteur_module',ok:g.module_avant.axe_z+g.module_avant.rayon===g.enveloppe.h,note:'Sommet de l’enveloppe avant et hauteur hors tout.'},
 {id:'largeur_flancs',ok:2*g.flancs.y_abs[1]===g.enveloppe.l,note:'Largeur des flancs et largeur hors tout.'},
 {id:'longueur_sans_fourches',ok:g.module_avant.axe_x+g.module_avant.rayon===g.enveloppe.L_sans_fourches,note:'Extrémité avant du volume réservé.'},
 {id:'budget',ok:budget<=g.masse.maximum_publie_g,note:'Budget sous le maximum publié, sans preuve de conformité.'},
];
const result={meta:{nom:g.meta.nom,equipe:g.meta.equipe,revision:g.meta.revision,date:g.meta.date,source:'config/geometry.json',regles_consultation:g.regles_publiees.consultation,statuts:{F:'arithmétique sur entrées proposées',H:'hypothèse sans mesure',P:'proposition',E:'estimation conditionnelle',V:'à vérifier'}},entrees:{...h,masse_max_g:g.masse.maximum_publie_g,reserve_masse_g:g.masse.reserve_g,x_arriere_mm:xRear,empattement_mm:g.roues.empattement,nb_voies:2,moteurs_par_voie:1},lignes:lines,postes:parts,cg:{avec_poste:withModule,sans_poste_avant_et_arceaux:withoutModuleAndArches,cible:g.cg.cible,limite:'Le poste de 650 g regroupe module avant et arceaux : le seul retrait du module n’est pas calculable depuis ce JSON. Réserve de 250 g exclue faute de position.'},controles:checks};
await writeFile(path.join(dir,'calculs.json'),JSON.stringify(result,null,2)+'\n');
const md=[`# Calculs reproductibles — ${g.meta.nom}`, '',`Source des entrées : \`config/geometry.json\` (${g.meta.date}). Règles publiées consultées ${g.regles_publiees.consultation}. F = arithmétique ; H = hypothèse ; P = proposition ; E = estimation ; V = à vérifier. Aucune estimation ne vaut mesure.`, '',`Entrées H : ${fmt(h.capacite_Ah)} et ${fmt(h.capacite_alt_Ah)} Ah, ${fmt(h.tension_nominale_V)} V, ${fmt(h.courant_moyen_A)} A, ${fmt(h.vitesse_roue_tr_min)} tr/min à la roue, ${fmt(h.poussee_N)} N. Réserve de capacité de ${fmt(100*h.reserve_capacite)} % supposée.`, '', '| Grandeur | Formule | Résultat | Statut | Limite |','|---|---|---:|:---:|---|',...lines.map(x=>`| ${x.libelle} | ${x.formule} | ${fmt(x.valeur)} ${x.unite} | ${x.statut} | ${x.limite} |`),'','## Allocations de masse','',`Dénominateur des parts : ${fmt(budget)} g, réserve comprise. Positions en mm dans le repère du JSON.`, '', '| Poste | Masse | Position X ; Y ; Z | Part ; formule | Statut et limite |','|---|---:|---|---|---|',...parts.map(p=>`| ${p.poste} | ${fmt(p.g)} g | ${p.position.map(fmt).join(' ; ')} | ${fmt(p.part_pct)} % ; ${p.formule} | ${p.statut} ; ${p.limite} |`),`| Réserve non localisée | ${fmt(g.masse.reserve_g)} g | — | ${fmt(round(100*g.masse.reserve_g/budget,1))} % ; 100 × réserve / budget | P → F ; exclue du CG |`,'','## Lecture du centrage','',`Avec poste avant et arceaux : (${fmt(withModule.x_mm)} ; ${fmt(withModule.y_mm)} ; ${fmt(withModule.z_mm)}) mm sur ${fmt(withModule.masse_g)} g ; part statique avant ${fmt(round(front(withModule.x_mm),1))} %. Sans ce poste entier : (${fmt(withoutModuleAndArches.x_mm)} ; ${fmt(withoutModuleAndArches.y_mm)} ; ${fmt(withoutModuleAndArches.z_mm)}) mm sur ${fmt(withoutModuleAndArches.masse_g)} g ; part avant ${fmt(round(front(withoutModuleAndArches.x_mm),1))} %. Cible P : (${g.cg.cible.x} ; ${g.cg.cible.y} ; ${g.cg.cible.z}) mm. La relation de charge est (XG − ${xRear}) / ${g.roues.empattement}.`, '',`**Limite du JSON :** ${result.cg.limite} Le calcul « sans » ne représente donc pas exactement une configuration conservant les arceaux. Les fourches touchent le sol dans la maquette : leur effet éventuel sur les appuis est également omis.`, '', '## Écarts documentaires et contrôles', '',`S0 annonce 3 850 g en couverture, puis 3 990 g « homologués » et « mesurés » dans son tableau ; les ${fmt(19)} postes non nuls de ce tableau totalisent 3 990 g, mais aucune preuve de pesée n’est fournie. Le récapitulatif reprend 3 990 g et 0 g de lest. R1/R1.1 remplacent ces prétentions par ${fmt(sum)} g d’allocations et ${fmt(g.masse.reserve_g)} g de réserve, soit ${fmt(budget)} g. Leur mention de 1 586 g de lest provient d’une autre base du rapport initial ; elle ne se retrouve pas dans le tableau S0 présent. La différence de version doit être clarifiée.`, '',`R1/R1.1 utilisent quatre moteurs et l’enveloppe 320 × 280 × 100 mm. R2 représente deux motoréducteurs et une enveloppe ${g.enveloppe.L} × ${g.enveloppe.l} × ${g.enveloppe.h} mm. Les valeurs R1/R1.1 de 5 min idéales, 4 min avec réserve, 14,4 A, 1,875 Ah, 22,2 Wh, 1,73 m/s et µ ≈ 1,19 restent cohérentes pour le cas 1,5 Ah et leurs hypothèses ; 1,875 Ah s’arrondit à 1,9 Ah pour un choix de pack. Les 480 s de la procédure S0 valent 8 min, et non 7 min 40 s ; aucune durée entre matchs n’est publiée dans les règles consultées.`, '',`Le CG estimé de R1.1, (172 ; 0 ; 37) mm, reposait sur une autre implantation (essieu arrière X = 70 mm, empattement 165 mm). Il n’est pas directement comparable au CG R2 dans son repère et sa géométrie. La R2 prend X arrière = ${xRear} mm, empattement = ${g.roues.empattement} mm, et des allocations localisées proposées.`, '',`Contrôles géométriques automatiques : ${checks.map(c=>`${c.id} ${c.ok?'OK':'ÉCHEC'}`).join(' ; ')}. Ces contrôles ne démontrent pas les jeux, la disponibilité des pièces ou la faisabilité. Le volume batterie a été réduit par rapport à la maquette et doit être confronté au pack choisi ; les 650 g du poste avant et arceaux ne décrivent pas la masse d’une pièce existante.`, ''].join('\n');
await writeFile(path.join(dir,'calculs.md'),md);
console.log('Calculs générés : docs/calculs.json et docs/calculs.md');
