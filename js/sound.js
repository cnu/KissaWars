// KissaWars - Web Audio API Procedural Sound
window.KW = window.KW || {};

KW.audioCtx = null;

KW.initAudio = function() {
  if (KW.audioCtx) return;
  try {
    KW.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) {
    console.warn('Web Audio not supported');
  }
};

KW.canPlaySound = function() {
  return KW.audioCtx && KW.getSettings().soundEnabled;
};

KW.playTone = function(freq, duration, type, volume) {
  if (!KW.canPlaySound()) return;
  var ctx = KW.audioCtx;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume || 0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
};

KW.playNoise = function(duration, volume) {
  if (!KW.canPlaySound()) return;
  var ctx = KW.audioCtx;
  var bufferSize = ctx.sampleRate * duration;
  var buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  var source = ctx.createBufferSource();
  source.buffer = buffer;
  var filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
  var gain = ctx.createGain();
  gain.gain.setValueAtTime(volume || 0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
};

// Sound effects
KW.sound = {
  blip: function() {
    KW.playTone(800, 0.05, 'sine', 0.1);
  },
  buy: function() {
    KW.playTone(523, 0.08, 'sine', 0.12);
    setTimeout(function() { KW.playTone(659, 0.08, 'sine', 0.12); }, 80);
    setTimeout(function() { KW.playTone(784, 0.12, 'sine', 0.12); }, 160);
  },
  sell: function() {
    KW.playTone(784, 0.08, 'sine', 0.12);
    setTimeout(function() { KW.playTone(659, 0.08, 'sine', 0.12); }, 80);
    setTimeout(function() { KW.playTone(523, 0.12, 'sine', 0.12); }, 160);
  },
  travel: function() {
    KW.playNoise(0.3, 0.08);
  },
  alert: function() {
    KW.playTone(880, 0.12, 'square', 0.1);
    setTimeout(function() { KW.playTone(660, 0.12, 'square', 0.1); }, 120);
    setTimeout(function() { KW.playTone(440, 0.18, 'square', 0.1); }, 240);
  },
  danger: function() {
    KW.playTone(150, 0.5, 'sawtooth', 0.12);
  },
  win: function() {
    var notes = [523, 587, 659, 784, 1047];
    notes.forEach(function(f, i) {
      setTimeout(function() { KW.playTone(f, 0.15, 'sine', 0.12); }, i * 120);
    });
  },
  lose: function() {
    var notes = [440, 392, 349, 330, 262];
    notes.forEach(function(f, i) {
      setTimeout(function() { KW.playTone(f, 0.15, 'sine', 0.12); }, i * 150);
    });
  },
  click: function() {
    KW.playTone(600, 0.03, 'sine', 0.08);
  },
};
