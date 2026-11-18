/* =========================================================
   AI mania テストルーム：モグボが ときどき様子を見にくる
   使い方：<script src="/test/mogubo-visit.js" defer></script>
   ・開いて約15秒後に1回だけ（同じブラウザでは1日1回まで）
   ・画面の端からぴょこっと出て「どうですか？」→「ご要望はなんでもいってね！」→ 帰る
   ・タップすると「ありがとう！」と言って帰る
   ========================================================= */
(function(){
  if(window.__mogVisit)return;window.__mogVisit=1;
  var reduce=matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MAX=1,count=0,busy=false,KEY='aim_mogv_'+location.pathname;
  try{var last=+localStorage.getItem(KEY)||0;if(Date.now()-last<86400000&&!/[?&]mogv=1/.test(location.search))count=MAX}catch(e){}
  var css=''+
  '@import url("https://fonts.googleapis.com/css2?family=DotGothic16&display=swap");'+
  '.mgv{position:fixed;bottom:-110px;z-index:2147482000;width:76px;height:76px;cursor:pointer;transition:bottom .55s cubic-bezier(.3,1.5,.5,1);filter:drop-shadow(0 6px 0 rgba(0,0,0,.12));-webkit-tap-highlight-color:transparent}'+
  '.mgv.in{bottom:14px}'+
  '.mgv svg{width:100%;height:100%;image-rendering:pixelated;display:block}'+
  '.mgv.l{left:16px}.mgv.r{right:16px}.mgv.r svg{transform:scaleX(-1)}'+
  '.mgv .m-open{display:none}.mgv.talk .m-open{display:block}.mgv.talk .m-close{display:none}'+
  '.mgv.hop{animation:mgvHop .5s ease}'+
  '@keyframes mgvHop{0%,100%{transform:translateY(0)}40%{transform:translateY(-14px)}}'+
  '.mgv-say{position:fixed;bottom:100px;z-index:2147482001;background:#fff;color:#1D1D1F;border:3px solid #1D1D1F;padding:9px 14px;font:400 15px/1.4 "DotGothic16",monospace;box-shadow:4px 4px 0 #1D1D1F;white-space:nowrap;opacity:0;transform:translateY(8px) scale(.96);transition:opacity .25s,transform .25s;pointer-events:none}'+
  '.mgv-say.on{opacity:1;transform:none}'+
  '.mgv-say.l{left:16px}.mgv-say.r{right:16px}'+
  '.mgv-say:after{content:"";position:absolute;bottom:-12px;width:12px;height:12px;background:#fff;border-right:3px solid #1D1D1F;border-bottom:3px solid #1D1D1F;transform:rotate(45deg)}'+
  '.mgv-say.l:after{left:26px}.mgv-say.r:after{right:26px}'+
  '@media(max-width:600px){.mgv{width:62px;height:62px}.mgv.in{bottom:84px}.mgv-say{bottom:156px;font-size:14px}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function svg(){
    var Y='#FFD21F',D='#1D1D1F',R='#FF4B3A',P='#FF9C8A';
    return '<svg viewBox="0 0 12 12" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">'+
      '<rect x="5" y="0" width="2" height="1" fill="'+R+'"/><rect x="5" y="1" width="2" height="1" fill="'+D+'"/>'+
      '<rect x="3" y="2" width="6" height="1" fill="'+D+'"/><rect x="2" y="3" width="1" height="1" fill="'+D+'"/><rect x="9" y="3" width="1" height="1" fill="'+D+'"/>'+
      '<rect x="1" y="4" width="1" height="5" fill="'+D+'"/><rect x="10" y="4" width="1" height="5" fill="'+D+'"/>'+
      '<rect x="3" y="3" width="6" height="1" fill="'+Y+'"/><rect x="2" y="4" width="8" height="5" fill="'+Y+'"/>'+
      '<rect x="2" y="9" width="8" height="1" fill="'+D+'"/>'+
      '<rect x="3" y="10" width="2" height="1" fill="'+D+'"/><rect x="7" y="10" width="2" height="1" fill="'+D+'"/><rect x="2" y="11" width="3" height="1" fill="'+D+'"/><rect x="7" y="11" width="3" height="1" fill="'+D+'"/>'+
      '<rect x="4" y="5" width="1" height="2" fill="'+D+'"/><rect x="7" y="5" width="1" height="2" fill="'+D+'"/>'+
      '<rect x="3" y="7" width="1" height="1" fill="'+P+'"/><rect x="8" y="7" width="1" height="1" fill="'+P+'"/>'+
      '<g class="m-close"><rect x="5" y="7" width="2" height="1" fill="'+D+'"/></g>'+
      '<g class="m-open"><rect x="5" y="7" width="2" height="2" fill="'+D+'"/></g>'+
      '</svg>';
  }
  function wait(ms){return new Promise(function(r){setTimeout(r,ms)})}

  async function visit(){
    if(busy||count>=MAX||document.visibilityState!=='visible')return;
    busy=true;count++;try{localStorage.setItem(KEY,String(Date.now()))}catch(e){}
    var side=Math.random()<.5?'l':'r';
    var m=document.createElement('div');m.className='mgv '+side;m.innerHTML=svg();m.setAttribute('role','button');m.setAttribute('aria-label','モグボ');
    var b=document.createElement('div');b.className='mgv-say '+side;
    document.body.appendChild(m);document.body.appendChild(b);
    var gone=false,talkT;
    function talk(on){m.classList.toggle('talk',on)}
    async function say(t,ms){if(gone)return;b.textContent=t;b.classList.add('on');
      var k=0;clearInterval(talkT);talkT=setInterval(function(){talk(k++%2===0)},140);
      await wait(Math.min(ms,t.length*90+300));clearInterval(talkT);talk(false);await wait(Math.max(0,ms-(t.length*90+300)));}
    async function leave(){if(gone)return;gone=true;clearInterval(talkT);b.classList.remove('on');await wait(250);m.classList.remove('in');await wait(600);m.remove();b.remove();busy=false;schedule()}
    m.addEventListener('click',async function(){if(gone)return;b.classList.remove('on');await wait(120);b.textContent='ありがとう！';b.classList.add('on');m.classList.add('hop');await wait(1000);leave()});
    requestAnimationFrame(function(){requestAnimationFrame(function(){m.classList.add('in')})});
    await wait(700);if(!reduce){m.classList.add('hop');setTimeout(function(){m.classList.remove('hop')},520)}
    await say('どうですか？',2200);
    await wait(250);if(!gone)b.classList.remove('on');await wait(220);
    await say('ご要望は なんでも いってね！',3000);
    await wait(400);leave();
  }
  var tmr;
  function schedule(first){clearTimeout(tmr);if(count>=MAX)return;tmr=setTimeout(visit,first?15000:(60000+Math.random()*40000))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){schedule(true)});else schedule(true);
  window.mogVisitNow=visit; /* 確認用 */
})();
