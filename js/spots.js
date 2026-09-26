/* Spot board: lists every spot and pulls TikTok usernames live from the Google Sheet. */
(function () {
  const { CFG, esc, liveEditions, spots, spotTitle, sprite } = window.VB;
  const $ = (id) => document.getElementById(id);
  const REFRESH_MS = 30000;
  const TRAINER_ICON = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`;

  // The board follows the box with the most spots; each tile links to every box that has that spot.
  const eds = liveEditions();
  const boardSpots = eds.map((e) => spots(e.key)).reduce((a, b) => (b.length > a.length ? b : a), []);

  const state = { filter: "all", q: "", owners: [], status: "" };

  function parseCsv(text) {
    const rows = [];
    let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) {
        if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (ch === '"') q = false;
        else cell += ch;
      } else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
      else if (ch !== "\r") cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  async function loadOwners() {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${CFG.spotSheet}/gviz/tq?tqx=out:csv&cb=${Date.now()}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      const rows = parseCsv(await res.text());
      // Row 1 is the header ("Pokémon Spot", "TikTok Username"); spot N is row N+1.
      const start = /pok/i.test(rows[0]?.[0] || "") ? 1 : 0;
      state.owners = rows.slice(start).map((r) => (r[1] || "").trim());
      state.status = "live";
    } catch (err) {
      state.status = "off";
    }
    render();
  }

  function render() {
    const q = state.q.trim().toLowerCase();
    const list = boardSpots.map((s, i) => ({ s, owner: state.owners[i] || "" }));
    const taken = list.filter((x) => x.owner).length;

    $("p-lbl").textContent = `${list.length} Spots`;
    $("p-num").textContent = `${taken} / ${list.length} claimed · ${list.length - taken} open`;
    $("p-bar").style.width = `${(taken / list.length) * 100}%`;

    $("sync").className = `sync ${state.status}`;
    $("sync").querySelector("span").textContent =
      state.status === "live" ? "Live from break sheet" : state.status === "off" ? "Couldn't reach the sheet — showing spots only" : "Connecting…";

    const shown = list.filter(({ s, owner }) => {
      if (state.filter === "open" && owner) return false;
      if (state.filter === "taken" && !owner) return false;
      if (!q) return true;
      return `${spotTitle(s)} ${owner} ${s.spot}`.toLowerCase().includes(q);
    });

    $("board").innerHTML = shown.map(({ s, owner }, i) => {
      const art = s.groups.map((g) => sprite(g.pokemon)).join("");
      const handle = owner && !owner.startsWith("@") ? "@" + owner : owner;
      const inBoxes = eds.filter((e) => spots(e.key).some((x) => x.spot === s.spot));
      return `
      <div class="tile ${owner ? "taken" : "open"}" style="animation-delay:${Math.min(i * 25, 500)}ms">
        <div class="top"><span class="num">${s.spot}</span><span class="status">${owner ? "Claimed" : "Open"}</span></div>
        <div class="sprites">${art || `<div class="trainer">${TRAINER_ICON}</div>`}</div>
        <div class="names">${esc(spotTitle(s))}</div>
        <div class="owner">${owner ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0115.5 3h-3.2v12.4a2.6 2.6 0 11-2.6-2.6c.3 0 .5 0 .8.1V9.6a5.8 5.8 0 105 5.8V9a7.4 7.4 0 004.3 1.4V7.2a4.3 4.3 0 01-3.2-1.4z"/></svg><b>${esc(handle)}</b>` : "Up for grabs"}</div>
        <div class="links">${inBoxes.map((e) => `<a href="index.html#box/${e.key}/${s.spot}" style="--c:${e.colors.a}">${esc(e.name)} →</a>`).join("")}</div>
      </div>`;
    }).join("") || `<div class="empty" style="grid-column:1/-1">No spots match.</div>`;
  }

  $("filter").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]");
    if (!b) return;
    state.filter = b.dataset.f;
    $("filter").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
    render();
  });
  $("q").addEventListener("input", (e) => { state.q = e.target.value; render(); });

  render();
  loadOwners();
  setInterval(() => { if (!document.hidden) loadOwners(); }, REFRESH_MS);
})();
