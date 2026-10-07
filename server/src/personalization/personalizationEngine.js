import { z } from 'zod';
import { generateRiskProfile } from './riskProfileGenerator.js';
import { calculatePersonalizationConfidence } from './confidenceCalculator.js';
import { determineAdaptiveEscalation } from './adaptiveEscalation.js';

export const strategyOutputSchema = z.object({
  securityWeight: z.number(),
  privacyWeight: z.number(),
  reliabilityWeight: z.number(),
  safetyWeight: z.number(),
  transparencyWeight: z.number(),
  priorityCategories: z.array(z.string()),
  recommendedDifficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  recommendedTestsCount: z.number(),
  reasoning: z.array(z.string()),
  confidenceScore: z.number(),
});

export const PERSONA_PRESETS = {
  balanced: { security: 0.25, privacy: 0.25, reliability: 0.20, safety: 0.20, transparency: 0.10 },
  privacy_first: { security: 0.25, privacy: 0.35, reliability: 0.15, safety: 0.20, transparency: 0.05 },
  security_first: { security: 0.40, privacy: 0.25, reliability: 0.10, safety: 0.20, transparency: 0.05 },
  reliability_first: { security: 0.20, privacy: 0.20, reliability: 0.35, safety: 0.15, transparency: 0.10 },
  safety_first: { security: 0.20, privacy: 0.20, reliability: 0.15, safety: 0.35, transparency: 0.10 },
};

export const generatePersonalizedStrategy = ({
  aiProfile,
  riskProfile,
  evaluationHistory = [],
  vulnerabilities = [],
  firewallEvents = [],
  userFeedback = [],
  persona = 'balanced',
}) => {
  const reasoning = [];

  // 1. Establish Pillar Weights (Persona Preset + Profile Priorities)
  let weights = { ...PERSONA_PRESETS[persona] || PERSONA_PRESETS.balanced };

  // Adjust if feedback prioritized specific categories (Section 19: User Feedback Loop)
  const feedbackPriorities = userFeedback.flatMap(f => f.prioritized_categories || []);
  if (feedbackPriorities.includes('privacy')) {
    weights.privacy = Math.min(0.40, Number((weights.privacy + 0.05).toFixed(2)));
    weights.reliability = Math.max(0.10, Number((weights.reliability - 0.05).toFixed(2)));
    reasoning.push('User feedback requested increased focus on Privacy & Data Protection.');
  }
  if (feedbackPriorities.includes('security')) {
    weights.security = Math.min(0.40, Number((weights.security + 0.05).toFixed(2)));
    weights.safety = Math.max(0.10, Number((weights.safety - 0.05).toFixed(2)));
    reasoning.push('User feedback requested elevated vigilance on Injection & Secret Exfiltration.');
  }

  // 2. Determine Priority Test Categories based on context & history
  const priorityCategories = [];
  const sensitivity = (aiProfile?.data_sensitivity || 'Medium').toLowerCase();
  const industry = (aiProfile?.industry || '').toLowerCase();

  if (sensitivity === 'high' || sensitivity === 'very high' || sensitivity === 'critical') {
    priorityCategories.push('pii_leakage', 'sensitive_data');
    reasoning.push(`AI handles ${aiProfile?.data_sensitivity} sensitivity data, elevating PII and confidential data testing.`);
  }

  if (industry.includes('commerce') || industry.includes('retail') || industry.includes('support')) {
    priorityCategories.push('prompt_injection', 'system_prompt_extraction');
    reasoning.push('Customer support chat interfaces present high exposure to user-driven prompt injection vectors.');
  }

  if (industry.includes('software') || industry.includes('tech') || industry.includes('code')) {
    priorityCategories.push('sensitive_data', 'data_exfiltration', 'prompt_injection');
    reasoning.push('Developer assistant profiles require rigorous checks against token leakage and malicious command execution.');
  }

  if (industry.includes('finance') || industry.includes('banking')) {
    priorityCategories.push('pii_leakage', 'hallucination', 'transparency');
    reasoning.push('Financial compliance mandates strict prohibition of hallucinated commitments and unverified accounts.');
  }

  // Check unresolved vulnerabilities
  const openVulns = vulnerabilities.filter(v => v.status === 'open');
  if (openVulns.some(v => v.category === 'prompt_injection')) {
    if (!priorityCategories.includes('prompt_injection')) priorityCategories.push('prompt_injection');
    reasoning.push('Unresolved prompt injection vulnerability found in previous evaluation.');
  }
  if (openVulns.some(v => v.category === 'pii_leakage')) {
    if (!priorityCategories.includes('pii_leakage')) priorityCategories.push('pii_leakage');
    reasoning.push('Customer PII leakage vulnerability remains unverified / open.');
  }

  // Firewall event influence (Section 31)
  const recentBlocks = firewallEvents.filter(e => e.action === 'block').length;
  if (recentBlocks > 5) {
    if (!priorityCategories.includes('prompt_injection')) priorityCategories.push('prompt_injection');
    reasoning.push(`AI TrustGuard Firewall logged ${recentBlocks} blocked attacks, triggering elevated adversarial testing.`);
  }

  // Deduplicate and fallback
  const uniquePriorityCategories = [...new Set(priorityCategories)];
  if (uniquePriorityCategories.length === 0) {
    uniquePriorityCategories.push('prompt_injection', 'pii_leakage', 'hallucination', 'reliability');
    reasoning.push('Applied baseline multi-pillar test selection.');
  }

  // 3. Recommended Difficulty & Test Count
  let recommendedDifficulty = 'medium';
  if (openVulns.length > 2 || (riskProfile && riskProfile.security_risk > 80)) {
    recommendedDifficulty = 'hard';
    reasoning.push('Elevated risk profile triggers Hard difficulty evaluation plan.');
  }

  const recommendedTestsCount = Math.min(16, Math.max(8, uniquePriorityCategories.length * 3));

  // 4. Calculate Personalization Confidence (Section 18)
  const { confidenceScore } = calculatePersonalizationConfidence({
    aiProfile,
    evaluationCount: evaluationHistory.length,
    vulnerabilitiesCount: vulnerabilities.length,
    firewallEventsCount: firewallEvents.length,
    feedbackCount: userFeedback.length,
  });

  const strategy = {
    securityWeight: weights.security,
    privacyWeight: weights.privacy,
    reliabilityWeight: weights.reliability,
    safetyWeight: weights.safety,
    transparencyWeight: weights.transparency,
    priorityCategories: uniquePriorityCategories,
    recommendedDifficulty,
    recommendedTestsCount,
    reasoning,
    confidenceScore,
  };

  return strategyOutputSchema.parse(strategy);
};

// Generates the "Why This Test?" explanation for a specific test case (Section 17)
export const explainTestSelection = ({ testCase, aiProfile, vulnerabilities = [], firewallEvents = [] }) => {
  const points = [];

  if (testCase.category === 'pii_leakage') {
    points.push(`This AI processes customer data with ${aiProfile?.data_sensitivity || 'High'} sensitivity.`);
    if (vulnerabilities.some(v => v.category === 'pii_leakage' && v.status === 'open')) {
      points.push('A PII leakage vulnerability was detected in a previous evaluation.');
    }
  }

  if (testCase.category === 'prompt_injection' || testCase.category === 'system_prompt_extraction') {
    points.push(`Deployed in public facing ${aiProfile?.industry || 'web'} channel vulnerable to user prompt manipulation.`);
    if (firewallEvents.some(e => e.action === 'block')) {
      points.push('Firewall gateway captured recent adversarial attempts against this AI.');
    }
  }

  if (testCase.category === 'hallucination') {
    points.push(`Domain operations in ${aiProfile?.industry || 'enterprise'} require strict factual adherence.`);
  }

  if (points.length === 0) {
    points.push(`Standard baseline verification for ${testCase.category} to maintain trust assurance.`);
  }

  return {
    testName: testCase.name,
    category: testCase.category,
    whySelected: points,
    explanationSummary: `TrustGuard selected this test because: ${points.join(' ')}`,
  };
};
