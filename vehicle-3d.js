/* Share Garage identity across Leaflet and MapLibre without rasterising the SVG. */
(function(){
 'use strict';
 let marker=null,owner=null,position=null,heading=0,element=null;
 function refresh(){
  if(!element||!window.JG_GARAGE)return;
  element.innerHTML=window.JG_GARAGE.svg();
  element.setAttribute('aria-label',window.JG_GARAGE.get().model+' · GPS location');
 }
 function sync(){
  if(typeof jg3d==='undefined'||!jg3d||!window.maplibregl?.Marker||!window.JG_GARAGE)return;
  if(owner!==jg3d){marker?.remove();owner=jg3d;marker=null;}
  if(!position&&typeof lastGps!=='undefined'&&lastGps)position=[lastGps.lng,lastGps.lat];
  if(!position)return; // Never invent a location from route origin.
  if(!marker){
   element=document.createElement('div');element.className='jg-3d-vehicle';element.setAttribute('role','img');refresh();
   marker=new maplibregl.Marker({element,anchor:'center',rotationAlignment:'map',pitchAlignment:'viewport'}).setLngLat(position).addTo(jg3d);
  }
  marker.setLngLat(position).setRotation(heading);
  // Remove legacy blue circles only once a replacement marker exists.
  if(jg3d.isStyleLoaded())for(const id of ['jg-premium-gps-dot','jg-premium-gps-ring'])if(jg3d.getLayer(id))jg3d.removeLayer(id);
 }
 function update(pos){
  const c=pos?.coords;if(!c||!Number.isFinite(c.latitude)||!Number.isFinite(c.longitude))return;
  position=[c.longitude,c.latitude];
  if(Number.isFinite(c.heading)&&Number(c.speed)>1.5)heading=c.heading;
  sync();
 }
 window.JG_3D_VEHICLE={sync,update,refresh};
 window.addEventListener('jg:vehicle',refresh);
})();
