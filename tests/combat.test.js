require('./setup.js');
const { describe, test, expect, beforeEach } = require('bun:test');

// Stub UI functions that combat.js calls
KW.showScreen = function() {};
KW.renderCombat = function() {};
KW.showEvent = function(msg, cb) { if (cb) cb(); };
KW.renderMarket = function() {};
KW.gameOver = function() {};

describe('Combat System', () => {
  beforeEach(() => {
    KW.newGame();
    KW.combat = { officers: 3, inCombat: true };
  });

  describe('KW.attemptFight', () => {
    test('can reduce officer count', () => {
      var initialOfficers = KW.combat.officers;
      var reduced = false;
      // Run many times to account for randomness
      for (var i = 0; i < 50; i++) {
        KW.newGame();
        KW.combat = { officers: 5, inCombat: true };
        KW.attemptFight();
        if (KW.combat.officers < 5) {
          reduced = true;
          break;
        }
      }
      expect(reduced).toBe(true);
    });

    test('can deal damage to player', () => {
      var damaged = false;
      for (var i = 0; i < 50; i++) {
        KW.newGame();
        KW.combat = { officers: 5, inCombat: true };
        KW.attemptFight();
        if (KW.state.player.health < KW.STARTING_HEALTH) {
          damaged = true;
          break;
        }
      }
      expect(damaged).toBe(true);
    });

    test('increments fights stat', () => {
      var before = KW.state.stats.fights;
      KW.attemptFight();
      expect(KW.state.stats.fights).toBe(before + 1);
    });

    test('ends combat when all officers defeated', () => {
      KW.combat.officers = 1;
      // Keep fighting until we win (might take several tries due to randomness)
      for (var i = 0; i < 100; i++) {
        if (KW.combat.officers <= 0 || !KW.combat.inCombat) break;
        KW.attemptFight();
      }
      // Either we killed them all or got knocked out
      expect(KW.combat.officers <= 0 || KW.state.player.health <= 0).toBe(true);
    });
  });

  describe('KW.attemptRun', () => {
    test('can successfully escape', () => {
      var escaped = false;
      for (var i = 0; i < 100; i++) {
        KW.newGame();
        KW.combat = { officers: 1, inCombat: true };
        KW.state.inventory = {}; // empty coat = higher run chance
        KW.attemptRun();
        if (!KW.combat.inCombat) {
          escaped = true;
          break;
        }
      }
      expect(escaped).toBe(true);
    });

    test('failed run deals damage', () => {
      var tookDamage = false;
      for (var i = 0; i < 100; i++) {
        KW.newGame();
        KW.combat = { officers: 5, inCombat: true };
        KW.state.inventory = { Paper: KW.STARTING_COAT }; // full coat = low run chance
        var healthBefore = KW.state.player.health;
        KW.attemptRun();
        if (KW.state.player.health < healthBefore) {
          tookDamage = true;
          break;
        }
      }
      expect(tookDamage).toBe(true);
    });

    test('may drop drugs when escaping', () => {
      var droppedDrugs = false;
      for (var i = 0; i < 200; i++) {
        KW.newGame();
        KW.combat = { officers: 1, inCombat: true };
        KW.state.inventory = { Paper: 50, Ganja: 50 };
        KW.attemptRun();
        if (!KW.combat.inCombat) {
          var totalAfter = KW.getInventorySize();
          if (totalAfter < 100) {
            droppedDrugs = true;
            break;
          }
        }
      }
      expect(droppedDrugs).toBe(true);
    });
  });

  describe('KW.startCombat', () => {
    test('sets combat state', () => {
      KW.startCombat(4);
      expect(KW.combat.officers).toBe(4);
      expect(KW.combat.inCombat).toBe(true);
    });

    test('increments arrests stat', () => {
      var before = KW.state.stats.arrests;
      KW.startCombat(2);
      expect(KW.state.stats.arrests).toBe(before + 1);
    });
  });

  describe('KW.endCombat', () => {
    test('surviving combat returns to market', () => {
      KW.endCombat(true, 'You escaped!');
      expect(KW.combat.inCombat).toBe(false);
    });

    test('losing combat costs days and cash', () => {
      KW.state.player.cash = 5000;
      var dayBefore = KW.state.player.day;
      KW.endCombat(false, 'You were beaten!');
      expect(KW.combat.inCombat).toBe(false);
      expect(KW.state.player.health).toBe(KW.STARTING_HEALTH); // healed
      expect(KW.state.player.day).toBeGreaterThan(dayBefore);
      expect(KW.state.player.cash).toBeLessThan(5000);
    });

    test('hospital with no cash sets cash to 0', () => {
      KW.state.player.cash = 0;
      KW.endCombat(false, 'Beaten!');
      expect(KW.state.player.cash).toBe(0);
    });
  });
});
