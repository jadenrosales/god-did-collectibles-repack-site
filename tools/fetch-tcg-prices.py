#!/usr/bin/env python3
"""
Build data/tcg-prices.json: every sealed Pokémon product on TCGPlayer with its
Market Price, pulled from tcgcsv.com (a daily mirror of TCGPlayer's price feed).

Run by .github/workflows/tcg-prices.yml once a day; run by hand with:
    python3 tools/fetch-tcg-prices.py
"""
import concurrent.futures as cf
import json
import os
import sys
import time
import urllib.request

BASE = "https://tcgcsv.com/tcgplayer/3"          # category 3 = Pokémon (English)
OUT = os.path.join(os.path.dirname(__file__), "..", "data", "tcg-prices.json")
UA = {"User-Agent": "vault-box-price-check/1.0 (+github.com/jadenrosales)"}


def get(url, tries=4):
    err = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return json.load(r)
        except Exception as e:  # transient S3 / network hiccups
            err = e
            time.sleep(2 * (i + 1))
    raise err


def sealed_products(group):
    gid = group["groupId"]
    products = get(f"{BASE}/{gid}/products")["results"]
    prices = get(f"{BASE}/{gid}/prices")["results"]
    by_id = {}
    for p in prices:
        # Sealed products only have the "Normal" sub-type; keep the first price row per product.
        if p["productId"] not in by_id or p.get("subTypeName") in (None, "Normal"):
            by_id[p["productId"]] = p
    out = []
    for p in products:
        ext = {e.get("name") for e in (p.get("extendedData") or [])}
        if "Number" in ext or "Rarity" in ext:
            continue  # single card, not sealed
        pr = by_id.get(p["productId"], {})
        if pr.get("marketPrice") is None and pr.get("lowPrice") is None:
            continue  # nothing to price it with
        out.append({
            "id": p["productId"],
            "n": p["name"],
            "g": group["name"],
            "m": pr.get("marketPrice"),
            "l": pr.get("lowPrice"),
            "r": (group.get("publishedOn") or "")[:10],
        })
    return out


def main():
    groups = get(f"{BASE}/groups")["results"]
    products = []
    with cf.ThreadPoolExecutor(8) as ex:
        for chunk in ex.map(sealed_products, groups):
            products.extend(chunk)
    products.sort(key=lambda p: (p["r"], p["n"]), reverse=True)
    snapshot = {
        "updated": time.strftime("%Y-%m-%d"),
        "source": "TCGPlayer Market Price via tcgcsv.com",
        "count": len(products),
        "products": products,
    }
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, separators=(",", ":"), ensure_ascii=False)
    print(f"{len(products)} sealed products from {len(groups)} sets -> {os.path.relpath(OUT)} "
          f"({os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    sys.exit(main())
