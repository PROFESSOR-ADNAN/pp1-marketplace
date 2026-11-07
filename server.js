import express from 'express';
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
