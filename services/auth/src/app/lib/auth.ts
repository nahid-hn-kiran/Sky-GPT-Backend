import { redis } from "@skygpt/shared/redis";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin, bearer } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { config } from "../config";

const client = new MongoClient(config.mongoUri);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db),
  secret: config.auth.secret,
  baseURL: config.auth.url,
  basePath: "/api/v1/auth",
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:4000",
    "http://127.0.0.1:4000",
  ],
  emailAndPassword: {
    enabled: true,
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
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    bearer(),
  ],
  secondaryStorage: {
    get: async (key: string) => {
      const value = await redis.get(key);
      return value ?? null;
    },
    set: async (key: string, value: string, ttl?: number) => {
      if (ttl) {
        await redis.set(key, value, "EX", ttl);
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key: string) => {
      await redis.del(key);
    },
    getAndDelete: async (key: string) => {
      // Native Redis GETDEL: gets the value and deletes it atomically
      const value = await redis.getdel(key);
      return value ?? null;
    },
    increment: async (key: string, ttl: number) => {
      // Increment the counter by 1
      const count = await redis.incr(key);
      // If this is the first hit in the window, set the expiration TTL
      if (count === 1) {
        await redis.expire(key, ttl);
      }
      return count;
    },
  },
});

export { client, db };
