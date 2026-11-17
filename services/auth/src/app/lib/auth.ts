import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { admin, bearer } from 'better-auth/plugins';
import { MongoClient } from 'mongodb';
import { config } from '../config';

const client = new MongoClient(config.mongoUri);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: config.auth.secret,
  baseURL: config.auth.url,
  basePath: '/api/v1/auth',
  emailAndPassword: {
    enabled: true,
    // Disable public registration with email/password.
    // Regular users MUST sign up/login via Social Logins (Google, GitHub, Facebook).
    // Admin accounts are seeded or provisioned exclusively by existing Admins.
    disableSignUp: true,
  },
  socialProviders: {
    google: {
      clientId: config.social.google.clientId,
      clientSecret: config.social.google.clientSecret,
    },
    github: {
      clientId: config.social.github.clientId,
      clientSecret: config.social.github.clientSecret,
    },
    facebook: {
      clientId: config.social.facebook.clientId,
      clientSecret: config.social.facebook.clientSecret,
    },
  },
  plugins: [
    admin({
      defaultRole: 'user',
      adminRoles: ['admin'],
    }),
    bearer(),
  ],
});

export { db, client };
