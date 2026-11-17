import { writeFile } from 'node:fs/promises';
import { g, span, mid, fmt, volumes, limites, jeux } from './geometrie.mjs';

const eps=1e-9, equal=(a,b)=>Math.abs(a-b)<eps;
const vs=volumes(), bounds=limites(vs), j=jeux(), checks=[];
const check=(label,ok,result,comment)=>checks.push({label,ok,result,comment});
const tuple=a=>a.map(fmt).join(' ; ');
const e=g.enveloppe, c=g.caisson, w=g.roues, m=g.motoreducteurs;
check('Enveloppe réellement atteinte',equal(bounds.x[0],0)&&equal(bounds.x[1],e.L)&&equal(bounds.y[0],-e.l/2)&&equal(bounds.y[1],e.l/2)&&equal(bounds.z[0],0)&&equal(bounds.z[1],e.h),`${fmt(span(bounds.x))} × ${fmt(span(bounds.y))} × ${fmt(span(bounds.z))} mm`,`X [${tuple(bounds.x)}], Y [${tuple(bounds.y)}], Z [${tuple(bounds.z)}]. Arrière 03, avant 07, largeur 03, sol 02, sommet 08.`);
check('Jeu roue / caisson',j.roueCaisson>0,`${fmt(j.roueCaisson)} mm`,`voie_y − largeur_roue/2 − Y_caisson_max ; quatre roues, symétrie G/D. Jeu faible : contrôle V2.`);
check('Jeu roue / protection',j.roueProtection>0,`${fmt(j.roueProtection)} mm`,'Y_intérieur_flanc − voie_y − largeur_roue/2 ; quatre roues. Le jeu se mesure au bord intérieur du flanc.');
check('Motoréducteur avant / paroi avant',j.moteurAvant>0,`${fmt(j.moteurAvant)} mm`,'X_caisson_max − épaisseur_paroi − X_axe_avant − Ø_moteur/2 ; confirme les 4,5 mm R1.1.');
for(const [k,v] of [['plancher',c.plancher.z[0]],['pods',g.pods.z[0]],['protections',Math.min(g.protections.flancs.z[0],g.protections.arriere.z[0])]]) check(`Garde au sol ${k}`,equal(v,g.garde_sol[k])&&v>0,`${fmt(v)} mm`,`Dessous du solide comparé à garde_sol.${k} = ${fmt(g.garde_sol[k])} ${g.garde_sol.statut}.`);
const offWheels=vs.filter(v=>!v.roue), minZ=Math.min(...offWheels.map(v=>v.z[0]));
check('Garde minimale hors roues',minZ>0,`${fmt(minZ)} mm`,offWheels.filter(v=>equal(v.z[0],minZ)).map(v=>v.id).join(', '));
check('Roues tangentes au sol',equal(w.axe_z-w.diametre/2,0),`Z bas = ${fmt(w.axe_z-w.diametre/2)} mm`,'Tangence, sans pénétration du sol.');
for(const [name,a,b] of [
  ['Empattement déclaré',w.empattement,Math.max(...w.axes_x)-Math.min(...w.axes_x)],
  ['Voie déclarée',w.voie,2*w.voie_y],
  ['Largeur roues déclarée',w.largeur_hors_tout,2*w.voie_y+w.largeur],
  ['Longueur motoréducteur déclarée',m.enveloppe_longueur,m.y_paroi-m.y_interieur],
  ['Épaisseur de plancher déclarée',c.plancher.epaisseur,span(c.plancher.z)],
  ['Capot posé sur caisson',g.capot.z[0],c.z[1]],
  ['Sectionnement posé sur capot',g.sectionnement.z[0],g.capot.z[1]],
]) check(name,equal(a,b),`${fmt(a)} / ${fmt(b)} mm`,'Valeur déclarée / valeur recomposée depuis les bornes.');
check('Volumes valides',vs.every(v=>['x','y','z'].every(k=>span(v[k])>0)),`${vs.length} solides`,'Boîtes d’épaisseur strictement positive, caisson décomposé en plancher et quatre parois, sans double compte aux coins.');
check('Rayons pods compatibles',g.pods.rayon>0&&2*g.pods.rayon<=Math.min(span(g.pods.x),span(g.pods.y_abs)),`R${fmt(g.pods.rayon)}`,'Rayon en plan XY seulement ; les silhouettes XZ et YZ restent rectangulaires.');

let pairs=0;const overlaps=[],contacts=[];
for(let a=0;a<vs.length;a++)for(let b=a+1;b<vs.length;b++){
  pairs++;
  const p=vs[a],q=vs[b],d=['x','y','z'].map(k=>Math.min(p[k][1],q[k][1])-Math.max(p[k][0],q[k][0]));
  if(d.every(x=>x>eps)) overlaps.push({a:p.id,b:q.id,d});
  else if(d.every(x=>x>=-eps)&&d.some(x=>Math.abs(x)<eps)) contacts.push({a:p.id,b:q.id,d});
}
check('Interférences entre boîtes englobantes',overlaps.length===0,`${overlaps.length} recouvrement(s) / ${pairs} paires`,'Toutes les paires, y compris entretoises PV ; cylindres et pods arrondis approximés par leurs boîtes. Contacts sans pénétration comptés séparément.');

const mass=g.masse.postes.reduce((s,p)=>s+p.g,0);
const cg=[0,1,2].map(k=>g.masse.postes.reduce((s,p)=>s+p.g*p.position[k],0)/mass);
const published=[g.cg.estimation_R1_1.x,g.cg.estimation_R1_1.y,g.cg.estimation_R1_1.z];
const cgAgrees=cg.every((x,k)=>Math.round(x)===published[k]);
const cgDelta=cg.map((x,k)=>x-published[k]);
check('Budget de masse',mass+g.masse.reserve_g<=g.masse.maximum_publie_g,`${fmt(mass)} + ${fmt(g.masse.reserve_g)} = ${fmt(mass+g.masse.reserve_g)} g`,'Allocation et réserve, sans masse mesurée ; la réserve n’a aucune position et est exclue du CG.');

const failures=checks.filter(c=>!c.ok);
let md=`# Contrôle de cohérence — ${g.meta.projet}\n\nRévision ${g.meta.revision} — ${g.meta.date} — unité : ${g.meta.unite}.\n\nSource unique : [geometry.json](../config/geometry.json), lu sans modification. Génération : \`node plans/generer_plans.mjs\` ; contrôle : \`node plans/controle_coherence.mjs\`. Les scripts fonctionnent depuis tout répertoire courant.\n\n`;
md+=`**Bilan géométrique : ${failures.length ? `${failures.length} contrôle(s) en échec` : 'tous les contrôles passent'} ; ${overlaps.length} interférence positive sur ${pairs} paires de ${vs.length} solides.** Ces résultats concernent les volumes conceptuels, sans tolérance, câble, fixation ni déformation.\n\n`;
md+='## Résultats calculés\n\n| Contrôle | État | Résultat | Commentaire |\n|---|---|---|---|\n';
md+=checks.map(c=>`| ${c.label} | ${c.ok?'OK':'ÉCHEC'} | ${c.result} | ${c.comment} |`).join('\n')+'\n\n';
md+='## Méthode et périmètre\n\nLe caisson est creux : son enveloppe globale ne représente pas de la matière. Le contrôle utilise un plancher et quatre parois disjointes, ainsi que le capot posé, les quatre roues, quatre motoréducteurs, trois panneaux du U, quatre entretoises PV, batterie, commande, deux contrôleurs, deux pods, volume 08 et accès 09. Les entretoises suivent Y entre la face externe du caisson et la face interne des protections. Leur diamètre et leurs positions proviennent du JSON.\n\nPour chaque paire, la pénétration sur chaque axe vaut `min(maxA,maxB) − max(minA,minB)`. Une interférence exige trois valeurs strictement positives (tolérance numérique 10⁻⁹ mm). Un zéro est un contact, une valeur négative un intervalle libre. Les cylindres selon Y et les pods R10 sont remplacés par leurs boîtes : méthode conservative, susceptible de signaler des faux positifs. Aucune paire n’est ignorée. L’option de levage n’est ni dessinée ni intégrée : elle est une variante exclue de la configuration de référence. Le volume 08 est uniquement réservé, sans mécanisme.\n\n';
md+='### Interférences positives\n\n';
md+=overlaps.length?'| Solide A | Solide B | Pénétrations X ; Y ; Z (mm) |\n|---|---|---|\n'+overlaps.map(o=>`| ${o.a} | ${o.b} | ${tuple(o.d)} |`).join('\n')+'\n\n':'Aucune.\n\n';
md+=`### Contacts sans pénétration (${contacts.length})\n\nLes contacts d’assemblage (plancher/parois, capot/parois, entretoises/flancs, pods/face avant, 09/capot) ne sont pas des interférences positives. Ils ne prouvent ni une fixation ni une continuité mécanique.\n\n| Solide A | Solide B | Recouvrements X ; Y ; Z (mm) |\n|---|---|---|\n`;
md+=contacts.map(o=>`| ${o.a} | ${o.b} | ${tuple(o.d)} |`).join('\n')+'\n\n';
md+='## Incohérences et limites du JSON / des sources\n\n';
md+=`- **CG publié R1.1 non reproduit par les allocations du JSON.** Les postes totalisent ${fmt(mass)} g et donnent (${tuple(cg)}) mm E, hors réserve, contre (${tuple(published)}) mm E publiés. Écart calculé − publié : (${tuple(cgDelta)}) mm. ${cgAgrees?'Accord à l’arrondi au millimètre.':'Le désaccord subsiste à l’arrondi au millimètre.'} Le JSON indique lui-même que le placement exact des masses n’est pas documenté. La planche conserve le disque publié R1.1, conformément au brief ; elle ne le présente pas comme le résultat du calcul reproductible.\n`;
md+=`- **Capot : statut mixte.** Le champ global est ${g.capot.statut}, mais sa note classe l’épaisseur ${fmt(span(g.capot.z))} mm en PV. La hauteur ${fmt(g.capot.z[1])} mm est cotée ${g.capot.statut} ; aucune épaisseur n’est cotée P sur la planche.\n`;
// La valeur historique provient des textes fournis, et ne définit aucun dessin.
const oldAxis=240,oldGap=c.x[1]-c.paroi-oldAxis-m.enveloppe_diametre/2;
md+=`- **Correction historique moteur/paroi annoncée en R1.1 §4.** Avec l’ancien axe X = ${oldAxis} mm du rapport R1, les mêmes bornes et parois donnent ${fmt(oldGap)} mm, donc ${fmt(-oldGap)} mm de pénétration, et non les 1,5 mm annoncés. Le jeu actuel ${fmt(j.moteurAvant)} mm est cohérent. Ni le JSON ni les sources ne sont corrigés par ces scripts.\n`;
md+='- Le matériau, les supports moteurs et les liaisons au caisson restent à définir. Le jeu entre enveloppe moteur et roue ne constitue pas une géométrie d’arbre ou de transmission. Les gardes nominales ne valident pas le comportement sur le sol réel.\n\n';
md+='## Divergences R1 → R1.1 relevées\n\nSources locales : [rapport R1, §2 et §4](../sources/HOTLINE_MK-II_Rapport_final.txt) ; [dossier R1.1, §2 et §4](../sources/HOTLINE_MK-II_Dossier_R1-1.txt). Les valeurs R1 ci-dessous sont des citations de contexte, et ne pilotent jamais le dessin.\n\n| Sujet | R1 | R1.1 / JSON courant |\n|---|---|---|\n';
md+=`| Axe avant / empattement | X = 240 / 170 mm | X = ${fmt(Math.max(...w.axes_x))} / ${fmt(w.empattement)} mm ; axe arrière inchangé à ${fmt(Math.min(...w.axes_x))} |\n`;
md+=`| Jeu moteur avant / paroi | Avec les bornes actuelles : ${fmt(oldGap)} mm ; R1.1 relate −1,5 mm | ${fmt(j.moteurAvant)} mm ; divergence historique explicitée ci-dessus |\n`;
md+=`| Extrémité arrière | 25 mm vides dans l’enveloppe annoncée | Panneau arrière X ${tuple(g.protections.arriere.x)} ; U fermé à l’arrière |\n`;
md+=`| Flancs | Roues avant dépassant les protections, selon la revue R1.1 | X ${tuple(g.protections.flancs.x)} ; épaisseur ${fmt(span(g.protections.flancs.y_abs))} mm |\n`;
md+=`| Jeu extérieur au pneu | 12,5 mm annoncés jusqu’à Y extrême ±140, sans distinguer épaisseur / jeu libre | ${fmt(j.roueProtection)} mm libres jusqu’à Y = ±${fmt(g.protections.flancs.y_abs[0])} ; ${fmt(g.protections.flancs.y_abs[1]-w.largeur_hors_tout/2)} mm jusqu’au bord extérieur |\n`;
md+='| Vue de côté | Protection latérale omise, selon R1.1 §4 | Flanc au premier plan ; roues et moteurs derrière en interrompus |\n';
md+=`| Contrôleurs | Décrits latéraux, dessinés au centre, selon R1.1 §4 | Deux volumes X ${tuple(g.controleurs.x)}, abs(Y) ${tuple(g.controleurs.y_abs)}, Z ${tuple(g.controleurs.z)} |\n`;
md+=`| Pods | X 255–315 selon la source du champ pods | X ${tuple(g.pods.x)} ; avant réel à ${fmt(g.pods.x[1])} ; R${fmt(g.pods.rayon)} |\n`;
md+=`| Centre de gravité | Cible (${tuple([g.cg.cible.x,g.cg.cible.y,g.cg.cible.z])}) ; aucun CG calculable revendiqué | Estimation publiée (${tuple(published)}) E ; calcul des allocations R2 distinct (${tuple(cg)}) E |\n`;
md+='\nLes cotes P/H/V décrivent une proposition ou une hypothèse. Un calcul géométrique conforme n’est ni un essai ni une autorisation de fabrication. La présente revue ne vérifie pas les règles de compétition externes.\n';
await writeFile(new URL('controle_coherence.md',import.meta.url),md);
console.log(`${checks.length-failures.length}/${checks.length} contrôles géométriques OK ; ${vs.length} solides ; ${pairs} paires ; ${overlaps.length} interférence ; ${contacts.length} contacts.`);
console.log(`CG allocations : (${tuple(cg)}) mm ; CG publié : (${tuple(published)}) mm. Rapport : plans/controle_coherence.md`);
if(failures.length)process.exitCode=1;
