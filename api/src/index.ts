import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import app from './app.js';

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`[SOUQ API] Server listening on port ${config.port} (${config.env})`);
  });
};

start();
