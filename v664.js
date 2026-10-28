/* JomGerak V6.6.4: state-aware Journey / Settings buttons and bilingual labels. */
'use strict';
(function(){
 const $=id=>document.getElementById(id);
 const groups={};
 function selected(button,on){
  button.classList.add('jg664-choice');button.classList.toggle('jg664-on',!!on);
  button.setAttribute('aria-pressed',String(!!on));
 }
 function refresh(){
  const trip=$('jg55TripTab'),settings=$('jg55SettingsTab');
  if(!trip||!settings)return;
  // Transport mode is owned by v60; reflect the existing .jg60active state.
  trip.querySelectorAll('button.jg60mode').forEach(b=>selected(b,b.classList.contains('jg60active')));
  // The route options toggle is a true open/closed choice.
  const toggle=trip.querySelector('button.jgtoolsToggle'),content=$('smartRoute48');
  if(toggle&&content)selected(toggle,!content.classList.contains('hidden'));
  // Only mark panel-opening tools when their actual panel is open.
  document.querySelectorAll('#jg55TripTab .jg55actions button,#jg55SettingsTab .jg55actions button').forEach(b=>{
   const m=(b.getAttribute('onclick')||'').match(/jg55Show\(['"]([^'"]+)['"]\)/);
   if(m)selected(b,typeof J55!=='undefined'&&J55.panel===m[1]&&!$('jg55Panel')?.hidden);
  });
  // Voice settings: don't falsely mark a one-shot action as selected.
  settings.querySelectorAll('button').forEach(b=>{
   if(b.classList.contains('jg664-choice')&&!b.matches('.jg55actions button')){
    b.classList.remove('jg664-choice','jg664-on');b.removeAttribute('aria-pressed');
   }
  });
 }
 const pairs={
  'Tetapan Laluan':'Route Settings','Tetapan Laluan ▾':'Route Settings ▾',
  'Maklumat Tol':'Toll Information','Cuaca & Banjir':'Weather & Floods',
  'Sejarah Perjalanan':'Trip History','Tempat Tersimpan':'Saved Places',
  'Kemudahan Laluan':'Route Facilities','Laporan Komuniti':'Community Reports',
  'Eksport Perjalanan':'Export Trip','Elak tol*':'Avoid tolls*',
  'Elak highway*':'Avoid highways*','Perjalanan':'Journey',
  'Suara navigasi / Navigation voice':'Navigation voice',
  'Pilih daripada 7 suara yang tersedia. Jantina suara tidak dapat disahkan secara automatik; cuba Test Voice.':'Choose from 7 available voices. Voice gender cannot be determined automatically; try Test Voice.',
  'V6.5: Cari Laluan → Start Driving. Gunakan Overview dan Recenter untuk kamera.':'V6.5: Find Route → Start Driving. Use Overview and Recenter to adjust the camera.',
  '* Belum disokong OSRM awam; tidak mengubah laluan. Tol sebenar belum dapat disahkan.':'* Not supported by public OSRM; does not change the route. Actual tolls are unverified.',
  'Suara navigasi':'Navigation voice','Satelit':'Satellite'
 };
 const rev=Object.fromEntries(Object.entries(pairs).map(([a,b])=>[b,a]));
 function english(){return document.documentElement.lang==='en'||$('languageSelect')?.value==='en';}
 function translate(){
  const en=english();
  const walker=document.createTreeWalker($('jgProBody')||document.body,NodeFilter.SHOW_TEXT);
  let n;while(n=walker.nextNode()){
   if(n.parentElement?.closest('script,style,textarea,select,option,code,pre'))continue;
   const t=n.nodeValue,trim=t.trim();if(!trim)continue;
   let value=(en?pairs:rev)[trim];
   if(!value){const entries=Object.entries(en?pairs:rev).sort((a,b)=>b[0].length-a[0].length);
    for(const [from,to] of entries){if(trim.includes(from)&&trim!==to){value=trim.replace(from,to);break;}}
   }
   if(value&&value!==trim)n.nodeValue=t.replace(trim,value);
  }
 }
 let queued=false;function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;refresh();translate()},40)}
 function init(){
  const body=$('jgProBody');if(!body)return;
  body.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&body.contains(b))schedule()});
  $('languageSelect')?.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(body,{childList:true,subtree:true});
  // Observe only child-list updates to avoid a feedback loop from translated text.
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
