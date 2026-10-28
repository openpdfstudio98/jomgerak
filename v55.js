
/* JomGerak V5.5 – real browser-side features; external APIs remain best-effort. */
'use strict';
const J55 = {
  tab:'map', panel:'', stops:[], voice:null, drive:false, lastWeather:0,
  i18n:{
    map:['Peta','Map'],trip:['Perjalanan','Journey'],settings:['Tetapan','Settings'],
    compare:['Banding Laluan','Compare Routes'],stops:['Multi-Hentian','Multi-Stop'],
    pit:['Pit Stop','Pit Stop'],cost:['Kos Perjalanan','Trip Costs'],
    weather:['Cuaca Laluan','Route Weather'],offline:['Simpan Offline','Save Offline'],
    reports:['Sahkan Laporan','Verify Reports'],vehicle:['Profil Kenderaan','Vehicle Profile'],
    voice:['Arahan Suara','Voice Command'],drive:['Paparan Pemanduan','Driving Display']
  }
};
function jg55T(ms,en){return appLanguage==='en'?en:ms;}
function jg55Esc(t){return String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function jg55Read(key,fallback){try{return JSON.parse(localStorage.getItem('jg55_'+key))??fallback;}catch{return fallback;}}
function jg55Save(key,v){try{localStorage.setItem('jg55_'+key,JSON.stringify(v));return true;}catch{return false;}}
function jg55Msg(ms,en){showToast(jg55T(ms,en),'info');}
function jg55Tab(tab){
 if(!['map','trip','settings'].includes(tab))return;
 J55.tab=tab;
 for(const name of ['map','trip','settings']){
  document.getElementById('jg55'+({map:'Map',trip:'Trip',settings:'Settings'}[name])+'Tab').hidden=name!==tab;
  document.getElementById('jg55tab-'+name).setAttribute('aria-selected',String(name===tab));
 }
 document.getElementById('jg55Panel').hidden=true;J55.panel='';
 jg55Lang();
}
function jg55Lang(){
 document.querySelectorAll('[data-jg55]').forEach(el=>{
  const k=el.dataset.jg55;if(J55.i18n[k])el.textContent=J55.i18n[k][appLanguage==='en'?1:0];
 });
 document.getElementById('jg55DriveModeLabel')?.replaceChildren(document.createTextNode(jg55T('Pemanduan','Driving')));
}
function jg55Show(which){
 const panel=document.getElementById('jg55Panel');
 if(J55.panel===which&&!panel.hidden){panel.hidden=true;J55.panel='';return;}
 J55.panel=which;panel.hidden=false;
 const title={
 compare:['Banding laluan','Route comparison'],stops:['Multi-hentian','Multi-stop route'],
 pit:['Pit Stop','Pit stops'],cost:['Kos perjalanan','Trip cost'],weather:['Cuaca sepanjang laluan','Weather along route'],
 offline:['Persediaan offline','Offline trip preparation'],reports:['Pengesahan komuniti','Community verification'],
 vehicle:['Profil kenderaan','Vehicle profile']
 }[which];
 if(!title)return;
 const h='<strong>'+jg55Esc(jg55T(...title))+'</strong>';
 if(which==='vehicle'){
  const v=jg55Read('vehicle',{name:'Kereta',fuel:'ron95',liters:7.2,price:2.05});
  panel.innerHTML=h+`
  <label>${jg55T('Nama kenderaan','Vehicle name')}</label><input id="j55car" maxlength="40" value="${jg55Esc(v.name)}">
  <label>${jg55T('Jenis bahan api','Fuel type')}</label><select id="j55fuel"><option value="ron95">RON95</option><option value="ron97">RON97</option><option value="diesel">Diesel</option><option value="ev">EV</option></select>
  <label>${jg55T('Penggunaan (L/100km atau kWh/100km)','Consumption (L/100km or kWh/100km)')}</label><input id="j55liters" type="number" min="1" max="80" step=".1" value="${v.liters}">
  <label>${jg55T('Harga RM seunit (masukkan sendiri)','RM per unit (manual entry)')}</label><input id="j55price" type="number" min="0" max="20" step=".01" value="${v.price}">
  <button onclick="jg55SaveVehicle()">${jg55T('Simpan','Save')}</button>
  <p class="jg55note">${jg55T('Harga tidak disambung kepada data petrol langsung.','Prices are not connected to live fuel pricing.')}</p>`;
  panel.querySelector('#j55fuel').value=v.fuel;
 } else if(which==='stops'){
  panel.innerHTML=h+`<p class="jg55note">${jg55T('Cari nama tempat dan pilih hasil untuk tambah hentian. Laluan dikira melalui OSRM.','Search for a place and choose a result to add a waypoint. Routing uses OSRM.')}</p>
  <input id="j55search" placeholder="${jg55T('Cari hentian di Malaysia','Search stop in Malaysia')}" maxlength="120">
  <button onclick="jg55SearchStop()">${jg55T('Cari','Search')}</button><div id="j55searchResults"></div>
  <div id="j55stopsList"></div><button onclick="jg55RouteStops()">${jg55T('Kira Laluan Multi-Hentian','Calculate Multi-Stop Route')}</button>`;
  jg55ListStops();
 }else if(which==='cost'){
  panel.innerHTML=h+`<div class="jg55result" id="j55costResult"></div><label><input id="j55return" type="checkbox" style="width:auto;min-height:auto" onchange="jg55Cost()"> ${jg55T('Pergi balik (anggaran 2×)','Round trip (approx. 2×)')}</label>
  <button onclick="jg55Show('vehicle')">${jg55T('Ubah profil kenderaan','Edit vehicle profile')}</button>`;
  jg55Cost();
 }else if(which==='compare'){
  panel.innerHTML=h+`<div id="j55compareResult"></div>`;
  jg55Compare();
 }else if(which==='pit'){
  panel.innerHTML=h+`<p class="jg55note">${jg55T('Cari kemudahan OSM sekitar laluan; bukan semestinya boleh diakses terus.','Find OSM facilities near the route; direct road access is not guaranteed.')}</p>
  <select id="j55pitType"><option value="fuel">${jg55T('Stesen minyak','Petrol stations')}</option><option value="restaurant">${jg55T('Restoran','Restaurants')}</option><option value="charging_station">EV Charging</option><option value="place_of_worship">${jg55T('Surau / tempat ibadat','Prayer facilities')}</option><option value="toilets">${jg55T('Tandas','Toilets')}</option></select>
  <button onclick="jg55PitSearch()">${jg55T('Cari sepanjang laluan','Search along route')}</button><div id="j55pitResults"></div>`;
 }else if(which==='weather'){
  panel.innerHTML=h+`<p class="jg55note">${jg55T('Ramalan cuaca Open-Meteo di tiga titik sepanjang laluan. Bukan amaran banjir rasmi.','Open-Meteo forecasts at three points along the route. Not official flood alerts.')}</p>
  <button onclick="jg55Weather()">${jg55T('Semak cuaca','Check weather')}</button><div id="j55weatherResults"></div>`;
 }else if(which==='offline'){
  panel.innerHTML=h+`<p class="jg55note">${jg55T('Simpan koordinat dan arahan laluan pada peranti. Peta dan pengiraan laluan masih memerlukan internet.','Save route coordinates and directions on your device. Maps and route calculation still require internet.')}</p>
  <button onclick="jg55SaveOffline()">${jg55T('Simpan perjalanan ini','Save current trip')}</button>
  <button onclick="jg55OpenOffline()">${jg55T('Lihat perjalanan tersimpan','View saved trip')}</button>
  <div id="j55offlineResults"></div>`;
 }else if(which==='reports'){
  panel.innerHTML=h+`<p class="jg55note">${jg55T('Hanya laporan komuniti yang mempunyai ID boleh disahkan. Pengesahan merentas pengguna memerlukan backend yang menyimpan undian dan menghalang penyalahgunaan.','Only reports with IDs can be verified. Cross-user voting needs a backend with abuse protection.')}</p>
  <button onclick="jg55ReportInfo()">${jg55T('Semak status laporan','Check report status')}</button><div id="j55reportResults"></div>`;
 }
}
function jg55SaveVehicle(){
 const v={name:document.getElementById('j55car').value.trim().slice(0,40)||'Car',fuel:document.getElementById('j55fuel').value,
 liters:Number(document.getElementById('j55liters').value),price:Number(document.getElementById('j55price').value)};
 if(!(v.liters>=1&&v.liters<=80&&v.price>=0&&v.price<=20))return jg55Msg('Sila masukkan nilai yang sah.','Enter valid values.');
 jg55Save('vehicle',v);jg55Msg('Profil kenderaan disimpan.','Vehicle profile saved.');
}
function jg55Cost(){
 const el=document.getElementById('j55costResult');if(!el)return;
 if(!currentRouteData){el.textContent=jg55T('Kira laluan dahulu.','Calculate a route first.');return;}
 const v=jg55Read('vehicle',{name:'Kereta',fuel:'ron95',liters:7.2,price:2.05});
 const km=currentRouteData.distance/1000*(document.getElementById('j55return')?.checked?2:1);
 const units=km*v.liters/100, cost=units*v.price;
 el.textContent=`${v.name} · ${km.toFixed(1)} km\n${units.toFixed(2)} ${v.fuel==='ev'?'kWh':'L'} × RM${v.price.toFixed(2)} = RM${cost.toFixed(2)}\n${jg55T('Tol tidak termasuk (data belum disahkan).','Tolls excluded (unverified data).')}`;
}
function jg55Compare(){
 const el=document.getElementById('j55compareResult');if(!el)return;
 if(!routes47?.length){el.textContent=jg55T('Kira laluan dahulu.','Calculate a route first.');return;}
 const v=jg55Read('vehicle',{liters:7.2,price:2.05});
 const shortest=Math.min(...routes47.map(r=>r.distance)),fastest=Math.min(...routes47.map(r=>r.duration));
 el.replaceChildren();
 routes47.forEach((r,i)=>{
  const div=document.createElement('div');div.className='jg55item';
  const label=(i+1)+' · '+(r.distance/1000).toFixed(1)+' km · '+Math.round(r.duration/60)+' min · RM'+(r.distance/1000*v.liters/100*v.price).toFixed(2)
  +(r.duration===fastest?' ⚡':'')+(r.distance===shortest?' 📏':'');
  const b=document.createElement('button');b.textContent=jg55T('Pilih','Select');b.onclick=()=>{selectRoute47(i);jg55Compare();};
  div.append(document.createTextNode(label+' '),b);el.appendChild(div);
 });
 const note=document.createElement('p');note.className='jg55note';note.textContent=jg55T('OSRM tidak menyediakan trafik langsung atau kadar tol.','OSRM provides neither live traffic nor toll prices.');el.appendChild(note);
}
async function jg55SearchStop(){
 const input=document.getElementById('j55search'),el=document.getElementById('j55searchResults');const q=input.value.trim();
 if(q.length<3)return;
 el.textContent=jg55T('Mencari…','Searching…');
 try{
  const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&countrycodes=my&limit=5&q='+encodeURIComponent(q),{signal:AbortSignal.timeout(12000)});
  if(!r.ok)throw Error('Search failed');const data=await r.json();el.replaceChildren();
  for(const place of data){
   const b=document.createElement('button');b.textContent=(place.display_name||'').slice(0,100);
   b.onclick=()=>{if(J55.stops.length>=5)return jg55Msg('Maksimum 5 hentian.','Maximum 5 stops.');
    J55.stops.push({lat:Number(place.lat),lng:Number(place.lon),name:place.display_name.slice(0,100)});
    jg55Save('stops',J55.stops);jg55ListStops();el.replaceChildren();};el.appendChild(b);
  }
 }catch{el.textContent=jg55T('Carian gagal. Cuba lagi.','Search failed. Try again.');}
}
function jg55ListStops(){
 const el=document.getElementById('j55stopsList');if(!el)return;el.replaceChildren();
 J55.stops.forEach((p,i)=>{const row=document.createElement('div');row.className='jg55item';
  const b=document.createElement('button');b.textContent='×';b.setAttribute('aria-label','Remove stop');b.onclick=()=>{J55.stops.splice(i,1);jg55Save('stops',J55.stops);jg55ListStops();};
  row.append(document.createTextNode((i+1)+'. '+p.name+' '),b);el.appendChild(row);
 });
}
async function jg55RouteStops(){
 if(!originCoords||!destCoords)return jg55Msg('Tetapkan mula dan destinasi dahulu.','Set start and destination first.');
 if(!J55.stops.length)return jg55Msg('Tambah sekurang-kurangnya satu hentian.','Add at least one stop.');
 if(navigationActive)return jg55Msg('Hentikan navigasi dahulu.','Stop navigation first.');
 const btn=document.querySelector('#jg55Panel button[onclick="jg55RouteStops()"]');if(btn)btn.disabled=true;
 try{
  const all=[originCoords,...J55.stops,destCoords];
  const coords=all.map(p=>p.lng+','+p.lat).join(';');
  const r=await fetch('https://router.project-osrm.org/route/v1/driving/'+coords+'?overview=full&geometries=geojson&steps=true',{signal:AbortSignal.timeout(18000)});
  if(!r.ok)throw Error('routing');const data=await r.json();if(!data.routes?.length)throw Error('no route');
  routes47=[data.routes[0]];selected47=0;currentRouteData=data.routes[0];lastSpokenStep=-1;
  if(routePolyline)map.removeLayer(routePolyline);
  routePolyline=L.geoJSON(currentRouteData.geometry,{style:{color:'#2563eb',weight:6,opacity:.95}}).addTo(map);
  map.fitBounds(routePolyline.getBounds(),{padding:[60,60]});
  renderRouteSummary(currentRouteData);updateFuelCalculation();renderChoices47();jgSync3DRoute();
  jg55Msg('Laluan multi-hentian berjaya dikira.','Multi-stop route calculated.');
 }catch{jg55Msg('Gagal mengira laluan multi-hentian.','Multi-stop routing failed.');}
 finally{if(btn)btn.disabled=false;}
}
function jg55Samples(){
 const pts=currentRouteData?.geometry?.coordinates;if(!pts?.length)return null;
 return [.15,.5,.85].map(f=>pts[Math.floor(f*(pts.length-1))]);
}
async function jg55PitSearch(){
 const el=document.getElementById('j55pitResults'),samples=jg55Samples();
 if(!samples){el.textContent=jg55T('Kira laluan dahulu.','Calculate a route first.');return;}
 const amenity=document.getElementById('j55pitType').value;
 const query='[out:json][timeout:20];('+samples.map(c=>`node(around:1200,${c[1]},${c[0]})["amenity"="${amenity}"];`).join('')+');out body 35;';
 el.textContent=jg55T('Mencari…','Searching…');
 try{
  const r=await fetch('https://overpass-api.de/api/interpreter?data='+encodeURIComponent(query),{signal:AbortSignal.timeout(25000)});
  if(!r.ok)throw Error('Overpass');const data=await r.json();el.replaceChildren();poiMarkersGroup.clearLayers();
  const seen=new Set();
  for(const x of data.elements||[]){
   if(!Number.isFinite(x.lat)||!Number.isFinite(x.lon)||seen.has(x.id))continue;seen.add(x.id);
   const name=x.tags?.name||amenity;
   const row=document.createElement('div');row.className='jg55item';
   const btn=document.createElement('button');btn.textContent=jg55T('Destinasi','Destination');
   btn.onclick=()=>{selectLocation('dest',x.lat,x.lon,name);jg55Msg('Destinasi ditukar. Kira laluan baharu.','Destination changed. Recalculate route.');};
   row.append(document.createTextNode(name+' '),btn);el.appendChild(row);
   L.marker([x.lat,x.lon]).addTo(poiMarkersGroup).bindPopup(name);
  }
  if(!seen.size)el.textContent=jg55T('Tiada hasil ditemui.','No results found.');
 }catch{el.textContent=jg55T('Carian kemudahan gagal.','Facility search failed.');}
}
async function jg55Weather(){
 const el=document.getElementById('j55weatherResults'),samples=jg55Samples();
 if(!samples){el.textContent=jg55T('Kira laluan dahulu.','Calculate a route first.');return;}
 el.textContent=jg55T('Memuatkan cuaca…','Loading weather…');
 try{
  const results=await Promise.all(samples.map(async(c,i)=>{
   const url=`https://api.open-meteo.com/v1/forecast?latitude=${c[1]}&longitude=${c[0]}&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FKuala_Lumpur`;
   const r=await fetch(url,{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error('weather');
   const d=await r.json();return `${Math.round((i+1)*25)}%: ${d.current.temperature_2m}°C · ${d.current.precipitation} mm`;
  }));
  el.textContent=results.join('\n')+'\n'+jg55T('Ramalan titik lokasi, bukan amaran banjir rasmi.','Point forecasts, not official flood alerts.');
 }catch{el.textContent=jg55T('Ramalan cuaca tidak tersedia.','Weather forecast unavailable.');}
}
function jg55SaveOffline(){
 if(!currentRouteData)return jg55Msg('Kira laluan dahulu.','Calculate a route first.');
 const snapshot={date:new Date().toISOString(),from:originCoords?.name||'Start',to:destCoords?.name||'Destination',
  distance:currentRouteData.distance,duration:currentRouteData.duration,
  steps:(currentRouteData.legs||[]).flatMap(l=>l.steps||[]).map(x=>({name:x.name,distance:x.distance,type:x.maneuver?.type,modifier:x.maneuver?.modifier})).slice(0,300),
  geometry:currentRouteData.geometry?.coordinates?.filter((_,i)=>i%Math.max(1,Math.floor(currentRouteData.geometry.coordinates.length/500))===0)};
 if(jg55Save('offlineTrip',snapshot))jg55Msg('Arahan dan laluan disimpan pada peranti.','Route and directions saved on device.');
 else jg55Msg('Ruang simpanan tidak mencukupi.','Storage unavailable.');
}
function jg55OpenOffline(){
 const el=document.getElementById('j55offlineResults'),v=jg55Read('offlineTrip',null);
 if(!v){el.textContent=jg55T('Tiada perjalanan tersimpan.','No saved trip.');return;}
 el.replaceChildren();const head=document.createElement('p');head.textContent=v.from+' → '+v.to+' · '+(v.distance/1000).toFixed(1)+' km';el.appendChild(head);
 for(const step of v.steps.slice(0,80)){const row=document.createElement('div');row.className='jg55item';row.textContent=(step.type||'')+' '+(step.modifier||'')+' · '+(step.name||'')+' · '+Math.round(step.distance)+' m';el.appendChild(row);}
}
function jg55ReportInfo(){
 const el=document.getElementById('j55reportResults');el.textContent=jg55T(
 'Pengesahan bersama belum tersedia tanpa pangkalan data undian, pengesahan identiti dan moderasi. Laporan pada peta tidak patut dianggap disahkan.',
 'Shared verification is unavailable without a vote database, identity controls and moderation. Map reports should not be considered verified.');
}
function jg55VoiceStart(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR)return jg55Msg('Pengecaman suara tidak disokong browser ini.','Speech recognition is not supported by this browser.');
 if(J55.voice){J55.voice.stop();J55.voice=null;return;}
 const rec=new SR();rec.lang=appLanguage==='en'?'en-MY':'ms-MY';rec.interimResults=false;rec.maxAlternatives=1;J55.voice=rec;
 rec.onresult=e=>{
  const t=e.results[0][0].transcript.toLowerCase();
  if(/(petrol|fuel|minyak|station)/.test(t)){jg55Tab('trip');jg55Show('pit');document.getElementById('j55pitType').value='fuel';jg55PitSearch();}
  else if(/(stop navigation|henti navigasi|berhenti navigasi)/.test(t)){if(navigationActive)stopLiveNavigation();}
  else if(/(follow gps|ikut gps|lokasi saya|my location)/.test(t))recenterNavigation();
  else if(/(weather|cuaca)/.test(t)){jg55Tab('trip');jg55Show('weather');jg55Weather();}
  else jg55Msg('Arahan tidak dikenal pasti.','Command not recognized.');
 };
 rec.onerror=()=>jg55Msg('Mikrofon tidak tersedia atau akses ditolak.','Microphone unavailable or permission denied.');
 rec.onend=()=>{J55.voice=null;};rec.start();jg55Msg('Mendengar arahan suara…','Listening for voice command…');
}
function jg55ToggleDriving(){
 if(!navigationActive)return jg55Msg('Mulakan navigasi dahulu.','Start navigation first.');
 J55.drive=!J55.drive;
 if(J55.drive){drivingPanelsOpen=false;document.body.classList.add('driving-mode');document.getElementById('searchPanelWrap').style.display='none';document.getElementById('routeSummaryPanel').style.display='none';document.getElementById('jgProPanel').classList.add('jgfolded');}
 else{drivingPanelsOpen=true;document.body.classList.remove('driving-mode');document.getElementById('searchPanelWrap').style.display='flex';document.getElementById('routeSummaryPanel').style.display='';}
 setTimeout(()=>map.invalidateSize(),120);
}
function jg55UpdateDrive(){
 const e=document.getElementById('jg55DriveHUD');if(!e)return;
 if(!navigationActive){e.style.display='none';J55.drive=false;return;}
 e.style.display=J55.drive?'block':'none';
 if(!J55.drive)return;
 const text=document.getElementById('liveInstruction')?.textContent||jg55T('Ikut laluan','Follow route');
 const metrics=document.getElementById('jg52TripMetrics')?.textContent||'';
 e.querySelector('.jg55direction').textContent=text;e.querySelector('small').textContent=metrics;
}
function jg55Init(){
 J55.stops=jg55Read('stops',[]);if(!Array.isArray(J55.stops))J55.stops=[];
 const hud=document.createElement('div');hud.id='jg55DriveHUD';
 hud.innerHTML='<div class="jg55hud"><div><div class="jg55direction"></div><small></small></div><button type="button" onclick="jg55ToggleDriving()">☰</button></div>';
 document.body.appendChild(hud);
 jg55Tab('map');jg55Lang();
 // Preserve existing BM/EN behavior; update newly added controls after language switch.
 const orig=window.setLanguage;
 window.setLanguage=function(lang){orig(lang);jg55Lang();if(J55.panel){const p=J55.panel;J55.panel='';jg55Show(p);}};
 setInterval(jg55UpdateDrive,1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',jg55Init);else jg55Init();
