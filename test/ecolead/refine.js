/* 仕上げ用：.ec-reveal をスクロールでやわらかく表示 */
(function(){
  var els=[].slice.call(document.querySelectorAll('.ec-reveal'));
  if(!els.length)return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('is-in')});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var d=+(en.target.dataset.ecDelay||0);setTimeout(function(){en.target.classList.add('is-in')},d);io.unobserve(en.target);}})},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  els.forEach(function(e){io.observe(e)});
})();
