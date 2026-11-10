(function(){
"use strict";
const $=s=>document.querySelector(s);
const NS='http://www.w3.org/2000/svg';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const sstep=x=>{x=clamp(x,0,1);return x*x*(3-2*x)};
function mix(c1,c2,t){t=clamp(t,0,1);const p=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));const a=p(c1),b=p(c2);return '#'+a.map((v,i)=>Math.round(lerp(v,b[i],t)).toString(16).padStart(2,'0')).join('')}
function el(tag,attrs,parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e}

/* ---------- état ---------- */
const BASE={alloy:'sac',wireD:.8,flux:'core',set:340,power:45,tip:'cone',leadD:.8,pad:'std'};
let S=Object.assign({},BASE),P=Phys.params(S),VR=Phys.vrange(P),tip=Phys.newTip(P),joints=[0,1,2,3].map(i=>Phys.newJoint(i,P)),sel=0;
const u={iron:false,wire:false,shake:false};
const liq=()=>P.A.melt;
const journal=[],hist=[];

/* ---------- carte : vue de dessus légèrement inclinée, support mains libres ---------- */
const K=10;                       // px par mm
const RY=.62;                     // écrasement vertical des ellipses (inclinaison)
const POS=[[250,205],[400,205],[250,305],[400,305]];
const PADR=[13,13,19,13];
const LABOFF=[[-80,-96],[10,-96],[-80,34],[28,30]];
const mono='ui-monospace,Menlo,Consolas,monospace';
(function(){
  const g=$('#board');
  // support mains libres : base en croix, montants, mâchoires crantées, repose-fer à ressort
  el('ellipse',{cx:380,cy:470,rx:330,ry:14,fill:'#0b1f2e',opacity:.10},g);
  el('rect',{x:90,y:452,width:580,height:22,rx:11,fill:'#1c1d20'},g);
  el('polygon',{points:'352,404 408,404 446,454 314,454',fill:'#2a2c31'},g);
  [[96,466],[646,466]].forEach(([x,y])=>el('ellipse',{cx:x+9,cy:y+8,rx:12,ry:5,fill:'#0b0c0e'},g));
  [156,606].forEach(x=>{
    el('rect',{x:x-8,y:300,width:16,height:156,fill:'#0f9d94'},g);
    el('rect',{x:x-8,y:300,width:5,height:156,fill:'#fff',opacity:.18},g);
    el('circle',{cx:x,cy:322,r:14,fill:'#0b7f78',stroke:'#085c57','stroke-width':1.5},g);
    el('circle',{cx:x,cy:322,r:5,fill:'#cfd5da'},g);
  });
  // repose-fer à ressort (à droite)
  el('rect',{x:690,y:330,width:12,height:124,fill:'#0f9d94'},g);
  for(let i=0;i<9;i++){const y=338+i*11;el('ellipse',{cx:696,cy:y,rx:26,ry:8,fill:'none',stroke:'#4b535c','stroke-width':3.2},g);el('path',{d:`M670 ${y} A26 8 0 0 0 722 ${y}`,fill:'none',stroke:'#aab3bb','stroke-width':1.5,opacity:.8},g)}
  // carte : tranche, face, masque vert
  el('rect',{x:162,y:350,width:440,height:14,rx:3,fill:'#0d3a28'},g);
  el('rect',{x:162,y:354,width:440,height:3,fill:'#c8a15a',opacity:.8},g);
  el('rect',{x:162,y:108,width:440,height:250,rx:9,fill:'url(#maskg)',stroke:'#0f4a30','stroke-width':1.6},g);
  el('rect',{x:162,y:108,width:440,height:250,rx:9,fill:'url(#fr4)'},g);
  // plan de masse (pad 4)
  el('rect',{x:336,y:262,width:128,height:84,rx:6,fill:'#2f9a6c',stroke:'#e0955a','stroke-width':1.4,'stroke-dasharray':'5 3'},g);
  // pistes (cuivre sous le vernis)
  const tr=(d,w)=>{el('path',{d,fill:'none',stroke:'#0f4a30','stroke-width':(w||7)+3,'stroke-linecap':'round','stroke-linejoin':'round'},g);el('path',{d,fill:'none',stroke:'#58c995','stroke-width':w||7,'stroke-linecap':'round','stroke-linejoin':'round'},g)};
  tr('M250 205 H205 L182 182 V140');
  tr('M400 205 H468 L488 185 H520');
  tr('M250 305 L232 323 H200');
  tr('M464 305 H500 L516 321 H520',8);
  tr('M520 153 H586',5);tr('M520 217 H560 L586 243',5);tr('M520 281 H586',5);
  // pastilles de l'embase (rangée de 2x5), pattes qui dépassent, certaines déjà brasées
  const HX=[520,570],HY=[153,185,217,249,281,313];
  HX.forEach((x,c)=>HY.forEach((y,r)=>{
    el('ellipse',{cx:x,cy:y,rx:10,ry:10*RY,fill:'#e0955a',stroke:'#a8642e','stroke-width':1},g);
    const done=(r<2);
    if(r<5){
      if(done){
        el('path',{d:`M${x-9} ${y+1} Q${x-5} ${y-4} ${x-1.5} ${y-17} L${x+1.5} ${y-17} Q${x+5} ${y-4} ${x+9} ${y+1} A9 5.6 0 0 1 ${x-9} ${y+1}Z`,fill:'#c3ccd3',stroke:'#8b97a1','stroke-width':.8},g);
        el('path',{d:`M${x-4} ${y-2} q1 -7 2 -13`,fill:'none',stroke:'#fff','stroke-width':1.6,'stroke-linecap':'round',opacity:.8},g);
      }else{
        el('ellipse',{cx:x,cy:y,rx:3.4,ry:2,fill:'#0b1f2e'},g);
        el('rect',{x:x-2.5,y:y-30,width:5,height:30,fill:'url(#legg2)'},g);
        el('ellipse',{cx:x,cy:y-30,rx:2.5,ry:1.4,fill:'#eef2f5'},g);
      }
    }else el('ellipse',{cx:x,cy:y,rx:3.4,ry:2,fill:'#0b1f2e'},g);
  }));
  // trous de fixation
  [[190,134],[574,134],[190,332],[574,332]].forEach(([x,y])=>{el('ellipse',{cx:x,cy:y,rx:11,ry:7,fill:'#e0955a'},g);el('ellipse',{cx:x,cy:y,rx:6,ry:3.7,fill:'#e8edf2',stroke:'#0f4a30','stroke-width':1.4},g)});
  // gros pad de cuivre nu (pad 3)
  el('ellipse',{cx:250,cy:305,rx:36,ry:36*RY,fill:'#d9874c',opacity:.95},g);
  // vias
  [[182,140],[520,321]].forEach(([x,y])=>{el('ellipse',{cx:x,cy:y,rx:6,ry:3.7,fill:'#e0955a'},g);el('ellipse',{cx:x,cy:y,rx:2.4,ry:1.5,fill:'#0b1f2e'},g)});
  // sérigraphie
  const txt=(x,y,t,s,o)=>{const e=el('text',{x,y,'font-size':s,'font-weight':700,fill:'#fff',opacity:o||.9,'font-family':mono},g);e.textContent=t;return e};
  txt(214,236,'1',13);txt(364,236,'2',13);txt(204,348,'3',13);txt(380,340,'4',13);
  txt(374,282,'GND',10,.75);txt(514,128,'J1',11);txt(196,118,'LAB BRASAGE',10,.7);
  el('rect',{x:497,y:134,width:98,height:196,rx:4,fill:'none',stroke:'#fff','stroke-width':1.4,opacity:.7},g);
})();

/* ---------- éléments des pads ---------- */
const E=[];
POS.forEach((p,i)=>{
  const g=el('g',{transform:`translate(${p[0]} ${p[1]})`},$('#pads'));
  const glow=el('ellipse',{rx:58,ry:36,fill:'url(#heatg)',opacity:0,cy:-4},g);
  const burn=el('ellipse',{rx:PADR[i]+4,ry:(PADR[i]+4)*RY,fill:'#4a2b17',opacity:0},g);
  const ring=el('ellipse',{rx:PADR[i],ry:PADR[i]*RY,fill:'#e0955a',stroke:'#a8642e','stroke-width':1},g);
  el('ellipse',{rx:4.6,ry:2.8,fill:'#0b1f2e'},g);
  const selr=el('ellipse',{rx:PADR[i]+10,ry:(PADR[i]+10)*RY,fill:'none',stroke:'#0f766e','stroke-width':2,'stroke-dasharray':'5 4'},g);
  const leg=el('rect',{x:-4,y:-46,width:8,height:46,fill:'url(#legg2)'},g);
  const legTop=el('ellipse',{cy:-46,rx:4,ry:2,fill:'#eef2f5'},g);
  const sol=el('path',{d:'',fill:'#c5ced6',stroke:'#8b97a1','stroke-width':1,opacity:0},g);
  const shine=el('path',{d:'',fill:'none',stroke:'#fff','stroke-width':2.5,'stroke-linecap':'round',opacity:0},g);
  const crack=el('path',{d:'',fill:'none',stroke:'#3b434b','stroke-width':1.2,opacity:0},g);
  const hit=el('ellipse',{cx:0,cy:-18,rx:34,ry:44,fill:'transparent',style:'cursor:pointer'},g);
  hit.addEventListener('pointerdown',e=>{e.preventDefault();select(i)});
  const c=el('g',{opacity:0},$('#callouts'));
  const ln=el('line',{x1:p[0],y1:p[1]-14,x2:p[0],y2:p[1]-14,stroke:'#1e293b','stroke-width':1.2},c);
  const rc=el('rect',{x:0,y:0,height:20,rx:10,fill:'#fff',stroke:'#1e293b','stroke-width':1.5},c);
  const tx=el('text',{x:0,y:0,'font-size':11,'font-weight':700,'font-family':'ui-monospace,Menlo,Consolas,monospace',fill:'#1e293b'},c);
  E.push({g,glow,burn,ring,selr,sol,shine,crack,c,rc,tx,ln,leg,legTop});
});

/* ---------- géométrie de la brasure à partir de la physique ---------- */
function bez(P0,P1,P2,t){const a=(1-t)*(1-t),b=2*(1-t)*t,c=t*t;return [a*P0[0]+b*P1[0]+c*P2[0],a*P0[1]+b*P1[1]+c*P2[1]]}
function filletCtrl(R,rl,h,th){
  const r=th*Math.PI/180,cs=Math.cos(r),sn=Math.sin(r);
  const t=cs>0.2?0.55*(R-rl)/cs:0.6*Math.max(R-rl,.3)/Math.max(Math.abs(cs),.25);
  const tt=Math.min(t,h*0.95/Math.max(sn,.2));
  return [R-tt*cs,tt*sn];
}
function filletVol(R,rl,h,th){
  const P0=[R,0],P2=[rl,h],P1=filletCtrl(R,rl,h,th);let V=0,prev=P0;
  for(let k=1;k<=24;k++){const q=bez(P0,P1,P2,k/24);const rm=(q[0]+prev[0])/2,dy=q[1]-prev[1];V+=Math.PI*Math.max(0,rm*rm-rl*rl)*dy;prev=q}
  return V;
}
function shapeParams(j){
  if(j.V<0.06)return null;
  const rp=1.25,rl=P.rl;
  const th=j.hadLiq?j.th:140;
  const Vh=Math.min(j.V,j.H*P.hole),Vf=Math.max(0.06,j.V-Vh);
  if(th>=92){ // goutte non mouillante : calotte sphérique
    const c=Math.cos(th*Math.PI/180);let Rs=Math.cbrt(3*Vf/(Math.PI*(2+c)*(1-c)*(1-c)));
    let a=Rs*Math.sin(th*Math.PI/180),h=Rs*(1-c);
    if(a>rp*1.1){a=rp*1.1;let lo=.05,hi=4;for(let k=0;k<30;k++){const m=(lo+hi)/2;(Math.PI*m/6*(3*a*a+m*m)<Vf)?lo=m:hi=m}h=(lo+hi)/2;Rs=(a*a+h*h)/(2*h)}
    return {cap:true,a,h,Rs,Vf};
  }
  const b=sstep((j.V-3.8)/3);
  const thE=th+100*b;
  const R=Math.min(1.05*rp,Math.sqrt(Vf/(Math.PI*.25)));
  let lo=.05,hi=3.3;
  for(let k=0;k<24;k++){const m=(lo+hi)/2;(filletVol(R,rl,m,thE)<Vf)?lo=m:hi=m}
  return {cap:false,R,h:(lo+hi)/2,thE,Vf};
}
function outline(sp,rl,kx,ky,n){ // points (x,y) de la moitié droite, de la base vers le sommet
  const pts=[];
  if(sp.cap){const psi=Math.atan2(sp.a,sp.Rs-sp.h);for(let k=0;k<=n;k++){const f=psi-2*psi*k/n;pts.push([Math.sin(f)*sp.Rs,sp.h-sp.Rs+Math.cos(f)*sp.Rs])}return pts.map(q=>[q[0]*kx,q[1]*ky])}
  const P0=[sp.R,0],P2=[rl,sp.h],P1=filletCtrl(sp.R,rl,sp.h,sp.thE);
  for(let k=0;k<=n;k++){const q=bez(P0,P1,P2,k/n);pts.push([q[0]*kx,q[1]*ky])}
  return pts;
}
function bodyPath(sp,rl,kx,ky,yb){ // chemin fermé centré sur x=0 ; yb : ordonnée de la base (pixels, y vers le bas)
  const n=22,half=outline(sp,rl,kx,ky,n);
  let d='';
  if(sp.cap){ // calotte : demi-points déjà de droite à gauche
    half.forEach((q,k)=>{d+=(k?'L':'M')+q[0].toFixed(1)+' '+(yb-q[1]).toFixed(1)});
    const a=half[0][0];d+=`A${a.toFixed(1)} ${(a*.62).toFixed(1)} 0 0 0 ${(half[0][0]).toFixed(1)} ${yb}Z`;
    return d;
  }
  half.forEach((q,k)=>{d+=(k?'L':'M')+q[0].toFixed(1)+' '+(yb-q[1]).toFixed(1)});
  for(let k=n;k>=0;k--){d+='L'+(-half[k][0]).toFixed(1)+' '+(yb-half[k][1]).toFixed(1)}
  const R=half[0][0];d+=`A${R.toFixed(1)} ${(R*.62).toFixed(1)} 0 0 0 ${R.toFixed(1)} ${yb}Z`;
  return d;
}

/* ---------- résultats ---------- */
const RES={
 good:{n:'Bonne brasure',tag:'ok',short:'BONNE ✓',d:'Cordon concave et brillant, trou rempli, angle de mouillage faible, couche intermétallique fine : la liaison est fiable.'},
 cold:{n:'Boule froide',tag:'bad',short:'BOULE FROIDE ✗',d:()=>`Le pad n’avait pas atteint la fusion (${liq()} °C) : l’alliage ne mouille pas, il reste en boule (angle de contact élevé) et n’accroche pas.`},
 dry:{n:'Brasure sèche',tag:'bad',short:'SÈCHE ✗',d:'Mouillage partiel : chauffe insuffisante, trou mal rempli ou couche intermétallique trop fine. Liaison fragile et mate.'},
 few:{n:'Pas assez d’alliage',tag:'bad',short:'MANQUE ✗',d:'Volume trop faible : le trou n’est pas rempli et le pad reste visible. Tenue mécanique faible.'},
 excess:{n:'Trop d’alliage',tag:'bad',short:'EXCÈS ✗',d:'Le contour du pad bloque l’alliage, qui se bombe : mouillage impossible à contrôler, risque de pont.'},
 overheat:{n:'Brasure surchauffée',tag:'bad',short:'SURCHAUFFE ✗',d:'Couche intermétallique épaisse (cassante) et pad fragilisé : trop de chaleur ou de temps.'},
 lifted:{n:'Pad décollé',tag:'bad',short:'PAD LEVÉ ✗',d:'La résine du circuit a perdu son adhérence : le pad s’est soulevé. Le flux était consommé depuis longtemps.'},
 disturbed:{n:'Brasure perturbée',tag:'bad',short:'PERTURBÉE ✗',d:'La carte a bougé pendant la solidification : fissures internes, surface grisâtre et granuleuse.'}
};
function finish(i,key){
  const j=joints[i];if(j.res)return;j.res=key;j.dg={tipQ:tip.Q};
  const m=Phys.measures(j,P);
  journal.unshift({i:i+1,key,c:j.tc,m,alloy:`${P.A.n} · Ø${S.wireD} mm · ${S.set} °C · ${S.power} W`});
  renderLog();updateChips();if(i===sel)showResult();
}
function resetJoint(i){const j=joints[i],n=Phys.newJoint(i,P);n.Tp=j.Tp;n.Tl=j.Tl;joints[i]=n;if(i===sel)showResult();updateChips()}

/* ---------- interface ---------- */
function select(i){sel=i;showResult();updateChips();$('#padTag').textContent=`Pad ${i+1} · ${Phys.CFG[i].n.toLowerCase()}`;hist.length=0}
const chips=$('#padChips');
[0,1,2,3].forEach(i=>{const b=document.createElement('button');b.className='pchip';b.textContent=i+1;b.setAttribute('aria-label','Pad '+(i+1));b.title=Phys.CFG[i].n;b.onclick=()=>select(i);chips.appendChild(b)});
function updateChips(){
  [...chips.children].forEach((b,i)=>{const j=joints[i];b.className='pchip'+(i===sel?' sel':'')+(j.res?(j.res==='good'?' ok':' ko'):'')});
  $('#score').textContent=`Réussies : ${joints.filter(j=>j.res==='good').length} / 4`;
}

/* ---------- coach : diagnostic et conseils après chaque essai ---------- */
const fs=(x,d)=>x.toFixed(d===undefined?1:d).replace('.',',');
function coach(i,key){
  const j=joints[i],m=Phys.measures(j,P),e=Phys.estimate(i,P),L=liq(),why=[],fix=[],set={};
  const vr=VR,mid=(vr[0]+vr[1])/2,rate=P.vfeed,tq=(j.dg&&j.dg.tipQ)||tip.Q;
  const big=i>=2,padN=`pad ${i+1} (${Phys.CFG[i].n.toLowerCase()})`;
  const raise=d=>{set.set=Math.min(420,S.set+d)};
  const lower=d=>{set.set=Math.max(250,S.set-d)};
  const cleanTip=()=>{if(tq<.6){why.push(`La panne était ${tq>.4?'ternie':'oxydée'} (${Math.round(tq*100)} %) : elle transmet mal la chaleur.`);fix.push('Nettoyez et étamez la panne (bouton « Éponge ») avant chaque joint.')}};
  const needFlux=()=>{if(S.flux==='none'){why.push('Le fil ne contient pas de flux : l’oxyde du pad et de la patte n’est pas éliminé.');fix.push('Utilisez un fil avec âme en flux, ou ajoutez du flux gel.');set.flux='core'}else if(S.pad==='old'||j.O>.25){why.push(`Il restait ${Math.round(j.O*100)} % d’oxyde : le flux s’est épuisé avant de nettoyer le pad.`);fix.push('Ajoutez du flux gel (réglage « Flux ») et ne chauffez pas trop longtemps avant d’apporter le fil.');if(S.flux!=='gel')set.flux='gel'}};
  const hotNeeded=()=>{
    if(e.tm==null){why.push(`Avec ces réglages le ${padN} n’atteint jamais la fusion (${L} °C) : il plafonne vers ${Math.round(e.tmax)} °C.`);
      if(S.set<420){raise(40);fix.push(`Montez la consigne vers ${set.set} °C.`)}
      if(S.tip!=='chisel'){set.tip='chisel';fix.push('Prenez une panne plus large (burin) : plus de surface de contact, plus de chaleur transmise.')}
      if(S.power<80){set.power=80;fix.push('Une station plus puissante (80 W) limite la chute de température de la pointe au contact.')}
    }else{why.push(`Le ${padN} a plafonné à ${Math.round(j.tmax)} °C pour une fusion à ${L} °C.`);
      fix.push(`Posez le fer (bouton Fer), laissez-le en place environ ${fs(e.tm+.5)} s, puis activez Alliage : c’est le temps nécessaire pour ce pad.`);
      if(big)fix.push('Ce pad dissipe beaucoup de chaleur : posez la panne sur le pad ET la patte, et chauffez plus longtemps.');}
  };
  switch(key){
  case 'cold':
    if(S.flux==='none'||Math.min(j.Tp,j.Tl)>=L+5||j.tmax>=L+20){ // pad chaud mais l'alliage ne mouille pas
      if(j.tmax>=L+5)why.push(`Le pad avait atteint ${Math.round(j.tmax)} °C (fusion à ${L} °C) mais l’alliage n’a pas mouillé : l’angle reste de ${Math.round(m.theta)}°.`);
      needFlux();
    }
    if(j.tmax<L+5)hotNeeded();
    cleanTip();
    if(!fix.length){why.push('L’alliage est arrivé avant que le pad ait atteint la fusion : il se fige en boule au lieu de mouiller.');fix.push(`Posez d’abord le fer (bouton Fer), attendez environ ${fs((e.tm||2)+.5)} s (le pad doit dépasser ${L} °C), puis apportez l’alliage entre la panne et la patte.`);fix.push('Observez la température du pad : l’alliage ne doit toucher que lorsque le badge indique « fond ».')}
    break;
  case 'dry':
    why.push(`Mouillage partiel : angle ${Math.round(m.theta)}°, trou rempli à ${Math.round(m.fill*100)} %, couche intermétallique ${fs(m.imc)} µm.`);
    if(j.tc<2.5)fix.push(`Contact trop court (${fs(j.tc)} s) : maintenez le fer 2 à 4 s pour que l’alliage mouille et remplisse le trou.`);
    if(m.imc<.5)fix.push('Joint trop peu chauffé pour former la couche intermétallique : chauffez un peu plus longtemps après la fusion.');
    needFlux();cleanTip();
    if(P.A.thc>40){why.push(`${P.A.n} mouille mal (θ ≈ ${P.A.thc}°) : la marge est étroite.`);raise(20);fix.push('Avec cet alliage, augmentez légèrement la consigne ou essayez un alliage qui mouille mieux (SnPb, SAC305).')}
    else if(!fix.length)fix.push('Chauffez un peu plus et apportez l’alliage sur le pad et la patte à la fois.');
    break;
  case 'few':
    why.push(`Volume déposé : ${fs(m.V)} mm³, il en faut au moins ${fs(vr[0])} mm³ pour remplir le trou et former le cordon.`);
    fix.push(`Gardez le fil au contact environ ${fs(Math.max(.3,(mid-m.V)/rate))} s de plus (volume visé ≈ ${fs(mid)} mm³).`);
    if(S.wireD<.7){why.push(`Le fil Ø ${fs(S.wireD)} mm apporte peu d’alliage par seconde (${fs(rate)} mm³/s).`);fix.push('Un fil plus gros (Ø 0,8 mm) apporte la quantité voulue plus vite, donc avec moins de chaleur subie.');set.wireD=.8}
    break;
  case 'excess':
    why.push(`Volume déposé : ${fs(m.V)} mm³ pour une plage utile de ${fs(vr[0])} à ${fs(vr[1])} mm³.`);
    fix.push(`Relâchez l’alliage plus tôt : environ ${fs(mid/rate)} s d’apport suffisent avec ce fil (${fs(rate)} mm³/s).`);
    if(S.wireD>1){why.push(`Le fil Ø ${fs(S.wireD)} mm dépose très vite : quelques dixièmes de seconde de trop font déborder.`);fix.push('Un fil plus fin (Ø 0,8 mm) rend le dosage plus facile.');set.wireD=.8}
    fix.push('Retirez d’abord le fil, puis le fer.');
    break;
  case 'overheat':
    why.push(`Joint trop chauffé : pad jusqu’à ${Math.round(j.tmax)} °C, contact ${fs(j.tc)} s, couche intermétallique ${fs(m.imc)} µm${j.D>.55?`, pad dégradé à ${Math.round(j.D*100)} %`:''}.`);
    why.push('Une couche intermétallique épaisse est dure mais cassante, et la résine du circuit fatigue.');
    if(j.tc>6)fix.push(`Réduisez le contact : ${fs(j.tc)} s est trop long, visez 2 à 5 s au total.`);
    if(S.set>340||j.tmax>L+110){lower(30);fix.push(`Baissez la consigne vers ${set.set} °C : à température élevée la couche intermétallique grossit très vite.`)}
    fix.push('Retirez le fer dès que l’alliage a mouillé et rempli le trou.');
    break;
  case 'lifted':
    why.push(`Le pad s’est décollé après ${fs(j.tc)} s de chauffe : la résine ne tient pas une chauffe prolongée à ${Math.round(j.tmax)} °C.`);
    if(e.td!=null)why.push(`Avec ces réglages, un fer tenu seul sur ce pad le décolle en ${Math.round(e.td)} s environ.`);
    fix.push(`Retirez le fer avant ${e.td!=null?Math.max(2,Math.round(e.td*.6)):8} s : si l’alliage n’a pas fondu, c’est que le réglage est mauvais, pas qu’il faut insister.`);
    if(S.set>340){lower(40);fix.push(`Baissez la consigne vers ${set.set} °C.`)}
    if(S.tip!=='chisel'){set.tip='chisel';fix.push('Une panne plus large chauffe plus vite à température plus basse.')}
    cleanTip();
    break;
  case 'disturbed':
    why.push('La carte a bougé (bouton « Bouger ») pendant que l’alliage se solidifiait : des fissures se forment dans le joint.');
    fix.push('Ne touchez ni la carte ni la patte tant que l’alliage est brillant et pâteux : laissez refroidir 2 à 3 s après avoir retiré le fer.');
    fix.push('Un support mains libres, comme celui du simulateur, évite ce défaut.');
    break;
  }
  return {why,fix,set};
}
let coachSet=null;
function showCoach(){
  const j=joints[sel],box=$('#coach');
  if(!j.res||j.res==='good'){box.hidden=true;return}
  const c=coach(sel,j.res);coachSet=c.set;
  $('#cTitle').textContent=`pad ${sel+1} · ${RES[j.res].n.toLowerCase()}`;
  $('#cWhy').innerHTML=c.why.map(t=>`<li>${t}</li>`).join('');
  $('#cFix').innerHTML=c.fix.map(t=>`<li>${t}</li>`).join('');
  const act=$('#cAct');act.innerHTML='';
  const d=[];
  if(c.set.set!==undefined)d.push(`consigne ${c.set.set} °C`);
  if(c.set.tip)d.push('panne burin');if(c.set.power)d.push(c.set.power+' W');
  if(c.set.flux)d.push(c.set.flux==='gel'?'flux gel':'fil avec flux');
  if(c.set.wireD)d.push('fil Ø '+fs(c.set.wireD));
  if(d.length){const b=document.createElement('button');b.className='primary';b.textContent='Appliquer : '+d.join(', ');b.onclick=()=>{S=Object.assign({},S,coachSet);writeCtl();applySettings();$('#presetNote').innerHTML='<b>Coach</b> : réglages conseillés appliqués, tous les pads sont remis à neuf.'};act.appendChild(b)}
  const r=document.createElement('button');r.textContent='↺ Refaire ce pad';r.onclick=()=>resetJoint(sel);act.appendChild(r);
  box.hidden=false;
}
function showResult(){showCoach();
  const j=joints[sel],b=$('#rBadge');
  if(j.res){const r=RES[j.res];$('#rName').textContent=r.n;$('#rDesc').textContent=typeof r.d==='function'?r.d():r.d;b.className='badge b-'+r.tag;b.textContent=r.tag==='ok'?'réussie':'à refaire'}
  else{$('#rName').textContent='En cours…';$('#rDesc').textContent='Le verdict tombe quand l’alliage est figé. Mesures en direct ci-dessous.';b.className='badge b-idle';b.textContent='en attente';if(!j.active){$('#rName').textContent='En attente';$('#rDesc').textContent='Choisissez un pad, chauffez-le puis apportez l’alliage.'}}
}
function renderLog(){
  const l=$('#log');l.innerHTML='';
  journal.slice(0,8).forEach(x=>{const d=document.createElement('div');d.className=x.key==='good'?'ok':'ko';
    d.textContent=`Pad ${x.i} · ${RES[x.key].n} · contact ${x.c.toFixed(1)} s · θ ${Math.round(x.m.theta)}° · IMC ${x.m.imc.toFixed(1)} µm · ${x.m.V.toFixed(1)} mm³ · ${x.alloy}`;l.appendChild(d)});
}
function kvRow(k,v,cls){return `<span>${k}</span><span class="${cls||''}">${v}</span>`}
function hintSet(t,kind){const h=$('#hint');const c='ov h '+(kind||'');if(h.className!==c)h.className=c;h.firstElementChild.textContent=kind==='good'?'BIEN':kind==='bad'?'ATTENTION':kind==='warn'?'À NOTER':'CONSEIL';if($('#hintT').textContent!==t)$('#hintT').textContent=t}
function autoHint(){
  const j=joints[sel],L=liq(),Tj=Math.min(j.Tp,j.Tl);
  if(j.res){const r=RES[j.res];hintSet(r.tag==='ok'?'Brasure réussie : choisissez un autre pad ou comparez les mesures.':`${r.n} : appuyez sur « Refaire ce pad » pour réessayer.`,r.tag==='ok'?'good':'bad');return}
  if(j.D>=1){hintSet('Le pad se décolle : relâchez le fer immédiatement.','bad');return}
  if(u.shake&&j.V>0.3&&Tj<L&&Tj>L-30){hintSet('Mouvement pendant la solidification : la brasure sera perturbée.','bad');return}
  if(u.iron&&j.D>.5){hintSet('Le pad est fragilisé : plus de 8 à 10 s à cette température et il se décolle.','bad');return}
  if(u.wire&&P.fluxMode==='none'&&j.O>.3&&Tj>=L-3){hintSet('Fil sans flux : l’oxyde reste en place, l’alliage ne mouillera pas.','bad');return}
  if(u.wire&&!u.iron&&Tj<L-3){hintSet('Rien ne fond : le pad est trop froid. Chauffez d’abord avec le fer.','warn');return}
  if(u.wire&&u.iron&&Tj<L-3&&j.V>0.2){hintSet('L’alliage fond sur la pointe, pas sur le pad : il reste en boule tant que le pad est froid.','bad');return}
  if(u.wire&&j.V>VR[1]){hintSet('Trop d’alliage : relâchez S, sinon boule ou pont.','bad');return}
  if(u.wire&&j.V>VR[0]){hintSet('Volume juste : relâchez S, puis laissez le trou se remplir quelques instants.','good');return}
  if(u.wire&&j.V>0){hintSet('Le flux du fil nettoie l’oxyde et l’alliage coule par capillarité.','');return}
  if(u.iron&&tip.Q<.55&&Tj<L){hintSet('Pointe oxydée : mauvais transfert de chaleur. Utilisez « Éponge + étamage ».','warn');return}
  if(u.iron&&Tj<L){hintSet(`Chauffe pad ET patte : l’alliage ne mouille qu’au-dessus de ${L} °C.`+(j.i===3?' Ce pad est relié au plan de masse : il chauffe lentement.':''),'');return}
  if(u.iron&&Tj>=L&&j.V===0){hintSet('Pad assez chaud : apportez l’alliage (bouton Alliage) et touchez le pad avec le fil, pas la pointe.','good');return}
  if(u.iron&&j.V>0){hintSet('Quand le volume est bon, relâchez S puis retirez le fer.','');return}
  if(j.V>0&&Tj>=L){hintSet('Ne bougez pas : l’alliage se fige sous '+L+' °C.','');return}
  hintSet('Maintenez C pour poser le fer sur le pad '+(sel+1)+'.','');
}

/* entrées */
let latch=!!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
function holdBtn(id,key){
  const b=$(id);
  const on=e=>{e.preventDefault();
    if(latch){u[key]=!u[key];b.classList.toggle('on',u[key]);return}
    u[key]=true;b.classList.add('on');try{b.setPointerCapture(e.pointerId)}catch(_){}};
  const off=()=>{if(latch)return;u[key]=false;b.classList.remove('on')};
  b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('lostpointercapture',off);
  b.addEventListener('contextmenu',e=>e.preventDefault());
}
function setLatch(v){latch=v;for(const k in KEYS){u[KEYS[k][0]]=false;$(KEYS[k][1]).classList.remove('on')}
  const t=$('#bLatch');t.setAttribute('aria-pressed',v);t.textContent=v?'Mode : appui = marche / arrêt':'Mode : maintenir appuyé';
  $('#holdHelp').textContent=v?'Touchez Fer pour poser le fer, touchez-le encore pour le retirer. Même chose pour Alliage et Bouger. Vous pouvez avoir Fer et Alliage actifs en même temps.':'Maintenez le bouton enfoncé (ou la touche C, S, M) : le fer ou l’alliage reste en place tant que vous appuyez.'}
const KEYS={c:['iron','#bIron'],s:['wire','#bWire'],m:['shake','#bShake']};
holdBtn('#bIron','iron');holdBtn('#bWire','wire');holdBtn('#bShake','shake');
$('#bLatch').onclick=()=>setLatch(!latch);setLatch(latch);
addEventListener('keydown',e=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target&&e.target.tagName;if(t==='INPUT'||t==='SELECT'||t==='TEXTAREA')return;const k=e.key.toLowerCase();
  if(k==='e'){$('#bClean').dispatchEvent(new Event('pointerdown'))}else if(KEYS[k]){u[KEYS[k][0]]=true;$(KEYS[k][1]).classList.add('on')}else if('1234'.includes(k)&&k.length===1)select(+k-1)});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(KEYS[k]){u[KEYS[k][0]]=false;$(KEYS[k][1]).classList.remove('on')}});
addEventListener('blur',()=>{for(const k in KEYS){u[KEYS[k][0]]=false;$(KEYS[k][1]).classList.remove('on')}});
$('#resetPad').onclick=()=>resetJoint(sel);
$('#resetAll').onclick=()=>{journal.length=0;renderLog();applySettings()};
$('#bClean').addEventListener('pointerdown',e=>{e.preventDefault();tip.Q=1;const b=$('#bClean');b.classList.add('on');setTimeout(()=>b.classList.remove('on'),350)});

/* ---------- boucle ---------- */
const iron=$('#sIron'),wOut=$('#wireOut'),wIn=$('#wireIn'),smoke=$('#sSmoke'),parts=[];
const ic={ix:POS[0][0]+80,iy:POS[0][1]-66,wx:POS[0][0]-80,wy:POS[0][1]-50},iT={x:470,y:100},iW={x:210,y:140};
let spawn=0,histAcc=0;const dummy=Phys.newTip(P);
function frame(dt){
  tip.Q=Math.max(.15,tip.Q-0.003*dt);
  joints.forEach((j,k)=>{
    if(k===sel)Phys.step(j,tip,u,dt,P);
    else{dummy.T=P.set;Phys.step(j,dummy,{iron:false,wire:false,shake:false},dt,P)}
    if(j.res)return;
    const live=(k===sel&&(u.iron||u.wire));
    const Tj=Math.min(j.Tp,j.Tl);
    if(j.D>=1&&!(k===sel&&u.iron))finish(k,'lifted');
    else if(j.frozen&&!live&&j.coolT>.4)finish(k,Phys.classify(j,P));
    else if(j.V<.05&&j.active&&!live&&j.idle>2.5&&Tj<liq()-10){resetJoint(k);if(k===sel)hintFlash('Aucun alliage déposé : le pad est remis à neuf.')}
  });
  render(dt);
}
let flashT=0,flashMsg='';
function hintFlash(m){flashMsg=m;flashT=3}
function render(dt){
  const j=joints[sel],L=liq(),Tj=Math.min(j.Tp,j.Tl);
  const [px,py]=POS[sel],k=1-Math.exp(-9*dt);
  const inContact=u.iron&&!j.res,wContact=u.wire&&!j.res;
  const tI=inContact?[px+7,py-4]:[px+80,py-66],tW=wContact?[px-9,py-7]:[px-80,py-50];
  ic.ix+=(tI[0]-ic.ix)*k;ic.iy+=(tI[1]-ic.iy)*k;ic.wx+=(tW[0]-ic.wx)*k;ic.wy+=(tW[1]-ic.wy)*k;
  iron.setAttribute('transform',`translate(${ic.ix} ${ic.iy}) scale(.72)`);const wd=`M96 92 C170 112 ${ic.wx-60} ${ic.wy-70} ${ic.wx} ${ic.wy}`;wOut.setAttribute('d',wd);wIn.setAttribute('d',wd);
  $('#tipPoly').setAttribute('fill',mix('#e9edf0','#d6a07a',clamp((340-tip.T)/200,0,1)*0+ (1-tip.Q)*.9));
  // pads
  joints.forEach((q,i)=>{
    const e=E[i],sp=shapeParams(q);
    e.glow.setAttribute('opacity',clamp((q.Tp-70)/270,0,1)*.9);
    e.selr.setAttribute('opacity',i===sel?1:0);
    const lifted=q.D>=1||q.res==='lifted';
    e.burn.setAttribute('opacity',lifted?1:clamp((q.D-.35)*1.4,0,.7));
    e.ring.setAttribute('transform',lifted?'translate(5 -5) rotate(-12)':'');
    e.ring.setAttribute('fill',mix('#e0955a','#8a5a3a',q.O*(q.V>0?0:1)*.8));
    if(sp){
      e.sol.setAttribute('d',bodyPath(sp,P.rl,K,K,0));e.sol.setAttribute('opacity',1);
      const liquid=q.V>0.05&&Tj>=liq();const liqf=liquid?1:clamp((Tj-(liq()-12))/12,0,1);
      const matte=q.res?clamp(q.O*2+(q.disturbed?1:0)+(q.D>.55?.45:0)+((q.th>55&&q.hadLiq)?.35:0)+(sp.cap?.5:0),0,1):0;
      e.sol.setAttribute('fill',lifted?'#7e7469':mix(mix('#cfd6dc','#9aa4ad',matte),'#ffc27a',liqf));
            const hh=sp.h*K;
      e.shine.setAttribute('d',sp.cap?`M${(-sp.a*6.5).toFixed(1)} ${(-sp.h*5).toFixed(1)} q2 ${(-sp.h*4).toFixed(1)} 6 ${(-sp.h*6.5).toFixed(1)}`:`M${(-sp.R*6.5).toFixed(1)} -2 Q${(-sp.R*3).toFixed(1)} ${(-hh*.2).toFixed(1)} -5 ${(-hh+3).toFixed(1)}`);
      e.shine.setAttribute('opacity',(1-liqf)*(1-matte)*.7);
      if(q.disturbed&&q.res){e.crack.setAttribute('d',`M-9 ${-hh*.2} l5 ${-hh*.25} l-3 ${-hh*.2} M6 ${-hh*.15} l-4 ${-hh*.3}`);e.crack.setAttribute('opacity',1)}else e.crack.setAttribute('opacity',0);
    }else{e.sol.setAttribute('opacity',0);e.shine.setAttribute('opacity',0);e.crack.setAttribute('opacity',0)}
    if(q.res){const r=RES[q.res];e.c.setAttribute('opacity',1);e.tx.textContent=r.short;const w=r.short.length*6.7+20,[ox,oy]=LABOFF[i],bx=POS[i][0]+ox,by=POS[i][1]+oy;
      e.rc.setAttribute('width',w);e.rc.setAttribute('x',bx);e.rc.setAttribute('y',by);e.tx.setAttribute('x',bx+10);e.tx.setAttribute('y',by+14);
      e.ln.setAttribute('x2',clamp(POS[i][0],bx,bx+w));e.ln.setAttribute('y2',oy<0?by+20:by);e.ln.setAttribute('x1',POS[i][0]);e.ln.setAttribute('y1',oy<0?POS[i][1]-40:POS[i][1]+4);
      const col=r.tag==='ok'?'#15803d':'#b91c1c';e.rc.setAttribute('stroke',col);e.tx.setAttribute('fill',col)}else e.c.setAttribute('opacity',0);
  });
  // fumées : flux qui brûle et alliage qui fond
  const fume=(wContact&&j.V>.02&&Tj>=L-3&&j.V<Phys.VMAX)||(j.F>.15&&j.Tp>200&&!j.res);
  if(fume){spawn+=dt*(wContact?7:3);while(spawn>1&&parts.length<28){spawn--;
    const c=el('circle',{r:3,fill:'#94a3b8'},smoke);parts.push({c,x:px+(Math.random()-.5)*16,y:py-24,vx:(Math.random()-.5)*8,vy:-(24+Math.random()*18),r:3,a:.6})}}
  for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.x+=q.vx*dt;q.y+=q.vy*dt;q.r+=dt*6;q.a-=dt*.35;
    if(q.a<=0){q.c.remove();parts.splice(i,1);continue}
    q.c.setAttribute('cx',q.x);q.c.setAttribute('cy',q.y);q.c.setAttribute('r',q.r);q.c.setAttribute('opacity',q.a*.7)}
  // loupe en coupe
  $('#cutPad').textContent=sel+1;
  const sp=shapeParams(j),lifted=j.D>=1||j.res==='lifted',liquid=j.V>.05&&Tj>=L;
  $('#iOx').setAttribute('opacity',clamp(j.O,0,1)*.85);
  $('#iHeatL').setAttribute('opacity',clamp((j.Tl-25)/260,0,1)*.6);$('#iHeatP').setAttribute('opacity',clamp((j.Tp-25)/260,0,1)*.6);
  const liqf=liquid?1:clamp((Tj-(L-12))/12,0,1);
  const col=mix(mix('#cfd6dc','#9aa4ad',j.res?clamp(j.O*2+(j.disturbed?1:0),0,1):0),'#ffc27a',liqf);
  const KX=46,KY=34;
  if(sp){
    const bp=bodyPath(sp,4*(S.leadD/.8)/46,KX,KY,0);
    // translation vers (320,222)
    $('#iSolP').setAttribute('d',bp);$('#iSolP').setAttribute('transform','translate(320 222)');
    $('#iGlow').setAttribute('d',bp);$('#iGlow').setAttribute('transform','translate(320 222)');
    $('#iSolP').setAttribute('fill',col);$('#iSolP').setAttribute('opacity',1);$('#iGlow').setAttribute('opacity',liqf*.8);
  }else{$('#iSolP').setAttribute('opacity',0);$('#iGlow').setAttribute('opacity',0)}
  const fillPx=48*clamp(j.V>0?Math.min(1,j.H):0,0,1);
  $('#iHole').setAttribute('d',fillPx>.5?`M308 222 h24 v${fillPx.toFixed(1)} h-24 Z`:'');$('#iHole').setAttribute('fill',col);
  const imc=Phys.imc(j,P);
  if(imc>0&&j.W>.15){const w=clamp(imc*1.6,1,9);const iw=$('#iImc');iw.setAttribute('d','M262 222 H308 M332 222 H378 M316 222 V176 M324 222 V176');iw.setAttribute('stroke-width',w);iw.setAttribute('opacity',.9);iw.setAttribute('stroke',imc>3.4?'#4a2d7a':'#7b5ea7')}else $('#iImc').setAttribute('opacity',0);
  $('#iBurn').setAttribute('opacity',lifted?1:clamp((j.D-.35)*1.4,0,.7));
  $('#iPadR').setAttribute('transform',lifted?'rotate(-14 332 222)':'');
  const tiA=inContact?[330,214]:[470,100],wiA=wContact?[310,214]:[210,140];
  iT.x+=(tiA[0]-iT.x)*k;iT.y+=(tiA[1]-iT.y)*k;iW.x+=(wiA[0]-iW.x)*k;iW.y+=(wiA[1]-iW.y)*k;
  $('#iTip').setAttribute('transform',`translate(${iT.x} ${iT.y})`);$('#iWire').setAttribute('transform',`translate(${iW.x} ${iW.y})`);
  // HUD
  $('#tNum').innerHTML=Math.round(j.Tp)+'<small>°C</small>';
  $('#tSub').textContent=`pad ${Math.round(j.Tp)} · patte ${Math.round(j.Tl)} · pointe ${Math.round(tip.T)}/${P.set} · fusion ${L}`;
  const tb=$('#tBadge');if(Tj<60){tb.className='badge b-cold';tb.textContent='froid'}else if(Tj<L){tb.className='badge b-warm';tb.textContent='chauffe'}else{tb.className='badge b-melt';tb.textContent='fond'}
  $('#cNum').innerHTML=j.tc.toFixed(1)+'<small>s</small>';
  $('#cMk').style.left=`calc(${clamp(j.tc/12,0,1)*100}% - 1px)`;
  const cb=$('#cBadge');
  if(j.tc===0){cb.className='badge b-idle';cb.textContent='—'}else if(j.tc<2){cb.className='badge b-warm';cb.textContent='court'}else if(j.tc<=5){cb.className='badge b-ok';cb.textContent='idéal'}else if(j.tc<=10){cb.className='badge b-warm';cb.textContent='long'}else{cb.className='badge b-bad';cb.textContent='danger'}
  $('#qMk').style.left=`calc(${clamp(j.V/Phys.VMAX,0,1)*100}% - 1px)`;
  const qb=$('#qBadge');if(j.V<.05){qb.className='badge b-idle';qb.textContent='vide'}else if(j.V<VR[0]){qb.className='badge b-warm';qb.textContent='peu'}else if(j.V<=VR[1]){qb.className='badge b-ok';qb.textContent='juste'}else{qb.className='badge b-bad';qb.textContent='trop'}
  $('#fluxL').textContent=`flux actif : ${Math.round(j.F*100)} % · oxyde : ${Math.round(j.O*100)} %`;
  $('#tipQ').textContent=(tip.Q>.8?'étamée ':tip.Q>.5?'ternie ':'oxydée ')+Math.round(tip.Q*100)+' %';
  $('#stat').textContent=`pad ${sel+1} · ${Math.round(j.Tp)} °C`;
  // mesures en direct
  const m=Phys.measures(j,P);
  const th=j.V>.05?(j.hadLiq?m.theta:140):null;
  $('#meas').innerHTML=
    kvRow('Angle θ',th==null?'—':Math.round(th)+'°',th==null?'':th<45?'okc':th<95?'wc':'kc')+
    kvRow('Trou rempli',j.V>0?Math.round(m.fill*100)+' %':'—',j.V>0?(m.fill>=.7?'okc':'wc'):'')+
    kvRow('Couche IMC',m.imc>0?m.imc.toFixed(1)+' µm':'—',m.imc>3.4?'kc':m.imc>=.5?'okc':'')+
    kvRow('Volume',j.V>0?m.V.toFixed(1)+' mm³':'—',j.V>VR[1]?'kc':j.V>=VR[0]?'okc':j.V>0?'wc':'')+
    kvRow('Pad dégradé',Math.round(clamp(j.D,0,1)*100)+' %',j.D>.55?'kc':j.D>.25?'wc':'okc');
  // historique
  histAcc+=dt;if(histAcc>=.1){histAcc=0;hist.push([j.Tp,j.Tl,tip.T]);if(hist.length>160)hist.shift();drawChart()}
  if(flashT>0){flashT-=dt;hintSet(flashMsg,'warn')}else autoHint();
}
const chart=$('#chart');
function drawChart(){
  const W=240,H=70,Y=T=>H-6-(T/440)*(H-14),L=liq();
  let h=`<line x1="0" x2="${W}" y1="${Y(P.set)}" y2="${Y(P.set)}" stroke="#d97706" stroke-dasharray="4 3" stroke-width="1"/><text x="3" y="${Y(P.set)-3}" font-size="8" fill="#d97706" font-family="ui-monospace,monospace">POINTE ${P.set}</text>`;
  h+=`<line x1="0" x2="${W}" y1="${Y(L)}" y2="${Y(L)}" stroke="#b91c1c" stroke-dasharray="4 3" stroke-width="1"/><text x="3" y="${Y(L)+9}" font-size="8" fill="#b91c1c" font-family="ui-monospace,monospace">FUSION ${L}</text>`;
  if(hist.length>1){[[0,'#0f766e'],[1,'#7c3aed']].forEach(([n,c])=>{h+=`<path d="${hist.map((q,i)=>(i?'L':'M')+(i/160*W).toFixed(1)+' '+Y(q[n]).toFixed(1)).join('')}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>`})}
  chart.innerHTML=h;
}

/* ---------- réglages de l'atelier ---------- */
const PRESETS=[
 {n:'Référence',o:{},note:'SAC305, fil Ø 0,8 mm, 340 °C, station 45 W : fenêtre de brasage confortable sur les pads 1 à 3. Le plan de masse (pad 4) chauffe plus lentement.'},
 {n:'Alliage au plomb',o:{alloy:'snpb',set:320},note:'Sn63/Pb37 fond à 183 °C : le pad atteint la fusion plus tôt, l’alliage mouille mieux (θ plus faible) et la marge avant dégradation est plus large.'},
 {n:'Fer trop froid',o:{set:280},note:'À 280 °C, seuls les pads 1 et 2 atteignent la fusion, lentement ; les pads 3 et 4 n’y arrivent jamais : boules froides.'},
 {n:'Fer trop chaud',o:{set:400},note:'À 400 °C la fusion est très rapide, mais le pad se décolle après quelques secondes seulement et la couche intermétallique devient épaisse.'},
 {n:'Sans plomb économique',o:{alloy:'sncu'},note:'Sn99,3Cu0,7 fond à 227 °C et mouille mal : angle θ plus élevé, brasures sèches fréquentes, pad 4 inaccessible à 340 °C.'},
 {n:'Basse température (SnBi)',o:{alloy:'snbi',set:260},note:'Fond à 138 °C : on peut régler le fer bas et protéger les composants. Le joint est plus fragile et le mélange avec d’autres alliages est déconseillé (non modélisé).'},
 {n:'Fil trop gros',o:{wireD:1.5},note:'Avec Ø 1,5 mm on dépose plus de 10 mm³ en une seconde (excès) et l’alliage refroidit fortement le pad (chaleur latente de fusion).'},
 {n:'Fil très fin',o:{wireD:.5},note:'Ø 0,5 mm : l’apport est lent, il faut tenir le fer plus longtemps ; le flux se consomme et la couche intermétallique épaissit.'},
 {n:'Fil sans flux',o:{flux:'none'},note:'Sans flux, l’oxyde n’est pas éliminé : l’alliage ne mouille pas (boule froide), même si le pad est très chaud.'},
 {n:'Carte ancienne',o:{pad:'old'},note:'Pad fortement oxydé : il faut plus de flux et de chaleur. Comparez avec le flux gel (« + flux gel »).'},
 {n:'Station faible',o:{power:25,tip:'fine'},note:'Avec 25 W et une pointe fine, la température de la pointe s’effondre au contact : les pads 3 et 4 ne fondent jamais.'},
 {n:'Grosse patte',o:{leadD:1.2},note:'Patte Ø 1,2 mm : le trou est plus grand (volume utile plus élevé) et la patte absorbe plus de chaleur.'}
];
const CTL={alloy:'#pAlloy',wireD:'#pWire',flux:'#pFlux',set:'#pSet',power:'#pPower',tip:'#pTip',leadD:'#pLead',pad:'#pPad'};
function readCtl(){
  S={alloy:$('#pAlloy').value,wireD:+$('#pWire').value,flux:$('#pFlux').value,set:+$('#pSet').value,power:+$('#pPower').value,tip:$('#pTip').value,leadD:+$('#pLead').value,pad:$('#pPad').value};
}
function writeCtl(){for(const k in CTL)$(CTL[k]).value=String(S[k])}
const fm=(x,d)=>x.toFixed(d).replace('.',',');
function applySettings(){
  P=Phys.params(S);VR=Phys.vrange(P);
  joints=[0,1,2,3].map(i=>Phys.newJoint(i,P));tip=Phys.newTip(P);dummy.T=P.set;hist.length=0;
  $('#pSetV').textContent=S.set+' °C';
  $('#alloyNote').innerHTML=`<b>${P.A.comp}</b> · fusion <b>${P.A.melt} °C</b> · θ de mouillage ≈ ${P.A.thc}° · ${P.A.note}`;
  // jauge de volume : zones selon le volume du trou
  const z=document.querySelectorAll('#volZones i');const w1=VR[0]/12*100,w2=(VR[1]-VR[0])/12*100;
  z[0].style.width=w1+'%';z[1].style.width=w2+'%';z[2].style.width=(100-w1-w2)+'%';
  const tk=document.querySelectorAll('#volTicks span');tk[0].style.left=(w1/2)+'%';tk[1].style.left=(w1+w2/2)+'%';tk[2].style.left=(w1+w2+(100-w1-w2)/2)+'%';
  // visuels : fil, pointe, patte
  const ww=3+S.wireD*9,wi=3+S.wireD*7.5;
  $('#wireOut').setAttribute('stroke-width',S.wireD*10+1.5);$('#wireIn').setAttribute('stroke-width',S.wireD*10-1.5);
  const il=document.querySelectorAll('#iWire line');il.forEach((l,k)=>l.setAttribute('stroke-width',k%2?wi-3:wi));
  const tw={fine:3.4,cone:6,chisel:9}[S.tip];
  $('#tipPoly').setAttribute('points',`0,0 60,${-tw} 60,${tw}`);$('#iTipPoly').setAttribute('points',`0,0 44,${-tw*.9} 44,${tw*.9}`);
  const lw=8*S.leadD/.8;
  E.forEach(e=>{e.leg.setAttribute('x',-lw/2);e.leg.setAttribute('width',lw);e.legTop.setAttribute('rx',lw/2)});
  $('#iLead').setAttribute('x',320-lw/2);$('#iLead').setAttribute('width',lw);
  // fenêtre de brasage estimée (fer tenu seul sur le pad)
  let h='<tr><th>Pad</th><th>Fusion atteinte</th><th>Pad décollé si fer tenu</th></tr>';
  [0,1,2,3].forEach(i=>{const e=Phys.estimate(i,P);
    const c=e.tm==null?'kc':e.tm<=3?'okc':'wc';
    h+=`<tr><td>${i+1} · ${Phys.CFG[i].n.toLowerCase()}</td><td class="${c}">${e.tm==null?'jamais (max '+Math.round(e.tmax)+' °C)':'après '+fm(e.tm,1)+' s'}</td><td>${e.td==null?'au-delà de 25 s':'après '+Math.round(e.td)+' s'}</td></tr>`});
  $('#est').innerHTML=h;
  showResult();updateChips();drawChart();
}
$('#params').addEventListener('change',e=>{if(e.target.matches('select')||e.target.matches('input')){readCtl();applySettings()}});
$('#pSet').addEventListener('input',()=>{$('#pSetV').textContent=$('#pSet').value+' °C'});
(function(){const pr=$('#presets');PRESETS.forEach((p,i)=>{const b=document.createElement('button');b.textContent=p.n;b.onclick=()=>{S=Object.assign({},BASE,p.o);writeCtl();$('#presetNote').innerHTML='<b>'+p.n+'</b> : '+p.note;applySettings()};pr.appendChild(b)})})();
writeCtl();applySettings();
select(0);renderLog();drawChart();
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;frame(dt);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.__sim={joints:()=>joints,u,select,tip:()=>tip};
})();
