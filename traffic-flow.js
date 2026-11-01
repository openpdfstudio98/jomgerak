/* Real provider flow overlay. Route ETA remains an OSRM estimate. */
(function(){
 'use strict';
 let active=false,enabled=false,layer=null,timer=null,epoch=0,revision=0,observed=null;
 const box=()=>document.getElementById('jgTrafficFlow');
 const t=(en,ms)=>typeof appLanguage!=='undefined'&&appLanguage==='ms'?ms:en;
 function status(message){const e=box();if(e){e.hidden=!active;e.textContent=message;}}
 const url=()=>location.origin+'/api/traffic-tile?z={z}&x={x}&y={y}&v='+revision;
 function unavailable(){status(t('Traffic unavailable · route time excludes congestion','Trafik tidak tersedia · anggaran masa tanpa kesesakan'));}
 function sync(){
  if(!active||!enabled)return;
  if(typeof jg3dActive!=='undefined'&&jg3dActive&&jg3d?.isStyleLoaded()){
   if(layer&&map.hasLayer(layer))map.removeLayer(layer);
   if(observed!==jg3d){observed=jg3d;jg3d.on('error',e=>{if(active&&e.sourceId==='jg-traffic-flow')unavailable();});jg3d.on('sourcedata',e=>{if(active&&e.sourceId==='jg-traffic-flow'&&e.isSourceLoaded)legend();});}
   if(!jg3d.getSource('jg-traffic-flow'))jg3d.addSource('jg-traffic-flow',{type:'raster',tiles:[url()],tileSize:256,attribution:'Traffic © TomTom',maxzoom:22});
   if(!jg3d.getLayer('jg-traffic-flow'))jg3d.addLayer({id:'jg-traffic-flow',type:'raster',source:'jg-traffic-flow',paint:{'raster-opacity':.85}},jg3d.getLayer('jg-route-outline')?'jg-route-outline':undefined);
   jg3d.getSource('jg-traffic-flow').setTiles?.([url()]);
  }else if(typeof map!=='undefined'&&map&&typeof L!=='undefined'){
   if(!layer){layer=L.tileLayer(url(),{maxZoom:22,opacity:.85,zIndex:350,attribution:'Traffic © TomTom'});layer.on('tileerror',unavailable);layer.on('tileload',legend);}
   layer.setUrl(url());if(!map.hasLayer(layer))layer.addTo(map);
  }
 }
 function legend(){status(t('Traffic · Green: flowing · Amber: slow · Red: congested · © TomTom','Trafik · Hijau: lancar · Kuning: perlahan · Merah: sesak · © TomTom'));}
 async function start(){
  stop();active=true;const token=++epoch;status(t('Checking traffic availability…','Menyemak data trafik…'));
  try{
   const r=await fetch('/api/public-config',{cache:'no-store',signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error();
   const c=await r.json();if(token!==epoch||!active)return;
   if(!c.trafficEnabled){status(t('Live traffic not configured · route time excludes congestion','Trafik langsung belum dikonfigurasi · anggaran masa tanpa kesesakan'));return;}
   enabled=true;status(t('Loading traffic flow · © TomTom','Memuatkan aliran trafik · © TomTom'));revision=Math.floor(Date.now()/60000);sync();
   timer=setInterval(()=>{if(document.hidden)return;revision=Math.floor(Date.now()/60000);sync();},60000);
  }catch{if(token===epoch)unavailable();}
 }
 function stop(){active=false;enabled=false;epoch++;if(timer)clearInterval(timer);timer=null;
  if(layer&&typeof map!=='undefined'&&map?.hasLayer(layer))map.removeLayer(layer);
  if(typeof jg3d!=='undefined'&&jg3d?.isStyleLoaded()){
   if(jg3d.getLayer('jg-traffic-flow'))jg3d.removeLayer('jg-traffic-flow');
   if(jg3d.getSource('jg-traffic-flow'))jg3d.removeSource('jg-traffic-flow');
  }
  if(box())box().hidden=true;
 }
 window.JG_TRAFFIC={start,stop,sync};
})();
