// Supabase publishable/anon key; RLS policies in supabase_schema.sql restrict access.
const types=new Set(['Kesesakan Trafik','Kemalangan','Jalan Rosak','Jalan Ditutup','Banjir','Halangan','Bahaya di Jalan']);
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return res.status(503).json({error:'Community backend not configured'});
 const endpoint=url.replace(/\/$/,'')+'/rest/v1/jg_reports';
 const headers={'apikey':key,'Content-Type':'application/json'};
 if(!key.startsWith('sb_publishable_'))headers.Authorization='Bearer '+key;
 try{
  if(req.method==='GET'){
   const since=new Date(Date.now()-86400000).toISOString();
   const r=await fetch(endpoint+'?select=lat,lng,type,note,created_at&created_at=gte.'+encodeURIComponent(since)+'&order=created_at.desc&limit=100',{headers,signal:AbortSignal.timeout(9000)});
   if(!r.ok)throw Error('database '+r.status);return res.status(200).json({reports:await r.json()});
  }
  if(req.method==='POST'){
   const b=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
   if(!Number.isFinite(b.lat)||!Number.isFinite(b.lng)||b.lat<0||b.lat>8||b.lng<99||b.lng>120||!types.has(b.type)||typeof b.note!=='string'||b.note.length>180)return res.status(400).json({error:'Invalid report'});
   const r=await fetch(endpoint,{method:'POST',headers:{...headers,'Prefer':'return=minimal'},body:JSON.stringify({lat:b.lat,lng:b.lng,type:b.type,note:b.note}),signal:AbortSignal.timeout(9000)});
   if(!r.ok)throw Error('database '+r.status);return res.status(201).json({ok:true});
  }
  res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});
 }catch{return res.status(502).json({error:'Community service unavailable. Check Supabase schema and RLS policies.'});}
};
