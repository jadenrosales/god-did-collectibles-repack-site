/* Home page: box lineup, box detail overlay (spots + checklist), random pull, spot finder. */
(function () {
  const { CFG, DATA, esc, plus, edition, liveEditions, spots, spotTitle, sprite, applyTheme } = window.VB;
  const $ = (id) => document.getElementById(id);
  const CAT_LABEL = { m: "Main set", a: "Alt art / SIR", p: "Promo" };
  const TRAINER_ICON = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>`;

  const cardCount = (key) => spots(key).reduce((n, s) => n + s.groups.reduce((m, g) => m + g.cards.length, 0), 0);

  /* ---------- hero stats + ticker ---------- */
  function renderStats() {
    const eds = liveEditions();
    const total = eds.reduce((n, e) => n + cardCount(e.key), 0);
    const nSpots = Math.max(...eds.map((e) => spots(e.key).length));
    $("stats").innerHTML = [
      [eds.length, "Live boxes"],
      [plus(total), "Possible pulls"],
      [nSpots, "Spots in play"],
    ].map(([b, s]) => `<div class="stat"><b class="gold">${b}</b><span>${s}</span></div>`).join("");
  }

  function renderTicker() {
    const items = [];
    for (const e of liveEditions().slice(0, 2)) {
      for (const s of spots(e.key)) {
        for (const g of s.groups) {
          const c = g.cards.find((c) => c[3] === "a");
          if (c && items.length < 40) items.push(`<span class="item"><b>${esc(c[0])} #${esc(c[1])}</b> ${esc(DATA.sets[c[2]])} <i>${esc(e.name)} · Spot ${s.spot}</i></span>`);
        }
      }
    }
    $("ticker").innerHTML = items.join("") + items.join("");
  }

  /* ---------- lineup ---------- */
  function renderLineup() {
    $("lineup").innerHTML = CFG.editions.map((e) => {
      const live = !e.comingSoon && DATA.editions[e.key];
      const n = live ? spots(e.key).length : 0;
      return `
      <button class="box ${live ? "" : "soon"} reveal-up" data-key="${e.key}" ${live ? "" : 'tabindex="-1" aria-disabled="true"'}
        style="--a:${e.colors.a};--b:${e.colors.b};--g:${e.colors.glow}">
        <div class="price">${esc(e.price)}</div>
        <div class="art">
          <img src="assets/boxes/${e.key}.webp" alt="Vault Box ${esc(e.name)} edition">
          <div class="foil"></div><div class="glare"></div>${live ? '<div class="shine-bar"></div>' : ""}
          ${live ? "" : `<div class="lock"><div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>COMING SOON</div></div>`}
        </div>
        <div class="meta">
          <span>${live ? `${n} spots · ${plus(cardCount(e.key))} cards` : "Locked"}</span>
          ${live ? '<span class="open">Open</span>' : ""}
        </div>
      </button>`;
    }).join("");

    document.querySelectorAll(".box:not(.soon)").forEach((box) => {
      const art = box.querySelector(".art");
      box.addEventListener("pointermove", (ev) => {
        if (ev.pointerType !== "mouse") return;
        const r = art.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
        art.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg) scale(1.03)`;
        art.style.setProperty("--mx", `${x * 100}%`);
        art.style.setProperty("--my", `${y * 100}%`);
        art.style.setProperty("--fx", `${x * 100}%`);
        art.style.setProperty("--fy", `${y * 100}%`);
      });
      box.addEventListener("pointerleave", () => { art.style.transform = ""; });
      box.addEventListener("click", () => go(box.dataset.key, 1));
    });
  }

  /* ---------- vault overlay ---------- */
  const state = { key: null, spot: 1, cat: "all", q: "" };
  const vault = $("vault");

  function go(key, spot) {
    location.hash = `box/${key}/${spot || 1}`;
  }

  function route() {
    const m = location.hash.match(/^#box\/([a-z]+)(?:\/(\d+))?/);
    const ed = m && edition(m[1]);
    if (!ed || ed.comingSoon || !DATA.editions[ed.key]) return closeVault(true);
    const list = spots(ed.key);
    const spot = Math.min(Math.max(parseInt(m[2] || "1", 10), 1), list.length);
    openVault(ed, spot);
  }

  function openVault(ed, spot) {
    const wasOpen = vault.classList.contains("on");
    const switched = state.key !== ed.key;
    state.key = ed.key;
    state.spot = spot;
    if (switched) { state.cat = "all"; state.q = ""; $("cl-q").value = ""; }

    applyTheme(vault, ed);
    $("v-ed").textContent = `${ed.name.toUpperCase()} EDITION`;
    $("v-title").textContent = ed.name.toUpperCase();
    $("v-price").innerHTML = `<small>Box range</small>${esc(ed.price)}`;
    $("v-tag").textContent = ed.tagline;
    $("v-art").src = `assets/boxes/${ed.key}.webp`;
    $("v-art").alt = `Vault Box ${ed.name} edition`;
    const list = spots(ed.key);
    const alts = list.reduce((n, s) => n + s.groups.reduce((m, g) => m + g.cards.filter((c) => c[3] === "a").length, 0), 0);
    $("v-facts").innerHTML = `
      <span><b>${list.length}</b> spots</span>
      <span><b>${plus(cardCount(ed.key))}</b> possible pulls</span>
      <span><b>${plus(alts)}</b> alt arts / SIRs</span>`;
    $("v-rules").innerHTML = `
      <li><b>Condition:</b> Cards may be graded or near mint, selected to fit the ${esc(ed.name)} price range of ${esc(ed.price)}.</li>
      <li><b>Japanese cards:</b> JP versions of every listed card are also in play, as long as they fit the price range.</li>
      <li><b>Always growing:</b> We add cards that fit this price range all the time, including new releases.</li>`;
    $("v-switch").innerHTML = liveEditions().map((e) =>
      `<button class="${e.key === ed.key ? "on" : ""}" data-key="${e.key}">${esc(e.name)}</button>`).join("");

    $("v-spots").href = `spots.html#${ed.key}`;

    renderRail();
    renderChecklist();

    if (!wasOpen) {
      document.body.classList.add("locked");
      vault.classList.remove("opening", "opened");
      vault.classList.add("on");
      $("v-scroller").scrollTop = 0;
      requestAnimationFrame(() => requestAnimationFrame(() => vault.classList.add("opening")));
      setTimeout(() => vault.classList.add("opened"), 1500);
    } else if (switched) {
      $("v-scroller").scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function closeVault(fromRoute) {
    if (!vault.classList.contains("on")) return;
    vault.classList.remove("on", "opening", "opened");
    document.body.classList.remove("locked");
    state.key = null;
    if (!fromRoute) history.pushState("", document.title, location.pathname + location.search + "#boxes");
  }

  function renderRail() {
    const list = spots(state.key);
    $("v-rail").innerHTML = `<h4>Spots <span>· in no particular order</span></h4>` + list.map((s) => {
      const n = s.groups.reduce((m, g) => m + g.cards.length, 0);
      return `<button class="sp ${s.spot === state.spot ? "on" : ""}" data-spot="${s.spot}">
        <span class="n">${s.spot}</span><span class="t">${esc(spotTitle(s))}</span><span class="c">${n ? plus(n) : "New"}</span></button>`;
    }).join("");
    const on = $("v-rail").querySelector(".sp.on");
    if (on) on.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  function cardHtml(c, i) {
    const cat = c[3];
    return `<div class="pc ${cat}" style="animation-delay:${Math.min(i * 12, 360)}ms">
      <span class="nm">${esc(c[0])}</span><span class="no">#${esc(c[1])}</span>
      <span class="st">${esc(DATA.sets[c[2]])}</span>
      <span class="rar">${esc(c[4] || CAT_LABEL[cat])}</span></div>`;
  }

  function matches(c, pokemon, q) {
    if (!q) return true;
    return `${c[0]} ${c[1]} ${DATA.sets[c[2]]} ${c[4]} ${pokemon}`.toLowerCase().includes(q);
  }

  function renderChecklist() {
    const list = spots(state.key);
    const q = state.q.trim().toLowerCase();
    const scope = q ? list : list.filter((s) => s.spot === state.spot);
    const spot = list.find((s) => s.spot === state.spot);

    // header
    const isTrainer = spot.groups.length === 1 && !window.spriteUrl(spot.groups[0].pokemon);
    const counts = { m: 0, a: 0, p: 0 };
    spot.groups.forEach((g) => g.cards.forEach((c) => counts[c[3]]++));
    $("cl-head").innerHTML = `
      <div class="sprites">${isTrainer ? `<div class="trainer" style="width:76px;height:76px;display:grid;place-items:center;color:var(--a)">${TRAINER_ICON}</div>` : spot.groups.slice(0, 7).map((g, i) => sprite(g.pokemon).replace("<img", `<img style="animation-delay:${i * 60}ms"`)).join("")}</div>
      <h3><small>Spot ${spot.spot} of ${list.length}</small>${esc(spotTitle(spot))}</h3>
      <div class="counts">${counts.m + counts.a + counts.p
        ? `${plus(counts.m)} main-set cards · ${plus(counts.a)} alt arts / SIRs · ${plus(counts.p)} promos`
        : "Checklist coming soon"}</div>`;

    // category tabs (counts reflect current scope + search)
    const tally = { all: 0, m: 0, a: 0, p: 0 };
    scope.forEach((s) => s.groups.forEach((g) => g.cards.forEach((c) => {
      if (matches(c, g.pokemon, q)) { tally.all++; tally[c[3]]++; }
    })));
    $("cl-seg").innerHTML = [["all", "All"], ["m", "Main"], ["a", "Alt / SIR"], ["p", "Promos"]].map(([k, l]) =>
      `<button class="${state.cat === k ? "on" : ""}" data-cat="${k}">${l}<span class="k">${tally[k]}</span></button>`).join("");

    // list
    let i = 0;
    const html = scope.map((s) => {
      const groups = s.groups.map((g) => {
        const cards = g.cards.filter((c) => (state.cat === "all" || c[3] === state.cat) && matches(c, g.pokemon, q));
        if (!cards.length) return "";
        return `<div class="group"><h5>${sprite(g.pokemon)}${esc(g.pokemon)} <span>${cards.length} card${cards.length === 1 ? "" : "s"}</span></h5>
          <div class="cards">${cards.map((c) => cardHtml(c, i++)).join("")}</div></div>`;
      }).join("");
      if (!groups) return "";
      return q ? `<div class="group"><h5 style="color:var(--a);font-family:var(--display);font-weight:400;font-size:18px">
        <a href="#box/${state.key}/${s.spot}" style="text-decoration:none">Spot ${s.spot} · ${esc(spotTitle(s))}</a></h5></div>${groups}` : groups;
    }).join("");
    const unlisted = !q && !spot.groups.some((g) => g.cards.length);
    const ed = edition(state.key);
    $("cl-list").innerHTML = html || (unlisted
      ? `<div class="empty">This spot is in play in ${esc(ed.name)}, and its checklist is on the way.<br>Any card featuring these Pokémon that fits the ${esc(ed.price)} range can hit.</div>`
      : `<div class="empty">No cards match${q ? ` “${esc(state.q)}”` : ""} in this ${q ? "box" : "spot"}.</div>`);
  }

  /* ---------- random pull ---------- */
  function crack() {
    const ed = edition(state.key);
    const pool = [];
    spots(state.key).forEach((s) => s.groups.forEach((g) => g.cards.forEach((c) => pool.push([s, g, c]))));
    const [s, g, c] = pool[Math.floor(Math.random() * pool.length)];
    const rv = $("rv");
    applyTheme($("reveal"), ed);
    rv.innerHTML = `
      <div class="lbl">${esc(ed.name)} · Spot ${s.spot}</div>
      ${sprite(g.pokemon) || `<div style="height:150px;display:grid;place-items:center;color:var(--a)">${TRAINER_ICON}</div>`}
      <h3>${esc(c[0])}</h3>
      <p><b style="color:var(--a)">#${esc(c[1])}</b> · ${esc(DATA.sets[c[2]])}</p>
      <p>${esc(c[4] || CAT_LABEL[c[3]])}</p>
      <div class="btns">
        <button class="btn accent" data-act="again">Crack again</button>
        <a class="btn" href="#box/${state.key}/${s.spot}" data-act="goto">Go to spot ${s.spot}</a>
      </div>
      <div class="fine">Just for fun — random pick from the checklist, not real odds.</div>`;
    const r = $("reveal");
    r.classList.remove("on");
    void r.offsetWidth;
    r.classList.add("on");
    burst();
  }

  function burst() {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    for (let i = 0; i < 28; i++) {
      const d = document.createElement("div");
      d.className = "spark-burst";
      const a = Math.random() * Math.PI * 2, r = 120 + Math.random() * 220;
      d.style.left = cx + "px"; d.style.top = cy + "px";
      d.style.setProperty("--dx", Math.cos(a) * r + "px");
      d.style.setProperty("--dy", Math.sin(a) * r + "px");
      d.style.background = getComputedStyle($("reveal")).getPropertyValue("--a");
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 950);
    }
  }

  /* ---------- finder ---------- */
  function renderFinder() {
    const q = $("finder-q").value.trim().toLowerCase();
    const out = $("finder-results");
    if (q.length < 2) { out.innerHTML = ""; return; }
    const hits = new Map(); // pokemon -> [{ed, spot}]
    for (const e of liveEditions()) {
      for (const s of spots(e.key)) {
        for (const g of s.groups) {
          const hit = g.pokemon.toLowerCase().includes(q) || g.cards.some((c) => c[0].toLowerCase().includes(q));
          if (!hit) continue;
          if (!hits.has(g.pokemon)) hits.set(g.pokemon, []);
          hits.get(g.pokemon).push({ e, spot: s.spot });
        }
      }
    }
    if (!hits.size) { out.innerHTML = `<div class="muted">No Pokémon or cards match “${esc(q)}”.</div>`; return; }
    out.innerHTML = [...hits].slice(0, 12).map(([p, where]) => `
      <div class="fr">${sprite(p) || `<div style="color:var(--gold);display:grid;place-items:center">${TRAINER_ICON}</div>`}
        <div><h4>${esc(p)}</h4><div class="where">${where.map((w) =>
          `<button data-go="${w.e.key}/${w.spot}" style="--c:${w.e.colors.a}">${esc(w.e.name)} · <b>Spot ${w.spot}</b></button>`).join("")}</div></div>
      </div>`).join("");
  }

  /* ---------- events ---------- */
  $("v-close").addEventListener("click", () => closeVault(false));
  $("v-switch").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-key]");
    if (b) go(b.dataset.key, 1);
  });
  $("v-rail").addEventListener("click", (e) => {
    const b = e.target.closest(".sp");
    if (!b) return;
    state.q = ""; $("cl-q").value = "";
    go(state.key, b.dataset.spot);
    const top = document.querySelector(".v-body").offsetTop - 70;
    if ($("v-scroller").scrollTop > top) $("v-scroller").scrollTo({ top, behavior: "smooth" });
  });
  $("cl-seg").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cat]");
    if (b) { state.cat = b.dataset.cat; renderChecklist(); }
  });
  let t;
  $("cl-q").addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = e.target.value; renderChecklist(); }, 120);
  });
  $("v-crack").addEventListener("click", crack);
  $("reveal").addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]");
    if (act && act.dataset.act === "again") return crack();
    if (act || e.target === $("reveal")) $("reveal").classList.remove("on");
  });
  $("finder-q").addEventListener("input", renderFinder);
  $("finder-results").addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (!b) return;
    const [k, s] = b.dataset.go.split("/");
    state.q = ""; $("cl-q").value = "";
    go(k, s);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($("reveal").classList.contains("on")) $("reveal").classList.remove("on");
    else closeVault(false);
  });
  window.addEventListener("hashchange", route);

  renderStats();
  renderTicker();
  renderLineup();
  route();
})();
