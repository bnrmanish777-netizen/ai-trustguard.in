import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

let pool = null;
let isConnected = false;

if (env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
    });
  } catch (err) {
    logger.warn('Failed to initialize PostgreSQL pool from DATABASE_URL', { error: err.message });
  }
}

export const getPgPool = () => pool;

export const testPgConnection = async () => {
  if (!pool) return false;
  try {
    const res = await pool.query('SELECT NOW()');
    isConnected = !!res.rows[0];
    logger.info('Connected to PostgreSQL database successfully', { time: res.rows[0].now });
    return true;
  } catch (err) {
    logger.warn('PostgreSQL connection test failed. Will use memory fallback if available.', { error: err.message });
    isConnected = false;
    return false;
  }
};

export const isPgConnected = () => isConnected;
