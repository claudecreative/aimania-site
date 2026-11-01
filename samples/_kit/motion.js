/* AI mania sample kit — shared motion layer */
(function(){
  var d=document, root=d.documentElement; root.classList.add('js');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  // split text into chars (keeps <br> and nested spans)
  d.querySelectorAll('[data-split]').forEach(function(el){
    var i=0;
    (function walk(node){
      Array.from(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var f=d.createDocumentFragment();
          Array.from(n.textContent).forEach(function(ch){
            var s=d.createElement('span'); s.className='sp-c'; s.style.setProperty('--i',i++); s.textContent=ch; f.appendChild(s);
          });
          n.replaceWith(f);
        } else if(n.nodeType===1 && n.tagName!=='BR' && n.tagName!=='svg') walk(n);
      });
    })(el);
    el.setAttribute('aria-label', el.textContent);
  });

  // stagger: children of [data-stagger] get data-rv + delay
  d.querySelectorAll('[data-stagger]').forEach(function(p){
    var step=parseFloat(p.dataset.stagger)||.1, kind=p.dataset.kind||'up';
    Array.from(p.children).forEach(function(c,i){
      if(!c.hasAttribute('data-rv')) c.setAttribute('data-rv',kind);
      c.style.setProperty('--d',(i*step)+'s');
    });
  });

  // count up
  function count(el){
    var to=parseFloat(el.dataset.count), dec=(el.dataset.count.split('.')[1]||'').length, t0=null, dur=1600;
    function f(t){ if(!t0)t0=t; var k=Math.min(1,(t-t0)/dur); k=1-Math.pow(1-k,3);
      el.textContent=(to*k).toLocaleString('ja-JP',{minimumFractionDigits:dec,maximumFractionDigits:dec}); if(k<1)requestAnimationFrame(f); }
    reduce?el.textContent=to.toLocaleString('ja-JP'):requestAnimationFrame(f);
  }

  // clipped elements have no visible area, so they are watched through a proxy (their parent)
  var proxy=new Map();
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting) return;
      var list=(proxy.get(e.target)||[]).concat([e.target]);
      list.forEach(function(el){ el.classList.add('in'); if(el.dataset.count) count(el); });
      io.unobserve(e.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  d.querySelectorAll('[data-rv],[data-split],[data-count],[data-in]').forEach(function(el){
    if(/^(clip|clipup|iris)$/.test(el.dataset.rv||'')){
      var p=el.parentElement, l=proxy.get(p); if(!l){l=[];proxy.set(p,l);} l.push(el); io.observe(p);
    } else io.observe(el);
  });

  // marquee: duplicate content
  d.querySelectorAll('.mq').forEach(function(m){ var a=m.firstElementChild; if(a){ var b=a.cloneNode(true); b.setAttribute('aria-hidden','true'); m.appendChild(b);} });

  // scroll-driven: parallax, header state, progress bar
  var px=Array.from(d.querySelectorAll('[data-parallax]')), bar=d.querySelector('.progress'), tick=false;
  function onScroll(){
    var y=scrollY, h=innerHeight;
    root.classList.toggle('scrolled', y>20);
    if(bar) bar.style.setProperty('--p', y/(d.body.scrollHeight-h||1));
    if(!reduce) px.forEach(function(el){
      var r=el.getBoundingClientRect(); if(r.bottom<-200||r.top>h+200) return;
      var k=parseFloat(el.dataset.parallax)||.15, c=(r.top+r.height/2-h/2);
      el.style.transform='translate3d(0,'+(-c*k).toFixed(1)+'px,0)'+(el.dataset.ptx||'');
    });
    tick=false;
  }
  addEventListener('scroll',function(){ if(!tick){tick=true;requestAnimationFrame(onScroll);} },{passive:true});
  onScroll();

  // tilt
  if(!reduce && matchMedia('(hover:hover)').matches){
    d.querySelectorAll('[data-tilt]').forEach(function(el){
      var m=parseFloat(el.dataset.tilt)||8;
      el.addEventListener('mousemove',function(e){ var r=el.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
        el.style.transform='perspective(800px) rotateY('+(x*m)+'deg) rotateX('+(-y*m)+'deg) translateZ(0)'; });
      el.addEventListener('mouseleave',function(){ el.style.transform=''; });
    });
    d.querySelectorAll('[data-magnet]').forEach(function(el){
      el.addEventListener('mousemove',function(e){ var r=el.getBoundingClientRect(); el.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.25)+'px)'; });
      el.addEventListener('mouseleave',function(){ el.style.transform=''; });
    });
  }

  // page-load: elements with [data-load] get .in after fonts
  function loaded(){ d.querySelectorAll('[data-load]').forEach(function(el){ setTimeout(function(){el.classList.add('in')}, parseFloat(el.dataset.load||0)*1000); }); root.classList.add('ready'); }
  (d.fonts&&d.fonts.ready?d.fonts.ready:Promise.resolve()).then(function(){ requestAnimationFrame(loaded); });
  setTimeout(loaded,2500);

  // menu toggle
  d.querySelectorAll('[data-menu]').forEach(function(b){ b.addEventListener('click',function(){ var t=d.getElementById(b.dataset.menu); var o=t.classList.toggle('open'); b.setAttribute('aria-expanded',o); root.classList.toggle('menu-open',o); }); });
  d.querySelectorAll('.nav-overlay a').forEach(function(a){ a.addEventListener('click',function(){ root.classList.remove('menu-open'); d.querySelectorAll('.open').forEach(function(x){x.classList.remove('open')}); }); });
})();
