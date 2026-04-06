// Test setup: mock browser globals so game code can load in Node/Bun
globalThis.window = globalThis;
globalThis.document = {
  addEventListener: function() {},
  getElementById: function() { return null; },
  querySelectorAll: function() { return []; },
  createElement: function(tag) {
    var el = { _text: '' };
    Object.defineProperty(el, 'textContent', {
      get: function() { return el._text; },
      set: function(v) { el._text = v; },
    });
    Object.defineProperty(el, 'innerHTML', {
      get: function() {
        return el._text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
    });
    return el;
  },
};
globalThis.localStorage = (function() {
  var store = {};
  return {
    getItem: function(k) { return store[k] || null; },
    setItem: function(k, v) { store[k] = String(v); },
    removeItem: function(k) { delete store[k]; },
    clear: function() { store = {}; },
    _store: store,
  };
})();
globalThis.AudioContext = undefined;
globalThis.webkitAudioContext = undefined;

// Load game files in dependency order
require('../js/data.js');
require('../js/state.js');
require('../js/sound.js');
require('../js/leaderboard.js');
require('../js/events.js');
require('../js/combat.js');
// Skip ui.js and game.js — they wire DOM event handlers on load
