/* .forge（M PLUS 1 Black を縦長・斜体にしたデザイン文字）の実幅補正
   transform:scale(.74,1.24) は見た目だけ縮むため、外側の .fw に「見た目の幅」を与えて
   後続の文字との間を正しく詰める。拡大の基点はベースラインに合わせる。 */
(function(){
  var SX=.74,SY=1.24;
  function fit(){
    var els=document.querySelectorAll('.forge');
    for(var i=0;i<els.length;i++){
      var el=els[i],w=el.parentNode;
      if(!w.classList||!w.classList.contains('fw')){
        w=document.createElement('span');w.className='fw';
        el.parentNode.insertBefore(w,el);w.appendChild(el);
      }
      var fs=parseFloat(getComputedStyle(el).fontSize)||16;
      /* ベースライン位置を測る */
      var pr=document.createElement('i');
      pr.style.cssText='display:inline-block;width:0;height:0;vertical-align:baseline';
      el.appendChild(pr);
      var base=pr.offsetTop;el.removeChild(pr);
      el.style.transformOrigin='0 '+base+'px';
      var W=el.offsetWidth;
      /* 見た目の幅＋斜体の張り出し分だけを確保 */
      w.style.width=Math.ceil(W*SX+fs*.1)+'px';
      w.style.paddingTop=Math.ceil(fs*(SY-1)*.8)+'px';
    }
    document.documentElement.classList.add('fw-ok');
  }
  var t;function later(){clearTimeout(t);t=setTimeout(fit,120)}
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(fit)}
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',fit)}else{fit()}
  addEventListener('load',fit);addEventListener('resize',later);
  window.fitForge=fit;
})();
