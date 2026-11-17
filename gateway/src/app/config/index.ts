import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    chat: process.env.CHAT_SERVICE_URL || 'http://localhost:4002',
    agents: process.env.AGENTS_SERVICE_URL || 'http://localhost:4003',
    billing: process.env.BILLING_SERVICE_URL || 'http://localhost:4004',
  },
};
