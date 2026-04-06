require('./setup.js');
const { describe, test, expect, beforeEach } = require('bun:test');

describe('Leaderboard', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('returns empty array when no scores exist', () => {
    expect(KW.getLeaderboard()).toEqual([]);
  });

  test('saves and retrieves a score', () => {
    KW.saveToLeaderboard('Alice', 50000, { fights: 3 });
    var board = KW.getLeaderboard();
    expect(board.length).toBe(1);
    expect(board[0].name).toBe('Alice');
    expect(board[0].score).toBe(50000);
    expect(board[0].stats.fights).toBe(3);
    expect(board[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('sorts scores descending', () => {
    KW.saveToLeaderboard('Low', 1000);
    KW.saveToLeaderboard('High', 99000);
    KW.saveToLeaderboard('Mid', 50000);
    var board = KW.getLeaderboard();
    expect(board[0].name).toBe('High');
    expect(board[1].name).toBe('Mid');
    expect(board[2].name).toBe('Low');
  });

  test('caps at MAX_LEADERBOARD entries', () => {
    for (var i = 0; i < KW.MAX_LEADERBOARD + 5; i++) {
      KW.saveToLeaderboard('Player' + i, i * 1000);
    }
    var board = KW.getLeaderboard();
    expect(board.length).toBe(KW.MAX_LEADERBOARD);
  });

  test('lowest score gets pushed out when board is full', () => {
    for (var i = 0; i < KW.MAX_LEADERBOARD; i++) {
      KW.saveToLeaderboard('P' + i, (i + 1) * 1000);
    }
    KW.saveToLeaderboard('NewHigh', 999999);
    var board = KW.getLeaderboard();
    expect(board[0].name).toBe('NewHigh');
    expect(board.length).toBe(KW.MAX_LEADERBOARD);
  });

  test('clearLeaderboard removes all scores', () => {
    KW.saveToLeaderboard('Test', 5000);
    KW.clearLeaderboard();
    expect(KW.getLeaderboard()).toEqual([]);
  });

  test('uses "Anonymous" for empty name', () => {
    KW.saveToLeaderboard('', 1000);
    var board = KW.getLeaderboard();
    expect(board[0].name).toBe('Anonymous');
  });
});

describe('KW.escapeHtml', () => {
  test('escapes HTML special characters', () => {
    expect(KW.escapeHtml('<script>alert("xss")</script>')).not.toContain('<script>');
  });

  test('leaves plain text unchanged', () => {
    expect(KW.escapeHtml('Hello World')).toBe('Hello World');
  });
});
