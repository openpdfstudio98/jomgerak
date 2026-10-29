/* JomGerak V6.7.1 emergency interaction recovery + diagnostics. */
(function(){'use strict';
const errors=[];
function record(s){errors.push(String(s).slice(0,180));if(errors.length>7)errors.shift();}
window.addEventListener('error',e=>record(e.message||'Resource error'));
window.addEventListener('unhandledrejection',e=>record(e.reason?.message||'Unhandled promise'));
window.addEventListener('jg:startup-error',e=>record((e.detail?.name||'startup')+': '+(e.detail?.message||'')));
function ready(){try{return typeof map!=='undefined'&&map&&!!map.getContainer().querySelector('.leaflet-pane');}catch{return false;}}
function diagnose(){return ['JomGerak V6.7.1','Leaflet: '+(window.L?'loaded':'missing'),'Map: '+(ready()?'initialized':'not initialized'),'3D overlay: '+(document.getElementById('jg3dMap')?.classList.contains('jgshown')?'visible':'hidden'),'Recent errors: '+(errors.join(' | ')||'none captured')].join('\n');}
function boot(){
 // A stale 3D layer must never cover the Leaflet interface after refresh.
 const layer=document.getElementById('jg3dMap');if(layer&&!layer.classList.contains('jgshown'))layer.style.pointerEvents='none';
 const b=document.createElement('button');b.type='button';b.textContent='⚙';b.title='JomGerak startup diagnostics';b.setAttribute('aria-label','Startup diagnostics');
 b.style.cssText='position:fixed;z-index:2147483640;right:12px;bottom:14px;width:40px;height:40px;border-radius:50%;border:2px solid #93c5fd;background:#fff;color:#1e40af;font:700 21px system-ui;cursor:pointer;box-shadow:0 3px 12px #0005;pointer-events:auto';
 b.addEventListener('click',()=>{
  const old=document.getElementById('jg671Panel');if(old){old.remove();return;}
  const panel=document.createElement('section');panel.id='jg671Panel';panel.style.cssText='position:fixed;z-index:2147483641;right:12px;bottom:64px;width:min(420px,calc(100vw - 24px));background:#fff;color:#14233b;border:1px solid #93c5fd;border-radius:14px;padding:15px;box-shadow:0 8px 35px #0007;font:13px/1.5 system-ui;white-space:pre-wrap;overflow-wrap:anywhere;pointer-events:auto';
  const info=document.createElement('div');info.textContent=diagnose();panel.append(info);
  const actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;margin-top:12px';
  const mk=(name,fn)=>{const x=document.createElement('button');x.textContent=name;x.style.cssText='padding:9px;border-radius:8px;background:#2563eb;color:white;cursor:pointer';x.addEventListener('click',fn);actions.append(x);};
  mk('Copy',()=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(diagnose()).catch(()=>{});});
  mk('Retry map',()=>{try{if(ready()){map.invalidateSize({pan:false});}else if(window.L&&typeof initMap==='function'){initMap();}else record('Leaflet CDN unavailable');}catch(e){record(e.message);}info.textContent=diagnose();});
  mk('Close',()=>panel.remove());panel.append(actions);document.body.append(panel);
 });document.body.append(b);
 setTimeout(()=>{if(!ready())record('Map was not initialized after startup');},9000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
