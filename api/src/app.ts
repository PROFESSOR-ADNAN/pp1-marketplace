import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { httpRequestDuration, client } from './utils/metrics.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import categoryRoutes from './routes/category.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import adminRoutes from './routes/admin.routes.js';
import reviewRoutes from './routes/review.routes.js';

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.chapa.co"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Capture raw body for webhook HMAC checks
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(cookieParser());
app.use(globalLimiter);

// Telemetry & metrics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.labels(req.method, req.route?.path || req.path, res.statusCode.toString()).observe(duration);
  });
  next();
});

app.get('/healthz', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/metrics', async (req, res) => {
  res.setHeader('Content-Type', client.register.contentType);
  res.send(await client.register.metrics());
});

// Mount API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', orderRoutes); // Webhook mounted on both payments and orders
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
