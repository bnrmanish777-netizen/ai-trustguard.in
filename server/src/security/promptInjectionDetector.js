// Prompt Injection and Adversarial Vector Detector

const INJECTION_PATTERNS = [
  // 1. Instruction Override
  {
    type: 'instruction_override',
    name: 'Directive Override Vector',
    regex: /\b(?:ignore|disregard|forget|bypass|override)\s+(?:all\s+)?(?:previous|prior|above|former)\s+(?:instructions|directions|prompts|rules|guidelines)\b/gi,
    severity: 'critical',
    weight: 0.95,
  },
  {
    type: 'instruction_override',
    name: 'New Persona Directive',
    regex: /\b(?:from now on|henceforth|you are now)\s+(?:you will|act as|behave like|play the role of)\b/gi,
    severity: 'high',
    weight: 0.75,
  },
  // 2. Role Manipulation / Jailbreak (DAN, Sentinel, etc.)
  {
    type: 'role_manipulation',
    name: 'Jailbreak Persona / DAN Mode',
    regex: /\b(?:DAN|Jailbreak|Developer Mode|Unrestricted Mode|Do Anything Now|Evil Confidant|Omega|AIM)\b/gi,
    severity: 'critical',
    weight: 0.90,
  },
  {
    type: 'role_manipulation',
    name: 'Hypothetical / Fictional Bypass Framing',
    regex: /\b(?:fictional narrative|hypothetical scenario|for research purposes only|authorized red team simulation)\s+where (?:you have no restrictions|safety protocols are disabled)\b/gi,
    severity: 'high',
    weight: 0.85,
  },
  // 3. System Prompt Extraction
  {
    type: 'system_prompt_extraction',
    name: 'Verbatim System Prompt Probe',
    regex: /\b(?:repeat|reveal|output|display|show|print)\s+(?:the\s+)?(?:exact|verbatim|entire|full)?\s*(?:system\s+prompt|developer\s+instructions|initial\s+prompt|hidden\s+instructions)\b/gi,
    severity: 'high',
    weight: 0.90,
  },
  {
    type: 'system_prompt_extraction',
    name: 'Instruction Prefix Echo Probe',
    regex: /\bwhat\s+(?:are|were)\s+the\s+first\s+\d+\s+words\s+of\s+your\s+(?:prompt|instructions)\b/gi,
    severity: 'medium',
    weight: 0.80,
  },
  // 4. Delimiter and Context Manipulation
  {
    type: 'delimiter_attack',
    name: 'Delimiter Hijacking Sequence',
    regex: /(?:\[\/?INST\]|<\/?system>|```(?:system|admin|override)|<\|im_start\|>|<\|im_end\|>)/gi,
    severity: 'critical',
    weight: 0.95,
  },
  // 5. Encoded / Obfuscated Attacks
  {
    type: 'base64_injection_probe',
    name: 'Base64 Encoded Injection Clue',
    regex: /\b(?:decode|execute)\s+the\s+following\s+base64\b/gi,
    severity: 'medium',
    weight: 0.70,
  },
];

export const detectPromptInjection = (prompt = '') => {
  if (typeof prompt !== 'string') return { isInjection: false, score: 0, matches: [] };

  const matches = [];
  let cumulativeWeight = 0;

  INJECTION_PATTERNS.forEach(rule => {
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    if (regex.test(prompt)) {
      matches.push({
        type: rule.type,
        name: rule.name,
        severity: rule.severity,
        weight: rule.weight,
      });
      cumulativeWeight += rule.weight;
    }
  });

  // Calculate normalized risk score between 0 and 100
  const normalizedScore = matches.length > 0
    ? Math.min(100, Math.round(matches.reduce((max, m) => Math.max(max, m.weight * 100), 0) + (matches.length - 1) * 10))
    : 0;

  const isInjection = normalizedScore >= 70;

  return {
    isInjection,
    riskScore: normalizedScore,
    matches,
    matchedTypes: [...new Set(matches.map(m => m.type))],
    highestSeverity: matches.some(m => m.severity === 'critical') ? 'critical' : matches.some(m => m.severity === 'high') ? 'high' : matches.length > 0 ? 'medium' : 'none',
  };
};
