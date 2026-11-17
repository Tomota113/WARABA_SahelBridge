import { mkdir, writeFile } from 'node:fs/promises';
import { g, span, mid, fmt, signed, volumes, jeux } from './geometrie.mjs';

// Constantes ci-dessous : exclusivement projection, style et mise en page (mm papier).
const S = 1 / 2.5;
const C = { '01':'#dfe5ec', '02':'#3b4654', '03':'#c9a978', '04':'#9fb8d6', '05':'#b9c7b0', '06':'#b9c7b0', '07':'#2f2f2f', '08':'url(#hachures08)', '09':'#d0352b', '10':'none' };
const esc = x => String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const n = x => Number(x.toFixed(4));
const attrs = a => Object.entries(a).filter(([,v]) => v !== undefined).map(([k,v]) => ` ${k}="${esc(v)}"`).join('');
const el = (tag,a={},body='') => `<${tag}${attrs(a)}>${body}</${tag}>`;
const line = (x1,y1,x2,y2,cls='fin',extra={}) => el('line',{x1:n(x1),y1:n(y1),x2:n(x2),y2:n(y2),class:cls,...extra});
const text = (x,y,t,cls='texte',extra={}) => el('text',{x:n(x),y:n(y),class:cls,...extra},esc(t));
const path = (points, extra={}) => el('path',{d:points.map((p,i)=>`${i?'L':'M'}${n(p[0])},${n(p[1])}`).join(' ')+' Z',...extra});
const rect = (x,y,w,h,rep,extra={}) => el('rect',{x:n(x),y:n(y),width:n(w),height:n(h),fill:C[rep],class:'contour',...extra});
const circle = (x,y,r,extra={}) => el('circle',{cx:n(x),cy:n(y),r:n(r),class:'contour',...extra});
const defs = `<defs>
  <pattern id="hachures08" patternUnits="userSpaceOnUse" width="${3/S}" height="${3/S}" patternTransform="rotate(45)"><rect width="${3/S}" height="${3/S}" fill="#fff4f1"/><line x1="0" y1="0" x2="0" y2="${3/S}" stroke="#c0392b" stroke-width="${.25/S}"/></pattern>
  <marker id="fleche" markerUnits="userSpaceOnUse" markerWidth="${2/S}" markerHeight="${2/S}" refX="0" refY="0" viewBox="-2 -1 2 2" orient="auto-start-reverse"><path d="M0 0 L-2 -0.7 L-2 0.7 Z" fill="#26303a"/></marker>
  <style>
    text{font-family:Inter,'DejaVu Sans',Arial,sans-serif;fill:#202833}
    .contour{stroke:#27313a;stroke-width:${.5/S};stroke-linejoin:round}
    .fin,.rappel{stroke:#46515b;stroke-width:${.25/S};fill:none}
    .rappel{stroke:#626c75}.axe{stroke:#5a6876;stroke-width:${.18/S};stroke-dasharray:${[5,1,1,1].map(x=>x/S).join(' ')};fill:none}
    .cache{stroke:#485563;stroke-width:${.25/S};stroke-dasharray:${2/S} ${1.2/S};fill:none}
    .fantome{stroke:#d0352b;stroke-width:${.25/S};stroke-dasharray:${1/S} ${1/S};fill:none}
    .texte{font-size:${2.3/S}px;text-anchor:middle;dominant-baseline:middle}
    .petit{font-size:${2/S}px;text-anchor:middle;dominant-baseline:middle}
    .cote{font-size:${2.3/S}px;text-anchor:middle;dominant-baseline:middle;paint-order:stroke;stroke:white;stroke-width:${1.2/S};stroke-linejoin:round}
    .repere{font-size:${2.5/S}px;font-weight:700;text-anchor:middle;dominant-baseline:middle}
    .papier{font-size:2.3px}.titre{font-size:3px;font-weight:700}.note{font-size:2.1px;fill:#475568}
  </style></defs>`;

// Les cotes utilisent les points projetés, les flèches étant orientées vers les limites.
function dh(x1,x2,y,ref1,ref2,label) {
  const gap=1/S, over=1.5/S;
  return line(x1,ref1+Math.sign(y-ref1)*gap,x1,y+Math.sign(y-ref1)*over,'rappel')+
    line(x2,ref2+Math.sign(y-ref2)*gap,x2,y+Math.sign(y-ref2)*over,'rappel')+
    line(x1,y,x2,y,'fin',{'marker-start':'url(#fleche)','marker-end':'url(#fleche)'})+text(mid([x1,x2]),y-2/S,label,'cote');
}
function dv(y1,y2,x,ref1,ref2,label) {
  const gap=1/S, over=1.5/S, cy=mid([y1,y2]);
  return line(ref1+Math.sign(x-ref1)*gap,y1,x+Math.sign(x-ref1)*over,y1,'rappel')+
    line(ref2+Math.sign(x-ref2)*gap,y2,x+Math.sign(x-ref2)*over,y2,'rappel')+
    line(x,y1,x,y2,'fin',{'marker-start':'url(#fleche)','marker-end':'url(#fleche)'})+
    text(x-2/S,cy,label,'cote',{transform:`rotate(-90 ${n(x-2/S)} ${n(cy)})`});
}
function leader(px,py,tx,ty,label,cls='cote') {
  return line(tx,ty,px,py,'fin',{'marker-end':'url(#fleche)'})+text(tx,ty-2/S,label,cls);
}
const tag = (x,y,t,light=false) => text(x,y,t,'repere',light?{fill:'#fff',style:'fill:#fff'}:{});
const xy = v => rect(v.x[0],-v.y[1],span(v.x),span(v.y),v.rep,{rx:v.rayon});
const xz = (v,extra={}) => rect(v.x[0],-v.z[1],span(v.x),span(v.z),v.rep,extra);
const yz = (v,extra={}) => rect(v.y[0],-v.z[1],span(v.y),span(v.z),v.rep,extra);
const vs = volumes(), c=g.caisson, w=g.roues, f=g.protections.flancs, e=g.enveloppe;
const status = (v,s) => `${fmt(v)} ${s}`;

function dessus() {
  let b='';
  b+=xy({...c,rep:'01'});
  b+=rect(c.x[0]+c.paroi,-c.y[1]+c.paroi,span(c.x)-2*c.paroi,span(c.y)-2*c.paroi,'01',{fill:'#f6f8fa',class:'fin'});
  for (const v of vs.filter(v=>v.rep==='03'||v.rep==='02'||['04','05','06','07','08'].includes(v.rep))) b+=xy(v);
  b+=xy({...g.sectionnement,rep:'09'}).replace('class="contour"','class="fantome"').replace(`fill="${C['09']}"`,'fill="none"');
  for(const x of w.axes_x) b+=line(x,-f.y_abs[1]-7,x,f.y_abs[1]+7,'axe');
  b+=line(-12,0,e.L+12,0,'axe');
  b+=tag(mid(c.x),-c.y[1]+c.paroi/2,'01');
  b+=tag(mid(g.commande.x),0,'05'); b+=tag(mid(g.batterie.x),-18,'04');
  for(const s of [-1,1]) {
    b+=tag(mid(g.controleurs.x),s*mid(g.controleurs.y_abs),`06 ${s<0?'G':'D'}`);
    b+=tag(mid(g.pods.x),s*mid(g.pods.y_abs),'07',true);
    b+=tag(w.axes_x[0],s*w.voie_y,'02',true);
    b+=tag(mid(f.x),s*mid(f.y_abs),'03');
  }
  b+=text(mid(g.module_avant.x),0,'08','repere');
  b+=leader(mid(g.sectionnement.x),-mid(g.sectionnement.y),15,-60,'09 V · sur capot');
  const target=g.cg.cible, est=g.cg.estimation_R1_1, cross=2/S;
  b+=line(target.x-cross,-target.y,target.x+cross,-target.y)+line(target.x,-target.y-cross,target.x,-target.y+cross);
  b+=circle(est.x,-est.y,1.3/S,{fill:'#202833',stroke:'none'});
  b+=leader(target.x,-target.y,target.x-23,19,`CG cible ${fmt(target.x)} P`,'petit');
  b+=leader(est.x,-est.y,est.x+15,43,`CG R1.1 ${fmt(est.x)} E`,'petit');
  b+=leader(c.x[0]+c.paroi/2,65,49,82,`parois ${status(c.paroi,c.statut)}`,'petit');
  b+=dh(...c.x,-f.y_abs[1]-20,-c.y[1],-c.y[1],status(span(c.x),c.statut));
  b+=dv(-f.y_abs[1],f.y_abs[1],-43,0,0,status(e.l,e.statut));
  b+=dv(-c.y[1],-c.y[0],-20,c.x[0],c.x[0],status(span(c.y),c.statut));
  b+=dv(-w.voie_y,w.voie_y,e.L+23,w.axes_x[1],w.axes_x[1],`voie ${status(w.voie,w.statut)}`);
  b+=dh(...w.axes_x,f.y_abs[1]+20,f.y_abs[1],f.y_abs[1],status(w.empattement,w.statut));
  b+=dh(0,w.axes_x[0],f.y_abs[1]+36,f.y_abs[1],f.y_abs[1],`X=${status(w.axes_x[0],w.statut)}`);
  b+=dh(0,w.axes_x[1],f.y_abs[1]+56,f.y_abs[1],f.y_abs[1],`X=${status(w.axes_x[1],w.statut)}`);
  // Longueur hors tout cotée au-dessus, sans superposer les chaînes d'axes.
  b+=dh(0,e.L,-f.y_abs[1]-43,-f.y_abs[1],-g.pods.y_abs[1],status(e.L,e.statut));
  b+=text(mid(g.pods.x),-g.pods.y_abs[1]-12,`R${status(g.pods.rayon,g.pods.statut)}`,'petit');
  return b;
}

function cote() {
  let b=xz({...c,rep:'01'});
  b+=xz({...g.capot,rep:'10'});
  b+=xz({...g.module_avant,rep:'08'});
  b+=xz({...g.pods,rep:'07'});
  b+=xz({...g.sectionnement,rep:'09'});
  // Au premier plan, le flanc droit masque les roues et moteurs derrière lui.
  b+=xz({...f,rep:'03'});
  for(const x of w.axes_x) {
    b+=circle(x,-w.axe_z,w.diametre/2,{class:'cache'});
    b+=circle(x,-w.axe_z,g.motoreducteurs.enveloppe_diametre/2,{class:'cache'});
    b+=line(x,-g.capot.z[1]-5,x,8,'axe')+line(x-w.diametre/2-5,-w.axe_z,x+w.diametre/2+5,-w.axe_z,'axe');
  }
  b+=line(-12,0,e.L+12,0,'fin');
  b+=tag(mid(f.x),-mid(f.z),'03');b+=tag(mid(g.pods.x),-mid(g.pods.z),'07',true);
  b+=tag(mid(g.module_avant.x),-mid(g.module_avant.z),'08');
  b+=leader(mid(g.capot.x),-g.capot.z[1],140,-84,'10 · capot');
  b+=leader(mid(g.sectionnement.x),-mid(g.sectionnement.z),45,-93,'09 V');
  b+=dv(-e.h,0,e.L+22,g.module_avant.x[1],e.L,status(e.h,e.statut));
  b+=dv(-g.capot.z[1],0,-21,c.x[0],0,`capot ${status(g.capot.z[1],g.capot.statut)}`);
  b+=leader(w.axes_x[1]+w.diametre/2/Math.sqrt(2),-w.axe_z-w.diametre/2/Math.sqrt(2),225,-87,`Ø${status(w.diametre,w.statut_diametre)}`);
  const guards=[['plancher',c.x[0]+c.paroi,c.z[0],25],['protections',mid(f.x),f.z[0],140],['pods',mid(g.pods.x),g.pods.z[0],285]];
  for(const [name,x,z,tx] of guards) b+=leader(x,-z,tx,23,`${name} ${status(g.garde_sol[name],g.garde_sol.statut)}`,'petit');
  b+=dh(0,w.axes_x[0],41,0,0,`X=${status(w.axes_x[0],w.statut)}`);
  b+=dh(w.axes_x[0],w.axes_x[1],41,0,0,status(w.empattement,w.statut));
  b+=dh(0,e.L,55,0,0,status(e.L,e.statut));
  b+=text(w.axes_x[1],9,`X=${status(w.axes_x[1],w.statut)}`,'petit');
  return b;
}

function face() {
  let b=yz({...c,rep:'01'});
  for(const v of vs.filter(v=>v.roue && v.id.endsWith(String(w.axes_x[1])))) b+=yz(v);
  b+=yz({...g.capot,rep:'10'});
  for(const s of [-1,1]) b+=yz({...f,y:signed(f.y_abs,s),rep:'03'});
  for(const s of [-1,1]) b+=yz({...g.pods,y:signed(g.pods.y_abs,s),rep:'07'});
  b+=yz({...g.sectionnement,rep:'09'});
  b+=yz({...g.module_avant,rep:'08'});
  b+=line(0,-e.h-8,0,10,'axe')+line(-e.l/2-10,0,e.l/2+10,0,'fin');
  b+=tag(0,-mid(g.module_avant.z),'08');
  b+=tag(mid(g.pods.y_abs),-mid(g.pods.z),'07',true);
  b+=dh(...c.y,-e.h-19,-c.z[1],-c.z[1],status(span(c.y),c.statut));
  b+=dh(-w.largeur_hors_tout/2,w.largeur_hors_tout/2,22,0,0,`roues ${status(w.largeur_hors_tout,w.statut)}`);
  b+=dh(-e.l/2,e.l/2,46,0,0,`protections ${status(e.l,e.statut)}`);
  b+=dv(-e.h,0,e.l/2+22,g.module_avant.y[1],e.l/2,status(e.h,e.statut));
  const j=jeux(), inner=w.voie_y-w.largeur/2, outer=w.voie_y+w.largeur/2;
  // Petits jeux : lignes de rappel, flèches extérieures et textes déportés.
  for(const [a,bx,z,tx,label] of [[c.y[1],inner,-78,70,`jeu ${status(j.roueCaisson,w.statut)}`],[outer,f.y_abs[0],-96,145,`jeu ${status(j.roueProtection,w.statut)}`]]) {
    b+=line(a,-w.diametre,a,z,'rappel')+line(bx,-w.diametre,bx,z,'rappel');
    b+=line(a-8,z,a,z,'fin',{'marker-end':'url(#fleche)'})+line(bx+8,z,bx,z,'fin',{'marker-end':'url(#fleche)'});
    b+=leader(mid([a,bx]),z,tx,z-8,label,'petit');
  }
  return b;
}

// Axonométrie isométrique : projection orthogonale, mêmes unités modèle que les vues.
const iso = ([x,y,z]) => [Math.sqrt(3)/2*(x-y),(x+y)/2-z];
const polygon3 = (pts,rep,extra={}) => path(pts.map(iso),{class:'contour',fill:C[rep],...extra});
function hull(points) {
  const p=[...points].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const half=ps=>{const h=[];for(const q of ps){while(h.length>=2&&cross(h.at(-2),h.at(-1),q)<=0)h.pop();h.push(q);}return h.slice(0,-1);};
  return [...half(p),...half(p.reverse())];
}
function prism(v,ghost=false) {
  const [a,b]=v.x,[c,d]=v.y,[lo,hi]=v.z;
  const extra=ghost?{class:v.rep==='09'?'fantome':'cache',fill:'none'}:{};
  return polygon3([[b,c,lo],[b,d,lo],[b,d,hi],[b,c,hi]],v.rep,extra)+
    polygon3([[a,d,lo],[b,d,lo],[b,d,hi],[a,d,hi]],v.rep,extra)+
    polygon3([[a,c,hi],[b,c,hi],[b,d,hi],[a,d,hi]],v.rep,extra);
}
function cylinder(v) {
  const cx=mid(v.x),cz=mid(v.z),r=span(v.x)/2;
  const ring=y=>Array.from({length:48},(_,i)=>{const t=2*Math.PI*i/48;return [cx+r*Math.cos(t),y,cz+r*Math.sin(t)];});
  const back=ring(v.y[0]), front=ring(v.y[1]);
  // Silhouette convexe exacte à la résolution de projection, sans stries inventées.
  return path(hull([...back,...front].map(iso)),{class:'contour',fill:C[v.rep]})+polygon3(front,v.rep);
}
function roundedPod(v) {
  const r=v.rayon, pts=[];
  for(const [x,y,start] of [[v.x[1]-r,v.y[1]-r,0],[v.x[0]+r,v.y[1]-r,90],[v.x[0]+r,v.y[0]+r,180],[v.x[1]-r,v.y[0]+r,270]]) {
    for(let i=0;i<=8;i++){const t=(start+i*90/8)*Math.PI/180;pts.push([x+r*Math.cos(t),y+r*Math.sin(t)]);}
  }
  const points=[...pts.map(p=>[...p,v.z[0]]),...pts.map(p=>[...p,v.z[1]])];
  return path(hull(points.map(iso)),{class:'contour',fill:C[v.rep]})+polygon3(pts.map(p=>[...p,v.z[1]]),v.rep);
}
function ensemble() {
  // Tri des volumes éloignés vers les volumes proches ; caisson ouvert en cinq solides.
  const solids=vs.filter(v=>!['09','10'].includes(v.rep)).sort((a,b)=>(mid(a.x)+mid(a.y)+mid(a.z))-(mid(b.x)+mid(b.y)+mid(b.z)));
  const near=v=>v.id==='03-flanc-G'?3:v.roue&&v.y[0]>0?2:v.id==='01-flanc-G'?1:0;
  solids.sort((a,b)=>near(a)-near(b));
  let b=solids.map(v=>v.cylindre?cylinder(v):v.rayon?roundedPod(v):prism(v)).join('');
  // Capot retiré : seuls ses contours et l'emplacement de 09 sont portés en fantôme.
  b+=polygon3([[c.x[0],c.y[0],g.capot.z[1]],[c.x[1],c.y[0],g.capot.z[1]],[c.x[1],c.y[1],g.capot.z[1]],[c.x[0],c.y[1],g.capot.z[1]]],'10',{class:'cache',fill:'none'});
  b+=prism({...g.sectionnement,rep:'09'},true);
  const anchors=[
    ['01',[c.x[0],0,c.z[1]],[-105,35]],
    ['02',[w.axes_x[1],-w.voie_y,w.axe_z+w.diametre/2],[360,0]],
    ['03',[mid(f.x),f.y_abs[1],mid(f.z)],[-72,107]],
    ['04',[mid(g.batterie.x),0,g.batterie.z[1]],[210,-40]],
    ['05',[mid(g.commande.x),0,g.commande.z[1]],[20,-100]],
    ['06',[mid(g.controleurs.x),-mid(g.controleurs.y_abs),g.controleurs.z[1]],[255,4]],
    ['07',[mid(g.pods.x),mid(g.pods.y_abs),g.pods.z[1]],[210,206]],
    ['08',[mid(g.module_avant.x),0,g.module_avant.z[1]],[360,80]],
    ['09',[mid(g.sectionnement.x),0,g.sectionnement.z[1]],[-50,-70]],
    ['10',[c.x[1],c.y[0],g.capot.z[1]],[360,154]],
  ];
  for(const [rep,p,[x,y]] of anchors){const [px,py]=iso(p);b+=line(px,py,x,y,'fin')+circle(x,y,3.3/S,{fill:'#fff'})+tag(x,y,rep);}
  return b;
}

function axes(x,y,projection) {
  let b=''; const O=[x,y];
  for(const [label,end] of projection){b+=line(...O,x+end[0],y+end[1],'fin',{'marker-end':'url(#fleche)'})+text(x+end[0]*1.25,y+end[1]*1.25,label,'petit');}
  return b+text(x-7,y+7,'O','petit');
}
function group(body,x,y){return el('g',{transform:`translate(${x} ${y}) scale(${S})`},body);}
function svg(w,h,title,body){return `<?xml version="1.0" encoding="UTF-8"?>\n`+el('svg',{xmlns:'http://www.w3.org/2000/svg',width:`${w}mm`,height:`${h}mm`,viewBox:`0 0 ${w} ${h}`,role:'img','aria-labelledby':'titre description'},el('title',{id:'titre'},esc(`${g.meta.projet} — ${title}`))+el('desc',{id:'description'},esc(`${g.meta.repere} ${g.meta.avertissement} Chaque cote porte son statut. Orthogonales à 1:2,5.`))+defs+el('rect',{width:w,height:h,fill:'#fff'})+body)+'\n';}
const title=(x,y,t)=>text(x,y,t,'titre');
const small=(x,y,t)=>text(x,y,t,'note');
const date=g.meta.date.split('-').reverse().join('/');
const top=dessus(), side=cote(), front=face(), axon=ensemble();
const axisTop=axes(300,135,[['X',[16,0]],['Y',[0,-16]]]);
const axisSide=axes(295,-103,[['X',[16,0]],['Z',[0,-16]]]);
const axisFace=axes(-142,-101,[['Y',[16,0]],['Z',[0,-16]]]);

await mkdir(new URL('svg/',import.meta.url),{recursive:true});
const individual = [
  ['vue_dessus.svg',200,184,'DESSUS · capot retiré',group(top+axisTop,29,100)],
  ['vue_cote.svg',200,98,'CÔTÉ DROIT · roues et moteurs cachés',group(side+axisSide,29,69)],
  ['vue_face.svg',200,98,'FACE AVANT · détails des jeux',group(front+axisFace,94,70)],
  ['vue_ensemble.svg',212,174,'ENSEMBLE · capot en contour fantôme',group(axon,58,78)],
];
for(const [name,width,height,label,body] of individual) await writeFile(new URL(`svg/${name}`,import.meta.url),svg(width,height,label,title(7,9,`${g.meta.projet} / ${label}`)+small(7,15,`${g.meta.revision} · ${date} · mm · 1:2,5 · P : cotes provisoires · 08 : volume réservé — non détaillé`)+body));

let board='';
board+=el('rect',{x:5,y:5,width:410,height:287,fill:'none',stroke:'#27313a','stroke-width':.5});
board+=title(9,12,`${g.meta.projet} / IMPLANTATION ET ENCOMBREMENT`)+small(295,12,`${g.meta.revision} · ${date} · ROBOTS BATTLE`);
board+=el('path',{d:'M5 16 H415 M205 16 V252 M5 180 H205 M205 172 H415 M5 252 H415 M5 279 H415',fill:'none',stroke:'#9ba6af','stroke-width':.18});
board+=title(9,22,'A / DESSUS · capot retiré')+group(top+axisTop,28,100);
board+=title(210,22,'D / ENSEMBLE · capot en contour fantôme')+group(axon,260,82);
board+=small(210,169,'Bulles 01–10 · 08 : volume réservé — non détaillé · 09 et 10 en fantôme');
board+=title(9,186,'B / CÔTÉ DROIT')+group(side+axisSide,28,228);
board+=title(210,178,'C / FACE AVANT')+group(front+axisFace,296,228);
board+=title(9,257,'REPÈRES');
const names=[['01','Caisson et plancher'],['02','Roues + motoréducteurs'],['03','Protections en U'],['04','Batterie (volume réservé)'],['05','Commande'],['06','Contrôleurs G / D'],['07','Pods arrondis'],['08','Volume réservé — non détaillé'],['09','Accès au sectionnement'],['10','Capot retiré']];
names.forEach(([rep,label],i)=>{
  const x=9+(i>=5?98:0), y=261+(i%5)*3.1;
  board+=el('rect',{x,y:y-2.1,width:3,height:2.4,fill:C[rep],stroke:'#27313a','stroke-width':.18})+text(x+4,y,`${rep}  ${label}`,'papier');
});
board+=title(210,257,'STATUTS / SOURCE : config/geometry.json');
Object.entries(g.meta.statuts).forEach(([code,label],i)=>{board+=text(210,261+i*2.8,`${code} — ${label}`,'papier');});
board+=title(9,284,'PLANCHE TECHNIQUE / 4WD · MODÈLE CONCEPTUEL');
board+=text(9,288,'Modèle conceptuel — cotes provisoires P — non destiné à la fabrication','papier');
board+=small(9,291,'Origine : arrière de l’enveloppe, au sol, dans le plan de symétrie · X avant / Y gauche / Z haut');
board+=el('path',{d:'M293 279 V292 M351 279 V292 M386 279 V292',fill:'none',stroke:'#27313a','stroke-width':.25});
board+=text(297,284,`Révision : ${g.meta.revision}`,'papier')+text(297,289,`Date : ${date}`,'papier');
board+=text(355,284,'Échelle : 1:2,5','papier')+text(355,289,`Unité : ${g.meta.unite}`,'papier');
board+=text(390,284,'A3 paysage','papier')+text(390,289,'Feuille 1 / 1','papier');
await writeFile(new URL('svg/planche_A3.svg',import.meta.url),svg(420,297,'Planche A3 paysage',board));
await writeFile(new URL('planche_A3.html',import.meta.url),`<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(g.meta.projet)} — planche A3</title>
<style>@page { size: A3 landscape; margin: 0 } *{box-sizing:border-box} html,body{margin:0;padding:0;background:white} img{display:block;width:420mm;height:297mm} @media screen{body{background:#e5e7eb}img{max-width:100%;height:auto;margin:auto}} @media print{html,body{width:420mm;height:297mm}img{max-width:none;break-inside:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head>
<body><img src="svg/planche_A3.svg" alt="HOTLINE MK-II : quatre vues, cotes avec statuts, nomenclature et cartouche"></body></html>\n`);
console.log('5 SVG et planche_A3.html générés depuis config/geometry.json (échelle commune 1:2,5).');
