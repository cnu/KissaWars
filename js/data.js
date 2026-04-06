// KissaWars - Static Game Data
window.KW = window.KW || {};

KW.DRUGS = [
  { name: 'Paper',         realName: 'LSD Tabs', min: 1000, max: 4400 },
  { name: 'Podi',          realName: 'Cocaine', min: 15000, max: 89000 },
  { name: 'Karuppu',       realName: 'Hashish', min: 480,  max: 1280 },
  { name: 'Brown Sugar',   realName: 'Heroin', min: 5500, max: 43000 },
  { name: 'Ice',           realName: 'Methamphetamine', min: 2300, max: 14500},
  { name: 'Thalagani',     realName: 'Nicotine Pouch', min: 70,   max: 360 },
  { name: 'Thool',         realName: 'MDA', min: 1500, max: 4400 },
  { name: 'Abin',          realName: 'Opium', min: 540,  max: 1250 },
  { name: 'Hans',          realName: 'Chewable Tobacco', min: 30,  max: 230 },
  { name: 'Kallu',         realName: 'Moonshine', min: 300, max: 2500 },
  { name: 'Kaalan',        realName: 'Shrooms', min: 830,  max: 3900 },
  { name: 'Syrup',         realName: 'Codeine', min: 250,   max: 1250 },
  { name: 'Ganja',         realName: 'Weed', min: 315,  max: 1900 },
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
    'The Thadis just raided a {drug} den! Prices have crashed!',
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
    'Would you like to buy a bigger Katta-pai for {price}? (+{extra} pockets)',
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
