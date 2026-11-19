"""トランセントホワイトニング デザイン案の書き出し（PNG）
使い方: python3 export.py
  - http://localhost:8790 を使う（起動していなければ起動する）
  - ?static=1 でフェードインを止めてから撮影する
"""
import asyncio, os, subprocess, urllib.request
from playwright.async_api import async_playwright

ROOT = "/home/claude/aimania-site"
BASE = "http://localhost:8790/test/transcent/"
Q = "?k=4cb31a88&static=1"
OUT = os.path.join(ROOT, "test/transcent/export")
PC = dict(width=1440, height=900)
SP = dict(width=390, height=844)


def ensure_server():
    try:
        urllib.request.urlopen("http://localhost:8790/", timeout=2)
    except Exception:
        subprocess.Popen(["python3", "-m", "http.server", "8790"], cwd=ROOT,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, start_new_session=True)
        import time; time.sleep(1.5)


async def open_page(browser, path, vp, dsf):
    ctx = await browser.new_context(viewport=vp, device_scale_factor=dsf)
    await ctx.add_init_script("try{localStorage.setItem('aim_mogv_'+location.pathname,Date.now())}catch(e){}")
    pg = await ctx.new_page()
    await pg.goto(BASE + path + Q, wait_until="networkidle")
    await pg.evaluate("document.fonts.ready")
    # 遅延読み込みの画像を確実に読み込む
    await pg.evaluate("""async()=>{document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');
      await Promise.all([...document.images].map(i=>i.complete?0:new Promise(r=>{i.onload=i.onerror=r})));}""")
    await pg.wait_for_timeout(600)
    return ctx, pg


async def main():
    ensure_server()
    os.makedirs(OUT, exist_ok=True)
    px = os.environ.get("HTTPS_PROXY")
    async with async_playwright() as p:
        b = await p.chromium.launch(proxy={"server": px, "bypass": "localhost,127.0.0.1"} if px else None)
        jobs = []
        for n, v in (("01", "A"), ("02", "B"), ("03", "C")):
            jobs.append((f"fv-{v.lower()}.html", PC, 1, f"{n}_FV_{v}_PC.png", None, False))
            jobs.append((f"fv-{v.lower()}.html", SP, 2, f"{n}_FV_{v}_SP.png", None, False))
        jobs.append(("index.html", PC, 1, "04_おすすめ案_PC.png", None, True))
        jobs.append(("index.html", SP, 2, "04_おすすめ案_SP.png", None, True))
        jobs.append(("sheet.html", dict(width=1440, height=1020), 1, "05_デザインの考え方シート.png", "#sheet", False))
        for i, k in enumerate("ABC"):
            jobs.append(("banner.html", dict(width=1300, height=900), 1, f"06_banner_1200x400_{k}.png", f"#b{i+1}", False))
            jobs.append(("banner.html", dict(width=1300, height=900), 1, f"07_banner_1080_{k}.png", f"#b{i+4}", False))
        for path, vp, dsf, name, sel, full in jobs:
            ctx, pg = await open_page(b, path, vp, dsf)
            dest = os.path.join(OUT, name)
            if sel:
                await pg.locator(sel).screenshot(path=dest)
            else:
                if full:
                    # 全体撮影で画面の高さが変わってもFVが実機と同じ高さになるよう、px で固定する
                    await pg.evaluate("document.querySelectorAll('.fv').forEach(e=>e.style.height=e.getBoundingClientRect().height+'px')")
                await pg.screenshot(path=dest, full_page=full)
            print("saved", name)
            await ctx.close()
        await b.close()

asyncio.run(main())
