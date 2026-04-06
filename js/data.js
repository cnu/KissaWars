// KissaWars - Static Game Data
window.KW = window.KW || {};

KW.DRUGS = [
  { name: 'Paper',         min: 1000, max: 4400 },   // LSD tabs
  { name: 'Podi',          min: 15000, max: 29000 },  // Cocaine (powder)
  { name: 'Charas',        min: 480,  max: 1280 },    // Hashish
  { name: 'Brown Sugar',   min: 5500, max: 13000 },   // Heroin
  { name: 'Maathirai',     min: 11,   max: 60 },      // Pills/Ludes
  { name: 'Thool',         min: 1500, max: 4400 },    // Dust/MDA
  { name: 'Kasakasa',      min: 540,  max: 1250 },    // Opium/poppy
  { name: 'Kallu',         min: 1000, max: 3500 },    // Toddy/moonshine
  { name: 'Kaattaan',      min: 220,  max: 700 },     // Peyote (wild stuff)
  { name: 'Kaalan',        min: 630,  max: 1300 },    // Shrooms (mushroom)
  { name: 'Vega',          min: 90,   max: 250 },     // Speed
  { name: 'Ganja',         min: 315,  max: 890 },     // Weed
];

KW.LOCATIONS = [
  { key: 'parrys',     name: 'Parrys Corner',  hasShark: true,  hasBank: true,  hasStash: true },
  { key: 'royapuram',  name: 'Royapuram',      hasShark: false, hasBank: false, hasStash: false },
  { key: 'mylapore',   name: 'Mylapore',       hasShark: false, hasBank: false, hasStash: false },
  { key: 'tnagar',     name: 'T. Nagar',       hasShark: false, hasBank: true,  hasStash: false },
  { key: 'besant',     name: 'Besant Nagar',   hasShark: false, hasBank: false, hasStash: false },
  { key: 'annanagar',  name: 'Anna Nagar',     hasShark: false, hasBank: false, hasStash: false },
];

KW.EVENTS = {
  priceSpikeMessages: [
    'Addicts are buying {drug} at outrageous prices!',
    'The demand for {drug} has gone through the roof in the area!',
  ],
  priceCrashMessages: [
    'The police just raided a {drug} den! Prices have crashed!',
    'A rival dealer is dumping cheap {drug} on the market!',
  ],
  findDrugMessages: [
    'You found {qty} units of {drug} on a guy passed out near the bus stand!',
    'Someone dropped a bag near the tea kadai! You found {qty} units of {drug}!',
  ],
  muggingMessages: [
    'You were jumped in a narrow lane!',
    'A gang of rowdies attacked you!',
  ],
  coatMessages: [
    'Would you like to buy a bigger lungi-bag for ${price}? (+{extra} pockets)',
  ],
  policeMessages: [
    'Inspector Ravi and {count} constables are chasing you!',
    '{count} cops from the local station are on your tail!',
  ],
};

KW.STARTING_CASH = 2000;
KW.STARTING_DEBT = 5500;
KW.STARTING_HEALTH = 100;
KW.STARTING_COAT = 100;
KW.MAX_DAYS = 30;
KW.DEBT_INTEREST = 0.10;
KW.MAX_DEBT = 50000;
KW.DRUGS_PER_MARKET = [6, 10]; // min/max drugs available at a location
