// Secret and Credential Detector

const SECRET_PATTERNS = [
  {
    type: 'jwt_token',
    name: 'JSON Web Token (JWT)',
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    severity: 'critical',
  },
  {
    type: 'api_key_generic',
    name: 'Generic API Key Assignment',
    regex: /\b(?:api[_-]?key|access[_-]?token|secret[_-]?key|auth[_-]?token)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{16,64})['"]?/gi,
    severity: 'critical',
  },
  {
    type: 'aws_key',
    name: 'AWS Access Key ID',
    regex: /\b(AKIA[0-9A-Z]{16})\b/g,
    severity: 'critical',
  },
  {
    type: 'private_key',
    name: 'Private Encryption Key Header',
    regex: /-----BEGIN\s+(?:RSA|OPENSSH|DSA|EC|PGP)?\s*PRIVATE KEY-----/gi,
    severity: 'critical',
  },
  {
    type: 'database_uri',
    name: 'Database Connection URI with Credentials',
    regex: /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+(?::\d+)?\/[A-Za-z0-9_.-]+/gi,
    severity: 'critical',
  },
  {
    type: 'bearer_token',
    name: 'Bearer Authorization Header',
    regex: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
    severity: 'high',
  },
  {
    type: 'password_assignment',
    name: 'Hardcoded Password Assignment',
    regex: /\b(?:password|passwd|pwd)\s*[:=]\s*['"]([^'"]{4,})['"](?!\s*[:=])/gi,
    severity: 'high',
  },
];

export const detectSecrets = (text = '') => {
  if (typeof text !== 'string') return { hasSecrets: false, matches: [] };

  const matches = [];

  SECRET_PATTERNS.forEach(rule => {
    let match;
    const regex = new RegExp(rule.regex.source, rule.regex.flags);
    while ((match = regex.exec(text)) !== null) {
      const rawMatch = match[0];
      const masked = rawMatch.length > 8
        ? rawMatch.substring(0, 4) + '...' + rawMatch.substring(rawMatch.length - 4)
        : '***';

      matches.push({
        type: rule.type,
        name: rule.name,
        severity: rule.severity,
        maskedMatch: masked,
        rawIndex: match.index,
      });
    }
  });

  return {
    hasSecrets: matches.length > 0,
    matches,
    details: {
      count: matches.length,
      types: [...new Set(matches.map(m => m.type))],
      maxSeverity: matches.some(m => m.severity === 'critical') ? 'critical' : matches.length > 0 ? 'high' : 'none',
    },
  };
};
