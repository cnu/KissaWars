require('./setup.js');
const { describe, test, expect, beforeEach } = require('bun:test');

describe('KW.formatMoney', () => {
  test('formats positive amounts with rupee symbol', () => {
    expect(KW.formatMoney(0)).toBe('\u20B90');
    expect(KW.formatMoney(1000)).toBe('\u20B91,000');
    expect(KW.formatMoney(50000)).toBe('\u20B950,000');
    expect(KW.formatMoney(1234567)).toBe('\u20B912,34,567');
  });

  test('formats negative amounts', () => {
    expect(KW.formatMoney(-500)).toBe('-\u20B9500');
    expect(KW.formatMoney(-12345)).toBe('-\u20B912,345');
  });
});

describe('KW.randInt', () => {
  test('returns value within range', () => {
    for (var i = 0; i < 100; i++) {
      var val = KW.randInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  test('works with equal min and max', () => {
    expect(KW.randInt(7, 7)).toBe(7);
  });
});

describe('KW.newGame', () => {
  beforeEach(() => {
    KW.newGame();
  });

  test('initializes player with correct starting values', () => {
    expect(KW.state.player.cash).toBe(KW.STARTING_CASH);
    expect(KW.state.player.debt).toBe(KW.STARTING_DEBT);
    expect(KW.state.player.bank).toBe(0);
    expect(KW.state.player.health).toBe(KW.STARTING_HEALTH);
    expect(KW.state.player.coatSize).toBe(KW.STARTING_COAT);
    expect(KW.state.player.location).toBe('parrys');
    expect(KW.state.player.day).toBe(1);
  });

  test('initializes empty inventory and stash', () => {
    expect(Object.keys(KW.state.inventory).length).toBe(0);
    expect(Object.keys(KW.state.stash).length).toBe(0);
  });

  test('generates initial prices', () => {
    var priceCount = Object.keys(KW.state.currentPrices).length;
    expect(priceCount).toBeGreaterThanOrEqual(KW.DRUGS_PER_MARKET[0]);
    expect(priceCount).toBeLessThanOrEqual(KW.DRUGS_PER_MARKET[1]);
  });

  test('initializes stats to zero', () => {
    expect(KW.state.stats.totalBought).toBe(0);
    expect(KW.state.stats.totalSold).toBe(0);
    expect(KW.state.stats.arrests).toBe(0);
    expect(KW.state.stats.muggings).toBe(0);
    expect(KW.state.stats.fights).toBe(0);
  });

  test('sets state version', () => {
    expect(KW.state.version).toBe(KW.STATE_VERSION);
  });
});

describe('KW.getInventorySize', () => {
  beforeEach(() => { KW.newGame(); });

  test('returns 0 for empty inventory', () => {
    expect(KW.getInventorySize()).toBe(0);
  });

  test('sums all drug quantities', () => {
    KW.state.inventory = { Paper: 10, Ganja: 5, Maathirai: 20 };
    expect(KW.getInventorySize()).toBe(35);
  });
});

describe('KW.getStashSize', () => {
  beforeEach(() => { KW.newGame(); });

  test('returns 0 for empty stash', () => {
    expect(KW.getStashSize()).toBe(0);
  });

  test('sums all stashed quantities', () => {
    KW.state.stash = { Podi: 3, 'Brown Sugar': 7 };
    expect(KW.getStashSize()).toBe(10);
  });
});

describe('KW.getInventoryValue', () => {
  beforeEach(() => { KW.newGame(); });

  test('returns 0 for empty inventory', () => {
    expect(KW.getInventoryValue()).toBe(0);
  });

  test('calculates value based on current prices', () => {
    KW.state.inventory = { Paper: 10 };
    KW.state.currentPrices = { Paper: 2000 };
    expect(KW.getInventoryValue()).toBe(20000);
  });

  test('ignores drugs not in current market', () => {
    KW.state.inventory = { Paper: 10, Ganja: 5 };
    KW.state.currentPrices = { Paper: 1000 };
    expect(KW.getInventoryValue()).toBe(10000);
  });
});

describe('KW.getNetWorth', () => {
  beforeEach(() => { KW.newGame(); });

  test('calculates net worth correctly at game start', () => {
    // cash(2000) + bank(0) + inventory(0) - debt(5500) = -3500
    KW.state.currentPrices = {};
    expect(KW.getNetWorth()).toBe(-3500);
  });

  test('includes bank balance', () => {
    KW.state.player.bank = 10000;
    KW.state.currentPrices = {};
    expect(KW.getNetWorth()).toBe(6500); // 2000 + 10000 - 5500
  });

  test('subtracts debt', () => {
    KW.state.player.debt = 20000;
    KW.state.currentPrices = {};
    expect(KW.getNetWorth()).toBe(-18000); // 2000 + 0 - 20000
  });
});

describe('KW.getLocationData', () => {
  test('finds location by key', () => {
    var parrys = KW.getLocationData('parrys');
    expect(parrys.name).toBe('Parrys Corner');
    expect(parrys.hasShark).toBe(true);
    expect(parrys.hasBank).toBe(true);
    expect(parrys.hasStash).toBe(true);
  });

  test('returns null for invalid key', () => {
    expect(KW.getLocationData('narnia')).toBeNull();
  });

  test('tnagar has bank but no shark/stash', () => {
    var tnagar = KW.getLocationData('tnagar');
    expect(tnagar.hasBank).toBe(true);
    expect(tnagar.hasShark).toBe(false);
    expect(tnagar.hasStash).toBe(false);
  });
});

describe('KW.generatePrices', () => {
  beforeEach(() => { KW.newGame(); });

  test('generates between min and max drug count', () => {
    for (var i = 0; i < 50; i++) {
      KW.generatePrices();
      var count = Object.keys(KW.state.currentPrices).length;
      expect(count).toBeGreaterThanOrEqual(KW.DRUGS_PER_MARKET[0]);
      expect(count).toBeLessThanOrEqual(KW.DRUGS_PER_MARKET[1]);
    }
  });

  test('prices are within drug min/max ranges', () => {
    for (var i = 0; i < 50; i++) {
      KW.generatePrices();
      for (var name in KW.state.currentPrices) {
        var drug = KW.DRUGS.find(function(d) { return d.name === name; });
        expect(drug).toBeDefined();
        expect(KW.state.currentPrices[name]).toBeGreaterThanOrEqual(drug.min);
        expect(KW.state.currentPrices[name]).toBeLessThanOrEqual(drug.max);
      }
    }
  });

  test('only uses valid drug names', () => {
    var validNames = KW.DRUGS.map(function(d) { return d.name; });
    KW.generatePrices();
    for (var name in KW.state.currentPrices) {
      expect(validNames).toContain(name);
    }
  });
});

describe('Save/Load', () => {
  beforeEach(() => {
    localStorage.clear();
    KW.newGame();
  });

  test('saveGame persists state to localStorage', () => {
    KW.saveGame();
    var saved = localStorage.getItem(KW.SAVE_KEY);
    expect(saved).not.toBeNull();
    var parsed = JSON.parse(saved);
    expect(parsed.player.cash).toBe(KW.STARTING_CASH);
  });

  test('loadGame restores state', () => {
    KW.state.player.cash = 9999;
    KW.saveGame();
    KW.state.player.cash = 0;
    var loaded = KW.loadGame();
    expect(loaded).toBe(true);
    expect(KW.state.player.cash).toBe(9999);
  });

  test('loadGame returns false when no save exists', () => {
    localStorage.clear();
    expect(KW.loadGame()).toBe(false);
  });

  test('hasSave detects saved game', () => {
    expect(KW.hasSave()).toBe(true); // newGame calls saveGame
    KW.deleteSave();
    expect(KW.hasSave()).toBe(false);
  });

  test('deleteSave removes saved game', () => {
    KW.deleteSave();
    expect(localStorage.getItem(KW.SAVE_KEY)).toBeNull();
  });
});

describe('Settings', () => {
  beforeEach(() => { localStorage.clear(); });

  test('returns defaults when no settings saved', () => {
    var settings = KW.getSettings();
    expect(settings.soundEnabled).toBe(true);
  });

  test('saves and loads settings', () => {
    KW.saveSettings({ soundEnabled: false });
    var settings = KW.getSettings();
    expect(settings.soundEnabled).toBe(false);
  });
});
