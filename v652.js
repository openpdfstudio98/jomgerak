/* JomGerak V6.5.2 — voice choices from installed device TTS voices. */
'use strict';
(function(){
 const $=id=>document.getElementById(id);
 const key='jg652_voice_id';
 function voices(){return ('speechSynthesis' in window)?speechSynthesis.getVoices():[];}
 function id(v){return [v.voiceURI,v.name,v.lang].join('||');}
 function refresh(){
  const e=$('jg652VoiceSelect');if(!e)return;
  const previous=localStorage.getItem(key)||'';
  const available=voices().filter(v=>/^(ms|en|id)(-|_)/i.test(v.lang));
  e.replaceChildren(new Option('Automatic (device)',''));
  for(const v of available)e.add(new Option(v.name+' ('+v.lang+')',id(v)));
  if(available.some(v=>id(v)===previous))e.value=previous;
  else {e.value='';if(previous)localStorage.removeItem(key);}
  const hint=$('jg652VoiceHint');
  if(hint)hint.textContent=available.length?
   'Pilih daripada '+available.length+' suara yang tersedia. Jantina suara tidak dapat disahkan secara automatik; cuba Test Voice.':
   'Tiada suara BM/English tersedia pada browser ini. Pasang suara melalui tetapan text-to-speech telefon.';
 }
 window.jg652SelectedVoice=function(){
  const selected=localStorage.getItem(key);return voices().find(v=>id(v)===selected)||null;
 };
 window.jg652SaveVoice=function(){try{localStorage.setItem(key,$('jg652VoiceSelect')?.value||'');}catch{}};
 window.jg652TestVoice=function(){
  if(!('speechSynthesis' in window))return;
  const lang=typeof appLanguage!=='undefined'&&appLanguage==='en';
  const u=new SpeechSynthesisUtterance(lang?'In two hundred metres, turn left.':'Dalam dua ratus meter, belok kiri.');
  const v=window.jg652SelectedVoice();
  if(v){u.voice=v;u.lang=v.lang;}else u.lang=lang?'en-US':'ms-MY';
  u.rate=Number($('jgVoiceRate')?.value)||1;
  speechSynthesis.cancel();speechSynthesis.speak(u);
 };
 function boot(){refresh();if('speechSynthesis' in window)speechSynthesis.addEventListener?.('voiceschanged',refresh);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
