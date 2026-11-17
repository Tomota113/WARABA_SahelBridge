// Source commune aux projections et aux contrôles. Toutes les dimensions viennent du JSON.
import { readFile } from 'node:fs/promises';
export const g = JSON.parse(await readFile(new URL('../config/geometry.json', import.meta.url), 'utf8'));
export const span = a => a[1] - a[0];
export const mid = a => (a[0] + a[1]) / 2;
export const fmt = x => Number(x.toFixed(3)).toString().replace('.', ',');
export const signed = (a, s) => s > 0 ? [...a] : [-a[1], -a[0]];
export const rectXZ = (x,z) => [[x[0],z[0]],[x[1],z[0]],[x[1],z[1]],[x[0],z[1]]];
export const ring = (x,z,r,n=128) => Array.from({length:n},(_,i)=>[x+r*Math.cos(i*2*Math.PI/n),z+r*Math.sin(i*2*Math.PI/n)]);
export const extents = p => ({x:[Math.min(...p.map(q=>q[0])),Math.max(...p.map(q=>q[0]))],z:[Math.min(...p.map(q=>q[1])),Math.max(...p.map(q=>q[1]))]});
const profile = (id,rep,p,y,extra={}) => ({id,rep,p,y,...extents(p),...extra});
const box = (id,rep,v,extra={}) => profile(id,rep,rectXZ(v.x,v.z),v.y,extra);
const cyl = (id,rep,x,z,r,y,extra={}) => profile(id,rep,ring(x,z,r),y,{cx:x,cz:z,r,cylinder:true,...extra});
export function podProfile() {
  const {x,z,chanfrein:c}=g.pods;
  return [[x[0],z[0]],[x[1]-c,z[0]],[x[1],z[0]+c],[x[1],z[1]],[x[0],z[1]]];
}
// Seule cote de forme absente du JSON : retrait extérieur de 8 mm, demandé
// explicitement pour les plans. Le miroir porte sur tout le profil et son ajour.
export const retraitPlatine = 8;
export function platineXY(s=1) {
  const {x,y_abs:y}=g.flancs.platines;
  return [[x[0],y[0]],[x[1],y[0]],[x[1]-retraitPlatine,y[1]],[x[0]+retraitPlatine,y[1]]].map(([x,y])=>[x,s*y]);
}
export function ouiesXY() {
  const v=g.capot.ouies,out=[];
  for(const s of [-1,1])for(let i=0;i<v.n;i++) {
    const x=v.x0+i*v.pas,y=s*v.y_abs;
    out.push(rectXZ([x,x+v.largeur],[y-v.longueur/2,y+v.longueur/2]));
  }
  return out;
}
// Enveloppes pleines conservatrices des courroies : elles englobent poulies et
// brins, sans supposer une épaisseur ou un routage mécanique non fournis.
export function enveloppesCourroies() {
  const t=g.transmission,w=g.roues,r=t.poulies.diametre/2;
  const zs=t.poulies.x.map(x=>w.axes_x.includes(x)?w.axe_z:t.moteurs.z);
  return [-1,1].map(s=>box(`courroie-${s>0?'G':'D'}`,'02',{
    x:[Math.min(...t.poulies.x)-r,Math.max(...t.poulies.x)+r],
    y:signed(t.poulies.y_abs,s),z:[Math.min(...zs)-r,Math.max(...zs)+r],
  },{conservative:true}));
}
export function volumes() {
  const c=g.chassis,t=g.transmission,w=g.roues,out=[
    box('plancher','01',c.plancher),box('cloison','01',c.cloison_av),
    box('pare-chocs-bleu','03',{...g.pare_chocs,z:g.pare_chocs.z_bleu},{color:'#6f9ad8'}),
    box('pare-chocs-noir','03',{...g.pare_chocs,z:[g.pare_chocs.z_bleu[1],g.pare_chocs.z[1]]},{color:'#252a30'}),
    box('support-moteurs','02',t.support,{color:'#9aa3ad'}),
    ...['batterie','commande','distribution','sectionnement','capot'].map(k=>box(k,g[k].rep,g[k])),
    cyl('module-08','08',g.module_avant.axe_x,g.module_avant.axe_z,g.module_avant.rayon,[-g.module_avant.y_abs,g.module_avant.y_abs]),
  ];
  for(const s of [-1,1]) {
    const side=s>0?'G':'D',y=v=>signed(v.y_abs,s);
    out.push(box(`rail-${side}`,'01',{...c.rails_int,y:y(c.rails_int)}));
    out.push(profile(`flanc-${side}`,'03',g.flancs.profil_xz,y(g.flancs)));
    out.push(box(`platine-${side}`,'03',{...g.flancs.platines,y:y(g.flancs.platines)},
      {pxy:platineXY(s),holesXY:[g.flancs.platines.ajour_xy.map(([x,y])=>[x,s*y])],color:'#4b5563',conservative:true}));
    out.push(profile(`arceau-${side}`,'11',g.arceaux.profil_xz,y(g.arceaux),{holes:[g.arceaux.evidement_xz]}));
    out.push(profile(`pod-${side}`,'07',podProfile(),y(g.pods)));
    out.push(profile(`fourche-${side}`,'12',g.fourches.profil_xz,y(g.fourches)));
    out.push(box(`controleur-${side}`,'06',{...g.controleurs,y:y(g.controleurs)}));
    out.push(cyl(`moteur-${side}`,'02',t.moteurs.x,t.moteurs.z,t.moteurs.diametre/2,y(t.moteurs),{color:'#9aa3ad'}));
    for(const x of w.axes_x) {
      out.push(cyl(`roue-${side}-${x}`,'02',x,w.axe_z,w.diametre/2,signed([w.voie_y-w.largeur/2,w.voie_y+w.largeur/2],s),{wheel:true,color:'#e9a197'}));
      out.push(cyl(`axe-roue-${side}-${x}`,'02',x,w.axe_z,g.flancs.axes_roues.diametre/2,signed([c.rails_int.y_abs[1],g.flancs.y_abs[0]],s),{color:'#6b7280'}));
    }
    for(const x of t.poulies.x) {
      // Coaxialité : poulies de roues à axe_z ; poulie motrice à moteurs.z.
      const z=w.axes_x.includes(x)?w.axe_z:t.moteurs.z;
      out.push(cyl(`poulie-${side}-${x}`,'02',x,z,t.poulies.diametre/2,y(t.poulies),{pulley:true,color:'#6b7280'}));
    }
  }
  return out;
}
export function limites(vs=volumes()) {
  return Object.fromEntries(['x','y','z'].map(k=>[k,[Math.min(...vs.map(v=>v[k][0])),Math.max(...vs.map(v=>v[k][1]))]]));
}
export function jeux() {
  const w=g.roues,t=g.transmission,m=g.module_avant;
  return {
    rouePod:g.pods.x[0]-(Math.max(...w.axes_x)+w.diametre/2),
    roueRail:w.voie_y-w.largeur/2-g.chassis.rails_int.y_abs[1],
    roueFlanc:g.flancs.y_abs[0]-(w.voie_y+w.largeur/2),
    poulieRoue:w.voie_y-w.largeur/2-t.poulies.y_abs[1],
    poulieRail:t.poulies.y_abs[0]-g.chassis.rails_int.y_abs[1],
    moduleArceau:g.arceaux.y_abs[0]-m.y_abs,
    moduleCapotAxial:m.axe_x-m.rayon-g.capot.x[1],
    moduleCapotReel:Math.hypot(m.axe_x-g.capot.x[1],m.axe_z-g.capot.z[1])-m.rayon,
    moduleSol:m.axe_z-m.rayon,
    batterieMoteur:t.moteurs.x-t.moteurs.diametre/2-g.batterie.x[1],
    batterieCapot:g.capot.z[0]-g.batterie.z[1],
  };
}

// Intersections de profils XZ : triangulation des polygones concaves, puis découpe
// de triangles convexes. Les évidements sont soustraits ; les cylindres sont
// approchés par 128 segments (écart radial max : r*(1-cos(pi/128))).
const EPS=1e-8;
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
export const area=p=>Math.abs(signedArea(p));
function signedArea(p){return p.reduce((a,q,i)=>{const r=p[(i+1)%p.length];return a+q[0]*r[1]-r[0]*q[1];},0)/2;}
function ccw(p){return signedArea(p)<0?[...p].reverse():[...p];}
function insideTriangle(p,a,b,c){return cross(a,b,p)>=-EPS&&cross(b,c,p)>=-EPS&&cross(c,a,p)>=-EPS;}
export function triangulate(poly) {
  const p=ccw(poly),out=[];
  while(p.length>3) {
    let found=false;
    for(let i=0;i<p.length;i++) {
      const a=p[(i+p.length-1)%p.length],b=p[i],c=p[(i+1)%p.length];
      if(cross(a,b,c)<=EPS) continue;
      if(p.some(q=>q!==a&&q!==b&&q!==c&&insideTriangle(q,a,b,c))) continue;
      out.push([a,b,c]);p.splice(i,1);found=true;break;
    }
    if(!found) throw new Error('Profil dégénéré ou auto-intersectant');
  }
  if(p.length===3) out.push(p);
  return out;
}
function convexIntersection(subject,clip) {
  let out=subject;
  for(let i=0;i<clip.length&&out.length;i++) {
    const a=clip[i],b=clip[(i+1)%clip.length],input=out;out=[];
    for(let j=0;j<input.length;j++) {
      const p=input[j],q=input[(j+1)%input.length],cp=cross(a,b,p),cq=cross(a,b,q);
      if(cp>=-EPS) out.push(p);
      if((cp>EPS&&cq< -EPS)||(cp< -EPS&&cq>EPS)) {
        const t=cp/(cp-cq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);
      }
    }
  }
  return out;
}
const tris=new WeakMap();
const triangles=p=>{if(!tris.has(p))tris.set(p,triangulate(p));return tris.get(p);};
export function intersectionArea(p,q) {
  let a=0;
  for(const t of triangles(p))for(const u of triangles(q))a+=area(convexIntersection(t,u));
  return a;
}
export function interference(a,b) {
  const d=Object.fromEntries(['x','y','z'].map(k=>[k,Math.min(a[k][1],b[k][1])-Math.max(a[k][0],b[k][0])]));
  if(Object.values(d).some(x=>x<=EPS)) return null;
  // Les platines XY sont testées par leur boîte pleine : une absence de
  // recouvrement certifie le dégagement, même sans profiter du trapèze/ajour.
  // Un résultat positif reste un candidat conservateur, à signaler comme tel.
  let aXZ=intersectionArea(a.p,b.p);
  for(const h of a.holes??[])aXZ-=intersectionArea(h,b.p);
  for(const h of b.holes??[])aXZ-=intersectionArea(a.p,h);
  for(const h of a.holes??[])for(const j of b.holes??[])aXZ+=intersectionArea(h,j);
  return aXZ>EPS?{d,area:aXZ,volume:aXZ*d.y,conservative:!!(a.conservative||b.conservative)}:null;
}
export const expectedOverlap=(a,b)=>{
  const ids=[a.id,b.id].sort();
  if(ids.some(x=>x.startsWith('fourche-'))&&ids.some(x=>x.startsWith('pod-')))return 'Engagement volontaire de la fourche dans le pod ; logement non détaillé';
  if(ids.some(x=>x.startsWith('axe-roue-'))&&ids.some(x=>x.startsWith('roue-')||x.startsWith('poulie-')))return 'Liaison coaxiale d’assemblage ; alésages non détaillés';
  return null;
};
