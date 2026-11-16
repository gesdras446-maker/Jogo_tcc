// Client API Service for Database & Leaderboard Integration

export function formatTime(seconds) {
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

export async function apiGetPlayers() {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error('Failed to fetch players');
    const data = await res.json();
    return data.players || [];
  } catch (err) {
    console.warn('[API] Could not fetch players from database:', err.message);
    const local = localStorage.getItem('dungeon_players_list');
    return local ? JSON.parse(local) : [];
  }
}

export async function apiRegisterPlayer(name) {
  const cleanName = (name || 'Aventureiro').trim();
  try {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: cleanName }),
    });
    if (!res.ok) throw new Error('Failed to register player');
    const data = await res.json();
    return data.player;
  } catch (err) {
    console.warn('[API] Fallback local player register:', err.message);
    const key = `dungeon_player_${cleanName.toLowerCase()}_endings`;
    const stored = localStorage.getItem(key);
    const endings = stored ? JSON.parse(stored) : [];
    return { name: cleanName, endings };
  }
}

export async function apiGetPlayerEndings(name) {
  const cleanName = (name || 'Aventureiro').trim();
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/endings`);
    if (!res.ok) throw new Error('Failed to fetch endings');
    const data = await res.json();
    return data.endings || [];
  } catch (err) {
    console.warn('[API] Fallback local player endings:', err.message);
    const key = `dungeon_player_${cleanName.toLowerCase()}_endings`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }
}

export async function apiUnlockEnding(name, endingId) {
  const cleanName = (name || 'Aventureiro').trim();
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/endings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endingId }),
    });
    if (!res.ok) throw new Error('Failed to unlock ending on database');
    const data = await res.json();
    // Cache locally as backup
    localStorage.setItem(`dungeon_player_${cleanName.toLowerCase()}_endings`, JSON.stringify(data.endings));
    return data.endings;
  } catch (err) {
    console.warn('[API] Fallback local unlock ending:', err.message);
    const key = `dungeon_player_${cleanName.toLowerCase()}_endings`;
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];
    if (!list.includes(endingId)) {
      list.push(endingId);
      localStorage.setItem(key, JSON.stringify(list));
    }
    return list;
  }
}

export async function apiSaveLeaderboardRun({ playerName, timeSeconds, endingId, endingName }) {
  const cleanName = (playerName || 'Aventureiro').trim();
  const formattedTime = formatTime(timeSeconds);

  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playerName: cleanName,
        timeSeconds,
        formattedTime,
        endingId,
        endingName,
      }),
    });
    if (!res.ok) throw new Error('Failed to save leaderboard run');
    const data = await res.json();
    return data.entry;
  } catch (err) {
    console.warn('[API] Fallback local leaderboard run:', err.message);
    // Local fallback
    const key = 'dungeon_local_leaderboard';
    const stored = localStorage.getItem(key);
    const runs = stored ? JSON.parse(stored) : [];
    const newRun = {
      playerName: cleanName,
      timeSeconds,
      formattedTime,
      endingId,
      endingName,
      createdAt: new Date().toISOString(),
    };
    runs.push(newRun);
    runs.sort((a, b) => a.timeSeconds - b.timeSeconds);
    localStorage.setItem(key, JSON.stringify(runs));
    const rank = runs.findIndex((r) => r === newRun) + 1;
    return { ...newRun, rank, isPersonalBest: true };
  }
}

export async function apiGetLeaderboard(endingId = null) {
  try {
    const url = endingId ? `/api/leaderboard?endingId=${endingId}` : '/api/leaderboard';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    return data.leaderboard || [];
  } catch (err) {
    console.warn('[API] Fallback local leaderboard fetch:', err.message);
    const key = 'dungeon_local_leaderboard';
    const stored = localStorage.getItem(key);
    let runs = stored ? JSON.parse(stored) : [];
    if (endingId) {
      runs = runs.filter((r) => r.endingId === Number(endingId));
    }
    return runs.map((r, i) => ({ ...r, rank: i + 1 }));
  }
}

