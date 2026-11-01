const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function element(){
 const classes=new Set();return {innerHTML:'',textContent:'',value:'',hidden:false,disabled:false,children:[],listeners:{},dataset:{},style:{removeProperty(){}},
 classList:{add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));},contains(x){return classes.has(x)},toggle(x,on){const v=on??!classes.has(x);v?classes.add(x):classes.delete(x);return v;},replace(a,b){classes.delete(a);classes.add(b)}},
 append(...a){this.children.push(...a)},appendChild(a){this.children.push(a);return a},replaceChildren(...a){this.children=[...a]},setAttribute(){},addEventListener(n,f){this.listeners[n]=f},querySelector(){return element()},querySelectorAll(){return []},remove(){},focus(){},scrollIntoView(){}};
}
function app(){
 const nodes=new Map(),timers=new Map(),storage=new Map();let next=0;
 const get=id=>{if(!nodes.has(id))nodes.set(id,element());nodes.get(id).parentElement=element();return nodes.get(id)};
 const document={readyState:'loading',body:element(),head:element(),documentElement:{lang:'ms',classList:element().classList},getElementById:get,querySelector(){return null},querySelectorAll(){return []},createElement:element,createTextNode:s=>({textContent:s}),addEventListener(){}};
 const c={console,document,navigator:{onLine:true},location:{href:'https://jomgerak.test/',origin:'https://jomgerak.test',protocol:'https:'},localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},URL,URLSearchParams,AbortController,AbortSignal,DOMException,Response,Date,CustomEvent:class {},setTimeout:(f,ms)=>{timers.set(++next,{f,ms});return next},clearTimeout:id=>timers.delete(id),setInterval:()=>0,requestAnimationFrame:f=>f(),addEventListener(){},dispatchEvent(){},isSecureContext:true};
 c.window=c;c.JOMGERAK_CONFIG={};vm.createContext(c);
 for(const [,code]of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))if(code.includes('const TRANSLATIONS'))vm.runInContext(code,c);
 for(const name of ['v55.js','v60.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),c);
 const markers=[];
 c.L={divIcon:x=>x,marker:(coords)=>{const m={coords,addTo(group){group.markers?.push(this);return this},bindPopup(){return this},on(){return this},setLatLng(){}};markers.push(m);return m},geoJSON:()=>({addTo(){return this},getBounds(){return {}}}),polyline:()=>({addTo(){return this},getBounds(){return {}}})};
 vm.runInContext(`map={getCenter:()=>({lat:3,lng:101}),getBounds:()=>({getWest:()=>100,getEast:()=>102,getNorth:()=>4,getSouth:()=>2}),removeLayer(){},flyTo(){},fitBounds(){},invalidateSize(){}};stepMarkersGroup={clearLayers(){}};communityMarkersGroup={clearLayers(){}};poiMarkersGroup={markers:[],clearLayers(){this.markers=[]}};showToast=(...v)=>{window.lastToast=v};jgSync3DRoute=()=>{window.synced=(window.synced||0)+1};`,c);
 return {c,get,nodes,timers,storage,markers,run:s=>vm.runInContext(s,c),load:n=>vm.runInContext(fs.readFileSync(path.join(root,n),'utf8'),c)};
}
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{resolve,reject,promise}};
const route=(name='route')=>({distance:2000,duration:120,geometry:{type:'LineString',coordinates:[[101,3],[101.02,3]]},legs:[{steps:[{name,maneuver:{type:'depart',location:[101,3]},distance:2000,geometry:{coordinates:[[101,3],[101.02,3]]}},{name:'End',maneuver:{type:'arrive',location:[101.02,3]},distance:0}]}]});
function locations(a){a.run(`originCoords={lat:3,lng:101,name:'Start'};destCoords={lat:3,lng:101.02,name:'End'};`)}
test('All inline, browser and server scripts parse; local script assets exist',()=>{
 for(const [,code]of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(code);
 for(const [,src]of html.matchAll(/<script[^>]*src="(\.\/[^"?]+)[^"]*"/g))assert.ok(fs.existsSync(path.join(root,src)),'Missing '+src);
 for(const dir of [root,path.join(root,'api')])for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(dir,f),'utf8'),{filename:f});
});
test('Clearing a pending route unlocks the button and ignores the old response',async()=>{
 const a=app();locations(a);const d=deferred();a.c.fetch=()=>d.promise;
 const pending=a.run('calculateRoute()');assert.equal(a.get('calcRouteBtn').disabled,true);
 a.run('clearInput("dest")');assert.equal(a.get('calcRouteBtn').disabled,false);
 d.resolve({ok:true,json:async()=>({code:'Ok',routes:[route()]})});await pending;
 assert.equal(a.run('currentRouteData'),null);assert.equal(a.run('destCoords'),null);
});
test('Changing a destination discards a route already in flight',async()=>{
 const a=app();locations(a);const first=deferred(),second=deferred();let calls=0;a.c.fetch=()=>++calls===1?first.promise:second.promise;
 a.run('renderRouteSummary=()=>{};renderChoices47=()=>{};updateFuelCalculation=()=>{}');
 const old=a.run('calculateRoute()');a.run('selectLocation("dest",3,101.03,"New")');
 first.resolve({ok:true,json:async()=>({code:'Ok',routes:[route('Old')]})});await old;
 assert.equal(a.run('currentRouteData'),null);assert.equal(a.get('calcRouteBtn').disabled,true);
 second.resolve({ok:true,json:async()=>({code:'Ok',routes:[route('New')]})});await new Promise(setImmediate);
 assert.equal(a.run('currentRouteData.legs[0].steps[0].name'),'New');assert.equal(a.get('calcRouteBtn').disabled,false);
});
test('Routing HTTP failure restores controls',async()=>{
 const a=app();locations(a);a.c.fetch=async()=>({ok:false});await a.run('calculateRoute()');assert.equal(a.get('calcRouteBtn').disabled,false);assert.equal(a.run('currentRouteData'),null);
});
test('Editing selected input clears coordinates and existing navigation',()=>{
 const a=app();locations(a);a.run('navigationActive=true;invalidateLocationInput("dest")');assert.equal(a.run('destCoords'),null);assert.equal(a.run('navigationActive'),false);
});
test('Typing queues autocomplete without sending keystrokes to Nominatim',()=>{
 const a=app();locations(a);let calls=0;a.c.jgGeocodeFetch=()=>{calls++;return Promise.reject(Error())};a.run('setupSearchListeners()');
 a.get('destInput').listeners.input({target:{value:'Klang'}});assert.equal(a.run('destCoords'),null);assert.equal(calls,0);assert.equal(a.timers.size,2);assert.ok([...a.timers.values()].some(x=>x.ms===350));
 assert.ok(a.get('destInput').listeners.keydown);
});
test('Clearing search cancels queued suggestions',()=>{
 const a=app();a.run('triggerNominatimSearch("Klang","dest");clearInput("dest")');assert.equal([...a.timers.values()].some(x=>x.ms===350),false);assert.equal(a.get('destSuggestions').classList.contains('hidden'),true);
});
test('Nearby includes buildings and relations with center coordinates and sorts by distance',async()=>{
 const a=app();let requested='';a.c.fetch=async url=>{requested=url;return{ok:true,json:async()=>({elements:[{type:'way',center:{lat:3,lon:101.02},tags:{name:'Building'}},{type:'relation',center:{lat:3,lon:101.001},tags:{name:'Complex'}},{type:'way',tags:{}}]})}};
 await a.run('searchNearbyPOI("mosque")');assert.match(decodeURIComponent(requested),/nwr\[/);assert.equal(a.markers.length,2);assert.deepEqual(Array.from(a.markers[0].coords),[3,101.001]);
});
test('Nearby HTTP failure uses its fallback',async()=>{
 const a=app();a.c.fetch=async()=>({ok:false});a.c.jgGeocodeFetch=async()=>({ok:true,json:async()=>[{lat:'3',lon:'101',display_name:'Station, Malaysia'}]});await a.run('searchNearbyPOI("fuel")');assert.equal(a.markers.length,1);
});
test('Clear POIs discards a delayed Nearby response',async()=>{
 const a=app(),d=deferred();a.c.fetch=()=>d.promise;const pending=a.run('searchNearbyPOI("fuel")');a.run('clearPOIMarkers()');d.resolve({ok:true,json:async()=>({elements:[{lat:3,lon:101,tags:{}}]})});await pending;assert.equal(a.markers.length,0);
});
test('Multi-leg route summary includes all legs and labels intermediate arrival as waypoint',()=>{
 const a=app(),r=route();r.legs.push({steps:[{name:'Second road',distance:600,maneuver:{type:'turn',modifier:'left',location:[101.01,3]}}]});a.c.fixture=r;a.run('renderRouteSummary(fixture)');assert.equal(a.get('stepsContainer').children.length,3);assert.equal(a.run('currentRouteStepsBM.length'),3);assert.match(a.run('currentRouteStepsBM[1].plainText'),/waypoint/);
});
test('Alternative selection synchronizes the 3D route',()=>{
 const a=app();a.c.fixture=route();a.run('routes47=[fixture];renderRouteSummary=()=>{};renderChoices47=()=>{};updateFuelCalculation=()=>{};selectRoute47(0)');assert.equal(a.c.synced,1);
});
test('Corrupt local reports cannot crash startup',()=>{
 const a=app();a.storage.set('jomgerak_community_reports_v2','{}');assert.doesNotThrow(()=>a.run('loadCommunityReports()'));a.run('communityMarkersGroup=null');assert.doesNotThrow(()=>a.run('loadCommunityReports()'));
});
test('Malformed saved destinations are filtered',()=>{
 const a=app();a.storage.set('jg_saved_v42',JSON.stringify([null,{}, {lat:3,lng:101,name:'Valid'}]));assert.equal(a.run('getSavedDestinations().length'),1);
});
test('Walking mode delegates Find Route and rail mode never silently routes a car',async()=>{
 const a=app();locations(a);let walks=0,requests=0;a.c.fetch=()=>{requests++;throw Error()};a.c.jg60WalkingRoute=()=>{walks++};a.run('jg60Mode("walk")');await a.run('calculateRoute()');assert.equal(walks,1);a.run('jg60Mode("rail")');await a.run('calculateRoute()');assert.equal(requests,0);
});
test('Stopping navigation prevents a late reroute from restoring a route',async()=>{
 const a=app();locations(a);const d=deferred();a.c.fetch=()=>d.promise;a.run('navigationActive=true');const pending=a.run('jg52Reroute({coords:{latitude:3,longitude:101}})');a.run('stopLiveNavigation(true)');d.resolve({ok:true,json:async()=>({code:'Ok',routes:[route()]})});await pending;assert.equal(a.run('currentRouteData'),null);
});
test('Multi-stop response cannot resurrect a cleared route',async()=>{
 const a=app();locations(a);a.run('J55.stops=[{lat:3,lng:101.01,name:"Stop"}]');const d=deferred();a.c.fetch=()=>d.promise;const pending=a.run('jg55RouteStops()');a.run('clearRoute(true)');d.resolve({ok:true,json:async()=>({routes:[route()]})});await pending;assert.equal(a.run('currentRouteData'),null);
});
test('Geocoding responses are cached and a cancelled request never fetches',async()=>{
 const a=app();a.load('geocoding.js');let calls=0;a.c.fetch=async()=>{calls++;return new Response('[{"name":"Place"}]',{status:200})};
 const response=await a.c.jgGeocodeFetch('https://nominatim.openstreetmap.org/search?q=test');assert.equal((await response.json())[0].name,'Place');await a.c.jgGeocodeFetch('https://nominatim.openstreetmap.org/search?q=test');assert.equal(calls,1);
 const controller=new AbortController();controller.abort();await assert.rejects(a.c.jgGeocodeFetch('https://nominatim.openstreetmap.org/search?q=cancel',{signal:controller.signal}),{name:'AbortError'});assert.equal(calls,1);
});
test('Translation observer converges without repeatedly replacing the title',()=>{
 const a=app(),callbacks=[],microtasks=[];let value='',writes=0;
 Object.defineProperty(a.get('jgPremiumHeading'),'textContent',{get:()=>value,set:v=>{value=v;writes++}});
 a.c.document.readyState='complete';a.c.document.createTreeWalker=()=>({nextNode:()=>null});a.c.NodeFilter={SHOW_TEXT:4};a.c.MutationObserver=class{constructor(f){callbacks.push(f)}observe(){}};a.c.queueMicrotask=f=>microtasks.push(f);
 a.load('v663.js');assert.equal(writes,1);callbacks[0]();while(microtasks.length)microtasks.shift()();assert.equal(writes,1);
});
test('Approaching a turn does not skip it for the following maneuver',()=>{
 const a=app();a.c.fixture={distance:2200,duration:180,geometry:{coordinates:[[101,3],[101.01,3],[101.01,3.01]]},legs:[{steps:[
 {name:'First road',distance:1100,maneuver:{type:'depart',location:[101,3]},geometry:{coordinates:[[101,3],[101.01,3]]}},
 {name:'Upcoming turn',distance:1100,maneuver:{type:'turn',modifier:'left',location:[101.01,3]},geometry:{coordinates:[[101.01,3],[101.01,3.01]]}},
 {name:'End',distance:0,maneuver:{type:'arrive',location:[101.01,3.01]}}
 ]}]};
 a.run('currentRouteData=fixture;destCoords={lat:3.01,lng:101.01};navigationActive=true;followGps=false;jgGPSAdvanced=()=>{};jg52Dashboard=()=>{};jg52TrackOffRoute=()=>{};speakText=()=>{};updateLivePosition({coords:{latitude:3,longitude:101.009,speed:10,accuracy:5}})');
 assert.match(a.get('liveInstruction').textContent,/Upcoming turn/);
});
test('Sparse route geometry reports remaining distance from projected position',()=>{
 const a=app();a.c.fixture=route();a.run('currentRouteData=fixture');const p=a.run('jg52RouteProgress({lat:3,lng:101.015})');assert.ok(p.remaining>500&&p.remaining<600);assert.ok(p.nearest<1);
});
test('Automatic reroute never silently drops multi-stop waypoints',async()=>{
 const a=app();locations(a);let calls=0;a.c.fetch=async()=>{calls++;throw Error()};a.c.fixture=route();a.run('currentRouteData=fixture;currentRouteData.legs.push(currentRouteData.legs[0]);navigationActive=true');await a.run('jg52Reroute({coords:{latitude:3,longitude:101}})');assert.equal(calls,0);
});
test('English is the default and includes dynamic notifications',()=>{
 const a=app();a.load('locale-catalog.js');a.load('locale.js');assert.equal(a.run('appLanguage'),'en');
 for(const [ms,en]of [['Pilih di atas peta','Choose on map'],['Tiada suara BM/English tersedia pada browser ini. Pasang suara melalui tetapan text-to-speech telefon.','No Malay or English voices are installed in this browser. Add a voice through your phone’s text-to-speech settings.'],['Mencari Stesen Minyak sekitar peta...','Searching for Petrol stations near the map…'],['Menjumpai 4 Stesen Minyak berdekatan!','4 nearby Petrol stations found.'],['Laporan "Banjir" disimpan & ditanda di peta!','Report "Flooding" saved on the map.']])assert.equal(a.c.JG_I18N.text(ms),en);
});
test('Translation protects user notes and converges after a language switch',()=>{
 const a=app();a.load('locale-catalog.js');a.load('locale.js');a.c.NodeFilter={SHOW_TEXT:4};const root={nodeType:1,getAttribute:()=>null,closest:()=>null,querySelectorAll:()=>[]};let writes=0,value='Laporan Komuniti';
 const node={nodeType:3,parentElement:{closest:()=>null}};Object.defineProperty(node,'nodeValue',{get:()=>value,set:v=>{writes++;value=v}});
 a.c.document.createTreeWalker=()=>{let done=false;return{nextNode(){if(done)return null;done=true;return node}}};
 a.c.JG_I18N.apply(root);a.c.JG_I18N.apply(root);assert.equal(value,'Community Reports');assert.equal(writes,1);
 node.parentElement.closest=()=>({});value='Banjir';a.c.JG_I18N.apply(root);assert.equal(value,'Banjir');
 node.parentElement.closest=()=>null;a.c.JG_I18N.setLanguage('ms');assert.equal(a.c.JG_I18N.text('Choose on map'),'Pilih di atas peta');
});
test('Garage validates stored profile values and supports all requested vehicle classes',()=>{
 const a=app();a.load('garage.js');const garage=a.c.JG_GARAGE;
 assert.deepEqual(Object.keys(garage.types),['car','motor','truck','4x4']);
 const invalid=garage.validate({type:'unknown',model:42,color:'url(javascript:bad)',consumption:Infinity,price:-1,height:100});assert.equal(invalid.type,'car');assert.equal(invalid.color,'#3b82f6');assert.equal(invalid.consumption,7.2);assert.equal(invalid.height,0);
});
test('Garage profile controls trip cost and persists across reloads',()=>{
 const a=app();a.load('garage.js');a.c.JG_GARAGE.apply({type:'4x4',model:'Toyota Hilux',color:'#ef4444',fuel:'diesel',consumption:10,price:3});a.c.fixture=route();a.run('currentRouteData=fixture;updateFuelCalculation()');assert.equal(a.get('fuelCostDisplay').textContent,'RM 0.60');assert.match(a.get('fuelLitresDisplay').textContent,/diesel/);assert.equal(a.run('jg60GetMode()'),'4x4');
 const stored=JSON.parse(a.storage.get('jg_garage_v1'));assert.equal(stored.model,'Toyota Hilux');a.load('garage.js');assert.equal(a.c.JG_GARAGE.get().model,'Toyota Hilux');assert.equal(JSON.parse(a.storage.get('jg55_vehicle')).liters,10);
});
test('Selecting a truck clears old routes and blocks unsupported routing/navigation',async()=>{
 const a=app();locations(a);a.c.fixture=route();a.run('currentRouteData=fixture');a.load('garage.js');a.c.JG_GARAGE.apply({type:'truck',model:'Isuzu NPR',height:3.4,weight:5});let requests=0;a.c.fetch=()=>{requests++;throw Error()};assert.equal(a.run('currentRouteData'),null);await a.run('calculateRoute()');a.run('startVoiceNavigation()');assert.equal(requests,0);assert.equal(a.run('navigationActive'),false);
});
test('Transport mode selection synchronizes the active garage identity',()=>{
 const a=app();a.load('garage.js');a.run('jg60Mode("motor")');assert.equal(a.c.JG_GARAGE.get().type,'motor');assert.equal(a.c.JG_GARAGE.get().model,'Yamaha Y15ZR');assert.equal(a.run('jg60GetMode()'),'motor');
});
test('Asset cache includes the new shell and locale assets; diagnostics have no floating launcher',()=>{
 const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');for(const file of ['app-shell.css','app-shell.js','garage.js','locale.js','locale-catalog.js'])assert.ok(sw.includes('./'+file),file);
 assert.doesNotMatch(fs.readFileSync(path.join(root,'v669.js'),'utf8'),/document\.body\.append\(btn\)/);assert.doesNotMatch(fs.readFileSync(path.join(root,'v671.js'),'utf8'),/document\.body\.append\(b\)/);
});
test('Every report category offered in the UI is accepted by the existing backend',()=>{
 const handler=fs.readFileSync(path.join(root,'api/reports.js'),'utf8');for(const [,type]of html.matchAll(/selectReportType\('([^']+)'\)/g))assert.ok(handler.includes("'"+type+"'"),'Unsupported category '+type);
});
test('Changing vehicle type remains usable while the map library is still loading',()=>{
 const a=app();a.load('garage.js');a.run('map=undefined;stepMarkersGroup=null');assert.doesNotThrow(()=>a.c.JG_GARAGE.apply({type:'motor',model:'Honda ADV160'}));assert.equal(a.run('jg60GetMode()'),'motor');
});
test('Driving controls track actual HUD height after layout changes',()=>{
 const a=app(),styles={};let bottom=110,resize;
 a.c.document.documentElement.style={setProperty:(key,value)=>styles[key]=value};a.get('liveNavHUD').getBoundingClientRect=()=>({bottom});
 a.c.ResizeObserver=class{constructor(fn){resize=fn}observe(){}};a.run('navigationActive=true');a.c.document.readyState='complete';a.load('v65.js');
 assert.equal(styles['--jg-driving-hud-bottom'],'110px');bottom=184;resize();assert.equal(styles['--jg-driving-hud-bottom'],'184px');
 a.run('navigationActive=false;jg65NavChanged()');bottom=220;resize();assert.equal(styles['--jg-driving-hud-bottom'],'184px');
});
test('Only one GPS camera controller runs and manual exploration pauses following',()=>{
 const a=app();a.c.innerHeight=844;a.load('v65.js');a.c.cameras=[];a.c.zooms=[];
 a.run(`navigationActive=true;followGps=true;jg3dActive=true;jg3d={getBearing:()=>0,getZoom:()=>14,easeTo:o=>cameras.push(o),zoomTo:(z,o)=>zooms.push(z),getSource:()=>null};`);
 a.run('jgGPSAdvanced({coords:{latitude:3,longitude:101,accuracy:5,speed:10,heading:20}})');assert.equal(a.c.cameras.length,1);assert.equal(a.c.cameras[0].zoom,undefined);
 a.run('jg65SuspendFollow();jgGPSAdvanced({coords:{latitude:3.001,longitude:101.001,accuracy:5,speed:10,heading:20}})');assert.equal(a.c.cameras.length,1);assert.equal(a.run('followGps'),false);
 a.run('jgMapZoom(1)');assert.equal(a.c.zooms[0],15);assert.equal(a.run('followGps'),false);
 a.run('lastGps={lat:3,lng:101};jg65Recenter()');assert.equal(a.run('followGps'),true);assert.equal(a.c.cameras.at(-1).zoom,14);
});
test('3D activation enables interaction and returning to 2D retains the explored camera',async()=>{
 const a=app();let options,returned;const handlers={};
 a.c.maplibregl={Map:class{constructor(o){options=o}addControl(){}on(name,fn){handlers[name]=fn}getCanvasContainer(){return{addEventListener(){}}}isStyleLoaded(){return false}resize(){}easeTo(){}getCenter(){return{lat:3.25,lng:101.5}}getZoom(){return 14}},NavigationControl:class{}};
 a.run('jgLoadMapLibre=async()=>{};map.getZoom=()=>12;map.setView=(p,z)=>window.returnedCamera={p,z};');await a.run('jgToggle3D()');assert.equal(a.run('jg3dActive'),true);assert.equal(options.interactive,true);assert.equal(options.dragPan,true);assert.equal(options.touchZoomRotate,true);assert.equal(options.zoom,12);
 let paused=0;a.c.jg65SuspendFollow=()=>paused++;handlers.movestart({originalEvent:{}});assert.equal(paused,1);handlers.movestart({});assert.equal(paused,1);
 await a.run('jgToggle3D()');assert.equal(a.run('jg3dActive'),false);assert.equal(a.c.returnedCamera.z,14);assert.deepEqual(Array.from(a.c.returnedCamera.p),[3.25,101.5]);
});
test('A failed 3D activation restores the 2D interaction state',async()=>{
 const a=app();a.run('jgLoadMapLibre=async()=>{throw Error("offline")};');await a.run('jgToggle3D()');assert.equal(a.run('jg3dActive'),false);assert.equal(a.get('jg3dMap').classList.contains('jgshown'),false);assert.equal(a.run('jg52Loading3D'),false);
});
test('Map layer choices select genuinely distinct road and satellite sources',()=>{
 const a=app();a.load('map-controls.js');a.c.layers=[];a.run('setMapStyle48=(style)=>layers.push(style);');a.c.JG_MAP_UI.layer('road');a.c.JG_MAP_UI.layer('satellite');a.c.JG_MAP_UI.layer('unknown');assert.deepEqual(a.c.layers,['standard','satellite']);
});
test('Building blocks can be disabled without hiding road layers',()=>{
 const a=app();a.load('map-controls.js');a.c.visibility=[];a.run(`jg3d={getStyle:()=>({layers:[{id:'buildings',type:'fill-extrusion'},{id:'roads',type:'line'}]}),setLayoutProperty:(...args)=>visibility.push(args)};jgPremiumAddBuildings=()=>{};`);a.c.JG_MAP_UI.buildings(false);assert.equal(a.run('JG_CFG.show3DBuildings'),false);assert.deepEqual(Array.from(a.c.visibility[0]),['buildings','visibility','none']);assert.equal(a.c.visibility.length,1);
});
test('Install prompt only opens after an explicit action; fallback remains available',async()=>{
 const a=app();let prompted=0;a.c.promptFixture={prompt:async()=>prompted++};a.run('jg52InstallPrompt=promptFixture');assert.equal(prompted,0);await a.run('jg52InstallApp()');assert.equal(prompted,1);await a.run('jg52InstallApp()');assert.equal(prompted,1);assert.match(a.c.lastToast[0],/browser menu/);
});
test('Simplifying map settings retains all required transport module mounts',()=>{
 for(const id of ['jg60Map','jg60Trip','jg60Settings'])assert.ok(html.includes('id="'+id+'"'),'Missing transport mount '+id);
});
test('My Location centers the active 3D map rather than only the hidden 2D map',()=>{
 const a=app();a.c.cameras=[];a.run('originCoords={lat:3,lng:101};jg3dActive=true;jg3d={getZoom:()=>13,easeTo:o=>cameras.push(o)}');a.c.navigator.geolocation={getCurrentPosition:success=>success({coords:{latitude:3.2,longitude:101.4}})};a.run('useMyLocation(true)');assert.equal(a.c.cameras.length,1);assert.deepEqual(Array.from(a.c.cameras[0].center),[101.4,3.2]);assert.equal(a.c.cameras[0].zoom,13);
});
test('Selecting 3D view preserves the current zoom rather than forcing a close-up',async()=>{
 const a=app();a.c.cameras=[];a.run('jg3dActive=true;jg3d={easeTo:o=>cameras.push(o)}');a.load('v656.js');await a.run('jgPremiumMode("3d")');assert.equal(a.c.cameras.length,1);assert.equal(a.c.cameras[0].zoom,undefined);assert.equal(a.c.cameras[0].pitch,50);
});

test('Starting navigation always requests 3D, with a single GPS watch',async()=>{
 const a=app();locations(a);a.c.fixture=route();let watches=0,opens=0;
 a.c.navigator.geolocation={watchPosition(){watches++;return 7},clearWatch(){}};
 a.run('currentRouteData=fixture;map.getZoom=()=>13;map.setView=()=>{};');
 a.c.jgToggle3D=async navigationOnly=>{assert.equal(navigationOnly,true);opens++;a.run('jg3dActive=true;jg3d={easeTo:()=>{}}')};
 await a.run('startVoiceNavigation()');assert.equal(opens,1);assert.equal(watches,1);assert.equal(a.run('navigationActive'),true);
 await a.run('startVoiceNavigation()');assert.equal(watches,1);assert.equal(a.run('navigationActive'),false);
});
test('Stopping while 3D loads prevents a late map activation',async()=>{
 const a=app(),d=deferred();a.c.jgLoadMapLibre=()=>d.promise;a.run('navigationActive=true');
 const p=a.run('jgToggle3D(true)');a.run('navigationActive=false');d.resolve();await p;
 assert.equal(a.run('jg3dActive'),false);assert.equal(a.get('jg3dMap').classList.contains('jgshown'),false);
});
test('Traffic does not claim live flow without provider configuration, and ignores a stopped request',async()=>{
 const a=app();a.load('traffic-flow.js');a.c.fetch=async()=>({ok:true,json:async()=>({trafficEnabled:false})});
 await a.c.JG_TRAFFIC.start();assert.match(a.get('jgTrafficFlow').textContent,/not configured/);
 const d=deferred();a.c.fetch=()=>d.promise;const p=a.c.JG_TRAFFIC.start();a.c.JG_TRAFFIC.stop();
 d.resolve({ok:true,json:async()=>({trafficEnabled:true})});await p;assert.equal(a.get('jgTrafficFlow').hidden,true);
});
test('Traffic tile proxy validates coordinates, keeps credentials server-side and returns PNG',async()=>{
 const handler=require('../api/traffic-tile.js');const old=global.fetch,key=process.env.TOMTOM_API_KEY;process.env.TOMTOM_API_KEY='test-secret';
 const response=()=>({headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(v){this.body=v;return this},send(v){this.body=v;return this}});
 try{
  let calls=0;global.fetch=async u=>{calls++;assert.match(u,/relative0\/12\/2044\/1360.png/);return{ok:true,headers:new Headers({'Content-Type':'image/png'}),arrayBuffer:async()=>new Uint8Array([137,80,78,71]).buffer}};
  let r=response();await handler({method:'GET',query:{z:'2',x:'4',y:'0'}},r);assert.equal(r.code,400);assert.equal(calls,0);
  r=response();await handler({method:'GET',query:{z:'12',x:'2044',y:'1360'}},r);assert.equal(r.code,200);assert.equal(r.headers['Content-Type'],'image/png');assert.equal(r.body.includes(Buffer.from('test-secret')),false);
 }finally{global.fetch=old;if(key===undefined)delete process.env.TOMTOM_API_KEY;else process.env.TOMTOM_API_KEY=key;}
});
test('Configured traffic mounts in 2D and 3D, then removes both overlays on stop',async()=>{
 const a=app();a.load('traffic-flow.js');const mounted=new Set(),sources=new Map(),layers=new Map();let removed=0;
 const tile={on(){return this},setUrl(){},addTo(){mounted.add(this);return this}};a.c.L.tileLayer=()=>tile;
 a.c.fetch=async()=>({ok:true,json:async()=>({trafficEnabled:true})});a.c.tile=tile;
 a.c.vector={isStyleLoaded:()=>true,on(){},getSource:id=>sources.get(id),addSource(id,v){sources.set(id,{...v,setTiles(){}})},getLayer:id=>layers.get(id),addLayer(v){layers.set(v.id,v)},removeLayer:id=>layers.delete(id),removeSource:id=>sources.delete(id)};
 a.c.hasTile=x=>mounted.has(x);a.c.removeTile=x=>{mounted.delete(x);removed++};
 a.run('map.hasLayer=hasTile;map.removeLayer=removeTile;');await a.c.JG_TRAFFIC.start();assert.equal(mounted.has(tile),true);
 a.run('jg3d=vector;jg3dActive=true');a.c.JG_TRAFFIC.sync();assert.equal(mounted.size,0);assert.equal(layers.has('jg-traffic-flow'),true);assert.match(sources.get('jg-traffic-flow').tiles[0],/\/api\/traffic-tile\?/);
 a.c.JG_TRAFFIC.stop();assert.equal(sources.size,0);assert.equal(layers.size,0);assert.equal(a.get('jgTrafficFlow').hidden,true);
});
test('3D vehicle uses Garage SVG, updates GPS/heading and replaces blue circles',()=>{
 const a=app();a.load('garage.js');a.load('vehicle-3d.js');let options,coords,rotation,removed=[],count=0;
 a.c.maplibregl={Marker:class{constructor(o){options=o;count++}setLngLat(v){coords=v;return this}setRotation(v){rotation=v;return this}addTo(){return this}remove(){}}};
 a.c.removeLayer=id=>removed.push(id);a.run("jg3d={isStyleLoaded:()=>true,getLayer:()=>true,removeLayer};lastGps=null");
 a.c.JG_3D_VEHICLE.sync();assert.equal(count,0);
 a.c.JG_3D_VEHICLE.update({coords:{latitude:3,longitude:101,heading:45,speed:10}});
 assert.equal(count,1);assert.match(options.element.innerHTML,/<svg/);assert.equal(options.rotationAlignment,'map');assert.equal(rotation,45);assert.deepEqual(Array.from(coords),[101,3]);assert.deepEqual(removed,['jg-premium-gps-dot','jg-premium-gps-ring']);
 a.c.JG_3D_VEHICLE.update({coords:{latitude:3.01,longitude:101.01,heading:null,speed:0}});assert.equal(rotation,45);assert.equal(count,1);
 a.c.JG_GARAGE.apply({type:'motor',model:'Test bike',color:'#ef4444'});a.c.JG_3D_VEHICLE.refresh();assert.match(options.element.innerHTML,/#ef4444/);
});
test('Traffic configuration distinguishes a Preview deployment without a key',async()=>{
 const a=app();a.load('traffic-flow.js');a.c.fetch=async()=>({ok:true,json:async()=>({trafficEnabled:false,deploymentEnvironment:'preview'})});await a.c.JG_TRAFFIC.start();assert.match(a.get('jgTrafficFlow').textContent,/Preview/);
});
test('3D shows only the destination pin, avoids duplicates and removes it when cleared',()=>{
 const a=app();locations(a);a.load('route-pins-3d.js');let created=[],removed=0;
 a.c.maplibregl={Marker:class{constructor(o){this.o=o;created.push(this)}setLngLat(p){this.p=p;return this}addTo(){return this}remove(){removed++}}};
 a.c.fixture=route();a.c.fixture.legs.push({steps:[]});a.run('jg3d={};currentRouteData=fixture');
 a.c.JG_3D_PINS.sync();assert.equal(created.length,1);assert.match(created[0].o.element.className,/destination/);assert.equal(created[0].o.anchor,'bottom');assert.deepEqual(Array.from(created[0].p),[101.02,3]);
 a.c.JG_3D_PINS.sync();assert.equal(created.length,1);
 a.run('currentRouteData=null;destCoords=null');a.c.JG_3D_PINS.sync();assert.equal(removed,1);assert.equal(created.length,1);
});
test('Successful traffic tile load hides the banner while keeping attribution',async()=>{
 const a=app();a.load('traffic-flow.js');const handlers={};let options;
 a.c.L.tileLayer=(url,o)=>{options=o;return{on(k,f){handlers[k]=f;return this},setUrl(){},addTo(){return this}}};
 a.run('map.hasLayer=()=>false');a.c.fetch=async()=>({ok:true,json:async()=>({trafficEnabled:true})});await a.c.JG_TRAFFIC.start();handlers.tileload();assert.equal(a.get('jgTrafficFlow').hidden,true);assert.equal(a.get('jgTrafficFlow').textContent,'');assert.match(options.attribution,/TomTom/);
});
test('2D omits the origin pin and retains the draggable destination marker',()=>{
 const a=app();let removed=0,options;
 a.c.removeOld=()=>removed++;a.run('map.removeLayer=removeOld;originMarker={};');
 a.run('updateMarker("origin",3,101,"Start")');assert.equal(a.run('originMarker'),null);assert.equal(removed,1);assert.equal(a.markers.length,0);
 const original=a.c.L.marker;a.c.L.marker=(p,o)=>{options=o;return original(p,o)};
 a.run('updateMarker("dest",3.02,101.02,"End")');assert.equal(a.markers.length,1);assert.equal(options.draggable,true);assert.match(options.icon.html,/fa-flag-checkered/);assert.doesNotMatch(options.icon.html,/emerald|fa-play/);
});
test('Typing suggestions use the autocomplete adapter and discard stale results',async()=>{
 const a=app(),d=deferred();let calls=0;a.c.jgAutocompleteFetch=()=>{calls++;return d.promise};a.c.jgGeocodeFetch=()=>{throw Error('Typing must not use Nominatim')};
 a.run('triggerNominatimSearch("Klang","dest",true)');const timer=[...a.timers.values()].find(x=>x.ms===350);const pending=timer.f();assert.equal(calls,1);
 a.run('cancelLocationSearch("dest")');d.resolve({ok:true,json:async()=>[{lat:3,lon:101,name:'Old',display_name:'Old'}]});await pending;assert.equal(a.get('destSuggestions').children.length,0);assert.equal(a.get('destSuggestions').classList.contains('hidden'),true);
});
test('Autocomplete uses Photon, filters Malaysia and caches repeated terms',async()=>{
 const a=app();a.load('geocoding.js');let calls=0;
 a.c.fetch=async url=>{calls++;assert.match(url,/photon\.komoot\.io/);assert.match(url,/countrycode=MY/);return {ok:true,json:async()=>({features:[{properties:{name:'Klang',countrycode:'MY',country:'Malaysia'},geometry:{coordinates:[101.45,3.04]}},{properties:{name:'Foreign',countrycode:'DE'},geometry:{coordinates:[13,52]}}]})}};
 const r=await a.c.jgAutocompleteFetch('Klang');const data=await r.json();assert.equal(data.length,1);assert.equal(data[0].name,'Klang');assert.equal(data[0].lat,3.04);await a.c.jgAutocompleteFetch('Klang');assert.equal(calls,1);
});
