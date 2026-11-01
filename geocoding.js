/* Shared explicit geocoding, cache, cancellation and per-tab request spacing.
 * Public Nominatim is beta-only: the application-wide 1 req/s limit needs
 * a shared production proxy. Configure GEOCODING_BASE_URL before public scale.
 * Policy: https://operations.osmfoundation.org/policies/nominatim/
 */
'use strict';
(function(){
 let queue=Promise.resolve(),lastRequest=0;
 const cache=new Map();
 window.jgGeocodeFetch=function(input,options={}){
  const url=new URL(input,location.href);
  const base=window.JOMGERAK_CONFIG?.geocodingBaseUrl;
  if(base){
   const target=new URL(base,location.href);
   if(target.protocol!=='https:'&&target.origin!==location.origin)return Promise.reject(Error('Geocoding requires HTTPS'));
   url.protocol=target.protocol;url.host=target.host;
   url.pathname=target.pathname.replace(/\/$/,'')+url.pathname;
  }
  const key=url.href+'|'+JSON.stringify(options.headers||{});
  const run=async()=>{
   if(options.signal?.aborted)throw new DOMException('Cancelled','AbortError');
   const entry=cache.get(key);
   if(entry&&Date.now()-entry.at<300000)return entry.response.clone();
   const delay=Math.max(0,1100-(Date.now()-lastRequest));
   if(delay)await new Promise(resolve=>setTimeout(resolve,delay));
   if(options.signal?.aborted)throw new DOMException('Cancelled','AbortError');
   const controller=new AbortController();
   const abort=()=>controller.abort();
   options.signal?.addEventListener('abort',abort,{once:true});
   const timer=setTimeout(abort,12000);
   lastRequest=Date.now();
   try{
    const response=await fetch(url.href,{...options,signal:controller.signal});
    // Consume a clone now so the sequential queue includes body download time.
    if(response.ok){
     const copy=response.clone();await copy.text();
     if(cache.size>=100)cache.delete(cache.keys().next().value);
     cache.set(key,{at:Date.now(),response:response.clone()});
    }
    return response;
   }finally{clearTimeout(timer);options.signal?.removeEventListener('abort',abort);}
  };
  const result=queue.then(run,run);queue=result.catch(()=>{});return result;
 };
})();

// Photon explicitly supports search-as-you-type. Never send typing to public Nominatim.
(function(){
 const cache=new Map();
 window.jgAutocompleteFetch=async function(query,{signal}={}){
  const base=window.JOMGERAK_CONFIG?.autocompleteUrl||'https://photon.komoot.io/api/';
  const url=new URL(base,location.href);
  if(url.protocol!=='https:'&&url.origin!==location.origin)throw Error('Autocomplete requires HTTPS');
  url.searchParams.set('q',query);url.searchParams.set('limit','6');url.searchParams.set('countrycode','MY');url.searchParams.set('lang','en');
  const key=url.href,entry=cache.get(key);
  if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
  if(entry&&Date.now()-entry.at<300000)return {ok:true,json:async()=>entry.data};
  const controller=new AbortController(),abort=()=>controller.abort();signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,8000);
  try{
   const r=await fetch(url.href,{signal:controller.signal});if(!r.ok)throw Error('Autocomplete unavailable');
   const j=await r.json(),data=[];
   for(const feature of j.features||[]){
    const p=feature.properties||{},c=feature.geometry?.coordinates;
    if(p.countrycode?.toUpperCase()!=='MY'||!Array.isArray(c)||!Number.isFinite(c[0])||!Number.isFinite(c[1]))continue;
    const address=[p.name,[p.housenumber,p.street].filter(Boolean).join(' '),p.city||p.district,p.state,p.country].filter(Boolean);
    if(!address.length)continue;
    data.push({name:p.name||p.street||p.city||address[0],display_name:[...new Set(address)].join(', '),lat:c[1],lon:c[0]});
   }
   if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,{at:Date.now(),data});
   return {ok:true,json:async()=>data};
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
 };
})();
