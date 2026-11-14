/* テストページ用の入室チェック。各テストページの<head>の最初に
   <script src="/test/guard.js"></script> を入れる。
   入室していなければ /test/ のキーボード画面へ送り、入室後に元のページへ戻す。 */
(function(){
  var ok=false;
  try{ok=sessionStorage.getItem('aim_test_ok')==='1'}catch(e){}
  if(!ok){location.replace('/test/?next='+encodeURIComponent(location.pathname));}
})();
