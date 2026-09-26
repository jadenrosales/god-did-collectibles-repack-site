/* Pokémon name -> PokéAPI id, used for artwork thumbnails. Unknown names just show no art. */
(function () {
  const DEX = {
    Bulbasaur: 1, Ivysaur: 2, Venusaur: 3, Charmander: 4, Charmeleon: 5, Charizard: 6,
    Squirtle: 7, Wartortle: 8, Blastoise: 9, Pikachu: 25, Raichu: 26, Psyduck: 54, Golduck: 55,
    Growlithe: 58, Arcanine: 59, Poliwag: 60, Poliwhirl: 61, Poliwrath: 62, Alakazam: 65,
    Machoke: 67, Machamp: 68, Slowpoke: 79, Slowbro: 80, Gastly: 92, Haunter: 93, Gengar: 94,
    Hitmonlee: 106, Hitmonchan: 107, Staryu: 120, Starmie: 121, Scyther: 123, Magikarp: 129,
    Gyarados: 130, Ditto: 132, Eevee: 133, Vaporeon: 134, Jolteon: 135, Flareon: 136,
    Snorlax: 143, Articuno: 144, Zapdos: 145, Moltres: 146, Dratini: 147, Dragonair: 148,
    Dragonite: 149, Mewtwo: 150, Mew: 151, Pichu: 172, Politoed: 186, Espeon: 196, Umbreon: 197,
    Slowking: 199, Scizor: 212, Houndour: 228, Houndoom: 229, Tyrogue: 236, Hitmontop: 237,
    Raikou: 243, Entei: 244, Suicune: 245, Larvitar: 246, Pupitar: 247, Tyranitar: 248,
    Lugia: 249, "Ho-Oh": 250, Celebi: 251, Ralts: 280, Kirlia: 281, Gardevoir: 282, Sableye: 302,
    Wailmer: 320, Wailord: 321, Latias: 380, Latios: 381, Kyogre: 382, Groudon: 383,
    Rayquaza: 384, Jirachi: 385, Deoxys: 386, Piplup: 393, Prinplup: 394, Empoleon: 395,
    Gible: 443, Gabite: 444, Garchomp: 445, Munchlax: 446, Riolu: 447, Lucario: 448,
    Leafeon: 470, Glaceon: 471, Gallade: 475, Dialga: 483, Palkia: 484, Giratina: 487,
    Cresselia: 488, Manaphy: 490, Shaymin: 492, Arceus: 493, Victini: 494, Zorua: 570,
    Zoroark: 571, Reshiram: 643, Zekrom: 644, Kyurem: 646, Froakie: 656, Frogadier: 657,
    Greninja: 658, Sylveon: 700, Yveltal: 717, Mimikyu: 778, Meltan: 808, Melmetal: 809,
    Kleavor: 900, "Black Kyurem": 10022, "White Kyurem": 10023, "Alolan Raichu": 10100,
  };
  const BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/";
  window.spriteUrl = (name) => (DEX[name] ? BASE + DEX[name] + ".png" : "");
})();
