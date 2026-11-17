import { mkdir, writeFile } from 'node:fs/promises';
import { g, span, mid, fmt, volumes, ring, ouiesXY } from './geometrie.mjs';

// Constantes de dessin uniquement : mm papier, projection, typographie et couleurs.
// 1:2,5 conserve les quatre vues et la variante lisibles sur une seule feuille A3.
const S=1/2.5;
const C={'01':'#cfd5dc','02':'#e9a197','03':'#8c939b','04':'#9fb8d6','05':'#b9c7b0','06':'#b9c7b0','07':'#e57373','08':'url(#hachures08)','09':'#d0352b','10':'none','11':'#4b5563','12':'#a7adb4'};
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const n=x=>Number(x.toFixed(5));
const el=(tag,a={},body='')=>`<${tag}${Object.entries(a).filter(([,v])=>v!==undefined).map(([k,v])=>` ${k}="${esc(v)}"`).join('')}>${body}</${tag}>`;
const line=(x1,y1,x2,y2,cls='fin',extra={})=>el('line',{x1:n(x1),y1:n(y1),x2:n(x2),y2:n(y2),class:cls,...extra,style:Object.entries(extra).filter(([k])=>k.startsWith('stroke')).map(([k,v])=>`${k}:${v}`).join(';')||extra.style});
const text=(x,y,label,cls='texte',extra={})=>el('text',{x:n(x),y:n(y),class:cls,...extra},esc(label));
const pathD=p=>p.map((q,i)=>`${i?'L':'M'}${q.map(n).join(',')}`).join(' ')+' Z';
const poly=(p,rep,extra={})=>el('path',{d:pathD(p),fill:C[rep],class:'contour',...extra});
const rect=(x,y,w,h,rep,extra={})=>el('rect',{x:n(x),y:n(y),width:n(w),height:n(h),fill:C[rep],class:'contour',...extra});
const circle=(x,y,r,extra={})=>el('circle',{cx:n(x),cy:n(y),r:n(r),class:'contour',...extra});
const group=(body,x,y)=>el('g',{transform:`translate(${x} ${y}) scale(${S})`},body);
const tag=(x,y,label,light=false)=>text(x,y,label,'repere',light?{style:'fill:white'}:{});
const status=(v,s)=>`${fmt(v)} ${s}`;
const stamp=v=>g.meta.statuts[v]?v:'E';
const vs=volumes(),w=g.roues,m=g.module_avant,f=g.flancs;
const xz=p=>p.map(([x,z])=>[x,-z]);
const xy=p=>p.map(([x,y])=>[x,-y]);
const projectXY=v=>v.pxy
  ?el('path',{d:[v.pxy,...(v.holesXY??[])].map(p=>pathD(xy(p))).join(' '),class:'contour',fill:v.color??C[v.rep],'fill-rule':'evenodd','data-piece':v.id})
  :rect(v.x[0],-v.y[1],span(v.x),span(v.y),v.rep,{fill:v.color??C[v.rep],'data-piece':v.id});
const projectYZ=(v,extra={})=>rect(v.y[0],-v.z[1],span(v.y),span(v.z),v.rep,{fill:v.color??C[v.rep],'data-piece':v.id,...extra});
function profileXZ(v,extra={}) {
  return el('path',{d:[v.p,...(v.holes??[])].map(p=>pathD(xz(p))).join(' '),class:'contour',fill:v.color??C[v.rep],'fill-rule':'evenodd','data-piece':v.id,...extra});
}
// Le capot reste retiré : son contour et ses deux rangées de n ouïes sont
// projetés en traits fantômes. Les fentes ne deviennent pas des trous en XZ/YZ.
function capotFantome(project) {
  const c=g.capot,body=[rectCorners(c.x,c.y),...ouiesXY()].map((p,i)=>
    poly(p.map(([x,y])=>project([x,y,c.z[1]])),'10',{class:'cache ouie-fantome',fill:'none',
      'data-piece':i?'ouie-capot':'capot-fantome',style:`stroke-width:${.18/S};stroke-dasharray:${.6/S} ${.4/S}`})).join('');
  return el('g',{'data-capot':'retire'},body);
}
const rectCorners=(x,y)=>[[x[0],y[0]],[x[1],y[0]],[x[1],y[1]],[x[0],y[1]]];
const defs=`<defs>
  <pattern id="hachures08" patternUnits="userSpaceOnUse" width="${2/S}" height="${2/S}" patternTransform="rotate(45)"><rect width="${2/S}" height="${2/S}" fill="#fff8f6"/><line x1="0" y1="0" x2="0" y2="${2/S}" stroke="#c0392b" stroke-width="${.25/S}"/></pattern>
  <marker id="fleche" markerUnits="userSpaceOnUse" markerWidth="${2/S}" markerHeight="${1.6/S}" refX="0" refY="0" viewBox="-2 -0.8 2 1.6" orient="auto-start-reverse"><path d="M0 0 L-2 -0.65 L-2 0.65 Z" fill="#293440"/></marker>
  <clipPath id="masque-flanc"><path d="${pathD(xz(f.profil_xz))}"/></clipPath>
  <style>
    text{font-family:Inter,'DejaVu Sans',Arial,sans-serif;fill:#23303e}
    .contour{stroke:#293440;stroke-width:${.5/S};stroke-linejoin:round;stroke-linecap:round}
    .fin,.rappel{stroke:#546270;stroke-width:${.25/S};fill:none}
    .rappel{stroke:#7c8790;stroke-width:${.18/S}}
    .axe{stroke:#637584;stroke-width:${.18/S};stroke-dasharray:${[5,1,1,1].map(x=>x/S).join(' ')};fill:none}
    .cache{stroke:#445160;stroke-width:${.25/S};stroke-dasharray:${2/S} ${1/S};fill:none}
    .fantome{stroke:#d0352b;stroke-width:${.25/S};stroke-dasharray:${.6/S} ${1/S};fill:none}
    .texte,.petit,.cote,.repere{text-anchor:middle;dominant-baseline:middle}
    .texte{font-size:${2.3/S}px}.petit{font-size:${2/S}px}
    .cote{font-size:${2.25/S}px;paint-order:stroke;stroke:white;stroke-width:${1.1/S};stroke-linejoin:round}
    .repere{font-size:${2.3/S}px;font-weight:700}
    .papier{font-size:2.2px}.titre{font-size:3px;font-weight:700;letter-spacing:.13px}
    .note{font-size:2.05px;fill:#526170}.entete{font-size:4.5px;font-weight:700;letter-spacing:.35px}
  </style>
</defs>`;
function dh(x1,x2,y,r1,r2,label) {
  return line(x1,r1+Math.sign(y-r1)/S,x1,y+Math.sign(y-r1)*1.2/S,'rappel')+
    line(x2,r2+Math.sign(y-r2)/S,x2,y+Math.sign(y-r2)*1.2/S,'rappel')+
    line(x1,y,x2,y,'fin',{'marker-start':'url(#fleche)','marker-end':'url(#fleche)'})+
    text(mid([x1,x2]),y-2/S,label,'cote');
}
function dv(y1,y2,x,r1,r2,label) {
  const cy=mid([y1,y2]),tx=x-2/S;
  return line(r1+Math.sign(x-r1)/S,y1,x+Math.sign(x-r1)*1.2/S,y1,'rappel')+
    line(r2+Math.sign(x-r2)/S,y2,x+Math.sign(x-r2)*1.2/S,y2,'rappel')+
    line(x,y1,x,y2,'fin',{'marker-start':'url(#fleche)','marker-end':'url(#fleche)'})+
    text(tx,cy,label,'cote',{transform:`rotate(-90 ${n(tx)} ${n(cy)})`});
}
function leader(px,py,tx,ty,label,cls='cote') {
  return line(tx,ty,px,py,'fin',{'marker-end':'url(#fleche)'})+text(tx,ty-2/S,label,cls);
}
function axes(x,y,ends) {
  let out=text(x-5,y+6,'O','petit');
  for(const [label,dx,dy] of ends)out+=line(x,y,x+dx,y+dy,'fin',{'marker-end':'url(#fleche)'})+text(x+dx*1.27,y+dy*1.27,label,'petit');
  return out;
}
function moduleLabel(x,y,short=false) {
  return tag(x,y-7,'08')+text(x,y+2,short?'enveloppe réservée':'module avant — enveloppe réservée','petit')+text(x,y+10,'non détaillé','petit');
}
function dessus() {
  let b='';
  // Seule la face supérieure noire du pare-chocs est visible du dessus.
  const keys=['plancher','cloison','pare-chocs-noir','support-moteurs','moteur-','rail-','batterie','commande','distribution','controleur-','axe-roue-','roue-','poulie-','flanc-','arceau-','pod-','fourche-'];
  for(const key of keys)for(const v of vs.filter(v=>v.id===key||key.endsWith('-')&&v.id.startsWith(key))) b+=projectXY(v);
  // Courroies symboliques : largeur égale à celle des poulies ; épaisseur non définie.
  for(const side of ['G','D']) {
    const pul=vs.filter(v=>v.pulley&&v.id.includes(`-${side}-`));
    const yy=-mid(pul[0].y);
    b+=line(pul[0].cx,yy,pul.at(-1).cx,yy,'fin',{'stroke':'#6b7280','stroke-width':span(pul[0].y)});
    for(const v of pul)b+=line(v.cx,-v.y[1],v.cx,-v.y[0],'fin',{'stroke':'#fff','stroke-width':.18/S});
  }
  for(const v of vs.filter(v=>v.pxy))b+=projectXY(v);
  b+=capotFantome(([x,y])=>[x,-y]);
  b+=projectXY(vs.find(v=>v.id==='module-08'));
  const cut=vs.find(v=>v.id==='sectionnement');b+=rect(cut.x[0],-cut.y[1],span(cut.x),span(cut.y),'09',{class:'fantome',fill:'none'});
  b+=line(-10,0,g.enveloppe.L+9,0,'axe');
  for(const x of w.axes_x)b+=line(x,-f.y_abs[1]-7,x,f.y_abs[1]+7,'axe');
  b+=line(m.axe_x,-m.y_abs-7,m.axe_x,m.y_abs+7,'axe');
  b+=tag(mid(g.batterie.x),-mid(g.batterie.y),'04');
  b+=tag(mid(g.commande.x),-mid(g.commande.y),'05');
  b+=tag(mid(g.distribution.x),-mid(g.distribution.y),'05');
  for(const v of vs.filter(v=>v.id.startsWith('controleur-')))b+=text(mid(v.x),-mid(v.y),`06 ${v.id.endsWith('G')?'G':'D'}`,'repere');
  for(const v of vs.filter(v=>v.id.startsWith('moteur-')))b+=tag(mid(v.x),-mid(v.y),'02');
  for(const v of vs.filter(v=>v.id.startsWith('pod-')))b+=tag(mid(v.x),-mid(v.y),'07');
  b+=tag(mid(g.chassis.plancher.x)+span(g.batterie.x)/2,0,'01');
  b+=moduleLabel(m.axe_x,0,true);
  b+=leader(mid(cut.x),0,-3,-55,'09 V','petit');
  b+=leader(mid(vs.find(v=>v.id==='arceau-G').x),-mid(g.arceaux.y_abs),260,-82,'11','petit');
  b+=leader(mid(f.platines.x),-f.platines.y_abs[1],110,-116,`03 · platines ajourées ${f.platines.statut}`,'petit');
  b+=dh(0,g.enveloppe.L,-f.y_abs[1]-39,0,-mid(g.fourches.y_abs),status(g.enveloppe.L,g.enveloppe.statut));
  b+=dh(0,g.enveloppe.L_sans_fourches,-f.y_abs[1]-20,0,-m.y_abs,`${status(g.enveloppe.L_sans_fourches,g.enveloppe.statut)} sans fourches`);
  b+=dv(-f.y_abs[1],f.y_abs[1],-32,g.flancs.x[0],g.flancs.x[0],status(g.enveloppe.l,g.enveloppe.statut));
  b+=dv(-w.voie_y,w.voie_y,g.enveloppe.L+24,Math.max(...w.axes_x),Math.max(...w.axes_x),`voie ${status(w.voie,w.statut)}`);
  b+=dh(...w.axes_x,f.y_abs[1]+20,f.y_abs[1],f.y_abs[1],`${status(w.empattement,w.statut)} · empattement`);
  b+=dh(0,w.axes_x[0],f.y_abs[1]+38,0,f.y_abs[1],`X ${status(w.axes_x[0],w.statut)}`);
  b+=dh(0,w.axes_x[1],f.y_abs[1]+56,0,f.y_abs[1],`X ${status(w.axes_x[1],w.statut)}`);
  b+=axes(g.enveloppe.L-29,f.y_abs[1]+30,[['X',20,0],['Y',0,-20]]);
  return b;
}
function cote({dimensions=true,variant=false}={}) {
  let b='';
  // Arrière-plan vers premier plan : module central, caisse, arceau droit,
  // roues, flanc extérieur droit, pods et fourches.
  for(const id of ['plancher','cloison','pare-chocs-bleu','pare-chocs-noir'])b+=profileXZ(vs.find(v=>v.id===id));
  b+=profileXZ(vs.find(v=>v.id==='capot'),{fill:'none',class:'cache'});
  if(!variant)b+=circle(m.axe_x,-m.axe_z,m.rayon,{fill:C['08']});
  b+=profileXZ(vs.find(v=>v.id==='arceau-D'));
  for(const x of w.axes_x) {
    b+=circle(x,-w.axe_z,w.diametre/2,{fill:C['02']});
    b+=circle(x,-w.axe_z,w.jante_diametre/2,{fill:'#fafafa',class:'fin'});
  }
  b+=profileXZ(vs.find(v=>v.id==='platine-D'));
  b+=profileXZ(vs.find(v=>v.id==='flanc-D'));
  // Arêtes derrière le flanc en traits cachés ; pas de trou fictif en XZ.
  b+=el('g',{'clip-path':'url(#masque-flanc)'},profileXZ(vs.find(v=>v.id==='platine-D'),{class:'cache',fill:'none'}));
  // Les arcs cachés sont strictement limités au profil occultant du flanc.
  b+=el('g',{'clip-path':'url(#masque-flanc)'},w.axes_x.map(x=>circle(x,-w.axe_z,w.diametre/2,{class:'cache'})+circle(x,-w.axe_z,w.jante_diametre/2,{class:'cache'})).join(''));
  // Stries : symboles de surface, dimensions non définies ; aucun perçage ajouté.
  for(let i=0;i<f.stries.n;i++) {
    const x=f.stries.x0+i*f.stries.pas;
    b+=line(x,-f.stries.z0,x-f.stries.pas,-(f.stries.z0+f.stries.pas),'fin',{'stroke':'white','stroke-width':.8/S});
  }
  b+=profileXZ(vs.find(v=>v.id==='pod-D'))+profileXZ(vs.find(v=>v.id==='fourche-D'));
  b+=profileXZ(vs.find(v=>v.id==='sectionnement'),{fill:'none',class:'fantome'});
  b+=line(-10,0,g.enveloppe.L+8,0,'fin');
  if(!variant) {
    b+=line(m.axe_x,-m.axe_z-m.rayon-7,m.axe_x,-m.axe_z+m.rayon+7,'axe');
    b+=line(m.axe_x-m.rayon-7,-m.axe_z,m.axe_x+m.rayon+7,-m.axe_z,'axe');
    const labelX=m.axe_x+m.rayon*.55;
    b+=tag(labelX,-m.axe_z-12,'08')+text(labelX,-m.axe_z-3,'enveloppe','petit')+
      text(labelX,-m.axe_z+5,'réservée','petit')+text(labelX,-m.axe_z+13,'non détaillé','petit');
  }
  for(const x of w.axes_x)b+=line(x,-w.diametre-5,x,6,'axe')+line(x-w.diametre/2-4,-w.axe_z,x+w.diametre/2+4,-w.axe_z,'axe');
  if(!dimensions)return b;
  b+=dv(-g.enveloppe.h,0,g.enveloppe.L+21,m.axe_x,g.enveloppe.L,`${status(g.enveloppe.h,m.statut)} · 08`);
  const topArceau=Math.max(...g.arceaux.profil_xz.map(p=>p[1]));
  b+=dv(-topArceau,0,-20,g.arceaux.profil_xz.find(p=>p[1]===topArceau)[0],0,`${status(topArceau,g.arceaux.statut)} · 11`);
  b+=dv(-g.capot.z[1],0,-42,g.capot.x[0],0,`${status(g.capot.z[1],g.capot.statut)} caisse`);
  b+=leader(w.axes_x[0]+w.diametre/2/Math.sqrt(2),-w.axe_z-w.diametre/2/Math.sqrt(2),80,-78,`Ø${status(w.diametre,w.statut_diametre)}`);
  b+=leader(m.axe_x,-m.axe_z-m.rayon,290,-125,`Ø${status(2*m.rayon,m.statut)}`);
  b+=leader(m.axe_x,-m.axe_z,306,-80,`axe 08 (${fmt(m.axe_x)} ; ${fmt(m.axe_z)}) ${m.statut}`,'petit');
  b+=leader(mid(g.capot.x),-g.capot.z[1],95,-108,`10 · capot plat ${g.capot.statut}`,'petit');
  b+=leader(mid(g.sectionnement.x),-g.sectionnement.z[1],28,-126,`09 ${g.sectionnement.statut}`,'petit');
  b+=leader(g.chassis.plancher.x[0],-g.chassis.plancher.z[0],24,18,`plancher ${status(g.garde_sol.plancher,g.garde_sol.statut)}`,'petit');
  b+=leader(mid(g.flancs.x),-g.garde_sol.flancs,125,18,`flancs ${status(g.garde_sol.flancs,g.garde_sol.statut)}`,'petit');
  b+=leader(g.pods.x[0],-g.garde_sol.pods,224,18,`pods ${status(g.garde_sol.pods,g.garde_sol.statut)}`,'petit');
  b+=dh(0,w.axes_x[0],36,0,0,`X ${status(w.axes_x[0],w.statut)}`);
  b+=dh(w.axes_x[0],w.axes_x[1],36,0,0,status(w.empattement,w.statut));
  b+=dh(0,w.axes_x[1],55,0,0,`X ${status(w.axes_x[1],w.statut)}`);
  b+=axes(g.enveloppe.L-32,-111,[['X',19,0],['Z',0,-19]]);
  return b;
}
function face() {
  let b='';
  for(const id of ['plancher','capot','cloison','sectionnement'])b+=projectYZ(vs.find(v=>v.id===id));
  for(const prefix of ['roue-','flanc-','rail-','arceau-'])for(const v of vs.filter(v=>v.id.startsWith(prefix)&&(!v.wheel||v.cx===Math.max(...w.axes_x))))b+=projectYZ(v);
  // En face avant, les roues avant masquent les platines situées entre essieux.
  for(const v of vs.filter(v=>v.pxy)) {
    const tyre=vs.find(q=>q.wheel&&q.cx===Math.max(...w.axes_x)&&Math.sign(mid(q.y))===Math.sign(mid(v.y)));
    for(const [y0,y1,hidden] of [[v.y[0],Math.max(v.y[0],tyre.y[0]),false],
      [Math.max(v.y[0],tyre.y[0]),Math.min(v.y[1],tyre.y[1]),true],
      [Math.min(v.y[1],tyre.y[1]),v.y[1],false]]) {
      if(y1>y0)b+=projectYZ({...v,y:[y0,y1]},{class:hidden?'cache':'contour',fill:hidden?'none':v.color});
    }
  }
  b+=projectYZ(vs.find(v=>v.id==='module-08'));
  for(const prefix of ['pod-','fourche-'])for(const v of vs.filter(v=>v.id.startsWith(prefix)))b+=projectYZ(v);
  b+=line(0,-g.enveloppe.h-6,0,8,'axe')+line(-g.enveloppe.l/2-8,0,g.enveloppe.l/2+8,0,'fin');
  b+=line(-m.y_abs-7,-m.axe_z,m.y_abs+7,-m.axe_z,'axe');
  for(const s of [-1,1])b+=line(s*w.voie_y,-w.diametre-5,s*w.voie_y,7,'axe');
  b+=moduleLabel(0,-m.axe_z,true);
  b+=dh(-m.y_abs,m.y_abs,-g.enveloppe.h-16,-g.enveloppe.h,-g.enveloppe.h,`${status(2*m.y_abs,m.statut)} · 08`);
  b+=dh(-g.chassis.rails_int.y_abs[1],g.chassis.rails_int.y_abs[1],20,-g.capot.z[1],-g.capot.z[1],`${status(2*g.chassis.rails_int.y_abs[1],g.chassis.statut)} · rails ext.`);
  b+=dh(-w.voie_y,w.voie_y,39,0,0,`voie ${status(w.voie,w.statut)}`);
  b+=dh(-g.enveloppe.l/2,g.enveloppe.l/2,58,-g.garde_sol.flancs,-g.garde_sol.flancs,status(g.enveloppe.l,g.enveloppe.statut));
  b+=dv(-g.enveloppe.h,0,140,m.y_abs,g.enveloppe.l/2,status(g.enveloppe.h,m.statut));
  b+=dv(-Math.max(...g.arceaux.profil_xz.map(p=>p[1])),0,-135,-g.arceaux.y_abs[1],-g.enveloppe.l/2,`${status(Math.max(...g.arceaux.profil_xz.map(p=>p[1])),g.arceaux.statut)} · 11`);
  b+=leader(g.chassis.rails_int.y_abs[1],-g.capot.z[1],142,-36,`caisse ${status(g.capot.z[1],g.capot.statut)}`,'petit');
  b+=axes(-128,-113,[['Y',19,0],['Z',0,-19]]);
  return b;
}

// Axonométrie orthographique : azimut 25°, élévation 30°. Les bases sont
// orthonormées ; la même échelle papier est appliquée aux quatre projections.
const az=25*Math.PI/180, elev=30*Math.PI/180;
const iso=([x,y,z])=>[Math.cos(az)*x-Math.sin(az)*y,Math.sin(elev)*(Math.sin(az)*x+Math.cos(az)*y)-Math.cos(elev)*z];
const depth=([x,y,z])=>Math.cos(elev)*(Math.sin(az)*x+Math.cos(az)*y)+Math.sin(elev)*z;
function faces(v) {
  if(v.pxy) {
    const result=[],push=(points,holes=[])=>result.push({v,points,holes,barrel:false,d:points.reduce((a,p)=>a+depth(p),0)/points.length});
    for(const z of v.z)push(v.pxy.map(([x,y])=>[x,y,z]),(v.holesXY??[]).map(p=>p.map(([x,y])=>[x,y,z])));
    for(const p of [v.pxy,...(v.holesXY??[])])for(let i=0;i<p.length;i++) {
      const q=p[i],r=p[(i+1)%p.length];
      push([[...q,v.z[0]],[...r,v.z[0]],[...r,v.z[1]],[...q,v.z[1]]]);
    }
    return result;
  }
  const result=[],base=v.p,top=base.map(([x,z])=>[x,v.y[1],z]),bottom=base.map(([x,z])=>[x,v.y[0],z]);
  const push=(points,holes=[],barrel=false)=>result.push({v,points,holes,barrel,d:points.reduce((a,p)=>a+depth(p),0)/points.length});
  push(top,(v.holes??[]).map(p=>p.map(([x,z])=>[x,v.y[1],z])));
  push(bottom,(v.holes??[]).map(p=>p.map(([x,z])=>[x,v.y[0],z])));
  for(const p of [base,...(v.holes??[])])for(let i=0;i<p.length;i++) {
    const q=p[i],r=p[(i+1)%p.length];
    push([[q[0],v.y[0],q[1]],[r[0],v.y[0],r[1]],[r[0],v.y[1],r[1]],[q[0],v.y[1],q[1]]],[],v.cylinder);
  }
  return result;
}
function ensemble() {
  const mesh=vs.filter(v=>!['capot','sectionnement'].includes(v.id)).flatMap(faces).sort((a,b)=>a.d-b.d);
  let b=mesh.map(({v,points,holes,barrel})=>{
    const fill=v.color??C[v.rep];
    return el('path',{d:[points,...holes].map(p=>pathD(p.map(iso))).join(' '),fill,'fill-rule':'evenodd','data-piece':v.id,class:barrel?undefined:'contour',stroke:barrel?(v.rep==='08'?'none':fill):undefined,'stroke-width':barrel?.15/S:undefined});
  }).join('');
  // Jantes issues de jante_diametre ; aucun détail de moyeu ou de fixation ajouté.
  for(const v of vs.filter(v=>v.wheel&&v.y[0]>0))b+=poly(ring(v.cx,v.cz,w.jante_diametre/2).map(([x,z])=>iso([x,v.y[1],z])),'02',{fill:'#fafafa',class:'fin'});
  // Redessiner les flancs au premier plan pour occulter les jantes au bon endroit.
  const near=vs.find(v=>v.id==='flanc-G');
  b+=poly(near.p.map(([x,z])=>iso([x,near.y[1],z])),'03');
  for(let i=0;i<f.stries.n;i++) {
    const x=f.stries.x0+i*f.stries.pas,p=iso([x,near.y[1],f.stries.z0]),q=iso([x-f.stries.pas,near.y[1],f.stries.z0+f.stries.pas]);
    b+=line(...p,...q,'fin',{'stroke':'white','stroke-width':.8/S});
  }
  const c=g.capot;
  b+=capotFantome(iso);
  for(const fc of faces(vs.find(v=>v.id==='sectionnement')))b+=poly(fc.points.map(iso),'09',{class:'fantome',fill:'none'});
  const anchors=[
    ['01',[g.chassis.plancher.x[0],0,g.chassis.plancher.z[0]],[-65,37]],
    ['02',[w.axes_x[0],w.voie_y,w.diametre],[-20,-53]],
    ['03',[mid(f.x),near.y[1],f.profil_xz[0][1]],[-25,103]],
    ['04',[mid(g.batterie.x),0,g.batterie.z[1]],[62,-90]],
    ['05',[mid(g.distribution.x),mid(g.distribution.y),g.distribution.z[1]],[135,-80]],
    ['06',[mid(g.controleurs.x),mid(g.controleurs.y_abs),g.controleurs.z[1]],[27,-83]],
    ['07',[mid(g.pods.x),mid(g.pods.y_abs),g.pods.z[1]],[201,143]],
    ['08',[m.axe_x,0,m.axe_z+m.rayon],[299,-54]],
    ['09',[mid(g.sectionnement.x),0,g.sectionnement.z[1]],[-40,-26]],
    ['10',[c.x[1],c.y[0],c.z[1]],[271,-2]],
    ['11',[g.arceaux.profil_xz[4][0],g.arceaux.y_abs[1],g.arceaux.profil_xz[4][1]],[185,-84]],
    ['12',[g.enveloppe.L,mid(g.fourches.y_abs),g.garde_sol.fourches],[337,122]],
  ];
  for(const [rep,p,q] of anchors) {
    b+=line(...iso(p),...q,'fin')+circle(...q,3.1/S,{fill:'white',class:'fin'})+tag(...q,rep);
  }
  b+=axes(335,-67,[['X',Math.cos(az)*23,Math.sin(elev)*Math.sin(az)*23],['Y',-Math.sin(az)*23,Math.sin(elev)*Math.cos(az)*23],['Z',0,-Math.cos(elev)*23]]);
  return b;
}
function variante() {
  const o=g.option_levage,p=o.palette,v=o.pivot;
  // Contexte identique ; module 08 absent dans cette variante.
  let b=profileXZ(vs.find(v=>v.id==='pod-D'))+profileXZ(vs.find(v=>v.id==='fourche-D'));
  b+=line(g.arceaux.profil_xz[0][0]-5,0,g.enveloppe.L+6,0,'fin');
  for(const [i,angle] of [p.angle_repos_deg,p.angle_haut_deg].entries()) {
    b+=el('g',{transform:`translate(${v.x} ${-v.z}) rotate(${-angle})`},rect(0,-p.epaisseur/2,p.longueur,p.epaisseur,'12',{rx:p.rayon_bord,class:i?'contour':'cache',fill:i?C['12']:'none'}));
    const a=angle*Math.PI/180;
    b+=text(v.x+Math.cos(a)*p.longueur+13,-v.z-Math.sin(a)*p.longueur+(i?5:6),`${fmt(angle)}° ${o.statut}`,'cote');
  }
  b+=circle(v.x,-v.z,1.1/S,{fill:'white',class:'fin'});
  b+=leader(v.x,-v.z,v.x-25,-61,`pivot (${fmt(v.x)} ; ${fmt(v.z)}) ${o.statut}`,'petit');
  b+=leader(v.x+p.longueur/2,-v.z-p.epaisseur/2,v.x+p.longueur+48,-22,`palette L ${status(p.longueur,o.statut)}`,'petit');
  return b;
}
function svg(width,height,title,body) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n'+el('svg',{xmlns:'http://www.w3.org/2000/svg',width:`${width}mm`,height:`${height}mm`,viewBox:`0 0 ${width} ${height}`,role:'img','aria-labelledby':'titre description'},el('title',{id:'titre'},esc(`${g.meta.nom} — ${title}`))+el('desc',{id:'description'},esc(`${g.meta.repere} ${g.meta.avertissement} Échelle commune 1:2,5 ; dimensions en ${g.meta.unite}, statuts selon le JSON. Module avant : enveloppe réservée, non détaillé. Platines trapézoïdales ajourées symétriques. Pare-chocs bleu Z ${g.pare_chocs.z_bleu.map(fmt).join('–')}, noir jusqu’à ${fmt(g.pare_chocs.z[1])}. Capot retiré du dessus et de l’axonométrie, contour fantôme avec ${g.capot.ouies.n} ouïes par côté, largeur ${fmt(g.capot.ouies.largeur)}, pas ${fmt(g.capot.ouies.pas)}.`))+defs+el('rect',{width,height,fill:'white'})+body)+'\n';
}
const date=g.meta.date.split('-').reverse().join('/');
const title=(x,y,t)=>text(x,y,t,'titre');
const note=(x,y,t)=>text(x,y,t,'note');
await mkdir(new URL('svg/',import.meta.url),{recursive:true});
const top=dessus(),side=cote(),front=face(),axon=ensemble(),variant=variante();
const individual=[
  ['vue_dessus.svg',210,163,'DESSUS · capot retiré',group(top,29,83)],
  ['vue_cote.svg',210,106,'CÔTÉ DROIT · flanc au premier plan',group(side,30,73)],
  ['vue_face.svg',174,108,'FACE AVANT',group(front,78,73)],
  ['vue_ensemble.svg',210,128,'ENSEMBLE · capot retiré',group(axon,31,63)],
  ['variante_levage.svg',119,76,'VARIANTE P3 · remplace 08',group(variant,-49,57)],
];
for(const [name,width,height,label,body] of individual) {
  await writeFile(new URL(`svg/${name}`,import.meta.url),svg(width,height,label,title(7,9,`${g.meta.nom} / ${label}`)+note(7,15,`${g.meta.equipe} · Plans ${g.meta.revision} · ${date} · 1:2,5 · ${g.meta.unite}`)+body));
}
let board=el('rect',{x:5,y:5,width:410,height:287,fill:'none',stroke:'#293440','stroke-width':.5});
board+=text(10,13,`${g.meta.nom} / PLANS ${g.meta.revision}`,'entete')+note(210,12,`${g.meta.equipe} · ${g.meta.competition}`);
board+=el('path',{d:'M5 18 H415 M205 18 V250 M5 168 H415 M205 132 H415 M5 250 H415 M5 277 H415',fill:'none',stroke:'#a4afb9','stroke-width':.18});
board+=title(10,25,'A / DESSUS · capot retiré')+group(top,27,92);
board+=title(210,25,'D / ENSEMBLE · capot retiré')+group(axon,240,65);
board+=note(210,126,`10 fantôme · ${g.capot.ouies.n} ouïes/côté · largeur ${fmt(g.capot.ouies.largeur)} · pas ${fmt(g.capot.ouies.pas)} mm`);
board+=note(210,130,'08 : module avant — enveloppe réservée, non détaillé · 09 pointillé · 10 contour fantôme');
board+=title(210,138,'P3 / LEVAGE LENT · option à la place de 08');
board+=group(variant,178,167)+note(343,151,'Palette arrondie, non coupante')+note(343,155,'Principe seulement · statut P');
board+=title(10,175,'B / CÔTÉ DROIT')+group(side,29,224);
board+=title(210,175,'C / FACE AVANT')+group(front,301,224);
board+=title(10,255,'REPÈRES / COULEURS PAR SOUS-ENSEMBLE');
const names=[['01','Châssis'],['02','Roues + transmission'],['03','Flancs + pare-chocs'],['04','Batterie'],['05','Commande + distribution'],['06','Contrôleurs G / D'],['07','Pods'],['08','Module avant — enveloppe'],['09','Coupe-circuit'],['10','Capot (contour seul)'],['11','Arceaux triangulaires'],['12','Fourches passives']];
names.forEach(([rep,label],i)=>{
  const col=Math.floor(i/4),row=i%4,x=10+col*65,y=260+row*3.7;
  board+=el('rect',{x,y:y-2,width:3,height:2.5,fill:C[rep],stroke:'#293440','stroke-width':.18})+text(x+4,y,`${rep}  ${label}`,'papier');
});
board+=title(210,255,'STATUTS / SOURCE UNIQUE : config/geometry.json');
Object.entries(g.meta.statuts).forEach(([code,label],i)=>{board+=text(210,260+i*3.1,`${stamp(code)} — ${label}`,'papier');});
board+=text(10,283,`${g.meta.nom} · ${g.meta.equipe} · Plans ${g.meta.revision}`,'titre');
board+=text(10,287,'Modèle conceptuel — cotes provisoires — non destiné à la fabrication','papier');
board+=note(10,290.5,'O : sol / symétrie / arrière du pare-chocs · X avant / Y gauche / Z haut');
board+=el('path',{d:'M285 277 V292 M335 277 V292 M378 277 V292',fill:'none',stroke:'#293440','stroke-width':.25});
board+=text(289,283,`Date : ${date}`,'papier')+text(289,288,`Révision : ${g.meta.revision}`,'papier');
board+=text(339,283,'Échelle : 1:2,5','papier')+text(339,288,`Unité : ${g.meta.unite}`,'papier');
board+=text(382,283,'A3 paysage','papier')+text(382,288,'Feuille 1 / 1','papier');
await writeFile(new URL('svg/planche_A3.svg',import.meta.url),svg(420,297,'Planche A3 paysage',board));
await writeFile(new URL('planche_A3.html',import.meta.url),`<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(g.meta.nom)} — Plans ${esc(g.meta.revision)} — A3</title>
<style>@page { size: A3 landscape; margin: 0 } *{box-sizing:border-box} html,body{margin:0;padding:0} img{display:block;width:420mm;height:297mm} @media screen{body{background:#e5e7eb}img{max-width:100%;height:auto;margin:auto;box-shadow:0 2px 24px #0002}} @media print{html,body{width:420mm;height:297mm;background:white}img{max-width:none;break-inside:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}}</style></head>
<body><img src="svg/planche_A3.svg" alt="${esc(g.meta.nom)} — ${esc(g.meta.equipe)} : plans ${esc(g.meta.revision)}, quatre vues, variante de levage P3, repères 01 à 12 et cotes provisoires en millimètres."></body></html>\n`);
console.log(`${g.meta.nom} : 6 SVG et planche_A3.html générés ; échelle commune 1:2,5, source config/geometry.json.`);
