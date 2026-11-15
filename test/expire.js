/* =========================================================
   AI mania テストルーム共通：掲載期限とモグボの「たべちゃう」演出
   使い方（各テストページの </body> 直前）：
   <script src="/test/expire.js" data-deadline="2026-11-16T12:00:00+09:00"
           data-reason="次のテストサイトの順番が迫っているため"></script>
   ・期限前：画面下に小さなカウントダウンを表示
   ・期限後：10秒だけ見えたあと、モグボが来てページを端から食べていき、
             「ふぅ〜…」と満腹になって去り、NOT FOUND を表示
   ========================================================= */
(function(){
  var me=document.currentScript;
  var DL=new Date((me&&me.getAttribute('data-deadline'))||'2099-01-01T00:00:00+09:00').getTime();
  var REASON=(me&&me.getAttribute('data-reason'))||'次のテストサイトの順番が迫っているため';
  var GRACE=+((me&&me.getAttribute('data-grace'))||10);
  var reduce=matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var z=function(n){return ('0'+n).slice(-2)};
  var d0=new Date(DL);
  var when=(d0.getMonth()+1)+'/'+d0.getDate()+' '+z(d0.getHours())+':'+z(d0.getMinutes());

  /* ---------- 見た目 ---------- */
  var css=''+
  '@import url("https://fonts.googleapis.com/css2?family=DotGothic16&display=swap");'+
  '.amx-pill{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:calc(100vw - 24px);padding:8px 14px 8px 10px;border-radius:999px;background:rgba(29,29,31,.86);color:#f4f1ea;font:500 11.5px/1.4 "Noto Sans JP",system-ui,sans-serif;letter-spacing:.04em;box-shadow:0 8px 24px rgba(0,0,0,.18);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);pointer-events:auto}'+
  '.amx-pill svg{flex:none;width:22px;height:22px;image-rendering:pixelated}'+
  '.amx-pill b{font-family:"DotGothic16",monospace;font-weight:400;font-size:14px;letter-spacing:.06em;color:#FFD21F;font-variant-numeric:tabular-nums}'+
  '.amx-pill small{opacity:.72;font-size:10.5px}'+
  '.amx-pill .amx-x{border:0;background:none;color:inherit;opacity:.5;font-size:14px;cursor:pointer;padding:0 0 0 4px}'+
  '.amx-pill.min small,.amx-pill.min .amx-sep{display:none}'+
  '.amx-pill.end{background:rgba(255,75,58,.92)}.amx-pill.end b{color:#fff}'+
  '@media(max-width:520px){.amx-pill small{display:none}.amx-pill .amx-sep{display:none}}'+
  '.amx-mog{position:fixed;left:0;top:0;z-index:2147483600;width:84px;height:84px;pointer-events:none;transition:transform .22s linear;will-change:transform;filter:drop-shadow(0 6px 0 rgba(0,0,0,.12))}'+
  '.amx-mog svg{width:100%;height:100%;image-rendering:pixelated;transition:transform .3s}'+
  '.amx-mog .m-open{display:none}.amx-mog.chomp .m-open{display:block}.amx-mog.chomp .m-close{display:none}'+
  '.amx-mog.flip svg{transform:scaleX(-1)}'+
  '.amx-say{position:fixed;z-index:2147483601;transform:translate(-50%,-100%);background:#fff;color:#1D1D1F;border:3px solid #1D1D1F;padding:8px 14px;font:400 16px/1.3 "DotGothic16",monospace;white-space:nowrap;box-shadow:4px 4px 0 #1D1D1F;pointer-events:none}'+
  '.amx-crumb{position:fixed;z-index:2147483500;width:7px;height:7px;pointer-events:none;transition:transform .55s cubic-bezier(.2,.7,.3,1),opacity .55s}'+
  '.amx-eaten{transition:transform .2s ease-in,opacity .2s ease-in,filter .2s!important;transform-origin:left center!important;transform:scale(.15) translateX(-30%)!important;opacity:0!important;filter:blur(2px)!important}'+
  '.amx-gone{visibility:hidden!important}'+
  '.amx-veil{position:fixed;inset:0;z-index:2147483400;background:#F3EFE4;opacity:0;transition:opacity .8s;pointer-events:none}'+
  '.amx-404{position:fixed;inset:0;z-index:2147483700;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:#F3EFE4;color:#1D1D1F;font-family:"DotGothic16",monospace;text-align:center;padding:24px;opacity:0;transition:opacity .6s}'+
  '.amx-404.on{opacity:1}'+
  '.amx-404 .n{font-size:clamp(72px,18vw,150px);line-height:1;letter-spacing:.06em;text-shadow:6px 6px 0 #FFD21F}'+
  '.amx-404 .t{font-size:clamp(18px,4vw,26px);letter-spacing:.3em}'+
  '.amx-404 p{font-size:14px;line-height:1.9;margin:6px 0 0;color:#4a4740}'+
  '.amx-404 .plate{width:120px;height:14px;border-radius:50%;background:rgba(0,0,0,.08);margin-top:6px;position:relative}'+
  '.amx-404 .plate:before{content:"";position:absolute;left:50%;top:-18px;width:10px;height:10px;background:#d8cdbd;transform:translateX(-30px);box-shadow:22px 6px 0 #c9bba8,44px -2px 0 #d8cdbd}'+
  '.amx-404 a{margin-top:14px;font-size:14px;color:#1D1D1F;border:3px solid #1D1D1F;padding:8px 16px;text-decoration:none;box-shadow:4px 4px 0 #1D1D1F;background:#fff}'+
  '.amx-404 a:hover{background:#FFD21F}'+
  'html.amx-lock,html.amx-lock body{overflow:hidden!important}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  /* モグボ（サイトのドット絵と同じ 12×12）。口あり／なしの2コマ */
  function mogSVG(full){
    var Y='#FFD21F',D='#1D1D1F',R='#FF4B3A';
    var w=full?'1.2':'1';
    return '<svg viewBox="0 0 12 12" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg"><g transform="translate(6 0) scale('+w+' 1) translate(-6 0)">'+
      '<rect x="5" y="0" width="2" height="1" fill="'+R+'"/><rect x="5" y="1" width="2" height="1" fill="'+D+'"/>'+
      '<rect x="3" y="2" width="6" height="1" fill="'+D+'"/><rect x="2" y="3" width="1" height="1" fill="'+D+'"/><rect x="9" y="3" width="1" height="1" fill="'+D+'"/>'+
      '<rect x="1" y="4" width="1" height="5" fill="'+D+'"/><rect x="10" y="4" width="1" height="5" fill="'+D+'"/>'+
      '<rect x="3" y="3" width="6" height="1" fill="'+Y+'"/><rect x="2" y="4" width="8" height="5" fill="'+Y+'"/>'+
      '<rect x="2" y="9" width="8" height="1" fill="'+D+'"/>'+
      '<rect x="3" y="10" width="2" height="1" fill="'+D+'"/><rect x="7" y="10" width="2" height="1" fill="'+D+'"/><rect x="2" y="11" width="3" height="1" fill="'+D+'"/><rect x="7" y="11" width="3" height="1" fill="'+D+'"/>'+
      (full
        ? '<rect x="3" y="5" width="2" height="1" fill="'+D+'"/><rect x="7" y="5" width="2" height="1" fill="'+D+'"/><rect x="4" y="7" width="4" height="1" fill="'+D+'"/><rect x="3" y="6" width="1" height="1" fill="#FF9C8A"/><rect x="8" y="6" width="1" height="1" fill="#FF9C8A"/>'
        : '<rect x="4" y="5" width="1" height="2" fill="'+D+'"/><rect x="7" y="5" width="1" height="2" fill="'+D+'"/>'+
          '<g class="m-close"><rect x="5" y="7" width="2" height="1" fill="'+D+'"/></g>'+
          '<g class="m-open"><rect x="4" y="7" width="4" height="2" fill="'+D+'"/><rect x="5" y="8" width="2" height="1" fill="'+R+'"/></g>')+
      '</g></svg>';
  }

  /* ---------- 期限前：カウントダウン ---------- */
  var pill=document.createElement('div');pill.className='amx-pill';pill.setAttribute('role','status');
  pill.innerHTML=mogSVG(false).replace('<svg','<svg aria-hidden="true"')+
    '<span>公開終了まで <b id="amx-t">--:--:--</b></span><span class="amx-sep" aria-hidden="true">｜</span><small>'+REASON+'、'+when+' で閲覧できなくなります</small>'+
    '<button class="amx-x" type="button" aria-label="小さくする">×</button>';
  function mount(){document.body.appendChild(pill);pill.querySelector('.amx-x').onclick=function(){pill.classList.toggle('min')}}
  if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);

  var started=false;
  function tick(){
    var left=DL-Date.now(),t=document.getElementById('amx-t');
    if(left>0){
      var s=Math.floor(left/1000),d=Math.floor(s/86400);s-=d*86400;
      if(t)t.textContent=(d?d+'日 ':'')+z(Math.floor(s/3600))+':'+z(Math.floor(s%3600/60))+':'+z(s%60);
      return;
    }
    if(started)return;started=true;clearInterval(iv);startGrace();
  }
  var iv=setInterval(tick,1000);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',tick);else tick();

  /* ---------- 期限後：10秒 → モグボ ---------- */
  function startGrace(){
    var n=GRACE;pill.classList.add('end');pill.classList.remove('min');
    var t=pill.querySelector('span');var sm=pill.querySelector('small');
    t.innerHTML='公開期間が終了しました <b>'+n+'</b>';if(sm)sm.textContent='このページはまもなく閉じます';
    var g=setInterval(function(){n--;var b=t.querySelector('b');if(b)b.textContent=n;if(n<=0){clearInterval(g);eatAll()}},1000);
  }

  function rect(el){return el.getBoundingClientRect()}
  function visible(el){
    if(!el.getClientRects().length)return false;
    var cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||+cs.opacity===0)return false;
    var r=rect(el);return r.width*r.height>=300;
  }
  function targets(){
    var sel='img,video,svg,canvas,picture,iframe,h1,h2,h3,h4,h5,p,li,dt,dd,blockquote,figcaption,button,a,input,textarea,select,summary,label,small,.chips span,td,th';
    var all=[].slice.call(document.querySelectorAll(sel)).filter(function(el){
      if(el.closest('.amx-pill,.amx-mog,.amx-404,.amx-say,script,style,noscript'))return false;
      if(el.closest('svg')&&el.tagName.toLowerCase()!=='svg')return false;
      return visible(el);
    });
    /* 入れ子は外側だけ残す（a の中の img などは一緒に食べる） */
    var out=all.filter(function(el){return !all.some(function(o){return o!==el&&o.contains(el)})});
    out.sort(function(a,b){var ra=rect(a),rb=rect(b);return (ra.top+scrollY)-(rb.top+scrollY)||ra.left-rb.left});
    return out;
  }
  function blocks(){
    /* 文字や画像を食べたあとに残る「箱」（背景・枠） */
    var c=[].slice.call(document.querySelectorAll('body *')).filter(function(el){
      if(el.closest('.amx-pill,.amx-mog,.amx-404,.amx-say,.amx-veil'))return false;
      if(el.classList.contains('amx-gone'))return false;
      var cs=getComputedStyle(el);
      var bg=cs.backgroundColor!=='rgba(0, 0, 0, 0)'||cs.backgroundImage!=='none'||parseFloat(cs.borderTopWidth)>0||cs.boxShadow!=='none';
      return bg&&visible(el);
    });
    c=c.filter(function(el){return !c.some(function(o){return o!==el&&el.contains(o)})});
    c.sort(function(a,b){return (rect(a).top+scrollY)-(rect(b).top+scrollY)});
    return c;
  }

  var mog,mx=-120,my=120;
  function place(x,y){mx=x;my=y;mog.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px)'}
  function crumbs(x,y,color){
    for(var i=0;i<6;i++){
      var c=document.createElement('i');c.className='amx-crumb';c.style.left=x+'px';c.style.top=y+'px';
      c.style.background=color||['#d8cdbd','#FFD21F','#c9bba8','#1D1D1F'][i%4];document.body.appendChild(c);
      (function(c){requestAnimationFrame(function(){c.style.transform='translate('+(Math.random()*80-40)+'px,'+(Math.random()*60-10)+'px) rotate('+(Math.random()*180)+'deg)';c.style.opacity='0'});setTimeout(function(){c.remove()},600)})(c);
    }
  }
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}
  function say(text,ms){
    var b=document.createElement('div');b.className='amx-say';b.textContent=text;
    var r=mog.getBoundingClientRect();b.style.left=(r.left+r.width/2)+'px';b.style.top=(r.top-10)+'px';
    document.body.appendChild(b);var bw=b.offsetWidth;b.style.left=Math.max(bw/2+8,Math.min(innerWidth-bw/2-8,r.left+r.width/2))+'px';return wait(ms).then(function(){b.remove()});
  }

  async function bite(el,speed){
    var r=rect(el);
    if(r.top<70||r.bottom>innerHeight-20){
      window.scrollTo({top:Math.max(0,r.top+scrollY-innerHeight*.35),behavior:'instant'});r=rect(el);
    }
    var tx=Math.max(4,Math.min(innerWidth-88,r.left-30)),ty=Math.max(4,Math.min(innerHeight-90,r.top+r.height/2-42));
    mog.classList.toggle('flip',tx<mx);
    mog.style.transitionDuration=speed+'ms';place(tx,ty);
    await wait(speed);
    mog.classList.add('chomp');el.classList.add('amx-eaten');
    crumbs(r.left+Math.min(r.width,60),r.top+Math.min(r.height,40)/2);
    await wait(Math.max(60,speed*.7));
    mog.classList.remove('chomp');el.classList.add('amx-gone');
  }

  async function eatAll(){
    if(pill)pill.remove();
    document.documentElement.classList.add('amx-lock');
    mog=document.createElement('div');mog.className='amx-mog';mog.innerHTML=mogSVG(false);document.body.appendChild(mog);
    window.scrollTo({top:0,behavior:'instant'});
    mog.style.transitionDuration='0ms';place(-100,innerHeight*.3);await wait(50);
    mog.style.transitionDuration='700ms';place(24,innerHeight*.3);await wait(750);
    await say('いただきまーす！',900);

    var list=targets();var MAX=reduce?12:90;
    if(list.length>MAX){var step=list.length/MAX,pick=[];for(var i=0;i<MAX;i++)pick.push(list[Math.floor(i*step)]);
      list.forEach(function(el){if(pick.indexOf(el)<0)el.dataset.amxRest='1'});list=pick}
    for(var k=0;k<list.length;k++){
      var sp=Math.max(55,240-k*5);
      if(reduce)sp=60;
      await bite(list[k],sp);
      /* 食べ残し（間引いた分）はまとめて消す */
      if(k%6===5)[].slice.call(document.querySelectorAll('[data-amx-rest]')).forEach(function(el){var r=rect(el);if(r.bottom<rect(list[k]).bottom+40){el.classList.add('amx-gone');delete el.dataset.amxRest}});
    }
    [].slice.call(document.querySelectorAll('[data-amx-rest]')).forEach(function(el){el.classList.add('amx-gone')});

    /* 箱も食べる */
    var bx=blocks().slice(0,reduce?4:24);
    for(var j=0;j<bx.length;j++)await bite(bx[j],Math.max(50,120-j*4));

    /* 満腹 → ふぅ〜 → 消える */
    var veil=document.createElement('div');veil.className='amx-veil';document.body.appendChild(veil);
    requestAnimationFrame(function(){veil.style.opacity='1'});
    mog.classList.remove('flip','chomp');mog.style.transitionDuration='600ms';
    place(innerWidth/2-42,innerHeight/2-60);await wait(700);
    mog.innerHTML=mogSVG(true);mog.style.transition='transform .5s cubic-bezier(.3,1.6,.5,1)';
    mog.style.transform+=' scale(1.5)';await wait(500);
    await say('ふぅ〜…  まんぷく。',1500);
    mog.style.transition='transform 1.4s ease-in, opacity 1.4s ease-in';
    mog.style.transform='translate('+(innerWidth/2-42)+'px,'+(-160)+'px) scale(1.2)';mog.style.opacity='0';
    var hu=document.createElement('div');hu.className='amx-say';hu.textContent='HU〜♪';hu.style.left=(innerWidth/2)+'px';hu.style.top=(innerHeight/2-90)+'px';hu.style.transition='transform 1.4s ease-in,opacity 1.4s';document.body.appendChild(hu);
    requestAnimationFrame(function(){hu.style.transform='translate(-50%,-260%)';hu.style.opacity='0'});
    await wait(1300);
    show404();
  }

  function show404(){
    var nf=document.createElement('div');nf.className='amx-404';nf.setAttribute('role','alert');
    nf.innerHTML='<div class="n">404</div><div class="t">NOT FOUND</div><div class="plate" aria-hidden="true"></div>'+
      '<p>このテストページの公開期間は終了しました。<br>（中身は モグボが ぜんぶ たべました）</p>'+
      '<a href="https://aimania.tech/">aimania.tech へ</a>';
    document.body.appendChild(nf);requestAnimationFrame(function(){nf.classList.add('on')});
    document.title='404 NOT FOUND';
  }
})();
