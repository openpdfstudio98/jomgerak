/* JomGerak V6.5.4 — automatic OSM toll road flag detection, NOT a toll price API. */
'use strict';
(function(){
 const $=id=>document.getElementById(id);
 let generation=0,controller=null;
 function status(title,note){window.jg654LastStatus={title,note};if($('jg653TollAmount'))$('jg653TollAmount').textContent=title;if($('jg654TollNote'))$('jg654TollNote').textContent=note;window.jg655Translate?.();}
 const defaultNote='Kos petrol dipaparkan berasingan. Harga tol automatik memerlukan kadar plaza yang disahkan.';
 function sample(coords,count){
  const chosen=[];
  for(let i=0;i<count;i++){
   const idx=Math.round(i*(coords.length-1)/Math.max(1,count-1));const c=coords[idx];
   if(c&&Number.isFinite(c[0])&&Number.isFinite(c[1]))chosen.push(c);
  }
  return chosen;
 }
 function distToSegmentMeters(p,a,b){
  const kx=111320*Math.cos(p[1]*Math.PI/180),ky=110540;
  const vx=(b[0]-a[0])*kx,vy=(b[1]-a[1])*ky;
  const wx=(p[0]-a[0])*kx,wy=(p[1]-a[1])*ky;
  const t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/(vx*vx+vy*vy||1)));
  return Math.hypot(wx-t*vx,wy-t*vy);
 }
 function nearRoute(geometry,coords){
  if(!geometry?.length)return false;
  const sampled=sample(coords,Math.min(120,coords.length));
  for(const p of sampled)for(let i=1;i<geometry.length;i++){
   if(distToSegmentMeters(p,geometry[i-1],geometry[i])<75)return true;
  }
  return false;
 }
 window.jg654ResetToll=function(){generation++;if(controller)controller.abort();status('Tol: menunggu laluan',defaultNote);};
 window.jg654CheckToll=async function(){
  const coords=(typeof currentRouteData!=='undefined'&&currentRouteData?.geometry?.coordinates)||[];
  if(!coords.length){status('Tol: menunggu laluan',defaultNote);return;}
  const mine=++generation;
  if(controller)controller.abort();controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),13000);
  status('Tol: sedang menyemak laluan…','Menyemak penandaan jalan bertol dalam OpenStreetMap.');
  try{
   const pts=sample(coords,Math.min(12,coords.length));
   const query='[out:json][timeout:12];('+pts.map(p=>'way(around:100,'+p[1].toFixed(5)+','+p[0].toFixed(5)+')["toll"="yes"];').join('')+');out geom 100;';
   const response=await fetch('https://overpass.kumi.systems/api/interpreter',{method:'POST',body:new URLSearchParams({data:query}),signal:controller.signal});
   if(!response.ok)throw Error('OSM unavailable');
   const data=await response.json();if(mine!==generation)return;
   const matches=(data.elements||[]).filter(w=>w.type==='way'&&w.geometry&&nearRoute(w.geometry.map(p=>[p.lon,p.lat]),coords));
   if(matches.length){status('Tol: jalan bertol dikesan • RM belum tersedia','Pengesanan automatik daripada penandaan OpenStreetMap; kadar tol dan plaza tidak dapat disahkan.');}
   else{status('Tol: belum dapat disahkan • RM belum tersedia','Tiada jalan bertol berlabel dikesan dalam sampel. Ini TIDAK bermakna laluan bebas tol.');}
  }catch(e){if(mine===generation)status('Tol: semakan tidak tersedia',defaultNote);}
  finally{clearTimeout(timeout);}
 };
 // A fresh route is checked by the route-selection and route-creation handlers.
})();
