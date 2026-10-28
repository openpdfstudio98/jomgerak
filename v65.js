/* JomGerak 6.5 – real GPS follow UI, no simulated location */
'use strict';
(function(){
 let follow=true,mode='2d',lastCamAt=0,hasNav=false,overview=false;
 const el=id=>document.getElementById(id);
 const tr=(ms,en)=>typeof appLanguage!=='undefined'&&appLanguage==='en'?en:ms;
 function info(ms,en){if(typeof showToast==='function')showToast(tr(ms,en),'info');}
 function setUI(){
  const nav=typeof navigationActive!=='undefined'&&navigationActive;
  hasNav=nav;
  document.body.classList.toggle('jg65-driving',nav);
  const start=el('jg65Start');if(start)start.textContent=nav?tr('■ Henti','■ Stop'):tr('▶ Mula Pandu','▶ Start Driving');
  const badge=el('jg65Badge');if(badge)badge.style.display=nav?'block':'none';
  const view=el('jg65View');if(view)view.textContent=mode==='3d'?'▣ 2D':'◩ 3D';
 }
 window.jg65Start=function(){
  if(typeof startVoiceNavigation!=='function')return;
  if(navigationActive){stopLiveNavigation();setUI();return;}
  if(!currentRouteData||!destCoords){info('Pilih destinasi dan tekan Cari Laluan dahulu.','Choose a destination and find a route first.');return;}
  if(mode==='3d'&&!jg3dActive){jgToggle3D().then(()=>{if(jg3dActive)startVoiceNavigation();setUI();});return;}
  startVoiceNavigation();follow=true;overview=false;setUI();
 };
 window.jg65Overview=function(){
  if(!currentRouteData||!routePolyline){info('Cari laluan dahulu untuk melihat keseluruhan perjalanan.','Find a route first to see the overview.');return;}
  overview=true;follow=false;followGps=false;
  if(jg3dActive&&jg3d){
   try{const b=routePolyline.getBounds();jg3d.fitBounds([[b.getWest(),b.getSouth()],[b.getEast(),b.getNorth()]],{padding:75,pitch:0,duration:650});}catch{}
  }else if(map){map.fitBounds(routePolyline.getBounds(),{padding:[60,60]});}
  info('Paparan keseluruhan laluan. Tekan Recenter untuk ikut GPS semula.','Route overview. Press Recenter to follow GPS again.');
 };
 window.jg65Recenter=function(){
  follow=true;overview=false;followGps=true;
  if(!lastGps){info('Menunggu bacaan GPS.','Waiting for GPS fix.');return;}
  if(jg3dActive&&jg3d)jg3d.easeTo({center:[lastGps.lng,lastGps.lat],zoom:17,pitch:54,duration:600});
  else if(map)map.setView([lastGps.lat,lastGps.lng],17,{animate:true});
 };
 window.jg65ToggleView=async function(){
  if(typeof jgToggle3D!=='function')return;
  await jgToggle3D();mode=jg3dActive?'3d':'2d';setUI();
  if(navigationActive&&follow)window.jg65Recenter();
 };
 window.jg65OnGps=function(pos){
  if(!navigationActive||!follow||overview)return;
  if(Date.now()-lastCamAt<850)return;
  lastCamAt=Date.now();
  const {latitude:lat,longitude:lng,heading,speed,accuracy}=pos.coords;
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||accuracy>120)return;
  if(jg3dActive&&jg3d){
   const bearing=Number.isFinite(heading)&&Number(speed)>1.5?heading:jg3d.getBearing();
   jg3d.easeTo({center:[lng,lat],zoom:17,pitch:54,bearing,duration:850,padding:{top:Math.round(innerHeight*.15),bottom:Math.round(innerHeight*.18),left:0,right:0}});
  }else if(map){map.panTo([lat,lng],{animate:true,duration:.7});}
 };
 window.jg65NavChanged=setUI;
 function init(){setUI();
  const panel=el('jg55TripTab')||el('jgProPanel');
  if(panel){const note=document.createElement('p');note.style.cssText='padding:8px;font:600 11px system-ui;color:#64748b';note.textContent=tr('V6.5: Cari Laluan → Start Driving. Gunakan Overview dan Recenter untuk kamera.','V6.5: Find Route → Start Driving. Use Overview and Recenter for camera.');panel.prepend(note);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
