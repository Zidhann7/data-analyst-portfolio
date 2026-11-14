/* touch-effects.js — finger glow, ripples, dot trail and scroll bar for phones.
   Add to your page with:  <script src="touch-effects.js" defer></script>  (just before </body>) */
(function(){
  var st=document.createElement('style');
  st.textContent="/* ===== Touch (phone) animations: finger glow, tap ripple, scroll progress ===== */\n  .touch-glow,.touch-ripple{position:fixed;left:0;top:0;pointer-events:none;border-radius:50%;}\n  .touch-glow{width:120px;height:120px;margin:-60px 0 0 -60px;z-index:399;opacity:0;transition:opacity .45s ease;will-change:transform,opacity;\n    background:radial-gradient(circle,rgba(90,110,255,.36),rgba(110,100,255,.14) 45%,transparent 70%);}\n  .touch-glow.on{opacity:1;}\n  .touch-ripple{width:80px;height:80px;margin:-40px 0 0 -40px;z-index:400;transform:scale(.25);opacity:.9;border:1.5px solid rgba(81,89,217,.55);\n    background:radial-gradient(circle,rgba(90,110,255,.22),transparent 70%);box-shadow:0 0 14px rgba(90,110,255,.28);animation:touchRipple 1.1s cubic-bezier(.22,1,.36,1) forwards;}\n  .touch-ripple.r2{border-color:rgba(146,112,216,.45);animation-delay:.15s;animation-duration:1.3s;}\n  @keyframes touchRipple{to{transform:scale(1.9);opacity:0;}}\n  .touch-dot{position:fixed;left:0;top:0;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;pointer-events:none;z-index:398;\n    background:radial-gradient(circle,var(--tc,#5159D9) 25%,transparent 72%);box-shadow:0 0 8px var(--tc,#5159D9);animation:touchDot 1.1s cubic-bezier(.22,1,.36,1) forwards;}\n  @keyframes touchDot{from{transform:scale(1);opacity:.8;}to{transform:translateY(-10px) scale(.2);opacity:0;}}\n  .scroll-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:500;pointer-events:none;transform-origin:0 50%;transform:scaleX(0);\n    background:linear-gradient(90deg,#4B54C9,#6488E8,#9270D8);box-shadow:0 0 10px rgba(81,89,217,.5);}\n  .fx.touch-on{translate:0 -3px;border-color:rgba(75,84,201,.4);box-shadow:0 18px 40px rgba(41,57,255,.16);}\n  .fx.touch-on::after{opacity:1;}\n  .fx.touch-on::before{opacity:1;animation:fxSweep 1s ease forwards;}\n  .pcard.in.touch-on{transform:translateY(-4px);border-color:rgba(75,84,201,.45);box-shadow:0 20px 44px rgba(41,57,255,.18);}\n  .pcard.touch-on::after{opacity:1;}\n  .pcard.touch-on::before{opacity:1;animation:cardSweep 1s ease forwards;}\n  .approach-step.touch-on,.tk-tile.touch-on .tk-ico{border-color:rgba(75,84,201,.4);box-shadow:0 16px 34px rgba(41,57,255,.16);}\n  .tk-tile.touch-on .tk-ico{transform:translateY(-4px) scale(1.06);}\n  @media(prefers-reduced-motion:reduce){.touch-glow,.touch-ripple,.touch-dot,.scroll-progress{display:none;}}\n";
  document.head.appendChild(st);
})();
/* ===== Phone / touch animations =====
   When a finger touches or drags (scrolls) on a touchscreen: a soft blue glow follows the finger,
   a ripple pops where it lands, boxes under the finger light up, and a thin bar shows scroll progress. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  var touchDevice=('ontouchstart' in window)||(navigator.maxTouchPoints>0);
  if(reduce||!touchDevice)return;

  var glow=document.createElement('div');glow.className='touch-glow';glow.setAttribute('aria-hidden','true');
  var bar=document.createElement('div');bar.className='scroll-progress';bar.setAttribute('aria-hidden','true');
  document.body.appendChild(glow);document.body.appendChild(bar);

  var tx=0,ty=0,gx=0,gy=0,ticking=false,active=null,hideT=0,lx=-999,ly=-999;
  var COLORS=['#5159D9','#6488E8','#9270D8','#B4A0EE'],ci=0;
  function ripple(x,y){
    ['','r2'].forEach(function(c){
      var rp=document.createElement('div');rp.className='touch-ripple '+c;rp.style.left=x+'px';rp.style.top=y+'px';
      document.body.appendChild(rp);rp.addEventListener('animationend',function(){rp.remove();});
    });
  }
  function dot(x,y){
    var d=document.createElement('div');d.className='touch-dot';d.style.left=x+'px';d.style.top=y+'px';
    d.style.setProperty('--tc',COLORS[ci++%COLORS.length]);
    document.body.appendChild(d);d.addEventListener('animationend',function(){d.remove();});
  }
  var SEL='.fx,.pcard,.approach-step,.tk-tile';

  function setActive(el){
    if(active===el)return;
    if(active)active.classList.remove('touch-on');
    active=el;if(active)active.classList.add('touch-on');
  }
  function frame(){
    // glow eases toward the finger for a smooth, soft follow
    gx+=(tx-gx)*.22;gy+=(ty-gy)*.22;
    glow.style.transform='translate3d('+gx.toFixed(1)+'px,'+gy.toFixed(1)+'px,0)';
    if(active){var r=active.getBoundingClientRect();active.style.setProperty('--mx',(gx-r.left)+'px');active.style.setProperty('--my',(gy-r.top)+'px');}
    if(Math.abs(tx-gx)+Math.abs(ty-gy)>.6){requestAnimationFrame(frame);}else{ticking=false;}
  }
  function track(e){
    var t=e.touches&&e.touches[0];if(!t)return;
    tx=t.clientX;ty=t.clientY;
    if(!ticking){ticking=true;requestAnimationFrame(frame);}
  }
  document.addEventListener('touchstart',function(e){
    track(e);
    clearTimeout(hideT);
    glow.classList.add('on');
    gx=tx;gy=ty;ripple(tx,ty);lx=tx;ly=ty;
    setActive(e.target.closest?e.target.closest(SEL):null);
    frame();
  },{passive:true,capture:true});
  document.addEventListener('touchmove',function(e){
    track(e);
    if(Math.hypot(tx-lx,ty-ly)>34){lx=tx;ly=ty;dot(tx,ty);}
    var t=e.touches[0],el=document.elementFromPoint(t.clientX,t.clientY);
    setActive(el&&el.closest?el.closest(SEL):null);
  },{passive:true,capture:true});
  function end(){
    glow.classList.remove('on');
    clearTimeout(hideT);
    hideT=setTimeout(function(){setActive(null);},350);
  }
  document.addEventListener('touchend',end,{passive:true,capture:true});
  document.addEventListener('touchcancel',end,{passive:true,capture:true});

  // scroll progress bar
  var sTick=false;
  function prog(){
    sTick=false;
    var h=document.documentElement.scrollHeight-window.innerHeight;
    bar.style.transform='scaleX('+(h>0?Math.min(1,Math.max(0,window.scrollY/h)):0).toFixed(4)+')';
  }
  window.addEventListener('scroll',function(){if(!sTick){sTick=true;requestAnimationFrame(prog);}},{passive:true});
  window.addEventListener('resize',prog);
  prog();
})();
