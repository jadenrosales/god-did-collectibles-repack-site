/* Sports side settings: boxes, prices and colours. Art lives in assets/sports/<key>.webp.
   Leave price as "" to show "Price coming soon". single: true = single show series, revealed on stream.
   noArt: true = no artwork yet (shows a placeholder). */
window.SPORTS_CONFIG = {
  sports: ["Football", "Basketball", "Baseball"],
  boxes: [
    { key: "super-case-hit", name: "Super Case Hit", price: "$500 – $2,000", color: "#ffd36b" },
    { key: "super-kaboom", name: "Super Kaboom", price: "$500 – $2,000", color: "#ff4d4d" },
    { key: "super-downtown", name: "Super Downtown", price: "$500 – $1,500", color: "#c38bff" },
    { key: "tecmo-bowl", name: "Tecmo Bowl", price: "$100 – $1,500", color: "#ffe14a" },
    { key: "takeoff", name: "Takeoff", price: "$300 – $1,000", color: "#ffb03a" },
    { key: "kaboom", name: "Kaboom", price: "$200 – $1,000", color: "#ff5a3a" },
    { key: "downtown", name: "Downtown", price: "$180 – $1,000", color: "#4fd18b" },
    { key: "uptown", name: "Uptown", price: "$100 – $1,000", color: "#f3c969" },
    { key: "case-hit", name: "Case Hit", price: "$50 – $800", color: "#ffd400" },
    { key: "spark", name: "Spark", price: "$50 – $300", color: "#7ee0a8" },
    { key: "lite", name: "Lite", price: "$10 – $150", color: "#9fe6ff", noArt: true },
    { key: "inferno", name: "Inferno", price: "", color: "#ff7a1a" },
    { key: "menace", name: "Menace", price: "", single: true, color: "#ff2e4d" },
    { key: "slime", name: "Slime", price: "", single: true, color: "#7dff3a" },
    { key: "parade", name: "Parade", price: "", single: true, color: "#5ec8ff" },
  ],
};
