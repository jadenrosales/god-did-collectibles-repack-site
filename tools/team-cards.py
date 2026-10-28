#!/usr/bin/env python3
"""Build printable sports spot cards: one per NFL team, with its basketball and
baseball teams and bonus category (no hockey). Same size, layout and back as the
Pokémon spot cards in tools/spot-cards.py.

    python3 tools/team-cards.py                     -> printables/team-cards.html
    python3 tools/team-cards.py --only KC --out x.html   (reprint single cards)
"""
import argparse
import base64
import html
import importlib.util
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
_spec = importlib.util.spec_from_file_location("spot_cards", ROOT / "tools" / "spot-cards.py")
sc = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(sc)


def load_teams():
    js = (ROOT / "data" / "teams.js").read_text(encoding="utf-8")
    body = js[js.index("["): js.rindex("]") + 1]
    body = re.sub(r"//[^\n]*", "", body)                 # comments
    body = re.sub(r"(\w+):", r'"\1":', body)              # quote keys
    body = re.sub(r",\s*([}\]])", r"\1", body)            # trailing commas
    return json.loads(body)


def logo(code):
    return "data:image/png;base64," + base64.b64encode((ROOT / "assets" / "teams" / f"{code}.png").read_bytes()).decode()


def team_card(t):
    rows = [(lg, t[k]) for k, lg in (("nba", "NBA"), ("mlb", "MLB")) if t[k]]
    rows_html = "".join(f'<li><i>{lg}</i>{html.escape(name)}</li>' for lg, name in rows)
    extra = f'<div class="t-extra">+ {html.escape(t["extra"])}</div>' if t["extra"] else ""
    return f'''
    <div class="card team-card">
      <div class="frame"></div>
      <div class="top"><span>VAULT</span><i></i><span>BOX</span></div>
      <div class="t-logo" style="background-image:url({logo(t["code"])})"></div>
      <div class="t-name">{html.escape(t["nfl"])}</div>
      <ul class="t-list">{rows_html}</ul>
      {extra}
    </div>'''


CSS = '''
.team-card { background:
    radial-gradient(circle at 50% 30%, rgba(243,201,105,.26), transparent 50%),
    linear-gradient(165deg, #1b2230 0%, #0b0e15 55%, #151b27 100%); }
.t-logo { position: absolute; top: 0.5in; left: 0.3in; right: 0.3in; height: 1.2in;
  background: center / contain no-repeat; filter: drop-shadow(0 3pt 5pt rgba(0,0,0,.6)); }
.t-name { position: absolute; top: 1.8in; left: 0.15in; right: 0.15in; text-align: center;
  font-family: "Russo One", sans-serif; font-size: 17pt; line-height: 1.1;
  background: linear-gradient(180deg, #fff8e0 0%, #f3c969 55%, #c8952f 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; }
.t-list { position: absolute; top: 2.22in; left: 0.3in; right: 0.3in; list-style: none; margin: 0; padding: 0;
  display: grid; gap: 4pt; }
.t-list li { display: flex; align-items: center; gap: 5pt; font-family: "Inter", sans-serif; font-weight: 800;
  font-size: 9.5pt; color: #fff; background: rgba(255,255,255,.06); border: .75pt solid rgba(217,174,85,.35);
  border-radius: 4pt; padding: 3pt 5pt; }
.t-list li i { font-style: normal; font-size: 6.5pt; letter-spacing: .5pt; color: #0b0e15; background: #f3c969;
  border-radius: 2.5pt; padding: 1.5pt 3pt; flex: none; }
.t-extra { position: absolute; left: 0.3in; right: 0.3in; bottom: 0.24in; text-align: center;
  font-family: "Inter", sans-serif; font-weight: 800; font-size: 8pt; color: #f3c969;
  border: .75pt dashed rgba(243,201,105,.6); border-radius: 4pt; padding: 3pt; }
'''


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", nargs="+", help="team codes or names to reprint, e.g. KC Bills")
    ap.add_argument("--out", default=str(ROOT / "printables" / "team-cards.html"))
    args = ap.parse_args()
    teams = load_teams()
    if args.only:
        want = [w.lower() for w in args.only]
        teams = [t for t in teams if any(w == t["code"] or w in t["nfl"].lower() for w in want)]
    cards = [team_card(t) for t in teams]
    pages = ""
    for i in range(0, len(cards), 9):
        chunk = cards[i:i + 9]
        pages += f'<section class="sheet">{"".join(chunk)}{sc.crop_marks(len(chunk))}</section>'
        backs = "".join(sc.back().replace('class="card back"', f'class="card back" style="grid-row:{j // 3 + 1};grid-column:{3 - j % 3}"', 1)
                        for j in range(len(chunk)))
        pages += f'<section class="sheet">{backs}{sc.crop_marks(len(chunk))}</section>'
    out = pathlib.Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(sc.TEMPLATE.replace("{{PAGES}}", pages).replace("{{PICS}}", CSS)
                   .replace("{{RUSSO}}", sc.font("RussoOne.ttf"))
                   .replace("{{INTER}}", sc.font("Inter-800.ttf"))
                   .replace("<title>Vault Box Spot Cards</title>", "<title>Vault Box Team Cards</title>"), encoding="utf-8")
    print(f"wrote {out} ({len(cards)} cards)")


if __name__ == "__main__":
    main()
