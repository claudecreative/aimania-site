/* テストページ用の入室チェック。各テストページの<head>の最初に
   <script src="/test/guard.js"></script> を入れる。
   入室していなければ /test/ のキーボード画面へ送り、入室後に元のページへ戻す。
   保存領域が使えないブラウザ（プライベートモードやアプリ内ブラウザ）でも通れるよう、
   Cookie と URL の合図でも判定する。 */
(function(){
  var ok=false;
  try{ok=sessionStorage.getItem('aim_test_ok')==='1'}catch(e){}
  if(!ok){try{ok=/(?:^|; )aim_test_ok=1/.test(document.cookie)}catch(e){}}
  if(!ok&&/[?&]k=9f86d081/.test(location.search)){ok=true;try{sessionStorage.setItem('aim_test_ok','1')}catch(e){}try{document.cookie='aim_test_ok=1; path=/test/; max-age=28800; SameSite=Lax; Secure'}catch(e){}}
  if(!ok){location.replace('/test/?next='+encodeURIComponent(location.pathname));}
})();
