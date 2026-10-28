/* Sports spots: one spot per NFL team. Every team listed with it comes with the spot.
   From the Unlimited Team Sheet. Logos: assets/teams/<code>.png.
   nba/mlb/nhl: "" where the spot has no team in that league. extra: bonus categories. */
window.TEAM_SPOTS = [
  // AFC North
  { code: "bal", conf: "AFC", div: "North", nfl: "BAL Ravens", nba: "SAC Kings", mlb: "BAL Orioles", nhl: "NJ Devils", extra: "" },
  { code: "cin", conf: "AFC", div: "North", nfl: "CIN Bengals", nba: "", mlb: "CIN Reds", nhl: "WIN Jets", extra: "" },
  { code: "cle", conf: "AFC", div: "North", nfl: "CLE Browns", nba: "CLE Cavaliers", mlb: "CLE Guardians", nhl: "COL Blue Jackets", extra: "" },
  { code: "pit", conf: "AFC", div: "North", nfl: "PIT Steelers", nba: "SA Spurs", mlb: "PIT Pirates", nhl: "PIT Penguins", extra: "" },
  // AFC East
  { code: "buf", conf: "AFC", div: "East", nfl: "BUF Bills", nba: "TOR Raptors", mlb: "TOR Blue Jays", nhl: "BUF Sabres", extra: "" },
  { code: "mia", conf: "AFC", div: "East", nfl: "MIA Dolphins", nba: "MIA Heat", mlb: "MIA Marlins", nhl: "FL Panthers", extra: "Marvel / Disney / Star Wars" },
  { code: "ne", conf: "AFC", div: "East", nfl: "NE Patriots", nba: "BOS Celtics", mlb: "BOS Red Sox", nhl: "BOS Bruins", extra: "" },
  { code: "nyj", conf: "AFC", div: "East", nfl: "NY Jets", nba: "BK Nets", mlb: "NY Mets", nhl: "NY Islanders", extra: "Golf / Tennis" },
  // AFC West
  { code: "den", conf: "AFC", div: "West", nfl: "DEN Broncos", nba: "DEN Nuggets", mlb: "CO Rockies", nhl: "CO Avalanche", extra: "" },
  { code: "kc", conf: "AFC", div: "West", nfl: "KC Chiefs", nba: "OKC Thunder", mlb: "KC Royals", nhl: "STL Blues", extra: "" },
  { code: "lv", conf: "AFC", div: "West", nfl: "LV Raiders", nba: "UTA Jazz", mlb: "OK Athletics", nhl: "LV Golden Knights", extra: "Undrafted / NIL" },
  { code: "lac", conf: "AFC", div: "West", nfl: "LA Chargers", nba: "LA Clippers", mlb: "LA Dodgers", nhl: "LA Kings", extra: "" },
  // AFC South
  { code: "hou", conf: "AFC", div: "South", nfl: "HOU Texans", nba: "HOU Rockets", mlb: "HOU Astros", nhl: "TOR Maple Leafs", extra: "" },
  { code: "ind", conf: "AFC", div: "South", nfl: "IND Colts", nba: "IND Pacers", mlb: "CHI White Sox", nhl: "OTT Senators", extra: "WNBA Teams" },
  { code: "jax", conf: "AFC", div: "South", nfl: "JAX Jaguars", nba: "", mlb: "SD Padres", nhl: "EDM Oilers", extra: "" },
  { code: "ten", conf: "AFC", div: "South", nfl: "TEN Titans", nba: "MEM Grizzlies", mlb: "STL Cardinals", nhl: "NSH Predators", extra: "" },
  // NFC North
  { code: "chi", conf: "NFC", div: "North", nfl: "CHI Bears", nba: "CHI Bulls", mlb: "CHI Cubs", nhl: "CHI Blackhawks", extra: "" },
  { code: "det", conf: "NFC", div: "North", nfl: "DET Lions", nba: "DET Pistons", mlb: "DET Tigers", nhl: "DET Red Wings", extra: "" },
  { code: "gb", conf: "NFC", div: "North", nfl: "GB Packers", nba: "MIL Bucks", mlb: "MIL Brewers", nhl: "VAN Canucks", extra: "" },
  { code: "min", conf: "NFC", div: "North", nfl: "MIN Vikings", nba: "MIN Timberwolves", mlb: "MIN Twins", nhl: "MIN Wild", extra: "" },
  // NFC East
  { code: "dal", conf: "NFC", div: "East", nfl: "DAL Cowboys", nba: "DAL Mavericks", mlb: "TX Rangers", nhl: "DAL Stars", extra: "" },
  { code: "nyg", conf: "NFC", div: "East", nfl: "NY Giants", nba: "NY Knicks", mlb: "NY Yankees", nhl: "NY Rangers", extra: "" },
  { code: "phi", conf: "NFC", div: "East", nfl: "PHI Eagles", nba: "PHI 76ers", mlb: "PHI Phillies", nhl: "PHI Flyers", extra: "" },
  { code: "wsh", conf: "NFC", div: "East", nfl: "WAS Commanders", nba: "WAS Wizards", mlb: "WAS Nationals", nhl: "WAS Capitals", extra: "" },
  // NFC West
  { code: "ari", conf: "NFC", div: "West", nfl: "AZ Cardinals", nba: "PHX Suns", mlb: "AZ Diamondbacks", nhl: "AZ Coyotes", extra: "UFC / WWE / Boxing" },
  { code: "lar", conf: "NFC", div: "West", nfl: "LA Rams", nba: "LA Lakers", mlb: "LA Angels", nhl: "ANA Ducks", extra: "" },
  { code: "sf", conf: "NFC", div: "West", nfl: "SF 49ers", nba: "GS Warriors", mlb: "SF Giants", nhl: "SJ Sharks", extra: "" },
  { code: "sea", conf: "NFC", div: "West", nfl: "SEA Seahawks", nba: "POR Trail Blazers", mlb: "SEA Mariners", nhl: "SEA Kraken", extra: "Misc." },
  // NFC South
  { code: "atl", conf: "NFC", div: "South", nfl: "ATL Falcons", nba: "ATL Hawks", mlb: "ATL Braves", nhl: "CGY Flames", extra: "" },
  { code: "car", conf: "NFC", div: "South", nfl: "CAR Panthers", nba: "CHA Hornets", mlb: "", nhl: "CAR Hurricanes", extra: "" },
  { code: "no", conf: "NFC", div: "South", nfl: "NO Saints", nba: "NO Pelicans", mlb: "", nhl: "MTL Canadiens", extra: "F1 / Soccer" },
  { code: "tb", conf: "NFC", div: "South", nfl: "TB Buccaneers", nba: "ORL Magic", mlb: "TB Rays", nhl: "TB Lightning", extra: "" },
];
