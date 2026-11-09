const Ph=require(require('path').join(__dirname,'..','src','model.js'));
const base={alloy:'sac',wireD:.8,flux:'core',set:340,power:45,tip:'cone',leadD:.8,pad:'std'};
const presets={
 'Réf SAC305 340':{},
 'Sn63/Pb37 320':{alloy:'snpb',set:320},
 'SAC305 280°C':{set:280},
 'SAC305 400°C':{set:400},
 'SAC0307 340':{alloy:'sac0307'},
 'Sn99Cu 340':{alloy:'sncu'},
 'SnBi 260':{alloy:'snbi',set:260},
 'Fil 1,5':{wireD:1.5},
 'Fil 0,5':{wireD:.5},
 'Sans flux':{flux:'none'},
 'Pad oxydé':{pad:'old'},
 'Oxydé+gel':{pad:'old',flux:'gel'},
 'Station 25W burin':{power:25,tip:'chisel'},
 'Pointe fine 25W':{power:25,tip:'fine'},
 'Patte 1,2':{leadD:1.2},
};
function operator(P,i){ // opérateur « raisonnable » : chauffe jusqu'à fusion+10, apporte, retire
  const j=Ph.newJoint(i,P),tip=Ph.newTip(P),dt=1/60;let t=0,phase=0,feedEnd=null;const vr=Ph.vrange(P),target=(vr[0]+vr[1])/2;
  for(;t<40;t+=dt){
    const Tj=Math.min(j.Tp,j.Tl);
    let iron=true,wire=false;
    if(phase===0&&Tj>=P.A.melt+25)phase=1;
    if(phase===1){wire=true;if(j.V>=target){phase=2;feedEnd=t}}
    if(phase===2){wire=false;if(t-feedEnd>1.0)phase=3}
    if(phase===3)iron=false;
    Ph.step(j,tip,{iron,wire,shake:false},dt,P);
    if(j.D>=1&&iron){phase=3}
    if(phase===3&&j.frozen&&j.coolT>.4)break;
  }
  return {k:Ph.classify(j,P),th:Math.round(j.th),imc:Ph.imc(j,P).toFixed(1),V:j.V.toFixed(1),tc:j.tc.toFixed(1),D:j.D.toFixed(2),H:j.H.toFixed(2)};
}
for(const [n,o] of Object.entries(presets)){
  const S=Object.assign({},base,o),P=Ph.params(S);
  const est=[0,1,2,3].map(i=>{const e=Ph.estimate(i,P);return (e.tm==null?'∞':e.tm.toFixed(1))+'/'+(e.td==null?'>25':e.td.toFixed(0))});
  console.log(n.padEnd(20),'est tm/td',est.join(' '),'|',[0,2,3].map(i=>{const r=operator(P,i);return `p${i+1}:${r.k}(θ${r.th},imc${r.imc},V${r.V},tc${r.tc})`}).join(' '));
}
