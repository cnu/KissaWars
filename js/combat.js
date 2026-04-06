// KissaWars - Combat System
window.KW = window.KW || {};

KW.combat = {
  officers: 0,
  inCombat: false,
};

KW.startCombat = function(officerCount) {
  KW.combat.officers = officerCount;
  KW.combat.inCombat = true;
  KW.state.stats.arrests++;
  KW.showScreen('combat');
  KW.renderCombat();
};

KW.attemptFight = function() {
  KW.state.stats.fights++;
  // Player deals damage
  var killed = 0;
  for (var i = 0; i < KW.combat.officers; i++) {
    if (Math.random() < 0.35) killed++;
  }
  KW.combat.officers -= killed;

  // Officers deal damage back
  var damage = 0;
  for (var j = 0; j < KW.combat.officers; j++) {
    if (Math.random() < 0.4) {
      damage += KW.randInt(3, 12);
    }
  }
  KW.state.player.health -= damage;

  var msg = '';
  if (killed > 0) msg += 'You spat blades at ' + killed + ' cop' + (killed > 1 ? 's' : '') + '! ';
  if (damage > 0) msg += 'You took ' + damage + ' damage! ';
  if (damage === 0 && killed === 0) msg += 'You spat but missed... ';

  if (KW.state.player.health <= 0) {
    KW.state.player.health = 0;
    KW.endCombat(false, 'They overpowered you! You blacked out!');
    return msg;
  }

  if (KW.combat.officers <= 0) {
    KW.endCombat(true, msg + 'Your blades pierced them all!');
    return msg;
  }

  KW.sound.danger();
  KW.renderCombat(msg);
  KW.saveGame();
  return msg;
};

KW.attemptRun = function() {
  var invSize = KW.getInventorySize();
  var coatSize = KW.state.player.coatSize;
  // Base 60% chance, reduced by how full your coat is
  var chance = 0.6 - (invSize / coatSize) * 0.3;
  chance = Math.max(0.15, chance);

  if (Math.random() < chance) {
    // Successful run - might drop some drugs
    var dropped = {};
    for (var drug in KW.state.inventory) {
      if (KW.state.inventory[drug] > 0 && Math.random() < 0.3) {
        var lose = KW.randInt(1, Math.ceil(KW.state.inventory[drug] * 0.5));
        KW.state.inventory[drug] -= lose;
        if (KW.state.inventory[drug] <= 0) delete KW.state.inventory[drug];
        dropped[drug] = lose;
      }
    }
    var dropMsg = '';
    for (var d in dropped) {
      dropMsg += 'You dropped ' + dropped[d] + ' ' + d + '! ';
    }
    KW.endCombat(true, 'You got away! ' + dropMsg);
  } else {
    // Failed to run, take some damage
    var damage = KW.randInt(1, 8) * KW.combat.officers;
    KW.state.player.health -= Math.min(damage, 20);
    if (KW.state.player.health <= 0) {
      KW.state.player.health = 0;
      KW.endCombat(false, 'They caught up and beat you down!');
    } else {
      KW.sound.danger();
      KW.renderCombat('Couldn\'t get away! Lost ' + Math.min(damage, 20) + ' health!');
    }
  }
  KW.saveGame();
};

KW.endCombat = function(survived, message) {
  KW.combat.inCombat = false;
  if (!survived) {
    // Hospital: lose some days and cash
    var daysLost = KW.randInt(1, 3);
    var medCost = KW.randInt(500, 2000);
    KW.state.player.day += daysLost;
    KW.state.player.cash = Math.max(0, KW.state.player.cash - medCost);
    KW.state.player.health = KW.STARTING_HEALTH;
    message += ' Hospital: lost ' + daysLost + ' days and ' + KW.formatMoney(medCost) + '.';

    if (KW.state.player.day > KW.MAX_DAYS) {
      KW.saveGame();
      KW.showEvent(message + ' Game over!', function() {
        KW.gameOver();
      });
      return;
    }
  }
  KW.saveGame();
  KW.showEvent(message, function() {
    KW.showScreen('market');
    KW.renderMarket();
  });
};
