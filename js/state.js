// KissaWars - Game State Management
window.KW = window.KW || {};

KW.STATE_VERSION = 1;
KW.SAVE_KEY = 'kissawars_save';
KW.LEADERBOARD_KEY = 'kissawars_leaderboard';
KW.SETTINGS_KEY = 'kissawars_settings';

KW.state = null;

KW.newGame = function() {
  KW.state = {
    version: KW.STATE_VERSION,
    player: {
      cash: KW.STARTING_CASH,
      debt: KW.STARTING_DEBT,
      bank: 0,
      health: KW.STARTING_HEALTH,
      coatSize: KW.STARTING_COAT,
      location: 'parrys',
      day: 1,
    },
    inventory: {},
    stash: {},
    currentPrices: {},
    activeEvent: null,
    stats: {
      totalBought: 0,
      totalSold: 0,
      totalProfit: 0,
      arrests: 0,
      muggings: 0,
      fights: 0,
      drugProfits: {},
      drugsBought: {},
      drugsSold: {},
      locationVisits: {},
    },
    history: [],
  };
  KW.generatePrices();
  KW.recordHistory();
  KW.saveGame();
};

KW.saveGame = function() {
  try {
    localStorage.setItem(KW.SAVE_KEY, JSON.stringify(KW.state));
  } catch (e) {
    console.warn('Failed to save game:', e);
  }
};

KW.loadGame = function() {
  try {
    var data = localStorage.getItem(KW.SAVE_KEY);
    if (!data) return false;
    KW.state = JSON.parse(data);
    // Migrate old saves
    if (!KW.state.history) KW.state.history = [];
    var s = KW.state.stats;
    if (!s.drugProfits) s.drugProfits = {};
    if (!s.drugsBought) s.drugsBought = {};
    if (!s.drugsSold) s.drugsSold = {};
    if (!s.locationVisits) s.locationVisits = {};
    return true;
  } catch (e) {
    console.warn('Failed to load game:', e);
    return false;
  }
};

KW.hasSave = function() {
  return localStorage.getItem(KW.SAVE_KEY) !== null;
};

KW.deleteSave = function() {
  localStorage.removeItem(KW.SAVE_KEY);
};

KW.getInventorySize = function() {
  var total = 0;
  for (var drug in KW.state.inventory) {
    total += KW.state.inventory[drug];
  }
  return total;
};

KW.getStashSize = function() {
  var total = 0;
  for (var drug in KW.state.stash) {
    total += KW.state.stash[drug];
  }
  return total;
};

KW.getInventoryValue = function() {
  var total = 0;
  for (var drug in KW.state.inventory) {
    var qty = KW.state.inventory[drug];
    if (qty > 0 && KW.state.currentPrices[drug]) {
      total += qty * KW.state.currentPrices[drug];
    }
  }
  return total;
};

KW.getNetWorth = function() {
  var s = KW.state.player;
  return s.cash + s.bank + KW.getInventoryValue() - s.debt;
};

KW.getLocationData = function(key) {
  for (var i = 0; i < KW.LOCATIONS.length; i++) {
    if (KW.LOCATIONS[i].key === key) return KW.LOCATIONS[i];
  }
  return null;
};

KW.getDrugData = function(name) {
  for (var i = 0; i < KW.DRUGS.length; i++) {
    if (KW.DRUGS[i].name === name) return KW.DRUGS[i];
  }
  return null;
};

KW.getDrugRealName = function(name) {
  var drug = KW.getDrugData(name);
  if (drug && drug.realName) return drug.realName;
  return name;
};

KW.generatePrices = function() {
  var prices = {};
  var available = KW.DRUGS.slice();
  // Shuffle
  for (var i = available.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = available[i];
    available[i] = available[j];
    available[j] = tmp;
  }
  var count = KW.randInt(KW.DRUGS_PER_MARKET[0], KW.DRUGS_PER_MARKET[1]);
  for (var k = 0; k < count && k < available.length; k++) {
    var drug = available[k];
    prices[drug.name] = KW.randInt(drug.min, drug.max);
  }
  KW.state.currentPrices = prices;
};

KW.randInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

KW.formatMoney = function(amount) {
  if (amount < 0) return '-\u20B9' + Math.abs(amount).toLocaleString('en-IN');
  return '\u20B9' + amount.toLocaleString('en-IN');
};

KW.getSettings = function() {
  try {
    var data = localStorage.getItem(KW.SETTINGS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return { soundEnabled: true };
};

KW.saveSettings = function(settings) {
  try {
    localStorage.setItem(KW.SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
};

KW.recordHistory = function() {
  var p = KW.state.player;
  KW.state.history.push({
    day: p.day,
    netWorth: KW.getNetWorth(),
    cash: p.cash,
    bank: p.bank,
    debt: p.debt,
    health: p.health,
    location: p.location,
  });
};
