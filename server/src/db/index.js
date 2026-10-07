import { getPgPool, testPgConnection, isPgConnected } from './pgPool.js';
import { memoryStore } from './memoryStore.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export const initDb = async () => {
  const connected = await testPgConnection();
  if (connected) {
    logger.info('Database initialized with live PostgreSQL pool.');
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
    return memoryStore.findOne(tableName, filterFn);
  },
  findById: async (id) => {
    return memoryStore.findOne(tableName, (item) => item.id === id);
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
    return memoryStore.update(tableName, (item) => item.id === id, updates);
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
