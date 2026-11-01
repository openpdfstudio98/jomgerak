/* One driving route request path for planning, rerouting and multi-stop trips. */
(function(){
 'use strict';
 window.jgRequestDrivingRoute=async function(points,{alternatives=true}={}){
  const mode=window.jg60GetMode?.()||'car';
  if(!['car','motor','4x4'].includes(mode))throw Error('Unsupported driving mode');
  try{
   const r=await fetch('/api/route',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({points,mode,language:typeof appLanguage!=='undefined'?appLanguage:'en'}),signal:AbortSignal.timeout(16000)});
   if(!r.ok)throw Error('Traffic routing unavailable');const j=await r.json();
   if(!j.trafficAware||!j.routes?.length)throw Error('Invalid traffic route');
   return {code:'Ok',routes:j.routes};
  }catch{}
  const coords=points.map(p=>p.lng+','+p.lat).join(';');
  const r=await fetch('https://router.project-osrm.org/route/v1/driving/'+coords+'?overview=full&geometries=geojson&steps=true&alternatives='+alternatives,{signal:AbortSignal.timeout(18000)});
  if(!r.ok)throw Error('Routing unavailable');const j=await r.json();
  if(j.code!=='Ok'||!j.routes?.length)throw Error('No route');
  for(const route of j.routes){route.provider='OSRM';route.trafficAware=false;route.fetchedAt=Date.now();}
  return j;
 };
 window.jgTrafficRouteLabel=function(route){
  const ms=typeof appLanguage!=='undefined'&&appLanguage==='ms';
  if(!route?.trafficAware)return ms?'Anggaran tanpa trafik langsung · OSRM':'Estimate excludes traffic delay · OSRM';
  if(Date.now()-(route.fetchedAt||0)>180000)return ms?'Anggaran trafik terdahulu · sedang menunggu kemas kini':'Previous traffic estimate · awaiting refresh';
  const delay=Math.round((route.trafficDelay||0)/60);
  return (ms?'Anggaran mengambil kira trafik · TomTom':'Traffic-aware estimate · TomTom')+(delay>0?(ms?' · kelewatan ~':' · delay ~')+delay+' min':'');
 };
 window.jgTrafficRemainingSeconds=function(route,remaining,total){
  const progress=Math.max(0,Math.min(1,1-remaining/Math.max(1,total))),distance=route.distance*progress;
  const profile=route.trafficProfile||[[0,0],[route.distance,route.duration]];
  for(let i=1;i<profile.length;i++){
   const [d,t]=profile[i],prev=profile[i-1];
   if(d>=distance){const f=(distance-prev[0])/Math.max(1,d-prev[0]);return Math.max(0,route.duration-(prev[1]+f*(t-prev[1])));}
  }
  return 0;
 };
 let lastRefresh=Date.now();
 window.jgMaybeRefreshTraffic=function(pos){
  if(!navigationActive||!currentRouteData?.trafficAware||currentRouteData.legs.length>1||!navigator.onLine||pos.coords.accuracy>45||Date.now()-Math.max(lastRefresh,currentRouteData.fetchedAt||0)<120000)return;
  lastRefresh=Date.now();jg52Reroute(pos);
 };
})();
