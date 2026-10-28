/* Sports page: box lineup with tilt effect and a detail card for each box. */
(function () {
  const { esc } = window.VB;
  const CFG = window.SPORTS_CONFIG;
  const $ = (id) => document.getElementById(id);
  const price = (b) => b.price || "Price coming soon";

  $("sport-chips").innerHTML = CFG.sports.map((s, i) =>
    `<span class="sport-chip ${i === 0 ? "main" : ""}">${esc(s)}</span>`).join("");

  $("lineup").innerHTML = CFG.boxes.map((b) => `
    <button class="box reveal-up" data-key="${b.key}" style="--a:${b.color};--b:${b.color};--g:${b.color}80">
      <div class="price">${esc(price(b))}</div>
      <div class="art">
        <img src="assets/sports/${b.key}.webp" alt="Vault Box ${esc(b.name)}">
        <div class="foil"></div><div class="glare"></div><div class="shine-bar"></div>
      </div>
      <div class="meta"><span>${esc(b.name)}</span><span class="open">View</span></div>
    </button>`).join("");

  document.querySelectorAll("#lineup .box").forEach((box) => {
    const art = box.querySelector(".art");
    box.addEventListener("pointermove", (ev) => {
      if (ev.pointerType !== "mouse") return;
      const r = art.getBoundingClientRect();
      const x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height;
      art.style.transform = `rotateY(${(x - 0.5) * 18}deg) rotateX(${(0.5 - y) * 18}deg) scale(1.03)`;
      ["mx", "fx"].forEach((k) => art.style.setProperty(`--${k}`, `${x * 100}%`));
      ["my", "fy"].forEach((k) => art.style.setProperty(`--${k}`, `${y * 100}%`));
    });
    box.addEventListener("pointerleave", () => { art.style.transform = ""; });
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
      <img class="sbox-art" src="assets/sports/${b.key}.webp" alt="Vault Box ${esc(b.name)}">
      <div class="lbl">Vault Box · Sports</div>
      <h3>${esc(b.name)}</h3>
      <p class="sbox-price">${esc(price(b))}</p>
      <ul class="v-rules">
        <li><b>Sports:</b> ${CFG.sports.map(esc).join(", ")}.</li>
        <li><b>Condition:</b> Cards may be graded or raw, selected to fit the ${esc(b.name)} price range.</li>
        <li><b>Always growing:</b> We add cards that fit this price range all the time, including new releases.</li>
      </ul>
      <p class="fine">Full checklist coming soon.</p>`;
    el.classList.add("on");
  }
  $("sbox").addEventListener("click", (e) => {
    if (e.target === $("sbox") || e.target.closest("[data-close]")) history.pushState("", document.title, location.pathname);
    show();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && location.hash) { history.pushState("", document.title, location.pathname); show(); }
  });
  window.addEventListener("hashchange", show);
  show();
})();
