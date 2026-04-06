// KissaWars - Leaderboard
window.KW = window.KW || {};

KW.MAX_LEADERBOARD = 20;

KW.getLeaderboard = function() {
  try {
    var data = localStorage.getItem(KW.LEADERBOARD_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};

KW.saveToLeaderboard = function(name, score, stats) {
  var board = KW.getLeaderboard();
  board.push({
    name: name || 'Anonymous',
    score: score,
    date: new Date().toISOString().split('T')[0],
    stats: stats || {},
  });
  board.sort(function(a, b) { return b.score - a.score; });
  board = board.slice(0, KW.MAX_LEADERBOARD);
  try {
    localStorage.setItem(KW.LEADERBOARD_KEY, JSON.stringify(board));
  } catch (e) {}
  return board;
};

KW.clearLeaderboard = function() {
  localStorage.removeItem(KW.LEADERBOARD_KEY);
};

KW.renderLeaderboard = function() {
  var board = KW.getLeaderboard();
  var el = document.getElementById('leaderboard-list');
  if (!el) return;

  if (board.length === 0) {
    el.innerHTML = '<div class="empty-msg">No high scores yet. Go make some money!</div>';
    return;
  }

  var html = '<table class="lb-table"><thead><tr>' +
    '<th>#</th><th>Name</th><th>Score</th><th>Date</th>' +
    '</tr></thead><tbody>';
  for (var i = 0; i < board.length; i++) {
    var entry = board[i];
    var cls = i < 3 ? ' class="top-' + (i + 1) + '"' : '';
    html += '<tr' + cls + '><td>' + (i + 1) + '</td>' +
      '<td>' + KW.escapeHtml(entry.name) + '</td>' +
      '<td>' + KW.formatMoney(entry.score) + '</td>' +
      '<td>' + entry.date + '</td></tr>';
  }
  html += '</tbody></table>';
  el.innerHTML = html;
};

KW.escapeHtml = function(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};
