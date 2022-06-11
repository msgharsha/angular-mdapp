/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[13],{367:function(ha,da,f){f.r(da);var aa=f(4),x=f(0);f.n(x);var fa=f(1),ca=f(124);ha=f(43);var ba=f(79),y=f(201),r=f(56),n=f(200);f=f(312);var h=window,e=function(){function e(e,h,f){var w=-1===e.indexOf("?")?"?":"&";switch(h){case r.a.NEVER_CACHE:this.url=e+w+"_="+Object(x.uniqueId)();break;default:this.url=e}this.pf=f;this.request=new XMLHttpRequest;this.request.open("GET",this.url,!0);this.request.setRequestHeader("X-Requested-With",
"XMLHttpRequest");this.request.overrideMimeType?this.request.overrideMimeType("text/plain; charset=x-user-defined"):this.request.setRequestHeader("Accept-Charset","x-user-defined");this.status=n.a.NOT_STARTED}e.prototype.start=function(h,f){var r=this,w=this,x=this.request,y;w.fv=0;h&&Object.keys(h).forEach(function(e){r.request.setRequestHeader(e,h[e])});f&&(this.request.withCredentials=f);this.hB=setInterval(function(){var h=0===window.document.URL.indexOf("file:///");h=200===x.status||h&&0===x.status;
if(x.readyState!==n.b.DONE||h){try{x.responseText}catch(ta){return}w.fv<x.responseText.length&&(y=w.v$())&&w.trigger(e.Events.DATA,[y]);0===x.readyState&&(clearInterval(w.hB),w.trigger(e.Events.DONE))}else clearInterval(w.hB),w.trigger(e.Events.DONE,["Error received return status "+x.status])},1E3);this.request.send(null);this.status=n.a.STARTED};e.prototype.v$=function(){var f=this.request,n=f.responseText;if(0!==n.length)if(this.fv===n.length)clearInterval(this.hB),this.trigger(e.Events.DONE);else return n=
Math.min(this.fv+3E6,n.length),f=h.sP(f,this.fv,!0,n),this.fv=n,f};e.prototype.abort=function(){clearInterval(this.hB);var h=this;this.request.onreadystatechange=function(){Object(fa.i)("StreamingRequest aborted");h.status=n.a.ABORTED;return h.trigger(e.Events.ABORTED)};this.request.abort()};e.prototype.finish=function(){var h=this;this.request.onreadystatechange=function(){h.status=n.a.SUCCESS;return h.trigger(e.Events.DONE)};this.request.abort()};e.Events={DONE:"done",DATA:"data",ABORTED:"aborted"};
return e}();Object(ha.a)(e);var w;(function(e){e[e.LOCAL_HEADER=0]="LOCAL_HEADER";e[e.FILE=1]="FILE";e[e.CENTRAL_DIR=2]="CENTRAL_DIR"})(w||(w={}));var z=function(e){function h(){var h=e.call(this)||this;h.buffer="";h.state=w.LOCAL_HEADER;h.hJ=4;h.Xk=null;h.Gr=ca.c;h.vm={};return h}Object(aa.c)(h,e);h.prototype.p$=function(e){var f;for(e=this.buffer+e;e.length>=this.Gr;)switch(this.state){case w.LOCAL_HEADER:this.Xk=f=this.z$(e.slice(0,this.Gr));if(f.os!==ca.g)throw Error("Wrong signature in local header: "+
f.os);e=e.slice(this.Gr);this.state=w.FILE;this.Gr=f.kE+f.fp+f.mu+this.hJ;this.trigger(h.Events.HEADER,[f]);break;case w.FILE:this.Xk.name=e.slice(0,this.Xk.fp);this.vm[this.Xk.name]=this.Xk;f=this.Gr-this.hJ;var n=e.slice(this.Xk.fp+this.Xk.mu,f);this.trigger(h.Events.FILE,[this.Xk.name,n,this.Xk.AE]);e=e.slice(f);if(e.slice(0,this.hJ)===ca.h)this.state=w.LOCAL_HEADER,this.Gr=ca.c;else return this.state=w.CENTRAL_DIR,!0}this.buffer=e;return!1};h.Events={HEADER:"header",FILE:"file"};return h}(y.a);
Object(ha.a)(z);ha=function(h){function f(f,n,r,w,x){r=h.call(this,f,r,w)||this;r.url=f;r.stream=new e(f,n);r.Nd=new z;r.aS=window.createPromiseCapability();r.xS={};r.pf=x;return r}Object(aa.c)(f,h);f.prototype.Tv=function(h){var f=this;this.request([this.Ji,this.Uj,this.Ii]);this.stream.addEventListener(e.Events.DATA,function(e){try{if(f.Nd.p$(e))return f.stream.finish()}catch(oa){throw f.stream.abort(),f.ju(oa),h(oa),oa;}});this.stream.addEventListener(e.Events.DONE,function(e){f.W9=!0;f.aS.resolve();
e&&(f.ju(e),h(e))});this.Nd.addEventListener(z.Events.HEADER,Object(x.bind)(this.wS,this));this.Nd.addEventListener(z.Events.FILE,Object(x.bind)(this.P$,this));return this.stream.start(this.pf,this.withCredentials)};f.prototype.pP=function(e){var h=this;this.aS.promise.then(function(){e(Object.keys(h.Nd.vm))})};f.prototype.Ym=function(){return!0};f.prototype.request=function(e){var h=this;this.W9&&e.forEach(function(e){h.xS[e]||h.Uda(e)})};f.prototype.wS=function(){};f.prototype.abort=function(){this.stream&&
this.stream.abort()};f.prototype.Uda=function(e){this.trigger(ba.a.Events.PART_READY,[{bb:e,error:"Requested part not found",Qh:!1,Lf:!1}])};f.prototype.P$=function(e,h,f){this.xS[e]=!0;this.trigger(ba.a.Events.PART_READY,[{bb:e,data:h,Qh:!1,Lf:!1,error:null,bd:f}])};return f}(ba.a);Object(f.a)(ha);Object(f.b)(ha);da["default"]=ha}}]);}).call(this || window)
