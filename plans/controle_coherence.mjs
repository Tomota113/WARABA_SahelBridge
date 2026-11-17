import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { g, span, fmt, volumes, limites, jeux, rectXZ, area, intersectionArea, interference, expectedOverlap, retraitPlatine, ouiesXY, enveloppesCourroies } from './geometrie.mjs';

// Aucune correction du JSON : les anomalies sont consignées et rendent le contrôle non nul.
const vs=volumes(),bounds=limites(vs),j=jeux(),errors=[],checks=[];
const equal=(a,b)=>Math.abs(a-b)<1e-6;
function check(label,ok,detail='') {checks.push({label,ok,detail});if(!ok)errors.push(`${label}${detail?' : '+detail:''}`);}
const xyztxt=a=>a.map(fmt).join(' × ');
const cell=x=>String(x).replaceAll('|','\\|');
const table=(headers,rows)=>`| ${headers.map(cell).join(' | ')} |\n| ${headers.map(()=>'---').join(' | ')} |\n${rows.map(r=>`| ${r.map(cell).join(' | ')} |`).join('\n')}\n`;
const bullets=rows=>rows.map(x=>`- ${x}`).join('\n');

// Vérifications indépendantes de cas discriminants : creux concaves et trous ne
// doivent pas être assimilés à leurs boîtes englobantes.
const concave=[[0,0],[3,0],[3,1],[1,1],[1,3],[0,3]];
assert(equal(intersectionArea(concave,rectXZ([1.5,2.5],[1.5,2.5])),0));
assert(equal(intersectionArea(concave,rectXZ([0,3],[0,3])),5));
const hollow={id:'test',p:rectXZ([0,4],[0,4]),holes:[rectXZ([1,3],[1,3])],x:[0,4],y:[0,1],z:[0,4]};
const withinHole={p:rectXZ([1.5,2.5],[1.5,2.5]),x:[1.5,2.5],y:[0,1],z:[1.5,2.5]};
assert.equal(interference(hollow,withinHole),null);
check('Algorithme : profils concaves et évidements',true);

for(const v of vs) {
  check(`Volume ${v.id} valide`,['x','y','z'].every(k=>v[k].every(Number.isFinite)&&span(v[k])>0)&&area(v.p)>0);
  for(const h of v.holes??[])check(`Évidement contenu dans ${v.id}`,equal(intersectionArea(v.p,h),area(h)));
  if(v.pxy) {
    check(`Trapèze XY de ${v.id} valide`,area(v.pxy)>0&&v.pxy.every(([x,y])=>x>=v.x[0]&&x<=v.x[1]&&y>=v.y[0]&&y<=v.y[1]));
    for(const h of v.holesXY??[])check(`Ajour XY contenu dans ${v.id}`,equal(intersectionArea(v.pxy,h),area(h)));
    check(`Retrait extérieur de ${v.id}`,equal(v.pxy[1][0]-v.pxy[2][0],retraitPlatine)&&equal(v.pxy[3][0]-v.pxy[0][0],retraitPlatine));
  }
}
const platines=vs.filter(v=>v.pxy),courroies=enveloppesCourroies();
check('Deux platines symétriques en ±Y',platines.length===2&&platines[0].pxy.every(([x,y],i)=>equal(x,platines[1].pxy[i][0])&&equal(y,-platines[1].pxy[i][1]))
  &&platines[0].holesXY[0].every(([x,y],i)=>equal(x,platines[1].holesXY[0][i][0])&&equal(y,-platines[1].holesXY[0][i][1])));
const platineChecks=[];
for(const p of platines)for(const v of [...vs.filter(v=>v.wheel||v.id.startsWith('rail-')),...courroies]) {
  const gap=Object.fromEntries(['x','y','z'].map(k=>[k,Math.max(p[k][0]-v[k][1],v[k][0]-p[k][1])]));
  const ok=Object.values(gap).some(d=>d>=-1e-8);
  check(`${p.id} / ${v.id} sans interférence (enveloppes pleines)`,ok);
  if(Math.sign(p.y[0])===Math.sign(v.y[0]))platineChecks.push([p.id,v.id,...['x','y','z'].map(k=>fmt(gap[k])),ok?'dégagé / tangent':'INTERFÉRENCE POTENTIELLE']);
}
const bump=g.pare_chocs;
check('Pare-chocs : bleu puis noir, sans lacune en Z',equal(bump.z_bleu[0],bump.z[0])&&bump.z_bleu[1]>bump.z_bleu[0]&&bump.z_bleu[1]<bump.z[1]);
const vents=ouiesXY(),vent=g.capot.ouies;
check('Ouïes : nombre, largeur et pas valides',Number.isInteger(vent.n)&&vent.n>0&&vent.largeur>0&&vent.pas>vent.largeur&&vents.length===2*vent.n);
for(const [i,p] of vents.entries())check(`Ouïe ${i+1} contenue dans le capot XY`,equal(intersectionArea(p,rectXZ(g.capot.x,g.capot.y)),area(p)));
const attained=[span(bounds.x),span(bounds.y),span(bounds.z)];
check('Enveloppe hors tout atteinte',attained.every((x,i)=>equal(x,[g.enveloppe.L,g.enveloppe.l,g.enveloppe.h][i])),`${xyztxt(attained)} mm`);
check('Origine au sol / symétrie / arrière du pare-chocs',equal(bounds.x[0],0)&&equal(bounds.z[0],0)&&equal(bounds.y[0],-bounds.y[1]));
const noForks=limites(vs.filter(v=>v.rep!=='12'));
check('Longueur sans fourches',equal(span(noForks.x),g.enveloppe.L_sans_fourches),`${fmt(span(noForks.x))} mm`);
check('Empattement et axes X',equal(span(g.roues.axes_x),g.roues.empattement));
check('Voie et centres Y',equal(2*g.roues.voie_y,g.roues.voie));
check('Nombre de motoréducteurs',equal(vs.filter(v=>v.id.startsWith('moteur-')).length,g.transmission.moteurs.nombre));
check('Roues tangentes au sol',equal(g.roues.axe_z-g.roues.diametre/2,0));
for(const [key,value] of Object.entries(j))check(`Jeu ${key} positif`,value>0,`${fmt(value)} mm`);
const guardValues={plancher:g.chassis.plancher.z[0],pods:g.pods.z[0],flancs:Math.min(...g.flancs.profil_xz.map(p=>p[1])),fourches:Math.min(...g.fourches.profil_xz.map(p=>p[1]))};
for(const [k,v] of Object.entries(guardValues))check(`Garde au sol ${k}`,equal(v,g.garde_sol[k]),`${fmt(v)} mm`);

const overlaps=[],contacts=[],boxFalsePositives=[];
for(let a=0;a<vs.length;a++)for(let b=a+1;b<vs.length;b++) {
  const va=vs[a],vb=vs[b];
  const ds=['x','y','z'].map(k=>Math.min(va[k][1],vb[k][1])-Math.max(va[k][0],vb[k][0]));
  if(ds.every(x=>x>=0)&&ds.some(x=>equal(x,0)))contacts.push([va.id,vb.id]);
  if(!ds.every(x=>x>0))continue;
  const o=interference(va,vb);
  if(o) {
    const reason=expectedOverlap(va,vb);
    overlaps.push({a:va.id,b:vb.id,...o,reason});
    if(!reason)errors.push(`${o.conservative?'Interférence potentielle (enveloppe conservatrice)':'Interférence non prévue'} : ${va.id} / ${vb.id}, ${fmt(o.volume)} mm³`);
  }else boxFalsePositives.push([va.id,vb.id]);
}
const unexpected=overlaps.filter(o=>!o.reason);
check('Interférences non prévues',unexpected.length===0,`${unexpected.length}`);
const svgNames=['vue_dessus','vue_cote','vue_face','vue_ensemble','variante_levage','planche_A3'];
for(const name of svgNames) {
  try {
    const source=await readFile(new URL(`svg/${name}.svg`,import.meta.url),'utf8');
    check(`SVG ${name} présent et nommé depuis meta.nom`,source.includes(`${g.meta.nom} —`));
    check(`SVG ${name} sans coordonnées invalides`,!/(?:NaN|Infinity|undefined)/.test(source));
    check(`SVG ${name} sans ancien nom`,!source.includes('HOTLINE'));
    if(['vue_dessus','vue_cote','vue_face','vue_ensemble','planche_A3'].includes(name)) {
      for(const side of name==='vue_cote'?['D']:['G','D'])check(`SVG ${name} : platine ${side} représentée`,source.includes(`data-piece="platine-${side}"`));
    }
    if(['vue_dessus','vue_ensemble','planche_A3'].includes(name))check(`SVG ${name} : ouïes du capot fantôme`,
      (source.match(/data-piece="ouie-capot"/g)??[]).length===vents.length*(name==='planche_A3'?2:1));
    if(['vue_cote','vue_ensemble','planche_A3'].includes(name))check(`SVG ${name} : pare-chocs bicolore`,
      source.includes('data-piece="pare-chocs-bleu"')&&source.includes('data-piece="pare-chocs-noir"'));
    if(name==='planche_A3')check('Format A3 paysage',source.includes('width="420mm" height="297mm" viewBox="0 0 420 297"'));
  }catch(e){check(`SVG ${name} disponible`,false,e.message);}
}
const xmlLint=spawnSync('xmllint',['--noout',...svgNames.map(name=>new URL(`svg/${name}.svg`,import.meta.url).pathname)],{encoding:'utf8'});
const xmlStatus=xmlLint.error?.code==='ENOENT'
  ? 'L’exécutable xmllint est absent de cet environnement. Repli fourni : python plans/valider_rendu.py valide les six fichiers avec libxml2 (même moteur XML), puis les rend sans navigateur.'
  : xmlLint.status===0?'Commande xmllint --noout : les six SVG sont valides.':`Échec xmllint : ${xmlLint.stderr||xmlLint.error?.message}`;
if(!xmlLint.error&&xmlLint.status!==0)errors.push(xmlStatus);
const jsonBytes=await readFile(new URL('../config/geometry.json',import.meta.url));
const sha=createHash('sha256').update(jsonBytes).digest('hex');
const original=await readFile(new URL('../sources/coequipier/Maquette_Detaillee_Bot.html',import.meta.url),'utf8');
const sourceLines=original.split(/\r?\n/);
function ref(needle) {
  const index=sourceLines.findIndex(s=>s.includes(needle));
  if(index<0)throw new Error(`Référence source introuvable : ${needle}`);
  return `[maquette, ligne ${index+1}](../sources/coequipier/Maquette_Detaillee_Bot.html#L${index+1})`;
}
const wheel=g.roues,cap=g.capot,ar=g.arceaux,mod=g.module_avant;
const date=g.meta.date.split('-').reverse().join('/');
const scalarRows=[
  ['Roue / pod avant, G et D',`${fmt(g.pods.x[0])} − (${fmt(Math.max(...wheel.axes_x))} + ${fmt(wheel.diametre/2)})`,j.rouePod,'P / H'],
  ['Roue / rail intérieur, G et D',`${fmt(wheel.voie_y-wheel.largeur/2)} − ${fmt(g.chassis.rails_int.y_abs[1])}`,j.roueRail,'E (M / H)'],
  ['Roue / flanc extérieur, G et D',`${fmt(g.flancs.y_abs[0])} − ${fmt(wheel.voie_y+wheel.largeur/2)}`,j.roueFlanc,'E (M / H)'],
  ['Poulie / roue, G et D',`${fmt(wheel.voie_y-wheel.largeur/2)} − ${fmt(g.transmission.poulies.y_abs[1])}`,j.poulieRoue,'E (M / H)'],
  ['Poulie / rail intérieur, G et D',`${fmt(g.transmission.poulies.y_abs[0])} − ${fmt(g.chassis.rails_int.y_abs[1])}`,j.poulieRail,'E (M)'],
  ['08 / arceau, de chaque côté',`${fmt(ar.y_abs[0])} − ${fmt(mod.y_abs)}`,j.moduleArceau,'E (M)'],
  ['08 / capot, séparation des projections sur X',`${fmt(mod.axe_x)} − ${fmt(mod.rayon)} − ${fmt(cap.x[1])}`,j.moduleCapotAxial,'E (M / P)'],
  ['08 / capot, distance géométrique minimale',`√[(${fmt(mod.axe_x)} − ${fmt(cap.x[1])})² + (${fmt(mod.axe_z)} − ${fmt(cap.z[1])})²] − ${fmt(mod.rayon)}`,j.moduleCapotReel,'E (M / P)'],
  ['08 / sol',`${fmt(mod.axe_z)} − ${fmt(mod.rayon)}`,j.moduleSol,'E (M)'],
  ['Batterie / motoréducteurs, séparation sur X','début des cylindres moteurs − fin du pack',j.batterieMoteur,'E (M / P)'],
  ['Batterie / dessous du capot',`${fmt(cap.z[0])} − ${fmt(g.batterie.z[1])}`,j.batterieCapot,'E (P)'],
];
const corrections=[
  ['Pods / roue avant',`Pod de la maquette à X=189 ; roue avant jusqu’à 191,5 : pénétration de 2,5. R2 : pod dès X=${fmt(g.pods.x[0])}, jeu ${fmt(j.rouePod)}.`,ref('podGroup.position.set')],
  ['Planchers latéraux dans les roues',`Semelles 185 × 5 × 36, centrées transversalement à ±88 et à Z=10 ; elles traversent les pneus. R2 : semelles supprimées, plancher central limité à Y=±${fmt(g.chassis.plancher.y[1])}.`,ref('const sideFloor =')],
  ['Poulies dans les roues',`Maquette : poulies aux essieux centrées à |Y|=85, largeur 8 (81–89), pneus 82–102 : recouvrement transversal 7. R2 : poulies ${g.transmission.poulies.y_abs.map(fmt).join('–')}, pneus ${fmt(wheel.voie_y-wheel.largeur/2)}–${fmt(wheel.voie_y+wheel.largeur/2)} ; jeu ${fmt(j.poulieRoue)}. La poulie motrice centrale était dans le même couloir transversal, mais séparée des pneus en X.`,ref('const whPulleyGeo =')],
  ['Arceaux dans les rails',`Maquette : rail |Y|=67–73 ; arceau 70–78, soit 3 de recouvrement latéral, base Z=38 dans le rail montant à 44. R2 : même plan transversal ${ar.y_abs.map(fmt).join('–')}, base Z=${fmt(Math.min(...ar.profil_xz.map(p=>p[1])))} ; appui sur les rails, sans pénétration.`,ref('aFrameShape.moveTo')],
  ['Batterie dans les moteurs',`Maquette : pack X=−107,5…−22,5, moteur centré X=−25, rayon 11 ; recouvrement de boîtes de 13,5 en X, avec intersection réelle du cylindre. R2 : pack ${g.batterie.x.map(fmt).join('–')} et moteurs dès ${fmt(g.transmission.moteurs.x-g.transmission.moteurs.diametre/2)}, jeu ${fmt(j.batterieMoteur)}.`,ref('const lipoMesh =')],
  ['Capot incliné',`Maquette : dessus incliné 48→38 et dessous 44→34 ; au droit de la batterie son dessous descend jusqu’à environ 37,6 alors que le pack monte à 38. R2 : capot plat Z=${cap.z.map(fmt).join('–')}, batterie jusqu’à ${fmt(g.batterie.z[1])}, jeu ${fmt(j.batterieCapot)}.`,ref('topShape.moveTo')],
];
const drawingErrors=[
  ['Cotes de dessus contradictoires',`Châssis 280, longueur totale 420 et largeur 250 annoncés ; R2 : longueur sans fourches ${fmt(g.enveloppe.L_sans_fourches)}, totale ${fmt(g.enveloppe.L)}, largeur ${fmt(g.enveloppe.l)}. La cote 280 ne correspond pas au plancher central de ${fmt(span(g.chassis.plancher.x))}.`,ref('<!-- Longueur Châssis (280mm) -->')],
  ['Échelle de dessus incohérente',`Segments SVG : 310 px pour 280 mm, 525 px pour 420 mm, 300 px pour 250 mm. Rapports respectifs ${fmt(310/280)}, ${fmt(525/420)}, ${fmt(300/250)} px/mm : aucune échelle commune, malgré le cartouche « 1:2.5 ISO ». Nos SVG ont des dimensions physiques en mm.`,ref('Échelle: 1:2.5 ISO')],
  ['Empattement du profil',`Le plan indique 190, mais les centres de la 3D sont à X=−85 et +35, soit ${fmt(wheel.empattement)}. Le dessin utilise 190 px entre centres et 80 px pour Ø55 : ses cotes ne suivent pas une même échelle.`,ref('<!-- Empattement 4WD (190 mm) -->')],
  ['Hauteur du profil',`Cote 145 rattachée à Y=230, sans sommet correspondant : l’arceau dessiné culmine à Y=325 et son enveloppe circulaire à Y=270. R2 distingue arceau ${fmt(Math.max(...ar.profil_xz.map(p=>p[1])))}, caisse ${fmt(cap.z[1])} et hauteur totale ${fmt(g.enveloppe.h)}.`,ref('<!-- Hauteur Montant d\'Arme (145 mm) -->')],
  ['Voie confondue avec largeur',`La face annonce « voie totale 250 » en cotant les bords externes des pneus ; ce n’est pas une voie entre centres. La 3D place les roues à ±92, voie 184 ; R2 les recentre à ±${fmt(wheel.voie_y)}, voie ${fmt(wheel.voie)}, hors-tout flancs ${fmt(g.enveloppe.l)}.`,ref('<!-- Voie totale (250 mm) -->')],
  ['Projections incompatibles des arceaux et des pods',`Les arceaux de profil sont des quadrilatères bas, ceux de face des rectangles hauts ; aucun ne projette le profil triangulaire ajouré de la 3D. En face les pods sont fortement décalés vers le centre par rapport aux roues, contrairement à la 3D. R2 projette partout les mêmes profils extrudés.`,ref('<!-- Montant G (X=360 à 380) -->')],
  ['Flancs et occultation des roues',`Les plans ajoutent des arches au-dessus des roues et un flanc crénelé à trou triangulaire, absents du profil 3D incliné. Les roues de profil sont masquées sans arcs cachés ; au-dessus le caisson empiète sur les pneus. R2 montre leurs parties libres, leurs arcs cachés interrompus et les flancs sans arches ajoutées.`,ref('<!-- Arches supérieures couvrant les pneus gauches -->')],
  ['Module avant : largeur et garde au sol',`Les planches annoncent une largeur 118, tandis que la 3D donne une portée transversale 112. Le profil annonce 22 de garde, mais l’axe 3D Z=${fmt(mod.axe_z)} et le rayon ${fmt(mod.rayon)} donnent ${fmt(j.moduleSol)}. R2 conserve seulement l’enveloppe Ø${fmt(2*mod.rayon)} × ${fmt(2*mod.y_abs)} et son axe.`,ref('Garde au sol arme: 22 mm')],
  ['Dégagement du capot non justifié',`« Jeu 11 mm » est affirmé sur la vue de dessus sans projection homogène ni calcul. R2 distingue ${fmt(j.moduleCapotAxial)} sur X, ${fmt(j.moduleCapotReel)} de distance réelle au capot et ${fmt(j.moduleArceau)} par côté entre module et arceaux.`,ref('Échancrure Capot : Dégagement Batteur (Jeu 11 mm)')],
  ['Repères et éclaté non homogènes',`Le capot porte [1] dans l’éclaté mais le repère 1 de sa nomenclature désigne un autre sous-ensemble ; les quatre roues y sont des disques dans un même plan plutôt qu’une projection des volumes. R2 utilise la même géométrie et les repères 01–12 du brief.`,ref('[1] Capot Texturé')],
  ['Cartouches sans preuve',`Ancien nom, équipe « MaliBots 2026 », « homologation DoniFab » et masse « 3 990 g » présentés comme acquis. R2 lit nom et équipe dans le JSON et porte explicitement le statut conceptuel et provisoire ; aucune homologation ni pesée n’est déduite des dessins.`,ref('Homologation: DoniFab')],
];
const report=`# Contrôle de cohérence — ${g.meta.nom} / ${g.meta.equipe} — ${g.meta.revision}

Date de référence : **${date}**, issue du JSON (date de la planche conservée même lors d’une exécution ultérieure). Unité : **${g.meta.unite}**.

**Résultat : ${errors.length?errors.length+' anomalie(s) bloquante(s)':'aucune interférence non prévue dans les volumes modélisés'}.** ${checks.filter(x=>x.ok).length}/${checks.length} vérifications satisfaites. Enveloppe atteinte : **${xyztxt(attained)} mm**. Le JSON n’est pas modifié.

## Source et méthode

- Source unique : [config/geometry.json](../config/geometry.json), empreinte SHA-256 \`${sha}\`.
- ${g.meta.repere}
- ${vs.length} volumes : boîtes, profils XZ extrudés en Y, cylindres d’axe Y et platines XY extrudées en Z. Paires contrôlées : ${vs.length*(vs.length-1)/2}. Présence du capot et du coupe-circuit incluse dans le contrôle, même lorsque le dessin retire le capot.
- Les boîtes servent au préfiltrage ; l’intersection réelle approchée utilise les profils concaves triangulés et soustrait l’évidement des arceaux. Les cercles sont discrétisés en 128 segments, erreur radiale maximale sur 08 : ${fmt(mod.rayon*(1-Math.cos(Math.PI/128)))} mm. Les jeux du tableau sont calculés analytiquement, sans discrétisation.
- La poulie motrice est supposée coaxiale au moteur et les autres aux roues. Courroies : tracé de principe à la largeur des poulies. Pour le contrôle des platines, on utilise une enveloppe pleine englobant les poulies et les brins : aucun passage dans le vide central de la transmission n’est invoqué pour conclure au dégagement. Leur épaisseur, leur tension et leur routage réel ne sont pas validés.
- Les platines sont dessinées avec leur trapèze XY, un retrait extérieur de ${fmt(retraitPlatine)} mm à chaque extrémité (instruction utilisateur, cote absente du JSON) et leur ajour triangulaire symétrique. Le contrôle d’interférence utilise leur boîte pleine, plus conservatrice : il ne profite ni des coins retranchés ni de l’ajour. Un recouvrement éventuel de cette boîte serait signalé comme candidat conservateur.
- Les axes de roues Ø${fmt(g.flancs.axes_roues.diametre)} relient rail et flanc ; leurs passages coaxiaux dans roues et poulies sont des liaisons volontaires, sans modélisation des alésages.
- Les cotes des nouvelles vues dérivent du JSON, hormis le retrait extérieur des platines demandé explicitement. Les paramètres de papier, de projection et de style sont fixés dans le générateur. Les stries sont des symboles de surface, sans cote de fabrication. Les données anciennes ci-dessous servent uniquement à l’audit de la source.

## Enveloppe atteinte et implantation

${table(['Grandeur','Calcul / limites','Résultat','Statut'],[
  ['Longueur totale',`X ${bounds.x.map(fmt).join('…')}`,fmt(attained[0]),g.enveloppe.statut],
  ['Longueur sans fourches',`X ${noForks.x.map(fmt).join('…')}`,fmt(span(noForks.x)),g.enveloppe.statut],
  ['Largeur totale',`Y ${bounds.y.map(fmt).join('…')}`,fmt(attained[1]),g.enveloppe.statut],
  ['Hauteur totale, sommet 08',`Z ${bounds.z.map(fmt).join('…')}`,fmt(attained[2]),mod.statut],
  ['Axes des roues en X',wheel.axes_x.map(fmt).join(' / '),fmt(span(wheel.axes_x))+' d’empattement',wheel.statut],
  ['Voie entre centres',`2 × ${fmt(wheel.voie_y)}`,fmt(wheel.voie),wheel.statut],
  ['Rails, entre faces externes',`2 × ${fmt(g.chassis.rails_int.y_abs[1])}`,fmt(2*g.chassis.rails_int.y_abs[1]),g.chassis.statut],
  ['Module avant, largeur × diamètre',`2 × ${fmt(mod.y_abs)} ; 2 × ${fmt(mod.rayon)}`,`${fmt(2*mod.y_abs)} × ${fmt(2*mod.rayon)}`,mod.statut],
  ['Axe 08 en X ; Z','origine du JSON',`${fmt(mod.axe_x)} ; ${fmt(mod.axe_z)}`,mod.statut],
])}
L’extrémité des fourches fixe la longueur ; les flancs fixent la largeur ; 08 fixe la hauteur. Le capot culmine à ${fmt(cap.z[1])}, les flancs à ${fmt(Math.max(...g.flancs.profil_xz.map(p=>p[1])))}, les roues à ${fmt(wheel.axe_z+wheel.diametre/2)}, les arceaux à ${fmt(Math.max(...ar.profil_xz.map(p=>p[1])))} et le coupe-circuit à ${fmt(g.sectionnement.z[1])}.

## Jeux calculés

${table(['Paire / mesure','Expression en mm','Jeu (mm)','Statut du calcul / sources'],scalarRows.map(([name,expr,v,s])=>[name,expr,fmt(v),s]))}
**Les ${fmt(j.moduleCapotAxial)} mm demandés pour 08 / capot sont une séparation sur X entre boîtes de projection**, conservatrice. La distance euclidienne entre le cylindre et le coin supérieur avant du capot est ${fmt(j.moduleCapotReel)} mm ; il ne s’agit pas de deux valeurs contradictoires du même jeu. Les ${fmt(j.moduleArceau)} mm concernent chaque côté de 08 face aux arceaux.

## Mise à jour des arceaux, platines, pare-chocs et ouïes

- Évidement des arceaux en XZ : ${ar.evidement_xz.map(p=>`(${p.map(fmt).join(' ; ')})`).join(' / ')}. Le triangle est soustrait du profil et contrôlé comme contenu dans chaque arceau ; son trou apparaît en profil et en axonométrie.
- Platines : X ${g.flancs.platines.x.map(fmt).join('–')}, |Y| ${g.flancs.platines.y_abs.map(fmt).join('–')}, Z ${g.flancs.platines.z.map(fmt).join('–')}. Le bord extérieur mesure ${fmt(span(g.flancs.platines.x)-2*retraitPlatine)} mm, contre ${fmt(span(g.flancs.platines.x))} mm au bord intérieur. Ajour XY : ${g.flancs.platines.ajour_xy.map(p=>`(${p.map(fmt).join(' ; ')})`).join(' / ')}, miroir exact en −Y.
- Pare-chocs : bleu de Z ${bump.z_bleu.map(fmt).join(' à ')}, noir de ${fmt(bump.z_bleu[1])} à ${fmt(bump.z[1])}. Le dessus ne montre que la partie noire ; en face avant, la caisse masque le pare-chocs arrière.
- Capot : ${vent.n} fentes par rangée, deux rangées symétriques à Y=±${fmt(vent.y_abs)}, largeur ${fmt(vent.largeur)}, pas ${fmt(vent.pas)}, longueur ${fmt(vent.longueur)} mm. Le capot retiré et ses ouïes restent en contour fantôme au-dessus et en axonométrie. Aucun évidement traversant n’est inventé en profil ou en face.

### Dégagement des platines

${table(['Platine','Obstacle','Séparation X (mm)','Séparation Y (mm)','Séparation Z (mm)','Résultat'],platineChecks)}
Une séparation positive sur un seul axe suffit à exclure une interférence ; zéro désigne une tangence sans volume commun ; une valeur négative indique seulement un chevauchement des projections sur cet axe. Les deux côtés et les obstacles du côté opposé sont contrôlés ; le tableau détaille les paires du même côté. Les platines sont séparées de chaque roue de **${fmt(Math.min(...g.roues.axes_x.map(x=>Math.max(g.flancs.platines.x[0]-(x+g.roues.diametre/2),(x-g.roues.diametre/2)-g.flancs.platines.x[1]))))} mm sur X**, de l’enveloppe des courroies de **${fmt(g.flancs.platines.z[0]-courroies[0].z[1])} mm sur Z**, et sont **tangentes aux rails à |Y|=${fmt(g.chassis.rails_int.y_abs[1])}**, sans pénétration. Cette tangence ne constitue pas une marge de tolérance.

## Gardes au sol et contacts

${table(['Élément','Minimum Z (mm)','Statut / interprétation'],[
  ...Object.entries(guardValues).map(([k,v])=>[k,fmt(v),k==='fourches'?`${g.fourches.statut} — contact au sol volontaire`:g.garde_sol.statut]),
  ['Roues',fmt(wheel.axe_z-wheel.diametre/2),`${wheel.statut_diametre} — contact au sol volontaire`],
  ['08',fmt(j.moduleSol),`${mod.statut} — enveloppe uniquement`],
])}
Appuis sans pénétration : plancher / batterie et électronique à Z=${fmt(g.chassis.plancher.z[1])} ; arceaux / dessus des rails à Z=${fmt(g.chassis.rails_int.z[1])} ; coupe-circuit / dessus du capot à Z=${fmt(cap.z[1])}. Le capot est bord à bord avec les rails, à |Y|=${fmt(g.chassis.rails_int.y_abs[0])}. Les fourches touchent le sol sur leur segment inférieur, pas seulement à leur extrémité. Les appuis ne prouvent aucune fixation mécanique.

## Interférences entre volumes

${unexpected.length?'**Interférences non prévues détectées : voir tableau et erreurs finales.**':'**Aucune interférence non prévue détectée.**'} ${overlaps.length} recouvrements sont classés explicitement ; ${boxFalsePositives.length} candidats de boîtes sont éliminés après intersection des profils.

${table(['Volume A','Volume B','Volume commun approché / borne supérieure (mm³)','Interprétation'],overlaps.map(o=>[o.a,o.b,fmt(o.volume),o.reason??(o.conservative?'CANDIDAT CONSERVATEUR NON PRÉVU':'NON PRÉVU')]))}
**Recouvrement volontaire fourche / pod** : la fourche est engagée dans le pod, qui est ici représenté plein. Le logement n’est pas défini ; l’intersection n’est donc ni cachée ni qualifiée de jeu libre. Même principe pour les axes dans les roues et les poulies.

Les boîtes tangentes ne sont pas comptées comme des collisions de volume. Les pièces au contact et la géométrie de logement restent à définir sur une CAO de fabrication.

## Corrections apportées à la maquette du coéquipier

La maquette est conservée intacte. Les corrections suivantes sont déjà portées par le JSON R2 et sont reprises dans les nouvelles vues, sans réutiliser sa géométrie R1.1.

${table(['Sujet','Constat ancien → représentation R2','Trace dans le fichier source'],corrections)}
Les cotes de l’ancienne 3D utilisent X longitudinal et Z transversal dans Three.js, avec Y vertical. Elles sont expliquées ci-dessus dans le repère mécanique du JSON (X avant, Y gauche, Z haut). Les références de lignes permettent de retrouver les primitives originales.

## Erreurs relevées dans ses plans 2D

Audit de l’onglet « Plans 2D » du fichier local [Maquette_Detaillee_Bot.html](../sources/coequipier/Maquette_Detaillee_Bot.html), vues dessus, profil, face et éclaté. Les nouvelles planches les remplacent.

${table(['Sujet','Erreur constatée / correction','Trace dans le fichier source'],drawingErrors)}
Les harpons et détails du mécanisme avant des anciens dessins ne sont pas repris. 08 apparaît uniquement comme enveloppe hachurée : rectangle de projection au-dessus et en face, cercle de profil, cylindre en axonométrie.

## Incohérences et réserves du JSON à signaler

1. **Traçabilité du statut de la voie** : \`roues.statut=M\` mais sa note indique que la voie ${fmt(wheel.voie)} est une correction P de la voie 184. Les dessins conservent le statut stocké M ; l’équipe doit confirmer s’il faut distinguer les statuts des cotes. Aucun changement du JSON effectué.
2. **Statut global de l’enveloppe** : \`enveloppe.statut=M\`, alors que sa longueur totale dépend de fourches P et sa largeur des flancs de la version corrigée. Les valeurs géométriques sont cohérentes ; la provenance n’est pas entièrement décrite par le statut global M.
3. **« Caisse à ${fmt(cap.z[1])} »** signifie le dessus des rails/capot. Les flancs montent localement à ${fmt(Math.max(...g.flancs.profil_xz.map(p=>p[1])))} et les roues à ${fmt(wheel.axe_z+wheel.diametre/2)} : ${fmt(cap.z[1])} ne doit pas être présenté comme la hauteur de tout le soubassement.
4. **Coordonnées Z des poulies absentes** : la coaxialité avec roues ou moteurs est une interprétation nécessaire, explicitée dans \`geometrie.mjs\`. Épaisseur, passage, prétension et guidage des courroies non fournis ; le contrôle n’atteste pas le fonctionnement de la transmission.
5. **Marge batterie / capot de ${fmt(j.batterieCapot)} mm** : positive, mais aucun volume de câblage, connecteurs, maintien, tolérances ou déformation n’est fourni. Le volume batterie n’atteste pas le logement d’un pack réel.
6. **Assemblages incomplets** : logements fourche/pod, liaisons pods/châssis, sorties moteurs, maintien des axes et de 08 non détaillés. Le contact au sol des fourches est volontaire. Aucune liaison, aucun perçage ni mécanisme de 08 n’est inventé.

Il n’y a pas de contradiction numérique sur les enveloppes, les axes, les gardes ou les jeux spécifiés. Les réserves ci-dessus limitent la portée du contrôle conceptuel.

## Variante de levage P3

08 est retiré de la variante. Palette arrondie de longueur ${fmt(g.option_levage.palette.longueur)}, largeur ${fmt(span(g.option_levage.palette.y))}, épaisseur ${fmt(g.option_levage.palette.epaisseur)}, rayon de bord ${fmt(g.option_levage.palette.rayon_bord)}, pivot (X=${fmt(g.option_levage.pivot.x)} ; Z=${fmt(g.option_levage.pivot.z)}), positions ${fmt(g.option_levage.palette.angle_repos_deg)}° et ${fmt(g.option_levage.palette.angle_haut_deg)}°, statut ${g.option_levage.statut}. Le petit cercle de pivot est un symbole, sans diamètre mécanique. Actionneur et débattements ne sont pas dimensionnés.

## Livrables et reproduction

${xmlStatus}

- \`node plans/generer_plans.mjs && node plans/controle_coherence.mjs\`
- \`xmllint --noout plans/svg/*.svg\` si l’exécutable est disponible.
- \`python plans/valider_rendu.py\` : contrôle XML avec libxml2, unicité des identifiants et références SVG, rendus librsvg/Cairo, PDF A3 vectoriel. Aucun lancement de Chrome ni d’un autre navigateur.
- Six SVG, quatre vues principales à **1:2,5** et variante à la même échelle ; A3 paysage, 420 × 297 mm. Échelle ajustée par rapport au 1:2 proposé pour ménager une place lisible à P3, aux cotes et aux légendes.
- [Planche à imprimer](planche_A3.html) ; [SVG A3](svg/planche_A3.svg). Après rendu, renommer \`planche_A3.pdf\` en [PDF A3 final](WARABA_Plans_A3.pdf) ; aperçus dans \`apercus/\`. Imprimer à 100 %, sans ajustement automatique.
- Date, nom, équipe, compétition, révision et statuts proviennent du JSON. Tous les fichiers produits sont dans \`plans/\`.

### Résultat détaillé

${errors.length?bullets(errors):checks.length+' vérifications satisfaites ; aucune erreur bloquante.'}

Modèle conceptuel — cotes provisoires — non destiné à la fabrication.
`;
await writeFile(new URL('controle_coherence.md',import.meta.url),report);
console.log(`${g.meta.nom} : ${checks.filter(c=>c.ok).length}/${checks.length} contrôles OK ; enveloppe ${xyztxt(attained)} mm ; ${unexpected.length} interférence non prévue ; ${overlaps.length} recouvrements d’assemblage volontaires.`);
console.log(`Réserves de traçabilité et d’assemblage : plans/controle_coherence.md. JSON SHA-256 : ${sha}`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
