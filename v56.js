/* JomGerak V5.6 Smart Road Safety – user reports are unverified, no police checkpoints. */
'use strict';
(function(){
 const allowed=new Set(['Kemalangan','Jalan Rosak','Jalan Ditutup','Banjir','Halangan','Bahaya di Jalan','Kesesakan Trafik']);
 const reports=new Map(), dismissed=new Set();
 let lastGps=null,lastAlert='',lastAlertAt=0,enabled=true,voice=false,refreshAt=0;
 const t=(ms,en)=>appLanguage==='en'?en:ms;
 const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const labels={
 'Kemalangan':['Kemalangan dilaporkan','Reported crash'],
 'Jalan Rosak':['Jalan rosak dilaporkan','Reported damaged road'],
 'Jalan Ditutup':['Jalan ditutup (belum disahkan)','Road closure (unverified)'],
 'Banjir':['Air naik dilaporkan','Reported flooding'],
 'Halangan':['Halangan dilaporkan','Reported obstruction'],
 'Bahaya di Jalan':['Bahaya jalan dilaporkan','Reported road hazard'],
 'Kesesakan Trafik':['Kesesakan dilaporkan','Reported congestion']
 };
 const store=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
 const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
 enabled=load('jg56_alerts',true);voice=load('jg56_voice',false);
 function collect(r){
  if(!allowed.has(r.type)||!Number.isFinite(r.lat)||!Number.isFinite(r.lng))return;
  const id=[r.type,r.lat.toFixed(4),r.lng.toFixed(4)].join(':');
  const old=reports.get(id);
  reports.set(id,{...r,id,receivedAt:old?.receivedAt||Date.now()});
 }
 window.jg56CollectReport=collect;
 function routeGeometry(){
  return currentRouteData?.geometry?.coordinates||[];
 }
 function metric(a,b){
  const lat=(a[1]+b[1])*Math.PI/360, dx=(a[0]-b[0])*111320*Math.cos(lat),dy=(a[1]-b[1])*111320;
  return Math.hypot(dx,dy);
 }
 function along(coords,p){
  if(coords.length<2)return null;
  let best={lateral:Infinity,progress:0},acc=0;
  for(let i=1;i<coords.length;i++){
   const a=coords[i-1],b=coords[i],len=metric(a,b);
   if(len<.01)continue;
   const cos=Math.cos((a[1]+b[1])*Math.PI/360);
   const x=(p[0]-a[0])*111320*cos,y=(p[1]-a[1])*111320;
   const vx=(b[0]-a[0])*111320*cos,vy=(b[1]-a[1])*111320;
   const f=Math.max(0,Math.min(1,(x*vx+y*vy)/(vx*vx+vy*vy)));
   const lateral=Math.hypot(x-vx*f,y-vy*f);
   if(lateral<best.lateral)best={lateral,progress:acc+len*f};
   acc+=len;
  }
  return best;
 }
 function candidate(){
  if(!navigationActive||!lastGps||lastGps.coords.accuracy>75)return null;
  const coords=routeGeometry();if(coords.length<2)return null;
  const gps=along(coords,[lastGps.coords.longitude,lastGps.coords.latitude]);
  if(!gps||gps.lateral>130)return null;
  let best=null;
  for(const r of reports.values()){
   if(dismissed.has(r.id)||Date.now()-r.receivedAt>86400000)continue;
   const q=along(coords,[r.lng,r.lat]);if(!q||q.lateral>110)continue;
   const ahead=q.progress-gps.progress;
   if(ahead<0||ahead>1600)continue;
   if(!best||ahead<best.ahead)best={...r,ahead};
  }
  return best;
 }
 function update(){
  const bar=document.getElementById('jg56Alert');if(!bar)return;
  if(!enabled||!navigationActive){bar.hidden=true;return;}
  const c=candidate();
  if(!c){bar.hidden=true;return;}
  const km=c.ahead>=1000?(c.ahead/1000).toFixed(1)+' km':Math.round(c.ahead/10)*10+' m';
  const label=t(...labels[c.type]);
  bar.hidden=false;
  document.getElementById('jg56AlertTitle').textContent='⚠️ '+label+' · '+km;
  document.getElementById('jg56AlertMeta').textContent=t('Laporan pengguna • Belum disahkan • Ikut papan tanda','User report • Unverified • Follow road signs');
  if(voice&&c.id!==lastAlert&&Date.now()-lastAlertAt>45000){
   lastAlert=c.id;lastAlertAt=Date.now();
   if(typeof window.speakText==='function')window.speakText(label+'. '+t('Anggaran','Approximately')+' '+km+'. '+t('Belum disahkan.','Unverified.'));
  }
 }
 window.jg56GpsUpdate=function(pos){lastGps=pos;if(Date.now()-refreshAt>2500){refreshAt=Date.now();update();}};
 window.jg56Dismiss=function(){const c=candidate();if(c)dismissed.add(c.id);document.getElementById('jg56Alert').hidden=true;};
 window.jg56Toggle=function(name){
  if(name==='voice'){voice=!voice;store('jg56_voice',voice);}
  else{enabled=!enabled;store('jg56_alerts',enabled);}
  renderSettings();update();
 };
 function renderSettings(){
  const p=document.getElementById('jg56Settings');if(!p)return;
  p.innerHTML=`<div style="font-weight:800;margin-bottom:6px">🛡️ ${t('Amaran Keselamatan Jalan','Road Safety Alerts')}</div>
  <p style="font-size:11px;line-height:1.5;margin-bottom:8px">${t('Amaran berdasarkan laporan pengguna berhampiran laluan, bukan pengesanan automatik atau data rasmi. Tidak termasuk lokasi sekatan polis.','Alerts use user-submitted reports near your route, not automatic detection or official data. Police checkpoint locations are excluded.')}</p>
  <button type="button" onclick="jg56Toggle('alerts')">${enabled?'🟢':'⚪'} ${t('Amaran peta','Map alerts')}: ${enabled?'ON':'OFF'}</button>
  <button type="button" onclick="jg56Toggle('voice')">${voice?'🟢':'⚪'} ${t('Amaran suara','Voice alerts')}: ${voice?'ON':'OFF'}</button>
  <p style="font-size:10px;opacity:.75;margin-top:6px">${t('Amaran suara dimatikan secara lalai. Maklumat komuniti mungkin tidak tepat atau lapuk.','Voice alerts are off by default. Community information may be inaccurate or stale.')}</p>`;
 }
 function addButton(){
  const trip=document.querySelector('#jg55TripTab .jg55actions');
  if(!trip)return;
  const b=document.createElement('button');b.type='button';b.id='jg56SafetyButton';b.textContent='🛡️ '+t('Amaran Jalan','Road Alerts');
  b.onclick=()=>{const p=document.getElementById('jg56Settings');p.hidden=!p.hidden;renderSettings();};
  trip.appendChild(b);
  const p=document.createElement('div');p.id='jg56Settings';p.hidden=true;p.style.cssText='padding:9px;border:1px solid #cbd5e1;border-radius:12px;background:#f8fafc;color:#0f172a;margin:8px 0';
  trip.after(p);
 }
 function init(){
  const css=document.createElement('style');css.textContent=`
  #jg56Alert{position:fixed;z-index:720;left:12px;right:12px;bottom:116px;max-width:540px;margin:auto;border-radius:14px;background:#713f12;color:#fff;padding:10px 12px;box-shadow:0 8px 28px #0005;font:600 12px Inter,system-ui,sans-serif}
  #jg56Alert[hidden],#jg56Settings[hidden]{display:none!important}
  #jg56AlertTitle{font-size:14px;font-weight:800}
  #jg56AlertMeta{font-size:10px;opacity:.88;margin-top:3px}
  #jg56Alert button{position:absolute;right:8px;top:7px;border-radius:8px;padding:6px 9px;background:#ffffff25;color:white;font-weight:800}
  #jg56Alert>div{padding-right:32px}
  body.driving-mode #jg56Alert{bottom:196px}
  #jg56Settings button{padding:8px 10px;margin:3px;border-radius:9px;background:#dbeafe;color:#1e40af;font-weight:700;font-size:11px}
  `;document.head.appendChild(css);
  const bar=document.createElement('div');bar.id='jg56Alert';bar.hidden=true;bar.setAttribute('role','status');
  bar.innerHTML='<div id="jg56AlertTitle"></div><div id="jg56AlertMeta"></div><button type="button" aria-label="Dismiss alert" onclick="jg56Dismiss()">×</button>';
  document.body.appendChild(bar);
  addButton();renderSettings();
  const old=window.setLanguage;
  if(typeof old==='function')window.setLanguage=function(lang){old(lang);const b=document.getElementById('jg56SafetyButton');if(b)b.textContent='🛡️ '+t('Amaran Jalan','Road Alerts');renderSettings();update();};
  // Local reports are already loaded in the map; collect existing local storage for route alerts too.
  try{
   const raw=JSON.parse(localStorage.getItem('jomgerak_community_reports_v2')||'[]');
   for(const r of raw)if(r.createdAt&&Date.now()-r.createdAt<86400000)collect(r);
  }catch{}
  setInterval(update,5000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
