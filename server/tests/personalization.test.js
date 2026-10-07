import { test, describe } from 'node:test';
import assert from 'node:assert';
import { generateRiskProfile } from '../src/personalization/riskProfileGenerator.js';
import { calculatePersonalizationConfidence } from '../src/personalization/confidenceCalculator.js';
import { generatePersonalizedStrategy, explainTestSelection } from '../src/personalization/personalizationEngine.js';
import { determineAdaptiveEscalation } from '../src/personalization/adaptiveEscalation.js';

describe('Phase 3: Personalization Engine & Adaptive Planning Tests', () => {
  test('Risk Profile differentiates customer support vs finance vs coding AI', () => {
    // Customer Support AI (High sensitivity, Low tolerance, E-commerce)
    const supportProfile = {
      purpose: 'Customer Support and order inquiry',
      industry: 'E-commerce & Retail',
      data_sensitivity: 'High',
      risk_tolerance: 'Low',
    };
    const supportRisk = generateRiskProfile({ aiProfile: supportProfile });
    assert.ok(supportRisk.privacy_risk >= 75, 'Privacy risk should be high for support handling customer info');
    assert.ok(supportRisk.recommended_test_categories.includes('pii_leakage'));

    // Coding Assistant (Medium sensitivity, Medium tolerance, Software)
    const codingProfile = {
      purpose: 'Software code copilot',
      industry: 'Software & Technology',
      data_sensitivity: 'Medium',
      risk_tolerance: 'Medium',
    };
    const codingRisk = generateRiskProfile({ aiProfile: codingProfile });
    assert.ok(codingRisk.security_risk >= 70, 'Security risk should be prioritized for coding assistants');
    assert.ok(codingRisk.recommended_test_categories.includes('sensitive_data'));
  });

  test('Personalization Confidence reflects signal completeness', () => {
    const fullProfile = {
      purpose: 'Enterprise billing support assistant for customer queries',
      industry: 'Financial Technology',
      data_sensitivity: 'High',
    };
    const result = calculatePersonalizationConfidence({
      aiProfile: fullProfile,
      evaluationCount: 2,
      vulnerabilitiesCount: 3,
      firewallEventsCount: 15,
      feedbackCount: 1,
    });

    assert.ok(result.confidenceScore >= 90, 'Full signals should produce high confidence (90%+)');
    assert.strictEqual(result.presentSignalsCount, 7);

    // Partial signals
    const partialResult = calculatePersonalizationConfidence({
      aiProfile: { purpose: 'Just a bot' },
      evaluationCount: 0,
      vulnerabilitiesCount: 0,
      firewallEventsCount: 0,
      feedbackCount: 0,
    });
    assert.ok(partialResult.confidenceScore < 70, 'Missing signals should reflect lower confidence');
  });

  test('Personalization Engine incorporates feedback and unresolved vulnerabilities', () => {
    const aiProfile = {
      purpose: 'Retail support',
      industry: 'E-commerce',
      data_sensitivity: 'High',
      risk_tolerance: 'Low',
    };
    const vulns = [
      { category: 'prompt_injection', severity: 'critical', status: 'open' },
    ];
    const userFeedback = [
      { prioritized_categories: ['privacy'] },
    ];

    const strategy = generatePersonalizedStrategy({
      aiProfile,
      vulnerabilities: vulns,
      userFeedback,
      persona: 'balanced',
    });

    assert.ok(strategy.priorityCategories.includes('prompt_injection'));
    assert.ok(strategy.priorityCategories.includes('pii_leakage'));
    assert.ok(strategy.privacyWeight >= 0.25);
    assert.ok(strategy.reasoning.length > 0);
  });

  test('Adaptive Escalation determines difficulty based on consecutive passes', () => {
    const passHistory = [
      { category: 'prompt_injection', result: 'pass' },
      { category: 'prompt_injection', result: 'pass' },
      { category: 'prompt_injection', result: 'pass' },
    ];
    const escalated = determineAdaptiveEscalation({ category: 'prompt_injection', recentResults: passHistory });
    assert.strictEqual(escalated.recommendedDifficulty, 'hard');
    assert.ok(escalated.escalationReason.includes('3 consecutive'));

    const failHistory = [
      { category: 'prompt_injection', result: 'fail' },
    ];
    const failureEscalation = determineAdaptiveEscalation({ category: 'prompt_injection', recentResults: failHistory });
    assert.strictEqual(failureEscalation.shouldGenerateRelatedTests, true);
  });

  test('"Why This Test?" explanation generates contextual justification', () => {
    const testCase = { name: 'Synthetic PII Extraction', category: 'pii_leakage' };
    const aiProfile = { data_sensitivity: 'High', industry: 'E-commerce' };
    const vulns = [{ category: 'pii_leakage', status: 'open' }];

    const explanation = explainTestSelection({ testCase, aiProfile, vulnerabilities: vulns });
    assert.strictEqual(explanation.category, 'pii_leakage');
    assert.ok(explanation.explanationSummary.includes('High sensitivity'));
  });
});
