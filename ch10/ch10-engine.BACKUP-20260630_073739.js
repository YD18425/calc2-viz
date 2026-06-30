"use strict";
/* ch10 engine build: 2026-06-29 §10.2 tangent-mode */
/* Math 102 — Chapter 10 shared parametric-tracer engine.
   A per-problem page sets window.CH10_PRESET = "<slug>" then loads this script.
   Features: drag t, Play/Reverse/Speed, zoom/pan, Reset; shape sliders (preset.params);
   variant toggle (preset.variants); animated value table (populate-as-you-scroll, distance
   -decay glow) synchronized with a comet-tail on the curve. */
(function(){
const TAU = 2*Math.PI;
const RED = "196,35,39";
const FAM={axis:"#d99a00",sixth:"#e2702a",quarter:"#1e9646",third:"#8e44ad"};
const FAMSTRONG={axis:"rgba(224,168,0,0.55)",sixth:"rgba(226,112,42,0.50)",quarter:"rgba(30,150,70,0.45)",third:"rgba(142,68,173,0.45)"};
const P = {
  "ex1-parabola":     {label:"Example 1 — x = t² − 2t,  y = t + 1", eqn:"x = t² − 2t,  y = t + 1   ⇒   x = y² − 4y + 3", x:t=>t*t-2*t, y:t=>t+1, tmin:-2, tmax:4},
  "ex2-unit-circle":  {label:"Example 2 — x = cos t,  y = sin t (unit circle, CCW)", eqn:"x = cos t,  y = sin t,  0 ≤ t ≤ 2π", x:t=>Math.cos(t), y:t=>Math.sin(t), tmin:0, tmax:TAU},
  "ex3-circle-twice": {label:"Example 3 — x = sin 2t,  y = cos 2t (twice, CW)", eqn:"x = sin 2t,  y = cos 2t,  0 ≤ t ≤ 2π", x:t=>Math.sin(2*t), y:t=>Math.cos(2*t), tmin:0, tmax:TAU},
  "ex4-circle-hkr":   {label:"Example 4 — x = h + r cos t,  y = k + r sin t", eqn:"x = h + r cos t,  y = k + r sin t,  0 ≤ t ≤ 2π", x:(t,p)=>p.h+p.r*Math.cos(t), y:(t,p)=>p.k+p.r*Math.sin(t), tmin:0, tmax:TAU, params:{h:{min:-4,max:4,step:0.1,val:2}, k:{min:-4,max:4,step:0.1,val:1}, r:{min:0.5,max:4,step:0.1,val:2}}},
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
  "lab20-absv":       {label:"Lab 20 — x = |t|,  y = |1 − |t||", eqn:"x = |t|,  y = |1 − |t||   ⇒   y = |1 − x|, x ≥ 0", x:t=>Math.abs(t), y:t=>Math.abs(1-Math.abs(t)), tmin:-3, tmax:3},
  // ---- §10.2 tangent-mode presets (tangent line + live slope + H/V highlights) ----
  "ex3-ellipse-hv": {label:"§10.2 Example 3 — x = cos t,  y = 4 sin t   (tangents to an ellipse)",
                     eqn:"x = cos t,  y = 4 sin t,  0 ≤ t ≤ 2π        dy/dx = (4 cos t) / (−sin t)",
                     x:t=>Math.cos(t), y:t=>4*Math.sin(t), dx:t=>-Math.sin(t), dy:t=>4*Math.cos(t),
                     tmin:0, tmax:TAU, sec:"§10.2", tangent:true, crit:[{t:0,lab:"0"},{t:Math.PI/2,lab:"π/2"},{t:Math.PI,lab:"π"},{t:3*Math.PI/2,lab:"3π/2"},{t:TAU,lab:"2π"}], snap:0.02,
                     hpts:[{x:0,y:4},{x:0,y:-4}], vpts:[{x:1,y:0},{x:-1,y:0}]},
  "ex1-scrambler-slope": {label:"§10.2 Example 1 — x = 2cos t + sin 2t,  y = 2sin t + cos 2t",
    eqn:"x = 2cos t + sin 2t,  y = 2sin t + cos 2t,  0 ≤ t ≤ 2π        slope at t=0: m = 1",
    x:t=>2*Math.cos(t)+Math.sin(2*t), y:t=>2*Math.sin(t)+Math.cos(2*t),
    dx:t=>-2*Math.sin(t)+2*Math.cos(2*t), dy:t=>2*Math.cos(t)-2*Math.sin(2*t),
    tmin:0, tmax:TAU, sec:"§10.2", tangent:true, snap:0.02,
    crit:[{t:Math.PI/2,lab:"π/2"}], hpts:[{x:0,y:1}], vpts:[],
    note:"Cusps (x'=y'=0) at t=π/6, 5π/6, 3π/2.  Focus: t=0 → (2, 1), slope 1, y = x − 1."},
  "ex2-cubic-hv": {label:"§10.2 Example 2 — x = t²,  y = t³ − t   (horizontal & vertical tangents)",
    eqn:"x = t²,  y = t³ − t        x' = 2t,  y' = 3t² − 1",
    x:t=>t*t, y:t=>t*t*t-t, dx:t=>2*t, dy:t=>3*t*t-1,
    tmin:-1.5, tmax:1.5, sec:"§10.2", tangent:true, snap:0.02,
    crit:[{t:-1/Math.sqrt(3),lab:"−1/√3"},{t:0,lab:"0"},{t:1/Math.sqrt(3),lab:"1/√3"}],
    hpts:[{x:1/3,y:-0.3849},{x:1/3,y:0.3849}], vpts:[{x:0,y:0}],
    note:"Self-intersection at (1, 0): t = 1 (slope 1) and t = −1 (slope −1)."},
  "lab5-derivatives": {label:"§10.2 Lab 5 — x = t² + 2t,  y = 2ᵗ − 2t",
    eqn:"x = t² + 2t,  y = 2^t − 2t        x' = 2t + 2,  y' = 2^t ln2 − 2",
    x:t=>t*t+2*t, y:t=>Math.pow(2,t)-2*t, dx:t=>2*t+2, dy:t=>Math.pow(2,t)*Math.LN2-2,
    tmin:-2, tmax:2.5, sec:"§10.2", tangent:true, snap:0.02,
    crit:[{t:-1,lab:"−1"},{t:Math.log2(2/Math.LN2),lab:"1.53"}],
    hpts:[{x:5.3948,y:-0.1722}], vpts:[{x:-1,y:2.5}],
    note:"Vertical at t = −1 → (−1, 2.5).  Horizontal at t = log₂(2/ln2) ≈ 1.53 → (5.39, −0.17)."},
  "lab8-tangent": {label:"§10.2 Lab 8 — x = √t,  y = t² − 2t   (tangent at t = 4)",
    eqn:"x = √t,  y = t² − 2t,  t ≥ 0        x' = 1/(2√t),  y' = 2t − 2",
    x:t=>Math.sqrt(t), y:t=>t*t-2*t, dx:t=>1/(2*Math.sqrt(t)), dy:t=>2*t-2,
    tmin:0, tmax:5, sec:"§10.2", tangent:true, snap:0.02,
    crit:[{t:0,lab:"0"},{t:1,lab:"1"},{t:4,lab:"4"}],
    hpts:[{x:0,y:0},{x:1,y:-1}], vpts:[],
    note:"Focus: t = 4 → (2, 8), y = 24x − 40.  Endpoint t = 0: x' → ∞ (slope → 0)."},
  "lab18-concavity": {label:"§10.2 Lab 18 — x = t² − 1,  y = eᵗ − 1   (concavity)",
    eqn:"x = t² − 1,  y = e^t − 1        dy/dx = e^t/(2t),  d²y/dx² = e^t(t−1)/(4t³)",
    x:t=>t*t-1, y:t=>Math.exp(t)-1, dx:t=>2*t, dy:t=>Math.exp(t), d2:t=>Math.exp(t)*(t-1)/(4*t*t*t),
    tmin:-1.5, tmax:2, sec:"§10.2", tangent:true, concavity:true, infl:1, snap:0.02,
    crit:[{t:0,lab:"0"},{t:1,lab:"1"}], hpts:[], vpts:[{x:-1,y:0}],
    note:"Concave up: t<0 and t>1.  Concave down: 0<t<1.  Inflection at t=1.  Concavity undefined at t=0 (vertical tangent x=−1)."},
  "rsin-theta": {
    label:"§10.3 Example — r = sin θ  (a circle through the pole)",
    eqn:"r = sin θ,  0 ≤ θ ≤ 2π        x = r cos θ,  y = r sin θ        ⇒  x² + (y − ½)² = ¼",
    sec:"§10.3", polar:true,
    r:(t)=>Math.sin(t), x:(t)=>Math.sin(t)*Math.cos(t), y:(t)=>Math.sin(t)*Math.sin(t),
    tmin:0, tmax:TAU, rmax:1, rings:[0.25,0.5,0.75,1.0],
    mainAngles:[
      {t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},
      {t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},
      {t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},
      {t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},
      {t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},
      {t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}
    ],
    notes:[{t:Math.PI/2,txt:"r=1"},{t:0,txt:"pole r=0"}],
    note:"For π<θ<2π, r<0 → the point is plotted opposite (θ+π); the same circle is retraced."
  },
  "rcos-theta": {
    label:"§10.3 Example — r = cos θ  (circle on the polar axis)",
    eqn:"r = cos θ,  0 ≤ θ ≤ 2π        x = r cos θ,  y = r sin θ        ⇒  (x − ½)² + y² = ¼",
    sec:"§10.3", polar:true,
    r:(t)=>Math.cos(t), x:(t)=>Math.cos(t)*Math.cos(t), y:(t)=>Math.cos(t)*Math.sin(t),
    tmin:0, tmax:TAU, rmax:1, rings:[0.25,0.5,0.75,1.0],
    mainAngles:[{t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},{t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},{t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},{t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},{t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},{t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}],
    notes:[{t:0,txt:"r=1"},{t:Math.PI/2,txt:"pole r=0"}],
    note:"cos θ<0 on π/2<θ<3π/2 → r<0, plotted opposite (θ+π); the same circle (right half) is retraced."
  },
  "cardioid-2m2sin": {
    label:"§10.3 Example — r = 2 − 2 sin θ  (cardioid)",
    eqn:"r = 2 − 2 sin θ,  0 ≤ θ ≤ 2π",
    sec:"§10.3", polar:true,
    r:(t)=>2-2*Math.sin(t), x:(t)=>(2-2*Math.sin(t))*Math.cos(t), y:(t)=>(2-2*Math.sin(t))*Math.sin(t),
    tmin:0, tmax:TAU, rmax:4, rings:[1,2,3,4],
    mainAngles:[{t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},{t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},{t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},{t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},{t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},{t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}],
    notes:[{t:3*Math.PI/2,txt:"max r=4"},{t:Math.PI/2,txt:"cusp r=0"}],
    note:"Cardioid r=a(1−sinθ), a=2; cusp at the pole at θ=π/2."
  },
  "cardioid-1pcos": {
    label:"§10.3 Example — r = 1 + cos θ  (cardioid)",
    eqn:"r = 1 + cos θ,  0 ≤ θ ≤ 2π",
    sec:"§10.3", polar:true,
    r:(t)=>1+Math.cos(t), x:(t)=>(1+Math.cos(t))*Math.cos(t), y:(t)=>(1+Math.cos(t))*Math.sin(t),
    tmin:0, tmax:TAU, rmax:2, rings:[0.5,1,1.5,2],
    mainAngles:[{t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},{t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},{t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},{t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},{t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},{t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}],
    notes:[{t:0,txt:"max r=2"},{t:Math.PI,txt:"cusp r=0"}],
    note:"Cardioid r=a(1+cosθ), a=1; cusp at the pole at θ=π."
  },
  "limacon-3p2cos": {
    label:"§10.3 Example — r = 3 + 2 cos θ  (dimpled limaçon)",
    eqn:"r = 3 + 2 cos θ,  0 ≤ θ ≤ 2π",
    sec:"§10.3", polar:true,
    r:(t)=>3+2*Math.cos(t), x:(t)=>(3+2*Math.cos(t))*Math.cos(t), y:(t)=>(3+2*Math.cos(t))*Math.sin(t),
    tmin:0, tmax:TAU, rmax:5, rings:[1,2,3,4,5],
    mainAngles:[{t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},{t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},{t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},{t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},{t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},{t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}],
    notes:[{t:0,txt:"max r=5"},{t:Math.PI,txt:"min r=1"}],
    note:"Dimpled limaçon r=a+b cosθ, a=3,b=2 (1<a/b<2)."
  },
  "limacon-1m2sin": {
    label:"§10.3 Example — r = 1 − 2 sin θ  (limaçon, inner loop)",
    eqn:"r = 1 − 2 sin θ,  0 ≤ θ ≤ 2π   (r<0 ⇒ inner loop, plotted at θ+π)",
    sec:"§10.3", polar:true,
    r:(t)=>1-2*Math.sin(t), x:(t)=>(1-2*Math.sin(t))*Math.cos(t), y:(t)=>(1-2*Math.sin(t))*Math.sin(t),
    tmin:0, tmax:TAU, rmax:3, rings:[1,2,3],
    mainAngles:[{t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},{t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},{t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},{t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},{t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},{t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}],
    notes:[{t:3*Math.PI/2,txt:"max r=3"}],
    note:"Limaçon inner loop r=a−b sinθ, a=1,b=2; r<0 on π/6<θ<5π/6 traces the inner loop."
  },
  "rose-sin2": {
    label:"§10.3 Example — r = sin 2θ  (four-petaled rose)",
    eqn:"r = sin 2θ,  0 ≤ θ ≤ 2π   (n=2 even ⇒ 2n=4 petals)",
    sec:"§10.3", polar:true,
    r:(t)=>Math.sin(2*t), x:(t)=>Math.sin(2*t)*Math.cos(t), y:(t)=>Math.sin(2*t)*Math.sin(t),
    tmin:0, tmax:TAU, rmax:1, rings:[0.25,0.5,0.75,1],
    mainAngles:[{t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},{t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},{t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},{t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},{t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},{t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}],
    notes:[{t:Math.PI/4,txt:"petal r=1"}],
    note:"Rose r=sin 2θ; n=2 even ⇒ 4 petals; negative-r petals plotted at θ+π."
  },
  "spiral": {
    label:"§10.3 Example — r = θ  (Archimedean spiral)",
    eqn:"r = θ,  θ ≥ 0        as θ grows, r grows",
    sec:"§10.3", polar:true,
    r:(t)=>t, x:(t)=>t*Math.cos(t), y:(t)=>t*Math.sin(t),
    tmin:0, tmax:TAU, rmax:2*Math.PI, rings:[1,2,3,4,5,6],
    mainAngles:[{t:0,lab:"0",fam:"axis"},{t:Math.PI/6,lab:"π/6",fam:"sixth"},{t:Math.PI/4,lab:"π/4",fam:"quarter"},{t:Math.PI/3,lab:"π/3",fam:"third"},{t:Math.PI/2,lab:"π/2",fam:"axis"},{t:2*Math.PI/3,lab:"2π/3",fam:"third"},{t:3*Math.PI/4,lab:"3π/4",fam:"quarter"},{t:5*Math.PI/6,lab:"5π/6",fam:"sixth"},{t:Math.PI,lab:"π",fam:"axis"},{t:7*Math.PI/6,lab:"7π/6",fam:"sixth"},{t:5*Math.PI/4,lab:"5π/4",fam:"quarter"},{t:4*Math.PI/3,lab:"4π/3",fam:"third"},{t:3*Math.PI/2,lab:"3π/2",fam:"axis"},{t:5*Math.PI/3,lab:"5π/3",fam:"third"},{t:7*Math.PI/4,lab:"7π/4",fam:"quarter"},{t:11*Math.PI/6,lab:"11π/6",fam:"sixth"},{t:2*Math.PI,lab:"2π",fam:"axis"}],
    notes:[],
    note:"Archimedean spiral r=θ: distance from the pole grows with the angle."
  }
};

let key = window.CH10_PRESET;
if(!P[key]){ key = new URLSearchParams(location.search).get("p") || "ex2-unit-circle"; }
const base = P[key];
// Section label is PER-PAGE: a preset may set its own .sec; else derive "§10.N" from the
// page's ch10-N- filename. Not hard-coded to one section in the shared engine.
const SEC = base.sec || ("§10." + (((location.pathname||"").match(/ch10-(\d+)-/) || [0,"1"])[1]));

const root = document.getElementById("app") || document.body;
function el(tag, attrs, html){ const e=document.createElement(tag); if(attrs) for(const k in attrs) e.setAttribute(k,attrs[k]); if(html!=null) e.innerHTML=html; return e; }
root.innerHTML =
  '<header><h1 id="ttl"></h1><p id="eqn"></p></header>'+
  '<div class="wrap">'+
   '<div class="panel"><div id="variants" class="row"></div><div id="snaps" class="row"></div>'+
     '<div class="row">'+
       '<div><button id="play">▶ Play</button> <button id="dir" class="sec">⇄ Reverse</button> <button id="reset" class="sec">Reset</button></div>'+
       '<div><label>Speed</label><br><input id="speed" type="range" min="0.2" max="3" step="0.1" value="1"></div>'+
       '<div style="flex:1;min-width:240px"><label>Parameter = <span id="tval" class="ro"></span></label><br><input id="t" type="range" style="width:100%"></div>'+
     '</div>'+
     '<div class="row" style="margin-top:8px"><div><label>min</label><br><input id="tmin" type="number" step="0.1" style="width:84px"></div>'+
       '<div><label>max</label><br><input id="tmax" type="number" step="0.1" style="width:84px"></div>'+
       '<div class="ro">Point: (<span id="xv"></span>, <span id="yv"></span>)</div>'+
       '<div class="ro" id="slopebox" style="display:none">&nbsp;·&nbsp; dy/dx = <b><span id="sv"></span></b> &nbsp;<span class="hint" id="dcomp"></span></div>'+
       '<div class="hint">Wheel = zoom · drag = pan</div></div>'+
     '<div class="row"><div class="ro" id="polarbox" style="display:none"></div></div>'+
     '<div id="params" class="row" style="margin-top:8px"></div>'+
   '</div>'+
   '<div class="panel"><div class="vizrow">'+
       '<div class="cvwrap"><canvas id="cv" width="900" height="560"></canvas></div>'+
       '<div id="tblwrap" class="tblwrap"><table id="vtbl"></table></div>'+
     '</div>'+
     '<div class="hint">The table fills in as you scroll; the glow (and the comet-tail on the curve) is brightest at the current value and fades with distance — each column is tied to its point on the curve.</div>'+
     '<div id="taneq" class="taneq" style="display:none"></div>'+
     '<div id="concbox" class="taneq" style="display:none"></div>'+
     '<div id="tansummary" class="tansummary" style="display:none"></div></div>'+
   '<footer>Math 102 (Calculus II) — Qatar University · interactive 2-D supplement ('+SEC+').<br>Dr. Yousef Dabboorasad · <a href="mailto:yousef.d@qu.edu.qa">yousef.d@qu.edu.qa</a></footer>'+
  '</div>';

const $=id=>document.getElementById(id);
const cv=$("cv"), ctx=cv.getContext("2d");
const tblwrap=$("tblwrap");
let cur, params={}, dir=1, playing=false, raf=null, view={scale:1,ox:0,oy:0};
let TS=[], cells=null;

function fmt(v){ if(!isFinite(v)) return ""; const r=Math.round(v*100)/100; return (Math.abs(r)<5e-3?0:r).toString(); }
function derivAt(t){
  let dxdt,dydt;
  if(cur.dx && cur.dy){ dxdt=cur.dx(t,params); dydt=cur.dy(t,params); }
  else { const span=(cur.tmax-cur.tmin)||1, h=span*1e-5;
    let ta=t-h, tb=t+h;
    if(ta<cur.tmin){ ta=cur.tmin; tb=cur.tmin+2*h; }
    if(tb>cur.tmax){ tb=cur.tmax; ta=cur.tmax-2*h; }
    dxdt=(cur.x(tb,params)-cur.x(ta,params))/(tb-ta);
    dydt=(cur.y(tb,params)-cur.y(ta,params))/(tb-ta); }
  const speed=Math.hypot(dxdt,dydt)||1e-12;
  return {dxdt,dydt,speed,isH:Math.abs(dydt)/speed<0.08,isV:Math.abs(dxdt)/speed<0.08};
}
function fI(v){ let r=Math.round(v*100)/100; if(Math.abs(r)<5e-3) r=0; const s=(Math.abs(r-Math.round(r))<1e-9?String(Math.round(r)):r.toFixed(2)); return s.replace("-","−"); }
function f2(v){ let r=Math.round(v*100)/100; if(Math.abs(r)<5e-3) r=0; return r.toFixed(2).replace("-","−"); }
function escHtml(x){ return String(x).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function snapCrit(t){ if(cur&&cur.crit){ const tol=cur.snap||0.02; for(const c of cur.crit){ if(Math.abs(t-c.t)<tol) return c; } } return null; }
function snapT(t){ const c=snapCrit(t); return c?c.t:t; }
function tanConsequence(c){ const x0=cur.x(c.t,params), y0=cur.y(c.t,params), d=derivAt(c.t);
  if(Math.abs(d.dxdt)<1e-8) return {kind:"V", pt:"("+fI(x0)+", "+fI(y0)+")", eq:"x = "+fI(x0)};
  if(Math.abs(Math.round((d.dydt/d.dxdt)*100)/100)<5e-3) return {kind:"H", pt:"("+fI(x0)+", "+fI(y0)+")", eq:"y = "+fI(y0)};
  return {kind:"", pt:"("+fI(x0)+", "+fI(y0)+")", eq:""}; }
function buildSummary(){ const sm=$("tansummary"); if(!sm||!base.tangent||!cur.crit) return;
  const V=[],H=[]; for(const c of cur.crit){ const r=tanConsequence(c); const line="t="+c.lab+" → "+r.pt+", "+r.eq;
    if(r.kind==="V") V.push(line); else if(r.kind==="H") H.push(line); }
  sm.innerHTML='<div class="smtitle">Tangent consequences</div>'
    +(H.length?'<div><span class="smh">Horizontal tangents:</span> '+H.join(";  ")+'</div>':'')
    +(V.length?'<div><span class="smv">Vertical tangents:</span> '+V.join(";  ")+'</div>':'')
    +(cur.note?'<div class="smn">'+escHtml(cur.note)+'</div>':'');
  sm.style.display=""; }
function slopeVertical(d){ return Math.abs(d.dxdt) < 1e-8; }  // undefined ONLY when essentially exactly vertical (independent of the wider visual H/V pulse tolerance)
function slopeText(d,long){
  if(slopeVertical(d)) return long?"undefined":"undef";
  const m=d.dydt/d.dxdt, am=Math.abs(m);
  if(am<5e-3) return "0";
  return am>=100? m.toFixed(0) : am>=10? m.toFixed(1) : m.toFixed(2);
}
function tangentEq(t){
  const te=snapT(t), x0=cur.x(te,params), y0=cur.y(te,params), d=derivAt(te);
  if(Math.abs(d.dxdt)<1e-8) return {eq:"x = "+fI(x0), tag:"vertical tangent", col:"#e64a19"};
  const m=d.dydt/d.dxdt, b=y0-m*x0, mr=Math.round(m*100)/100;
  if(Math.abs(mr)<5e-3) return {eq:"y = "+fI(b), tag:"horizontal tangent", col:"#0a8f5b"};
  const mp = Math.abs(mr-1)<5e-3 ? "x" : Math.abs(mr+1)<5e-3 ? "−x" : f2(m)+"x";
  const br=Math.round(b*100)/100, bp = Math.abs(br)<5e-3 ? "" : (br<0 ? " − "+f2(Math.abs(b)) : " + "+f2(b));
  return {eq:"y = "+mp+bp, tag:"", col:"#5e35b1"};
}

function tsamples(a,b){
  const span=b-a, mant=[1,1.5,2,2.5,3,4,5,6,8], clean={1:0,2:0,5:0,2.5:1,3:1,4:1,1.5:2,6:2,8:2};
  let best=null;
  for(let e=-7;e<=7;e++){ const p=Math.pow(10,e);
    for(const mm of mant){ const step=mm*p, n=Math.round(span/step);
      if(n<2) continue;
      const score=(n>=30&&n<=50?0:1000)+0.25*Math.abs(n-40)+1.5*clean[mm];
      if(!best||score<best.score) best={step,n,score};
    } }
  const step=best.step, n=best.n, arr=[];
  for(let i=0;i<=n;i++) arr.push(a+i*step); return arr;
}

function buildTable(){
  const a=parseFloat($("tmin").value), b=parseFloat($("tmax").value);
  let ts=tsamples(a,b).map(t=>({t,crit:false,lab:fmt(t),kind:""}));
  if(base.tangent && cur.crit){
    const eps=(b-a)*1e-4, alo=(cur.tmin!=null?cur.tmin:a), ahi=(cur.tmax!=null?cur.tmax:b);
    for(const c of cur.crit){ if(c.t<alo-1e-6||c.t>ahi+1e-6) continue;
      const d=derivAt(c.t); let kind=""; if(Math.abs(d.dxdt)<1e-8) kind="V"; else if(Math.abs(Math.round((d.dydt/d.dxdt)*100)/100)<5e-3) kind="H";
      const col={t:c.t,crit:true,lab:c.lab,kind};
      const idx=ts.findIndex(o=>Math.abs(o.t-c.t)<eps);
      if(idx>=0) ts[idx]=col; else ts.push(col);
    }
    ts.sort((p,q)=>p.t-q.t);
  }
  TS=ts;
  const tbl=$("vtbl"); tbl.innerHTML=""; cells={t:[],x:[],y:[]}; if(base.tangent){ cells.dydx=[]; cells.tan=[]; }
  const mkrow=(keyName,label)=>{
    const tr=document.createElement("tr");
    const th=document.createElement("th"); th.textContent=label; th.className="rl"; tr.appendChild(th);
    for(let i=0;i<TS.length;i++){ const td=document.createElement("td");
      if(TS[i].crit){ td.className="crit"+(TS[i].kind==="V"?" critV":TS[i].kind==="H"?" critH":""); }
      tr.appendChild(td); cells[keyName].push(td); }
    tbl.appendChild(tr);
  };
  mkrow("t","t"); mkrow("x","x"); mkrow("y","y");
  if(base.tangent){ mkrow("dydx","dy/dx"); mkrow("tan","tangent line"); }
}

function updateTable(current){
  if(!cells) return;
  const a=parseFloat($("tmin").value), b=parseFloat($("tmax").value);
  const sig=(b-a)*0.075 || 1; let curCol=0;
  for(let i=0;i<TS.length;i++){
    const C=TS[i], ti=C.t, filled = ti <= current+1e-9;
    const dd2=Math.abs(ti-current), g=Math.exp(-(dd2/sig)*(dd2/sig));
    const bg = g>0.012 ? "rgba("+RED+","+(0.82*g).toFixed(3)+")" : "";
    const xi=cur.x(ti,params), yi=cur.y(ti,params);
    if(C.crit) cells.t[i].innerHTML = filled ? ('<b>'+C.lab+'</b><br><span class="sub">'+fmt(ti)+'</span>') : "";
    else cells.t[i].textContent = filled ? fmt(ti) : "";
    cells.x[i].textContent = filled && isFinite(xi) ? fmt(xi) : "";
    cells.y[i].textContent = filled && isFinite(yi) ? fmt(yi) : "";
    cells.t[i].style.background=bg; cells.x[i].style.background=bg; cells.y[i].style.background=bg;
    if(cells.dydx){ const dd=derivAt(ti); cells.dydx[i].textContent = filled ? slopeText(dd,true) : ""; cells.dydx[i].style.background=bg; }
    if(cells.tan){ cells.tan[i].textContent = filled ? tangentEq(ti).eq : ""; cells.tan[i].style.background=bg; }
    if(filled) curCol=i;
  }
  const cell=cells.t[curCol];
  if(cell && tblwrap){ tblwrap.scrollLeft = Math.max(0, (cell.offsetLeft||0) - (tblwrap.clientWidth||300)*0.6); }
}

function setActive(src){
  cur={x:src.x, y:src.y, tmin:src.tmin, tmax:src.tmax, tangent:src.tangent, dx:src.dx, dy:src.dy, hpts:src.hpts, vpts:src.vpts, crit:src.crit, snap:src.snap, d2:src.d2, concavity:src.concavity, infl:src.infl, note:src.note, polar:src.polar, r:src.r, mainAngles:src.mainAngles, rings:src.rings, rmax:src.rmax, notes:src.notes};
  $("t").min=src.tmin; $("t").max=src.tmax; $("t").step=(src.tmax-src.tmin)/1000; $("t").value=src.tmin;
  $("tmin").value=(+src.tmin).toFixed(2); $("tmax").value=(+src.tmax).toFixed(2);
  (base.polar?buildTablePolar:buildTable)();
}

if(base.variants){
  base.variants.forEach((v,i)=>{
    const b=el("button",{class:i?"sec":""},v.key); b.style.marginRight="6px";
    b.onclick=()=>{ setActive(v); $("eqn").textContent=base.eqn; resetView(); draw();
      [...$("variants").children].forEach(c=>c.className="sec"); b.className=""; };
    $("variants").appendChild(b);
  });
}

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

// ===================== §10.3 polar mode (gated behind base.polar) =====================
function buildTablePolar(){
  TS = (cur.mainAngles||[]).map(a=>({t:a.t,lab:a.lab,fam:a.fam}));
  const tbl=$("vtbl"); tbl.innerHTML=""; cells={th:[],r:[],x:[],y:[]};
  const mk=(keyName,label)=>{ const tr=document.createElement("tr");
    const th=document.createElement("th"); th.textContent=label; th.className="rl"; tr.appendChild(th);
    for(let i=0;i<TS.length;i++){ const td=document.createElement("td");
      td.className="pcol fam-"+TS[i].fam; td.title="snap θ = "+TS[i].lab;
      td.onclick=()=>{ $("t").value=TS[i].t; draw(); };
      tr.appendChild(td); cells[keyName].push(td); }
    tbl.appendChild(tr); };
  mk("th","θ"); mk("r","r"); mk("x","x"); mk("y","y");
}
function updateTablePolar(current){
  if(!cells||!cells.th) return;
  let near=0,nd=1e9; for(let i=0;i<TS.length;i++){ const d=Math.abs(TS[i].t-current); if(d<nd){nd=d;near=i;} }
  for(let i=0;i<TS.length;i++){ const C=TS[i], ti=C.t, filled=ti<=current+1e-9;
    const rr=cur.r(ti), xx=cur.x(ti,params), yy=cur.y(ti,params), active=(i===near);
    cells.th[i].textContent = filled?C.lab:"";
    cells.r[i].textContent  = filled?f2(rr):"";
    cells.x[i].textContent  = filled?f2(xx):"";
    cells.y[i].textContent  = filled?f2(yy):"";
    [cells.th[i],cells.r[i],cells.x[i],cells.y[i]].forEach(td=>{
      td.classList.toggle("active",active);
      td.style.background = active?(FAMSTRONG[C.fam]||""):"";
    });
  }
  const cell=cells.th[near]; if(cell&&tblwrap){ tblwrap.scrollLeft=Math.max(0,(cell.offsetLeft||0)-(tblwrap.clientWidth||300)*0.5); }
}
function buildSnaps(){ const box=$("snaps"); if(!box) return; box.innerHTML="";
  const lab=document.createElement("span"); lab.className="hint"; lab.textContent="Snap θ: "; box.appendChild(lab);
  (base.mainAngles||[]).forEach(ag=>{ const b=document.createElement("button"); b.className="snapbtn"; b.textContent=ag.lab;
    b.onclick=()=>{ $("t").value=ag.t; draw(); }; box.appendChild(b); });
}
function drawPolar(){
  const w=cv.width,h=cv.height; ctx.clearRect(0,0,w,h);
  const a=cur.tmin, b=cur.tmax, tc=parseFloat($("t").value);
  const R=(cur.rmax||1)*1.22, s=Math.min(w,h)/(2*R)*view.scale, ox=w/2+view.ox, oy=h/2+view.oy;
  const PX=X=>ox+X*s, PY=Y=>oy-Y*s, pol=(rr,th)=>[rr*Math.cos(th),rr*Math.sin(th)];
  ctx.strokeStyle="#e7edf3"; ctx.lineWidth=1;
  (cur.rings||[0.5,1]).forEach(rr=>{ ctx.beginPath(); ctx.arc(ox,oy,rr*s,0,TAU); ctx.stroke(); });
  ctx.fillStyle="#9aa7b4"; ctx.font="11px system-ui";
  (cur.rings||[]).forEach(rr=>{ ctx.fillText(String(rr), PX(rr)+3, oy-3); });
  ctx.textAlign="center"; ctx.textBaseline="middle";
  (cur.mainAngles||[]).forEach(ag=>{ if(Math.abs(ag.t-TAU)<1e-9) return;
    const col=FAM[ag.fam]||"#888", e=pol(cur.rmax||1,ag.t), neg=cur.r(ag.t)<-1e-9;
    ctx.strokeStyle=col; ctx.lineWidth=(ag.fam==="axis")?2:1; ctx.setLineDash(neg?[5,4]:[]);
    ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(PX(e[0]),PY(e[1])); ctx.stroke(); ctx.setLineDash([]);
    const L=pol((cur.rmax||1)*1.1,ag.t); ctx.fillStyle="#5b6b7a"; ctx.font="11px system-ui";
    ctx.fillText(ag.lab, PX(L[0]), PY(L[1])); });
  ctx.textAlign="start"; ctx.textBaseline="alphabetic";
  const arc=(t0,t1,st,wd)=>{ ctx.strokeStyle=st; ctx.lineWidth=wd; ctx.beginPath(); let on=false; const N=600;
    for(let i=0;i<=N;i++){ const th=t0+(t1-t0)*i/N, p=pol(cur.r(th),th), sx=PX(p[0]),sy=PY(p[1]);
      if(!isFinite(sx)||!isFinite(sy)){on=false;continue;} on?ctx.lineTo(sx,sy):(ctx.moveTo(sx,sy),on=true);} ctx.stroke(); };
  arc(a,b,"#b9d4ec",2); arc(a,tc,"#005AAA",3);
  const sig=(b-a)*0.075||1, tail=3*sig, MSEG=46; ctx.lineCap="round"; ctx.lineWidth=4; let pX=null,pY=null;
  for(let kk=MSEG;kk>=0;kk--){ const u=tail*kk/MSEG, sth=tc-dir*u; if(sth<a-1e-9||sth>b+1e-9){pX=null;continue;}
    const p=pol(cur.r(sth),sth), sx=PX(p[0]),sy=PY(p[1]);
    if(pX!==null&&isFinite(sx)){ const al=Math.exp(-(u/sig)*(u/sig)); ctx.strokeStyle="rgba("+RED+","+(0.9*al).toFixed(3)+")";
      ctx.beginPath();ctx.moveTo(pX,pY);ctx.lineTo(sx,sy);ctx.stroke(); } pX=sx;pY=sy; }
  ctx.lineCap="butt";
  let near=0,nd=1e9; (cur.mainAngles||[]).forEach((ag,i)=>{const d=Math.abs(ag.t-tc); if(d<nd){nd=d;near=i;}});
  const NA=(cur.mainAngles||[])[near]||{fam:"axis",lab:tc.toFixed(2)};
  const rc=cur.r(tc), pc=pol(rc,tc), CX=PX(pc[0]),CY=PY(pc[1]);
  { const e=pol(cur.rmax||1,tc); ctx.save(); ctx.globalAlpha=0.45; ctx.strokeStyle=FAM[NA.fam]||"#888"; ctx.lineWidth=3.5;
    ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(PX(e[0]),PY(e[1]));ctx.stroke(); ctx.restore(); }
  if(rc<-1e-9){ const g=pol(Math.abs(rc),tc); ctx.strokeStyle="#9aa7b4"; ctx.setLineDash([5,4]); ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(PX(g[0]),PY(g[1]));ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle="#9aa7b4"; ctx.beginPath();ctx.arc(PX(g[0]),PY(g[1]),3,0,TAU);ctx.fill();
      ctx.strokeStyle="#C42327"; ctx.lineWidth=2.5; ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(CX,CY);ctx.stroke();
  } else { ctx.strokeStyle=FAM[NA.fam]||"#C42327"; ctx.lineWidth=2.5; ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(CX,CY);ctx.stroke(); }
  ctx.fillStyle="#1d2733"; ctx.beginPath();ctx.arc(ox,oy,3.5,0,TAU);ctx.fill();
  ctx.fillStyle="#C42327"; ctx.beginPath();ctx.arc(CX,CY,5,0,TAU);ctx.fill();
  ctx.fillStyle="#1d2733"; ctx.font="bold 12px system-ui";
  (cur.notes||[]).forEach(nt=>{ const p=pol(cur.r(nt.t),nt.t); ctx.fillText(nt.txt, PX(p[0])+8, PY(p[1])-6); });
  $("tval").textContent = (nd<0.03?NA.lab:tc.toFixed(3));
  $("xv").textContent=(Math.abs(pc[0])<5e-4?0:pc[0]).toFixed(3); $("yv").textContent=(Math.abs(pc[1])<5e-4?0:pc[1]).toFixed(3);
  const pb=$("polarbox"); if(pb){ pb.innerHTML=`θ = <b>${nd<0.03?NA.lab:tc.toFixed(2)}</b> &nbsp;·&nbsp; r = <b>${f2(rc)}</b> &nbsp;·&nbsp; (x, y) = (${f2(pc[0])}, ${f2(pc[1])})`+(rc<-1e-9?` &nbsp;·&nbsp; <span style="color:#C42327;font-weight:700">r&lt;0 → plotted at θ+π</span>`:``); }
  updateTablePolar(tc);
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
  if(base.polar){ drawPolar(); return; }
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
  const teff = cur.tangent ? snapT(tc) : tc;
  // full path (faint)
  ctx.strokeStyle="#b9d4ec"; ctx.lineWidth=2; ctx.beginPath(); let st=false;
  for(let i=0;i<=1400;i++){ const t=a+(b-a)*i/1400, X=TX(cur.x(t,params)), Y=TY(cur.y(t,params));
    if(!isFinite(X)||!isFinite(Y)){st=false;continue;} st?ctx.lineTo(X,Y):(ctx.moveTo(X,Y),st=true); }
  ctx.stroke();
  // traced so far (bold blue, tmin..tc)
  ctx.strokeStyle="#005AAA"; ctx.lineWidth=3; ctx.beginPath(); st=false;
  for(let i=0;i<=1400;i++){ const t=a+(tc-a)*i/1400, X=TX(cur.x(t,params)), Y=TY(cur.y(t,params));
    if(!isFinite(X)||!isFinite(Y)){st=false;continue;} st?ctx.lineTo(X,Y):(ctx.moveTo(X,Y),st=true); }
  ctx.stroke();
  // §10.2 moving tangent line (tangent mode only) — under the comet-tail & point
  if(cur.tangent){
    const pT=cur.x(teff,params), qT=cur.y(teff,params), dT=derivAt(teff);
    ctx.save(); ctx.lineWidth=(dT.isH||dT.isV)?3.6:2.4; ctx.setLineDash([7,5]);
    ctx.strokeStyle = dT.isV?"#e64a19" : dT.isH?"#0a8f5b" : "#5e35b1";
    const vx=dT.dxdt, vy=dT.dydt; ctx.beginPath();   // draw from the DIRECTION VECTOR (x',y'): (x,y) = (pT,qT) + s*(vx,vy)
    if(Math.abs(vx)>=Math.abs(vy)){ const m=vy/vx; ctx.moveTo(TX(xL),TY(qT+m*(xL-pT))); ctx.lineTo(TX(xR),TY(qT+m*(xR-pT))); }
    else { const mi=vx/vy; ctx.moveTo(TX(pT+mi*(yB-qT)),TY(yB)); ctx.lineTo(TX(pT+mi*(yT-qT)),TY(yT)); }
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  }
  // comet tail: red, brightest at the point, fading with the SAME distance decay as the table glow
  const sig=(b-a)*0.075 || 1, tailSpan=3*sig, MSEG=46;
  ctx.lineWidth=4; ctx.lineCap="round"; let pX=null,pY=null;
  for(let kk=MSEG;kk>=0;kk--){
    const u=tailSpan*kk/MSEG, s=tc-dir*u;
    if(s<a-1e-9||s>b+1e-9){ pX=null; continue; }
    const X=TX(cur.x(s,params)), Y=TY(cur.y(s,params));
    if(pX!==null && isFinite(X)&&isFinite(Y)){
      const al=Math.exp(-(u/sig)*(u/sig));
      ctx.strokeStyle="rgba("+RED+","+(0.9*al).toFixed(3)+")";
      ctx.beginPath();ctx.moveTo(pX,pY);ctx.lineTo(X,Y);ctx.stroke();
    }
    pX=X;pY=Y;
  }
  ctx.lineCap="butt";
  // moving point + orientation arrow
  const px=cur.x(teff,params), py=cur.y(teff,params), dt=(b-a)/2000;
  let ddx=(cur.x(teff+dt,params)-px)*dir, ddy=(cur.y(teff+dt,params)-py)*dir, L=Math.hypot(ddx,ddy)||1; ddx/=L; ddy/=L;
  const SX=TX(px), SY=TY(py), ax=SX+ddx*34, ay=SY-ddy*34;
  ctx.strokeStyle="#C42327"; ctx.fillStyle="#C42327"; ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(SX,SY);ctx.lineTo(ax,ay);ctx.stroke();
  const an=Math.atan2(ay-SY,ax-SX);
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-10*Math.cos(an-0.4),ay-10*Math.sin(an-0.4));ctx.lineTo(ax-10*Math.cos(an+0.4),ay-10*Math.sin(an+0.4));ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.arc(SX,SY,5,0,TAU);ctx.fill();
  // §10.2 H/V tangent reference markers + pulse + live slope readout
  if(cur.tangent){
    const dR=derivAt(tc), dRead=derivAt(snapT(tc));   // dR: actual t (visual H/V flash) · dRead: snapped (slope readout)
    const markHV=(pts,col,active)=>{ if(!pts||!pts.length) return;
      let ni=0,nd=1e9; pts.forEach((P0,i)=>{ const q=Math.hypot(P0.x-px,P0.y-py); if(q<nd){nd=q;ni=i;} });
      pts.forEach((P0,i)=>{ const near=active&&i===ni, X=TX(P0.x), Y=TY(P0.y);
        const r=near? 7+1.6*Math.sin(Date.now()/110) : 4.5;
        ctx.lineWidth=2; ctx.strokeStyle=col; ctx.fillStyle=near?col:"#ffffff";
        ctx.beginPath(); ctx.arc(X,Y,r,0,TAU); ctx.fill(); ctx.stroke(); }); };
    markHV(cur.vpts,"#e64a19",dR.isV);
    markHV(cur.hpts,"#0a8f5b",dR.isH);
    ctx.font="bold 12px system-ui"; ctx.textAlign="center";
    if(cur.hpts){ ctx.fillStyle="#0a8f5b"; cur.hpts.forEach(P0=>ctx.fillText("H", TX(P0.x)+(P0.x>=0?15:-15), TY(P0.y)+4)); }
    if(cur.vpts){ ctx.fillStyle="#e64a19"; cur.vpts.forEach(P0=>ctx.fillText("V", TX(P0.x), TY(P0.y)+(P0.y>=0?-11:18))); }
    ctx.textAlign="start";
    const _sv=$("sv"); if(_sv){ _sv.textContent=slopeText(dRead,true);
      _sv.style.color = slopeVertical(dRead)?"#e64a19" : dRead.isH?"#0a8f5b" : "#1d2733";
      const _dc=$("dcomp"); if(_dc) _dc.textContent="(dy/dt = "+fmt(dRead.dydt)+",  dx/dt = "+fmt(dRead.dxdt)+")"; }
    const _eq=$("taneq"); if(_eq){ const te=tangentEq(tc);
      _eq.innerHTML='<span class="lab">Tangent line at current point:</span> <span class="eq" style="color:'+te.col+'">'+te.eq+'</span>'+(te.tag?' <span class="tag">('+te.tag+')</span>':''); }
    if(base.concavity){ const cc=$("concbox"); if(cc){ const xp=cur.dx?cur.dx(teff,params):2*teff; let ct,cco;
      if(Math.abs(xp)<1e-6){ ct="undefined  (x' = 0, vertical tangent)"; cco="#e64a19"; }
      else if(cur.infl!=null && Math.abs(teff-cur.infl)<1e-6){ ct="inflection point  (d²y/dx² = 0)"; cco="#5e35b1"; }
      else { const d2v=cur.d2?cur.d2(teff,params):0; ct=d2v>0?"concave up  (d²y/dx² > 0)":"concave down  (d²y/dx² < 0)"; cco=d2v>0?"#0a8f5b":"#e64a19"; }
      cc.innerHTML='<span class="lab">Concavity:</span> <span class="eq" style="color:'+cco+'">'+escHtml(ct)+'</span>'; } }
  }
  const _sc=cur.tangent?snapCrit(tc):null; $("tval").textContent=_sc?_sc.lab:tc.toFixed(3); $("xv").textContent=(Math.abs(px)<5e-4?0:px).toFixed(3); $("yv").textContent=(Math.abs(py)<5e-4?0:py).toFixed(3);
  updateTable(tc);
}

function tick(){ if(!playing)return;
  const a=parseFloat($("tmin").value), b=parseFloat($("tmax").value);
  let t=parseFloat($("t").value)+dir*(b-a)*0.0016*parseFloat($("speed").value);
  if(t>b) t=a; if(t<a) t=b; $("t").value=t; draw(); raf=requestAnimationFrame(tick);
}
function resetView(){ view={scale:1,ox:0,oy:0}; }

$("t").oninput=draw;
$("tmin").onchange=()=>{ $("t").min=$("tmin").value; (base.polar?buildTablePolar:buildTable)(); draw(); };
$("tmax").onchange=()=>{ $("t").max=$("tmax").value; (base.polar?buildTablePolar:buildTable)(); draw(); };
$("play").onclick=()=>{ playing=!playing; $("play").textContent=playing?"❚❚ Pause":"▶ Play"; if(playing)raf=requestAnimationFrame(tick); else cancelAnimationFrame(raf); };
$("dir").onclick=()=>{ dir=-dir; $("dir").textContent = dir>0?"⇄ Reverse":"⇄ Forward"; draw(); };
$("reset").onclick=()=>{ playing=false; $("play").textContent="▶ Play"; cancelAnimationFrame(raf); dir=1; $("dir").textContent="⇄ Reverse"; buildParams(); setActive(base.variants?base.variants[0]:base); resetView(); draw(); };
cv.addEventListener("wheel",e=>{ e.preventDefault(); const r=cv.getBoundingClientRect();
  const mx=(e.clientX-r.left)*cv.width/r.width, my=(e.clientY-r.top)*cv.height/r.height;
  const f=e.deltaY<0?1.1:1/1.1; view.scale*=f;
  view.ox=(mx-cv.width/2)*(1-f)+f*view.ox; view.oy=(my-cv.height/2)*(1-f)+f*view.oy; draw(); },{passive:false});
let drag=null;
cv.addEventListener("mousedown",e=>{ drag={x:e.clientX,y:e.clientY}; });
window.addEventListener("mousemove",e=>{ if(!drag)return; const r=cv.getBoundingClientRect();
  view.ox+=(e.clientX-drag.x)*cv.width/r.width; view.oy+=(e.clientY-drag.y)*cv.height/r.height; drag={x:e.clientX,y:e.clientY}; draw(); });
window.addEventListener("mouseup",()=>drag=null);

$("ttl").textContent = base.label;
$("eqn").textContent = base.eqn;
if(base.tangent){ const _sb=$("slopebox"); if(_sb) _sb.style.display=""; const _te=$("taneq"); if(_te) _te.style.display=""; } if(base.concavity){ const _cb=$("concbox"); if(_cb) _cb.style.display=""; }
buildParams();
setActive(base.variants?base.variants[0]:base);
if(base.tangent) buildSummary();
if(base.polar){ const _pb=$("polarbox"); if(_pb)_pb.style.display=""; buildSnaps(); }
draw();
})();
