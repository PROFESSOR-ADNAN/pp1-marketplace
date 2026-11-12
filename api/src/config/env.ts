import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/souq_marketplace?replicaSet=rs0',
  redisUri: process.env.REDIS_URI || 'redis://localhost:6379',
  apiBaseUrl: process.env.API_BASE_URL 
    || (process.env.NODE_ENV === 'production' ? 'https://souq-api-xxdp.onrender.com' : 'http://localhost:5000'),
  clientUrl: process.env.CLIENT_URL 
    || (process.env.NODE_ENV === 'production' ? 'https://souq-web.vercel.app' : 'http://localhost:5173'),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_minimum_32_chars_ok',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_minimum_32_chars_ok',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret_minimum_32_chars_ok',
  chapa: {
    secretKey: process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-mock',
    publicKey: process.env.CHAPA_PUBLIC_KEY || 'CHAPUBK_TEST-mock',
    webhookSecret: process.env.CHAPA_WEBHOOK_SECRET || 'dev_webhook_hmac_secret',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    bucket: process.env.S3_BUCKET || 'souq-media',
    accessKey: process.env.S3_ACCESS_KEY || 'souq_dev_access',
    secretKey: process.env.S3_SECRET_KEY || 'souq_dev_secret_key_12345',
    publicUrl: process.env.S3_PUBLIC_URL || 'http://localhost:9000/souq-media',
  },
  afromessage: {
    token: process.env.AFROMESSAGE_API_TOKEN || '',
    sender: process.env.AFROMESSAGE_SENDER_NAME || 'SOUQ',
    identifierId: process.env.AFROMESSAGE_IDENTIFIER_ID || '',
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.GMAIL_USER || process.env.SMTP_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || process.env.GMAIL_USER || 'SOUQ Marketplace <no-reply@souq.com>',
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'SOUQ <no-reply@souq.example.com>',
  },
};
