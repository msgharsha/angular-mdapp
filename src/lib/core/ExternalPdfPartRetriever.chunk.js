/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[7],{365:function(ha,da,f){f.r(da);var aa=f(4);ha=f(43);var x=f(137),fa=f(312),ca=f(187),ba=window;f=function(){function f(f,n){this.yQ=function(f){f=f.split(".");return f[f.length-1].match(/(jpg|jpeg|png|gif)$/i)};n=n||{};this.url=f;this.filename=n.filename||f;this.pf=n.customHeaders;this.qea=!!n.useDownloader;this.withCredentials=!!n.withCredentials}f.prototype.HB=function(f){this.pf=f};f.prototype.getFileData=function(r){var n=
this,h=this,e=new XMLHttpRequest,w=0===this.url.indexOf("blob:")?"blob":"arraybuffer";e.open("GET",this.url,!0);e.withCredentials=this.withCredentials;e.responseType=w;this.pf&&Object.keys(this.pf).forEach(function(f){e.setRequestHeader(f,n.pf[f])});var y=/^https?:/i.test(this.url);e.addEventListener("load",function(e){return Object(aa.b)(this,void 0,void 0,function(){var n,w,z,ba,da,fa;return Object(aa.d)(this,function(aa){switch(aa.label){case 0:if(200!==this.status&&(y||0!==this.status))return[3,
10];h.trigger(f.Events.DOCUMENT_LOADING_PROGRESS,[e.loaded,e.loaded]);if("blob"!==this.responseType)return[3,4];n=this.response;return h.yQ(h.filename)?[4,Object(ca.b)(n)]:[3,2];case 1:return w=aa.na(),h.fileSize=w.byteLength,r(new Uint8Array(w)),[3,3];case 2:z=new FileReader,z.onload=function(e){e=new Uint8Array(e.target.result);h.fileSize=e.length;r(e)},z.readAsArrayBuffer(n),aa.label=3;case 3:return[3,9];case 4:aa.wl.push([4,8,,9]);ba=new Uint8Array(this.response);if(!h.yQ(h.filename))return[3,
6];n=new Blob([ba.buffer]);return[4,Object(ca.b)(n)];case 5:return w=aa.na(),h.fileSize=w.byteLength,r(new Uint8Array(w)),[3,7];case 6:h.fileSize=ba.length,r(ba),aa.label=7;case 7:return[3,9];case 8:return aa.na(),h.trigger(f.Events.ERROR,["pdfLoad","Out of memory"]),[3,9];case 9:return[3,11];case 10:da=e.currentTarget,fa=Object(x.b)(da),h.trigger(f.Events.ERROR,["pdfLoad",this.status+" "+da.statusText,fa]),aa.label=11;case 11:return h.Hw=null,[2]}})})},!1);e.onprogress=function(e){h.trigger(f.Events.DOCUMENT_LOADING_PROGRESS,
[e.loaded,0<e.total?e.total:0])};e.addEventListener("error",function(){h.trigger(f.Events.ERROR,["pdfLoad","Network failure"]);h.Hw=null},!1);e.send();this.Hw=e};f.prototype.getFile=function(){var f=this;return new Promise(function(n){ba.utils.isJSWorker&&n(f.url);if(f.qea){var h=Object(aa.a)({url:f.url},f.pf?{customHeaders:f.pf}:{});n(h)}n(null)})};f.prototype.abort=function(){this.Hw&&(this.Hw.abort(),this.Hw=null)};f.Events={DOCUMENT_LOADING_PROGRESS:"documentLoadingProgress",ERROR:"error"};return f}();
Object(ha.a)(f);Object(fa.a)(f);Object(fa.b)(f);da["default"]=f}}]);}).call(this || window)
