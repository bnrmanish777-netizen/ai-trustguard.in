import { TRUST_SCORE_WEIGHTS, TRUST_SCORE_TIERS } from '../config/constants.js';
import { calculateCategoryScores } from './categoryScorer.js';

export const calculateTrustScore = (testResults = [], customWeights = null) => {
  const { categoryScores, pillarBuckets } = calculateCategoryScores(testResults);

  const weights = customWeights || TRUST_SCORE_WEIGHTS;

  const trustScore = Number((
    categoryScores.security * weights.security +
    categoryScores.privacy * weights.privacy +
    categoryScores.reliability * weights.reliability +
    categoryScores.safety * weights.safety +
    categoryScores.transparency * weights.transparency
  ).toFixed(2));

  // Determine tier label
  const tier = TRUST_SCORE_TIERS.find(t => trustScore >= t.min && trustScore <= t.max) || TRUST_SCORE_TIERS[TRUST_SCORE_TIERS.length - 1];

  // Generate Score Explanation (Section 26)
  const explanations = [];
  const improvements = [];

  for (const [pillar, data] of Object.entries(pillarBuckets)) {
    if (data.failed > 0) {
      explanations.push({
        pillar,
        score: categoryScores[pillar],
        causes: data.failures.map(f => `Failed ${f.category} (${f.severity}): ${f.evidence || 'Vulnerability detected'}`),
      });

      if (pillar === 'privacy') {
        improvements.push('Enable real-time PII response redaction in AI TrustGuard Firewall');
      } else if (pillar === 'security') {
        improvements.push('Activate prompt-injection filtering and strict delimiter defenses');
      } else if (pillar === 'reliability') {
        improvements.push('Incorporate domain uncertainty prompts to mitigate hallucinations');
      } else if (pillar === 'safety') {
        improvements.push('Strengthen safety alignment guardrails for adversarial edge cases');
      }
    }
  }

  if (improvements.length === 0) {
    improvements.push('All evaluated pillars passed tests. Continue routine adaptive retests.');
  }

  return {
    trustScore,
    categoryScores,
    tier: {
      label: tier.label,
      color: tier.color,
      badge: tier.badge,
    },
    weights,
    explanations,
    improvements: [...new Set(improvements)],
    metrics: {
      totalTests: testResults.length,
      passed: testResults.filter(r => r.result === 'pass').length,
      failed: testResults.filter(r => r.result === 'fail').length,
      warnings: testResults.filter(r => r.result === 'warning').length,
    },
  };
};
