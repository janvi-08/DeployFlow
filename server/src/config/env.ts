import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/deployflow'),
  JWT_SECRET: z.string().min(16).default('deployflow_dev_super_secret_jwt_key_change_in_production_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('deployflow_cookie_signing_secret_key_2026'),
  ADMIN_EMAIL: z.string().email().default('admin@deployflow.io'),
  ADMIN_PASSWORD: z.string().min(8).default('AdminSecurePass123!'),
  ADMIN_NAME: z.string().default('System Administrator'),
  MAX_REQUESTS_PER_MINUTE: z.coerce.number().default(100),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
