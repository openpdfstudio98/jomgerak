// Server-side TomTom Traffic Flow Segment query. No key is sent to browsers.
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 const key=process.env.TOMTOM_API_KEY;
 if(!key)return res.status(503).json({error:'TomTom not configured'});
 const lat=Number(req.query.lat),lng=Number(req.query.lng);
 if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<0||lat>8||lng<99||lng>120)return res.status(400).json({error:'Invalid Malaysia coordinate'});
 try{
  const url='https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point='+encodeURIComponent(lat+','+lng)+'&unit=KMPH&key='+encodeURIComponent(key);
  const r=await fetch(url,{signal:AbortSignal.timeout(9000)});
  if(!r.ok)return res.status(502).json({error:'Traffic provider unavailable ('+r.status+')'});
  const j=await r.json(),s=j.flowSegmentData;
  if(!s)return res.status(502).json({error:'No traffic segment'});
  return res.status(200).json({currentSpeed:s.currentSpeed,freeFlowSpeed:s.freeFlowSpeed,currentTravelTime:s.currentTravelTime,freeFlowTravelTime:s.freeFlowTravelTime,roadClosure:s.roadClosure,confidence:s.confidence,source:'TomTom Traffic Flow',note:'Nearby road segment only; not route-wide live ETA.'});
 }catch{return res.status(502).json({error:'Traffic service timeout'});}
};
