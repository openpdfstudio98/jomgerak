/* JomGerak V6.6.6 — startup watchdog and actionable map diagnostics. */
(function(){
 'use strict';
 let banner, details, button, startupFailure='';
 const lang=()=>typeof appLanguage!=='undefined'&&appLanguage==='en';
 const t=(ms,en)=>lang()?en:ms;
 function ui(){
  if(banner)return;
  banner=document.createElement('div');banner.id='jg666Diagnostic';
  banner.style.cssText='position:fixed;z-index:1000;bottom:125px;left:50%;transform:translateX(-50%);max-width:calc(100vw - 28px);width:370px;background:#fff;color:#17243b;border:1px solid #cbd5e1;border-radius:16px;padding:14px;box-shadow:0 8px 30px #0005;font:500 13px/1.5 system-ui;display:none';
  details=document.createElement('div');details.id='jg666DiagnosticText';
  button=document.createElement('button');button.type='button';button.style.cssText='background:#2563eb;color:white;padding:9px 15px;margin-top:9px;border-radius:9px;font-weight:700';
  button.onclick=()=>{banner.style.display='none';try{if(typeof map!=='undefined'&&map){if(typeof setMapStyle48==='function')setMapStyle48('standard',true);map.invalidateSize({pan:false});}else location.reload();}catch(e){console.error('Retry:',e);location.reload();}};
  banner.append(details,button);document.body.appendChild(banner);
 }
 function show(message){ui();details.textContent=message;button.textContent=t('Cuba Lagi','Retry');banner.style.display='block';}
 function ready(){return typeof map!=='undefined'&&map&&typeof map.getContainer==='function'&&map.getContainer().querySelector('.leaflet-pane');}
 window.addEventListener('jg:startup-error',e=>{if(e.detail?.name==='map')startupFailure=e.detail.message||'Map initialization failed';});
 window.addEventListener('error',e=>{if(/leaflet|maplibre|tile|map/i.test(String(e.message)))console.warn('Map error detail:',e.message);});
 function check(){
  if(!ready()){
   const missing=typeof window.L==='undefined';
   const detail=missing?t('Pustaka Leaflet tidak dimuatkan. Periksa sambungan atau sekatan CDN.','Leaflet library failed to load. Check network or CDN blocking.'):startupFailure||t('Peta gagal dimulakan. Cuba muat semula.','Map initialization failed. Try reloading.');
   show(detail);console.error('[JomGerak V6.6.6] Map not initialized:',detail);
   return;
  }
  try{map.invalidateSize({pan:false});}catch(e){console.warn('Map resize:',e);}
  // Do not declare success from the presence of a Leaflet container alone:
  // the existing v665 tileerror handler detects failed tile downloads.
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(check,5000));else setTimeout(check,5000);
})();
