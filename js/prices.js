/* Price check page: match a pasted list against TCGPlayer market prices.
   Data: data/tcg-prices.json (daily snapshot) or, if VAULT_CONFIG.tcgApi is set,
   the collectr-scraper service's live /tcg/prices endpoint. */
(function () {
  const { esc } = window.VB;
  const API = (window.VAULT_CONFIG.tcgApi || "").replace(/\/$/, "");
  const $ = (id) => document.getElementById(id);
  const fmt = (v) => v == null ? "—" : "$" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ---------- parsing ---------- */
  const QTY = [
    /^\s*(\d+)\s*[x×]\s*(.+?)\s*$/i,                                  // 3x Name / 3 x Name
    /^\s*(.+?)\s*[x×]\s*(\d+)\s*$/i,                                  // Name x3
    /^\s*(.+?)\s*[([]?\s*qty\s*[:=]?\s*(\d+)\s*[)\]]?\s*$/i,          // Name Qty: 3
    /^\s*(.+?)\s*[,|\t;]\s*(\d+)\s*$/,                                // Name, 3
    /^\s*(\d+)\s+(.+?)\s*$/,                                          // 3 Name
    /^\s*(.+?)\s+(\d+)\s*$/,                                          // Name 3
  ];
  function parseLine(raw) {
    const line = raw.replace(/^[\s\-*•]+/, "").trim();
    if (!line) return null;
    for (const re of QTY) {
      const m = line.match(re);
      if (m) {
        const [a, b] = [m[1], m[2]];
        // "30th posters" style lines can start with a number that is part of the name; only
        // treat a leading number as qty when what follows isn't a bare set-ish word like "30th".
        if (/^\d+$/.test(a)) return { query: b.trim(), qty: +a };
        return { query: a.trim(), qty: +b };
      }
    }
    return { query: line, qty: 1 };
  }
  const parseList = (text) => text.split(/\r?\n/).map(parseLine).filter(Boolean);

  /* ---------- matching ---------- */
  const STOP = new Set(["pokemon", "tcg", "the", "and", "of", "a"]);
  const SYN = {
    umbreon: "night", espeon: "day",              // 30th Celebration UPC [Night] / [Day]
    etb: "elite trainer box", upc: "ultra premium collection", bb: "booster bundle",
    "3pk": "3 pack", "3pack": "3 pack", pokeball: "poke ball",
    figure: "figure collection", ditto: "ditto premium collection",
  };
  // Words that mean a different product than the user probably typed (unless they typed them).
  const TYPE_PENALTY = ["case", "code card", "set of", "display", "digital", "sleeved", "art bundle", "bundle case"];
  // Retailer / version variants: smaller penalty, so they still win when nothing else fits.
  const VARIANT_PENALTY = ["international version", "retail version", "exclusive", "costco", "sam's club", "pokemon center", "target", "walmart"];
  const norm = (s) => String(s).toLowerCase().replace(/[[\]()\-–—:,/]/g, " ").replace(/[^a-z0-9 ]+/g, "").replace(/\s+/g, " ").trim();
  const stem = (t) => (t.length > 3 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t);  // posters -> poster, tins -> tin
  const tokens = (s) => new Set(norm(s).split(" ").filter((t) => t && !STOP.has(t)).map(stem));
  // Query with shorthand replaced by the full phrase (for exact-name checks).
  const expand = (q) => norm(q).split(" ").map((w) => SYN[w] || w).join(" ");
  const synWords = (t) => (SYN[t] ? SYN[t].split(" ").map(stem) : []);
  // A typed word counts as present if it, or every word of its synonym, is in the product.
  const present = (t, c) => c.has(t) || (synWords(t).length > 0 && synWords(t).every((w) => c.has(w)));

  function score(query, p, ctx) {
    const q = tokens(query);
    const c = tokens(p.n + " " + p.g);
    const cn = tokens(p.n);
    if (!q.size || !c.size) return 0;
    let hit = 0;
    q.forEach((t) => { if (present(t, c)) hit++; });
    let s = hit / q.size;                              // how much of what they typed is in the product
    if (s < 0.5) return s - 1;                         // less than half the words present: not a match
    const qAll = new Set(q); q.forEach((t) => synWords(t).forEach((w) => qAll.add(w)));
    let extra = 0; cn.forEach((t) => { if (!qAll.has(t)) extra++; });
    s -= Math.min(0.3, 0.05 * extra);                  // words in the product name they didn't type
    if (norm(p.n) === norm(query) || norm(p.n) === expand(query)) s += 1;
    const nl = p.n.toLowerCase(), ql = query.toLowerCase() + " " + expand(query);
    for (const w of TYPE_PENALTY) if (nl.includes(w) && !ql.includes(w)) s -= 0.6;
    for (const w of VARIANT_PENALTY) if (nl.includes(w) && !ql.includes(w)) s -= 0.15;
    if (p.m == null) s -= 0.3;
    s += Math.min(0.15, Math.max(0, (p.id - 400000) / 330000 * 0.15)); // newer TCGPlayer listings (higher ids) first on ties
    // Tie-breaker: set names the rest of the pasted list mentions (e.g. "ascended" elsewhere -> prefer the Ascended Heroes tins).
    if (ctx) { let k = 0; cn.forEach((t) => { if (!qAll.has(t) && ctx.has(t) && setWords.has(t)) k++; }); s += Math.min(0.06, 0.03 * k); }
    return s;
  }
  function rank(query, products, ctx) {
    return products.map((p) => [score(query, p, ctx), p]).filter((x) => x[0] > 0)
      .sort((a, b) => b[0] - a[0]).slice(0, 8).map((x) => x[1]);
  }

  /* ---------- data ---------- */
  let snapshot = null;
  async function loadSnapshot() {
    if (snapshot) return snapshot;
    const r = await fetch("data/tcg-prices.json", { cache: "no-cache" });
    if (!r.ok) throw new Error("Could not load price data");
    snapshot = await r.json();
    return snapshot;
  }
  const toRow = (p) => ({ productId: p.id, name: p.n, set: p.g, marketPrice: p.m, lowestPrice: p.l, url: `https://www.tcgplayer.com/product/${p.id}` });

  // Words that name a set (from every set name in the snapshot), minus generic product words.
  let setWords = new Set();
  const GENERIC = new Set(["me", "sv", "swsh", "sm", "xy", "bw", "box", "pack", "collection", "tin", "promo", "card", "product", "miscellaneous",
    "trainer", "elite", "deck", "kit", "series", "exclusive", "bundle", "special", "edition", "expansion", "black", "star", "league", "battle", "academy", "build", "set", "base", "mini"]);
  async function priceLocal(items) {
    const { products, updated } = await loadSnapshot();
    if (!setWords.size) { const all = new Set(products.map((p) => p.g)); all.forEach((g) => tokens(g).forEach((t) => { if (!GENERIC.has(t) && !/^\d+$/.test(t)) setWords.add(t); })); }
    const ctx = tokens(items.map((it) => it.query).join(" "));
    const rows = items.map((it) => {
      const ranked = rank(it.query, products, ctx).map(toRow);
      return { query: it.query, qty: it.qty, match: ranked[0] || null, alternatives: ranked.slice(1, 6) };
    });
    return { rows, source: `Prices updated ${updated} (TCGPlayer market via daily snapshot).` };
  }
  async function priceLive(items) {
    const r = await fetch(`${API}/tcg/prices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
    const d = await r.json();
    if (!d.success) throw new Error(d.error || "Price service error");
    return { rows: d.rows, source: "Live TCGPlayer market prices." };
  }

  /* ---------- state + render ---------- */
  let data = null;
  const pct = () => Math.min(100, Math.max(1, +$("px-pct").value || 80)) / 100;
  try { const s = localStorage.getItem("px-list"); if (s) $("px-list").value = s; const p = localStorage.getItem("px-pct"); if (p) $("px-pct").value = p; } catch (e) { /* private mode */ }

  function unit(r) { return r.match ? r.match.marketPrice : null; }
  function lineTotal(r) { const u = unit(r); return u == null ? null : u * r.qty; }

  function render() {
    const P = pct(), pctLabel = Math.round(P * 100) + "%";
    $("px-th-pct").textContent = pctLabel; $("px-th-line-pct").textContent = "Line @ " + pctLabel; $("px-offer-label").textContent = "Offer @ " + pctLabel;
    $("px-rows").innerHTML = data.rows.map((r, i) => {
      const m = r.match, u = unit(r), t = lineTotal(r);
      const opts = [m, ...(r.alternatives || [])].filter(Boolean);
      const sel = opts.length > 1 ? `<select class="px-alt" data-i="${i}">${opts.map((o, j) => `<option value="${j}">${esc(o.name)} — ${fmt(o.marketPrice)}</option>`).join("")}</select>` : "";
      return `<tr>
        <td class="px-name">${m ? `<a href="${m.url}" target="_blank" rel="noopener">${esc(m.name)}</a><div class="px-set">${esc(m.set || "")}${m.lowestPrice != null ? ` · low ${fmt(m.lowestPrice)}` : ""}</div>` : `<span class="px-bad">No match</span>`}
          <div class="px-q">you typed: ${esc(r.query)}</div>${sel}</td>
        <td class="n" data-l="Qty"><input class="px-qty" type="number" min="0" value="${r.qty}" data-i="${i}"></td>
        <td class="n" data-l="Market">${fmt(u)}</td>
        <td class="n" data-l="${pctLabel}">${u == null ? "—" : fmt(u * P)}</td>
        <td class="n" data-l="Line total">${fmt(t)}</td>
        <td class="n gold-text" data-l="Line @ ${pctLabel}">${t == null ? "—" : fmt(t * P)}</td>
      </tr>`;
    }).join("");
    document.querySelectorAll(".px-alt").forEach((s) => s.addEventListener("change", (e) => {
      const r = data.rows[+e.target.dataset.i], opts = [r.match, ...r.alternatives], pick = opts[+e.target.value];
      r.match = pick; r.alternatives = opts.filter((o) => o !== pick); render();
    }));
    document.querySelectorAll(".px-qty").forEach((inp) => inp.addEventListener("input", (e) => {
      data.rows[+e.target.dataset.i].qty = Math.max(0, +e.target.value || 0); render();
      e.target.focus();
    }));
    const total = data.rows.reduce((a, r) => a + (lineTotal(r) || 0), 0);
    const units = data.rows.reduce((a, r) => a + (r.qty || 0), 0);
    const un = data.rows.filter((r) => !r.match).length;
    $("px-total").textContent = fmt(total); $("px-offer").textContent = fmt(total * P);
    $("px-units").textContent = units; $("px-unmatched").textContent = un; $("px-unmatched").className = un ? "px-bad" : "";
    $("px-f-units").textContent = units; $("px-f-total").textContent = fmt(total); $("px-f-offer").textContent = fmt(total * P);
    $("px-source").textContent = data.source || "";
    $("px-out").style.display = ""; $("px-csv").disabled = $("px-copy").disabled = false;
  }

  async function run() {
    const text = $("px-list").value.trim();
    if (!text) { $("px-status").textContent = "Paste a list first."; return; }
    try { localStorage.setItem("px-list", text); localStorage.setItem("px-pct", $("px-pct").value); } catch (e) { /* ignore */ }
    const items = parseList(text);
    $("px-go").disabled = true; $("px-status").textContent = "Checking…";
    try {
      data = API ? await priceLive(items).catch(() => priceLocal(items)) : await priceLocal(items);
      $("px-status").textContent = "";
      render();
      $("px-out").scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      $("px-status").innerHTML = `<span class="px-bad">${esc(e.message)}</span>`;
    }
    $("px-go").disabled = false;
  }

  function tableRows() {
    const P = pct();
    const head = ["Product", "Set", "Qty", "Market", `${Math.round(P * 100)}%`, "Line total", `Line @ ${Math.round(P * 100)}%`, "TCGPlayer ID", "You typed"];
    const body = data.rows.map((r) => { const m = r.match || {}, u = unit(r), t = lineTotal(r); return [m.name || "NO MATCH", m.set || "", r.qty, u ?? "", u == null ? "" : (u * P).toFixed(2), t == null ? "" : t.toFixed(2), t == null ? "" : (t * P).toFixed(2), m.productId || "", r.query]; });
    const total = data.rows.reduce((a, r) => a + (lineTotal(r) || 0), 0);
    body.push(["TOTAL", "", data.rows.reduce((a, r) => a + (r.qty || 0), 0), "", "", total.toFixed(2), (total * P).toFixed(2), "", ""]);
    return [head, ...body];
  }

  $("px-go").addEventListener("click", run);
  $("px-list").addEventListener("keydown", (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run(); });
  $("px-pct").addEventListener("input", () => { try { localStorage.setItem("px-pct", $("px-pct").value); } catch (e) { /* ignore */ } if (data) render(); });
  $("px-clear").addEventListener("click", () => { $("px-list").value = ""; data = null; $("px-out").style.display = "none"; $("px-status").textContent = ""; $("px-csv").disabled = $("px-copy").disabled = true; try { localStorage.removeItem("px-list"); } catch (e) { /* ignore */ } });
  $("px-csv").addEventListener("click", () => {
    const csv = tableRows().map((l) => l.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "tcg-market-prices.csv"; a.click();
  });
  $("px-copy").addEventListener("click", async () => {
    const rows = tableRows(); const P = Math.round(pct() * 100);
    const txt = rows.slice(1).map((r) => r[0] === "TOTAL" ? `TOTAL — ${r[2]} units — market $${r[5]} — @${P}% $${r[6]}` : `${r[2]}x ${r[0]} — ${fmt(+r[3])} ea — ${fmt(+r[5])} (@${P}% ${fmt(+r[6])})`).join("\n");
    try { await navigator.clipboard.writeText(txt); $("px-status").textContent = "Copied."; setTimeout(() => { $("px-status").textContent = ""; }, 1500); } catch (e) { $("px-status").textContent = "Copy failed; use Download CSV."; }
  });
})();
