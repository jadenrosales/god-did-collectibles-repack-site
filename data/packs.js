/* Vault Packs settings and chaser checklist.
   Add chaser cards to the "singles" list as { name: "Player", card: "Set / card", note: "PSA 10, /99, etc." }. */
window.PACKS_CONFIG = {
  price: "", // e.g. "$25" — leave "" to hide
  inside: [
    { name: "Score Treat packs", note: "Sealed" },
    { name: "Topps Heritage packs", note: "Sealed" },
    { name: "Topps Bowman packs", note: "Sealed" },
    { name: "Topps Flagship packs", note: "Sealed" },
    { name: "Football singles", note: "Raw or graded" },
  ],
  chaserOdds: "1 in 10",
  checklist: [
    {
      group: "Sealed packs",
      items: [
        { name: "Score Treat pack", card: "Sealed pack" },
        { name: "Topps Heritage pack", card: "Sealed pack" },
        { name: "Topps Bowman pack", card: "Sealed pack" },
        { name: "Topps Flagship pack", card: "Sealed pack" },
      ],
    },
    {
      group: "Football singles",
      items: [],
    },
  ],
};
