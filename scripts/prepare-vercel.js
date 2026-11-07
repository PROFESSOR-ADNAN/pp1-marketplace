import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const webDistDir = path.join(rootDir, 'web', 'dist');

if (!fs.existsSync(webDistDir)) {
  fs.mkdirSync(webDistDir, { recursive: true });
}

const serverCode = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../../api/dist/app.js';
import { connectDB } from '../../api/dist/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initiate DB connection (cached for serverless invocations)
connectDB().catch((err) => console.error('[Database] Connection error:', err));

// Serve static frontend assets from web/dist
app.use(express.static(__dirname));

// Client-side SPA routing fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('[SOUQ Full-Stack] Server listening on port ' + PORT);
  });
}

export default app;
`;

const rootServerCode = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './api/dist/app.js';
import { connectDB } from './api/dist/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initiate DB connection
connectDB().catch((err) => console.error('[Database] Connection error:', err));

// Serve static frontend assets from web/dist
app.use(express.static(path.join(__dirname, 'web', 'dist')));

// Client-side SPA routing fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'web', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('[SOUQ Full-Stack] Server listening on port ' + PORT);
  });
}

export default app;
`;

// Write to web/dist/index.js and web/dist/server.js
fs.writeFileSync(path.join(webDistDir, 'index.js'), serverCode, 'utf8');
fs.writeFileSync(path.join(webDistDir, 'server.js'), serverCode, 'utf8');

// Write to root server.js and root index.js
fs.writeFileSync(path.join(rootDir, 'server.js'), rootServerCode, 'utf8');

console.log('[Vercel Build] Successfully generated server entrypoints in web/dist and root.');
