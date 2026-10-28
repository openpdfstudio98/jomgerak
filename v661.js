/* JomGerak V6.6.1 – persistent visual feedback for premium map mode buttons */
'use strict';
(function(){
 const key='jg-premium-mode';
 let selected='2d';
 const buttons=()=>Array.from(document.querySelectorAll('#jgPremiumModes button'));
 function paint(mode){
  selected=mode;
  buttons().forEach(b=>{
   const active=b.dataset.mode===mode;
   b.classList.toggle('jg-selected',active);
   b.setAttribute('aria-pressed',String(active));
   b.setAttribute('title',active?'Selected / Dipilih':'');
  });
 }
 function detect(){
  try{
   if(typeof jg3dActive!=='undefined'&&jg3dActive){
    if(typeof followGps!=='undefined'&&followGps)return 'follow';
    return '3d';
   }
  }catch(e){}
  return '2d';
 }
 function init(){
  buttons().forEach((b,i)=>{
   const mode=['2d','3d','follow'][i];
   b.dataset.mode=mode;
   b.setAttribute('aria-pressed','false');
   // The original onclick remains in place; add a wrapper that paints only after success.
   const original=b.onclick;
   b.onclick=null;
   b.addEventListener('click',async()=>{
    if(b.classList.contains('jg-loading'))return;
    b.classList.add('jg-loading');
    try{
     if(typeof window.jgPremiumMode==='function')await window.jgPremiumMode(mode);
     const actual=detect();
     paint(actual);
     if(actual===mode){try{sessionStorage.setItem(key,mode)}catch(e){}}
    }finally{b.classList.remove('jg-loading')}
   });
  });
  paint(detect());
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint(detect())});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 window.jgPremiumRefreshSelected=()=>paint(detect());
})();
