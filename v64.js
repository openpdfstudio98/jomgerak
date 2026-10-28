/* JomGerak V6.4: runtime public config + live nearby road flow status. */
'use strict';
(function(){
 const tr=(ms,en)=>typeof appLanguage!=='undefined'&&appLanguage==='en'?en:ms;
 const el=id=>document.getElementById(id);
 const state={ready:false,traffic:false,community:false,maptiler:false};
 function toast(ms,en){if(typeof showToast==='function')showToast(tr(ms,en),'info');}
 function setStatus(){
  const e=el('jg64Status');if(!e)return;
  e.textContent=`MapTiler: ${state.maptiler?'✓':'—'}  •  Supabase: ${state.community?'✓':'—'}  •  TomTom: ${state.traffic?'✓':'—'}`;
 }
 async function boot(){
  const host=el('jg64Mount')||el('jg55MapTab')||el('jgProPanel');
  if(host){
   const box=document.createElement('section');box.className='jg64box';box.innerHTML=`<strong>🔌 ${tr('Sambungan API','API Connections')}</strong><p id="jg64Status">${tr('Menyemak…','Checking…')}</p><div class="jg64actions"><button type="button" onclick="jg64MapTiler()">🗺️ MapTiler</button><button type="button" onclick="jg64Traffic()">🚦 ${tr('Trafik Berdekatan','Nearby Traffic')}</button><button type="button" onclick="jg64Refresh()">↻ ${tr('Semak API','Check APIs')}</button></div><p class="jg64hint">${tr('Trafik TomTom: kelajuan satu segmen jalan berdekatan sahaja, bukan ETA laluan penuh.','TomTom: speed for one nearby road segment, not route-wide ETA.')}</p>`;
   host.replaceChildren(box);
  }
  const css=document.createElement('style');css.textContent='.jg64box{background:#eef5ff;color:#0f172a;padding:12px;border-radius:13px;margin:9px 0;font:12px system-ui}.jg64box strong{font-size:13px}.jg64box p{margin:6px 0}.jg64actions{display:flex;gap:6px;flex-wrap:wrap}.jg64actions button{background:#2563eb;color:white;border:0;border-radius:9px;padding:9px;font-size:12px}.jg64hint{font-size:11px;line-height:1.5;color:#475569}';document.head.appendChild(css);
  await window.jg64Refresh();
 }
 window.jg64Refresh=async function(){
  try{
   const r=await fetch('/api/public-config',{cache:'no-store',signal:AbortSignal.timeout(10000)});
   if(!r.ok)throw Error('HTTP '+r.status);
   const data=await r.json();
   state.maptiler=Boolean(data.maptilerKey);state.community=Boolean(data.communityEnabled);state.traffic=Boolean(data.trafficEnabled);
   if(window.JOMGERAK_CONFIG){
    window.JOMGERAK_CONFIG.maptilerKey=data.maptilerKey||'';
    window.JOMGERAK_CONFIG.communityApi=state.community?'/api/reports':'';
   }
   // Original app captures config by reference, so these updates reach JG_CFG.
   if(state.community&&typeof jgRefreshReports==='function')jgRefreshReports();
   setStatus();
  }catch{setStatus();toast('API belum dapat dihubungi. Semak Vercel Functions dan redeploy.','Cannot reach API functions. Check Vercel Functions and redeploy.');}
 };
 window.jg64MapTiler=function(){
  const key=window.JOMGERAK_CONFIG?.maptilerKey;
  if(!key)return toast('MapTiler belum dikonfigurasi di Vercel.','MapTiler not configured in Vercel.');
  if(typeof mapSources48==='undefined'||typeof setMapStyle48!=='function')return;
  mapSources48.maptiler={url:'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key='+encodeURIComponent(key),maxZoom:19,attribution:'© MapTiler © OpenStreetMap contributors',filter:'none'};
  setMapStyle48('maptiler');
  toast('MapTiler diaktifkan. Jika gagal, peta akan kembali ke OpenStreetMap.','MapTiler enabled. If it fails, the map falls back to OpenStreetMap.');
 };
 window.jg64Traffic=async function(){
  if(!state.traffic)return toast('TomTom API belum dikonfigurasi.','TomTom API not configured.');
  const center=typeof lastGps!=='undefined'&&lastGps?lastGps:(typeof map!=='undefined'&&map?map.getCenter():null);
  if(!center)return toast('Lokasi peta tidak tersedia.','Map location unavailable.');
  try{
   const url='/api/traffic?lat='+encodeURIComponent(center.lat)+'&lng='+encodeURIComponent(center.lng);
   const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(12000)});
   const j=await r.json();if(!r.ok)throw Error(j.error||'Traffic API failed');
   const current=Number(j.currentSpeed),free=Number(j.freeFlowSpeed);
   const msg=tr('TomTom: kelajuan jalan berdekatan ','TomTom: nearby road speed ')+
    (Number.isFinite(current)?current+' km/j':'—')+
    tr(' (aliran bebas ',' (free flow ')+(Number.isFinite(free)?free+' km/j':'—')+')'+
    (j.roadClosure?tr(' • Jalan dilaporkan ditutup',' • Road closure reported'):'');
   toast(msg,msg);
   const e=el('jg64Status');if(e)e.textContent=msg;
  }catch(e){toast('Data trafik tidak tersedia: '+e.message,'Traffic unavailable: '+e.message);}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
