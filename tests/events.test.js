require('./setup.js');
const { describe, test, expect, beforeEach } = require('bun:test');

describe('Event Creation', () => {
  beforeEach(() => {
    KW.newGame();
    // Ensure all drugs are in the market for event tests
    KW.state.currentPrices = {};
    KW.DRUGS.forEach(function(d) {
      KW.state.currentPrices[d.name] = KW.randInt(d.min, d.max);
    });
  });

  describe('KW.createPriceSpikeEvent', () => {
    test('multiplies a drug price by 4', () => {
      var originalPrices = Object.assign({}, KW.state.currentPrices);
      var evt = KW.createPriceSpikeEvent();
      expect(evt).not.toBeNull();
      expect(evt.type).toBe('priceSpike');
      expect(evt.needsChoice).toBe(false);
      // One drug should be 4x its original price
      var spikedDrug = evt.drug;
      expect(KW.state.currentPrices[spikedDrug]).toBe(Math.floor(originalPrices[spikedDrug] * 4));
    });

    test('returns null when no drugs in market', () => {
      KW.state.currentPrices = {};
      expect(KW.createPriceSpikeEvent()).toBeNull();
    });

    test('message contains the drug name', () => {
      var evt = KW.createPriceSpikeEvent();
      expect(evt.message).toContain(evt.drug);
    });
  });

  describe('KW.createPriceCrashEvent', () => {
    test('reduces a drug price to 25%', () => {
      var originalPrices = Object.assign({}, KW.state.currentPrices);
      var evt = KW.createPriceCrashEvent();
      expect(evt).not.toBeNull();
      expect(evt.type).toBe('priceCrash');
      var crashedDrug = evt.drug;
      expect(KW.state.currentPrices[crashedDrug]).toBe(
        Math.max(1, Math.floor(originalPrices[crashedDrug] * 0.25))
      );
    });

    test('price never goes below 1', () => {
      KW.state.currentPrices = { Maathirai: 1 };
      var evt = KW.createPriceCrashEvent();
      expect(KW.state.currentPrices['Maathirai']).toBeGreaterThanOrEqual(1);
    });
  });

  describe('KW.createPoliceEvent', () => {
    test('creates event with 1-8 officers', () => {
      for (var i = 0; i < 50; i++) {
        KW.state.inventory = { Paper: 10 }; // carrying drugs increases chance
        var evt = KW.createPoliceEvent();
        if (evt) {
          expect(evt.type).toBe('police');
          expect(evt.officerCount).toBeGreaterThanOrEqual(1);
          expect(evt.officerCount).toBeLessThanOrEqual(8);
        }
      }
    });
  });

  describe('KW.createMuggingEvent', () => {
    test('takes 10-40% of cash', () => {
      KW.state.player.cash = 10000;
      var evt = KW.createMuggingEvent();
      expect(evt.type).toBe('mugging');
      expect(evt.loss).toBeGreaterThanOrEqual(1000);  // 10% of 10000
      expect(evt.loss).toBeLessThanOrEqual(4000);     // 40% of 10000
      expect(KW.state.player.cash).toBe(10000 - evt.loss);
    });

    test('returns null when player has no cash', () => {
      KW.state.player.cash = 0;
      expect(KW.createMuggingEvent()).toBeNull();
    });

    test('increments mugging stat', () => {
      KW.state.player.cash = 5000;
      var before = KW.state.stats.muggings;
      KW.createMuggingEvent();
      expect(KW.state.stats.muggings).toBe(before + 1);
    });
  });

  describe('KW.createFindDrugEvent', () => {
    test('adds drugs to inventory', () => {
      var evt = KW.createFindDrugEvent();
      expect(evt).not.toBeNull();
      expect(evt.type).toBe('findDrug');
      expect(evt.qty).toBeGreaterThanOrEqual(2);
      expect(evt.qty).toBeLessThanOrEqual(12);
      expect(KW.state.inventory[evt.drug]).toBe(evt.qty);
    });

    test('returns null when coat is full', () => {
      KW.state.inventory = { Paper: KW.STARTING_COAT };
      expect(KW.createFindDrugEvent()).toBeNull();
    });

    test('respects remaining coat space', () => {
      KW.state.inventory = { Paper: KW.STARTING_COAT - 3 };
      var evt = KW.createFindDrugEvent();
      if (evt) {
        expect(evt.qty).toBeLessThanOrEqual(3);
      }
    });
  });

  describe('KW.createCoatEvent', () => {
    test('creates coat upgrade offer', () => {
      var evt = KW.createCoatEvent();
      expect(evt.type).toBe('coat');
      expect(evt.needsChoice).toBe(true);
      expect(evt.choices).toEqual(['Yes', 'No']);
      expect(evt.extra).toBeGreaterThanOrEqual(10);
      expect(evt.extra).toBeLessThanOrEqual(30);
      expect(evt.price).toBeGreaterThanOrEqual(150);
      expect(evt.price).toBeLessThanOrEqual(500);
    });
  });

  describe('KW.handleCoatChoice', () => {
    test('buying coat increases size and costs cash', () => {
      var evt = KW.createCoatEvent();
      KW.state.activeEvent = evt;
      KW.state.player.cash = 1000;
      var origSize = KW.state.player.coatSize;
      KW.handleCoatChoice('Yes');
      expect(KW.state.player.coatSize).toBe(origSize + evt.extra);
      expect(KW.state.player.cash).toBe(1000 - evt.price);
      expect(KW.state.activeEvent).toBeNull();
    });

    test('declining coat does not change anything', () => {
      var evt = KW.createCoatEvent();
      KW.state.activeEvent = evt;
      KW.state.player.cash = 1000;
      var origSize = KW.state.player.coatSize;
      KW.handleCoatChoice('No');
      expect(KW.state.player.coatSize).toBe(origSize);
      expect(KW.state.player.cash).toBe(1000);
    });

    test('cannot buy if not enough cash', () => {
      var evt = KW.createCoatEvent();
      KW.state.activeEvent = evt;
      KW.state.player.cash = 0;
      var origSize = KW.state.player.coatSize;
      KW.handleCoatChoice('Yes');
      expect(KW.state.player.coatSize).toBe(origSize);
    });
  });
});

describe('KW.rollEvent', () => {
  beforeEach(() => {
    KW.newGame();
    KW.state.currentPrices = {};
    KW.DRUGS.forEach(function(d) {
      KW.state.currentPrices[d.name] = KW.randInt(d.min, d.max);
    });
    KW.state.player.cash = 10000;
  });

  test('returns null or a valid event object', () => {
    for (var i = 0; i < 100; i++) {
      var evt = KW.rollEvent();
      if (evt !== null) {
        expect(evt.type).toBeDefined();
        expect(evt.message).toBeDefined();
        expect(['priceSpike', 'priceCrash', 'police', 'mugging', 'findDrug', 'coat'])
          .toContain(evt.type);
      }
    }
  });

  test('generates a mix of event types over many rolls', () => {
    var types = {};
    for (var i = 0; i < 500; i++) {
      KW.newGame();
      KW.state.player.cash = 10000;
      KW.state.inventory = { Paper: 10 };
      KW.state.currentPrices = { Paper: 2000, Ganja: 500 };
      var evt = KW.rollEvent();
      if (evt) types[evt.type] = (types[evt.type] || 0) + 1;
    }
    // Should see at least a few different event types
    expect(Object.keys(types).length).toBeGreaterThanOrEqual(3);
  });
});
