import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

// Auto-connect database (with connection pooling)
connectDB().catch((err) => console.error('[Database] Connection error:', err));

const port = process.env.PORT || config.port;

// Only bind listener if not explicitly disabled
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[SOUQ API] Server listening on port ${port} (${config.env})`);
  });
}

export default app;
