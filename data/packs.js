/* Vault Packs settings and the sealed-pack part of the chaser checklist.
   Chaser singles live in data/chasers.txt (rebuild with: python3 tools/build-chasers.py). */
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
  ],
};
