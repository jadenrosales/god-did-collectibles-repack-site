/* Shared helpers for every page. */
(function () {
  const CFG = window.VAULT_CONFIG;
  const DATA = window.VAULT_PULLS;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const edition = (key) => CFG.editions.find((e) => e.key === key);
  const liveEditions = () => CFG.editions.filter((e) => !e.comingSoon && DATA.editions[e.key]);
  // Every spot is in play in every box. A box whose checklist doesn't cover a spot yet
  // still gets that spot (same Pokémon, no listed cards).
  const allSpots = Object.values(DATA.editions).reduce((a, b) => (b.length > a.length ? b : a), []);
  const padded = {};
  const spots = (key) => {
    if (!DATA.editions[key]) return [];
    if (!padded[key]) {
      const own = new Map(DATA.editions[key].map((s) => [s.spot, s]));
      padded[key] = allSpots.map((s) => own.get(s.spot) ||
        { spot: s.spot, groups: s.groups.map((g) => ({ pokemon: g.pokemon, cards: [] })) });
    }
    return padded[key];
  };
  const plus = (n) => `${n.toLocaleString()}+`;
  const spotTitle = (spot) => spot.groups.map((g) => g.pokemon).join(" / ");

  function sprite(name, cls = "") {
    const url = window.spriteUrl(name);
    if (!url) return "";
    return `<img class="${cls}" src="${url}" alt="${esc(name)}" loading="lazy" onerror="this.remove()">`;
  }

  function applyTheme(el, ed) {
    el.style.setProperty("--a", ed.colors.a);
    el.style.setProperty("--b", ed.colors.b);
    el.style.setProperty("--g", ed.colors.glow);
    el.style.setProperty("--vbg", ed.colors.bg);
  }

  // Fade sections in as they scroll into view.
  function observeReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal-up").forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    observeReveals();
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });

  window.VB = { CFG, DATA, esc, plus, edition, liveEditions, spots, spotTitle, sprite, applyTheme };
})();
