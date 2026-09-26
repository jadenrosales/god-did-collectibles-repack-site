/* Spots page: every spot and the Pokémon that come with it, filterable by box. */
(function () {
  const { esc, liveEditions, spots, spotTitle, sprite } = window.VB;
  const $ = (id) => document.getElementById(id);
  const TRAINER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`;

  // Card colours per spot, loosely based on the headline Pokémon's type.
  const COLORS = {
    1: ["#ff7a2f", "#ffcc33"], 2: ["#ffd84a", "#ff9f1a"], 3: ["#ffd84a", "#3a3f6b"], 4: ["#3ddc84", "#1a6b4a"],
    5: ["#ff8fd0", "#8a6bff"], 6: ["#bcd4ff", "#4a6bd8"], 7: ["#c08bff", "#5b3fa8"], 8: ["#a76bff", "#3b1f6b"],
    9: ["#d9a066", "#8a5a2b"], 10: ["#4a7bff", "#c43a3a"], 11: ["#e9f1ff", "#4aa3ff"], 12: ["#4ab8ff", "#ffcc33"],
    13: ["#ff9fd0", "#6bd2ff"], 14: ["#ff6b8a", "#c08bff"], 15: ["#ff6b8a", "#4a7bff"], 16: ["#f3e2a0", "#b8a66b"],
    17: ["#8fb34a", "#4a3f3f"], 18: ["#ffb14a", "#4a9bff"], 19: ["#4a9bff", "#1a4bb8"], 20: ["#ff5a3a", "#3a6bff"],
    21: ["#3ab8ff", "#8a3a6b"], 22: ["#6bdc9b", "#ff8fb8"], 23: ["#3a8bff", "#ff5a3a"], 24: ["#6bdc5a", "#ff7ab8"],
    25: ["#4a8bff", "#c46b3a"], 26: ["#8fdc6b", "#8fe0ff"], 27: ["#ffe04a", "#6bd2ff"], 28: ["#6bb8b8", "#2b4a5a"],
    29: ["#ffb03a", "#c08bff"], 30: ["#9bff6b", "#ff8fd0"], 31: ["#6bc8ff", "#ffcc33"], 32: ["#f3c969", "#b8862b"],
  };

  const eds = liveEditions();
  const byEd = Object.fromEntries(eds.map((e) => [e.key, spots(e.key)]));
  const allSpots = Object.values(byEd).reduce((a, b) => (b.length > a.length ? b : a), []);
  const state = { box: "all", q: "" };

  const hero = (s) => [...s.groups].sort((a, b) => b.cards.length - a.cards.length)[0];
  const countIn = (key, n) => {
    const s = byEd[key].find((x) => x.spot === n);
    return s ? s.groups.reduce((m, g) => m + g.cards.length, 0) : 0;
  };

  function renderPick() {
    const btn = (key, label, sub, img, color) => `
      <button class="bp ${state.box === key ? "on" : ""}" data-box="${key}" style="--a:${color}">
        ${img ? `<img src="assets/boxes/${key}.webp" alt="">` : '<div class="all">ALL</div>'}
        <div><b>${esc(label)}</b><span>${esc(sub)}</span></div>
      </button>`;
    $("pick").innerHTML = btn("all", "All boxes", `${allSpots.length} spots`, false, "#f3c969") +
      eds.map((e) => btn(e.key, e.name, `${byEd[e.key].length} spots · ${e.price}`, true, e.colors.a)).join("");

    const e = eds.find((x) => x.key === state.box);
    $("pick-note").style.setProperty("--a", e ? e.colors.a : "");
    $("pick-note").innerHTML = e
      ? `<b>${esc(e.name)}</b> has <b>${byEd[e.key].length}</b> spots, and the box range is <b>${esc(e.price)}</b>.`
      : `Grail &amp; Nuclear run spots <b>1–20</b>. Obsidian &amp; Spark run all <b>${allSpots.length}</b>.`;
  }

  function render() {
    const q = state.q.trim().toLowerCase();
    const list = (state.box === "all" ? allSpots : byEd[state.box])
      .filter((s) => !q || `${spotTitle(s)} ${s.spot}`.toLowerCase().includes(q));

    $("board").innerHTML = list.map((s, i) => {
      const [c1, c2] = COLORS[s.spot] || COLORS[32];
      const h = hero(s);
      const others = s.groups.filter((g) => g !== h);
      const isTrainer = !window.spriteUrl(h.pokemon);
      const inBoxes = eds.filter((e) => countIn(e.key, s.spot));
      const target = state.box !== "all" ? state.box : inBoxes[0].key;
      const count = state.box !== "all"
        ? `${countIn(state.box, s.spot)} possible pulls`
        : `${Math.max(...inBoxes.map((e) => countIn(e.key, s.spot)))} possible pulls`;
      const side = others.slice(0, 6).map((g) => sprite(g.pokemon, "side"));
      const stage = isTrainer
        ? `<div class="trainer">${TRAINER_ICON}</div>`
        : `<div class="mons">${side.slice(0, Math.ceil(side.length / 2)).join("")}${sprite(h.pokemon, "lead")}${side.slice(Math.ceil(side.length / 2)).join("")}</div>`;
      return `
      <a class="sc ${others.length > 4 ? "many" : ""}" href="index.html#box/${target}/${s.spot}"
         style="--c1:${c1};--c2:${c2};animation-delay:${Math.min(i * 30, 600)}ms">
        <span class="bignum">${s.spot}</span>
        <div class="head"><span class="tag">Spot ${s.spot}</span></div>
        <div class="stage">${stage}</div>
        <div class="body">
          <h3>${esc(isTrainer ? h.pokemon : h.pokemon)}</h3>
          ${s.groups.length > 1 ? `<div class="mon-chips">${s.groups.map((g) => `<span>${esc(g.pokemon)}</span>`).join("")}</div>` : ""}
          <div class="foot">
            <div class="in">${inBoxes.map((e) => `<i style="--e:${e.colors.a}">${esc(e.name)}</i>`).join("")}</div>
            <span class="go">${count}</span>
          </div>
        </div>
      </a>`;
    }).join("") || `<div class="empty" style="grid-column:1/-1">No spots match “${esc(state.q)}”.</div>`;
  }

  $("pick").addEventListener("click", (e) => {
    const b = e.target.closest(".bp");
    if (!b) return;
    location.hash = b.dataset.box === "all" ? "" : b.dataset.box;
    if (b.dataset.box === "all") select("all");
  });
  $("q").addEventListener("input", (e) => { state.q = e.target.value; render(); });

  function select(key) {
    state.box = byEd[key] ? key : "all";
    renderPick();
    render();
  }
  window.addEventListener("hashchange", () => select(location.hash.slice(1)));
  select(location.hash.slice(1));
})();
