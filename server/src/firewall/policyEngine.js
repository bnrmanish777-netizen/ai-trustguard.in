// Personalized Firewall Policy Evaluator (Section 29)

export const evaluateFirewallPolicy = ({
  detectionResults,
  policy,
  aiProfile,
}) => {
  const { pii, secrets, injection } = detectionResults;

  // Default actions if not explicitly configured in policy
  const piiAction = policy?.pii_action || 'redact';
  const injectionAction = policy?.prompt_injection_action || 'block';
  const sensitiveAction = policy?.sensitive_data_action || 'block';
  const secretAction = policy?.secret_action || 'redact';

  // Check Allowed Data vs Restricted Data from AI Profile
  const allowedData = Array.isArray(aiProfile?.allowed_data) ? aiProfile.allowed_data.map(d => d.toLowerCase()) : [];
  const restrictedData = Array.isArray(aiProfile?.restricted_data) ? aiProfile.restricted_data.map(d => d.toLowerCase()) : [];

  // 1. Evaluate Prompt Injection (Zero Tolerance)
  if (injection.isInjection) {
    return {
      action: injectionAction,
      riskScore: injection.riskScore,
      reason: `Detected adversarial prompt injection vector (${injection.matchedTypes.join(', ')}). Policy enforces ${injectionAction.toUpperCase()}.`,
      matchedThreat: 'prompt_injection',
      details: injection.matches,
      whySelected: `AI Profile (${aiProfile?.industry || 'production'}) specifies strict defense against system prompt extraction and instruction tampering.`,
    };
  }

  // 2. Evaluate Secret Exposure
  if (secrets.hasSecrets) {
    const isCriticalSecret = secrets.matches.some(m => m.severity === 'critical');
    const action = isCriticalSecret ? 'block' : secretAction;
    return {
      action,
      riskScore: isCriticalSecret ? 95 : 85,
      reason: `Detected confidential token or secret pattern (${secrets.matches.map(m => m.name || m.type).join(', ')}).`,
      matchedThreat: 'secrets',
      details: secrets.matches,
      whySelected: `AI Profile restricted data includes authentication tokens and internal secrets.`,
    };
  }

  // 3. Evaluate PII against Allowed vs Restricted Data
  if (pii.hasPII) {
    // If the ONLY matches are benign allowed entities (e.g. order identifier / customer name allowed in profile)
    const nonAllowedMatches = pii.matches.filter(m => {
      if (m.type === 'account_identifier' && allowedData.some(a => a.includes('order') || a.includes('account') || a.includes('public'))) {
        return false;
      }
      if (m.type === 'name_in_context' && allowedData.some(a => a.includes('name') || a.includes('customer'))) {
        return false;
      }
      return true;
    });

    if (nonAllowedMatches.length === 0) {
      return {
        action: 'allow',
        riskScore: 15,
        reason: 'Identified entity is explicitly authorized by AI Profile Allowed Data policy.',
        matchedThreat: null,
        details: pii.matches,
        whySelected: `AI Profile allows ${aiProfile?.allowed_data?.join(', ')}.`,
      };
    }

    const isCriticalPII = nonAllowedMatches.some(m =>
      m.type === 'government_id' ||
      m.type === 'credit_card' ||
      m.type === 'national_id_synthetic'
    );

    const action = isCriticalPII ? 'block' : piiAction;
    return {
      action,
      riskScore: isCriticalPII ? 90 : 70,
      reason: `Identified sensitive personal data records (${nonAllowedMatches.map(m => m.type).join(', ')}).`,
      matchedThreat: 'pii',
      details: nonAllowedMatches,
      whySelected: `AI handles customer communications; ${action.toUpperCase()} prevents unauthorized PII disclosure.`,
    };
  }

  // Safe Request
  return {
    action: 'allow',
    riskScore: 10,
    reason: 'Content scanned clean against all configured threat rules.',
    matchedThreat: null,
    details: [],
    whySelected: 'No active threat indicators detected.',
  };
};
