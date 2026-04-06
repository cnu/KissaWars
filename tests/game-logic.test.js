require('./setup.js');
const { describe, test, expect, beforeEach } = require('bun:test');

// Stub UI/sound functions that game.js calls
KW.showScreen = function() {};
KW.renderMarket = function() {};
KW.renderCombat = function() {};
KW.showEvent = function(msg, cb) { if (cb) cb(); };
KW.showToast = function() {};
KW.renderBank = function() {};
KW.renderShark = function() {};
KW.renderStash = function() {};
KW.renderGameOver = function() {};
KW.renderTravel = function() {};
KW.renderStatusBar = function() {};
KW.renderLeaderboard = function() {};
KW.sound = { buy: function(){}, sell: function(){}, travel: function(){},
             blip: function(){}, alert: function(){}, danger: function(){},
             click: function(){}, win: function(){}, lose: function(){} };
KW.openAmountModal = function(title, max, cb) { cb(max); }; // auto-confirm with max
KW.openQuantityModal = function(title, price, max, cb) { cb(max); };

// Load game.js after stubs are in place
require('../js/ui.js');
require('../js/game.js');

describe('Buy/Sell Transactions', () => {
  beforeEach(() => {
    KW.newGame();
    KW.state.currentPrices = { Ganja: 500, Paper: 2000, Maathirai: 30 };
  });

  describe('KW.buyDrug', () => {
    test('deducts cash and adds to inventory', () => {
      KW.buyDrug('Ganja', 3);
      expect(KW.state.player.cash).toBe(KW.STARTING_CASH - 1500);
      expect(KW.state.inventory['Ganja']).toBe(3);
    });

    test('updates totalBought stat', () => {
      KW.buyDrug('Ganja', 2);
      expect(KW.state.stats.totalBought).toBe(1000);
    });

    test('does not buy if not enough cash', () => {
      KW.state.player.cash = 100;
      KW.buyDrug('Paper', 1); // costs 2000
      expect(KW.state.inventory['Paper']).toBeUndefined();
      expect(KW.state.player.cash).toBe(100);
    });

    test('does not buy if coat is full', () => {
      KW.state.inventory = { Maathirai: KW.STARTING_COAT };
      KW.buyDrug('Ganja', 1);
      expect(KW.state.inventory['Ganja']).toBeUndefined();
    });

    test('adds to existing inventory', () => {
      KW.state.inventory = { Ganja: 5 };
      KW.buyDrug('Ganja', 3);
      expect(KW.state.inventory['Ganja']).toBe(8);
    });
  });

  describe('KW.sellDrug', () => {
    test('adds cash and removes from inventory', () => {
      KW.state.inventory = { Ganja: 10 };
      KW.sellDrug('Ganja', 5);
      expect(KW.state.player.cash).toBe(KW.STARTING_CASH + 2500);
      expect(KW.state.inventory['Ganja']).toBe(5);
    });

    test('removes drug key when selling all', () => {
      KW.state.inventory = { Ganja: 3 };
      KW.sellDrug('Ganja', 3);
      expect(KW.state.inventory['Ganja']).toBeUndefined();
    });

    test('updates totalSold stat', () => {
      KW.state.inventory = { Paper: 2 };
      KW.sellDrug('Paper', 2);
      expect(KW.state.stats.totalSold).toBe(4000);
    });

    test('does not sell more than owned', () => {
      KW.state.inventory = { Ganja: 2 };
      var cashBefore = KW.state.player.cash;
      KW.sellDrug('Ganja', 5);
      expect(KW.state.player.cash).toBe(cashBefore); // no change
    });

    test('does not sell drug not in market', () => {
      KW.state.inventory = { 'Brown Sugar': 5 };
      KW.state.currentPrices = { Ganja: 500 }; // Brown Sugar not in market
      var cashBefore = KW.state.player.cash;
      KW.sellDrug('Brown Sugar', 5);
      expect(KW.state.player.cash).toBe(cashBefore);
    });
  });
});

describe('Travel', () => {
  beforeEach(() => {
    KW.newGame();
    // Prevent random events from interfering
    KW.rollEvent = function() { return null; };
  });

  test('changes location', () => {
    KW.travelTo('tnagar');
    expect(KW.state.player.location).toBe('tnagar');
  });

  test('increments day', () => {
    KW.travelTo('tnagar');
    expect(KW.state.player.day).toBe(2);
  });

  test('applies debt interest', () => {
    var debtBefore = KW.state.player.debt;
    KW.travelTo('tnagar');
    expect(KW.state.player.debt).toBe(Math.floor(debtBefore * 1.1));
  });

  test('no interest when debt is 0', () => {
    KW.state.player.debt = 0;
    KW.travelTo('tnagar');
    expect(KW.state.player.debt).toBe(0);
  });

  test('generates new prices after travel', () => {
    var pricesBefore = Object.assign({}, KW.state.currentPrices);
    // Travel many times to ensure prices change at least once
    var changed = false;
    for (var i = 0; i < 10; i++) {
      KW.travelTo(i % 2 === 0 ? 'tnagar' : 'parrys');
      if (JSON.stringify(KW.state.currentPrices) !== JSON.stringify(pricesBefore)) {
        changed = true;
        break;
      }
    }
    expect(changed).toBe(true);
  });

  test('does not travel to same location', () => {
    KW.state.player.location = 'parrys';
    var dayBefore = KW.state.player.day;
    KW.travelTo('parrys');
    expect(KW.state.player.day).toBe(dayBefore); // day should not change
  });
});

describe('Debt Interest Compounding', () => {
  beforeEach(() => {
    KW.newGame();
    KW.rollEvent = function() { return null; };
  });

  test('debt compounds correctly over multiple days', () => {
    var debt = KW.STARTING_DEBT;
    for (var i = 0; i < 5; i++) {
      KW.travelTo(i % 2 === 0 ? 'tnagar' : 'parrys');
      debt = Math.floor(debt * 1.1);
    }
    expect(KW.state.player.debt).toBe(debt);
  });

  test('30 days of interest makes debt devastating', () => {
    // Starting debt of 5500 at 10% for 28 more travels
    for (var i = 0; i < 28; i++) {
      KW.state.player.day = i + 1; // prevent game over
      KW.travelTo(i % 2 === 0 ? 'tnagar' : 'parrys');
    }
    // Debt should be massive
    expect(KW.state.player.debt).toBeGreaterThan(50000);
  });
});

describe('Stash Operations', () => {
  beforeEach(() => {
    KW.newGame();
    KW.state.inventory = { Ganja: 20, Paper: 10 };
  });

  test('storeInStash moves drugs from inventory to stash', () => {
    // Override openAmountModal to store 5
    KW.openAmountModal = function(title, max, cb) { cb(5); };
    KW.storeInStash('Ganja');
    expect(KW.state.inventory['Ganja']).toBe(15);
    expect(KW.state.stash['Ganja']).toBe(5);
  });

  test('storeInStash with qty=1 transfers directly', () => {
    KW.state.inventory = { Paper: 1 };
    KW.storeInStash('Paper');
    expect(KW.state.inventory['Paper']).toBeUndefined();
    expect(KW.state.stash['Paper']).toBe(1);
  });

  test('retrieveFromStash moves drugs back to inventory', () => {
    KW.state.stash = { Ganja: 10 };
    KW.state.inventory = {};
    KW.openAmountModal = function(title, max, cb) { cb(5); };
    KW.retrieveFromStash('Ganja');
    expect(KW.state.stash['Ganja']).toBe(5);
    expect(KW.state.inventory['Ganja']).toBe(5);
  });

  test('retrieveFromStash respects coat capacity', () => {
    KW.state.stash = { Ganja: 50 };
    KW.state.inventory = { Paper: 95 }; // only 5 spaces left
    KW.openAmountModal = function(title, max, cb) {
      expect(max).toBe(5); // should cap at available space
      cb(max);
    };
    KW.retrieveFromStash('Ganja');
  });

  test('removes drug key from stash when fully retrieved', () => {
    KW.state.stash = { Ganja: 1 };
    KW.state.inventory = {};
    KW.retrieveFromStash('Ganja');
    expect(KW.state.stash['Ganja']).toBeUndefined();
  });
});

describe('Data Integrity', () => {
  test('all 12 drugs are defined', () => {
    expect(KW.DRUGS.length).toBe(12);
  });

  test('all drugs have valid min/max prices', () => {
    KW.DRUGS.forEach(function(drug) {
      expect(drug.min).toBeGreaterThan(0);
      expect(drug.max).toBeGreaterThan(drug.min);
      expect(drug.name).toBeTruthy();
    });
  });

  test('all 6 locations are defined', () => {
    expect(KW.LOCATIONS.length).toBe(6);
  });

  test('all locations have required properties', () => {
    KW.LOCATIONS.forEach(function(loc) {
      expect(loc.key).toBeTruthy();
      expect(loc.name).toBeTruthy();
      expect(typeof loc.hasShark).toBe('boolean');
      expect(typeof loc.hasBank).toBe('boolean');
      expect(typeof loc.hasStash).toBe('boolean');
    });
  });

  test('only parrys has shark and stash', () => {
    var withShark = KW.LOCATIONS.filter(function(l) { return l.hasShark; });
    var withStash = KW.LOCATIONS.filter(function(l) { return l.hasStash; });
    expect(withShark.length).toBe(1);
    expect(withShark[0].key).toBe('parrys');
    expect(withStash.length).toBe(1);
    expect(withStash[0].key).toBe('parrys');
  });

  test('parrys and tnagar have banks', () => {
    var withBank = KW.LOCATIONS.filter(function(l) { return l.hasBank; });
    expect(withBank.length).toBe(2);
    var keys = withBank.map(function(l) { return l.key; });
    expect(keys).toContain('parrys');
    expect(keys).toContain('tnagar');
  });

  test('game constants are sensible', () => {
    expect(KW.STARTING_CASH).toBe(2000);
    expect(KW.STARTING_DEBT).toBe(5500);
    expect(KW.STARTING_HEALTH).toBe(100);
    expect(KW.STARTING_COAT).toBe(100);
    expect(KW.MAX_DAYS).toBe(30);
    expect(KW.DEBT_INTEREST).toBe(0.10);
  });
});
