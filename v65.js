/* JomGerak 6.5 – real GPS follow UI, no simulated location */
'use strict';
(function(){
 let follow=true,mode='2d',lastCamAt=0,hasNav=false,overview=false;
 const el=id=>document.getElementById(id);
 const tr=(ms,en)=>typeof appLanguage!=='undefined'&&appLanguage==='en'?en:ms;
 function info(ms,en){if(typeof showToast==='function')showToast(tr(ms,en),'info');}
 function syncDrivingLayout(){
  if(typeof navigationActive==='undefined'||!navigationActive)return;
  const hud=el('liveNavHUD');if(!hud)return;
  const bottom=Math.ceil(hud.getBoundingClientRect().bottom);
  if(Number.isFinite(bottom))document.documentElement.style.setProperty('--jg-driving-hud-bottom',bottom+'px');
 }
 function setUI(){
  const nav=typeof navigationActive!=='undefined'&&navigationActive;
  hasNav=nav;
  if(nav&&typeof map!=='undefined'&&map&&typeof map.closePopup==='function')map.closePopup();
  document.body.classList.toggle('jg65-driving',nav);
  const start=el('jg65Start');if(start)start.textContent=nav?tr('■ Henti','■ Stop'):tr('▶ Mula Pandu','▶ Start Driving');
  const dock=el('jg65Dock');if(dock&&!nav)dock.classList.remove('jg65expanded');
  const more=el('jg65More');if(more){more.textContent=tr('☰ Pandu','☰ Driving');more.setAttribute('aria-expanded',String(Boolean(dock?.classList.contains('jg65expanded'))));}
  mode=typeof jg3dActive!=='undefined'&&jg3dActive?'3d':'2d';
  const view=el('jg65View');if(view)view.textContent=mode==='3d'?'▣ 2D':'◩ 3D';
  requestAnimationFrame(syncDrivingLayout);
 }
 window.jg65ToggleMenu=function(){const dock=el('jg65Dock'),more=el('jg65More');if(!dock||!navigationActive)return;const expanded=dock.classList.toggle('jg65expanded');if(more)more.setAttribute('aria-expanded',String(expanded));};
 window.jg65Start=function(){
  if(typeof startVoiceNavigation!=='function')return;
  if(navigationActive){stopLiveNavigation();setUI();return;}
  if(!currentRouteData||!destCoords){info('Pilih destinasi dan tekan Cari Laluan dahulu.','Choose a destination and find a route first.');return;}
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
  if(jg3dActive&&jg3d)jg3d.easeTo({center:[lastGps.lng,lastGps.lat],zoom:jg3d.getZoom(),duration:500});
  else if(map)map.setView([lastGps.lat,lastGps.lng],17,{animate:true});
 };
 window.jg65ToggleView=async function(){
  if(typeof jgToggle3D!=='function')return;
  await jgToggle3D();mode=jg3dActive?'3d':'2d';setUI();
  if(navigationActive&&follow)window.jg65Recenter();
 };
 window.jg65SuspendFollow=function(){follow=false;overview=false;followGps=false;};
 window.jg65OnGps=function(pos){
  if(!navigationActive||!followGps||!follow||overview)return;
  if(Date.now()-lastCamAt<850)return;
  lastCamAt=Date.now();
  const {latitude:lat,longitude:lng,heading,speed,accuracy}=pos.coords;
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||accuracy>120)return;
  if(jg3dActive&&jg3d){
   const bearing=Number.isFinite(heading)&&Number(speed)>1.5?heading:jg3d.getBearing();
   jg3d.easeTo({center:[lng,lat],bearing,duration:700,padding:{top:Math.round(innerHeight*.15),bottom:Math.round(innerHeight*.18),left:0,right:0}});
  }else if(map){map.panTo([lat,lng],{animate:true,duration:.7});}
 };
 window.jg65NavChanged=function(){if(navigationActive&&!hasNav){follow=true;overview=false;lastCamAt=0;}setUI();};
 window.jg65SyncLayout=syncDrivingLayout;
 let viewportFrame=false,viewportTimer=null;
 function resizeMaps(){
  if(typeof map!=='undefined'&&map)map.invalidateSize({pan:false});
  if(typeof jg3d!=='undefined'&&jg3d)jg3d.resize();
  syncDrivingLayout();
 }
 function viewportChanged(){
  if(!viewportFrame){viewportFrame=true;requestAnimationFrame(()=>{viewportFrame=false;resizeMaps();});}
  clearTimeout(viewportTimer);viewportTimer=setTimeout(resizeMaps,250);
 }
 window.jg65ViewportChanged=viewportChanged;
 function init(){setUI();
  window.addEventListener('resize',viewportChanged);
  window.addEventListener('orientationchange',viewportChanged);
  window.visualViewport?.addEventListener('resize',viewportChanged);
  if(typeof ResizeObserver!=='undefined'&&el('liveNavHUD'))new ResizeObserver(syncDrivingLayout).observe(el('liveNavHUD'));
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
