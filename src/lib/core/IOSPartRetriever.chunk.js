/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[8],{366:function(ha,da,f){f.r(da);var aa=f(4),x=f(200);ha=f(359);var fa=f(31);f=f(312);var ca={},ba=function(f){function r(n,h){var e=f.call(this,n,h)||this;e.url=n;e.range=h;e.status=x.a.NOT_STARTED;return e}Object(aa.c)(r,f);r.prototype.start=function(f){var h=this;ca[this.range.start]={ws:function(e){var n=atob(e),r,w=n.length;e=new Uint8Array(w);for(r=0;r<w;++r)e[r]=n.charCodeAt(r);n=e.length;r="";var x=0;if(Object(fa.p)())for(;x<
n;)w=e.subarray(x,x+1024),x+=1024,r+=String.fromCharCode.apply(null,w);else for(w=Array(1024);x<n;){for(var y=0,ba=Math.min(x+1024,n);x<ba;y++,x++)w[y]=e[x];r+=String.fromCharCode.apply(null,1024>y?w.slice(0,y):w)}h.ws(r,f)},sO:function(){h.status=x.a.ERROR;f({code:h.status})}};var e=document.createElement("IFRAME");e.setAttribute("src",this.url);document.documentElement.appendChild(e);e.parentNode.removeChild(e);e=null;this.status=x.a.STARTED;h.Lz()};return r}(ha.ByteRangeRequest);ha=function(f){function r(n,
h,e,r){n=f.call(this,n,h,e,r)||this;n.Mv=ba;return n}Object(aa.c)(r,f);r.prototype.Wt=function(f,h){return f+"#"+h.start+"&"+(h.stop?h.stop:"")};r.Lha=function(f,h){var e=ca[h];delete ca[h];e.ws(f)};r.Kha=function(f,h){f=ca[h];delete ca[h];f.sO()};return r}(ha["default"]);Object(f.a)(ha);Object(f.b)(ha);da["default"]=ha}}]);}).call(this || window)
