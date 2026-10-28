
/* JomGerak V6.0 – Progressive enhancements. Requires existing JomGerak app. */
'use strict';
(function(){
 const state={mode:'car',voices:[],selectedVoice:'',search:null,voiceListening:false,prayerCache:null};
 const tr=(ms,en)=>appLanguage==='en'?en:ms;
 const el=id=>document.getElementById(id);
 const saved=(k,d)=>{try{return JSON.parse(localStorage.getItem('jg60_'+k))??d;}catch{return d;}};
 const save=(k,v)=>{try{localStorage.setItem('jg60_'+k,JSON.stringify(v));}catch{}};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 function notice(ms,en){showToast(tr(ms,en),'info');}
 const places=[
  {id:'SGR01',name:'Gombak / Petaling / Sepang',lat:3.107,lon:101.607},
  {id:'SGR02',name:'Klang / Kuala Langat',lat:2.92,lon:101.47},
  {id:'WLY01',name:'Kuala Lumpur / Putrajaya',lat:3.14,lon:101.69},
  {id:'JHR02',name:'Johor Bahru',lat:1.49,lon:103.74},
  {id:'PNG01',name:'Pulau Pinang',lat:5.41,lon:100.33},
  {id:'KDH01',name:'Alor Setar',lat:6.12,lon:100.37},
  {id:'KTN01',name:'Kota Bharu',lat:6.12,lon:102.24},
  {id:'TRG01',name:'Kuala Terengganu',lat:5.33,lon:103.14},
  {id:'PRK01',name:'Ipoh',lat:4.6,lon:101.09},
  {id:'NSN01',name:'Seremban',lat:2.72,lon:101.94},
  {id:'MLK01',name:'Melaka',lat:2.19,lon:102.25},
  {id:'PHG01',name:'Kuantan',lat:3.81,lon:103.33},
  {id:'SBH01',name:'Kota Kinabalu',lat:5.98,lon:116.07},
  {id:'SWK01',name:'Kuching',lat:1.55,lon:110.35},
  {id:'PLS01',name:'Kangar',lat:6.44,lon:100.2}
 ];
 function modeButton(mode,label,icon){
  return `<button type="button" class="jg60mode ${state.mode===mode?'jg60active':''}" data-mode="${mode}" onclick="jg60Mode('${mode}')">${icon} ${label}</button>`;
 }
 function draw(){
  const m=el('jg60Trip'),settings=el('jg60Settings'),mapTab=el('jg60Map');if(!m||!settings||!mapTab)return;
  m.innerHTML=`<section class="jg60module"><b>🚘 ${tr('Mod Pengangkutan','Transport Mode')}</b>
   <div class="jg60grid">${modeButton('car',tr('Kereta','Car'),'🚗')}${modeButton('motor',tr('Motosikal','Motorcycle'),'🏍️')}${modeButton('walk',tr('Berjalan','Walking'),'🚶')}${modeButton('rail',tr('Keretapi','Rail'),'🚆')}</div>
   <p id="jg60modeNote" class="jg60note"></p><div id="jg60ModeAction"></div></section>
   <section class="jg60module"><b>🎙️ ${tr('Carian Suara','Voice Search')}</b>
   <div class="jg60grid"><button onclick="jg60VoiceSearch('dest')">🎤 ${tr('Cari Destinasi','Search Destination')}</button><button onclick="jg60VoiceSearch('origin')">🎤 ${tr('Cari Permulaan','Search Starting Point')}</button></div>
   <p class="jg60note">${tr('Sebut nama tempat, kemudian pilih hasil carian.','Say a place name, then select a search result.')}</p></section>
   <section class="jg60module"><b>🕌 ${tr('Waktu Solat','Prayer Times')}</b>
   <div class="jg60grid"><button onclick="jg60Prayer()">${tr('Semak Waktu Solat','Check Prayer Times')}</button><button onclick="jg60OpenOfficial()">${tr('Jadual Rasmi JAKIM','Official JAKIM Schedule')}</button></div></section>`;
  settings.innerHTML=`<section class="jg60module"><b>🔊 ${tr('Suara Navigasi','Navigation Voice')}</b>
   <label class="jg60note" for="jg60Voice">${tr('Pilih suara tersedia pada peranti','Select available device voice')}</label>
   <select id="jg60Voice" onchange="jg60SetVoice(this.value)"></select>
   <button onclick="jg60TestVoice()">${tr('Uji Suara','Test Voice')}</button>
   <p class="jg60note">${tr('Suara lelaki/perempuan bergantung pada suara yang dipasang. Loghat negeri memerlukan model suara khas.','Male/female voice availability depends on installed voices. Regional accents require dedicated voice models.')}</p></section>`;
  mapTab.innerHTML=`<section class="jg60module"><b>🧭 ${tr('Kamera Pemanduan','Driving Camera')}</b>
   <div class="jg60grid"><button onclick="jg60Enable3D()">🚘 ${tr('Paparan 3D','3D View')}</button><button onclick="jg60EnableFollow()">📍 ${tr('Ikut GPS','Follow GPS')}</button></div>
   <p class="jg60note">${tr('Kamera perspektif menggunakan MapLibre sedia ada. Bangunan 3D sebenar memerlukan data vektor yang sesuai.','Perspective camera uses existing MapLibre. True 3D buildings require suitable vector data.')}</p></section>`;
  updateModeNote();populateVoices();
 }
 function updateModeNote(){
  const n=el('jg60modeNote');if(!n)return;
  const notes={
   car:['Laluan kereta menggunakan OSRM.','Car routes use OSRM.'],
   motor:['Laluan OSRM kereta hanya rujukan kasar; sekatan motosikal tidak diperiksa. Jangan guna sebagai laluan motosikal yang disahkan.','OSRM car routing is only an approximation; motorcycle restrictions are not checked. Not a verified motorcycle route.'],
   walk:['Laluan berjalan menggunakan API Valhalla awam jika tersedia; mungkin tidak lengkap.','Walking route uses a public Valhalla API when available; coverage may be incomplete.'],
   rail:['Pilih stesen dan jadual melalui laman operator rasmi. Tiada pengiraan laluan tren dalam aplikasi buat masa ini.','Use official operator sites for stations and timetables. In-app rail routing is not available yet.']
  };
  n.textContent=tr(...notes[state.mode]);
  const action=el('jg60ModeAction');if(!action)return;
  if(state.mode==='walk')action.innerHTML=`<button onclick="jg60WalkingRoute()">🚶 ${tr('Kira laluan berjalan','Calculate walking route')}</button><p class="jg60note">${tr('Memerlukan sambungan ke pelayan Valhalla awam; laluan mungkin tidak tersedia.','Requires public Valhalla server access; routing may be unavailable.')}</p>`;
  else if(state.mode==='rail')action.innerHTML=`<button onclick="jg60RailPlanner()">🚆 ${tr('Buka Perancang KTM','Open KTM Planner')}</button>`;
  else action.replaceChildren();
 }
 window.jg60Mode=function(mode){
  if(!['car','motor','walk','rail'].includes(mode))return;
  state.mode=mode;save('mode',mode);draw();
  if(mode==='rail')notice('Gunakan laman operator rasmi untuk perjalanan tren.','Use official operator sites for train journeys.');
  if(mode==='motor')notice('OSRM tidak mengesahkan jalan khusus motosikal.','OSRM does not verify motorcycle-specific restrictions.');
 };

 function decodePolyline6(str){
  let i=0,lat=0,lon=0,coords=[];
  while(i<str.length){
   const nums=[];
   for(let n=0;n<2;n++){
    let shift=0,result=0,b;
    do{if(i>=str.length)throw Error('invalid shape');b=str.charCodeAt(i++)-63;result|=(b&31)<<shift;shift+=5;}while(b>=32);
    nums.push((result&1)?~(result>>1):(result>>1));
   }
   lat+=nums[0];lon+=nums[1];coords.push([lat/1e6,lon/1e6]);
  }
  return coords;
 }
 window.jg60RailPlanner=function(){window.open('https://www.ktmb.com.my/','_blank','noopener,noreferrer');};
 window.jg60WalkingRoute=async function(){
  if(!originCoords||!destCoords)return notice('Tetapkan lokasi mula dan destinasi dahulu.','Set start and destination first.');
  if(navigationActive)return notice('Hentikan navigasi kereta dahulu.','Stop car navigation first.');
  const action=el('jg60ModeAction');if(action)action.textContent=tr('Mengira laluan berjalan…','Calculating walking route…');
  try{
   const payload={locations:[{lat:originCoords.lat,lon:originCoords.lng},{lat:destCoords.lat,lon:destCoords.lng}],costing:'pedestrian',units:'kilometers',directions_options:{units:'kilometers'}};
   const url='https://valhalla1.openstreetmap.de/route?json='+encodeURIComponent(JSON.stringify(payload));
   const res=await fetch(url,{signal:AbortSignal.timeout(18000)});if(!res.ok)throw Error('service');
   const data=await res.json();if(!data.trip?.legs?.length)throw Error('no route');
   const points=data.trip.legs.flatMap(leg=>decodePolyline6(leg.shape));
   if(points.length<2)throw Error('empty route');
   if(routePolyline)map.removeLayer(routePolyline);
   routePolyline=L.polyline(points,{color:'#16a34a',weight:6,opacity:.9}).addTo(map);
   map.fitBounds(routePolyline.getBounds(),{padding:[45,45]});
   // Walking routes intentionally do not populate OSRM driving steps or start car navigation.
   currentRouteData=null;routes47=[];if(typeof renderChoices47==='function')renderChoices47();
   const mins=Math.round(data.trip.summary.time/60),km=data.trip.summary.length;
   notice('Laluan berjalan: '+km.toFixed(1)+' km, '+mins+' min (anggaran).','Walking route: '+km.toFixed(1)+' km, '+mins+' min (estimate).');
  }catch{
   notice('Laluan berjalan tidak tersedia. Periksa internet atau cuba lagi.','Walking route unavailable. Check connection or try again.');
  }finally{updateModeNote();}
 };
function voiceList(){
  if(!('speechSynthesis' in window))return[];
  return speechSynthesis.getVoices().filter(v=>/^(ms|en)/i.test(v.lang));
 }
 function populateVoices(){
  const select=el('jg60Voice');if(!select)return;
  const voices=voiceList();state.voices=voices;
  select.replaceChildren();
  const auto=document.createElement('option');auto.value='';auto.textContent=tr('Automatik (peranti)','Automatic (device)');select.appendChild(auto);
  for(const v of voices){const o=document.createElement('option');o.value=v.voiceURI;o.textContent=v.name+' ('+v.lang+')';select.appendChild(o);}
  select.value=voices.some(v=>v.voiceURI===state.selectedVoice)?state.selectedVoice:'';
 }
 window.jg60SetVoice=function(v){state.selectedVoice=v;save('voice',v);};
 window.jg60TestVoice=function(){
  if(!('speechSynthesis' in window))return notice('Suara tidak disokong.','Speech not supported.');
  const utterance=new SpeechSynthesisUtterance(tr('Selamat datang ke JomGerak.','Welcome to JomGerak.'));
  utterance.lang=appLanguage==='en'?'en-MY':'ms-MY';
  const voice=state.voices.find(v=>v.voiceURI===state.selectedVoice);if(voice)utterance.voice=voice;
  speechSynthesis.cancel();speechSynthesis.speak(utterance);
 };
 // The existing app uses speechSynthesis; selecting a device voice is applied by intercepting speak().
 function voiceHook(){
  if(!('speechSynthesis' in window))return;
  const original=speechSynthesis.speak.bind(speechSynthesis);
  try{speechSynthesis.speak=function(utterance){
   const v=voiceList().find(v=>v.voiceURI===state.selectedVoice);
   if(v)utterance.voice=v;
   return original(utterance);
  };}catch{/* Native browser implementation may not allow overriding. */}
 }
 window.jg60VoiceSearch=function(type){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return notice('Carian suara tidak disokong oleh browser.','Voice search unsupported in this browser.');
  if(state.search){state.search.abort();state.search=null;}
  const rec=new SR();rec.lang=appLanguage==='en'?'en-MY':'ms-MY';rec.interimResults=false;
  rec.onresult=ev=>{
   let query=ev.results[0][0].transcript.trim();
   query=query.replace(/^(cari|pergi ke|navigasi ke|navigate to|search for|go to)\s+/i,'');
   const input=el(type==='origin'?'originInput':'destInput');
   if(!input||query.length<2)return;
   input.value=query;
   input.dispatchEvent(new Event('input',{bubbles:true}));
   if(typeof triggerNominatimSearch==='function')triggerNominatimSearch(query,type);
   notice('Pilih lokasi daripada hasil carian.','Select a location from search results.');
  };
  rec.onerror=()=>notice('Mikrofon tidak tersedia atau akses ditolak.','Microphone unavailable or access denied.');
  rec.onend=()=>{if(state.search===rec)state.search=null;};
  state.search=rec;try{rec.start();notice('Sila sebut destinasi.','Say your destination.');}catch{notice('Tidak dapat mengaktifkan mikrofon.','Unable to start microphone.');}
 };
 window.jg60Enable3D=function(){
  if(typeof jgToggle3D==='function'&&!jg3dActive)jgToggle3D();
  else if(jg3dActive)notice('Paparan 3D sudah aktif.','3D view already active.');
 };
 window.jg60EnableFollow=function(){if(typeof setMapView48==='function')setMapView48('follow');};
 window.jg60OpenOfficial=function(){window.open('https://www.e-solat.gov.my/','_blank','noopener,noreferrer');};
 function prayerUI(){
  let panel=el('jg60PrayerPanel');
  if(!panel){panel=document.createElement('div');panel.id='jg60PrayerPanel';panel.className='jg60prayer';document.body.appendChild(panel);}
  const zone=saved('zone','SGR02');
  panel.innerHTML=`<div class="jg60prayerhead"><b>🕌 ${tr('Waktu Solat Malaysia','Malaysia Prayer Times')}</b><button onclick="jg60ClosePrayer()">✕</button></div>
  <label>${tr('Pilih kawasan rujukan','Choose reference area')}</label>
  <select id="jg60Zone">${places.map(p=>`<option value="${p.id}" ${zone===p.id?'selected':''}>${esc(p.name)}</option>`).join('')}</select>
  <button onclick="jg60FetchPrayer()">${tr('Semak Waktu','Check Times')}</button>
  <div id="jg60PrayerResult" aria-live="polite"></div>
  <p class="jg60note">${tr('Waktu di bawah adalah anggaran daripada Aladhan mengikut koordinat bandar, bukan jadual zon JAKIM. Untuk waktu rasmi, rujuk e-Solat JAKIM.','Times below are Aladhan coordinate-based estimates, not JAKIM zone schedules. Check e-Solat JAKIM for official times.')}</p>
  <button onclick="jg60OpenOfficial()">↗ ${tr('e-Solat JAKIM (Rasmi)','e-Solat JAKIM (Official)')}</button>`;
 }
 window.jg60Prayer=function(){prayerUI();};
 window.jg60ClosePrayer=function(){el('jg60PrayerPanel')?.remove();};
 window.jg60FetchPrayer=async function(){
  const id=el('jg60Zone')?.value,place=places.find(p=>p.id===id),out=el('jg60PrayerResult');if(!place||!out)return;
  save('zone',id);out.textContent=tr('Memuatkan waktu…','Loading times…');
  try{
   // Coordinate-based prayer times, explicit non-official source; local date in Malaysia.
   const dt=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kuala_Lumpur',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date()).replaceAll('/','-');
   const url=`https://api.aladhan.com/v1/timings/${dt}?latitude=${place.lat}&longitude=${place.lon}&method=3`;
   const r=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('unavailable');
   const data=await r.json(),times=data.data?.timings;if(!times)throw Error('no timings');
   out.replaceChildren();
   for(const [key,ms] of [['Fajr','Subuh'],['Sunrise','Syuruk'],['Dhuhr','Zohor'],['Asr','Asar'],['Maghrib','Maghrib'],['Isha','Isyak']]){
    const row=document.createElement('div');row.className='jg60prayerrow';
    const name=document.createElement('span');name.textContent=tr(ms,key);
    const value=document.createElement('strong');value.textContent=String(times[key]||'—').replace(/\s*\(.+\)/,'');
    row.append(name,value);out.appendChild(row);
   }
  }catch{out.textContent=tr('Waktu tidak dapat dimuatkan. Semak jadual rasmi JAKIM.','Unable to load times. Check official JAKIM schedule.');}
 };
 function init(){
  state.mode=saved('mode','car');state.selectedVoice=saved('voice','');
  const css=document.createElement('style');css.textContent=`
   .jg60module{border:1px solid #cbd5e1;border-radius:13px;padding:10px;margin:8px 0;background:#f8fafc;color:#172554;font:600 12px Inter,system-ui,sans-serif}
   .jg60module b{display:block;margin-bottom:8px}.jg60grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px}
   .jg60module button,.jg60prayer button{padding:10px 6px;border-radius:10px;background:#dbeafe;color:#1d4ed8;font-size:11px;font-weight:700}
   .jg60module button.jg60active{background:#2563eb;color:white}
   .jg60module select,.jg60prayer select{display:block;width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:9px;margin:7px 0;color:#0f172a;background:white}
   .jg60note{font-size:10px!important;line-height:1.55;color:#475569;margin:7px 0}
   .jg60prayer{position:fixed;z-index:1001;left:12px;right:12px;top:50%;transform:translateY(-50%);max-width:450px;max-height:85dvh;overflow:auto;margin:auto;background:white;color:#0f172a;border-radius:18px;padding:18px;box-shadow:0 0 0 100vmax #0007,0 12px 40px #0004;font:13px Inter,system-ui,sans-serif}
   .jg60prayerhead{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
   .jg60prayerrow{display:flex;justify-content:space-between;padding:9px 4px;border-bottom:1px solid #e2e8f0}
  `;document.head.appendChild(css);
  draw();voiceHook();
  if('speechSynthesis' in window)speechSynthesis.addEventListener?.('voiceschanged',populateVoices);
  const old=window.setLanguage;
  if(typeof old==='function')window.setLanguage=function(lang){old(lang);draw();if(el('jg60PrayerPanel'))prayerUI();};
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
