import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  if (!env.DATABASE_URL) {
    logger.warn('DATABASE_URL is not configured. MemoryStore is used by default with built-in seed data.');
    process.exit(0);
  }

  const client = new pg.Client({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    logger.info('Connected to PostgreSQL for schema & seed migration.');

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const seedPath = path.join(__dirname, '../../database/seed.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    logger.info('Executing schema.sql...');
    await client.query(schemaSql);
    logger.info('Schema created successfully.');

    const seedSql = fs.readFileSync(seedPath, 'utf8');
    logger.info('Executing seed.sql...');
    await client.query(seedSql);
    logger.info('Seed data inserted successfully.');

    await client.end();
    logger.info('Database migration completed successfully.');
  } catch (err) {
    logger.error('Failed to run migration:', { error: err.message });
    process.exit(1);
  }
}

runSeed();
