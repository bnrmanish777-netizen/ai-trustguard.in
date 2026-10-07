import rateLimit from 'express-rate-limit';

export const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please wait before making more requests.',
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts',
    message: 'Please try again after 15 minutes.',
  },
});

export const aiExecutionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // 60 evaluation/generation requests
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI Execution rate limit reached',
    message: 'Please wait a few moments before triggering additional AI evaluations or test generation.',
  },
});

export const firewallLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // 120 firewall inspects/min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Firewall rate limit reached',
    message: 'Too many firewall inspection requests in a short window.',
  },
});
