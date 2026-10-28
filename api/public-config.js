// Public browser configuration. Only domain-restricted MapTiler public key is exposed.
module.exports=async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end();}
 res.setHeader('Cache-Control','no-store');
 return res.status(200).json({maptilerKey:process.env.MAPTILER_API_KEY||'',communityEnabled:Boolean(process.env.SUPABASE_URL&&(process.env.SUPABASE_ANON_KEY||process.env.SUPABASE_PUBLISHABLE_KEY)),trafficEnabled:Boolean(process.env.TOMTOM_API_KEY)});
};
