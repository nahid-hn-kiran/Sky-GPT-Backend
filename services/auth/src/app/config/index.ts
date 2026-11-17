import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const config = {
  port: Number(process.env.PORT) || 4001,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/skygpt_auth',
  auth: {
    secret: process.env.BETTER_AUTH_SECRET || 'super_secret_dummy_auth_key_at_least_32_chars_long_12345',
    url: process.env.BETTER_AUTH_URL || 'http://localhost:4000/api/v1/auth',
  },
  social: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    },
  },
  seedAdmin: {
    email: process.env.INITIAL_ADMIN_EMAIL || 'admin@skygpt.com',
    password: process.env.INITIAL_ADMIN_PASSWORD || 'AdminSecurePassword123!',
    name: process.env.INITIAL_ADMIN_NAME || 'Super Admin',
  },
};
