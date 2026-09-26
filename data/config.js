/* Site settings — edit this file to change prices, spot sheets and links. */
window.VAULT_CONFIG = {
  brand: "Vault Box",

  // Google Sheet holding the spot list (column A = spot, column B = TikTok username).
  // It must be shared as "Anyone with the link can view" so the Spots page can read it live.
  spotSheet: "1ZphCh6U38IwUOVXkg7wDSvDgS5cSe2_8Z-0Zwh7WMbk",

  // Order here is the order boxes appear on the site.
  editions: [
    {
      key: "grail", name: "Grail", price: "$1,000 – $3,000",
      tagline: "The top shelf. Chase slabs, vintage holos and modern SIR royalty.",
      colors: { a: "#f3c969", b: "#fff4d6", glow: "rgba(243,201,105,.55)", bg: "#1a150b" },
    },
    {
      key: "nuclear", name: "Nuclear", price: "$500 – $1,500",
      tagline: "Radioactive hits. Big alt arts and heavy-hitting grails in the mix.",
      colors: { a: "#8dff3a", b: "#d9ff9e", glow: "rgba(141,255,58,.5)", bg: "#140a24" },
    },
    {
      key: "obsidian", name: "Obsidian", price: "$100 – $700",
      tagline: "Cold, dark and dangerous. 32 spots with deep checklists.",
      colors: { a: "#6fd0ff", b: "#d9f2ff", glow: "rgba(111,208,255,.5)", bg: "#081119" },
    },
    {
      key: "spark", name: "Spark", price: "$50 – $300",
      tagline: "The entry vault. Low buy-in, full 32-spot checklist, real hits.",
      colors: { a: "#ffd400", b: "#fff3a6", glow: "rgba(255,212,0,.5)", bg: "#1a1600" },
    },
    {
      key: "vintage", name: "Vintage", price: "??? – ???", comingSoon: true,
      tagline: "Something old is waking up in the vault…",
      colors: { a: "#d8b77a", b: "#f3e2bd", glow: "rgba(216,183,122,.4)", bg: "#16110a" },
    },
  ],
};
