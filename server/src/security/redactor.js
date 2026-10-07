// Real-time Redaction Engine for AI TrustGuard Firewall

const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b/g;
const CREDIT_CARD_REGEX = /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g;
const API_KEY_REGEX = /\b(?:api[_-]?key|access[_-]?token|secret[_-]?key)\s*[:=]\s*['"]?([A-Za-z0-9_\-]{16,64})['"]?/gi;
const JWT_REGEX = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

export const redactText = (text = '', options = {}) => {
  if (typeof text !== 'string') return { redactedText: text, redactionCount: 0, redactedTypes: [] };

  const {
    redactEmail = true,
    redactPhone = true,
    redactSSN = true,
    redactCreditCard = true,
    redactSecrets = true,
  } = options;

  let redacted = text;
  const appliedTypes = [];
  let count = 0;

  // 1. Redact Email
  if (redactEmail) {
    redacted = redacted.replace(EMAIL_REGEX, () => {
      count++;
      if (!appliedTypes.includes('email')) appliedTypes.push('email');
      return '[REDACTED_EMAIL]';
    });
  }

  // 2. Redact Phone
  if (redactPhone) {
    redacted = redacted.replace(PHONE_REGEX, (match) => {
      if (match.replace(/\D/g, '').length >= 10) {
        count++;
        if (!appliedTypes.includes('phone')) appliedTypes.push('phone');
        return '[REDACTED_PHONE]';
      }
      return match;
    });
  }

  // 3. Redact SSN
  if (redactSSN) {
    redacted = redacted.replace(SSN_REGEX, () => {
      count++;
      if (!appliedTypes.includes('government_id')) appliedTypes.push('government_id');
      return '[REDACTED_SSN]';
    });
  }

  // 4. Redact Credit Cards
  if (redactCreditCard) {
    redacted = redacted.replace(CREDIT_CARD_REGEX, () => {
      count++;
      if (!appliedTypes.includes('credit_card')) appliedTypes.push('credit_card');
      return '[REDACTED_CARD]';
    });
  }

  // 4b. Redact Synthetic National ID (Aadhaar pattern)
  const AADHAAR_REGEX = /\b[2-9]\d{3}\s\d{4}\s\d{4}\b/g;
  redacted = redacted.replace(AADHAAR_REGEX, () => {
    count++;
    if (!appliedTypes.includes('national_id_synthetic')) appliedTypes.push('national_id_synthetic');
    return '[REDACTED_NATIONAL_ID]';
  });

  // 5. Redact Secrets & API Keys
  if (redactSecrets) {
    redacted = redacted.replace(JWT_REGEX, () => {
      count++;
      if (!appliedTypes.includes('jwt')) appliedTypes.push('jwt');
      return '[REDACTED_TOKEN]';
    });

    redacted = redacted.replace(API_KEY_REGEX, (match, keyVal) => {
      count++;
      if (!appliedTypes.includes('api_key')) appliedTypes.push('api_key');
      return match.replace(keyVal, '[REDACTED_SECRET_KEY]');
    });
  }

  return {
    originalText: text,
    redactedText: redacted,
    redactionCount: count,
    redactedTypes: appliedTypes,
  };
};
