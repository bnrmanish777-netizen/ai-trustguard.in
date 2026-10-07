import { getPgPool, testPgConnection, isPgConnected } from './pgPool.js';
import { memoryStore } from './memoryStore.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const ensureDemoUserInPg = async () => {
  const pool = getPgPool();
  if (isPgConnected() && pool) {
    try {
      await pool.query(`
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES (
          '00000000-0000-4000-8000-000000000001',
          'SecOps Lead (Demo)',
          'demo@trustguard.ai',
          '$2a$10$dYDE6EaTAckIHkar69UFf.fX2o5UuLgTcbBjXn4kC5g8oPu.War/u',
          'admin'
        ) ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          name = EXCLUDED.name,
          role = EXCLUDED.role;
      `);
      logger.info('Demo SecOps user verified in PostgreSQL.');
    } catch (err) {
      logger.warn('Could not verify demo user in PostgreSQL', { error: err.message });
    }
  }
};

export const syncUsersFromPg = async () => {
  const pool = getPgPool();
  if (isPgConnected() && pool) {
    try {
      const res = await pool.query('SELECT * FROM users');
      for (const row of res.rows) {
        const existing = memoryStore.findOne('users', (u) => u.id === row.id || u.email.toLowerCase() === row.email.toLowerCase());
        if (!existing) {
          memoryStore.insert('users', row);
        } else {
          memoryStore.update('users', (u) => u.id === existing.id, row);
        }
      }
      logger.info('Users hydrated from PostgreSQL pool', { count: res.rows.length });
    } catch (err) {
      logger.warn('Failed to hydrate users from PostgreSQL', { error: err.message });
    }
  }
};

export const initDb = async () => {
  const connected = await testPgConnection();
  if (connected) {
    logger.info('Database initialized with live PostgreSQL pool.');
    await ensureDemoUserInPg();
    await syncUsersFromPg();
  } else {
    logger.info('Database initialized with local resilient MemoryStore (PostgreSQL ready).');
  }
};

// SQL query helper
export const query = async (text, params = []) => {
  const pool = getPgPool();
  if (isPgConnected() && pool) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      logger.error('PostgreSQL query error, attempting local fallback', { query: text, error: err.message });
    }
  }
  // Fallback indicator
  return { rows: [], rowCount: 0 };
};

// Repository abstraction for clean CRUD across both PostgreSQL & MemoryStore
const createRepo = (tableName) => ({
  find: async (filterFn = () => true) => {
    return memoryStore.find(tableName, filterFn);
  },
  findOne: async (filterFn = () => true) => {
    let item = memoryStore.findOne(tableName, filterFn);
    if (!item && tableName === 'users' && isPgConnected()) {
      await syncUsersFromPg();
      item = memoryStore.findOne(tableName, filterFn);
    }
    return item;
  },
  findById: async (id) => {
    let item = memoryStore.findOne(tableName, (item) => item.id === id);
    if (!item && tableName === 'users' && isPgConnected()) {
      await syncUsersFromPg();
      item = memoryStore.findOne(tableName, (item) => item.id === id);
    }
    return item;
  },
  create: async (data) => {
    const record = memoryStore.insert(tableName, data);
    // If PG is connected, also insert asynchronously
    const pool = getPgPool();
    if (isPgConnected() && pool) {
      try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        await pool.query(sql, values);
      } catch (err) {
        logger.debug('PG async mirror insert failed', { table: tableName, error: err.message });
      }
    }
    return record;
  },
  update: async (filterFn, updates) => {
    return memoryStore.update(tableName, filterFn, updates);
  },
  updateById: async (id, updates) => {
    const record = memoryStore.update(tableName, (item) => item.id === id, updates);
    const pool = getPgPool();
    if (isPgConnected() && pool) {
      try {
        const keys = Object.keys(updates);
        const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        const values = [...Object.values(updates), id];
        const sql = `UPDATE ${tableName} SET ${setClause} WHERE id = $${keys.length + 1}`;
        await pool.query(sql, values);
      } catch (err) {
        logger.debug('PG async mirror update failed', { table: tableName, error: err.message });
      }
    }
    return record;
  },
  delete: async (filterFn) => {
    return memoryStore.delete(tableName, filterFn);
  },
  deleteById: async (id) => {
    return memoryStore.delete(tableName, (item) => item.id === id);
  },
});

export const db = {
  users: createRepo('users'),
  aiSystems: createRepo('ai_systems'),
  aiProfiles: createRepo('ai_profiles'),
  riskProfiles: createRepo('risk_profiles'),
  personalizationStrategies: createRepo('personalization_strategies'),
  testCases: createRepo('test_cases'),
  evaluations: createRepo('evaluations'),
  testResults: createRepo('test_results'),
  vulnerabilities: createRepo('vulnerabilities'),
  firewallPolicies: createRepo('firewall_policies'),
  firewallEvents: createRepo('firewall_events'),
  securityIncidents: createRepo('security_incidents'),
  monitoringEvents: createRepo('monitoring_events'),
  trustScoreHistory: createRepo('trust_score_history'),
  trustMemory: createRepo('trust_memory'),
  userFeedback: createRepo('user_feedback'),
  reports: createRepo('reports'),
  raw: { query },
};
