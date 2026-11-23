(function(){
"use strict";
/* ================= things you may want to edit ================= */
var DEMO = "https://flicks-jiohotstar-demo-aifr.vercel.app/";   // the live JioHotstar demo
var DEMO_SLOTS = 25;                                             // placements in the demo (big number on the demo slide)
// Run sheet on the demo slide: one group per gap. Each item opens that screen of the demo.
var FLOWS = [
  ["Commerce", [["Pre-roll with companion","#/watch/heartbeat"],["Shop the look in the player","#/watch/heartbeat"],["Shop the look on Home","#/home"]]],
  ["Limited ad slots", [["Pause ad","#/watch/heartbeat"],["Masthead and billboards","#/home"],["Sponsored search","#/search/cricket"]]],
  ["Video insights", [["Flick inside a micro-drama","#/reel/blankcheque"],["Shop the look in Tadka","#/reel/redsilk"]]],
  ["New advertisers", [["Sponsored video in Tadka","#/tadka"],["Movies and Sports banners","#/movies"]]]
];
// Saved Flicks (flicks-ad-tags). id = flam-embed code, tag = ad tag script, r = width / height.
var FLICKS = {
  can:   {id:"n0489i", r:1},
  levis: {id:"dox37k", r:1},
  lips:  {id:"onflg2", r:1},
  chair: {id:"c5htms", r:1},
  neck:  {id:"ikutv6", r:9/16},
  merc:  {tag:"https://native-ads.appless.workers.dev/6a9bc07393e71f3ec9b12c81_i3pdeq/ad.js", r:1},
  sony:  {tag:"https://native-ads-dev.appless.workers.dev/6a96c6969e74536944c4167f_dj5rq6/ad.js", r:1},
  cayman:{tag:"https://native-ads.appless.workers.dev/6aa776159846b99b24d49ce4_m1ugyq/ad.js", r:1, muteTop:true}   // Cayman Islands, tag as used in flicks-social-apps
  ,amex: {tag:"https://native-ads-dev.appless.workers.dev/f41m4u/ad.js", r:1, muteTop:true,     // American Express, from flicks-ad-tags
          pre:'<script>window.AD_CONFIG=window.AD_CONFIG||{};window.AD_CONFIG.dsp="house";window.AD_CONFIG.clickTracker={"mode":"exit","template":""};<\/script>\n'}
};
// Advertiser categories on slide 5. flick = key above; without one the tile shows what would swap.
var CATS = [
  {k:"retail", t:"Retail",            d:"Apparel, shoes, watches, eyewear", ic:"bag",   flick:"levis", cap:"Outfit swap"},
  {k:"beauty", t:"Beauty",            d:"Shades, finishes, looks",          ic:"drop",  flick:"lips",  cap:"Lip shade swap"},
  {k:"fmcg",   t:"FMCG",              d:"Flavours, packs, variants",        ic:"can",   flick:"can",   cap:"Can swap"},
  {k:"auto",   t:"Auto",              d:"Models, trims, paint",             ic:"car",   flick:"merc",  cap:"Car swap"},
  {k:"home",   t:"Furniture",         d:"Fabrics, finishes, rooms",         ic:"sofa",  flick:"chair", cap:"Chair swap"},
  {k:"dur",    t:"Consumer durables", d:"Phones, audio, appliances",        ic:"phone", flick:"sony",  cap:"Product swap"},
  {k:"travel", t:"Travel",            d:"Destinations, stays, moments",     ic:"plane", flick:"cayman", cap:"Cayman Islands"},
  {k:"bfsi",   t:"BFSI",              d:"Cards, insurance, plans",          ic:"card",  flick:"amex",  cap:"American Express"}
];
var START_CAT = "home";
// Revenue example (slide 7). Every value is editable on the slide.
var MATH = {
  views:100,                                   // episode views in the month, lakh
  today:[["Pre-roll",1,400],["Mid-roll",2,400],["L-band",1,150],["Banner",1,80]],   // slot, per view, CPM
  share:25, addon:80,                          // % of pre-roll and mid-roll sold as Flicks, add-on per 1,000
  stl:0.3, stlcpm:300,                         // shop the look moments per view, CPM
  swap:8, swapfee:1, click:1, cpc:5,           // % who swap, fee per swap, % who click, fee per click
  tierOn:false, tier:25                        // commerce partner tier, lakh a month
};
/* =============================================================== */

var $ = function(q,r){return (r||document).querySelector(q)}, $$ = function(q,r){return Array.prototype.slice.call((r||document).querySelectorAll(q))};
var slides = $$(".s"), N = slides.length, cur = -1, token = 0;
var PU = (function(){ try{ return /^https?:/.test(location.protocol) ? (location.origin+location.pathname).slice(0,2048) : "https://flamapp.ai/"; }catch(e){ return "https://flamapp.ai/"; } })();

var IC = {
  bag:'<path d="M6 8h12l-1 12H7L6 8zM9 8a3 3 0 016 0"/>', drop:'<path d="M12 3c3.5 4.2 6 7.2 6 10.5a6 6 0 01-12 0C6 10.2 8.5 7.2 12 3z"/>',
  can:'<path d="M8 4h8l1 3v10l-1 3H8l-1-3V7l1-3zM7 9h10M7 15h10"/>', car:'<path d="M4 16v-3l2-5h12l2 5v3M4 16h16M4 16v2M20 16v2M7 13h.01M17 13h.01"/>',
  sofa:'<path d="M5 12V8a2 2 0 012-2h10a2 2 0 012 2v4M3 12a2 2 0 014 0v3h10v-3a2 2 0 014 0v5H3v-5zM6 17v2M18 17v2"/>',
  phone:'<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>', plane:'<path d="M3 13l18-8-6 16-3-7-9-1z"/>',
  tower:'<path d="M6 21V5l7-2v18M13 9l5 2v10M4 21h16M9 8v.01M9 12v.01M9 16v.01"/>', card:'<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  app:'<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
  play:'<path d="M8 5l11 7-11 7V5z"/>'
};
function ic(n,s){ return '<svg width="'+(s||22)+'" height="'+(s||22)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+IC[n]+'</svg>'; }

/* ---------- live Flicks: only ever mounted on the slide in view ---------- */
var blobs = {};
// The Flick's own sound button sits bottom-right, over the third option on some Flicks. muteTop moves it to the top-right.
var MUTE_TOP = '<script>(function(){var n=0,t=setInterval(function(){try{var p=document.querySelector("vertex-player"),r=p&&p.shadowRoot;if(r&&!r.querySelector("style[data-deck]")){var s=document.createElement("style");s.setAttribute("data-deck","");s.textContent="#vp-container>button[style*=\\"bottom: 12px\\"]{bottom:auto!important;top:12px!important}";r.appendChild(s);clearInterval(t)}}catch(e){}if(++n>240)clearInterval(t)},250)})();<\/script>\n';
function flickSrc(f){
  if(f.id) return "https://flicks.flamapp.live/"+f.id+"/?embed=1&u="+encodeURIComponent(PU);
  if(!blobs[f.tag]){
    var html = '<!doctype html>\n<meta charset=utf-8>\n<meta name=ad.orientation content=portrait,landscape>\n<style>html,body{margin:0;width:100%;height:100%;background:#000;overflow:hidden}</style>\n<script>var ExitApi=window.ExitApi||{exit:function(){}},clickTag="${CLICK_URL_UNESC}";<\/script>\n'+(f.pre||'')+(f.muteTop?MUTE_TOP:'')+'<script src='+f.tag+'><\/script>';
    try{ blobs[f.tag] = URL.createObjectURL(new Blob([html],{type:"text/html"})); }catch(e){ blobs[f.tag] = "about:blank"; }
  }
  return blobs[f.tag];
}
function mountFlick(el,key){
  unmount(el); var f = FLICKS[key]; if(!f) return;
  var fr = document.createElement("iframe");
  fr.title = "Flick"; fr.allow = "autoplay; fullscreen; encrypted-media"; fr.src = flickSrc(f);
  el.appendChild(fr);
}
function unmount(el){ $$("iframe",el).forEach(function(f){ try{ f.src = "about:blank"; }catch(e){} f.remove(); }); }
function silence(sl){ $$(".fk",sl).forEach(unmount); }   // removing the frame is the only sure mute for a cross-site Flick

/* ---------- slide 5: categories ---------- */
var catKey = START_CAT;
function buildCats(){
  $("#cats").innerHTML = CATS.map(function(c){
    return '<button class="cat" data-k="'+c.k+'">'+ic(c.ic)+'<em><svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5l12 7-12 7V5z"/></svg></em><b>'+c.t+'</b><span>'+c.d+'</span></button>';
  }).join("");
  $$("#cats .cat").forEach(function(b){ b.addEventListener("click",function(){ catKey = b.dataset.k; showCat(true); }); });
}
function showCat(live){
  var c = CATS.filter(function(x){return x.k===catKey})[0], box = $("#catFk");
  $$("#cats .cat").forEach(function(b){ b.classList.toggle("cur", b.dataset.k===catKey); });
  unmount(box); var old = $(".idea",box); if(old) old.remove();
  if(c.flick){ $("#catCap").innerHTML = '<i>Now playing</i>'+c.t+' · '+c.cap; if(live) mountFlick(box,c.flick); }
  else { var d = document.createElement("div"); d.className = "idea"; d.innerHTML = '<small>'+c.t+' · to build</small><b>'+c.idea[0]+'</b><span>'+c.idea[1]+'</span>'; box.appendChild(d); $("#catCap").textContent = c.t+" · Flick to build"; }
}

/* ---------- slide 6: demo ---------- */
var demoFr = null, demoHash = "", ro = null;
function buildRun(){
  var n = 0;
  $("#run").innerHTML = FLOWS.map(function(g,gi){
    return '<div><h5><span>0'+(gi+1)+'</span>'+g[0]+'</h5>'+g[1].map(function(it){ n++; return '<button data-h="'+it[1]+'" data-n="'+n+'">'+ic("play",13)+it[0]+'</button>'; }).join("")+'</div>';
  }).join("");
  $$("#run button").forEach(function(b){ b.addEventListener("click",function(){
    $$("#run button").forEach(function(x){ x.classList.toggle("cur", x===b); });
    demoHash = b.dataset.h; if(!demoFr) mountDemo(); else demoFr.src = DEMO + demoHash;
  }); });
  $("#demoNew").href = DEMO; $(".dside .big").textContent = DEMO_SLOTS;
}
function fitDemo(){ var p = $("#pscr"); if(!demoFr || !p.clientWidth) return; var k = p.clientWidth/390; demoFr.style.transform = "scale("+k+")"; demoFr.style.height = Math.ceil(p.clientHeight/k)+"px"; }
function mountDemo(){
  dropDemo(); var p = $("#pscr");
  demoFr = document.createElement("iframe"); demoFr.title = "JioHotstar demo"; demoFr.allow = "autoplay; fullscreen; encrypted-media";
  demoFr.src = DEMO + demoHash; p.appendChild(demoFr); fitDemo();
  if(!ro && window.ResizeObserver){ ro = new ResizeObserver(fitDemo); ro.observe(p); }
}
function dropDemo(){ if(demoFr){ try{ demoFr.src = "about:blank"; }catch(e){} demoFr.remove(); demoFr = null; } }
var fullFr = null;
function openFull(){ dropDemo(); fullFr = document.createElement("iframe"); fullFr.title = "JioHotstar demo"; fullFr.allow = "autoplay; fullscreen; encrypted-media"; fullFr.src = DEMO + demoHash; $("#full").appendChild(fullFr); $("#full").classList.add("on"); }
function closeFull(){ if(!fullFr) return; try{ fullFr.src = "about:blank"; }catch(e){} fullFr.remove(); fullFr = null; $("#full").classList.remove("on"); if(cur===5) mountDemo(); }

/* ---------- slide 7: revenue example ---------- */
var M = JSON.parse(JSON.stringify(MATH)), firstMath = true;
function money(v){ var a = Math.abs(v); if(a>=1e7) return "₹"+(Math.round(a/1e5)/100).toLocaleString("en-IN")+" Cr"; if(a>=1e5) return "₹"+(Math.round(a/1e3)/100).toLocaleString("en-IN")+" lakh"; return "₹"+Math.round(a).toLocaleString("en-IN"); }
function nb(path,val,step,unit){ return '<input class="nb" type="number" min="0" step="'+(step||1)+'" data-p="'+path+'" value="'+val+'"><span class="u">'+(unit||'')+'</span>'; }
function compute(){
  var V = M.views*1e5, today = M.today.map(function(r){ return V*r[1]/1000*r[2]; }), T = today.reduce(function(a,b){return a+b},0);
  var vid = V*(M.today[0][1]+M.today[1][1]), fImp = vid*M.share/100, A = fImp/1000*M.addon;
  var sImp = V*M.stl, B = sImp/1000*M.stlcpm;
  var per1000 = M.swap/100*1000*M.swapfee + M.click/100*1000*M.cpc, C = (fImp+sImp)/1000*per1000;
  var D = M.tierOn ? M.tier*1e5 : 0;
  return {today:today, T:T, add:[A,B,C,D], W:T+A+B+C+D, per1000:per1000};
}
function buildMath(){
  var h = '<tr class="g"><td colspan="4">Sold today</td></tr>';
  M.today.forEach(function(r,i){ h += '<tr><td>'+r[0]+'</td><td>'+nb("today."+i+".1",r[1],0.1)+'</td><td>'+nb("today."+i+".2",r[2],10,"₹")+'</td><td id="mt'+i+'"></td></tr>'; });
  h += '<tr class="t"><td colspan="3">Today</td><td id="mT"></td></tr>';
  h += '<tr class="g fx"><td colspan="4">Added with Flicks</td></tr>';
  h += '<tr class="f"><td>Interactive breaks<small>share of pre-roll and mid-roll, add-on per 1,000</small></td><td>'+nb("share",M.share,1,"%")+'</td><td>'+nb("addon",M.addon,5,"₹")+'</td><td id="ma0"></td></tr>';
  h += '<tr class="f"><td>Shop the look<small>new slot: moments per view, CPM</small></td><td>'+nb("stl",M.stl,0.1)+'</td><td>'+nb("stlcpm",M.stlcpm,10,"₹")+'</td><td id="ma1"></td></tr>';
  h += '<tr class="f"><td>Swaps and clicks<small>% who swap at ₹'+M.swapfee+', % who click at ₹'+M.cpc+'</small></td><td>'+nb("swap",M.swap,0.5,"%")+'</td><td>'+nb("click",M.click,0.1,"%")+'</td><td id="ma2"></td></tr>';
  h += '<tr class="f" id="tierRow"><td><label class="sw"><input type="checkbox" id="tierOn"'+(M.tierOn?" checked":"")+'><i></i>Commerce partner tier</label></td><td></td><td>'+nb("tier",M.tier,5,"lakh")+'</td><td id="ma3"></td></tr>';
  $("#mrows").innerHTML = h;
  $("#r-views").value = M.views; $("#n-views").value = M.views;
  $$("#mrows .nb").forEach(function(inp){ inp.addEventListener("input",function(){
    var v = parseFloat(inp.value); if(!isFinite(v) || v<0) return;
    var p = inp.dataset.p.split("."); if(p.length===3) M[p[0]][+p[1]][+p[2]] = v; else M[p[0]] = v; paint();
  }); });
  $("#tierOn").addEventListener("change",function(e){ M.tierOn = e.target.checked; paint(); });
}
var ixNow = 100, ixRaf = 0;
function tween(to){ cancelAnimationFrame(ixRaf); var from = ixNow, t0 = performance.now(), el = $("#ixz");
  (function step(t){ var k = Math.min(1,(t-t0)/700), e = 1-Math.pow(1-k,3); ixNow = from+(to-from)*e; el.textContent = Math.round(ixNow); if(k<1) ixRaf = requestAnimationFrame(step); })(t0); }
function paint(){
  var c = compute();
  c.today.forEach(function(v,i){ $("#mt"+i).textContent = money(v); });
  $("#mT").textContent = money(c.T);
  c.add.forEach(function(v,i){ $("#ma"+i).textContent = (i===3 && !M.tierOn) ? "off" : "+"+money(v); });
  $("#tierRow").classList.toggle("off", !M.tierOn);
  var idx = c.T>0 ? c.W/c.T*100 : 100;
  $("#ixx").innerHTML = c.T>0 ? 'The show earns <b style="color:var(--tx);font-weight:600">'+money(c.W-c.T)+'</b> more in the month, <b style="color:var(--acc);font-weight:600">'+(Math.round((idx-100)*10)/10)+'%</b> on top.' : "Enter today's slots to see the index.";
  var seg = function(vals,cls){ return vals.map(function(v){ return '<i class="'+cls+'" style="width:'+(c.W>0?v/c.W*100:0)+'%"></i>'; }).join(""); };
  $("#stk0").innerHTML = seg(c.today,"o"); $("#stk1").innerHTML = seg(c.today,"o")+seg(c.add,"n");
  $("#tot0").textContent = money(c.T); $("#tot1").textContent = money(c.W);
  if(cur===7) tween(idx); else { ixNow = 100; $("#ixz").textContent = "100"; }
  return idx;
}
function wireMath(){
  buildMath();
  var sync = function(v){ if(!isFinite(v) || v<=0) return; M.views = v; paint(); };
  $("#r-views").addEventListener("input",function(e){ $("#n-views").value = e.target.value; sync(+e.target.value); });
  $("#n-views").addEventListener("input",function(e){ var v = parseFloat(e.target.value); if(isFinite(v)) $("#r-views").value = v; sync(v); });
  $("#mreset").addEventListener("click",function(){ M = JSON.parse(JSON.stringify(MATH)); buildMath(); paint(); });
  paint();
}

/* ---------- hook: rotating words ---------- */
var rotI = 0, rotT = 0;
function rotStart(){ clearInterval(rotT); var el = $("#rot"); rotI = 0; el.style.transition = "none"; el.style.transform = "translateY(0)";
  rotT = setInterval(function(){ rotI++; el.style.transition = ""; el.style.transform = "translateY(-"+(rotI*1.16)+"em)";
    if(rotI===3) setTimeout(function(){ el.style.transition = "none"; el.style.transform = "translateY(0)"; rotI = 0; },800); },2600); }

/* ---------- navigation ---------- */
function enter(i){
  var my = ++token, sl = slides[i];
  setTimeout(function(){ if(my!==token || document.hidden) return;
    $$(".fk[data-flick]",sl).forEach(function(el){ mountFlick(el, el.dataset.flick); });
    if(i===4) showCat(true);
    if(i===5 && !fullFr) mountDemo();
  }, 420);
  if(i===0) rotStart(); else clearInterval(rotT);
  if(i===4) showCat(false);                       // preload nothing, but keep the tile state right
  if(i===7){ ixNow = 100; $("#ixz").textContent = "100"; setTimeout(function(){ if(cur===7) paint(); },650); }
}
function leave(i){ if(i<0) return; silence(slides[i]); if(i===5){ dropDemo(); } }
function go(n,first){
  n = Math.max(0,Math.min(N-1,n)); if(n===cur) return;
  var old = cur; cur = n; leave(old);
  slides.forEach(function(s,i){ s.classList.toggle("on", i===n); if(i!==n) s.classList.remove("go"); });
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ slides[n].classList.add("go"); }); });
  $("#counter").textContent = ("0"+(n+1)).slice(-2)+" / "+("0"+N).slice(-2);
  $$("#dots button").forEach(function(b,i){ b.classList.toggle("cur", i===n); });
  $("#dlabel").textContent = slides[n].dataset.label;
  $("#prev").disabled = n===0; $("#next").disabled = n===N-1;
  try{ history.replaceState(null,"","#"+(n+1)); }catch(e){}
  enter(n);
}
function buildChrome(){
  $("#dots").innerHTML = slides.map(function(s,i){ return '<button title="'+s.dataset.label+'" aria-label="Slide '+(i+1)+': '+s.dataset.label+'"></button>'; }).join("")+'<span id="dlabel"></span>';
  $$("#dots button").forEach(function(b,i){ b.addEventListener("click",function(){ go(i); }); });
  $("#prev").addEventListener("click",function(){ go(cur-1); }); $("#next").addEventListener("click",function(){ go(cur+1); });
  var fsOk = !!document.documentElement.requestFullscreen; if(!fsOk) $("#fsb").style.display = "none";
  var tfs = function(){ try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(function(){}); }catch(e){} };
  $("#fsb").addEventListener("click",tfs);
  document.addEventListener("fullscreenchange",function(){ $("#fsl").textContent = document.fullscreenElement ? "Exit full screen" : "Full screen"; });
  $("#demoFull").addEventListener("click",openFull); $("#fullX").addEventListener("click",closeFull);
  addEventListener("keydown",function(e){
    if(e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName) && e.target.type!=="range"){ if(e.key==="Escape") e.target.blur(); return; }
    if(e.key==="Escape" && fullFr){ closeFull(); return; }
    if(fullFr) return;
    if(e.key==="ArrowRight" || e.key==="PageDown" || e.key===" "){ e.preventDefault(); go(cur+1); }
    else if(e.key==="ArrowLeft" || e.key==="PageUp"){ e.preventDefault(); go(cur-1); }
    else if(e.key==="Home") go(0); else if(e.key==="End") go(N-1);
    else if(e.key==="f" || e.key==="F") tfs();
  });
  var tx = 0, ty = 0, tt = null;
  addEventListener("touchstart",function(e){ tt = e.target; tx = e.touches[0].clientX; ty = e.touches[0].clientY; },{passive:true});
  addEventListener("touchend",function(e){ if(fullFr || (tt && tt.closest && tt.closest("input,.run,table"))) return; var dx = e.changedTouches[0].clientX-tx, dy = e.changedTouches[0].clientY-ty; if(Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.6) go(cur+(dx<0?1:-1)); },{passive:true});
  addEventListener("hashchange",function(){ var h = parseInt(location.hash.slice(1),10); if(h>=1 && h<=N) go(h-1); });
  // leaving the tab: take every Flick down so nothing keeps playing; bring the slide's Flicks back on return
  document.addEventListener("visibilitychange",function(){ if(document.hidden){ token++; if(cur>=0) silence(slides[cur]); } else if(cur>=0){ enter(cur); } });
}

buildChrome(); buildCats(); buildRun(); wireMath();
try{ $("#endWave").src = $("#s1 .wave").src; }catch(e){}
var h0 = parseInt(location.hash.slice(1),10);
go(h0>=1 && h0<=N ? h0-1 : 0, true);
window.__deck = {go:go, compute:compute, state:function(){ return {cur:cur, frames:$$("iframe").length, M:M}; }};
})();
