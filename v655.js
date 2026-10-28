/* JomGerak V6.5.5: BM/EN dynamic translation fixes. */
'use strict';
(function(){
 const dictionary={
  'Semakan Tol Automatik':'Automatic Toll Check',
  'Semak':'Check',
  'Tol: menunggu laluan':'Toll: Waiting for a route',
  'Tol: sedang menyemak laluan…':'Toll: Checking route…',
  'Tol: jalan bertol dikesan • RM belum tersedia':'Toll road detected • Price unavailable',
  'Tol: belum dapat disahkan • RM belum tersedia':'Toll status unverified • Price unavailable',
  'Tol: semakan tidak tersedia':'Toll check unavailable',
  'Kos petrol dipaparkan berasingan. Harga tol automatik memerlukan kadar plaza yang disahkan.':'Fuel cost is displayed separately. Automatic toll pricing requires verified toll-plaza rates.',
  'Kos petrol dan tol dipaparkan berasingan. Harga tol memerlukan data kadar plaza yang disahkan.':'Fuel and toll costs are displayed separately. Toll pricing requires verified toll-plaza rates.',
  'Menyemak penandaan jalan bertol dalam OpenStreetMap.':'Checking toll-road tags in OpenStreetMap.',
  'Pengesanan automatik daripada penandaan OpenStreetMap; kadar tol dan plaza tidak dapat disahkan.':'Detected from OpenStreetMap tags; toll rates and plazas are not verified.',
  'Tiada jalan bertol berlabel dikesan dalam sampel. Ini TIDAK bermakna laluan bebas tol.':'No tagged toll roads found in the sampled route. This does NOT confirm a toll-free route.',
  'Caj tol dan status tol belum disahkan.':'Toll charges and toll status are unverified.',
  'Laluan Alternatif':'Alternative Routes',
  'Anggaran Kos Perjalanan':'Estimated Travel Cost',
  'Kos Perjalanan':'Travel Cost'
 };
 const original={};
 function language(){return (typeof appLanguage!=='undefined'?appLanguage:document.documentElement.lang)==='en'?'en':'ms';}
 function translate(s){return dictionary[s]||s;}
 function apply(id,source){const el=document.getElementById(id);if(!el)return;el.textContent=language()==='en'?translate(source):source;}
 window.jg655Translate=function(){
  apply('jg653TollTitle','Semakan Tol Automatik');
  apply('jg655Unverified','Caj tol dan status tol belum disahkan.');
  const retry=document.getElementById('jg654Retry');if(retry){const i=retry.querySelector('i');retry.textContent=language()==='en'?' Check':' Semak';if(i)retry.prepend(i);else retry.insertAdjacentHTML('afterbegin','<i class="fa-solid fa-rotate" aria-hidden="true"></i> ');}
  const status=window.jg654LastStatus;
  if(status){apply('jg653TollAmount',status.title);apply('jg654TollNote',status.note);}
  else{apply('jg653TollAmount','Tol: menunggu laluan');apply('jg654TollNote','Kos petrol dan tol dipaparkan berasingan. Harga tol memerlukan data kadar plaza yang disahkan.');}
  const choices=document.querySelector('#routeChoices47 b');if(choices){const icons=choices.querySelectorAll('i');choices.textContent=language()==='en'?'Alternative Routes':'Laluan Alternatif';icons.forEach(i=>choices.prepend(i));}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>window.jg655Translate());else window.jg655Translate();
})();
