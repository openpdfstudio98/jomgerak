// Same-origin traffic tiles: provider credentials remain server-side.
module.exports=async function(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 const {z,x,y}=req.query;
 if(![z,x,y].every(v=>typeof v==='string'&&/^\d{1,8}$/.test(v))||+z>22||+x>=2**+z||+y>=2**+z)return res.status(400).json({error:'Invalid tile'});
 const key=process.env.TOMTOM_API_KEY;
 if(!key)return res.status(503).json({error:'Traffic not configured'});
 try{
  const r=await fetch(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/${+z}/${+x}/${+y}.png?tileSize=256&key=${encodeURIComponent(key)}`,{signal:AbortSignal.timeout(9000)});
  if(!r.ok||!r.headers.get('content-type')?.includes('image/png'))return res.status(502).json({error:'Traffic tiles unavailable'});
  const data=Buffer.from(await r.arrayBuffer());
  res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, max-age=30, s-maxage=30');return res.status(200).send(data);
 }catch{return res.status(502).json({error:'Traffic tiles unavailable'});}
};
