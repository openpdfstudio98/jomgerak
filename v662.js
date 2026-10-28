/* V6.6.2 – uniform controls; choices persist, actions flash only. */
'use strict';
(function(){
 const root=()=>document.getElementById('jgProBody');
 const styleNames=['navigator','maptiler','standard','smart','satellite','night'];
 const matchStyle=(button)=>{
  const click=button.getAttribute('onclick')||'';
  const m=click.match(/setMapStyle48\(['"]([^'"]+)['"]\)/);
  return m?m[1]:(/jg64MapTiler\(/.test(click)?'maptiler':null);
 };
 const matchView=(button)=>{
  const m=(button.getAttribute('onclick')||'').match(/setMapView48\(['"]([^'"]+)['"]\)/);
  return m?m[1]:null;
 };
 const refresh=()=>{
  const area=root();if(!area)return;
  let mapStyle='';let view='';
  try{mapStyle=typeof mapStyle48!=='undefined'?mapStyle48:'';view=typeof mapView48!=='undefined'?mapView48:'';}catch(e){}
  if(!styleNames.includes(mapStyle)){try{mapStyle=localStorage.getItem('jomgerak_mapstyle48')||'navigator'}catch(e){mapStyle='navigator'}}
  if(!view){try{view=localStorage.getItem('jomgerak_mapview48')||'north'}catch(e){view='north'}}
  area.querySelectorAll('button').forEach(b=>{
   const st=matchStyle(b), vw=matchView(b);
   let selected=false,choice=false;
   if(st){selected=st===mapStyle;choice=true}
   else if(vw){selected=vw===view;choice=true}
   else if(b.closest('.jg55tabs')){selected=b.getAttribute('aria-selected')==='true';choice=true}
   else if(b.closest('#jgPremiumModes')){return;} // v661 controls actual 3D state
   else if(b.hasAttribute('aria-pressed')){selected=b.getAttribute('aria-pressed')==='true';choice=true}
   if(choice){b.classList.add('jg-ui-choice');b.classList.toggle('jg-ui-selected',selected);b.setAttribute('aria-pressed',String(selected));}
  });
 };
 function init(){
  const area=root();if(!area)return;
  // Delegation also handles dynamically rendered tools without replacing original click handlers.
  area.addEventListener('click',event=>{
   const b=event.target.closest('button');if(!b||!area.contains(b)||b.disabled)return;
   b.classList.remove('jg-ui-tap');void b.offsetWidth;b.classList.add('jg-ui-tap');
   setTimeout(()=>{b.classList.remove('jg-ui-tap');refresh()},350);
  });
  refresh();
  // Refresh after existing routing/map-view callbacks, including programmatic changes.
  ['setMapStyle48','setMapView48','jg64MapTiler','jg55Tab','jgPremiumMode'].forEach(name=>{
   const fn=window[name];if(typeof fn!=='function')return;
   window[name]=function(...args){const result=fn.apply(this,args);Promise.resolve(result).finally(()=>setTimeout(refresh,50));return result;};
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
  window.jg662Refresh=refresh;
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
