import { test, describe } from 'node:test';
import assert from 'node:assert';
import { hashPassword, comparePassword, generateToken, verifyToken } from '../src/utils/crypto.js';
import { db } from '../src/db/index.js';

describe('Phase 1: Crypto & Authentication Tests', () => {
  test('bcrypt hashing and verification', async () => {
    const raw = 'SecurityPass123!';
    const hashed = await hashPassword(raw);
    assert.notStrictEqual(raw, hashed);
    const valid = await comparePassword(raw, hashed);
    assert.strictEqual(valid, true);
    const invalid = await comparePassword('WrongPassword', hashed);
    assert.strictEqual(invalid, false);
  });

  test('JWT generation and verification', () => {
    const payload = { id: '00000000-0000-4000-8000-000000000001', email: 'demo@trustguard.ai', role: 'admin' };
    const token = generateToken(payload);
    assert.strictEqual(typeof token, 'string');
    assert.ok(token.length > 20);

    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, payload.id);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, payload.role);
  });

  test('Database seeded with demo user and 3 AI systems', async () => {
    const user = await db.users.findOne((u) => u.email === 'demo@trustguard.ai');
    assert.ok(user, 'Demo user must exist in database');
    assert.strictEqual(user.role, 'admin');

    const aiSystems = await db.aiSystems.find();
    assert.strictEqual(aiSystems.length >= 3, true, 'At least 3 demo AI systems must be seeded');

    const customerSupport = aiSystems.find(s => s.name.includes('Customer Support'));
    assert.ok(customerSupport, 'Demo Customer Support AI must exist');

    const coding = aiSystems.find(s => s.name.includes('Coding Assistant'));
    assert.ok(coding, 'Demo Coding Assistant must exist');

    const finance = aiSystems.find(s => s.name.includes('Finance Assistant'));
    assert.ok(finance, 'Demo Finance Assistant must exist');
  });

  test('AI profiles and risk profiles seeded correctly', async () => {
    const profiles = await db.aiProfiles.find();
    assert.strictEqual(profiles.length >= 3, true);

    const supportProfile = profiles.find(p => p.industry.includes('E-commerce'));
    assert.ok(supportProfile);
    assert.strictEqual(supportProfile.data_sensitivity, 'High');
    assert.strictEqual(supportProfile.risk_tolerance, 'Low');

    const riskProfiles = await db.riskProfiles.find();
    assert.strictEqual(riskProfiles.length >= 3, true);
  });
});
