/* Vehicle identity and editable trip estimates. No unsupported truck/off-road routing. */
'use strict';
(function(){
 const key='jg_garage_v1';
 const types={
  car:{label:'Car',icon:'car',mode:'car',consumption:7.2,fuel:'RON95',models:['Proton Persona','Proton Saga','Perodua Myvi','Perodua Bezza','Honda City','Toyota Vios']},
  motor:{label:'Motorcycle',icon:'motorcycle',mode:'motor',consumption:2.5,fuel:'RON95',models:['Yamaha Y15ZR','Yamaha Y16ZR','Honda RS150R','Honda ADV160','Modenas Kriss']},
  truck:{label:'Truck',icon:'truck',mode:'truck',consumption:18,fuel:'diesel',models:['Isuzu NPR','Hino 300','Mitsubishi Fuso Canter','UD Trucks']},
  '4x4':{label:'4×4',icon:'truck-pickup',mode:'4x4',consumption:10,fuel:'diesel',models:['Toyota Hilux','Mitsubishi Triton','Ford Ranger','Isuzu D-Max','Nissan Navara']}
 };
 const colors=['#3b82f6','#f8fafc','#172554','#ef4444','#f59e0b','#10b981'];
 const defaults={type:'car',model:'Proton Persona',color:'#3b82f6',fuel:'RON95',consumption:7.2,price:2.05,height:0,width:0,length:0,weight:0};
 function validate(value){
  const v={...defaults,...(value&&typeof value==='object'?value:{})};
  if(!types[v.type])v.type='car';
  v.model=typeof v.model==='string'?v.model.trim().slice(0,60):types[v.type].models[0];
  if(!/^#[a-f0-9]{6}$/i.test(v.color))v.color=defaults.color;
  if(!['RON95','RON97','diesel','EV'].includes(v.fuel))v.fuel=types[v.type].fuel;
  for(const [field,min,max]of [['consumption',.1,100],['price',0,100],['height',0,10],['width',0,10],['length',0,30],['weight',0,100]]){
   const n=Number(v[field]);v[field]=Number.isFinite(n)&&n>=min&&n<=max?n:defaults[field];
  }
  return v;
 }
 let profile;try{profile=validate(JSON.parse(localStorage.getItem(key)))}catch{profile={...defaults}}
 const text=value=>window.JG_I18N?.text(value)||value;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function store(){try{localStorage.setItem(key,JSON.stringify(profile));jg55Save('vehicle',{name:profile.model,fuel:profile.fuel.toLowerCase(),liters:profile.consumption,price:profile.price});return true}catch{return false}}
 function svg(type=profile.type,color=profile.color){
  const body=type==='motor'?`<ellipse cx="32" cy="13" rx="6" ry="10" fill="#172033"/><ellipse cx="32" cy="68" rx="6" ry="10" fill="#172033"/><path d="M20 25h24l-5 35H25z" fill="${color}"/><rect x="26" y="27" width="12" height="26" rx="6" fill="#cbd5e1"/><path d="M16 24h32M24 56h16" stroke="#172033" stroke-width="5" stroke-linecap="round"/>`:
   type==='truck'?`<rect x="10" y="27" width="44" height="48" rx="5" fill="${color}"/><rect x="13" y="7" width="38" height="23" rx="7" fill="${color}"/><path d="M18 12h28v9H18z" fill="#b8d5ee"/><path d="M15 34h34M15 65h34" stroke="#0f172a" stroke-opacity=".25" stroke-width="2"/>`:
   `<rect x="10" y="21" width="7" height="15" rx="3" fill="#0f172a"/><rect x="47" y="21" width="7" height="15" rx="3" fill="#0f172a"/><rect x="10" y="56" width="7" height="15" rx="3" fill="#0f172a"/><rect x="47" y="56" width="7" height="15" rx="3" fill="#0f172a"/><rect x="15" y="5" width="34" height="72" rx="12" fill="${color}"/><path d="M20 25q12-5 24 0l-2 15H22z" fill="#b8d5ee"/><rect x="22" y="42" width="20" height="19" rx="4" fill="${type==='4x4'?'#172033':'#0f172a'}" fill-opacity=".78"/><path d="M21 67h22" stroke="#f8fafc" stroke-width="3"/>`;
  return `<svg viewBox="0 0 64 84" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><ellipse cx="32" cy="43" rx="25" ry="37" fill="#020617" opacity=".15"/>${body}</svg>`;
 }
 function markerIcon(){return L.divIcon({className:'jg-vehicle-marker',html:svg(),iconSize:[38,50],iconAnchor:[19,25]})}
 function sync(){
  for(const fuel of ['RON95','RON97','EV']){
   const b=document.getElementById('fuelBtn-'+fuel);if(!b)continue;
   const active=profile.fuel===fuel;b.setAttribute('aria-pressed',String(active));
   b.classList.toggle('bg-amber-500',active);b.classList.toggle('text-slate-950',active);b.classList.toggle('text-slate-300',!active);
  }
  if(typeof userLocationMarker!=='undefined'&&userLocationMarker)userLocationMarker.setIcon(markerIcon());
  document.querySelectorAll('[data-active-vehicle]').forEach(el=>{el.textContent=profile.model;el.setAttribute('data-user-content','')});
  document.querySelectorAll('[data-active-vehicle-icon]').forEach(el=>{el.innerHTML=svg()});
  window.dispatchEvent(new CustomEvent('jg:vehicle',{detail:{profile:{...profile}}}));
 }
 function apply(value){
  profile=validate(value);const saved=store();
  if(typeof window.jg60Mode==='function')window.jg60Mode(profile.type);
  if(typeof updateFuelCalculation==='function')updateFuelCalculation();sync();return saved;
 }
 function close(){const dialog=document.getElementById('jgGarageDialog');if(dialog){dialog.remove();window.JG_SHELL?.navigate('map');document.getElementById('jgNavGarage')?.focus()}}
 function open(){
  close();const draft={...profile};
  const overlay=document.createElement('div');overlay.id='jgGarageDialog';overlay.className='jg-modal-overlay';
  overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','jgGarageTitle');
  overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
  document.body.appendChild(overlay);
  function draw(){
   const type=types[draft.type];
   overlay.innerHTML=`<section class="jg-garage-panel jg-modal-panel"><header class="jg-modal-header"><div><p class="jg-eyebrow">${text('YOUR VEHICLE')}</p><h2 id="jgGarageTitle">${text('My garage')}</h2></div><button class="jg-icon-button" data-close aria-label="${text('Close garage')}"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header>
   <div class="jg-garage-stage"><div class="jg-garage-road"></div>${svg(draft.type,draft.color)}<span>${esc(type.label.toUpperCase())}</span></div>
   <div class="jg-vehicle-types">${Object.entries(types).map(([id,t])=>`<button type="button" data-type="${id}" aria-pressed="${draft.type===id}"><i class="fa-solid fa-${t.icon}" aria-hidden="true"></i><span>${text(t.label)}</span></button>`).join('')}</div>
   <form id="jgGarageForm"><label for="jgVehicleModel">${text('Vehicle model')}</label><select id="jgVehicleModel">${[...new Set([...type.models,draft.model,'Custom model'])].map(model=>`<option ${model===draft.model?'selected':''} data-user-content>${esc(model)}</option>`).join('')}</select>
   <label for="jgCustomModel">${text('Display name')}</label><input id="jgCustomModel" maxlength="60" value="${esc(draft.model)}" required autocomplete="off">
   <label>${text('Map marker color')}</label><div class="jg-color-swatches">${colors.map(color=>`<button type="button" data-color="${color}" style="--swatch:${color}" aria-label="${color}" aria-pressed="${draft.color===color}"></button>`).join('')}</div>
   <div class="jg-form-grid"><div><label for="jgGarageFuel">${text('Fuel type')}</label><select id="jgGarageFuel">${['RON95','RON97','diesel','EV'].map(f=>`<option value="${f}" ${draft.fuel===f?'selected':''}>${f==='diesel'?text('Diesel'):f}</option>`).join('')}</select></div><div><label for="jgGarageConsumption">${text('Usage / 100 km')}</label><input id="jgGarageConsumption" type="number" min="0.1" max="100" step="0.1" value="${draft.consumption}" required></div></div>
   <label for="jgGaragePrice">${text('Fuel price (RM per L / kWh)')}</label><input id="jgGaragePrice" type="number" min="0" max="100" step="0.01" value="${draft.price}" required>
   <p class="jg-form-note">${text('Consumption and prices are editable estimates, not manufacturer specifications or live prices.')}</p>
   ${draft.type==='truck'?`<details open class="jg-truck-details"><summary>${text('Vehicle dimensions')}</summary><div class="jg-form-grid">${[['height','Height (m)'],['width','Width (m)'],['length','Length (m)'],['weight','Gross weight (t)']].map(([field,label])=>`<div><label for="jgGarage-${field}">${text(label)}</label><input id="jgGarage-${field}" type="number" min="0" max="${field==='weight'?100:field==='length'?30:10}" step="0.1" value="${draft[field]}"></div>`).join('')}</div></details>`:''}
   <p class="jg-routing-note" role="note">${text(draft.type==='truck'?'Truck profile only. Routing and navigation are disabled until a provider can check height, weight and truck restrictions.':draft.type==='4x4'?'4×4 uses standard road routes. Off-road access and surface suitability are not verified.':draft.type==='motor'?'Motorcycle profile uses standard car routes. Motorcycle access restrictions are not verified.':'Car routes use the current road routing service. Follow posted signs and restrictions.')}</p>
   <button class="jg-primary-button" type="submit">${text('Use this vehicle')} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></button></form></section>`;
   overlay.querySelector('[data-close]').onclick=close;
   const capture=()=>{
    draft.model=overlay.querySelector('#jgCustomModel').value.trim();draft.fuel=overlay.querySelector('#jgGarageFuel').value;
    draft.consumption=Number(overlay.querySelector('#jgGarageConsumption').value);draft.price=Number(overlay.querySelector('#jgGaragePrice').value);
    for(const f of ['height','width','length','weight']){const input=overlay.querySelector('#jgGarage-'+f);if(input)draft[f]=Number(input.value)}
   };
   overlay.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>{capture();draft.type=b.dataset.type;const t=types[draft.type];draft.model=t.models[0];draft.fuel=t.fuel;draft.consumption=t.consumption;draw();overlay.querySelector('[data-type="'+draft.type+'"]')?.focus()});
   overlay.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{capture();draft.color=b.dataset.color;draw();overlay.querySelector('[data-color="'+draft.color+'"]')?.focus()});
   overlay.querySelector('#jgVehicleModel').onchange=e=>{overlay.querySelector('#jgCustomModel').value=e.target.value==='Custom model'?'':e.target.value};
   overlay.querySelector('form').onsubmit=e=>{e.preventDefault();capture();if(!draft.model)return;const saved=apply(draft);close();showToast(saved?text('Vehicle profile saved.'):text('Vehicle selected for this session. Storage is unavailable.'),saved?'success':'warning')};
   window.JG_I18N?.apply(overlay);
  }
  draw();overlay.querySelector('[data-close]').focus();window.JG_SHELL?.trapDialog(overlay,close);
 }
 function changeFuel(fuel){if(!['RON95','RON97','EV'].includes(fuel))return;profile.fuel=fuel;profile.price=FUEL_RATES[fuel].pricePerUnit;store()}
 function syncMode(mode){
  if(!types[mode]||profile.type===mode)return;
  profile=validate({...profile,type:mode,model:types[mode].models[0],consumption:types[mode].consumption,fuel:types[mode].fuel});store();sync();
 }
 window.JG_GARAGE={syncMode,get:()=>({...profile}),types,validate,svg,leafletIcon:markerIcon,open,close,apply,changeFuel,sync};
 function init(){
  // Retain a saved walking/rail mode; vehicle identity is separate from those trip modes.
  const mode=window.jg60GetMode?.();
  if(mode==='car'||mode==='motor'||mode==='truck'||mode==='4x4')window.jg60Mode?.(profile.type);
  sync();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
