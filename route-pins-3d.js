/* Destination-only pin in 3D; the vehicle already shows the current position. */
(function(){
 'use strict';
 let markers=[],owner=null,signature='';
 const valid=p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng)&&Math.abs(p.lat)<=90&&Math.abs(p.lng)<=180;
 function points(){
  const result=[];
  if(typeof destCoords!=='undefined'&&valid(destCoords))result.push({...destCoords,kind:'destination',label:'Destination'});
  return result;
 }
 function sync(){
  if(typeof jg3d==='undefined'||!jg3d||!window.maplibregl?.Marker)return;
  const pts=points(),next=JSON.stringify(pts);
  if(owner===jg3d&&signature===next)return;
  markers.forEach(m=>m.remove());markers=[];owner=jg3d;signature=next;
  for(const p of pts){
   const el=document.createElement('div');el.className='jg-3d-trip-pin jg-pin-'+p.kind;el.setAttribute('role','img');el.setAttribute('aria-label',p.label+(p.name?': '+p.name:''));
   const glyph='<path d="M11 8v20m0-19c7-5 9 5 18 0v12c-9 5-11-5-18 0"/>';
   el.innerHTML='<svg width="40" height="48" viewBox="0 0 40 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20 46 8 32a18 18 0 1 1 24 0Z" fill="currentColor" stroke="white" stroke-width="2"/><g fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">'+glyph+'</g></svg>';
   markers.push(new maplibregl.Marker({element:el,anchor:'bottom',pitchAlignment:'viewport'}).setLngLat([p.lng,p.lat]).addTo(jg3d));
  }
 }
 window.JG_3D_PINS={sync};
})();
