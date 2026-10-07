import { test, describe } from 'node:test';
import assert from 'node:assert';
import { env } from '../src/config/env.js';

describe('Environment Configuration Tests', () => {
  test('.env is loaded with all required keys defined', () => {
    assert.strictEqual(typeof env.PORT, 'number');
    assert.strictEqual(env.PORT, 5000);
    assert.strictEqual(typeof env.NODE_ENV, 'string');
    assert.strictEqual(typeof env.JWT_SECRET, 'string');
    assert.ok(env.JWT_SECRET.length >= 32, 'JWT_SECRET must be at least 32 characters long');
    assert.strictEqual(env.JWT_EXPIRES_IN, '7d');
    assert.strictEqual(env.FRONTEND_URL, 'http://localhost:5173');
    
    // Check optional credentials exist as properties
    assert.ok('DATABASE_URL' in env);
    assert.ok('SUPABASE_URL' in env);
    assert.ok('SUPABASE_ANON_KEY' in env);
    assert.ok('GEMINI_API_KEY' in env);
  });
});
