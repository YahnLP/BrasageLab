/* Modèle physique simplifié d'un brasage manuel sur trou métallisé (paramètres localisés) */
var Phys=(function(){
  var AMB=25,GAMB_T=0.015,VMAX=12;
  var CP=0.30,CL0=0.06,GLP0=0.35,GPA=0.03,GLA=0.03;
  var CFG=[{n:'Pad standard',gpl:0.02},{n:'Pad standard',gpl:0.02},{n:'Grand pad de cuivre',gpl:0.045},{n:'Relié au plan de masse',gpl:0.09}];
  var ALLOY={
    sac:{n:'SAC305',comp:'Sn96,5 Ag3 Cu0,5',melt:217,thc:30,imcK:1.0,tauW:0.5,rho:7.4,L:60,note:'Sans plomb, standard industriel actuel (RoHS).'},
    sac0307:{n:'SAC0307',comp:'Sn99 Ag0,3 Cu0,7',melt:227,thc:36,imcK:1.1,tauW:0.6,rho:7.3,L:60,note:'Sans plomb économique : fond plus haut et mouille moins bien.'},
    sncu:{n:'Sn99,3Cu0,7',comp:'Sn99,3 Cu0,7',melt:227,thc:40,imcK:1.2,tauW:0.7,rho:7.3,L:60,note:'Sans plomb très économique : mouillage le plus médiocre.'},
    snpb:{n:'Sn63/Pb37',comp:'Sn63 Pb37 (eutectique)',melt:183,thc:18,imcK:0.8,tauW:0.35,rho:8.4,L:47,note:'Contient du plomb (usage restreint) : fond bas, mouille très bien.'},
    snbi:{n:'Sn42/Bi58',comp:'Sn42 Bi58',melt:138,thc:22,imcK:0.5,tauW:0.4,rho:8.7,L:45,note:'Basse température pour composants sensibles ; joint plus fragile.'}
  };
  var TIPS={fine:{g:0.55,ct:2.0,n:'fine (1 mm)'},cone:{g:1,ct:3.5,n:'conique (2 mm)'},chisel:{g:1.6,ct:6,n:'burin (3,5 mm)'}};
  var PADS={new:0.2,std:0.65,old:0.95};
  function params(S){
    var A=ALLOY[S.alloy],T=TIPS[S.tip],rl=S.leadD/2,lk=Math.pow(S.leadD/0.8,2);
    var hole=Math.PI*((rl+0.17)*(rl+0.17)-rl*rl)*1.6;
    return {S:S,A:A,set:S.set,pmax:S.power,vfeed:Math.PI*S.wireD*S.wireD/4*8,gtip:T.g,ct:T.ct,O0:PADS[S.pad],F0:S.flux==='gel'?0.6:0,
      fluxMode:S.flux,kF:S.flux==='gel'?0.02:0.03,rl:rl,hole:hole,lk:lk,gl:Math.sqrt(lk)};
  }
  function vrange(P){return [P.hole+1.0,P.hole+4.8]}
  function newJoint(i,P){return {i:i,Tp:AMB,Tl:AMB,V:0,W:0,O:P.O0,F:P.F0,H:0,imcEq:0,D:0,tc:0,tmax:AMB,th:140,hadLiq:false,coolT:0,disturbed:false,res:null,active:false,idle:0,frozen:false}}
  function newTip(P){return {T:P.set,Q:1}}
  function thetaNow(j,P){
    var liq=P.A.melt,Tj=Math.min(j.Tp,j.Tl);
    var w=j.W*Math.max(0,1-j.O*1.5);
    var th=140+(P.A.thc-140)*w;
    th+=Math.max(0,(liq+25-Tj)/25)*18*(w>0?1:0);
    return Math.max(15,Math.min(150,th));
  }
  function imc(j,P){return j.imcEq>0?0.75*P.A.imcK*Math.sqrt(j.imcEq):0}
  function step(j,tip,u,dt,P){
    var A=P.A,liq=A.melt,cfg=CFG[j.i],n=4,h=dt/n;
    var iron=u.iron&&!j.res,wire=u.wire&&!j.res;
    var CL=CL0*P.lk,GLP=GLP0*P.gl;
    for(var s=0;s<n;s++){
      var Tj=Math.min(j.Tp,j.Tl);
      var bridge=(j.V>0.2&&Tj>liq-5)?1.7:1;
      var Gtp=iron?0.20*tip.Q*bridge*P.gtip:0,Gtl=iron?0.12*tip.Q*bridge*P.gtip*P.gl:0;
      var qp=Gtp*(tip.T-j.Tp),ql=Gtl*(tip.T-j.Tl);
      var qmp=0,qml=0,qmt=0;
      if(wire){
        var viaPad=Tj>=liq-3,viaTip=iron&&tip.T>=liq;
        if(j.V<VMAX&&(viaPad||viaTip)){
          var dv=P.vfeed*h;
          j.V+=dv;j.active=true;
          var Tm=viaPad?(j.Tp+j.Tl)/2:tip.T;
          var hm=dv*A.rho*1e-3*(0.23*(Tm-AMB)+A.L);
          var fg=P.fluxMode==='none'?0:0.45*dv;
          if(viaPad){qmp=hm*0.6/h;qml=hm*0.4/h;j.F=Math.min(1,j.F+fg)}
          else{qmt=hm/h;j.F=Math.min(1,j.F+fg*0.27)}
        }
      }
      j.Tp+=h*(qp+GLP*(j.Tl-j.Tp)-(GPA+cfg.gpl)*(j.Tp-AMB)-qmp)/CP;
      j.Tl+=h*(ql+GLP*(j.Tp-j.Tl)-GLA*(j.Tl-AMB)-qml)/CL;
      var heat=Math.min(P.pmax,30*(P.set-tip.T));
      if(iron)tip.T+=h*(heat-qp-ql-qmt-GAMB_T*(tip.T-AMB))/P.ct;
      else tip.T+=h*(heat-GAMB_T*(tip.T-AMB))/P.ct;
    }
    if(iron){j.tc+=dt;j.active=true;j.idle=0}else if(j.active)j.idle+=dt;
    var Tj2=Math.min(j.Tp,j.Tl),Tavg=(j.Tp+j.Tl)/2;
    if(j.Tp>j.tmax)j.tmax=j.Tp;
    if(j.F>0){
      var act=j.F*Math.max(0,Math.min(1,(Tavg-120)/60));
      j.O=Math.max(0,j.O-act*1.3*dt);
      if(Tj2>110)j.F=Math.max(0,j.F-j.F*P.kF*Math.exp((j.Tp-200)/55)*dt);
    }else if(j.Tp>200){
      j.O=Math.min(1,j.O+0.02*Math.exp((j.Tp-250)/60)*dt);
    }
    var liquid=j.V>0.05&&Tj2>=liq;
    if(liquid){
      j.hadLiq=true;j.th=thetaNow(j,P);
      var clean=Math.max(0,1-j.O*1.5);
      j.W+=(1-j.W)*clean*dt/A.tauW;
      if(j.W>0.3&&j.Tp>=liq+5){var maxH=Math.min(1,j.V/P.hole);if(j.H<maxH)j.H=Math.min(maxH,j.H+1.1*j.W*dt)}
      j.imcEq+=dt*Math.exp(0.045*(Tj2-(A.melt+33)));
    }
    if(j.Tp>180)j.D+=8e-6*(j.Tp-180)*(j.Tp-180)*dt;
    var hot=Tj2>=liq;
    if(j.V>0.05&&!iron&&!wire){if(!hot)j.coolT+=dt}else j.coolT=0;
    if(u.shake&&j.V>0.3&&j.hadLiq&&Tj2<liq&&Tj2>liq-30&&!j.res)j.disturbed=true;
    j.frozen=(j.V>0.05&&Tj2<liq-12);
  }
  function measures(j,P){
    return {theta:j.th,fill:j.V>0?Math.min(1,j.H/Math.min(1,j.V/P.hole)):0,imc:imc(j,P),V:j.V,D:j.D,Tmax:j.tmax,W:j.W,O:j.O};
  }
  function classify(j,P){
    var m=measures(j,P),vr=vrange(P);
    if(j.D>=1)return 'lifted';
    if(j.disturbed)return 'disturbed';
    if(m.theta>=95)return 'cold';
    if(m.V<vr[0])return 'few';
    if(m.V>vr[1])return 'excess';
    if(m.imc>3.4||j.D>0.55)return 'overheat';
    if(m.theta>50||m.fill<0.7||m.imc<0.5)return 'dry';
    return 'good';
  }
  function estimate(i,P){ // fer tenu seul sur le pad : instant de fusion et instant de dégradation
    var j=newJoint(i,P),tip=newTip(P),dt=1/30,t,tm=null,td=null;
    for(t=0;t<25;t+=dt){step(j,tip,{iron:true,wire:false,shake:false},dt,P);
      if(tm===null&&Math.min(j.Tp,j.Tl)>=P.A.melt+8)tm=t;
      if(j.D>=1){td=t;break}}
    return {tm:tm,td:td,tmax:j.tmax};
  }
  return {CFG:CFG,ALLOY:ALLOY,TIPS:TIPS,PADS:PADS,VMAX:VMAX,AMB:AMB,params:params,vrange:vrange,newJoint:newJoint,newTip:newTip,step:step,measures:measures,classify:classify,imc:imc,estimate:estimate};
})();
if(typeof module!=='undefined')module.exports=Phys;
