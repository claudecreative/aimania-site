/* 閲覧専用：転用防止（右クリック・ドラッグ・選択・コピー・保存/印刷ショートカットを無効化） */
(function(){
  var d=document;
  ['contextmenu','dragstart','selectstart','copy','cut'].forEach(function(t){d.addEventListener(t,function(e){e.preventDefault()},true)});
  d.addEventListener('keydown',function(e){
    var k=(e.key||'').toLowerCase(),m=e.ctrlKey||e.metaKey;
    if((m&&'scpuae'.indexOf(k)>-1)||k==='f12'||(m&&e.shiftKey&&'ijc'.indexOf(k)>-1)||k==='printscreen'){e.preventDefault();e.stopPropagation();if(k==='printscreen'){try{navigator.clipboard.writeText('')}catch(_){}}}
  },true);
  var st=d.createElement('style');
  st.textContent='html,body{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}img,video{-webkit-user-drag:none;pointer-events:none}@media print{body{display:none!important}html::after{content:"この資料は印刷できません";display:block;font:20px sans-serif;padding:40px}}';
  d.head.appendChild(st);
})();
