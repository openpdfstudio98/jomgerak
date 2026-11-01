/* One view selector, two distinct map layers, and a compact route sheet. */
'use strict';
(function(){
 const $=id=>document.getElementById(id),t=s=>window.JG_I18N?.text(s)||s;
 let lastSummary=null;
 function refresh(){
  const layer=typeof mapStyle48!=='undefined'&&mapStyle48==='satellite'?'satellite':'road';
  document.querySelectorAll('[data-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layer===layer)));
  $('jgBuildingsToggle').checked=!!JG_CFG.show3DBuildings;
 }
 function layer(kind){
  if(!['road','satellite'].includes(kind))return;
  if(kind==='road'&&JG_CFG.maptilerKey){
   mapSources48.maptiler={url:'https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key='+encodeURIComponent(JG_CFG.maptilerKey),maxZoom:19,attribution:'© MapTiler © OpenStreetMap contributors',filter:'none'};
   setMapStyle48('maptiler',true);
  }else setMapStyle48(kind==='satellite'?'satellite':'standard',true);
  refresh();window.JG_SHELL?.tools(false);
 }
 function buildings(enabled){
  JG_CFG.show3DBuildings=!!enabled;
  try{localStorage.setItem('jg_show_buildings',String(!!enabled))}catch{}
  if(jg3d){
   // Hide existing provider extrusions too; vector base styles may supply their own.
   for(const item of jg3d.getStyle()?.layers||[])if(item.type==='fill-extrusion')jg3d.setLayoutProperty(item.id,'visibility',enabled?'visible':'none');
   if(enabled)jgPremiumAddBuildings();
  }
  refresh();
 }
 function boot(){
  try{JG_CFG.show3DBuildings=localStorage.getItem('jg_show_buildings')==='true'}catch{JG_CFG.show3DBuildings=false}
  const install=$('jg52Install'),host=$('jgAdditionalTools')?.querySelector('.jg-shell-actions');
  if(install&&host){host.appendChild(install);install.classList.remove('hidden');install.innerHTML='<i class="fa-solid fa-download" aria-hidden="true"></i><span>'+t('Install app')+'</span>'}
  const layers=document.createElement('button');layers.type='button';layers.id='jgLayersButton';layers.className='jg-icon-button jg-map-layer-button';layers.setAttribute('aria-label',t('Map layers'));layers.innerHTML='<i class="fa-solid fa-layer-group" aria-hidden="true"></i>';layers.onclick=()=>window.JG_SHELL?.tools(true,'map');$('floatingMapTools').prepend(layers);
  document.querySelectorAll('#jgPremiumModes button').forEach(b=>b.addEventListener('click',()=>window.JG_SHELL?.tools(false)));
  const panel=$('routeSummaryPanel'),details=document.createElement('details');details.id='jgTripDetails';details.innerHTML='<summary>'+t('Trip details & costs')+'</summary><div id="jgTripDetailsContent"></div>';panel.appendChild(details);
  for(const id of ['jgRouteCost','jg653Toll','jg655Unverified','stepsContainer']){const item=$(id);if(item)$('jgTripDetailsContent').appendChild(item)}
  const routeActions=document.createElement('div');routeActions.className='jg-route-actions';
  const start=$('startNavBtn'),oldActions=start.parentElement,clearButton=panel.querySelector('button[onclick="clearRoute()"]');
  routeActions.appendChild(start);if(clearButton)routeActions.appendChild(clearButton);panel.insertBefore(routeActions,details);if(!oldActions.children.length)oldActions.remove();
  const destination=document.createElement('div');destination.className='jg-route-destination';destination.innerHTML='<span id="jgRouteDestination" data-user-content></span><button type="button" id="jgEditRoute">'+t('Edit trip')+'</button>';panel.firstElementChild.prepend(destination);
  $('jgEditRoute').onclick=()=>{document.body.classList.remove('jg-route-ready');$('destInput').focus()};
  const previous=window.renderRouteSummary;
  window.renderRouteSummary=function(route){previous(route);$('jgRouteDestination').textContent=destCoords?.name||t('Destination');if(route!==lastSummary&&!navigationActive)document.body.classList.add('jg-route-ready');lastSummary=route;window.JG_I18N?.apply(panel)};
  const clear=window.clearRoute;
  window.clearRoute=function(...args){document.body.classList.remove('jg-route-ready');lastSummary=null;return clear.apply(this,args)};
  const selected=window.setMapStyle48;
  window.setMapStyle48=function(...args){const result=selected.apply(this,args);refresh();return result};
  // The old style labels are aliases of the same road layer; migrate their saved choice.
  refresh();
 }
 window.JG_MAP_UI={layer,buildings,refresh};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
