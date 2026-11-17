// Client API Service for Database Integration (Players, Endings & Save Game)

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
    // Cache locally
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

export async function apiSavePlayerProgress(name, saveData) {
  const cleanName = (name || 'Aventureiro').trim();
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saveData }),
    });
    if (!res.ok) throw new Error('Failed to save progress on database');
    // Cache locally under player-specific key
    localStorage.setItem(`dungeon_save_${cleanName.toLowerCase()}`, JSON.stringify(saveData));
    return true;
  } catch (err) {
    console.warn('[API] Fallback local save:', err.message);
    localStorage.setItem(`dungeon_save_${cleanName.toLowerCase()}`, JSON.stringify(saveData));
    return false;
  }
}

export async function apiGetPlayerProgress(name) {
  const cleanName = (name || 'Aventureiro').trim();
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/save`);
    if (!res.ok) throw new Error('Failed to load progress from database');
    const data = await res.json();
    if (data.save && data.save.data) {
      localStorage.setItem(`dungeon_save_${cleanName.toLowerCase()}`, JSON.stringify(data.save.data));
      return data.save.data;
    }
    return null;
  } catch (err) {
    console.warn('[API] Fallback local get progress:', err.message);
    const stored = localStorage.getItem(`dungeon_save_${cleanName.toLowerCase()}`);
    return stored ? JSON.parse(stored) : null;
  }
}

export async function apiDeletePlayerProgress(name) {
  const cleanName = (name || 'Aventureiro').trim();
  try {
    await fetch(`/api/players/${encodeURIComponent(cleanName)}/save`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[API] Fallback local delete progress:', err.message);
  }
  localStorage.removeItem(`dungeon_save_${cleanName.toLowerCase()}`);
}
