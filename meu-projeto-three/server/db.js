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

    CREATE TABLE IF NOT EXISTS player_saves (
      player_name TEXT PRIMARY KEY NOT NULL COLLATE NOCASE,
      save_data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

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
           COUNT(DISTINCT pe.ending_id) AS endings_count,
           CASE WHEN ps.player_name IS NOT NULL THEN 1 ELSE 0 END AS has_save,
           ps.updated_at AS last_save_time,
           ps.save_data
    FROM players p
    LEFT JOIN player_endings pe ON p.name = pe.player_name
    LEFT JOIN player_saves ps ON p.name = ps.player_name
    GROUP BY p.name
    ORDER BY p.name ASC
  `);
  const rows = stmt.all();
  return rows.map((r) => {
    let act = null;
    if (r.save_data) {
      try {
        const parsed = JSON.parse(r.save_data);
        act = parsed.currentAct || 1;
      } catch (e) {}
    }
    return {
      name: r.name,
      created_at: r.created_at,
      endings_count: r.endings_count,
      has_save: Boolean(r.has_save),
      act,
      last_save_time: r.last_save_time,
    };
  });
}

export function registerOrGetPlayer(name) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);

  const insert = db.prepare('INSERT OR IGNORE INTO players (name) VALUES (?)');
  insert.run(cleanName);

  const playerStmt = db.prepare('SELECT id, name, created_at FROM players WHERE name = ? COLLATE NOCASE');
  const player = playerStmt.get(cleanName);

  const endings = getPlayerEndings(cleanName);
  const save = getPlayerProgress(cleanName);
  return { ...player, endings, save };
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

export function savePlayerProgress(name, saveData) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);
  registerOrGetPlayer(cleanName);

  const jsonStr = typeof saveData === 'string' ? saveData : JSON.stringify(saveData);

  const stmt = db.prepare(`
    INSERT INTO player_saves (player_name, save_data, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(player_name) DO UPDATE SET
      save_data = excluded.save_data,
      updated_at = CURRENT_TIMESTAMP
  `);
  stmt.run(cleanName, jsonStr);

  return { success: true, playerName: cleanName };
}

export function getPlayerProgress(name) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);
  const stmt = db.prepare('SELECT save_data, updated_at FROM player_saves WHERE player_name = ? COLLATE NOCASE');
  const row = stmt.get(cleanName);
  if (!row) return null;
  try {
    const data = JSON.parse(row.save_data);
    return { data, updatedAt: row.updated_at };
  } catch (e) {
    return null;
  }
}

export function deletePlayerProgress(name) {
  const db = initDatabase();
  const cleanName = sanitizePlayerName(name);
  const stmt = db.prepare('DELETE FROM player_saves WHERE player_name = ? COLLATE NOCASE');
  stmt.run(cleanName);
  return { success: true };
}
