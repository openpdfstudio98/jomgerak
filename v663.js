/* JomGerak V6.6.3 — consistent bilingual UI, including late-created controls. */
'use strict';
(function(){
 const pairs={
  'Lokasi Saya':'My Location','PETA':'MAP','Pintar':'Smart','Malam':'Night',
  'Utara Atas':'North Up','Ikut GPS':'Follow GPS','Paparan Navigasi Premium':'Premium Navigation Views',
  'Peta 2D':'2D Map','Peta 3D':'3D Map','Semakan Tol Automatik':'Automatic Toll Check',
  'Peta vektor MapTiler dengan kamera perspektif. Bangunan 3D dipaparkan jika data tersedia.':'MapTiler vector map with perspective camera. 3D buildings appear when data is available.',
  'Peta vektor MapTiler dengan kamera perspektif.':'MapTiler vector map with perspective camera.',
  'Bangunan 3D dipaparkan jika data tersedia.':'3D buildings appear when data is available.',
  'Peta 2D diaktifkan.':'2D map enabled.','Kamera mengikut lokasi GPS apabila tersedia.':'Camera follows GPS when available.',
  'Paparan perspektif diaktifkan. Bangunan 3D bergantung pada data peta.':'Perspective view enabled. 3D buildings depend on map data.',
  'Paparan tidak tersedia.':'View unavailable.',
  'Satelit':'Satellite','Standard':'Standard','Navigator (OSM)':'Navigator (OSM)',
  'Peta':'Map','Perjalanan':'Journey','Tetapan':'Settings',
  'Kawalan':'Controls','Semak':'Check','Cari Laluan':'Find Route',
  'Mula Navigasi':'Start Navigation','Laluan Alternatif':'Alternative Routes',
  'Anggaran Kos Perjalanan':'Estimated Travel Cost','Anggaran tiba:':'Estimated arrival:',
  'Anggaran tanpa trafik langsung':'Estimate without live traffic',
  'Tukar Mod Siang / Malam':'Toggle day/night mode',
  'Mula':'Start','Henti':'Stop','Lapor Trafik':'Report Traffic',
  'Pusatkan ke Lokasi Saya':'Centre on my location',
  'Navigasi GPS & Komuniti':'GPS Navigation & Community',
  'Peta vector MapTiler dengan kamera perspektif. Bangunan 3D dipaparkan jika data tersedia.':'MapTiler vector map with perspective camera. 3D buildings appear when data is available.'
 };
 const reverse=Object.fromEntries(Object.entries(pairs).map(([a,b])=>[b,a]));
 const originals=new WeakMap();
 const active=()=>document.documentElement.lang==='en'||document.getElementById('languageSelect')?.value==='en';
 function translate(s,en){
  if(en){if(pairs[s])return pairs[s];if(/^Lokasi Saya\s*\(/.test(s))return s.replace(/^Lokasi Saya/,'My Location');return s;}
  if(reverse[s])return reverse[s];if(/^My Location\s*\(/.test(s))return s.replace(/^My Location/,'Lokasi Saya');return s;
 }
 let busy=false;
 function apply(){if(busy)return;busy=true;
  try{
   const en=active();const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
   let n;while((n=walker.nextNode())){
    const p=n.parentElement;if(!p||p.closest('script,style,textarea,option,code,pre,[contenteditable="true"]'))continue;
    const current=n.nodeValue,trim=current.trim();if(!trim)continue;
    if(!originals.has(n))originals.set(n,trim);
    const original=originals.get(n);
    const target=translate(original,en);
    if(target!==trim && (pairs[original]||reverse[original]||/^Lokasi Saya\s*\(|^My Location\s*\(/.test(original))){
     n.nodeValue=current.replace(trim,target);
    }else if(target===original){
     // The original may already be in the opposite language; translate in both directions.
     const fallback=translate(trim,en);if(fallback!==trim)n.nodeValue=current.replace(trim,fallback);
    }
   }
   const title=document.getElementById('jgPremiumHeading');if(title)title.textContent=en?'Premium Navigation Views':'Paparan Navigasi Premium';
   document.querySelectorAll('[data-premium]').forEach(el=>{const v={ '2d':['Peta 2D','2D Map'],'3d':['Peta 3D','3D Map'],follow:['Ikut GPS','Follow GPS']}[el.dataset.premium];if(v&&el.textContent!==v[en?1:0])el.textContent=v[en?1:0];});
  }finally{busy=false;}
 }
 let pending=false;function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;apply();});}
 function init(){apply();document.getElementById('languageSelect')?.addEventListener('change',()=>setTimeout(apply,0));
  new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});
  // Original app may call setLanguage programmatically.
  if(typeof window.setLanguage==='function'){const previous=window.setLanguage;window.setLanguage=function(...args){const r=previous.apply(this,args);schedule();return r;};}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
