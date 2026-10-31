import { Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import { redisConnection } from '../config/redis.js';

export const startEmailWorker = () => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    secure: false,
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });

  const worker = new Worker(
    'email-notifications',
    async (job) => {
      const { to, subject, html } = job.data;
      console.log(`[Email Worker] Sending email to ${to}: "${subject}"`);

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || 'SOUQ Marketplace <no-reply@souq.example.com>',
        to,
        subject,
        html,
      });
    },
    { connection: redisConnection as any, concurrency: 10 }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Email Worker] Email job ${job?.id} failed:`, err.message);
  });

  return worker;
};
