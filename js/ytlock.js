/* YouTubeへ飛べない動画プレーヤー
   - iframe はクリックできないようにして、再生・一時停止・シーク・音量・全画面は自前のボタンで操作
   - 再生していないときは自前のカバー（サムネイル＋再生ボタン）で、YouTubeのタイトルやロゴを隠す */
(function(){
  var boxes=[].slice.call(document.querySelectorAll('.ytlock[data-id]'));
  if(!boxes.length)return;
  var fmt=function(t){t=Math.max(0,Math.floor(t||0));return Math.floor(t/60)+':'+('0'+t%60).slice(-2)};
  boxes.forEach(function(box){
    var id=box.dataset.id,label=box.dataset.title||'動画';
    box.innerHTML=
      '<div class="ytl-stage"><div class="ytl-frame"></div></div>'+
      '<button type="button" class="ytl-cover" aria-label="'+label+'を再生">'+
        '<img src="https://i.ytimg.com/vi/'+id+'/maxresdefault.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg\'">'+
        '<span class="ytl-big" aria-hidden="true"></span><span class="ytl-msg"></span></button>'+
      '<div class="ytl-bar" hidden>'+
        '<button type="button" class="ytl-pp" aria-label="一時停止"></button>'+
        '<div class="ytl-seek" role="slider" tabindex="0" aria-label="再生位置" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>'+
        '<span class="ytl-time">0:00 / 0:00</span>'+
        '<button type="button" class="ytl-mute" aria-label="ミュート"></button>'+
        '<button type="button" class="ytl-fs" aria-label="全画面"></button>'+
      '</div>';
    box._ready=false;
  });
  var apiLoading=false,queue=[];
  function withAPI(cb){
    if(window.YT&&YT.Player)return cb();
    queue.push(cb);if(apiLoading)return;apiLoading=true;
    var prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=function(){prev&&prev();queue.splice(0).forEach(function(f){f()})};
    var s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);
  }
  function setup(box,autoplay){
    var id=box.dataset.id,cover=box.querySelector('.ytl-cover'),bar=box.querySelector('.ytl-bar'),pp=box.querySelector('.ytl-pp'),seek=box.querySelector('.ytl-seek'),fill=seek.querySelector('i'),time=box.querySelector('.ytl-time'),mute=box.querySelector('.ytl-mute'),fs=box.querySelector('.ytl-fs'),msg=box.querySelector('.ytl-msg');
    var player,timer,dur=0;
    box.classList.add('is-loading');
    player=new YT.Player(box.querySelector('.ytl-frame'),{
      host:'https://www.youtube-nocookie.com',videoId:id,
      playerVars:{controls:0,rel:0,playsinline:1,disablekb:1,fs:0,iv_load_policy:3,modestbranding:1,cc_load_policy:0,autoplay:autoplay?1:0},
      events:{
        onReady:function(){box._ready=true;box.classList.remove('is-loading');bar.hidden=false;dur=player.getDuration()||0;tick();if(autoplay)player.playVideo()},
        onStateChange:function(e){
          var S=YT.PlayerState;
          box.classList.toggle('is-playing',e.data===S.PLAYING||e.data===S.BUFFERING);
          pp.setAttribute('aria-label',e.data===S.PLAYING?'一時停止':'再生');
          if(e.data===S.PLAYING){clearInterval(timer);timer=setInterval(tick,250)}else{clearInterval(timer);tick()}
          msg.textContent=e.data===S.ENDED?'もう一度見る':(e.data===S.PAUSED?'つづきを再生':'');
          if(e.data===S.ENDED){player.seekTo(0,false);player.pauseVideo()}
        }
      }
    });
    function tick(){if(!player||!player.getCurrentTime)return;dur=player.getDuration()||dur;var c=player.getCurrentTime()||0;fill.style.width=(dur?c/dur*100:0)+'%';seek.setAttribute('aria-valuenow',Math.round(dur?c/dur*100:0));time.textContent=fmt(c)+' / '+fmt(dur);mute.classList.toggle('on',player.isMuted&&player.isMuted())}
    function toggle(){if(!box._ready)return;var st=player.getPlayerState();if(st===YT.PlayerState.PLAYING||st===YT.PlayerState.BUFFERING)player.pauseVideo();else player.playVideo()}
    box._toggle=toggle;
    pp.addEventListener('click',toggle);
    box.querySelector('.ytl-stage').addEventListener('click',toggle);
    function seekTo(x){var r=seek.getBoundingClientRect(),p=Math.min(1,Math.max(0,(x-r.left)/r.width));player.seekTo(p*dur,true);tick()}
    var drag=false;
    seek.addEventListener('pointerdown',function(e){drag=true;seek.setPointerCapture(e.pointerId);seekTo(e.clientX)});
    seek.addEventListener('pointermove',function(e){if(drag)seekTo(e.clientX)});
    seek.addEventListener('pointerup',function(){drag=false});
    seek.addEventListener('keydown',function(e){var c=player.getCurrentTime();if(e.key==='ArrowRight'){player.seekTo(c+5,true);e.preventDefault()}if(e.key==='ArrowLeft'){player.seekTo(c-5,true);e.preventDefault()}tick()});
    mute.addEventListener('click',function(){if(player.isMuted()){player.unMute()}else{player.mute()}setTimeout(tick,50)});
    fs.addEventListener('click',function(){var d=document;if(d.fullscreenElement||d.webkitFullscreenElement){(d.exitFullscreen||d.webkitExitFullscreen).call(d)}else{var f=box.requestFullscreen||box.webkitRequestFullscreen;if(f)f.call(box);else box.classList.toggle('is-max')}});
  }
  boxes.forEach(function(box){
    box.querySelector('.ytl-cover').addEventListener('click',function(){
      if(box._ready){box._toggle();return}
      if(box.classList.contains('is-loading'))return;
      withAPI(function(){setup(box,true)});
    });
  });
})();
