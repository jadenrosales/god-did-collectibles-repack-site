/* Shared helpers for every page. */
(function () {
  const CFG = window.VAULT_CONFIG;
  const DATA = window.VAULT_PULLS;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const edition = (key) => CFG.editions.find((e) => e.key === key);
  const liveEditions = () => CFG.editions.filter((e) => !e.comingSoon && DATA.editions[e.key]);
  const spots = (key) => DATA.editions[key] || [];
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

  function tiktokButtons() {
    document.querySelectorAll("[data-tiktok]").forEach((a) => {
      if (CFG.tiktokUrl) a.href = CFG.tiktokUrl;
      else if (a.dataset.tiktok === "hide") a.remove();
    });
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
    tiktokButtons();
    observeReveals();
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  });

  window.VB = { CFG, DATA, esc, edition, liveEditions, spots, spotTitle, sprite, applyTheme };
})();
