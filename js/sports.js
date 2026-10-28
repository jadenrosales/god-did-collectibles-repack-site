/* Sports page: box lineup with tilt effect, a detail card per box, and the 32 team spots. */
(function () {
  const { esc } = window.VB;
  const CFG = window.SPORTS_CONFIG;
  const TEAMS = window.TEAM_SPOTS;
  const $ = (id) => document.getElementById(id);
  const price = (b) => b.price || (b.single ? "Single show series" : "Price coming soon");
  const art = (b, cls = "") => b.noArt
    ? `<div class="no-art ${cls}" style="--c:${b.color}"><span class="metal">VAULT</span><span class="metal">BOX</span><b>${esc(b.name.toUpperCase())}</b></div>`
    : `<img class="${cls}" src="assets/sports/${b.key}.webp" alt="Vault Box ${esc(b.name)}">`;

  $("sport-chips").innerHTML = CFG.sports.map((s, i) =>
    `<span class="sport-chip ${i === 0 ? "main" : ""}">${esc(s)}</span>`).join("");

  /* ---------- boxes ---------- */
  $("lineup").innerHTML = CFG.boxes.map((b) => `
    <button class="box reveal-up" data-key="${b.key}" style="--a:${b.color};--b:${b.color};--g:${b.color}80">
      <div class="price ${b.single ? "single" : ""}">${esc(price(b))}</div>
      <div class="art">
        ${art(b)}
        <div class="foil"></div><div class="glare"></div><div class="shine-bar"></div>
      </div>
      <div class="meta"><span>${esc(b.name)}</span><span class="open">View</span></div>
    </button>`).join("");

  document.querySelectorAll("#lineup .box").forEach((box) => {
    const el = box.querySelector(".art");
    box.addEventListener("pointermove", (ev) => {
      if (ev.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      el.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg) scale(1.03)`;
      ["mx", "fx"].forEach((k) => el.style.setProperty(`--${k}`, `${x * 100}%`));
      ["my", "fy"].forEach((k) => el.style.setProperty(`--${k}`, `${y * 100}%`));
    });
    box.addEventListener("pointerleave", () => { el.style.transform = ""; });
    box.addEventListener("click", () => { location.hash = box.dataset.key; });
  });

  function show() {
    const b = CFG.boxes.find((x) => x.key === location.hash.slice(1));
    const el = $("sbox");
    if (!b) { el.classList.remove("on"); return; }
    el.style.setProperty("--a", b.color);
    el.style.setProperty("--g", b.color + "80");
    $("sbox-card").innerHTML = `
      <button class="icon-btn sbox-x" data-close aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
      </button>
      ${art(b, "sbox-art")}
      <div class="lbl">Vault Box · Sports</div>
      <h3>${esc(b.name)}</h3>
      <p class="sbox-price">${esc(price(b))}</p>
      <ul class="v-rules">
        ${b.single ? `<li><b>Single show series:</b> This box is shown live on stream, so you see exactly what’s inside.</li>` : ""}
        <li><b>Sports:</b> ${CFG.sports.map(esc).join(", ")}.</li>
        <li><b>Spots:</b> One spot per NFL team. Each spot also gets its matching basketball, baseball and hockey teams from the team sheet below.</li>
        <li><b>Condition:</b> Cards may be graded or raw, selected to fit ${b.price ? `the ${esc(b.name)} price range` : "the box"}.</li>
        <li><b>Always growing:</b> We add cards that fit this box all the time, including new releases.</li>
      </ul>
      <a class="btn accent" href="#teams" data-close style="margin-top:14px">See the team spots</a>`;
    el.classList.add("on");
  }
  const closeBox = () => { history.pushState("", document.title, location.pathname); show(); };
  $("sbox").addEventListener("click", (e) => {
    const c = e.target.closest("[data-close]");
    if (e.target === $("sbox") || c) {
      e.preventDefault();
      closeBox();
      if (c && c.getAttribute("href") === "#teams") $("teams").scrollIntoView({ behavior: "smooth" });
    }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("sbox").classList.contains("on")) closeBox(); });
  window.addEventListener("hashchange", show);
  show();

  /* ---------- team spots ---------- */
  const LEAGUE = [["nba", "NBA"], ["mlb", "MLB"], ["nhl", "NHL"]];
  const state = { q: "" };

  function teamTile(t, i) {
    const rows = LEAGUE.filter(([k]) => t[k]).map(([k, l]) =>
      `<li><i class="lg ${k}">${l}</i>${esc(t[k])}</li>`).join("");
    return `
      <div class="team" style="animation-delay:${Math.min(i * 20, 400)}ms">
        <div class="team-top">
          <img src="assets/teams/${t.code}.png" alt="" loading="lazy">
          <div><span class="team-div">${t.conf} ${t.div}</span><h4>${esc(t.nfl)}</h4></div>
        </div>
        <ul>${rows}</ul>
        ${t.extra ? `<div class="team-extra">+ ${esc(t.extra)}</div>` : ""}
      </div>`;
  }

  function renderTeams() {
    const q = state.q.trim().toLowerCase();
    const match = (t) => !q || [t.nfl, t.nba, t.mlb, t.nhl, t.extra].join(" ").toLowerCase().includes(q);
    let i = 0, html = "";
    for (const conf of ["AFC", "NFC"]) {
      for (const div of ["North", "East", "West", "South"]) {
        const list = TEAMS.filter((t) => t.conf === conf && t.div === div && match(t));
        if (!list.length) continue;
        html += `<div class="div-row"><h3 class="div-name ${conf.toLowerCase()}"><b>${conf}</b> ${div}</h3>
          <div class="team-grid">${list.map((t) => teamTile(t, i++)).join("")}</div></div>`;
      }
    }
    $("team-board").innerHTML = html || `<div class="empty">No team matches “${esc(state.q)}”.</div>`;
  }
  $("team-q").addEventListener("input", (e) => { state.q = e.target.value; renderTeams(); });
  renderTeams();
})();
