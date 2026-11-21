#!/usr/bin/env python3
"""テストページ（aimania.tech/test/<slug>/）を追加・更新する。

使い方:
  python3 tools/add_test_page.py <slug> "<一覧に出す名前>" <元フォルダ> [--pw auto|<パスワード>|shared] [--date 11/21]

  <slug>     英小文字・数字・ハイフン。URL になる（/test/<slug>/）
  <元フォルダ> index.html と画像などが入ったフォルダ。中身を test/<slug>/ にコピーする
  --pw auto   サイト専用のパスワードを作る（既定。例: hodoke7183）
  --pw <文字>  サイト専用のパスワードを指定（英小文字と数字だけ）
  --pw shared  共通パスワード（test）で入るページにする

すること:
  1. 元フォルダを test/<slug>/ にコピー（既存なら上書き）
  2. 全HTMLの<head>直後に入室チェックと noindex を入れる
  3. サイト専用パスなら test/index.html に合言葉を登録
  4. test/pages.json の一覧に追加（同じパスがあれば更新）
  5. 最後に URL とパスワードを表示
コミットとプッシュはこのスクリプトの後で行う。
"""
import argparse, hashlib, json, os, re, secrets, shutil, subprocess, sys, datetime, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEST = os.path.join(ROOT, "test")

FUNC_TPL = ("function f_{slug}(){{try{{sessionStorage.setItem('aim_{slug}_ok','1')}}catch(e){{}}"
 "try{{document.cookie='aim_{slug}_ok=1; path=/test/; max-age=28800; SameSite=Lax; Secure'}}catch(e){{}}"
 "done=true;clearInterval(timer);var nx=new URLSearchParams(location.search).get('next');"
 "var p=(nx&&/^\\/test\\/{slug}\\/[\\w\\-\\/.]*$/.test(nx))?nx:'/test/{slug}/';body.classList.add('unlocked');"
 "setTimeout(function(){{body.classList.add('leaving');var cells=[].slice.call(document.querySelectorAll('#wipe i'));"
 "cells.sort(function(){{return Math.random()-.5}});cells.forEach(function(c,i){{c.style.animationDelay=(reduce?0:i*9)+'ms'}});"
 "setTimeout(function(){{location.replace(p+'?k={k}')}},reduce?0:520)}},reduce?400:2000)}}")

GUARD_OWN = ('<script>(function(){{var ok=false;try{{ok=sessionStorage.getItem("aim_{s}_ok")==="1"}}catch(e){{}}'
 'if(!ok){{try{{ok=/(?:^|; )aim_{s}_ok=1/.test(document.cookie)}}catch(e){{}}}}'
 'if(!ok&&/[?&]k={k}/.test(location.search)){{ok=true;try{{sessionStorage.setItem("aim_{s}_ok","1")}}catch(e){{}}'
 'try{{document.cookie="aim_{s}_ok=1; path=/test/; max-age=28800; SameSite=Lax; Secure"}}catch(e){{}}}}'
 'if(!ok){{location.replace("/test/?next="+encodeURIComponent(location.pathname))}}}})();</script>')
GUARD_SHARED = '<script src="/test/guard.js"></script>'
NOINDEX = '<meta name="robots" content="noindex,nofollow">'
MARK = "<!--aim-guard-->"

def die(m): sys.exit("エラー: " + m)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("slug"); ap.add_argument("title"); ap.add_argument("src")
    ap.add_argument("--pw", default="auto"); ap.add_argument("--date", default=None)
    a = ap.parse_args()
    slug = a.slug
    if not re.fullmatch(r"[a-z0-9][a-z0-9\-]{1,30}", slug): die("slug は英小文字・数字・ハイフンだけにしてください")
    if slug in ("index", "guard", "pages"): die("その slug は使えません")
    src = os.path.abspath(a.src)
    if not os.path.isfile(os.path.join(src, "index.html")): die("元フォルダに index.html がありません")
    dst = os.path.join(TEST, slug)
    if os.path.abspath(src) != os.path.abspath(dst):
        shutil.copytree(src, dst, dirs_exist_ok=True)

    shared = a.pw == "shared"
    pw = None; k = None
    if not shared:
        pw = (slug.replace("-", "") + str(secrets.randbelow(9000) + 1000)) if a.pw == "auto" else a.pw
        if not re.fullmatch(r"[a-z0-9]{4,24}", pw): die("パスワードは英小文字と数字で4〜24文字にしてください")
        h = hashlib.sha256(pw.encode()).hexdigest(); k = h[:8]

    # 2. 各HTMLに入室チェック
    guard = GUARD_SHARED if shared else GUARD_OWN.format(s=slug, k=k)
    block = MARK + guard + NOINDEX + MARK
    for f in glob.glob(os.path.join(dst, "**", "*.html"), recursive=True):
        s = open(f, encoding="utf-8").read()
        s = re.sub(re.escape(MARK) + ".*?" + re.escape(MARK), "", s, flags=re.S)      # 前回分を外す
        s = re.sub(r'<script>\(function\(\)\{var ok=false;try\{ok=sessionStorage\.getItem\("aim_[\w-]+_ok"\).*?</script>\s*(<meta name="robots"[^>]*>\s*)?', "", s, flags=re.S)
        if not re.search(r"<head[^>]*>", s, re.I): die(f"{f} に <head> がありません")
        s = re.sub(r"(<head[^>]*>)", lambda m: m.group(1) + "\n" + block + "\n", s, count=1, flags=re.I)
        open(f, "w", encoding="utf-8").write(s)

    # 3. 合言葉の登録
    idx_p = os.path.join(TEST, "index.html"); idx = open(idx_p, encoding="utf-8").read()
    V = "P_" + slug.upper().replace("-", "_")
    disp_old = re.search(r"else\{fail\(\)\}", idx)
    if not disp_old: die("test/index.html の判定部分が見つかりません（形が変わっています）")
    idx = re.sub(r"var " + V + r"='[0-9a-f]+';", "", idx)
    idx = idx.replace("else if(h===" + V + "){f_" + slug.replace("-", "_") + "()}", "")
    idx = re.sub(r"\nfunction f_" + slug.replace("-", "_") + r"\(\)\{[^\n]*", "", idx)
    if not shared:
        fn = slug.replace("-", "_")
        idx = idx.replace("var KEY='aim_test_ok'", "var " + V + "='" + h + "';var KEY='aim_test_ok'", 1)
        idx = idx.replace("else{fail()}", "else if(h===" + V + "){f_" + fn + "()}else{fail()}", 1)
        body = FUNC_TPL.format(slug=slug, k=k).replace("function f_" + slug + "(", "function f_" + fn + "(")
        m = re.search(r"\nfunction fail\(", idx) or re.search(r"\nfunction success\(", idx)
        if not m: die("test/index.html に関数を入れる場所が見つかりません")
        idx = idx[:m.start()] + "\n" + body + idx[m.start():]
    open(idx_p, "w", encoding="utf-8").write(idx)

    # 文法チェック
    js = re.findall(r"<script>(.*?)</script>", idx, re.S)[-1]
    open("/tmp/_aim_check.js", "w").write(js)
    r = subprocess.run(["node", "--check", "/tmp/_aim_check.js"], capture_output=True, text=True)
    if r.returncode: die("test/index.html のスクリプトが壊れました。git checkout test/index.html で戻してください\n" + r.stderr)

    # 4. 一覧
    pj = os.path.join(TEST, "pages.json"); pages = json.load(open(pj, encoding="utf-8"))
    date = a.date or datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime("%-m/%-d")
    path = "/test/%s/" % slug
    pages = [p for p in pages if p.get("path") != path] + [{"title": a.title, "path": path, "date": date}]
    json.dump(pages, open(pj, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print("OK")
    print("URL      : https://aimania.tech" + path)
    print("パスワード: " + ("test（共通）" if shared else pw))

if __name__ == "__main__":
    main()
