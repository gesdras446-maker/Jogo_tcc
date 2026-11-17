import {
  getPlayers,
  registerOrGetPlayer,
  getPlayerEndings,
  unlockPlayerEnding,
  savePlayerProgress,
  getPlayerProgress,
  deletePlayerProgress,
} from './db.js';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

export async function handleApiRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return true;
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;

  if (!pathname.startsWith('/api')) {
    return false;
  }

  try {
    // Health check
    if (pathname === '/api/health') {
      sendJson(res, 200, { status: 'ok', serverTime: new Date().toISOString() });
      return true;
    }

    // GET /api/players
    if (pathname === '/api/players' && req.method === 'GET') {
      const players = getPlayers();
      sendJson(res, 200, { success: true, players });
      return true;
    }

    // POST /api/players
    if (pathname === '/api/players' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const name = body.name || 'Aventureiro';
      const player = registerOrGetPlayer(name);
      sendJson(res, 200, { success: true, player });
      return true;
    }

    // Match /api/players/:name/endings
    const endingsMatch = pathname.match(/^\/api\/players\/([^/]+)\/endings\/?$/);
    if (endingsMatch) {
      const playerName = decodeURIComponent(endingsMatch[1]);

      if (req.method === 'GET') {
        const endings = getPlayerEndings(playerName);
        sendJson(res, 200, { success: true, playerName, endings });
        return true;
      }

      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const endingId = body.endingId;
        if (!endingId) {
          sendJson(res, 400, { success: false, error: 'endingId is required' });
          return true;
        }
        const endings = unlockPlayerEnding(playerName, endingId);
        sendJson(res, 200, { success: true, playerName, endings });
        return true;
      }
    }

    // Match /api/players/:name/save
    const saveMatch = pathname.match(/^\/api\/players\/([^/]+)\/save\/?$/);
    if (saveMatch) {
      const playerName = decodeURIComponent(saveMatch[1]);

      if (req.method === 'GET') {
        const progress = getPlayerProgress(playerName);
        sendJson(res, 200, { success: true, playerName, save: progress });
        return true;
      }

      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        if (!body.saveData) {
          sendJson(res, 400, { success: false, error: 'saveData is required' });
          return true;
        }
        savePlayerProgress(playerName, body.saveData);
        sendJson(res, 200, { success: true, playerName });
        return true;
      }

      if (req.method === 'DELETE') {
        deletePlayerProgress(playerName);
        sendJson(res, 200, { success: true, playerName });
        return true;
      }
    }

    // Unknown api endpoint
    sendJson(res, 404, { success: false, error: 'API endpoint not found' });
    return true;
  } catch (err) {
    console.error('[API Error]:', err);
    sendJson(res, 500, { success: false, error: err.message });
    return true;
  }
}
