/* JomGerak V6.6.4: state-aware Journey / Settings buttons and bilingual labels. */
'use strict';
(function(){
 const $=id=>document.getElementById(id);
 const groups={};
 function selected(button,on){
  button.classList.add('jg664-choice');button.classList.toggle('jg664-on',!!on);
  button.setAttribute('aria-pressed',String(!!on));
 }
 function refresh(){
  const trip=$('jg55TripTab'),settings=$('jg55SettingsTab');
  if(!trip||!settings)return;
  // Transport mode is owned by v60; reflect the existing .jg60active state.
  trip.querySelectorAll('button.jg60mode').forEach(b=>selected(b,b.classList.contains('jg60active')));
  // The route options toggle is a true open/closed choice.
  const toggle=trip.querySelector('button.jgtoolsToggle'),content=$('smartRoute48');
  if(toggle&&content)selected(toggle,!content.classList.contains('hidden'));
  // Only mark panel-opening tools when their actual panel is open.
  document.querySelectorAll('#jg55TripTab .jg55actions button,#jg55SettingsTab .jg55actions button').forEach(b=>{
   const m=(b.getAttribute('onclick')||'').match(/jg55Show\(['"]([^'"]+)['"]\)/);
   if(m)selected(b,typeof J55!=='undefined'&&J55.panel===m[1]&&!$('jg55Panel')?.hidden);
  });
  // Voice settings: don't falsely mark a one-shot action as selected.
  settings.querySelectorAll('button').forEach(b=>{
   if(b.classList.contains('jg664-choice')&&!b.matches('.jg55actions button')){
    b.classList.remove('jg664-choice','jg664-on');b.removeAttribute('aria-pressed');
   }
  });
 }
 let queued=false;function schedule(){if(queued)return;queued=true;setTimeout(()=>{queued=false;refresh()},40)}
 function init(){
  const body=$('jgProBody');if(!body)return;
  body.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&body.contains(b))schedule()});
  $('languageSelect')?.addEventListener('change',schedule);
  new MutationObserver(schedule).observe(body,{childList:true,subtree:true});
  // Observe only child-list updates to avoid a feedback loop from translated text.
  schedule();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
