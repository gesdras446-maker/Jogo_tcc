import {
  getPlayers,
  registerOrGetPlayer,
  getPlayerEndings,
  unlockPlayerEnding,
  addLeaderboardEntry,
  getLeaderboard,
  getPlayerBest,
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(payload));
}

export async function handleApiRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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

    // Match /api/leaderboard/player/:name
    const playerBestMatch = pathname.match(/^\/api\/leaderboard\/player\/([^/]+)\/?$/);
    if (playerBestMatch && req.method === 'GET') {
      const playerName = decodeURIComponent(playerBestMatch[1]);
      const best = getPlayerBest(playerName);
      sendJson(res, 200, { success: true, playerName, best });
      return true;
    }

    // GET /api/leaderboard
    if (pathname === '/api/leaderboard' && req.method === 'GET') {
      const endingId = urlObj.searchParams.get('endingId');
      const limit = urlObj.searchParams.get('limit') || 50;
      const leaderboard = getLeaderboard(endingId, limit);
      sendJson(res, 200, { success: true, leaderboard });
      return true;
    }

    // POST /api/leaderboard
    if (pathname === '/api/leaderboard' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (!body.playerName || body.timeSeconds === undefined) {
        sendJson(res, 400, { success: false, error: 'playerName and timeSeconds are required' });
        return true;
      }

      const result = addLeaderboardEntry({
        playerName: body.playerName,
        timeSeconds: body.timeSeconds,
        formattedTime: body.formattedTime,
        endingId: body.endingId,
        endingName: body.endingName,
      });

      // Also unlock the ending for that player if not unlocked
      if (body.endingId) {
        unlockPlayerEnding(body.playerName, body.endingId);
      }

      sendJson(res, 201, { success: true, entry: result });
      return true;
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

