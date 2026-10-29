/* JomGerak V6.7 — Leaflet-first startup and optional 3D isolation. */
(function(){
 'use strict';
 let ready=false,checks=0;
 const report=(name,message)=>window.dispatchEvent(new CustomEvent('jg:startup-error',{detail:{name,message}}));
 function check(){
  checks++;
  try{
   if(typeof map!=='undefined'&&map&&map.getContainer()){
    if(!ready){ready=true;map.invalidateSize({pan:false});}
    return;
   }
   if(window.L&&typeof initMap==='function'){
    try{initMap();ready=true;map.invalidateSize({pan:false});return;}
    catch(e){if(checks===3)report('Leaflet recovery',e.message);}
   }
   if(checks===4)report('Leaflet startup','Map not initialized; verify Leaflet CDN and browser console');
  }catch(e){if(checks===4)report('startup check',e.message);}
 }
 function begin(){
  check();const poll=setInterval(()=>{check();if(ready||checks>=8)clearInterval(poll);},1800);
  window.addEventListener('resize',()=>{try{if(typeof map!=='undefined'&&map)map.invalidateSize({pan:false});}catch{}});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>{try{if(typeof map!=='undefined'&&map)map.invalidateSize({pan:false});}catch{}},250);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
})();
