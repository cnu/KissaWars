// KissaWars - UI Rendering
window.KW = window.KW || {};

KW.showScreen = function(name) {
  var screens = document.querySelectorAll('.screen');
  for (var i = 0; i < screens.length; i++) {
    screens[i].classList.remove('active');
  }
  var target = document.getElementById('screen-' + name);
  if (target) {
    target.classList.add('active');
  }
  // Render status bar when on market screen
  if (name === 'market' && KW.state) {
    KW.renderStatusBar();
  }
};

KW.renderStatusBar = function() {
  var p = KW.state.player;
  var loc = KW.getLocationData(p.location);
  var el = document.getElementById('status-bar');
  if (!el) return;
  el.innerHTML =
    '<div class="status-row">' +
      '<span class="status-loc">' + loc.name + '</span>' +
      '<span class="status-day">Day ' + p.day + '/' + KW.MAX_DAYS + '</span>' +
    '</div>' +
    '<div class="status-row">' +
      '<span class="status-cash">Cash: ' + KW.formatMoney(p.cash) + '</span>' +
      '<span class="status-debt">Debt: ' + KW.formatMoney(p.debt) + '</span>' +
    '</div>' +
    '<div class="status-row">' +
      '<span class="status-bank">Bank: ' + KW.formatMoney(p.bank) + '</span>' +
      '<span class="status-coat">Coat: ' + KW.getInventorySize() + '/' + p.coatSize + '</span>' +
    '</div>' +
    '<div class="status-row">' +
      '<span class="status-health">HP: ' + p.health + '</span>' +
      '<span class="status-worth">Worth: ' + KW.formatMoney(KW.getNetWorth()) + '</span>' +
    '</div>';
};

KW.renderDrugName = function(name) {
  var realName = KW.getDrugRealName(name);
  if (!realName || realName === name) {
    return '<span class="drug-name-main">' + name + '</span>';
  }
  return '<span class="drug-name-main">' + name + '</span>' +
    '<span class="drug-name-sub">' + realName + '</span>';
};

KW.renderPriceBar = function(name, price) {
  var drug = KW.getDrugData(name);
  if (!drug) return '<div class="price-bar"><div class="price-tick" style="left:50%"></div></div>';
  var range = drug.max - drug.min;
  var pct = range > 0 ? ((price - drug.min) / range) * 100 : 50;
  pct = Math.max(0, Math.min(100, pct));
  return '<div class="price-bar"><div class="price-tick" style="left:' + pct + '%"></div></div>';
};

KW.renderMarket = function() {
  KW.renderStatusBar();
  var prices = KW.state.currentPrices;
  var inv = KW.state.inventory;
  var el = document.getElementById('market-list');
  if (!el) return;

  var drugNames = Object.keys(prices);
  drugNames.sort();

  if (drugNames.length === 0) {
    el.innerHTML = '<div class="empty-msg">No drugs available here today.</div>';
    return;
  }

  var html = '<table class="market-table"><thead><tr>' +
    '<th>Drug</th><th>Price</th><th>Own</th><th></th>' +
    '</tr></thead><tbody>';

  for (var i = 0; i < drugNames.length; i++) {
    var name = drugNames[i];
    var price = prices[name];
    var qty = inv[name] || 0;
    html += '<tr data-drug="' + name + '">' +
      '<td class="drug-name-cell">' + KW.renderDrugName(name) + '</td>' +
      '<td class="price"><span class="price-value">' + KW.formatMoney(price) + '</span>' + KW.renderPriceBar(name, price) + '</td>' +
      '<td class="qty">' + qty + '</td>' +
      '<td class="actions">' +
        '<button class="btn-sm btn-buy" onclick="KW.openBuyModal(\'' + name + '\')">BUY</button>' +
        (qty > 0 ? '<button class="btn-sm btn-sell" onclick="KW.openSellModal(\'' + name + '\')">SELL</button>' : '') +
      '</td>' +
      '</tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;

  KW.renderMarketNav();
};

KW.renderMarketNav = function() {
  var loc = KW.getLocationData(KW.state.player.location);
  var nav = document.getElementById('market-nav');
  if (!nav) return;

  var html = '<button class="btn nav-btn" onclick="KW.showTravelScreen()">Travel</button>';
  if (loc.hasBank) {
    html += '<button class="btn nav-btn" onclick="KW.showBankScreen()">Bank</button>';
  }
  if (loc.hasShark) {
    html += '<button class="btn nav-btn" onclick="KW.showSharkScreen()">Shark</button>';
  }
  if (loc.hasStash) {
    html += '<button class="btn nav-btn" onclick="KW.showStashScreen()">Stash</button>';
  }
  nav.innerHTML = html;
};

// Quantity Modal
KW.openBuyModal = function(drugName) {
  var price = KW.state.currentPrices[drugName];
  if (!price) return;
  var maxAfford = Math.floor(KW.state.player.cash / price);
  var maxSpace = KW.state.player.coatSize - KW.getInventorySize();
  var maxQty = Math.min(maxAfford, maxSpace);
  if (maxQty <= 0) {
    KW.showToast(maxAfford <= 0 ? 'Not enough cash!' : 'Coat is full!');
    return;
  }
  KW.openQuantityModal('Buy ' + drugName, price, maxQty, function(qty) {
    KW.buyDrug(drugName, qty);
  });
};

KW.openSellModal = function(drugName) {
  var price = KW.state.currentPrices[drugName];
  var owned = KW.state.inventory[drugName] || 0;
  if (!price || owned <= 0) return;
  KW.openQuantityModal('Sell ' + drugName, price, owned, function(qty) {
    KW.sellDrug(drugName, qty);
  });
};

KW.openQuantityModal = function(title, unitPrice, maxQty, callback) {
  var modal = document.getElementById('quantity-modal');
  if (!modal) return;

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-unit-price').textContent = 'Price: ' + KW.formatMoney(unitPrice);

  var input = document.getElementById('modal-qty-input');
  var slider = document.getElementById('modal-qty-slider');
  var total = document.getElementById('modal-total');

  input.max = maxQty;
  input.value = 1;
  slider.max = maxQty;
  slider.value = 1;
  total.textContent = 'Total: ' + KW.formatMoney(unitPrice);

  var updateTotal = function() {
    var qty = parseInt(input.value) || 0;
    qty = Math.max(0, Math.min(qty, maxQty));
    total.textContent = 'Total: ' + KW.formatMoney(qty * unitPrice);
  };

  input.oninput = function() {
    var v = parseInt(input.value) || 0;
    v = Math.max(0, Math.min(v, maxQty));
    slider.value = v;
    updateTotal();
  };
  slider.oninput = function() {
    input.value = slider.value;
    updateTotal();
  };

  document.getElementById('modal-max-btn').onclick = function() {
    input.value = maxQty;
    slider.value = maxQty;
    updateTotal();
  };

  document.getElementById('modal-confirm-btn').onclick = function() {
    var qty = parseInt(input.value) || 0;
    if (qty > 0 && qty <= maxQty) {
      modal.classList.remove('active');
      callback(qty);
    }
  };

  document.getElementById('modal-cancel-btn').onclick = function() {
    modal.classList.remove('active');
  };

  modal.classList.add('active');
  input.focus();
  input.select();
};

// Amount modal (for bank/shark)
KW.openAmountModal = function(title, maxAmount, callback) {
  var modal = document.getElementById('quantity-modal');
  if (!modal) return;

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-unit-price').textContent = 'Max: ' + KW.formatMoney(maxAmount);

  var input = document.getElementById('modal-qty-input');
  var slider = document.getElementById('modal-qty-slider');
  var total = document.getElementById('modal-total');

  input.max = maxAmount;
  input.value = 0;
  slider.max = maxAmount;
  slider.value = 0;
  total.textContent = '';

  input.oninput = function() {
    var v = parseInt(input.value) || 0;
    v = Math.max(0, Math.min(v, maxAmount));
    slider.value = v;
    total.textContent = KW.formatMoney(v);
  };
  slider.oninput = function() {
    input.value = slider.value;
    total.textContent = KW.formatMoney(parseInt(slider.value));
  };

  document.getElementById('modal-max-btn').onclick = function() {
    input.value = maxAmount;
    slider.value = maxAmount;
    total.textContent = KW.formatMoney(maxAmount);
  };

  document.getElementById('modal-confirm-btn').onclick = function() {
    var amount = parseInt(input.value) || 0;
    if (amount > 0 && amount <= maxAmount) {
      modal.classList.remove('active');
      callback(amount);
    }
  };

  document.getElementById('modal-cancel-btn').onclick = function() {
    modal.classList.remove('active');
  };

  modal.classList.add('active');
  input.focus();
  input.select();
};

// Toast notification
KW.showToast = function(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(KW._toastTimer);
  KW._toastTimer = setTimeout(function() {
    toast.classList.remove('show');
  }, 2000);
};

// Event screen
KW.showEvent = function(message, callback) {
  KW.showScreen('event');
  var msgEl = document.getElementById('event-message');
  var choicesEl = document.getElementById('event-choices');
  var evt = KW.state.activeEvent;

  msgEl.textContent = '';
  choicesEl.innerHTML = '';

  // Typewriter effect
  var i = 0;
  var typeInterval = setInterval(function() {
    if (i < message.length) {
      msgEl.textContent += message[i];
      i++;
    } else {
      clearInterval(typeInterval);
      // Show choices or OK button
      if (evt && evt.needsChoice && evt.choices) {
        for (var c = 0; c < evt.choices.length; c++) {
          (function(choice) {
            var btn = document.createElement('button');
            btn.className = 'btn event-btn';
            btn.textContent = choice;
            btn.onclick = function() {
              if (evt.type === 'coat') KW.handleCoatChoice(choice);
              if (callback) callback();
            };
            choicesEl.appendChild(btn);
          })(evt.choices[c]);
        }
      } else {
        var btn = document.createElement('button');
        btn.className = 'btn event-btn';
        btn.textContent = 'OK';
        btn.onclick = function() {
          if (callback) callback();
        };
        choicesEl.appendChild(btn);
      }
    }
  }, 25);
};

// Combat screen
KW.renderCombat = function(msg) {
  var el = document.getElementById('combat-content');
  if (!el) return;
  var p = KW.state.player;
  var healthPct = Math.max(0, (p.health / KW.STARTING_HEALTH) * 100);
  var html =
    '<div class="combat-info">' +
      '<div class="combat-officers">Officers: ' + KW.combat.officers + '</div>' +
      '<div class="combat-health">Health: ' + p.health +
        '<div class="health-bar"><div class="health-fill" style="width:' + healthPct + '%"></div></div>' +
      '</div>' +
    '</div>';
  if (msg) {
    html += '<div class="combat-msg">' + msg + '</div>';
  }
  html +=
    '<div class="combat-actions">' +
      '<button class="btn btn-fight" onclick="KW.attemptFight()">FIGHT</button>' +
      '<button class="btn btn-run" onclick="KW.attemptRun()">RUN</button>' +
    '</div>';
  el.innerHTML = html;
};

// Travel screen
KW.renderTravel = function() {
  var el = document.getElementById('travel-list');
  if (!el) return;
  var current = KW.state.player.location;
  var html = '';
  for (var i = 0; i < KW.LOCATIONS.length; i++) {
    var loc = KW.LOCATIONS[i];
    var isCurrent = loc.key === current;
    html += '<button class="btn travel-btn' + (isCurrent ? ' current' : '') + '" ' +
      (isCurrent ? 'disabled' : 'onclick="KW.travelTo(\'' + loc.key + '\')"') + '>' +
      loc.name + (isCurrent ? ' (here)' : '') +
      '</button>';
  }
  el.innerHTML = html;
};

// Bank screen
KW.renderBank = function() {
  var el = document.getElementById('bank-content');
  if (!el) return;
  var p = KW.state.player;
  el.innerHTML =
    '<div class="bank-info">' +
      '<div>Cash on hand: ' + KW.formatMoney(p.cash) + '</div>' +
      '<div>In the bank: ' + KW.formatMoney(p.bank) + '</div>' +
    '</div>' +
    '<div class="bank-actions">' +
      '<button class="btn" onclick="KW.bankDeposit()">Deposit</button>' +
      '<button class="btn" onclick="KW.bankWithdraw()">Withdraw</button>' +
      '<button class="btn btn-back" onclick="KW.showScreen(\'market\'); KW.renderMarket()">Back</button>' +
    '</div>';
};

// Shark screen
KW.renderShark = function() {
  var el = document.getElementById('shark-content');
  if (!el) return;
  var p = KW.state.player;
  var maxBorrow = Math.max(0, KW.MAX_DEBT - p.debt);
  el.innerHTML =
    '<div class="shark-info">' +
      '<div>Current debt: ' + KW.formatMoney(p.debt) + '</div>' +
      '<div>Interest: ' + (KW.DEBT_INTEREST * 100) + '% per day</div>' +
      '<div>Cash: ' + KW.formatMoney(p.cash) + '</div>' +
    '</div>' +
    '<div class="shark-actions">' +
      (maxBorrow > 0 ? '<button class="btn" onclick="KW.sharkBorrow()">Borrow</button>' : '') +
      (p.debt > 0 && p.cash > 0 ? '<button class="btn" onclick="KW.sharkRepay()">Repay</button>' : '') +
      '<button class="btn btn-back" onclick="KW.showScreen(\'market\'); KW.renderMarket()">Back</button>' +
    '</div>';
};

// Stash screen
KW.renderStash = function() {
  var el = document.getElementById('stash-content');
  if (!el) return;
  var inv = KW.state.inventory;
  var stash = KW.state.stash;

  var html = '<div class="stash-section"><h3>Inventory (' + KW.getInventorySize() + '/' + KW.state.player.coatSize + ')</h3>';
  var hasInv = false;
  for (var drug in inv) {
    if (inv[drug] > 0) {
      hasInv = true;
      html += '<div class="stash-row"><span class="stash-drug">' + KW.renderDrugName(drug) + '</span>' +
        '<span class="stash-qty">' + inv[drug] + '</span>' +
        '<button class="btn-sm" onclick="KW.storeInStash(\'' + drug + '\')">Store</button></div>';
    }
  }
  if (!hasInv) html += '<div class="empty-msg">Empty</div>';
  html += '</div>';

  html += '<div class="stash-section"><h3>Stash (' + KW.getStashSize() + ')</h3>';
  var hasStash = false;
  for (var s in stash) {
    if (stash[s] > 0) {
      hasStash = true;
      html += '<div class="stash-row"><span class="stash-drug">' + KW.renderDrugName(s) + '</span>' +
        '<span class="stash-qty">' + stash[s] + '</span>' +
        '<button class="btn-sm" onclick="KW.retrieveFromStash(\'' + s + '\')">Take</button></div>';
    }
  }
  if (!hasStash) html += '<div class="empty-msg">Empty</div>';
  html += '</div>';

  html += '<button class="btn btn-back" onclick="KW.showScreen(\'market\'); KW.renderMarket()">Back</button>';
  el.innerHTML = html;
};

// Game over screen
KW.renderGameOver = function() {
  var el = document.getElementById('gameover-content');
  if (!el) return;
  var p = KW.state.player;
  var worth = KW.getNetWorth();
  var stats = KW.state.stats;

  var html =
    '<div class="gameover-title">GAME OVER</div>' +
    '<div class="gameover-worth">' + KW.formatMoney(worth) + '</div>' +
    '<div class="gameover-stats">' +
      '<div>Days survived: ' + Math.min(p.day, KW.MAX_DAYS) + '</div>' +
      '<div>Total bought: ' + KW.formatMoney(stats.totalBought) + '</div>' +
      '<div>Total sold: ' + KW.formatMoney(stats.totalSold) + '</div>' +
      '<div>Arrests: ' + stats.arrests + '</div>' +
      '<div>Muggings: ' + stats.muggings + '</div>' +
      '<div>Blade fights: ' + stats.fights + '</div>' +
    '</div>' +
    '<div class="gameover-save">' +
      '<input type="text" id="score-name" placeholder="Enter your name" maxlength="20" class="name-input" />' +
      '<button class="btn" onclick="KW.submitScore()">Save Score</button>' +
    '</div>' +
    '<button class="btn" onclick="KW.backToTitle()">Main Menu</button>';
  el.innerHTML = html;
};
