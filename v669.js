/* JomGerak V6.7: independent startup diagnostics and recovery. */
(function(){
 'use strict';
 const errors=[];let loadedTiles=0,failedTiles=0,attached=false,shown=false;
 const en=()=>document.getElementById('languageSelect')?.value==='en';
 const tr=(ms,eng)=>en()?eng:ms;
 function record(s){if(!s)return;errors.push(String(s).slice(0,220));if(errors.length>8)errors.shift();}
 window.addEventListener('error',e=>record((e.filename?e.filename.split('/').pop()+': ':'')+(e.message||'Script/resource error')));
 window.addEventListener('unhandledrejection',e=>record('Promise: '+(e.reason?.message||String(e.reason))));
 window.addEventListener('jg:startup-error',e=>record((e.detail?.name||'startup')+': '+(e.detail?.message||'failed')));
 function panel(){
  let el=document.getElementById('jg669Status');if(el)return el;
  el=document.createElement('div');el.id='jg669Status';el.style.cssText='position:fixed;z-index:1800;left:12px;right:12px;bottom:115px;max-width:440px;margin:auto;padding:13px;border-radius:14px;background:#fff;color:#14233b;border:1px solid #b9c8db;box-shadow:0 10px 35px #0006;font:12px/1.5 system-ui;display:none';
  const title=document.createElement('strong');title.id='jg669Title';el.append(title);
  const info=document.createElement('div');info.id='jg669Info';info.style.cssText='margin-top:6px;white-space:pre-wrap;overflow-wrap:anywhere';el.append(info);
  const controls=document.createElement('div');controls.style.cssText='display:flex;gap:8px;margin-top:10px';
  const retry=document.createElement('button');retry.style.cssText='background:#2563eb;color:#fff;padding:9px 12px;border-radius:9px;font-weight:700';retry.onclick=()=>{el.style.display='none';try{if(typeof jg3dActive!=='undefined'&&jg3dActive){document.getElementById('jg3dMap')?.classList.remove('jgshown');jg3dActive=false;}if(typeof map!=='undefined'&&map){if(typeof setMapStyle48==='function')setMapStyle48('standard',true);map.invalidateSize({pan:false});}else location.reload();}catch(e){record(e.message);location.reload();}};
  const copy=document.createElement('button');copy.style.cssText='background:#e2e8f0;color:#14233b;padding:9px 12px;border-radius:9px;font-weight:700';copy.onclick=()=>{const txt=diagnosis();if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).catch(()=>{});else{const ta=document.createElement('textarea');ta.value=txt;document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();}};
  const close=document.createElement('button');close.style.cssText='background:#e2e8f0;color:#14233b;padding:9px 12px;border-radius:9px';close.textContent='×';close.onclick=()=>el.style.display='none';
  controls.append(retry,copy,close);el.append(controls);document.body.append(el);
  el._render=()=>{title.textContent=tr('JomGerak: masalah memuatkan peta','JomGerak: map loading issue');info.textContent=diagnosis();retry.textContent=tr('Cuba Lagi','Retry');copy.textContent=tr('Salin Diagnostik','Copy diagnostics');};return el;
 }
 function diagnosis(){
  let mapReady=false;try{mapReady=typeof map!=='undefined'&&!!map&&!!map.getContainer?.().querySelector('.leaflet-pane');}catch{}
  return ['Version: V6.7','Leaflet: '+(typeof window.L!=='undefined'?'loaded':'missing'),'Map initialized: '+mapReady,'Tiles loaded: '+loadedTiles,'Tiles failed: '+failedTiles,'Controls: '+(typeof window.jgTogglePro==='function'?'defined':'missing'),'Errors: '+(errors.join(' | ')||'none captured')].join('\n');
 }
 function show(){if(shown)return;shown=true;const el=panel();el._render();el.style.display='block';}
 function watchTiles(){
  try{if(typeof mapTiles48==='undefined'||!mapTiles48||mapTiles48===attached)return;attached=mapTiles48;
   mapTiles48.on('tileload',()=>{loadedTiles++;const el=document.getElementById('jg669Status');if(el)el.style.display='none';shown=false;});
   mapTiles48.on('tileerror',()=>{failedTiles++;if(failedTiles>=3&&loadedTiles===0)show();});
  }catch(e){record('tile watch: '+e.message);}
 }
 function start(){
  panel();watchTiles();setInterval(watchTiles,1500);
  setTimeout(()=>{let ready=false;try{ready=typeof map!=='undefined'&&!!map&&!!map.getContainer?.().querySelector('.leaflet-pane');}catch{}if(!ready||(!loadedTiles&&failedTiles>=1))show();},8500);
  // Give the user a visible way to open diagnostics even when tile events never fire.
  const btn=document.createElement('button');btn.type='button';btn.textContent='ⓘ';btn.title='JomGerak diagnostics';btn.setAttribute('aria-label','JomGerak diagnostics');btn.style.cssText='position:fixed;right:12px;bottom:15px;z-index:1750;border-radius:50%;background:#fff;color:#1d4ed8;border:1px solid #bfdbfe;width:32px;height:32px;font:700 16px system-ui;box-shadow:0 2px 8px #0003';btn.onclick=()=>{shown=false;show();};document.body.append(btn);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
