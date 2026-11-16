import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DB_PATH = path.resolve(__dirname, '..', 'game_database.sqlite');

let dbInstance = null;

export function initDatabase(customPath = null) {
  if (dbInstance) return dbInstance;

  const dbPath = customPath || DEFAULT_DB_PATH;
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL COLLATE NOCASE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS player_endings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL COLLATE NOCASE,
      ending_id INTEGER NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(player_name, ending_id)
    );

    CREATE TABLE IF NOT EXISTS leaderboard (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_name TEXT NOT NULL COLLATE NOCASE,
      time_seconds REAL NOT NULL,
      formatted_time TEXT NOT NULL,
      ending_id INTEGER NOT NULL,
      ending_name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leaderboard_time ON leaderboard(time_seconds ASC);
    CREATE INDEX IF NOT EXISTS idx_player_endings ON player_endings(player_name);
  `);

  dbInstance = db;
  return dbInstance;
}

export function sanitizePlayerName(name) {
  if (!name || typeof name !== 'string') return 'Aventureiro';
  const clean = name.trim().slice(0, 30);
  return clean.length > 0 ? clean : 'Aventureiro';
}

export function getPlayers() {
  const db = initDatabase();
  const stmt = db.prepare(`
    SELECT p.name, p.created_at,
           COUNT(pe.ending_id) AS endings_count
    FROM players p
    LEFT JOIN player_endings pe ON p.name = pe.player_name
    GROUP BY p.name
    ORDER BY p.name ASC
  `);
  return stmt.all();
}

export function registerOrGetPlayer(name) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);

  const insert = db.prepare('INSERT OR IGNORE INTO players (name) VALUES (?)');
  insert.run(cleanName);

  const playerStmt = db.prepare('SELECT id, name, created_at FROM players WHERE name = ? COLLATE NOCASE');
  const player = playerStmt.get(cleanName);

  const endings = getPlayerEndings(cleanName);
  return { ...player, endings };
}

export function getPlayerEndings(name) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);
  const stmt = db.prepare('SELECT ending_id FROM player_endings WHERE player_name = ? COLLATE NOCASE ORDER BY ending_id ASC');
  const rows = stmt.all(cleanName);
  return rows.map((r) => r.ending_id);
}

export function unlockPlayerEnding(name, endingId) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);
  registerOrGetPlayer(cleanName);

  const stmt = db.prepare('INSERT OR IGNORE INTO player_endings (player_name, ending_id) VALUES (?, ?)');
  stmt.run(cleanName, Number(endingId));

  return getPlayerEndings(cleanName);
}

export function addLeaderboardEntry({ playerName, timeSeconds, formattedTime, endingId, endingName }) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(playerName);
  registerOrGetPlayer(cleanName);

  const sec = parseFloat(timeSeconds);
  const fmt = formattedTime || formatDuration(sec);
  const endId = parseInt(endingId, 10) || 4;
  const endName = endingName || (endId === 3 ? 'Final #3: Meia-Volta' : 'Final #4: Cthulhu');

  // Insert entry
  const insert = db.prepare(`
    INSERT INTO leaderboard (player_name, time_seconds, formatted_time, ending_id, ending_name)
    VALUES (?, ?, ?, ?, ?)
  `);
  insert.run(cleanName, sec, fmt, endId, endName);

  // Calculate rank
  const rankStmt = db.prepare(`
    SELECT COUNT(*) as rank_ahead
    FROM leaderboard
    WHERE time_seconds < ?
  `);
  const rankRes = rankStmt.get(sec);
  const rank = (rankRes ? rankRes.rank_ahead : 0) + 1;

  // Check if this is the player's best run
  const bestStmt = db.prepare(`
    SELECT MIN(time_seconds) as min_time
    FROM leaderboard
    WHERE player_name = ? COLLATE NOCASE
  `);
  const bestRes = bestStmt.get(cleanName);
  const isPersonalBest = bestRes && bestRes.min_time >= sec;

  return {
    playerName: cleanName,
    timeSeconds: sec,
    formattedTime: fmt,
    endingId: endId,
    endingName: endName,
    rank,
    isPersonalBest,
  };
}

export function getLeaderboard(endingId = null, limit = 50) {
  const db = initDatabase();
  let query = `
    SELECT id, player_name, time_seconds, formatted_time, ending_id, ending_name, created_at
    FROM leaderboard
  `;
  const params = [];

  if (endingId !== null && endingId !== undefined && endingId !== '' && endingId !== 'all') {
    query += ` WHERE ending_id = ? `;
    params.push(Number(endingId));
  }

  query += ` ORDER BY time_seconds ASC LIMIT ? `;
  params.push(parseInt(limit, 10) || 50);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  return rows.map((row, index) => ({
    rank: index + 1,
    id: row.id,
    playerName: row.player_name,
    timeSeconds: row.time_seconds,
    formattedTime: row.formatted_time,
    endingId: row.ending_id,
    endingName: row.ending_name,
    createdAt: row.created_at,
  }));
}

export function getPlayerBest(name) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);
  const stmt = db.prepare(`
    SELECT id, time_seconds, formatted_time, ending_id, ending_name, created_at
    FROM leaderboard
    WHERE player_name = ? COLLATE NOCASE
    ORDER BY time_seconds ASC
    LIMIT 1
  `);
  return stmt.get(cleanName) || null;
}

export function formatDuration(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00.00';
  const totalMs = Math.floor(seconds * 1000);
  const mins = Math.floor(totalMs / 60000);
  const secs = Math.floor((totalMs % 60000) / 1000);
  const hundredths = Math.floor((totalMs % 1000) / 10);
  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const hh = String(hundredths).padStart(2, '0');
  return `${mm}:${ss}.${hh}`;
}

