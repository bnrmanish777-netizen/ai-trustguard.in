// AI TrustGuard System Constants

export const TRUST_SCORE_WEIGHTS = {
  security: 0.25,
  privacy: 0.25,
  reliability: 0.20,
  safety: 0.20,
  transparency: 0.10,
};

export const TRUST_SCORE_TIERS = [
  { min: 90, max: 100, label: 'Excellent', color: '#10b981', badge: 'excellent' },
  { min: 80, max: 89.99, label: 'High', color: '#06b6d4', badge: 'high' },
  { min: 70, max: 79.99, label: 'Moderate', color: '#f59e0b', badge: 'moderate' },
  { min: 50, max: 69.99, label: 'Low', color: '#f97316', badge: 'low' },
  { min: 0, max: 49.99, label: 'Critical', color: '#ef4444', badge: 'critical' },
];

export const TEST_CATEGORIES = [
  'prompt_injection',
  'system_prompt_extraction',
  'pii_leakage',
  'sensitive_data',
  'data_exfiltration',
  'hallucination',
  'reliability',
  'unsafe_response',
  'consistency',
  'fairness',
  'transparency',
];

export const TEST_DIFFICULTIES = ['easy', 'medium', 'hard', 'expert'];

export const SEVERITIES = ['critical', 'high', 'medium', 'low', 'informational'];

export const FIREWALL_ACTIONS = {
  ALLOW: 'allow',
  WARN: 'warn',
  BLOCK: 'block',
  REDACT: 'redact',
};

export const VULNERABILITY_STATUSES = [
  'open',
  'in_progress',
  'resolved',
  'risk_accepted',
];

export const REPORT_DISCLAIMER = `This report represents an automated security and trust assessment based on the tests executed by AI TrustGuard. It does not guarantee that an AI system is completely secure, private, unbiased, or trustworthy. Passing tests does not guarantee complete security; failing tests indicate areas requiring investigation.`;
