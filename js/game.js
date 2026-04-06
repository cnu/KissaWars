// KissaWars - Game Orchestrator
window.KW = window.KW || {};

KW.init = function() {
  // Init audio on first interaction
  document.addEventListener('click', function() {
    KW.initAudio();
  }, { once: true });
  document.addEventListener('touchstart', function() {
    KW.initAudio();
  }, { once: true });

  // Title screen buttons
  document.getElementById('btn-new-game').onclick = function() {
    KW.sound.click();
    KW.newGame();
    KW.showScreen('market');
    KW.renderMarket();
  };

  var continueBtn = document.getElementById('btn-continue');
  continueBtn.onclick = function() {
    KW.sound.click();
    if (!KW.loadGame()) {
      KW.refreshContinueButton();
      KW.showToast('No save found!');
      return;
    }
    KW.showScreen('market');
    KW.renderMarket();
  };
  KW.refreshContinueButton();

  document.getElementById('btn-leaderboard').onclick = function() {
    KW.sound.click();
    KW.renderLeaderboard();
    KW.showScreen('leaderboard');
  };

  document.getElementById('btn-lb-back').onclick = function() {
    KW.sound.click();
    KW.refreshContinueButton();
    KW.showScreen('title');
  };

  // Sound toggle
  var soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    var settings = KW.getSettings();
    soundBtn.textContent = settings.soundEnabled ? 'Sound: ON' : 'Sound: OFF';
    soundBtn.onclick = function() {
      var s = KW.getSettings();
      s.soundEnabled = !s.soundEnabled;
      KW.saveSettings(s);
      soundBtn.textContent = s.soundEnabled ? 'Sound: ON' : 'Sound: OFF';
    };
  }

  KW.showScreen('title');
};

KW.refreshContinueButton = function() {
  var continueBtn = document.getElementById('btn-continue');
  if (!continueBtn) return;
  continueBtn.style.display = KW.hasSave() ? '' : 'none';
};

// Buy drug
KW.buyDrug = function(name, qty) {
  var price = KW.state.currentPrices[name];
  var cost = price * qty;
  if (cost > KW.state.player.cash) return;
  if (qty + KW.getInventorySize() > KW.state.player.coatSize) return;

  KW.state.player.cash -= cost;
  KW.state.inventory[name] = (KW.state.inventory[name] || 0) + qty;
  KW.state.stats.totalBought += cost;
  KW.sound.buy();
  KW.saveGame();
  KW.renderMarket();
  KW.showToast('Bought ' + qty + ' ' + name);
};

// Sell drug
KW.sellDrug = function(name, qty) {
  var owned = KW.state.inventory[name] || 0;
  if (qty > owned) return;
  var price = KW.state.currentPrices[name];
  if (!price) return;

  var revenue = price * qty;
  KW.state.player.cash += revenue;
  KW.state.inventory[name] -= qty;
  if (KW.state.inventory[name] <= 0) delete KW.state.inventory[name];
  KW.state.stats.totalSold += revenue;
  KW.sound.sell();
  KW.saveGame();
  KW.renderMarket();
  KW.showToast('Sold ' + qty + ' ' + name + ' for ' + KW.formatMoney(revenue));
};

// Travel
KW.showTravelScreen = function() {
  KW.sound.click();
  KW.showScreen('travel');
  KW.renderTravel();
};

KW.travelTo = function(locationKey) {
  if (locationKey === KW.state.player.location) return;

  KW.state.player.location = locationKey;
  KW.state.player.day++;

  // Apply debt interest
  if (KW.state.player.debt > 0) {
    KW.state.player.debt = Math.floor(KW.state.player.debt * (1 + KW.DEBT_INTEREST));
  }

  // Generate new prices
  KW.generatePrices();

  KW.sound.travel();
  KW.saveGame();

  // Check game over
  if (KW.state.player.day > KW.MAX_DAYS) {
    KW.gameOver();
    return;
  }

  // Roll for random event
  var evt = KW.rollEvent();
  if (evt) {
    KW.state.activeEvent = evt;
    KW.saveGame();

    if (evt.type === 'police') {
      KW.sound.danger();
      KW.showEvent(evt.message, function() {
        KW.startCombat(evt.officerCount);
      });
    } else if (evt.type === 'mugging') {
      KW.sound.danger();
      KW.showEvent(evt.message, function() {
        KW.state.activeEvent = null;
        KW.showScreen('market');
        KW.renderMarket();
      });
    } else if (evt.needsChoice) {
      KW.sound.alert();
      KW.showEvent(evt.message, function() {
        KW.state.activeEvent = null;
        KW.showScreen('market');
        KW.renderMarket();
      });
    } else {
      KW.sound.alert();
      KW.showEvent(evt.message, function() {
        KW.state.activeEvent = null;
        KW.showScreen('market');
        KW.renderMarket();
      });
    }
  } else {
    KW.showScreen('market');
    KW.renderMarket();
  }
};

// Bank
KW.showBankScreen = function() {
  KW.sound.click();
  KW.showScreen('bank');
  KW.renderBank();
};

KW.bankDeposit = function() {
  if (KW.state.player.cash <= 0) {
    KW.showToast('No cash to deposit!');
    return;
  }
  KW.openAmountModal('Deposit', KW.state.player.cash, function(amount) {
    KW.state.player.cash -= amount;
    KW.state.player.bank += amount;
    KW.sound.buy();
    KW.saveGame();
    KW.renderBank();
    KW.showToast('Deposited ' + KW.formatMoney(amount));
  });
};

KW.bankWithdraw = function() {
  if (KW.state.player.bank <= 0) {
    KW.showToast('Nothing in the bank!');
    return;
  }
  KW.openAmountModal('Withdraw', KW.state.player.bank, function(amount) {
    KW.state.player.bank -= amount;
    KW.state.player.cash += amount;
    KW.sound.sell();
    KW.saveGame();
    KW.renderBank();
    KW.showToast('Withdrew ' + KW.formatMoney(amount));
  });
};

// Loan Shark
KW.showSharkScreen = function() {
  KW.sound.click();
  KW.showScreen('shark');
  KW.renderShark();
};

KW.sharkBorrow = function() {
  var maxBorrow = Math.max(0, KW.MAX_DEBT - KW.state.player.debt);
  if (maxBorrow <= 0) {
    KW.showToast('The shark won\'t lend you more!');
    return;
  }
  KW.openAmountModal('Borrow', maxBorrow, function(amount) {
    KW.state.player.debt += amount;
    KW.state.player.cash += amount;
    KW.sound.sell();
    KW.saveGame();
    KW.renderShark();
    KW.showToast('Borrowed ' + KW.formatMoney(amount));
  });
};

KW.sharkRepay = function() {
  var maxRepay = Math.min(KW.state.player.cash, KW.state.player.debt);
  if (maxRepay <= 0) {
    KW.showToast('Nothing to repay!');
    return;
  }
  KW.openAmountModal('Repay', maxRepay, function(amount) {
    KW.state.player.cash -= amount;
    KW.state.player.debt -= amount;
    KW.sound.buy();
    KW.saveGame();
    KW.renderShark();
    KW.showToast('Repaid ' + KW.formatMoney(amount));
  });
};

// Stash
KW.showStashScreen = function() {
  KW.sound.click();
  KW.showScreen('stash');
  KW.renderStash();
};

KW.storeInStash = function(drug) {
  var qty = KW.state.inventory[drug] || 0;
  if (qty <= 0) return;
  if (qty === 1) {
    KW.state.stash[drug] = (KW.state.stash[drug] || 0) + 1;
    KW.state.inventory[drug]--;
    if (KW.state.inventory[drug] <= 0) delete KW.state.inventory[drug];
    KW.sound.blip();
    KW.saveGame();
    KW.renderStash();
    return;
  }
  KW.openAmountModal('Store ' + drug, qty, function(amount) {
    KW.state.stash[drug] = (KW.state.stash[drug] || 0) + amount;
    KW.state.inventory[drug] -= amount;
    if (KW.state.inventory[drug] <= 0) delete KW.state.inventory[drug];
    KW.sound.blip();
    KW.saveGame();
    KW.renderStash();
  });
};

KW.retrieveFromStash = function(drug) {
  var qty = KW.state.stash[drug] || 0;
  if (qty <= 0) return;
  var space = KW.state.player.coatSize - KW.getInventorySize();
  if (space <= 0) {
    KW.showToast('Coat is full!');
    return;
  }
  var maxTake = Math.min(qty, space);
  if (maxTake === 1) {
    KW.state.inventory[drug] = (KW.state.inventory[drug] || 0) + 1;
    KW.state.stash[drug]--;
    if (KW.state.stash[drug] <= 0) delete KW.state.stash[drug];
    KW.sound.blip();
    KW.saveGame();
    KW.renderStash();
    return;
  }
  KW.openAmountModal('Take ' + drug, maxTake, function(amount) {
    KW.state.inventory[drug] = (KW.state.inventory[drug] || 0) + amount;
    KW.state.stash[drug] -= amount;
    if (KW.state.stash[drug] <= 0) delete KW.state.stash[drug];
    KW.sound.blip();
    KW.saveGame();
    KW.renderStash();
  });
};

// Game Over
KW.gameOver = function() {
  var worth = KW.getNetWorth();
  if (worth > 0) {
    KW.sound.win();
  } else {
    KW.sound.lose();
  }
  KW.showScreen('gameover');
  KW.renderGameOver();
};

KW.submitScore = function() {
  var nameInput = document.getElementById('score-name');
  var name = nameInput ? nameInput.value.trim() : 'Anonymous';
  if (!name) name = 'Anonymous';
  KW.saveToLeaderboard(name, KW.getNetWorth(), KW.state.stats);
  KW.deleteSave();
  KW.refreshContinueButton();
  KW.showToast('Score saved!');
  KW.sound.buy();
  setTimeout(function() {
    KW.renderLeaderboard();
    KW.showScreen('leaderboard');
  }, 1000);
};

KW.backToTitle = function() {
  KW.deleteSave();
  KW.refreshContinueButton();
  KW.showScreen('title');
};

// Start
document.addEventListener('DOMContentLoaded', KW.init);
