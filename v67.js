/* V6.7.1: Non-invasive map health check; startup remains owned by index.html. */
(function(){'use strict';
function check(){try{if(typeof map!=='undefined'&&map&&map.getContainer())map.invalidateSize({pan:false});}catch(e){window.dispatchEvent(new CustomEvent('jg:startup-error',{detail:{name:'map sizing',message:String(e)}}));}}
window.addEventListener('resize',check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(check,250);});
window.addEventListener('load',()=>setTimeout(check,400));
})();
