/* JomGerak 6.3: additional working browser/PWA modes; no fictitious live traffic data. */
'use strict';
(function(){
 const $=id=>document.getElementById(id);
 const T=(ms,en)=>typeof appLanguage!=='undefined'&&appLanguage==='en'?en:ms;
 const toast=(ms,en)=>{if(typeof showToast==='function')showToast(T(ms,en),'info');};
 const safe=(v)=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const state={timer:null,watch:null,started:0,points:[],meters:0,last:null,paused:false,elapsed:0,signalLayer:null,signalAbort:null,open:false};
 function km(m){return (m/1000).toFixed(2);}
 function duration(ms){let n=Math.floor(ms/1000);return String(Math.floor(n/3600)).padStart(2,'0')+':'+String(Math.floor(n/60)%60).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
 function distance(a,b){const R=6371000,rad=x=>x*Math.PI/180,dlat=rad(b.lat-a.lat),dlon=rad(b.lon-a.lon),v=Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlon/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(v)));}
 function storage(key,def){try{return JSON.parse(localStorage.getItem('jg63_'+key))??def;}catch{return def;}}
 function put(key,v){try{localStorage.setItem('jg63_'+key,JSON.stringify(v));return true;}catch{return false;}}
 function ui(){
  const tab=$('jg60Trip');if(!tab)return;
  let host=$('jg63Host');if(!host){host=document.createElement('section');host.id='jg63Host';tab.prepend(host);}
  host.innerHTML=`<div class="jg63head"><strong>🧭 ${T('Semua Mod V6.3','All Modes V6.3')}</strong><button type="button" onclick="jg63Toggle()" aria-expanded="${state.open}">${state.open?'▴':'▾'}</button></div><div id="jg63Body" ${state.open?'':'hidden'}>
    <div class="jg63modes"><button onclick="jg60Mode('car')">🚗 ${T('Kereta','Drive')}</button><button onclick="jg60Mode('motor')">🏍️ ${T('Motor','Motor')}</button><button onclick="jg60Mode('walk')">🚶 ${T('Jalan','Walk')}</button><button onclick="jg60Mode('rail')">🚆 ${T('Tren','Train')}</button><button onclick="jg63RunOpen()">🏃 ${T('Larian','Run')}</button><button onclick="jg60Prayer()">🕌 ${T('Solat','Prayer')}</button></div>
    <div class="jg63modes"><button onclick="jg63Signals()">🚦 ${T('Lokasi Lampu Isyarat','Traffic Signals')}</button><button onclick="jg60VoiceSearch('dest')">🎤 ${T('Cari Dengan Suara','Voice Search')}</button><button onclick="jg63Install()">📲 ${T('Pasang Aplikasi','Install App')}</button><button onclick="jg63DeviceInfo()">⌚ ${T('Sambungan Peranti','Device Integration')}</button></div>
    <p class="jg63small">${T('Lampu isyarat dipaparkan daripada OpenStreetMap jika tersedia; tiada countdown masa sebenar. Integrasi Android Auto, CarPlay dan jam pintar memerlukan aplikasi native.','Traffic signals come from OpenStreetMap where available; no live countdown. Android Auto, CarPlay and watch integrations require native apps.')}</p>
  </div>`;
  let panel=$('jg63RunPanel');if(panel)refreshRun();
 }
 window.jg63Toggle=function(){state.open=!state.open;ui();};
 function dialog(){let e=$('jg63RunPanel');if(!e){e=document.createElement('div');e.id='jg63RunPanel';e.className='jg63dialog';e.setAttribute('role','dialog');e.setAttribute('aria-label','JomGerak Run');document.body.append(e);}return e;}
 function elapsed(){return state.elapsed+(state.watch!==null&&!state.paused?Date.now()-state.started:0);}
 function refreshRun(){const e=$('jg63RunPanel');if(!e)return;const active=state.watch!==null;
  const pace=state.meters>100?elapsed()/60000/(state.meters/1000):null;
  e.innerHTML=`<div class="jg63dialoghead"><strong>🏃 JomGerak Run</strong><button onclick="jg63RunClose()" aria-label="Close">✕</button></div>
   <div class="jg63stats"><div><b>${km(state.meters)}</b><small>km</small></div><div><b>${duration(elapsed())}</b><small>${T('Tempoh','Duration')}</small></div><div><b>${pace?pace.toFixed(1):'—'}</b><small>min/km</small></div></div>
   <p class="jg63small">${T('Jejak GPS hanya direkod semasa aplikasi aktif. GPS kurang tepat akan diabaikan. Jangan gunakan semasa memandu.','GPS tracks only while the app remains active. Low-accuracy fixes are ignored. Do not use while driving.')}</p>
   <div class="jg63actions">${active?`<button onclick="jg63StopRun()">⏹ ${T('Tamat & Simpan','Finish & Save')}</button>`:`<button onclick="jg63StartRun()">▶ ${T('Mula Rekod','Start Tracking')}</button>`}<button onclick="jg63ExportGPX()">⬇ GPX</button><button onclick="jg63History()">🕘 ${T('Sejarah','History')}</button></div>
   <div id="jg63History" class="jg63history"></div>`;
 }
 window.jg63RunOpen=function(){dialog();refreshRun();};
 window.jg63RunClose=function(){if(state.watch!==null){toast('Tamatkan rakaman dahulu sebelum tutup.','Finish recording before closing.');return;}$('jg63RunPanel')?.remove();};
 window.jg63StartRun=function(){
  if(state.watch!==null)return;
  if(!navigator.geolocation)return toast('GPS tidak disokong.','GPS unsupported.');
  if(typeof navigationActive!=='undefined'&&navigationActive)return toast('Hentikan navigasi pemanduan dahulu.','Stop driving navigation first.');
  state.started=Date.now();state.elapsed=0;state.points=[];state.meters=0;state.last=null;
  try{state.watch=navigator.geolocation.watchPosition(pos=>{
   const c=pos.coords;if(!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude)||c.accuracy>55)return;
   const p={lat:c.latitude,lon:c.longitude,at:Date.now(),acc:c.accuracy};
   if(state.last){const dt=(p.at-state.last.at)/1000,delta=distance(state.last,p);if(dt<2||delta<4||delta/dt>9)return;state.meters+=delta;}
   state.last=p;state.points.push(p);if(state.points.length>15000)state.points.shift();
   if(typeof map!=='undefined'&&map&&state.points.length===1)map.setView([p.lat,p.lon],16);
   refreshRun();
  },()=>toast('Tidak dapat menerima lokasi GPS.','Unable to receive GPS location.'),{enableHighAccuracy:true,maximumAge:1000,timeout:15000});
  }catch{state.watch=null;toast('GPS tidak dapat dimulakan.','Unable to start GPS.');}
  state.timer=setInterval(()=>{if($('jg63RunPanel'))refreshRun();},1000);
  refreshRun();
 };
 window.jg63StopRun=function(){
  if(state.watch===null)return;
  navigator.geolocation.clearWatch(state.watch);state.watch=null;if(state.timer)clearInterval(state.timer);state.timer=null;state.elapsed+=Date.now()-state.started;
  if(state.points.length){const history=storage('runs',[]);history.unshift({date:new Date().toISOString(),meters:Math.round(state.meters),durationMs:state.elapsed,points:state.points});if(!put('runs',history.slice(0,15)))toast('Storan penuh; eksport GPX untuk simpan.','Storage full; export GPX to save.');}
  refreshRun();toast('Aktiviti telah disimpan pada peranti.','Activity saved on this device.');
 };
 function exportGPX(points){if(!points?.length)return toast('Tiada rekod GPS untuk dieksport.','No GPS track to export.');
  const body=points.map(p=>`<trkpt lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}"><time>${new Date(p.at).toISOString()}</time></trkpt>`).join('');
  const xml=`<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="JomGerak" xmlns="http://www.topografix.com/GPX/1/1"><trk><name>JomGerak Run</name><trkseg>${body}</trkseg></trk></gpx>`;
  const blob=new Blob([xml],{type:'application/gpx+xml'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='jomgerak-run-'+new Date().toISOString().slice(0,10)+'.gpx';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 window.jg63ExportGPX=function(){exportGPX(state.points.length?state.points:storage('runs',[])[0]?.points);};
 window.jg63ExportSaved=function(index){exportGPX(storage('runs',[])[index]?.points);};
 window.jg63History=function(){const e=$('jg63History');if(!e)return;const items=storage('runs',[]);e.innerHTML=items.length?items.map((r,i)=>`<div>${safe(new Date(r.date).toLocaleString())} · ${(r.meters/1000).toFixed(2)} km · ${duration(r.durationMs)} <button onclick="jg63ExportSaved(${i})">GPX</button></div>`).join(''):T('Belum ada rekod.','No saved activities.');};
 window.jg63Mapbox=function(kind){
  const token=window.JOMGERAK_CONFIG?.mapboxPublicToken;
  if(!token)return toast('Masukkan Mapbox public token dalam config.js dahulu.','Add a Mapbox public token in config.js first.');
  const style=kind==='satellite'?'satellite-v9':'streets-v12';
  const url=`https://api.mapbox.com/styles/v1/mapbox/${style}/tiles/256/{z}/{x}/{y}?access_token=${encodeURIComponent(token)}`;
  mapSources48['mapbox-'+kind]={url,maxZoom:20,attribution:'© Mapbox © OpenStreetMap'};
  setMapStyle48('mapbox-'+kind);
 };
 window.jg63Signals=async function(){
  if(typeof map==='undefined'||!map)return;
  if(state.signalLayer){map.removeLayer(state.signalLayer);state.signalLayer=null;state.signalAbort?.abort();toast('Lapisan lampu isyarat dimatikan.','Traffic signal layer disabled.');return;}
  const center=map.getCenter(),radius=2500;state.signalAbort=new AbortController();
  toast('Memuatkan lokasi lampu isyarat…','Loading traffic signal locations…');
  try{
   const q=`[out:json][timeout:15];node[highway=traffic_signals](around:${radius},${center.lat.toFixed(5)},${center.lng.toFixed(5)});out center 150;`;
   const r=await fetch('https://overpass.kumi.systems/api/interpreter',{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'},signal:AbortSignal.any([state.signalAbort.signal,AbortSignal.timeout(18000)])});
   if(!r.ok)throw Error('HTTP '+r.status);const json=await r.json();const group=L.layerGroup();
   for(const p of json.elements||[]){if(Number.isFinite(p.lat)&&Number.isFinite(p.lon))L.circleMarker([p.lat,p.lon],{radius:6,color:'#fff',weight:2,fillColor:'#eab308',fillOpacity:.95}).bindPopup(T('🚦 Lampu isyarat (OSM). Masa pertukaran tidak tersedia.','🚦 Traffic signal (OSM). Timing unavailable.')).addTo(group);}
   group.addTo(map);state.signalLayer=group;toast('Lokasi lampu isyarat dipaparkan jika direkodkan di OSM.','Traffic signals shown where mapped in OSM.');
  }catch(e){if(e.name!=='AbortError')toast('Data lampu isyarat tidak tersedia.','Traffic signal data unavailable.');}
 };
 window.jg63DeviceInfo=function(){toast('Android Auto, Apple CarPlay dan jam pintar memerlukan aplikasi native; PWA tidak boleh menyambung terus.','Android Auto, Apple CarPlay and smartwatches need native apps; PWA cannot directly integrate.');};
 window.jg63Install=function(){toast('Android Chrome: menu ⋮ → Add to Home screen / Install app.','Android Chrome: menu ⋮ → Add to Home screen / Install app.');};
 function init(){
  const css=document.createElement('style');css.textContent=`
   #jg63Host{background:#f1f5f9;border:1px solid #cbd5e1;border-radius:14px;margin:0 0 8px;padding:10px;color:#0f172a;font:600 12px system-ui}
   .jg63head,.jg63dialoghead{display:flex;align-items:center;justify-content:space-between;gap:10px}.jg63head button,.jg63dialoghead button{border-radius:10px;background:#dbeafe;padding:7px 12px;color:#1d4ed8}
   .jg63modes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px}.jg63modes button{border:1px solid #cbd5e1;border-radius:10px;padding:9px 3px;background:#fff;font-size:11px;font-weight:700;min-height:44px}
   .jg63small{font-size:11px!important;line-height:1.45;color:#64748b;margin:9px 0}.jg63dialog{position:fixed;z-index:1600;inset:auto 12px 12px;max-width:460px;max-height:82dvh;overflow:auto;margin:auto;background:#fff;border-radius:18px;padding:16px;box-shadow:0 0 0 100vmax #0009,0 14px 40px #0004;color:#0f172a;font:13px system-ui}
   .jg63stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:15px 0}.jg63stats div{background:#eff6ff;border-radius:12px;text-align:center;padding:12px 4px}.jg63stats b{font-size:19px;display:block}.jg63stats small{font-size:10px;color:#64748b}
   .jg63actions{display:flex;flex-wrap:wrap;gap:6px}.jg63actions button,.jg63history button{border-radius:10px;padding:10px;background:#2563eb;color:#fff;font-weight:700}.jg63history{max-height:160px;overflow:auto;margin-top:10px}.jg63history>div{border-top:1px solid #ddd;padding:8px 0}
   #jg63Body[hidden]{display:none!important}
  `;document.head.append(css);ui();
  const old=window.setLanguage;if(typeof old==='function')window.setLanguage=function(lang){old(lang);ui();if($('jg63RunPanel'))refreshRun();};
  // No automatic GPS tracking or permission prompts. User explicitly starts Run.
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
