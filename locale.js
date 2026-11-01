/* One locale owner for static labels, late-created controls and accessibility text. */
'use strict';
(function(){
 const catalog=window.JG_LOCALE_CATALOG||{};
 const reverse=Object.fromEntries(Object.entries(catalog).map(([ms,en])=>[en,ms]));
 let language='en',scheduled=false,observer;
 const originals=new WeakMap(),attributes=new WeakMap(),pending=new Set();
 const protectedSelector='script,style,code,pre,textarea,[contenteditable],input,[data-user-content],.leaflet-control-attribution';
 const patterns=[
  [/^Pilih daripada (\d+) suara yang tersedia\. Jantina suara tidak dapat disahkan secara automatik; cuba Test Voice\.$/,m=>'Choose from '+m[1]+' installed voices. Use Test Voice to preview them.'],
  [/^Ramalan cuaca lokasi: (.+)°C, hujan (.+) mm\. Bukan amaran banjir rasmi\.$/,m=>'Local forecast: '+m[1]+'°C, precipitation '+m[2]+' mm. Not an official flood warning.'],
  [/^Mencari (.+) sekitar peta\.\.\.$/,m=>'Searching for '+english(m[1])+' near the map…'],
  [/^Menjumpai (\d+) (.+) berdekatan!$/,m=>m[1]+' nearby '+english(m[2])+' found.'],
  [/^Tiada (.+) ditemui di kawasan ini\. Cuba zum keluar sedikit\.$/,m=>'No '+english(m[1])+' found here. Try another area.'],
  [/^Gagal memuatkan senarai (.+)\. Sila cuba lagi\.$/,m=>'Unable to load '+english(m[1])+'. Please try again.'],
  [/^Anggaran tiba: (.+) • Anggaran tanpa trafik langsung$/,m=>'Estimated arrival: '+m[1]+' • No live traffic'],
  [/^GPS gagal: (.+)$/,m=>'GPS unavailable: '+m[1]],
  [/^Laporan "(.+)" disimpan & ditanda di peta!$/,m=>'Report "'+english(m[1])+'" saved on the map.'],
  [/^Klik lokasi di peta untuk menanda laporan "(.+)"\.$/,m=>'Tap the map to place a "'+english(m[1])+'" report.'],
  [/^(\d+) POI berhampiran tiga bahagian laluan \(tidak semestinya akses terus dari jalan\)\.$/,m=>m[1]+' places near sampled route sections. Direct road access is not guaranteed.'],
  [/^(\d+) j (\d+) min$/,m=>m[1]+' h '+m[2]+' min']
 ];
 function english(text){
  if(catalog[text])return catalog[text];
  for(const [pattern,render]of patterns){const match=text.match(pattern);if(match)return render(match);}
  return text;
 }
 function text(value){
  const raw=String(value??''),trim=raw.trim();
  const translated=language==='en'?english(trim):(reverse[trim]||trim);
  return raw.replace(trim,translated);
 }
 function translateNode(node){
  if(!node?.parentElement||node.parentElement.closest(protectedSelector))return;
  const value=node.nodeValue;if(!value?.trim())return;
  let record=originals.get(node);
  if(!record||value!==record.rendered)record={source:value};
  const rendered=text(record.source);record.rendered=rendered;originals.set(node,record);
  if(value!==rendered)node.nodeValue=rendered;
 }
 function translateAttributes(element){
  if(element.nodeType!==1||element.closest('[data-user-content],script,style'))return;
  let records=attributes.get(element);if(!records){records={};attributes.set(element,records);}
  for(const name of ['placeholder','title','aria-label','alt']){
   const value=element.getAttribute(name);if(!value)continue;
   let record=records[name];if(!record||value!==record.rendered)record={source:value};
   const rendered=text(record.source);record.rendered=rendered;records[name]=record;
   if(value!==rendered)element.setAttribute(name,rendered);
  }
 }
 function apply(root=document.body){
  if(!root)return;
  if(root.nodeType===3){translateNode(root);return;}
  if(root.nodeType===1&&root.closest(protectedSelector))return;
  translateAttributes(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode()))translateNode(node);
  root.querySelectorAll?.('[placeholder],[title],[aria-label],[alt]').forEach(translateAttributes);
 }
 function flush(){scheduled=false;for(const root of pending)if(root.isConnected!==false)apply(root);pending.clear();}
 function enqueue(root){pending.add(root);if(!scheduled){scheduled=true;requestAnimationFrame(flush);}}
 function setLanguage(value){language=value==='ms'?'ms':'en';apply();window.dispatchEvent(new CustomEvent('jg:locale',{detail:{language}}));}
 window.JG_I18N={text,setLanguage,apply,language:()=>language};
 function boot(){
  language=document.documentElement.lang==='ms'?'ms':'en';apply();
  observer=new MutationObserver(records=>{
   for(const record of records){
    if(record.type==='childList')record.addedNodes.forEach(enqueue);
    else enqueue(record.target);
   }
  });
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['placeholder','title','aria-label','alt']});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
