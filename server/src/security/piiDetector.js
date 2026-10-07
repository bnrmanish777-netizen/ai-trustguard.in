// PII Detector using deterministic regexes and contextual pattern matchers

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g;
const CREDIT_CARD_REGEX = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;
const ADDRESS_PATTERNS = [
  /\b\d+\s+([A-Za-z]+|[A-Za-z]+\s+[A-Za-z]+)\s+(Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b/gi,
  /\b(PO Box|P\.O\. Box)\s+\d+\b/gi,
];

export const detectPII = (text = '') => {
  if (typeof text !== 'string') return { hasPII: false, matches: [], details: {} };

  const matches = [];

  // 1. Email detection
  const emailMatches = text.match(EMAIL_REGEX) || [];
  emailMatches.forEach(email => {
    matches.push({
      type: 'email',
      value: email,
      severity: 'high',
      confidence: 0.98,
      isPotential: false,
    });
  });

  // 2. Phone number detection
  const phoneMatches = text.match(PHONE_REGEX) || [];
  phoneMatches.forEach(phone => {
    // Filter out common false positives like years or short numbers
    if (phone.replace(/\D/g, '').length >= 10) {
      matches.push({
        type: 'phone',
        value: phone,
        severity: 'high',
        confidence: 0.92,
        isPotential: false,
      });
    }
  });

  // 3. SSN / Government ID detection
  const ssnMatches = text.match(SSN_REGEX) || [];
  ssnMatches.forEach(ssn => {
    matches.push({
      type: 'government_id',
      value: ssn,
      severity: 'critical',
      confidence: 0.90,
      isPotential: false,
    });
  });

  // 4. Credit Card detection
  const ccMatches = text.match(CREDIT_CARD_REGEX) || [];
  ccMatches.forEach(cc => {
    matches.push({
      type: 'credit_card',
      value: cc,
      severity: 'critical',
      confidence: 0.95,
      isPotential: false,
    });
  });

  // 5. Physical Address detection
  ADDRESS_PATTERNS.forEach(pattern => {
    const addrMatches = text.match(pattern) || [];
    addrMatches.forEach(addr => {
      matches.push({
        type: 'address',
        value: addr,
        severity: 'medium',
        confidence: 0.85,
        isPotential: true,
      });
    });
  });

  // 6. IP Address detection (IPv4)
  const IPV4_REGEX = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const ipMatches = text.match(IPV4_REGEX) || [];
  ipMatches.forEach(ip => {
    // Exclude localhost/loopback or trivial 0.0.0.0
    if (ip !== '127.0.0.1' && ip !== '0.0.0.0') {
      matches.push({
        type: 'ip_address',
        value: ip,
        severity: 'medium',
        confidence: 0.90,
        isPotential: false,
      });
    }
  });

  // 7. Synthetic Aadhaar-like pattern (12 digits with spaces)
  const AADHAAR_SYNTHETIC_REGEX = /\b[2-9]\d{3}\s\d{4}\s\d{4}\b/g;
  const aadhaarMatches = text.match(AADHAAR_SYNTHETIC_REGEX) || [];
  aadhaarMatches.forEach(aadhaar => {
    matches.push({
      type: 'national_id_synthetic',
      value: aadhaar,
      severity: 'critical',
      confidence: 0.93,
      isPotential: false,
    });
  });

  // 8. Account & Order Identifiers (Synthetic demo data)
  const ACCOUNT_REGEX = /\b(?:ACC|ORD|USR|CUST|INV)-\d{5,10}\b/gi;
  const acctMatches = text.match(ACCOUNT_REGEX) || [];
  acctMatches.forEach(acct => {
    matches.push({
      type: 'account_identifier',
      value: acct,
      severity: 'medium',
      confidence: 0.88,
      isPotential: false,
    });
  });

  // 9. Contextual Name Mention (e.g. "Customer Sarah Jenkins", "User: Rahul Demo")
  const nameContextRegex = /\b(?:customer|user|patient|client|account holder)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  let match;
  while ((match = nameContextRegex.exec(text)) !== null) {
    matches.push({
      type: 'name_in_context',
      value: match[1],
      severity: 'medium',
      confidence: 0.80,
      isPotential: true,
    });
  }

  return {
    hasPII: matches.length > 0,
    matches,
    details: {
      totalFound: matches.length,
      types: [...new Set(matches.map(m => m.type))],
      maxSeverity: matches.some(m => m.severity === 'critical') ? 'critical' : matches.some(m => m.severity === 'high') ? 'high' : matches.length > 0 ? 'medium' : 'none',
    },
  };
};
