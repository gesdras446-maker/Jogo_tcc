// Client API Service for Database Integration (Players, Endings & Save Game)

function updateLocalPlayerList(name, extra = {}) {
  try {
    const raw = localStorage.getItem('dungeon_players_list');
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
    const idx = list.findIndex((p) => (typeof p === 'string' ? p : p.name).toLowerCase() === name.toLowerCase());
    if (idx >= 0) {
      if (typeof list[idx] === 'object') {
        list[idx] = { ...list[idx], ...extra };
      }
    } else {
      list.push({
        name,
        created_at: new Date().toISOString(),
        endings_count: extra.endings_count || 0,
        has_save: Boolean(extra.has_save),
        act: extra.act || 1,
      });
    }
    localStorage.setItem('dungeon_players_list', JSON.stringify(list));
  } catch (e) {}
}

export async function apiGetPlayers() {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error('Failed to fetch players');
    const data = await res.json();
    if (data.players && Array.isArray(data.players)) {
      localStorage.setItem('dungeon_players_list', JSON.stringify(data.players));
      return data.players;
    }
    return [];
  } catch (err) {
    console.warn('[API] Could not fetch players from database, using local cache:', err.message);
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
    const player = data.player;
    if (player && player.save && player.save.data) {
      localStorage.setItem(`dungeon_save_${cleanName.toLowerCase()}`, JSON.stringify(player.save.data));
    }
    updateLocalPlayerList(cleanName, {
      endings_count: (player && Array.isArray(player.endings)) ? player.endings.length : 0,
      has_save: Boolean(player && player.save),
    });
    return player;
  } catch (err) {
    console.warn('[API] Fallback local player register:', err.message);
    const key = `dungeon_player_${cleanName.toLowerCase()}_endings`;
    const stored = localStorage.getItem(key);
    const endings = stored ? JSON.parse(stored) : [];

    const saveKey = `dungeon_save_${cleanName.toLowerCase()}`;
    const saveStored = localStorage.getItem(saveKey);
    const save = saveStored ? { data: JSON.parse(saveStored) } : null;

    updateLocalPlayerList(cleanName, {
      endings_count: endings.length,
      has_save: Boolean(save),
    });
    return { name: cleanName, endings, save };
  }
}

export async function apiGetPlayerEndings(name) {
  const cleanName = (name || 'Aventureiro').trim();
  const key = `dungeon_player_${cleanName.toLowerCase()}_endings`;
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/endings`);
    if (!res.ok) throw new Error('Failed to fetch endings');
    const data = await res.json();
    const endings = data.endings || [];
    localStorage.setItem(key, JSON.stringify(endings));
    return endings;
  } catch (err) {
    console.warn('[API] Fallback local player endings:', err.message);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }
}

export async function apiUnlockEnding(name, endingId) {
  const cleanName = (name || 'Aventureiro').trim();
  const key = `dungeon_player_${cleanName.toLowerCase()}_endings`;
  const numEnding = Number(endingId);
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/endings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endingId: numEnding }),
    });
    if (!res.ok) throw new Error('Failed to unlock ending on database');
    const data = await res.json();
    const endings = data.endings || [];
    localStorage.setItem(key, JSON.stringify(endings));
    updateLocalPlayerList(cleanName, { endings_count: endings.length });
    return endings;
  } catch (err) {
    console.warn('[API] Fallback local unlock ending:', err.message);
    const stored = localStorage.getItem(key);
    const list = stored ? JSON.parse(stored) : [];
    if (!list.includes(numEnding)) {
      list.push(numEnding);
      localStorage.setItem(key, JSON.stringify(list));
    }
    updateLocalPlayerList(cleanName, { endings_count: list.length });
    return list;
  }
}

export async function apiSavePlayerProgress(name, saveData) {
  const cleanName = (name || 'Aventureiro').trim();
  const playerKey = `dungeon_save_${cleanName.toLowerCase()}`;
  localStorage.setItem(playerKey, JSON.stringify(saveData));
  updateLocalPlayerList(cleanName, {
    has_save: true,
    act: saveData.currentAct || 1,
  });

  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saveData }),
    });
    if (!res.ok) throw new Error('Failed to save progress on database');
    return true;
  } catch (err) {
    console.warn('[API] Fallback local save:', err.message);
    return false;
  }
}

export async function apiGetPlayerProgress(name) {
  const cleanName = (name || 'Aventureiro').trim();
  const playerKey = `dungeon_save_${cleanName.toLowerCase()}`;
  try {
    const res = await fetch(`/api/players/${encodeURIComponent(cleanName)}/save`);
    if (!res.ok) throw new Error('Failed to load progress from database');
    const data = await res.json();
    if (data.save && data.save.data) {
      localStorage.setItem(playerKey, JSON.stringify(data.save.data));
      updateLocalPlayerList(cleanName, {
        has_save: true,
        act: data.save.data.currentAct || 1,
      });
      return data.save.data;
    }
  } catch (err) {
    console.warn('[API] Fallback local get progress:', err.message);
  }
  const stored = localStorage.getItem(playerKey) || localStorage.getItem('dungeon_save');
  return stored ? JSON.parse(stored) : null;
}

export async function apiDeletePlayerProgress(name) {
  const cleanName = (name || 'Aventureiro').trim();
  const playerKey = `dungeon_save_${cleanName.toLowerCase()}`;
  try {
    await fetch(`/api/players/${encodeURIComponent(cleanName)}/save`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('[API] Fallback local delete progress:', err.message);
  }
  localStorage.removeItem(playerKey);
  updateLocalPlayerList(cleanName, { has_save: false });
}
