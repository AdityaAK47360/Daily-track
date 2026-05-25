const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 8000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const DEFAULT_PLAN = {
  Monday: ['Wake up at 8:00 AM', '8:30 - 11:00 Product Management Videos', '12:00 - 1:00 MTL101', '3:00 - 6:00 AI Agents & Automation Videos', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
  Tuesday: ['8:00 - 10:00 MTL101', '11:00 - 12:00 Cold Mailing', '3:00 - 6:00 AI Agents & Automation', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
  Wednesday: ['8:00 - 10:00 MTL101', '12:00 - 1:00 Product Management', '3:00 - 6:00 AI Agentic Automation', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
  Thursday: ['9:00 - 12:00 Product Management Videos', '2:30 - 6:00 AI Agents Automation Videos', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
  Friday: ['9:00 - 12:00 Product Management Videos', '2:30 - 6:00 AI Agents Automation Videos', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
  Saturday: ['9:00 - 12:00 Product Management Videos', '2:30 - 6:00 AI Agents Automation Videos', '6:00 - 7:30 Gym', 'Dinner Break', 'Saudafy + Moj Masti Work', 'Sleep before 2:00 AM'],
  Sunday: ['OFF DAY ☕']
};

ensureStorage();
const sessions = new Map();

function ensureStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: {} }, null, 2));
  }
}

function loadUsers() {
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.users || {};
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

function createToken(username) {
  const token = crypto.randomUUID();
  sessions.set(token, { username, expiresAt: Date.now() + TOKEN_TTL_MS });
  return token;
}

function getSession(token) {
  const session = sessions.get(token);
  if (!session) {
    return null;
  }
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
}

function normalizePlan(plan) {
  if (!plan || typeof plan !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_PLAN));
  }

  return Object.fromEntries(Object.entries(plan).map(([day, tasks]) => {
    if (!Array.isArray(tasks)) {
      return [day, []];
    }

    return [day, tasks.map((task) => {
      if (typeof task === 'string') {
        return { id: crypto.randomUUID(), text: task, completed: false };
      }

      return {
        id: task.id || crypto.randomUUID(),
        text: typeof task.text === 'string' ? task.text : '',
        completed: !!task.completed
      };
    })];
  }));
}

function sanitizeUserRecord(record) {
  if (!record || typeof record !== 'object') {
    return {
      plan: JSON.parse(JSON.stringify(DEFAULT_PLAN)),
      notes: {}
    };
  }

  return {
    plan: normalizePlan(record.plan),
    notes: record.notes && typeof record.notes === 'object' ? record.notes : {}
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  switch (ext) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.js':
      return 'application/javascript; charset=utf-8';
    default:
      return 'application/octet-stream';
  }
}

function serveStaticFile(res, filePath) {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    res.end(data);
  });
}

function getBasePath(url) {
  if (url === '/' || url === '/index.html') {
    return path.join(__dirname, 'index.html');
  }

  const cleanUrl = url.split('?')[0];
  const normalized = cleanUrl.startsWith('/') ? cleanUrl.slice(1) : cleanUrl;
  return path.join(__dirname, normalized);
}

function isApiPath(url) {
  return url.startsWith('/api/');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (isApiPath(url.pathname)) {
    try {
      if (req.method === 'GET' && url.pathname === '/api/health') {
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/signup') {
        const body = await readBody(req);
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';

        if (!username || !password) {
          sendJson(res, 400, { error: 'Username and password are required.' });
          return;
        }

        const users = loadUsers();
        if (users[username]) {
          sendJson(res, 409, { error: 'Username already exists.' });
          return;
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = hashPassword(password, salt);
        users[username] = {
          salt,
          passwordHash,
          plan: JSON.parse(JSON.stringify(DEFAULT_PLAN)),
          notes: {}
        };
        saveUsers(users);

        const token = createToken(username);
        sendJson(res, 201, {
          token,
          user: username,
          plan: users[username].plan,
          notes: users[username].notes
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/login') {
        const body = await readBody(req);
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';

        if (!username || !password) {
          sendJson(res, 400, { error: 'Username and password are required.' });
          return;
        }

        const users = loadUsers();
        const user = users[username];
        if (!user) {
          sendJson(res, 401, { error: 'Invalid username or password.' });
          return;
        }

        const passwordHash = hashPassword(password, user.salt);
        if (passwordHash !== user.passwordHash) {
          sendJson(res, 401, { error: 'Invalid username or password.' });
          return;
        }

        const token = createToken(username);
        sendJson(res, 200, {
          token,
          user: username,
          plan: user.plan,
          notes: user.notes
        });
        return;
      }

      const authHeader = req.headers.authorization || '';
      const authMatch = authHeader.match(/^Bearer\s+(.+)$/i);
      const token = authMatch ? authMatch[1] : '';
      const session = getSession(token);

      if (!session) {
        sendJson(res, 401, { error: 'Authentication required.' });
        return;
      }

      const users = loadUsers();
      const user = users[session.username];
      if (!user) {
        sendJson(res, 401, { error: 'Authentication required.' });
        return;
      }

      if (req.method === 'GET' && url.pathname === '/api/me') {
        sendJson(res, 200, {
          user: session.username,
          plan: user.plan,
          notes: user.notes
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/save') {
        const body = await readBody(req);
        const planPayload = sanitizeUserRecord({ plan: body.plan }).plan;
        const notesPayload = body.notes && typeof body.notes === 'object' ? body.notes : {};
        user.plan = planPayload;
        user.notes = notesPayload;
        saveUsers(users);
        sendJson(res, 200, { ok: true });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/logout') {
        sessions.delete(token);
        sendJson(res, 200, { ok: true });
        return;
      }

      sendJson(res, 404, { error: 'Not found.' });
    } catch (error) {
      sendJson(res, 400, { error: error.message || 'Request failed.' });
    }

    return;
  }

  const filePath = getBasePath(url.pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveStaticFile(res, filePath);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
