/* JomGerak V6.6.5 - map loading diagnostics and recovery. */
(function(){
 'use strict';
 let lastSuccess=0, failures=0, watched=null, firstCheck=null, notice=null, recovering=false;
 const isEN=()=>typeof appLanguage!=='undefined'&&appLanguage==='en';
 const msg=(bm,en)=>isEN()?en:bm;
 function banner(){
  if(notice)return notice;
  notice=document.createElement('div');notice.id='jg665MapAlert';
  notice.style.cssText='position:fixed;left:50%;bottom:125px;transform:translateX(-50%);z-index:600;background:#fff;color:#14243d;border:1px solid #bfd0e6;box-shadow:0 5px 24px #0003;border-radius:14px;padding:11px 13px;max-width:min(94vw,370px);width:max-content;display:none;font:600 12px system-ui;';
  const text=document.createElement('span');text.id='jg665MapText';notice.appendChild(text);
  const button=document.createElement('button');button.type='button';button.id='jg665Retry';button.style.cssText='margin-left:10px;padding:9px 12px;border-radius:9px;background:#2563eb;color:#fff;font-weight:700;';button.addEventListener('click',recover);notice.appendChild(button);
  document.body.appendChild(notice);return notice;
 }
 function show(){const el=banner();el.style.display='block';document.getElementById('jg665MapText').textContent=msg('Peta gagal dimuatkan. Semak internet atau cuba lagi.','Map tiles could not load. Check your connection or retry.');document.getElementById('jg665Retry').textContent=msg('Cuba Lagi','Retry');}
 function hide(){if(notice)notice.style.display='none';}
 function watch(){
  if(typeof mapTiles48==='undefined'||!mapTiles48||mapTiles48===watched)return;
  watched=mapTiles48;failures=0;lastSuccess=Date.now();
  watched.on('tileload',()=>{lastSuccess=Date.now();failures=0;hide()});
  watched.on('tileerror',()=>{failures++;if(failures>=3&&Date.now()-lastSuccess>1200)show()});
 }
 function recover(){
  if(recovering)return;recovering=true;hide();
  try{
   if(typeof jg3dActive!=='undefined'&&jg3dActive){
    document.getElementById('jg3dMap')?.classList.remove('jgshown');
    jg3dActive=false;
   }
   if(typeof map!=='undefined'&&map){
    // Recreate the raster layer and request fresh tiles; preserve map location and route overlays.
    const selected=typeof mapStyle48!=='undefined'?mapStyle48:'standard';
    if(typeof setMapStyle48==='function')setMapStyle48(selected,true);
    map.invalidateSize({pan:false});
   }
   setTimeout(()=>{watch();if(typeof mapTiles48!=='undefined'&&mapTiles48&&Date.now()-lastSuccess>8000)show();recovering=false;},9000);
  }catch(e){recovering=false;show();console.warn('Map recovery:',e)}
 }
 function start(){
  banner();watch();setInterval(watch,1000);
  window.addEventListener('online',()=>{if(notice?.style.display==='block')recover()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&typeof map!=='undefined'&&map)map.invalidateSize({pan:false})});
  // A blank MapLibre layer should not permanently hide the working Leaflet map.
  setInterval(()=>{
   if(typeof jg3dActive==='undefined'||!jg3dActive||typeof jg3d==='undefined'||!jg3d)return;
   try{if(jg3d.isStyleLoaded())return;}catch{}
   if(!firstCheck)firstCheck=Date.now();
   if(Date.now()-firstCheck>14000){
    document.getElementById('jg3dMap')?.classList.remove('jgshown');jg3dActive=false;firstCheck=null;
    if(typeof map!=='undefined'&&map)map.invalidateSize({pan:false});
    show();
   }
  },3000);
  setInterval(()=>{if(typeof jg3dActive==='undefined'||!jg3dActive||!jg3d||jg3d.isStyleLoaded())firstCheck=null},2000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(start,1500));else setTimeout(start,1500);
})();
