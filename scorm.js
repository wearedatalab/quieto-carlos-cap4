// Envoltorio SCORM 1.2 mínimo
var SCORM=(function(){var api=null,ok=false;
function find(w){var n=0;while(w&&!w.API&&w.parent&&w.parent!==w&&n<10){w=w.parent;n++;}return w&&w.API?w.API:null;}
function init(){api=find(window)||(window.opener?find(window.opener):null);if(api){ok=api.LMSInitialize("")==="true"||api.LMSInitialize("")===true;}return ok;}
function get(k){return api?api.LMSGetValue(k):"";}
function set(k,v){if(api)api.LMSSetValue(k,String(v));}
function commit(){if(api)api.LMSCommit("");}
function finish(){if(api){commit();api.LMSFinish("");}}
return{init:init,get:get,set:set,commit:commit,finish:finish,has:function(){return !!api;}};})();
