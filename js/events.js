// KissaWars - Random Events
window.KW = window.KW || {};

KW.rollEvent = function() {
  var roll = Math.random();

  // 60% chance of no event
  if (roll > 0.40) return null;

  // Weight distribution within the 40%
  if (roll < 0.08) return KW.createPriceSpikeEvent();
  if (roll < 0.16) return KW.createPriceCrashEvent();
  if (roll < 0.24) return KW.createPoliceEvent();
  if (roll < 0.30) return KW.createMuggingEvent();
  if (roll < 0.36) return KW.createFindDrugEvent();
  return KW.createCoatEvent();
};

KW.createPriceSpikeEvent = function() {
  var drugNames = Object.keys(KW.state.currentPrices);
  if (drugNames.length === 0) return null;
  var drug = drugNames[KW.randInt(0, drugNames.length - 1)];
  KW.state.currentPrices[drug] = Math.floor(KW.state.currentPrices[drug] * 4);
  var msgs = KW.EVENTS.priceSpikeMessages;
  return {
    type: 'priceSpike',
    message: msgs[KW.randInt(0, msgs.length - 1)].replace('{drug}', drug),
    drug: drug,
    needsChoice: false,
  };
};

KW.createPriceCrashEvent = function() {
  var drugNames = Object.keys(KW.state.currentPrices);
  if (drugNames.length === 0) return null;
  var drug = drugNames[KW.randInt(0, drugNames.length - 1)];
  KW.state.currentPrices[drug] = Math.max(1, Math.floor(KW.state.currentPrices[drug] * 0.25));
  var msgs = KW.EVENTS.priceCrashMessages;
  return {
    type: 'priceCrash',
    message: msgs[KW.randInt(0, msgs.length - 1)].replace('{drug}', drug),
    drug: drug,
    needsChoice: false,
  };
};

KW.createPoliceEvent = function() {
  // More likely if carrying expensive inventory
  var invSize = KW.getInventorySize();
  if (invSize === 0 && Math.random() > 0.3) return null;
  var count = KW.randInt(1, 8);
  var msgs = KW.EVENTS.policeMessages;
  return {
    type: 'police',
    message: msgs[KW.randInt(0, msgs.length - 1)].replace('{count}', count),
    officerCount: count,
    needsChoice: false, // combat screen handles choices
  };
};

KW.createMuggingEvent = function() {
  if (KW.state.player.cash <= 0) return null;
  var pct = KW.randInt(10, 40);
  var loss = Math.floor(KW.state.player.cash * pct / 100);
  KW.state.player.cash -= loss;
  var msgs = KW.EVENTS.muggingMessages;
  KW.state.stats.muggings++;
  return {
    type: 'mugging',
    message: msgs[KW.randInt(0, msgs.length - 1)] + ' They took ' + KW.formatMoney(loss) + '!',
    loss: loss,
    needsChoice: false,
  };
};

KW.createFindDrugEvent = function() {
  var drug = KW.DRUGS[KW.randInt(0, KW.DRUGS.length - 1)];
  var qty = KW.randInt(2, 12);
  var space = KW.state.player.coatSize - KW.getInventorySize();
  if (space <= 0) return null;
  qty = Math.min(qty, space);
  KW.state.inventory[drug.name] = (KW.state.inventory[drug.name] || 0) + qty;
  var msgs = KW.EVENTS.findDrugMessages;
  return {
    type: 'findDrug',
    message: msgs[KW.randInt(0, msgs.length - 1)].replace('{drug}', drug.name).replace('{qty}', qty),
    drug: drug.name,
    qty: qty,
    needsChoice: false,
  };
};

KW.createCoatEvent = function() {
  var extra = KW.randInt(10, 30);
  var price = KW.randInt(150, 500);
  return {
    type: 'coat',
    message: 'Would you like to buy a bigger trenchcoat for ' + KW.formatMoney(price) + '? (+' + extra + ' pockets)',
    extra: extra,
    price: price,
    needsChoice: true,
    choices: ['Yes', 'No'],
  };
};

KW.handleCoatChoice = function(choice) {
  var evt = KW.state.activeEvent;
  if (!evt || evt.type !== 'coat') return;
  if (choice === 'Yes' && KW.state.player.cash >= evt.price) {
    KW.state.player.cash -= evt.price;
    KW.state.player.coatSize += evt.extra;
    KW.sound.buy();
  } else {
    KW.sound.blip();
  }
  KW.state.activeEvent = null;
  KW.saveGame();
};
