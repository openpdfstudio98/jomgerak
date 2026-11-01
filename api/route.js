// TomTom traffic-aware routing. Never return provider URLs or credentials.
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'Method not allowed'});}
 let body=req.body;try{if(typeof body==='string')body=JSON.parse(body)}catch{return res.status(400).json({error:'Invalid request'});}
 const points=body?.points,mode=body?.mode||'car';
 if(!Array.isArray(points)||points.length<2||points.length>7||!['car','motor','4x4'].includes(mode)||points.some(p=>!p||!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||p.lat<0||p.lat>8||p.lng<99||p.lng>120))return res.status(400).json({error:'Invalid Malaysia route'});
 const key=process.env.TOMTOM_API_KEY?.trim();if(!key)return res.status(503).json({error:'Traffic routing not configured'});
 const url=new URL('https://api.tomtom.com/routing/1/calculateRoute/'+points.map(p=>p.lat+','+p.lng).join(':')+'/json');
 for(const [k,v]of Object.entries({key,traffic:'true',departAt:'now',computeTravelTimeFor:'all',instructionsType:'text',language:body.language==='ms'?'ms-MY':'en-GB',travelMode:mode==='motor'?'motorcycle':'car',routeType:'fastest',maxAlternatives:points.length===2?'2':'0'}))url.searchParams.set(k,v);
 try{
  const r=await fetch(url.href,{signal:AbortSignal.timeout(14000)});
  if(!r.ok)return res.status(502).json({error:r.status===401||r.status===403?'TomTom Routing access unavailable':'TomTom Routing unavailable'});
  const j=await r.json();if(!j.routes?.length)return res.status(502).json({error:'No traffic route available'});
  return res.status(200).json({routes:j.routes.map(route=>normalize(route,body.language)),source:'TomTom',trafficAware:true});
 }catch{return res.status(502).json({error:'Traffic routing unavailable'});}
};
function normalize(route,language='en'){
 const summary=route.summary;
 if(!summary||!Number.isFinite(summary.lengthInMeters)||!Number.isFinite(summary.travelTimeInSeconds)||!route.legs?.length)throw Error('Invalid route');
 const coords=[],bounds=[];
 for(const leg of route.legs){
  const pts=(leg.points||[]).map(p=>[p.longitude,p.latitude]);
  if(pts.length<2||pts.some(p=>!p.every(Number.isFinite)))throw Error('Invalid geometry');
  const start=coords.length?coords.length-1:0;coords.push(...(coords.length?pts.slice(1):pts));bounds.push([start,coords.length-1]);
 }
 const instructions=(route.guidance?.instructions||[]).filter(i=>Number.isInteger(i.pointIndex)&&i.pointIndex>=0&&i.pointIndex<coords.length);
 if(!instructions.length)throw Error('Guidance unavailable');
 let legDistance=0;
 const legs=route.legs.map((leg,n)=>{
  const startDistance=legDistance;legDistance+=leg.summary?.lengthInMeters||0;
  const [start,end]=bounds[n];
  let ins=instructions.filter(i=>i.pointIndex>=start&&i.pointIndex<end).sort((a,b)=>a.pointIndex-b.pointIndex);
  if(!ins.length||ins[0].pointIndex!==start)ins.unshift({pointIndex:start,maneuver:'DEPART',message:language==='ms'?(n?'Teruskan ke hentian berikutnya':'Mulakan perjalanan'):(n?'Continue to the next stop':'Start your journey'),routeOffsetInMeters:startDistance});
  ins.push({pointIndex:end,maneuver:'ARRIVE',message:language==='ms'?'Anda telah tiba di destinasi':'You have reached your destination',routeOffsetInMeters:legDistance});
  return {distance:leg.summary?.lengthInMeters||0,duration:leg.summary?.travelTimeInSeconds||0,steps:ins.map((i,k)=>{
   const next=ins[k+1],code=i.maneuver||'',modifier=code.includes('LEFT')?'left':code.includes('RIGHT')?'right':'straight';
   const type=k===ins.length-1?'arrive':code==='DEPART'?'depart':code.includes('ROUNDABOUT')?'roundabout':code.includes('TURN')?'turn':'continue';
   return {name:i.street||'',distance:next&&Number.isFinite(next.routeOffsetInMeters)&&Number.isFinite(i.routeOffsetInMeters)?Math.max(0,next.routeOffsetInMeters-i.routeOffsetInMeters):0,jgInstruction:i.message||null,maneuver:{type,modifier,location:coords[i.pointIndex],exit:i.roundaboutExitNumber},geometry:{type:'LineString',coordinates:coords.slice(i.pointIndex,(next?.pointIndex??i.pointIndex)+1)}};
  })};
 });
 const profile=instructions.filter(i=>Number.isFinite(i.routeOffsetInMeters)&&Number.isFinite(i.travelTimeInSeconds)).map(i=>[i.routeOffsetInMeters,i.travelTimeInSeconds]);
 profile.push([0,0],[summary.lengthInMeters,summary.travelTimeInSeconds]);profile.sort((a,b)=>a[0]-b[0]);
 return {distance:summary.lengthInMeters,duration:summary.travelTimeInSeconds,geometry:{type:'LineString',coordinates:coords},legs,provider:'TomTom',trafficAware:true,trafficDelay:Math.max(0,summary.trafficDelayInSeconds||0),trafficProfile:profile,fetchedAt:Date.now()};
}
module.exports.normalize=normalize;
