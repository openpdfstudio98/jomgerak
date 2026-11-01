/* JomGerak map-first shell. Reuses the existing action handlers and map state. */
'use strict';
(function(){
 const $=id=>document.getElementById(id),t=value=>window.JG_I18N?.text(value)||value;
 const icons={map:'map',saved:'bookmark',garage:'car-side',tools:'sliders'};
 let active='map';
 function button(label,icon,id){const b=document.createElement('button');b.type='button';b.id=id;b.className='jg-icon-button';b.setAttribute('aria-label',label);b.innerHTML='<i class="fa-solid fa-'+icon+'" aria-hidden="true"></i>';return b}
 function trapDialog(dialog,close){
  dialog.addEventListener('keydown',e=>{
   if(e.key==='Escape'){e.preventDefault();close();return;}
   if(e.key!=='Tab')return;
   const focusable=Array.from(dialog.querySelectorAll('button,input,select,textarea,a[href],summary,[tabindex="0"]')).filter(el=>!el.disabled&&el.getClientRects().length);
   const first=focusable[0],last=focusable[focusable.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}
   else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}
  });
 }
 function paint(){document.querySelectorAll('[data-jg-nav]').forEach(b=>{b.setAttribute('aria-current',b.dataset.jgNav===active?'page':'false')});}
 function tools(open,tab){
  $('jgProPanel').classList.toggle('jgfolded',!open);
  document.body.classList.toggle('jg-tools-open',open);
  $('jgToolsBackdrop').hidden=!open;
  $('jgNavTools').setAttribute('aria-expanded',String(open));
  if(open){active='tools';if(tab&&typeof jg55Tab==='function')jg55Tab(tab);$('jgToolsClose').focus()}
  else if(active==='tools')active='map';
  paint();if(map)setTimeout(()=>map.invalidateSize({pan:false}),100);
 }
 function navigate(tab){
  if(tab==='tools'){tools(!$('jgToolsBackdrop').hidden?false:true);return;}
  tools(false);active=tab;paint();
  if(tab==='saved')showSavedDestinations();
  else if(tab==='garage')window.JG_GARAGE.open();
 }
 function boot(){
  document.body.classList.add('jg-app');
  const top=document.createElement('header');top.id='jgTopBar';
  top.innerHTML='<button type="button" class="jg-wordmark" aria-label="JomGerak map"><span class="jg-brand-mark"><img src="./icon.svg" alt="" width="36" height="36" decoding="async"></span><span>JomGerak<small>MOVE WITH CONFIDENCE</small></span></button><div id="jgHeaderActions"></div>';
  top.querySelector('button').onclick=()=>navigate('map');document.body.appendChild(top);
  const actions=$('jgHeaderActions');
  for(const id of ['voiceMuteBtn','darkModeBtn','languageSelect']){const el=$(id);if(el){el.classList.add('jg-header-control');actions.appendChild(el)}}
  $('voiceMuteBtn')?.setAttribute('aria-label','Toggle voice guidance');$('darkModeBtn')?.setAttribute('aria-label','Toggle day/night mode');
  const nav=document.createElement('nav');nav.id='jgBottomNav';nav.setAttribute('aria-label','Primary navigation');
  for(const [name,label]of [['map','Explore'],['saved','Saved'],['garage','Garage'],['tools','Tools']]){
   const b=document.createElement('button');b.type='button';b.id='jgNav'+name[0].toUpperCase()+name.slice(1);b.dataset.jgNav=name;
   b.innerHTML='<i class="fa-solid fa-'+icons[name]+'" aria-hidden="true"></i><span>'+t(label)+'</span>';
   if(name==='tools'){b.setAttribute('aria-controls','jgProPanel');b.setAttribute('aria-expanded','false')}
   b.onclick=()=>navigate(name);nav.appendChild(b);
  }
  document.body.appendChild(nav);paint();
  const backdrop=document.createElement('button');backdrop.id='jgToolsBackdrop';backdrop.hidden=true;backdrop.setAttribute('aria-label','Close tools');backdrop.onclick=()=>tools(false);document.body.appendChild(backdrop);
  const header=document.createElement('div');header.className='jg-tools-header';header.innerHTML='<div><p class="jg-eyebrow">JOMGERAK</p><h2>'+t('Your travel toolkit')+'</h2></div>';
  const close=button('Close tools','xmark','jgToolsClose');close.onclick=()=>{tools(false);$('jgNavTools').focus()};header.appendChild(close);$('jgProPanel').prepend(header);
  $('jgProPanel').setAttribute('aria-label','Travel tools');
  const title=document.createElement('div');title.id='jgSearchHeading';title.innerHTML='<div><p class="jg-eyebrow">'+t('A GOOD JOURNEY STARTS HERE')+'</p><h2>'+t('Where to?')+'</h2></div><button type="button" id="jgActiveVehicle" aria-label="Choose vehicle"><span data-active-vehicle-icon></span><span data-active-vehicle data-user-content></span><i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>';
  $('searchPanelWrap').firstElementChild.prepend(title);$('jgActiveVehicle').onclick=()=>navigate('garage');
  const collapse=button('Collapse search','chevron-down','jgCollapseSearch');collapse.onclick=()=>{const collapsed=document.body.classList.toggle('jg-search-collapsed');collapse.setAttribute('aria-expanded',String(!collapsed));collapse.setAttribute('aria-label',collapsed?'Expand search':'Collapse search');if(map)map.invalidateSize({pan:false})};collapse.setAttribute('aria-expanded','true');title.appendChild(collapse);
  $('poiPillsContainer').parentElement.id='jgNearbyBar';
  const poiIcons={fuel:'gas-pump',mosque:'mosque',food:'utensils',ev:'bolt'};
  for(const [id,icon]of Object.entries(poiIcons)){const b=$('poiBtn-'+id),span=b?.querySelector('span');if(span)span.innerHTML='<i class="fa-solid fa-'+icon+'" aria-hidden="true"></i>'}
  // Move secondary destinations actions into a compact disclosure, preserving all buttons.
  const more=document.createElement('details');more.id='jgDestinationMore';const summary=document.createElement('summary');summary.textContent=t('Save, share & quick places');more.appendChild(summary);$('searchInputsContainer').appendChild(more);more.append($('destinationActions'),$('quickPlaces'));
  const extra=document.createElement('section');extra.id='jgAdditionalTools';extra.className='jg-shell-section';
  extra.innerHTML='<h3>'+t('App & support')+'</h3><div class="jg-shell-actions"></div>';const grid=extra.querySelector('div');
  for(const [label,icon,action]of [
   ['My garage','car-side',()=>navigate('garage')],['Road report','triangle-exclamation',()=>{tools(false);openReportModal()}],
   ['Activity tracker','person-running',()=>{tools(false);jg63RunOpen()}],['Diagnostics','stethoscope',()=>{tools(false);window.jgOpenDiagnostics?.()}]
  ]){const b=document.createElement('button');b.type='button';b.innerHTML='<i class="fa-solid fa-'+icon+'" aria-hidden="true"></i> <span>'+t(label)+'</span>';b.onclick=action;grid.appendChild(b)}
  $('jg55SettingsTab').appendChild(extra);
  // Keep the regular menu and the bottom navigation synchronized.
  window.jgTogglePro=()=>tools($('jgProPanel').classList.contains('jgfolded'));
  const saved=window.showSavedDestinations;window.showSavedDestinations=function(){saved();const modal=$('jgSavedModal');if(modal)trapDialog(modal,closeSavedDestinations)};
  const report=window.openReportModal;window.openReportModal=function(){report();trapDialog($('reportModal'),closeReportModal);$('reportModal').querySelector('button').focus()};
  const closeSaved=window.closeSavedDestinations;window.closeSavedDestinations=function(){closeSaved();active='map';paint()};
  window.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('jgToolsBackdrop').hidden)tools(false)});
  window.addEventListener('jg:locale',()=>{
   $('jgCollapseSearch').setAttribute('aria-label',document.body.classList.contains('jg-search-collapsed')?t('Expand search'):t('Collapse search'));
  });
  if(window.visualViewport){const resize=()=>{document.documentElement.style.setProperty('--jg-vh',window.visualViewport.height+'px');document.body.classList.toggle('jg-keyboard',window.innerHeight-window.visualViewport.height>150)};window.visualViewport.addEventListener('resize',resize);resize()}
  window.JG_GARAGE.sync();window.JG_I18N.apply();
 }
 window.JG_SHELL={navigate,tools,trapDialog};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
