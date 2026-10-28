/* JomGerak V6.5.3 — UI icons and transparent manual toll cost */
'use strict';
(function(){
const $=id=>document.getElementById(id);
const emojiIcons=[
 ['🧭','fa-compass'],['🗺️','fa-map'],['🗺','fa-map'],['🚗','fa-car'],['🚘','fa-car-side'],['🚙','fa-car-side'],['🏍️','fa-motorcycle'],['🏍','fa-motorcycle'],['🚶','fa-person-walking'],['🏃','fa-person-running'],['🚆','fa-train'],['🚉','fa-train'],['🕌','fa-mosque'],['🚦','fa-traffic-light'],['🎤','fa-microphone'],['🎙️','fa-microphone'],['🎙','fa-microphone'],['📱','fa-mobile-screen'],['⚙️','fa-gear'],['⚙','fa-gear'],['🛣️','fa-road'],['🛣','fa-road'],['🌦️','fa-cloud-sun-rain'],['🌦','fa-cloud-sun-rain'],['⏱️','fa-clock-rotate-left'],['⏱','fa-clock-rotate-left'],['⭐','fa-star'],['📍','fa-location-dot'],['📄','fa-file-export'],['🔁','fa-arrows-rotate'],['🛡️','fa-shield-halved'],['🛡','fa-shield-halved'],['🧰','fa-toolbox'],['💰','fa-coins'],['💸','fa-wallet'],['📥','fa-download'],['🌤️','fa-cloud-sun'],['🌤','fa-cloud-sun'],['🛰️','fa-satellite'],['🛰','fa-satellite'],['🌙','fa-moon'],['⬆️','fa-arrow-up'],['⬆','fa-arrow-up'],['⚡','fa-bolt'],['⛽','fa-gas-pump'],['▶️','fa-play'],['▶','fa-play'],['■','fa-stop'],['🕒','fa-clock'],['🔊','fa-volume-high'],['🎯','fa-bullseye'],['🏛️','fa-landmark'],['🏛','fa-landmark'],['🦁','fa-paw'],['🗼','fa-tower-observation'],['✕','fa-xmark'],['🚨','fa-triangle-exclamation'],['📝','fa-pen-to-square'],['☰','fa-bars'],['◎','fa-location-crosshairs'],['◩','fa-cube'],['↗','fa-share']
];
const pattern=new RegExp(emojiIcons.map(x=>x[0].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length).join('|'),'g');
let scheduled=false,processing=false;
function polish(){
 if(processing)return;processing=true;
 try{
  const targets=document.querySelectorAll('button, .jg55tabs button, #routeChoices47 b, #jgProPanel .jgrow b, #jg65Dock button');
  for(const el of targets){
   const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);
   const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
   for(const n of nodes){
    const t=n.nodeValue;if(!t||!pattern.test(t)){pattern.lastIndex=0;continue;}pattern.lastIndex=0;
    const frag=document.createDocumentFragment();let last=0;
    for(const m of t.matchAll(pattern)){
      if(m.index>last)frag.appendChild(document.createTextNode(t.slice(last,m.index)));
      const found=emojiIcons.find(x=>x[0]===m[0]);
      const i=document.createElement('i');i.className='fa-solid '+found[1]+' jg653-icon';i.setAttribute('aria-hidden','true');frag.appendChild(i);
      last=m.index+m[0].length;
    }
    if(last<t.length)frag.appendChild(document.createTextNode(t.slice(last)));
    n.replaceWith(frag);
   }
  }
 }finally{processing=false;}
}
// V6.5.4 toll checking and display are handled by v654.js.
function boot(){
 polish();
 new MutationObserver(()=>{if(!scheduled){scheduled=true;requestAnimationFrame(()=>{scheduled=false;polish();});}}).observe(document.body,{childList:true,subtree:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
