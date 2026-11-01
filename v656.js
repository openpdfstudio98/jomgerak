/* JomGerak V6.6 Premium Navigation – view controls, no new paid services */
'use strict';
(function(){
 const translate=(ms,en)=>typeof appLanguage!=='undefined'&&appLanguage==='en'?en:ms;
 window.jgPremiumMode=async function(mode){
  try{
   if(mode==='2d'){
    if(typeof jg3dActive!=='undefined'&&jg3dActive)await jgToggle3D();
    if(typeof followGps!=='undefined')followGps=false;
   }else{
    if(typeof jg3dActive!=='undefined'&&!jg3dActive)await jgToggle3D();
    if(!jg3dActive)return;
    if(mode==='follow'){
     if(typeof followGps!=='undefined')followGps=true;
     if(navigationActive&&window.jg65Recenter)window.jg65Recenter();
     if(typeof lastGps!=='undefined'&&lastGps)jg3d.easeTo({center:[lastGps.lng,lastGps.lat],zoom:17.2,pitch:58,duration:700});
    }else{
     if(typeof followGps!=='undefined')followGps=false;
     jg3d.easeTo({pitch:50,duration:350});
    }
   }
   const hint=document.getElementById('jgPremiumHint');
   if(hint)hint.textContent=mode==='2d'?translate('Peta 2D diaktifkan.','2D map enabled.'):mode==='follow'?translate('Kamera mengikut lokasi GPS apabila tersedia.','Camera follows GPS when available.'):translate('Paparan perspektif diaktifkan. Bangunan 3D bergantung pada data peta.','Perspective view enabled. 3D buildings depend on map data.');
  }catch(e){console.error('Premium mode:',e);if(typeof showToast==='function')showToast(translate('Paparan tidak tersedia.','View unavailable.'),'warning');}
 };
 function updateLabels(){
  const en=typeof appLanguage!=='undefined'&&appLanguage==='en';
  const title=document.getElementById('jgPremiumHeading');if(title)title.textContent=en?'View':'Paparan';
  const labels={ '2d':['2D','2D'],'3d':['3D','3D'],follow:['Ikut GPS','Follow GPS']};
  document.querySelectorAll('[data-premium]').forEach(el=>{const v=labels[el.dataset.premium];if(v)el.textContent=v[en?1:0];});
 }
 document.addEventListener('DOMContentLoaded',()=>{
  updateLabels();const sel=document.querySelector('select[onchange*="setLanguage"]');if(sel)sel.addEventListener('change',()=>setTimeout(updateLabels,0));
  const lang=document.querySelector('[id*="language"]');if(lang)lang.addEventListener('change',()=>setTimeout(updateLabels,0));
 });
 window.jgPremiumUpdateLabels=updateLabels;
})();
