"use strict";
/* Math 102 — Chapter 10 shared parametric-tracer engine.
   A per-problem page sets window.CH10_PRESET = "<slug>" then loads this script.
   One engine, thin presets. Core interaction: drag t, play/animate, speed,
   direction toggle, orientation arrow, zoom/pan, reset-to-preset.
   Shape sliders appear only when a preset defines .params (e.g. Example 4). */
(function(){
const TAU = 2*Math.PI;
const P = {
  "ex1-parabola":     {label:"Example 1 — x = t² − 2t,  y = t + 1", eqn:"x = t² − 2t,  y = t + 1   ⇒   x = y² − 4y + 3", x:t=>t*t-2*t, y:t=>t+1, tmin:-2, tmax:4},
  "ex2-unit-circle":  {label:"Example 2 — x = cos t,  y = sin t (unit circle, CCW)", eqn:"x = cos t,  y = sin t,  0 ≤ t ≤ 2π", x:t=>Math.cos(t), y:t=>Math.sin(t), tmin:0, tmax:TAU},
  "ex3-circle-twice": {label:"Example 3 — x = sin 2t,  y = cos 2t (twice, CW)", eqn:"x = sin 2t,  y = cos 2t,  0 ≤ t ≤ 2π", x:t=>Math.sin(2*t), y:t=>Math.cos(2*t), tmin:0, tmax:TAU},
  "ex4-circle-hkr":   {label:"Example 4 — x = h + r cos t,  y = k + r sin t", eqn:"x = h + r cos t,  y = k + r sin t,  0 ≤ t ≤ 2π", x:(t,p)=>p.h+p.r*Math.cos(t), y:(t,p)=>p.k+p.r*Math.sin(t), tmin:0, tmax:TAU, params:{h:{min:-4,max:4,step:0.1,val:2}, k:{min:-4,max:4,step:0.1,val:1}, r:{min:0.5,max:4,step:0.1,val:2}}},
  "ex5a-cubic":       {label:"Example 5(a) — x = t³,  y = t", eqn:"x = t³,  y = t   (lies on x = y³)", x:t=>t*t*t, y:t=>t, tmin:-1.4, tmax:1.4},
  "ex5b-cubic":       {label:"Example 5(b) — x = −t³,  y = −t", eqn:"x = −t³,  y = −t   (lies on x = y³)", x:t=>-t*t*t, y:t=>-t, tmin:-1.4, tmax:1.4},
  "ex5c-cubic":       {label:"Example 5(c) — x = t^{3/2},  y = √t", eqn:"x = t^{3/2},  y = √t,  t ≥ 0   (lies on x = y³)", x:t=>Math.pow(t,1.5), y:t=>Math.sqrt(t), tmin:0, tmax:1.7},
  "ex5d-cubic":       {label:"Example 5(d) — x = e^{−3t},  y = e^{−t}", eqn:"x = e^{−3t},  y = e^{−t}   (lies on x = y³)", x:t=>Math.exp(-3*t), y:t=>Math.exp(-t), tmin:-0.45, tmax:3},
  "ex5-cubic":        {label:"Example 5 — x = y³ traced four ways", eqn:"All four parametrizations lie on x = y³", variants:[
                          {key:"(a) x=t³, y=t",        x:t=>t*t*t, y:t=>t, tmin:-1.4, tmax:1.4},
                          {key:"(b) x=−t³, y=−t",      x:t=>-t*t*t, y:t=>-t, tmin:-1.4, tmax:1.4},
                          {key:"(c) x=t^{3/2}, y=√t",  x:t=>Math.pow(t,1.5), y:t=>Math.sqrt(t), tmin:0, tmax:1.7},
                          {key:"(d) x=e^{−3t}, y=e^{−t}", x:t=>Math.exp(-3*t), y:t=>Math.exp(-t), tmin:-0.45, tmax:3}
                       ]},
  "ex6-parabola-arc": {label:"Example 6 — x = sin t,  y = sin²t", eqn:"x = sin t,  y = sin²t   ⇒   y = x², −1 ≤ x ≤ 1", x:t=>Math.sin(t), y:t=>Math.sin(t)**2, tmin:0, tmax:TAU},
  "richer-curve":     {label:"A richer curve — x = 2cos t + cos 10t,  y = 2sin t + sin 10t", eqn:"x = 2cos t + cos 10t,  y = 2sin t + sin 10t,  0 ≤ t ≤ 2π", x:t=>2*Math.cos(t)+Math.cos(10*t), y:t=>2*Math.sin(t)+Math.sin(10*t), tmin:0, tmax:TAU},
  "line-segment":     {label:"Line segment — x = 3t + 1,  y = 5t + 2", eqn:"x = 3t + 1,  y = 5t + 2,  0 ≤ t ≤ 1   (from (1,2) to (4,7))", x:t=>3*t+1, y:t=>5*t+2, tmin:0, tmax:1},
  "parabola-piece":   {label:"Piece of a parabola — x = t,  y = t²", eqn:"x = t,  y = t²,  −1 ≤ t ≤ 3   (from (−1,1) to (3,9))", x:t=>t, y:t=>t*t, tmin:-1, tmax:3},
  "xofy-sqrt":        {label:"x = f(y) — x = (t−5)² + √t,  y = t", eqn:"x = (t−5)² + √t,  y = t,  t ≥ 0", x:t=>(t-5)**2+Math.sqrt(t), y:t=>t, tmin:0, tmax:10},
  "identify-line":    {label:"Identify — x = 1 + 3t,  y = 2 + 3t", eqn:"x = 1 + 3t,  y = 2 + 3t   ⇒   y = x + 1", x:t=>1+3*t, y:t=>2+3*t, tmin:-2, tmax:2},
  "identify-ellipse": {label:"Identify — x = 2 sin t,  y = 3 cos t", eqn:"x = 2 sin t,  y = 3 cos t   ⇒   x²/4 + y²/9 = 1", x:t=>2*Math.sin(t), y:t=>3*Math.cos(t), tmin:0, tmax:TAU},
  "identify-circle":  {label:"Identify — x = 2 + 4cos t,  y = 3 + 4sin t", eqn:"x = 2 + 4cos t,  y = 3 + 4sin t   ⇒   (x−2)² + (y−3)² = 16", x:t=>2+4*Math.cos(t), y:t=>3+4*Math.sin(t), tmin:0, tmax:TAU},
  "lab3-loop":        {label:"Lab 3 — x = 1 − t²,  y = 2t − t²", eqn:"x = 1 − t²,  y = 2t − t²,  −1 ≤ t ≤ 2", x:t=>1-t*t, y:t=>2*t-t*t, tmin:-1, tmax:2},
  "lab6-parabola":    {label:"Lab 6 — x = cos²t,  y = 1 + cos t", eqn:"x = cos²t,  y = 1 + cos t,  0 ≤ t ≤ π   ⇒   x = (y−1)²", x:t=>Math.cos(t)**2, y:t=>1+Math.cos(t), tmin:0, tmax:Math.PI},
  "lab15-secant":     {label:"Lab 15 — x = cos θ,  y = sec²θ", eqn:"x = cos θ,  y = sec²θ,  0 ≤ θ < π/2   ⇒   y = 1/x²", x:t=>Math.cos(t), y:t=>1/(Math.cos(t)**2), tmin:0, tmax:1.30},
  "lab20-absv":       {label:"Lab 20 — x = |t|,  y = |1 − |t||", eqn:"x = |t|,  y = |1 − |t||   ⇒   y = |1 − x|, x ≥ 0", x:t=>Math.abs(t), y:t=>Math.abs(1-Math.abs(t)), tmin:-3, tmax:3}
};

// ---- pick preset ----
let key = window.CH10_PRESET;
if(!P[key]){ key = new URLSearchParams(location.search).get("p") || "ex2-unit-circle"; }
const base = P[key];

// ---- build DOM ----
const root = document.getElementById("app") || document.body;
function el(tag, attrs, html){ const e=document.createElement(tag); if(attrs) for(const k in attrs) e.setAttribute(k,attrs[k]); if(html!=null) e.innerHTML=html; return e; }
root.innerHTML =
  '<header><h1 id="ttl"></h1><p id="eqn"></p></header>'+
  '<div class="wrap">'+
   '<div class="panel"><div id="variants" class="row"></div>'+
     '<div class="row">'+
       '<div><button id="play">▶ Play</button> <button id="dir" class="sec">⇄ Reverse</button> <button id="reset" class="sec">Reset</button></div>'+
       '<div><label>Speed</label><br><input id="speed" type="range" min="0.2" max="3" step="0.1" value="1"></div>'+
       '<div style="flex:1;min-width:240px"><label>Parameter = <span id="tval" class="ro"></span></label><br><input id="t" type="range" style="width:100%"></div>'+
     '</div>'+
     '<div class="row" style="margin-top:8px"><div><label>min</label><br><input id="tmin" type="number" step="0.1" style="width:84px"></div>'+
       '<div><label>max</label><br><input id="tmax" type="number" step="0.1" style="width:84px"></div>'+
       '<div class="ro">Point: (<span id="xv"></span>, <span id="yv"></span>)</div>'+
       '<div class="hint">Wheel = zoom · drag = pan</div></div>'+
     '<div id="params" class="row" style="margin-top:8px"></div>'+
   '</div>'+
   '<div class="panel"><canvas id="cv" width="900" height="560"></canvas>'+
     '<div class="hint">Faint = full path · bold blue = traced so far · red dot = particle · arrow = direction of motion.</div></div>'+
   '<footer>Math 102 (Calculus II) — Qatar University · interactive 2-D supplement (§10.1).</footer>'+
  '</div>';

const $=id=>document.getElementById(id);
const cv=$("cv"), ctx=cv.getContext("2d");
let cur, params={}, dir=1, playing=false, raf=null, view={scale:1,ox:0,oy:0};

function setActive(src){
  cur={x:src.x, y:src.y, tmin:src.tmin, tmax:src.tmax};
  $("t").min=src.tmin; $("t").max=src.tmax; $("t").step=(src.tmax-src.tmin)/1000; $("t").value=src.tmin;
  $("tmin").value=(+src.tmin).toFixed(2); $("tmax").value=(+src.tmax).toFixed(2);
}

// variants (Example 5 combined)
if(base.variants){
  base.variants.forEach((v,i)=>{
    const b=el("button",{class:i?"sec":""},v.key); b.style.marginRight="6px";
    b.onclick=()=>{ setActive(v); $("eqn").textContent=base.eqn; resetView(); draw();
      [...$("variants").children].forEach(c=>c.className="sec"); b.className=""; };
    $("variants").appendChild(b);
  });
}

// shape params (Example 4)
function buildParams(){
  const box=$("params"); box.innerHTML=""; params={};
  if(!base.params) return;
  for(const name in base.params){
    const d=base.params[name]; params[name]=d.val;
    const span=el("span",{class:"ro"},(+d.val).toFixed(1));
    const inp=el("input",{type:"range",min:d.min,max:d.max,step:d.step,value:d.val});
    inp.oninput=()=>{ params[name]=parseFloat(inp.value); span.innerHTML=parseFloat(inp.value).toFixed(1); draw(); };
    const wrap=el("div"); const lab=el("label",null,name+" = "); lab.appendChild(span);
    wrap.appendChild(lab); wrap.appendChild(el("br")); wrap.appendChild(inp); box.appendChild(wrap);
  }
}

function bounds(){
  const a=parseFloat($("tmin").value), b=parseFloat($("tmax").value);
  let xmn=1e9,xmx=-1e9,ymn=1e9,ymx=-1e9;
  for(let i=0;i<=400;i++){ const t=a+(b-a)*i/400, X=cur.x(t,params), Y=cur.y(t,params);
    if(isFinite(X)&&isFinite(Y)){ xmn=Math.min(xmn,X);xmx=Math.max(xmx,X);ymn=Math.min(ymn,Y);ymx=Math.max(ymx,Y);} }
  if(xmn>xmx){xmn=-1;xmx=1;ymn=-1;ymx=1;}
  const px=(xmx-xmn||2)*0.18, py=(ymx-ymn||2)*0.18; xmn-=px;xmx+=px;ymn-=py;ymx+=py;
  xmn=Math.min(xmn,0);xmx=Math.max(xmx,0);ymn=Math.min(ymn,0);ymx=Math.max(ymx,0);
  const s=Math.min(cv.width/(xmx-xmn), cv.height/(ymx-ymn));
  return {s, cxm:(xmn+xmx)/2, cym:(ymn+ymx)/2};
}
let B;
function TX(X){ return cv.width/2 + view.ox + (X-B.cxm)*B.s*view.scale; }
function TY(Y){ return cv.height/2 + view.oy - (Y-B.cym)*B.s*view.scale; }
function niceStep(r){ const raw=r/8, p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p; return (m<1.5?1:m<3?2:m<7?5:10)*p; }

function draw(){
  B=bounds(); const w=cv.width,h=cv.height; ctx.clearRect(0,0,w,h);
  const sEff=B.s*view.scale;
  const xL=B.cxm-(w/2+view.ox)/sEff, xR=B.cxm+(w/2-view.ox)/sEff;
  const yB=B.cym-(h/2-view.oy)/sEff, yT=B.cym+(h/2+view.oy)/sEff;
  const gx=niceStep(xR-xL), gy=niceStep(yT-yB);
  ctx.strokeStyle="#eef2f6"; ctx.lineWidth=1; ctx.font="12px system-ui";
  for(let X=Math.ceil(xL/gx)*gx; X<=xR; X+=gx){ const sx=TX(X); ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx,h);ctx.stroke(); }
  for(let Y=Math.ceil(yB/gy)*gy; Y<=yT; Y+=gy){ const sy=TY(Y); ctx.beginPath();ctx.moveTo(0,sy);ctx.lineTo(w,sy);ctx.stroke(); }
  ctx.strokeStyle="#9aa7b4"; ctx.lineWidth=1.4;
  ctx.beginPath();ctx.moveTo(0,TY(0));ctx.lineTo(w,TY(0));ctx.stroke();
  ctx.beginPath();ctx.moveTo(TX(0),0);ctx.lineTo(TX(0),h);ctx.stroke();
  ctx.fillStyle="#5b6b7a";
  for(let X=Math.ceil(xL/gx)*gx; X<=xR; X+=gx){ if(Math.abs(X)<1e-9)continue; ctx.fillText((Math.abs(gx)<1?X.toFixed(1):X.toFixed(0)), TX(X)+2, TY(0)+13); }
  for(let Y=Math.ceil(yB/gy)*gy; Y<=yT; Y+=gy){ if(Math.abs(Y)<1e-9)continue; ctx.fillText((Math.abs(gy)<1?Y.toFixed(1):Y.toFixed(0)), TX(0)+5, TY(Y)-3); }
  const a=parseFloat($("tmin").value), b=parseFloat($("tmax").value), tc=parseFloat($("t").value);
  // full path (faint)
  ctx.strokeStyle="#b9d4ec"; ctx.lineWidth=2; ctx.beginPath(); let st=false;
  for(let i=0;i<=1400;i++){ const t=a+(b-a)*i/1400, X=TX(cur.x(t,params)), Y=TY(cur.y(t,params));
    if(!isFinite(X)||!isFinite(Y)){st=false;continue;} st?ctx.lineTo(X,Y):(ctx.moveTo(X,Y),st=true); }
  ctx.stroke();
  // traced (bold)
  ctx.strokeStyle="#005AAA"; ctx.lineWidth=3; ctx.beginPath(); st=false;
  for(let i=0;i<=1400;i++){ const t=a+(tc-a)*i/1400, X=TX(cur.x(t,params)), Y=TY(cur.y(t,params));
    if(!isFinite(X)||!isFinite(Y)){st=false;continue;} st?ctx.lineTo(X,Y):(ctx.moveTo(X,Y),st=true); }
  ctx.stroke();
  // particle + orientation arrow (respects direction)
  const px=cur.x(tc,params), py=cur.y(tc,params), dt=(b-a)/2000;
  let ddx=(cur.x(tc+dt,params)-px)*dir, ddy=(cur.y(tc+dt,params)-py)*dir, L=Math.hypot(ddx,ddy)||1; ddx/=L; ddy/=L;
  const SX=TX(px), SY=TY(py), ax=SX+ddx*34, ay=SY-ddy*34;
  ctx.strokeStyle="#C42327"; ctx.fillStyle="#C42327"; ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(SX,SY);ctx.lineTo(ax,ay);ctx.stroke();
  const an=Math.atan2(ay-SY,ax-SX);
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-10*Math.cos(an-0.4),ay-10*Math.sin(an-0.4));ctx.lineTo(ax-10*Math.cos(an+0.4),ay-10*Math.sin(an+0.4));ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(SX,SY,5,0,TAU);ctx.fill();
  $("tval").textContent=tc.toFixed(3); $("xv").textContent=px.toFixed(3); $("yv").textContent=py.toFixed(3);
}

function tick(){ if(!playing)return;
  const a=parseFloat($("tmin").value), b=parseFloat($("tmax").value);
  let t=parseFloat($("t").value)+dir*(b-a)*0.0016*parseFloat($("speed").value);
  if(t>b) t=a; if(t<a) t=b; $("t").value=t; draw(); raf=requestAnimationFrame(tick);
}
function resetView(){ view={scale:1,ox:0,oy:0}; }

// interactions
$("t").oninput=draw;
$("tmin").onchange=()=>{ $("t").min=$("tmin").value; draw(); };
$("tmax").onchange=()=>{ $("t").max=$("tmax").value; draw(); };
$("play").onclick=()=>{ playing=!playing; $("play").textContent=playing?"❚❚ Pause":"▶ Play"; if(playing)raf=requestAnimationFrame(tick); else cancelAnimationFrame(raf); };
$("dir").onclick=()=>{ dir=-dir; $("dir").textContent = dir>0?"⇄ Reverse":"⇄ Forward"; draw(); };
$("reset").onclick=()=>{ playing=false; $("play").textContent="▶ Play"; cancelAnimationFrame(raf); dir=1; $("dir").textContent="⇄ Reverse"; buildParams(); setActive(base.variants?base.variants[0]:base); resetView(); draw(); };
// zoom / pan
cv.addEventListener("wheel",e=>{ e.preventDefault(); const r=cv.getBoundingClientRect();
  const mx=(e.clientX-r.left)*cv.width/r.width, my=(e.clientY-r.top)*cv.height/r.height;
  const f=e.deltaY<0?1.1:1/1.1; view.scale*=f;
  view.ox=(mx-cv.width/2)*(1-f)+f*view.ox; view.oy=(my-cv.height/2)*(1-f)+f*view.oy; draw(); },{passive:false});
let drag=null;
cv.addEventListener("mousedown",e=>{ drag={x:e.clientX,y:e.clientY}; });
window.addEventListener("mousemove",e=>{ if(!drag)return; const r=cv.getBoundingClientRect();
  view.ox+=(e.clientX-drag.x)*cv.width/r.width; view.oy+=(e.clientY-drag.y)*cv.height/r.height; drag={x:e.clientX,y:e.clientY}; draw(); });
window.addEventListener("mouseup",()=>drag=null);

// init
$("ttl").textContent = base.label;
$("eqn").textContent = base.eqn;
buildParams();
setActive(base.variants?base.variants[0]:base);
draw();
})();
