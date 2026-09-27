#!/usr/bin/env python3
"""Build printable spot cards (fronts) as a self-contained HTML page.

    python3 tools/spot-cards.py          -> printables/spot-cards.html

Open the HTML in Chrome and print at 100% scale, or render it to PDF.
Cards are 2.5" x 3.5" (standard trading-card size, fits a 3x4 toploader),
9 per US Letter sheet with crop marks. Pokémon artwork is downloaded once
into printables/.cache (needs Pillow and curl).
"""
import base64
import html
import io
import json
import pathlib
import subprocess

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "printables" / "spot-cards.html"
CACHE = ROOT / "printables" / ".cache"
FONTS = ROOT / "printables" / "fonts"
ART = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{}.png"

# Text printed on each card: the headline Pokémon only (evolutions still get artwork).
NAMES = {
    1: ["Charizard"], 2: ["Pikachu"], 3: ["Umbreon"], 4: ["Rayquaza"], 5: ["Mew"], 6: ["Lugia"],
    7: ["Mewtwo"], 8: ["Gengar", "Mimikyu"], 9: ["Eevee"], 10: ["Garchomp", "Giratina"],
    11: ["Reshiram", "Zekrom", "Kyurem"], 12: ["Vaporeon", "Jolteon", "Flareon"], 13: ["Sylveon"],
    14: ["Espeon", "Deoxys"], 15: ["Latias", "Latios"], 16: ["Arceus", "Dialga", "Palkia"],
    17: ["Tyranitar", "Sableye", "Houndoom"], 18: ["Dragonite"],
    19: ["Blastoise", "Empoleon", "Starmie", "Poliwrath", "Politoed"], 20: ["Groudon", "Kyogre"],
    21: ["Greninja", "Zoroark"], 22: ["Gardevoir", "Gallade"], 23: ["Gyarados", "Wailord"],
    24: ["Venusaur"],
    25: ["Lucario", "Melmetal", "Scizor", "Kleavor", "Hitmonlee", "Hitmonchan", "Hitmontop"],
    26: ["Leafeon", "Glaceon"], 27: ["Articuno", "Zapdos", "Moltres", "Ho-Oh"],
    28: ["Snorlax", "Ditto", "Golduck", "Slowbro", "Slowking"], 29: ["Alakazam", "Machamp", "Arcanine"],
    30: ["Celebi", "Jirachi", "Victini", "Cresselia", "Shaymin", "Manaphy", "Yveltal"],
    31: ["Raikou", "Entei", "Suicune"], 32: ["All Trainer Cards"],
}


def load_spots():
    js = (ROOT / "data" / "pulls.js").read_text(encoding="utf-8")
    data = json.loads(js[js.index("{"): js.rindex("}") + 1])
    best = max(data["editions"].values(), key=len)
    return [(s["spot"], [g["pokemon"] for g in s["groups"]]) for s in best]


def dex_map():
    src = (ROOT / "js" / "sprites.js").read_text(encoding="utf-8")
    body = src[src.index("{", src.index("const DEX")) + 1: src.index("};")]
    out = {}
    for part in body.replace("\n", " ").split(","):
        if ":" in part:
            k, v = part.split(":")
            out[k.strip().strip('"')] = int(v)
    return out


def art(dex_id):
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / f"{dex_id}.png"
    if not f.exists():
        subprocess.run(["curl", "-sSfL", "-o", str(f), ART.format(dex_id)], check=True)
    im = Image.open(f).convert("RGBA")
    im = im.crop(im.getbbox())  # trim transparent padding so art fills its slot
    im.thumbnail((360, 360))
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=90, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def font(name):
    return base64.b64encode((FONTS / name).read_bytes()).decode()


def card(spot, mons, dex, imgs):
    names = NAMES[spot]
    mains = [m for m in mons if m in names]
    others = [m for m in mons if m not in names]
    order = mains + others
    pics = [m for m in order if m in dex]
    n = len(pics)
    # Layout: bigger art for fewer Pokémon; headline Pokémon slightly larger than the rest.
    size = {1: 1.9, 2: 1.2, 3: 1.05, 4: 0.95}.get(n, 0.78 if n <= 6 else 0.66 if n <= 9 else 0.58)
    art_html = "".join(
        f'<i class="pic p{dex[m]}" style="width:{size * (1 if m in mains or n == 1 else .8):.2f}in;height:{size * (1 if m in mains or n == 1 else .8):.2f}in"></i>'
        for m in pics)
    if not pics:
        art_html = '<div class="trainer"><span>TRAINER</span></div>'
    # Faint wallpaper of the spot's Pokémon behind everything.
    wall = "".join(f'<i class="pic p{dex[pics[i % n]]}"></i>' for i in range(24)) if pics else ""
    text = " · ".join(names)
    fs = 17 if len(text) <= 12 else 14 if len(text) <= 22 else 11.5 if len(text) <= 36 else 9.5 if len(text) <= 52 else 8.2
    return f'''
    <div class="card">
      <div class="wall">{wall}</div>
      <div class="frame"></div>
      <div class="top"><span>VAULT</span><i></i><span>BOX</span></div>
      <div class="art n{min(n, 12)}">{art_html}</div>
      <div class="plate"><div class="name" style="font-size:{fs}pt"><span>{html.escape(text)}</span></div></div>
    </div>'''


def crop_marks(count):
    """Short cut lines in the sheet margin at every card edge."""
    rows = (count + 2) // 3
    xs = [0.5 + 2.5 * i for i in range(4)]
    ys = [0.25 + 3.5 * i for i in range(rows + 1)]
    bottom = ys[-1]
    out = []
    for x in xs:
        out.append(f'<i class="mark" style="left:{x}in;top:0;width:.5pt;height:.18in;margin-left:-.25pt"></i>')
        out.append(f'<i class="mark" style="left:{x}in;top:{bottom + .07}in;width:.5pt;height:.18in;margin-left:-.25pt"></i>')
    for y in ys:
        out.append(f'<i class="mark" style="top:{y}in;left:.1in;height:.5pt;width:.32in;margin-top:-.25pt"></i>')
        out.append(f'<i class="mark" style="top:{y}in;left:8.08in;height:.5pt;width:.32in;margin-top:-.25pt"></i>')
    return "".join(out)


def vault_svg():
    """Vault-door emblem for the card back."""
    import math
    c, parts = 100, []
    for i in range(60):  # dial ticks
        a = math.radians(i * 6)
        r1, r2 = (58, 66) if i % 5 == 0 else (61, 66)
        parts.append(f'<line x1="{c + r1 * math.cos(a):.1f}" y1="{c + r1 * math.sin(a):.1f}" '
                     f'x2="{c + r2 * math.cos(a):.1f}" y2="{c + r2 * math.sin(a):.1f}" '
                     f'stroke="#f3c969" stroke-width="{1.6 if i % 5 == 0 else .8}"/>')
    for i in range(12):  # bolts around the door
        a = math.radians(i * 30 + 15)
        parts.append(f'<circle cx="{c + 87 * math.cos(a):.1f}" cy="{c + 87 * math.sin(a):.1f}" r="4.2" '
                     f'fill="url(#bolt)" stroke="#6b4e1a" stroke-width=".8"/>')
    for i in range(3):  # handle spokes
        a = math.radians(i * 60 + 90)
        parts.append(f'<line x1="{c - 50 * math.cos(a):.1f}" y1="{c - 50 * math.sin(a):.1f}" '
                     f'x2="{c + 50 * math.cos(a):.1f}" y2="{c + 50 * math.sin(a):.1f}" '
                     f'stroke="url(#steel)" stroke-width="7" stroke-linecap="round"/>')
    return f'''<svg class="vault" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="door" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#3a4150"/><stop offset="1" stop-color="#151920"/></radialGradient>
        <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset=".45" stop-color="#f3c969"/><stop offset=".6" stop-color="#a8781f"/><stop offset="1" stop-color="#ffe39a"/></linearGradient>
        <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f9"/><stop offset=".5" stop-color="#8d96a5"/><stop offset="1" stop-color="#dfe3ea"/></linearGradient>
        <radialGradient id="bolt" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#fff4cf"/><stop offset="1" stop-color="#b8862b"/></radialGradient>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#door)" stroke="url(#ring)" stroke-width="5"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="url(#ring)" stroke-width="2.5"/>
      <circle cx="100" cy="100" r="70" fill="#0d1016" stroke="#2b313d" stroke-width="2"/>
      {"".join(parts)}
      <circle cx="100" cy="100" r="22" fill="url(#door)" stroke="url(#ring)" stroke-width="3"/>
      <text x="100" y="111" text-anchor="middle" font-family="Russo One" font-size="30" fill="url(#ring)">?</text>
    </svg>'''


def back():
    return f'''
    <div class="card back">
      <div class="frame"></div>
      <div class="bk-logo"><span class="metal">VAULT</span><span class="goldtxt">BOX</span></div>
      {vault_svg()}
      <div class="bk-tag">CRACK THE VAULT</div>
    </div>'''


def main():
    dex = dex_map()
    spots = load_spots()
    imgs = {m: art(dex[m]) for _, mons in spots for m in mons if m in dex}
    pic_css = "".join(f".p{dex[m]}{{background-image:url({u})}}\n" for m, u in imgs.items())
    cards = [card(n, mons, dex, imgs) for n, mons in spots]
    # Double-sided: each front sheet is followed by its backs sheet, mirrored left-to-right
    # so every back lands behind its front when printed "flip on long edge".
    pages = ""
    for i in range(0, len(cards), 9):
        chunk = cards[i:i + 9]
        pages += f'<section class="sheet">{"".join(chunk)}{crop_marks(len(chunk))}</section>'
        backs = "".join(back().replace('class="card back"', f'class="card back" style="grid-row:{j // 3 + 1};grid-column:{3 - j % 3}"', 1)
                        for j in range(len(chunk)))
        pages += f'<section class="sheet">{backs}{crop_marks(len(chunk))}</section>'

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(TEMPLATE.replace("{{PAGES}}", pages)
                   .replace("{{PICS}}", pic_css)
                   .replace("{{RUSSO}}", font("RussoOne.ttf"))
                   .replace("{{INTER}}", font("Inter-800.ttf")), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(cards)} cards, {OUT.stat().st_size // 1024} KB)")


TEMPLATE = r'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<title>Vault Box Spot Cards</title>
<style>
@font-face { font-family: "Russo One"; src: url(data:font/ttf;base64,{{RUSSO}}) format("truetype"); }
@font-face { font-family: "Inter"; font-weight: 800; src: url(data:font/ttf;base64,{{INTER}}) format("truetype"); }
@page { size: 8.5in 11in; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; padding: 0; background: #777; }
.sheet {
  width: 8.5in; height: 11in; background: #fff; position: relative; margin: 0 auto;
  display: grid; grid-template-columns: repeat(3, 2.5in); grid-auto-rows: 3.5in;
  padding: 0.25in 0.5in; align-content: start; page-break-after: always; break-after: page;
}
@media screen { .sheet { margin: 20px auto; box-shadow: 0 4px 20px rgba(0,0,0,.4); } }
.mark { position: absolute; background: #000; }
.card {
  width: 2.5in; height: 3.5in; position: relative; overflow: hidden;
  background:
    radial-gradient(circle at 50% 44%, rgba(243,201,105,.28), transparent 52%),
    linear-gradient(165deg, #1b2230 0%, #0b0e15 55%, #151b27 100%);
  font-family: "Inter", sans-serif; color: #fff;
}
.wall { position: absolute; inset: -0.3in; display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0.12in; transform: rotate(-14deg); opacity: .09; filter: grayscale(1) brightness(1.6); }
.back { background:
    radial-gradient(circle at 50% 52%, rgba(243,201,105,.30), transparent 58%),
    repeating-linear-gradient(45deg, rgba(255,255,255,.035) 0 1pt, transparent 1pt 7pt),
    linear-gradient(165deg, #1b2230 0%, #0b0e15 55%, #151b27 100%); }
.back .vault { position: absolute; left: 50%; top: 1.02in; width: 1.95in; height: 1.95in; margin-left: -0.975in;
  filter: drop-shadow(0 4pt 8pt rgba(0,0,0,.6)); }
.bk-logo { position: absolute; top: 0.3in; left: 0; right: 0; text-align: center; font-family: "Russo One", sans-serif;
  font-size: 25pt; line-height: .95; letter-spacing: 1pt; display: flex; flex-direction: column; align-items: center; }
.bk-logo .metal { background: linear-gradient(180deg, #fff 0%, #d7dbe2 40%, #8a93a3 55%, #f5f7fa 75%, #b9c0cc 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.bk-logo .goldtxt { font-size: 17pt; letter-spacing: 5pt; margin-top: 2pt; background: linear-gradient(180deg, #fff6d8 0%, #f3c969 45%, #b8862b 60%, #ffe39a 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.bk-tag { position: absolute; bottom: 0.26in; left: 0; right: 0; text-align: center; font-family: "Russo One", sans-serif;
  font-size: 9pt; letter-spacing: 2.5pt; color: #f3c969; }
.pic { display: block; background: center / contain no-repeat; }
.wall .pic { width: 100%; aspect-ratio: 1; }
.frame { position: absolute; inset: 0.09in; border: 1.5pt solid #d9ae55; border-radius: 0.12in;
  box-shadow: inset 0 0 0 1.5pt rgba(0,0,0,.6), inset 0 0 0 2.5pt rgba(255,230,160,.35); }
.top { position: absolute; top: 0.2in; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 5pt;
  font-family: "Russo One", sans-serif; font-size: 10pt; letter-spacing: 1.5pt;
  color: #f3c969; }
.top i { width: 9pt; height: 9pt; border-radius: 50%; border: 1.5pt solid #f3c969; position: relative; }
.top i::after { content: ""; position: absolute; inset: 2pt; border-radius: 50%; background: #f3c969; }
.art { position: absolute; top: 0.48in; left: 0.14in; right: 0.14in; height: 2.25in;
  display: flex; flex-wrap: wrap; align-content: center; justify-content: center; align-items: center; gap: 0.02in 0; }
.art .pic { filter: drop-shadow(0 2pt 3pt rgba(0,0,0,.6)); }
.art.n2 .pic, .art.n3 .pic, .art.n4 .pic { margin: 0 -0.04in; }
.trainer { width: 1.3in; height: 1.8in; border-radius: 0.1in; transform: rotate(-6deg);
  background: linear-gradient(135deg, #fff3cf, #f3c969 45%, #b8862b); display: grid; place-items: center;
  box-shadow: 0 4pt 10pt rgba(0,0,0,.6), inset 0 0 0 3pt rgba(255,255,255,.45); }
.trainer span { font-family: "Russo One", sans-serif; color: #2a1d05; font-size: 14pt; letter-spacing: 1pt; transform: rotate(-90deg); }
.plate { position: absolute; left: 0.18in; right: 0.18in; bottom: 0.2in; height: 0.62in;
  display: grid; place-items: center; text-align: center; padding: 0 0.08in;
  background: linear-gradient(180deg, rgba(10,12,18,.85), rgba(10,12,18,.95));
  border: 1pt solid rgba(217,174,85,.8); border-radius: 0.08in; }
.name { font-family: "Russo One", sans-serif; line-height: 1.15; letter-spacing: .3pt; }
.name span { -webkit-box-decoration-break: clone; box-decoration-break: clone;
  background: linear-gradient(180deg, #fff8e0 0%, #f3c969 55%, #c8952f 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
{{PICS}}</style></head>
<body>{{PAGES}}</body></html>
'''

if __name__ == "__main__":
    main()
