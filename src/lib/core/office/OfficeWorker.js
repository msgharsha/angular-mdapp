(function(){/*
 *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
*****************************************************************************/
var $jscomp=$jscomp||{};$jscomp.scope={};$jscomp.arrayIteratorImpl=function(b){var c=0;return function(){return c<b.length?{done:!1,value:b[c++]}:{done:!0}}};$jscomp.arrayIterator=function(b){return{next:$jscomp.arrayIteratorImpl(b)}};$jscomp.makeIterator=function(b){var c="undefined"!=typeof Symbol&&Symbol.iterator&&b[Symbol.iterator];return c?c.call(b):$jscomp.arrayIterator(b)};
$jscomp.getGlobal=function(b){return"undefined"!=typeof window&&window===b?b:"undefined"!=typeof global&&null!=global?global:b};$jscomp.global=$jscomp.getGlobal(this);$jscomp.ASSUME_ES5=!1;$jscomp.ASSUME_NO_NATIVE_MAP=!1;$jscomp.ASSUME_NO_NATIVE_SET=!1;$jscomp.SIMPLE_FROUND_POLYFILL=!1;$jscomp.defineProperty=$jscomp.ASSUME_ES5||"function"==typeof Object.defineProperties?Object.defineProperty:function(b,c,f){b!=Array.prototype&&b!=Object.prototype&&(b[c]=f.value)};
$jscomp.polyfill=function(b,c,f,a){if(c){f=$jscomp.global;b=b.split(".");for(a=0;a<b.length-1;a++){var e=b[a];e in f||(f[e]={});f=f[e]}b=b[b.length-1];a=f[b];c=c(a);c!=a&&null!=c&&$jscomp.defineProperty(f,b,{configurable:!0,writable:!0,value:c})}};$jscomp.FORCE_POLYFILL_PROMISE=!1;
$jscomp.polyfill("Promise",function(b){function c(){this.batch_=null}function f(a){return a instanceof e?a:new e(function(b,d){b(a)})}if(b&&!$jscomp.FORCE_POLYFILL_PROMISE)return b;c.prototype.asyncExecute=function(a){null==this.batch_&&(this.batch_=[],this.asyncExecuteBatch_());this.batch_.push(a);return this};c.prototype.asyncExecuteBatch_=function(){var a=this;this.asyncExecuteFunction(function(){a.executeBatch_()})};var a=$jscomp.global.setTimeout;c.prototype.asyncExecuteFunction=function(b){a(b,
0)};c.prototype.executeBatch_=function(){for(;this.batch_&&this.batch_.length;){var a=this.batch_;this.batch_=[];for(var b=0;b<a.length;++b){var d=a[b];a[b]=null;try{d()}catch(k){this.asyncThrow_(k)}}}this.batch_=null};c.prototype.asyncThrow_=function(a){this.asyncExecuteFunction(function(){throw a;})};var e=function(a){this.state_=0;this.result_=void 0;this.onSettledCallbacks_=[];var b=this.createResolveAndReject_();try{a(b.resolve,b.reject)}catch(d){b.reject(d)}};e.prototype.createResolveAndReject_=
function(){function a(a){return function(k){d||(d=!0,a.call(b,k))}}var b=this,d=!1;return{resolve:a(this.resolveTo_),reject:a(this.reject_)}};e.prototype.resolveTo_=function(a){if(a===this)this.reject_(new TypeError("A Promise cannot resolve to itself"));else if(a instanceof e)this.settleSameAsPromise_(a);else{a:switch(typeof a){case "object":var b=null!=a;break a;case "function":b=!0;break a;default:b=!1}b?this.resolveToNonPromiseObj_(a):this.fulfill_(a)}};e.prototype.resolveToNonPromiseObj_=function(a){var b=
void 0;try{b=a.then}catch(d){this.reject_(d);return}"function"==typeof b?this.settleSameAsThenable_(b,a):this.fulfill_(a)};e.prototype.reject_=function(a){this.settle_(2,a)};e.prototype.fulfill_=function(a){this.settle_(1,a)};e.prototype.settle_=function(a,b){if(0!=this.state_)throw Error("Cannot settle("+a+", "+b+"): Promise already settled in state"+this.state_);this.state_=a;this.result_=b;this.executeOnSettledCallbacks_()};e.prototype.executeOnSettledCallbacks_=function(){if(null!=this.onSettledCallbacks_){for(var a=
0;a<this.onSettledCallbacks_.length;++a)g.asyncExecute(this.onSettledCallbacks_[a]);this.onSettledCallbacks_=null}};var g=new c;e.prototype.settleSameAsPromise_=function(a){var b=this.createResolveAndReject_();a.callWhenSettled_(b.resolve,b.reject)};e.prototype.settleSameAsThenable_=function(a,b){var d=this.createResolveAndReject_();try{a.call(b,d.resolve,d.reject)}catch(k){d.reject(k)}};e.prototype.then=function(a,b){function d(a,d){return"function"==typeof a?function(d){try{k(a(d))}catch(p){c(p)}}:
d}var k,c,f=new e(function(a,d){k=a;c=d});this.callWhenSettled_(d(a,k),d(b,c));return f};e.prototype.catch=function(a){return this.then(void 0,a)};e.prototype.callWhenSettled_=function(a,b){function d(){switch(k.state_){case 1:a(k.result_);break;case 2:b(k.result_);break;default:throw Error("Unexpected state: "+k.state_);}}var k=this;null==this.onSettledCallbacks_?g.asyncExecute(d):this.onSettledCallbacks_.push(d)};e.resolve=f;e.reject=function(a){return new e(function(b,d){d(a)})};e.race=function(a){return new e(function(b,
d){for(var k=$jscomp.makeIterator(a),c=k.next();!c.done;c=k.next())f(c.value).callWhenSettled_(b,d)})};e.all=function(a){var b=$jscomp.makeIterator(a),d=b.next();return d.done?f([]):new e(function(a,c){function k(d){return function(b){e[d]=b;v--;0==v&&a(e)}}var e=[],v=0;do e.push(void 0),v++,f(d.value).callWhenSettled_(k(e.length-1),c),d=b.next();while(!d.done)})};return e},"es6","es3");
$jscomp.checkStringArgs=function(b,c,f){if(null==b)throw new TypeError("The 'this' value for String.prototype."+f+" must not be null or undefined");if(c instanceof RegExp)throw new TypeError("First argument to String.prototype."+f+" must not be a regular expression");return b+""};
$jscomp.polyfill("String.prototype.endsWith",function(b){return b?b:function(b,f){var a=$jscomp.checkStringArgs(this,b,"endsWith");b+="";void 0===f&&(f=a.length);f=Math.max(0,Math.min(f|0,a.length));for(var e=b.length;0<e&&0<f;)if(a[--f]!=b[--e])return!1;return 0>=e}},"es6","es3");$jscomp.checkEs6ConformanceViaProxy=function(){try{var b={},c=Object.create(new $jscomp.global.Proxy(b,{get:function(f,a,e){return f==b&&"q"==a&&e==c}}));return!0===c.q}catch(f){return!1}};
$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS=!1;$jscomp.ES6_CONFORMANCE=$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS&&$jscomp.checkEs6ConformanceViaProxy();$jscomp.SYMBOL_PREFIX="jscomp_symbol_";$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.Symbol=function(){var b=0;return function(c){return $jscomp.SYMBOL_PREFIX+(c||"")+b++}}();
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var b=$jscomp.global.Symbol.iterator;b||(b=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[b]&&$jscomp.defineProperty(Array.prototype,b,{configurable:!0,writable:!0,value:function(){return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this))}});$jscomp.initSymbolIterator=function(){}};
$jscomp.initSymbolAsyncIterator=function(){$jscomp.initSymbol();var b=$jscomp.global.Symbol.asyncIterator;b||(b=$jscomp.global.Symbol.asyncIterator=$jscomp.global.Symbol("asyncIterator"));$jscomp.initSymbolAsyncIterator=function(){}};$jscomp.iteratorPrototype=function(b){$jscomp.initSymbolIterator();b={next:b};b[$jscomp.global.Symbol.iterator]=function(){return this};return b};$jscomp.owns=function(b,c){return Object.prototype.hasOwnProperty.call(b,c)};
$jscomp.polyfill("WeakMap",function(b){function c(){if(!b||!Object.seal)return!1;try{var a=Object.seal({}),k=Object.seal({}),e=new b([[a,2],[k,3]]);if(2!=e.get(a)||3!=e.get(k))return!1;e.delete(a);e.set(k,4);return!e.has(a)&&4==e.get(k)}catch(u){return!1}}function f(){}function a(a){if(!$jscomp.owns(a,g)){var d=new f;$jscomp.defineProperty(a,g,{value:d})}}function e(d){var b=Object[d];b&&(Object[d]=function(d){if(d instanceof f)return d;a(d);return b(d)})}if($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS){if(b&&
$jscomp.ES6_CONFORMANCE)return b}else if(c())return b;var g="$jscomp_hidden_"+Math.random();e("freeze");e("preventExtensions");e("seal");var m=0,l=function(a){this.id_=(m+=Math.random()+1).toString();if(a){a=$jscomp.makeIterator(a);for(var d;!(d=a.next()).done;)d=d.value,this.set(d[0],d[1])}};l.prototype.set=function(d,b){a(d);if(!$jscomp.owns(d,g))throw Error("WeakMap key fail: "+d);d[g][this.id_]=b;return this};l.prototype.get=function(a){return $jscomp.owns(a,g)?a[g][this.id_]:void 0};l.prototype.has=
function(a){return $jscomp.owns(a,g)&&$jscomp.owns(a[g],this.id_)};l.prototype.delete=function(a){return $jscomp.owns(a,g)&&$jscomp.owns(a[g],this.id_)?delete a[g][this.id_]:!1};return l},"es6","es3");$jscomp.MapEntry=function(){};
$jscomp.polyfill("Map",function(b){function c(){if($jscomp.ASSUME_NO_NATIVE_MAP||!b||"function"!=typeof b||!b.prototype.entries||"function"!=typeof Object.seal)return!1;try{var a=Object.seal({x:4}),e=new b($jscomp.makeIterator([[a,"s"]]));if("s"!=e.get(a)||1!=e.size||e.get({x:4})||e.set({x:4},"t")!=e||2!=e.size)return!1;var c=e.entries(),f=c.next();if(f.done||f.value[0]!=a||"s"!=f.value[1])return!1;f=c.next();return f.done||4!=f.value[0].x||"t"!=f.value[1]||!c.next().done?!1:!0}catch(h){return!1}}
if($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS){if(b&&$jscomp.ES6_CONFORMANCE)return b}else if(c())return b;$jscomp.initSymbolIterator();var f=new WeakMap,a=function(a){this.data_={};this.head_=m();this.size=0;if(a){a=$jscomp.makeIterator(a);for(var b;!(b=a.next()).done;)b=b.value,this.set(b[0],b[1])}};a.prototype.set=function(a,b){a=0===a?0:a;var d=e(this,a);d.list||(d.list=this.data_[d.id]=[]);d.entry?d.entry.value=b:(d.entry={next:this.head_,previous:this.head_.previous,head:this.head_,key:a,
value:b},d.list.push(d.entry),this.head_.previous.next=d.entry,this.head_.previous=d.entry,this.size++);return this};a.prototype.delete=function(a){a=e(this,a);return a.entry&&a.list?(a.list.splice(a.index,1),a.list.length||delete this.data_[a.id],a.entry.previous.next=a.entry.next,a.entry.next.previous=a.entry.previous,a.entry.head=null,this.size--,!0):!1};a.prototype.clear=function(){this.data_={};this.head_=this.head_.previous=m();this.size=0};a.prototype.has=function(a){return!!e(this,a).entry};
a.prototype.get=function(a){return(a=e(this,a).entry)&&a.value};a.prototype.entries=function(){return g(this,function(a){return[a.key,a.value]})};a.prototype.keys=function(){return g(this,function(a){return a.key})};a.prototype.values=function(){return g(this,function(a){return a.value})};a.prototype.forEach=function(a,b){for(var d=this.entries(),e;!(e=d.next()).done;)e=e.value,a.call(b,e[1],e[0],this)};a.prototype[Symbol.iterator]=a.prototype.entries;var e=function(a,b){var d=b&&typeof b;"object"==
d||"function"==d?f.has(b)?d=f.get(b):(d=""+ ++l,f.set(b,d)):d="p_"+b;var e=a.data_[d];if(e&&$jscomp.owns(a.data_,d))for(a=0;a<e.length;a++){var c=e[a];if(b!==b&&c.key!==c.key||b===c.key)return{id:d,list:e,index:a,entry:c}}return{id:d,list:e,index:-1,entry:void 0}},g=function(a,b){var d=a.head_;return $jscomp.iteratorPrototype(function(){if(d){for(;d.head!=a.head_;)d=d.previous;for(;d.next!=d.head;)return d=d.next,{done:!1,value:b(d)};d=null}return{done:!0,value:void 0}})},m=function(){var a={};return a.previous=
a.next=a.head=a},l=0;return a},"es6","es3");$jscomp.underscoreProtoCanBeSet=function(){var b={a:!0},c={};try{return c.__proto__=b,c.a}catch(f){}return!1};$jscomp.setPrototypeOf="function"==typeof Object.setPrototypeOf?Object.setPrototypeOf:$jscomp.underscoreProtoCanBeSet()?function(b,c){b.__proto__=c;if(b.__proto__!==c)throw new TypeError(b+" is not extensible");return b}:null;$jscomp.polyfill("Object.setPrototypeOf",function(b){return b||$jscomp.setPrototypeOf},"es6","es5");
$jscomp.assign="function"==typeof Object.assign?Object.assign:function(b,c){for(var f=1;f<arguments.length;f++){var a=arguments[f];if(a)for(var e in a)$jscomp.owns(a,e)&&(b[e]=a[e])}return b};$jscomp.polyfill("Object.assign",function(b){return b||$jscomp.assign},"es6","es3");
(function(b){function c(a){if(f[a])return f[a].exports;var e=f[a]={i:a,l:!1,exports:{}};b[a].call(e.exports,e,e.exports,c);e.l=!0;return e.exports}var f={};c.m=b;c.c=f;c.d=function(a,b,f){c.o(a,b)||Object.defineProperty(a,b,{enumerable:!0,get:f})};c.r=function(a){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(a,Symbol.toStringTag,{value:"Module"});Object.defineProperty(a,"__esModule",{value:!0})};c.t=function(a,b){b&1&&(a=c(a));if(b&8||b&4&&"object"===typeof a&&a&&a.__esModule)return a;
var e=Object.create(null);c.r(e);Object.defineProperty(e,"default",{enumerable:!0,value:a});if(b&2&&"string"!=typeof a)for(var f in a)c.d(e,f,function(b){return a[b]}.bind(null,f));return e};c.n=function(a){var b=a&&a.__esModule?function(){return a["default"]}:function(){return a};c.d(b,"a",b);return b};c.o=function(a,b){return Object.prototype.hasOwnProperty.call(a,b)};c.p="/core/office/";return c(c.s=12)})([function(b,c,f){f.d(c,"c",function(){return e});f.d(c,"a",function(){return m});f.d(c,"b",
function(){return g});var a=f(2),e=function(b,d){Object(a.a)("disableLogs")||(d?console.warn(b+": "+d):console.warn(b))},g=function(a,b,c){var d=c.pop();c=c.length?c.join(", ")+" and "+d:d;e("'"+b+"' is deprecated since version "+a+". Please use "+c+" instead.")},m=function(a,b){}},function(b,c,f){f.d(c,"a",function(){return w});f.d(c,"b",function(){return A});f.d(c,"c",function(){return B});var a=f(7),e=f(0),g=f(4),m=f(3),l="undefined"===typeof window?self:window,d=l.importScripts,k=!1,v=function(a,
b){k||(d(l.basePath+"decode.min.js"),k=!0);a=self.BrotliDecode(Object(m.b)(a));return b?a:Object(m.a)(a)},u=function(b,d){return Object(a.a)(void 0,void 0,Promise,function(){var e;return Object(a.b)(this,function(a){switch(a.label){case 0:return k?[3,2]:[4,Object(g.b)(self.Core.getWorkerPath()+"external/decode.min.js","Failed to download decode.min.js",window)];case 1:a.sent(),k=!0,a.label=2;case 2:return e=self.BrotliDecode(Object(m.b)(b)),[2,d?e:Object(m.a)(e)]}})})};(function(){function a(){this.remainingDataArrays=
[]}a.prototype.processRaw=function(a){return a};a.prototype.processBrotli=function(a){this.remainingDataArrays.push(a);return null};a.prototype.GetNextChunk=function(a){this.decodeFunction||(this.decodeFunction=0===a[0]&&97===a[1]&&115===a[2]&&109===a[3]?this.processRaw:this.processBrotli);return this.decodeFunction(a)};a.prototype.End=function(){if(this.remainingDataArrays.length){for(var a=this.arrays,b=0,d=0;d<a.length;++d)b+=a[d].length;b=new Uint8Array(b);var e=0;for(d=0;d<a.length;++d){var c=
a[d];b.set(c,e);e+=c.length}return v(b,!0)}return null};return a})();var h=!1,t=function(a){h||(d(l.basePath+"pako_inflate.min.js"),h=!0);var b=10;if("string"===typeof a){if(a.charCodeAt(3)&8){for(;0!==a.charCodeAt(b);++b);++b}}else if(a[3]&8){for(;0!==a[b];++b);++b}a=Object(m.b)(a);a=a.subarray(b,a.length-8);return l.pako.inflate(a,{windowBits:-15})},r=function(a,b){return b?a:Object(m.a)(a)},p=function(a){var b=!a.shouldOutputArray,c=new XMLHttpRequest;c.open("GET",a.url,a.isAsync);var f=b&&c.overrideMimeType;
c.responseType=f?"text":"arraybuffer";f&&c.overrideMimeType("text/plain; charset=x-user-defined");c.send();var g=function(){var g=Date.now();var l=f?c.responseText:new Uint8Array(c.response);Object(e.a)("worker","Result length is "+l.length);l.length<a.compressedMaximum?(l=a.decompressFunction(l,a.shouldOutputArray),Object(e.c)("There may be some degradation of performance. Your server has not been configured to serve .gz. and .br. files with the expected Content-Encoding. See http://www.pdftron.com/kb_content_encoding for instructions on how to resolve this."),
d&&Object(e.a)("worker","Decompressed length is "+l.length)):b&&(l=Object(m.a)(l));d&&Object(e.a)("worker",a.url+" Decompression took "+(Date.now()-g));return l};if(a.isAsync)var l=new Promise(function(b,d){c.onload=function(){200===this.status||0===this.status?b(g()):d("Download Failed "+a.url)};c.onerror=function(){d("Network error occurred "+a.url)}});else{if(200===c.status||0===c.status)return g();throw Error("Failed to load "+a.url);}return l},w=function(a){var b=a.lastIndexOf("/");-1===b&&(b=
0);var c=a.slice(b).replace(".",".br.");d||(c.endsWith(".js.mem")?c=c.replace(".js.mem",".mem"):c.endsWith(".js")&&(c=c.concat(".mem")));return a.slice(0,b)+c},y=function(a,b){var d=a.lastIndexOf("/");-1===d&&(d=0);var c=a.slice(d).replace(".",".gz.");b.url=a.slice(0,d)+c;b.decompressFunction=t;return p(b)},n=function(a,b){b.url=w(a);b.decompressFunction=d?v:u;return p(b)},q=function(a,b){a.endsWith(".js.mem")?a=a.slice(0,-4):a.endsWith(".mem")&&(a=a.slice(0,-4)+".js.mem");b.url=a;b.decompressFunction=
r;return p(b)},x=function(a,b,d,c){return a.catch(function(a){Object(e.c)(a);return c(b,d)})},z=function(a,b,d){var c;if(d.isAsync){var f=b[0](a,d);for(c=1;c<b.length;++c)f=x(f,a,d,b[c]);return f}for(c=0;c<b.length;++c)try{return b[c](a,d)}catch(I){Object(e.c)(I.message)}throw Error("");},B=function(a,b,d,c){return z(a,[y,n,q],{compressedMaximum:b,isAsync:d,shouldOutputArray:c})},A=function(a,b,d,c){return z(a,[n,y,q],{compressedMaximum:b,isAsync:d,shouldOutputArray:c})}},function(b,c,f){f.d(c,"a",
function(){return g});f.d(c,"b",function(){return m});var a={},e={flattenedResources:!1,CANVAS_CACHE_SIZE:void 0,maxPagesBefore:void 0,maxPagesAhead:void 0,disableLogs:!1,wvsQueryParameters:{},_trnDebugMode:!1,_logFiltersEnabled:null},g=function(a){return e[a]},m=function(b,d){var c;e[b]=d;null===(c=a[b])||void 0===c?void 0:c.forEach(function(a){a(d)})}},function(b,c,f){f.d(c,"b",function(){return a});f.d(c,"a",function(){return e});var a=function(a){if("string"===typeof a){for(var b=new Uint8Array(a.length),
c=a.length,d=0;d<c;d++)b[d]=a.charCodeAt(d);return b}return a},e=function(a){if("string"!==typeof a){for(var b="",c=0,d=a.length,e;c<d;)e=a.subarray(c,c+1024),c+=1024,b+=String.fromCharCode.apply(null,e);return b}return a}},function(b,c,f){function a(a,b,c){function d(l){f=f||Date.now();return l?(Object(g.a)("load","Try instantiateStreaming"),fetch(Object(m.a)(a)).then(function(a){return WebAssembly.instantiateStreaming(a,b)}).catch(function(b){Object(g.a)("load","instantiateStreaming Failed "+a+
" message "+b.message);return d(!1)})):Object(m.b)(a,c,!0,!0).then(function(a){e=Date.now();Object(g.a)("load","Request took "+(e-f)+" ms");return WebAssembly.instantiate(a,b)})}var e,f;return d(!!WebAssembly.instantiateStreaming).then(function(a){Object(g.a)("load","WASM compilation took "+(Date.now()-(e||f))+" ms");return a})}function e(a,b,c){return new Promise(function(d){if(!a)return d();var e=c.document.createElement("script");e.type="text/javascript";e.onload=function(){d()};e.onerror=function(){b&&
Object(g.c)(b);d()};e.src=a;c.document.getElementsByTagName("head")[0].appendChild(e)})}f.d(c,"a",function(){return a});f.d(c,"b",function(){return e});var g=f(0),m=f(1)},function(b,c,f){f.d(c,"c",function(){return u});f.d(c,"b",function(){return h});f.d(c,"a",function(){return t});f(0);var a="undefined"===typeof window?self:window;b=function(){var a=navigator.userAgent.toLowerCase();return(a=/(msie) ([\w.]+)/.exec(a)||/(trident)(?:.*? rv:([\w.]+)|)/.exec(a))?parseInt(a[2],10):a}();var e=function(){var b=
a.navigator.userAgent.match(/OPR/),c=a.navigator.userAgent.match(/Maxthon/),d=a.navigator.userAgent.match(/Edge/);return a.navigator.userAgent.match(/Chrome\/(.*?) /)&&!b&&!c&&!d}();(function(){if(!e)return null;var b=a.navigator.userAgent.match(/Chrome\/([0-9]+)\./);return b?parseInt(b[1],10):b})();var g=!!navigator.userAgent.match(/Edge/i)||navigator.userAgent.match(/Edg\/(.*?)/)&&a.navigator.userAgent.match(/Chrome\/(.*?) /);(function(){if(!g)return null;var b=a.navigator.userAgent.match(/Edg\/([0-9]+)\./);
return b?parseInt(b[1],10):b})();c=/iPad|iPhone|iPod/.test(a.navigator.platform)||"MacIntel"===navigator.platform&&1<navigator.maxTouchPoints;var m=function(){var b=a.navigator.userAgent.match(/.*\/([0-9\.]+)\s(Safari|Mobile).*/i);return b?parseFloat(b[1]):b}(),l=/^((?!chrome|android).)*safari/i.test(a.navigator.userAgent)||/^((?!chrome|android).)*$/.test(a.navigator.userAgent)&&c,d=a.navigator.userAgent.match(/Firefox/);(function(){if(!d)return null;var b=a.navigator.userAgent.match(/Firefox\/([0-9]+)\./);
return b?parseInt(b[1],10):b})();b||/Android|webOS|Touch|IEMobile|Silk/i.test(navigator.userAgent);navigator.userAgent.match(/(iPad|iPhone|iPod)/i);a.navigator.userAgent.indexOf("Android");var k=/Mac OS X 10_13_6.*\(KHTML, like Gecko\)$/.test(a.navigator.userAgent),v=a.navigator.userAgent.match(/(iPad|iPhone).+\sOS\s((\d+)(_\d)*)/i)?14<=parseInt(a.navigator.userAgent.match(/(iPad|iPhone).+\sOS\s((\d+)(_\d)*)/i)[3]):!1,u=function(){return!v&&(l&&14>m||k)},h=!(!self.WebAssembly||!self.WebAssembly.validate),
t=-1<a.navigator.userAgent.indexOf("Edge/16")||-1<a.navigator.userAgent.indexOf("MSAppHost")},function(b,c){c=function(){return this}();try{c=c||(new Function("return this"))()}catch(f){"object"===typeof window&&(c=window)}b.exports=c},function(b,c,f){function a(a,b,c,d){return new (c||(c=Promise))(function(e,f){function g(a){try{k(d.next(a))}catch(p){f(p)}}function l(a){try{k(d["throw"](a))}catch(p){f(p)}}function k(a){a.done?e(a.value):(new c(function(b){b(a.value)})).then(g,l)}k((d=d.apply(a,b||
[])).next())})}function e(a,b){function c(a){return function(b){return d([a,b])}}function d(c){if(f)throw new TypeError("Generator is already executing.");for(;e;)try{if(f=1,g&&(h=c[0]&2?g["return"]:c[0]?g["throw"]||((h=g["return"])&&h.call(g),0):g.next)&&!(h=h.call(g,c[1])).done)return h;if(g=0,h)c=[c[0]&2,h.value];switch(c[0]){case 0:case 1:h=c;break;case 4:return e.label++,{value:c[1],done:!1};case 5:e.label++;g=c[1];c=[0];continue;case 7:c=e.ops.pop();e.trys.pop();continue;default:if(!(h=e.trys,
h=0<h.length&&h[h.length-1])&&(6===c[0]||2===c[0])){e=0;continue}if(3===c[0]&&(!h||c[1]>h[0]&&c[1]<h[3]))e.label=c[1];else if(6===c[0]&&e.label<h[1])e.label=h[1],h=c;else if(h&&e.label<h[2])e.label=h[2],e.ops.push(c);else{h[2]&&e.ops.pop();e.trys.pop();continue}}c=b.call(a,e)}catch(p){c=[6,p],g=0}finally{f=h=0}if(c[0]&5)throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}var e={label:0,sent:function(){if(h[0]&1)throw h[1];return h[1]},trys:[],ops:[]},f,g,h,m;return m={next:c(0),"throw":c(1),"return":c(2)},
"function"===typeof Symbol&&(m[Symbol.iterator]=function(){return this}),m}f.d(c,"a",function(){return a});f.d(c,"b",function(){return e})},function(b,c,f){c.a=function(){ArrayBuffer.prototype.slice||(ArrayBuffer.prototype.slice=function(a,b){void 0===a&&(a=0);void 0===b&&(b=this.byteLength);a=Math.floor(a);b=Math.floor(b);0>a&&(a+=this.byteLength);0>b&&(b+=this.byteLength);a=Math.min(Math.max(0,a),this.byteLength);b=Math.min(Math.max(0,b),this.byteLength);if(0>=b-a)return new ArrayBuffer(0);var c=
new ArrayBuffer(b-a),e=new Uint8Array(c);a=new Uint8Array(this,a,b-a);e.set(a);return c})}},function(b,c,f){f.d(c,"a",function(){return a});f(10);var a=function(a,b){return function(){}}},function(b,c,f){c.a=function(a){var b={};decodeURIComponent(a.slice(1)).split("&").forEach(function(a){a=a.split("=",2);b[a[0]]=a[1]});return b}},function(b,c,f){f.d(c,"a",function(){return l});var a=f(1),e=f(4),g=f(5),m=function(){function a(a){var b=this;this.promise=a.then(function(a){b.response=a;b.status=200})}
a.prototype.addEventListener=function(a,b){this.promise.then(b)};return a}(),l=function(b,c,f){if(!g.b||g.a||Object(g.c)()||f){f=Object(a.b)((self.Module.asmjsPrefix?self.Module.asmjsPrefix:"")+b+".js.mem",c[".js.mem"],!1);var d=Object(a.c)((self.Module.memoryInitializerPrefixURL?self.Module.memoryInitializerPrefixURL:"")+b+".mem",c[".mem"],!0,!0);self.Module.memoryInitializerRequest=new m(d)}else self.Module.instantiateWasm=function(a,d){return Object(e.a)(b+"Wasm.wasm",a,c["Wasm.wasm"]).then(function(a){d(a.instance)})},
f=Object(a.b)(b+"Wasm.js.mem",c["Wasm.js.mem"],!1,!1);f=new Blob([f],{type:"application/javascript"});importScripts(URL.createObjectURL(f))}},function(b,c,f){b.exports=f(13)},function(b,c,f){f.r(c);f(14);f(19);b=f(8);f(20);Object(b.a)()},function(b,c,f){(function(a,b){function c(a){"@babel/helpers - typeof";c="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"===typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":
typeof a};return c(a)}(function(a){function e(){for(var a=0;a<C.length;a++)C[a][0](C[a][1]);C=[];G=!1}function d(a,b){C.push([a,b]);G||(G=!0,H(e,0))}function g(a,b){function c(a){h(b,a)}function d(a){r(b,a)}try{a(c,d)}catch(D){d(D)}}function m(a){var b=a.owner,c=b.state_;b=b.data_;var d=a[c];a=a.then;if("function"===typeof d){c=A;try{b=d(b)}catch(D){r(a,D)}}u(a,b)||(c===A&&h(a,b),c===E&&r(a,b))}function u(a,b){var d;try{if(a===b)throw new TypeError("A promises callback cannot return that same promise.");
if(b&&("function"===typeof b||"object"===c(b))){var e=b.then;if("function"===typeof e)return e.call(b,function(c){d||(d=!0,b!==c?h(a,c):t(a,c))},function(b){d||(d=!0,r(a,b))}),!0}}catch(D){return d||r(a,D),!0}return!1}function h(a,b){a!==b&&u(a,b)||t(a,b)}function t(a,b){a.state_===z&&(a.state_=B,a.data_=b,d(w,a))}function r(a,b){a.state_===z&&(a.state_=B,a.data_=b,d(y,a))}function p(a){var b=a.then_;a.then_=void 0;for(a=0;a<b.length;a++)m(b[a])}function w(a){a.state_=A;p(a)}function y(a){a.state_=
E;p(a)}function n(a){if("function"!==typeof a)throw new TypeError("Promise constructor takes a function argument");if(!(this instanceof n))throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");this.then_=[];g(a,this)}a.createPromiseCapability=function(){var a={};a.promise=new n(function(b,c){a.resolve=b;a.reject=c});return a};var q=a.Promise,x=q&&"resolve"in q&&"reject"in q&&"all"in q&&"race"in q&&function(){var a;
new q(function(b){a=b});return"function"===typeof a}();"undefined"!==typeof exports&&exports?(exports.Promise=x?q:n,exports.Polyfill=n):"function"===typeof define&&f(18)?define(function(){return x?q:n}):x||(a.Promise=n);var z="pending",B="sealed",A="fulfilled",E="rejected",F=function(){},H="undefined"!==typeof b?b:setTimeout,C=[],G;n.prototype={constructor:n,state_:z,then_:null,data_:void 0,then:function(a,b){a={owner:this,then:new this.constructor(F),fulfilled:a,rejected:b};this.state_===A||this.state_===
E?d(m,a):this.then_.push(a);return a.then},"catch":function(a){return this.then(null,a)}};n.all=function(a){if("[object Array]"!==Object.prototype.toString.call(a))throw new TypeError("You must pass an array to Promise.all().");return new this(function(b,c){function d(a){f++;return function(c){e[a]=c;--f||b(e)}}for(var e=[],f=0,g=0,l;g<a.length;g++)(l=a[g])&&"function"===typeof l.then?l.then(d(g),c):e[g]=l;f||b(e)})};n.race=function(a){if("[object Array]"!==Object.prototype.toString.call(a))throw new TypeError("You must pass an array to Promise.race().");
return new this(function(b,c){for(var d=0,e;d<a.length;d++)(e=a[d])&&"function"===typeof e.then?e.then(b,c):b(e)})};n.resolve=function(a){return a&&"object"===c(a)&&a.constructor===this?a:new this(function(b){b(a)})};n.reject=function(a){return new this(function(b,c){c(a)})}})("undefined"!==typeof window?window:"undefined"!==typeof a?a:"undefined"!==typeof self?self:void 0)}).call(this,f(6),f(15).setImmediate)},function(b,c,f){(function(a){function b(a,b){this._id=a;this._clearFn=b}var g="undefined"!==
typeof a&&a||"undefined"!==typeof self&&self||window,m=Function.prototype.apply;c.setTimeout=function(){return new b(m.call(setTimeout,g,arguments),clearTimeout)};c.setInterval=function(){return new b(m.call(setInterval,g,arguments),clearInterval)};c.clearTimeout=c.clearInterval=function(a){a&&a.close()};b.prototype.unref=b.prototype.ref=function(){};b.prototype.close=function(){this._clearFn.call(g,this._id)};c.enroll=function(a,b){clearTimeout(a._idleTimeoutId);a._idleTimeout=b};c.unenroll=function(a){clearTimeout(a._idleTimeoutId);
a._idleTimeout=-1};c._unrefActive=c.active=function(a){clearTimeout(a._idleTimeoutId);var b=a._idleTimeout;0<=b&&(a._idleTimeoutId=setTimeout(function(){a._onTimeout&&a._onTimeout()},b))};f(16);c.setImmediate="undefined"!==typeof self&&self.setImmediate||"undefined"!==typeof a&&a.setImmediate||this&&this.setImmediate;c.clearImmediate="undefined"!==typeof self&&self.clearImmediate||"undefined"!==typeof a&&a.clearImmediate||this&&this.clearImmediate}).call(this,f(6))},function(b,c,f){(function(a,b){(function(a,
c){function e(a){delete w[a]}function d(a){if(y)setTimeout(d,0,a);else{var b=w[a];if(b){y=!0;try{var f=b.callback,g=b.args;switch(g.length){case 0:f();break;case 1:f(g[0]);break;case 2:f(g[0],g[1]);break;case 3:f(g[0],g[1],g[2]);break;default:f.apply(c,g)}}finally{e(a),y=!1}}}}function f(){q=function(a){b.nextTick(function(){d(a)})}}function g(){if(a.postMessage&&!a.importScripts){var b=!0,c=a.onmessage;a.onmessage=function(){b=!1};a.postMessage("","*");a.onmessage=c;return b}}function m(){var b=
"setImmediate$"+Math.random()+"$",c=function(c){c.source===a&&"string"===typeof c.data&&0===c.data.indexOf(b)&&d(+c.data.slice(b.length))};a.addEventListener?a.addEventListener("message",c,!1):a.attachEvent("onmessage",c);q=function(c){a.postMessage(b+c,"*")}}function h(){var a=new MessageChannel;a.port1.onmessage=function(a){d(a.data)};q=function(b){a.port2.postMessage(b)}}function t(){var a=n.documentElement;q=function(b){var c=n.createElement("script");c.onreadystatechange=function(){d(b);c.onreadystatechange=
null;a.removeChild(c);c=null};a.appendChild(c)}}function r(){q=function(a){setTimeout(d,0,a)}}if(!a.setImmediate){var p=1,w={},y=!1,n=a.document,q,x=Object.getPrototypeOf&&Object.getPrototypeOf(a);x=x&&x.setTimeout?x:a;"[object process]"==={}.toString.call(a.process)?f():g()?m():a.MessageChannel?h():n&&"onreadystatechange"in n.createElement("script")?t():r();x.setImmediate=function(a){"function"!==typeof a&&(a=new Function(""+a));for(var b=Array(arguments.length-1),c=0;c<b.length;c++)b[c]=arguments[c+
1];w[p]={callback:a,args:b};q(p);return p++};x.clearImmediate=e}})("undefined"===typeof self?"undefined"===typeof a?this:a:self)}).call(this,f(6),f(17))},function(b,c){function f(){throw Error("setTimeout has not been defined");}function a(){throw Error("clearTimeout has not been defined");}function e(a){if(v===setTimeout)return setTimeout(a,0);if((v===f||!v)&&setTimeout)return v=setTimeout,setTimeout(a,0);try{return v(a,0)}catch(y){try{return v.call(null,a,0)}catch(n){return v.call(this,a,0)}}}function g(b){if(u===
clearTimeout)return clearTimeout(b);if((u===a||!u)&&clearTimeout)return u=clearTimeout,clearTimeout(b);try{return u(b)}catch(y){try{return u.call(null,b)}catch(n){return u.call(this,b)}}}function m(){t&&r&&(t=!1,r.length?h=r.concat(h):p=-1,h.length&&l())}function l(){if(!t){var a=e(m);t=!0;for(var b=h.length;b;){r=h;for(h=[];++p<b;)r&&r[p].run();p=-1;b=h.length}r=null;t=!1;g(a)}}function d(a,b){this.fun=a;this.array=b}function k(){}b=b.exports={};try{var v="function"===typeof setTimeout?setTimeout:
f}catch(w){v=f}try{var u="function"===typeof clearTimeout?clearTimeout:a}catch(w){u=a}var h=[],t=!1,r,p=-1;b.nextTick=function(a){var b=Array(arguments.length-1);if(1<arguments.length)for(var c=1;c<arguments.length;c++)b[c-1]=arguments[c];h.push(new d(a,b));1!==h.length||t||e(l)};d.prototype.run=function(){this.fun.apply(null,this.array)};b.title="browser";b.browser=!0;b.env={};b.argv=[];b.version="";b.versions={};b.on=k;b.addListener=k;b.once=k;b.off=k;b.removeListener=k;b.removeAllListeners=k;b.emit=
k;b.prependListener=k;b.prependOnceListener=k;b.listeners=function(a){return[]};b.binding=function(a){throw Error("process.binding is not supported");};b.cwd=function(){return"/"};b.chdir=function(a){throw Error("process.chdir is not supported");};b.umask=function(){return 0}},function(b,c){b.exports={}},function(b,c,f){(function(a){"undefined"===typeof a.crypto&&(a.crypto={getRandomValues:function(a){for(var b=0;b<a.length;b++)a[b]=256*Math.random()}})})("undefined"===typeof window?self:window)},
function(b,c,f){function a(b){"@babel/helpers - typeof";a="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"===typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a};return a(b)}var e=f(9),g=f(11),m=null;(function(b){function c(){h=function(){}}function f(b){var c=[];return{resource_array:c,msg:JSON.stringify(b.data,function(b,d){if("object"===a(d)&&(b=null,d instanceof Uint8Array?b=d:d instanceof ArrayBuffer&&
(b=new Uint8Array(d)),b)){d=r(b.length);var e=p(d);e&&(new Uint8Array(Module.HEAPU8.buffer,e,b.length)).set(b);c.push(d);return{__trn_res_id:d}}return d})}}function l(){w=!0;postMessage({type:"abort",data:{error:"Office worker has terminated unexpectedly"}})}function u(a){if(!w)try{var b=f(a);t(b.msg)}catch(F){l(F)}}var h,t,r,p,w=!1;b.basePath="../";var y=b.officeWorkerPath||"";b.workerBasePath&&(b.basePath=b.workerBasePath);var n=function(a){var b={};decodeURIComponent(a.slice(1)).split("&").forEach(function(a){a=
a.split("=",2);b[a[0]]=a[1]});return b}(b.location.search);b.basePath=n.externalPath?n.externalPath:b.basePath+"external/";importScripts("".concat(b.basePath,"Promise.js"));var q=[];onmessage=function(a){q||(q=[]);q.push(a)};b.ContinueFunc=function(a){h("ContinueFunc called");setTimeout(function(){onmessage({data:{action:"continue"}})},a)};if(n.pdfWorkerPath)var x=n.pdfWorkerPath;if(n.officeAsmPath)var z=n.officeAsmPath;var B="0"===n.wasm;b.Module={memoryInitializerPrefixURL:x,asmjsPrefix:z,onRuntimeInitialized:function(){h||
c();var a=Date.now()-m;Object(e.a)("load","time duration from start to ready: ".concat(JSON.stringify(a)));t=function(a){if(null!==a&&void 0!==a&&0!==a&&!w){var b=(a.length<<2)+1,c=Module._malloc(b);0<stringToUTF8(a,c,b)&&Module._TRN_OnMessage(c)}};r=function(a){return Module._TRN_CreateBufferResource(a)};p=function(a){return Module._TRN_GetResourcePointer(a)};h("OnReady called");onmessage=u;Module._TRN_InitWorker();for(a=0;a<q.length;++a)onmessage(q[a]);q=null},fetchSelf:function(){m=Date.now();
Object(g.a)("".concat(y,"WebOfficeWorker"),{"Wasm.wasm":5E6,"Wasm.js.mem":1E5,".js.mem":5E6,".mem":3E6},!!navigator.userAgent.match(/Edge/i)||B)},onAbort:l,noExitRuntime:!0};b.Module.fetchSelf()})("undefined"===typeof window?self:window)}]);}).call(this || window)
