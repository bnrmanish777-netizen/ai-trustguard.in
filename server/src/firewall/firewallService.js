import { db } from '../db/index.js';
import { detectPII } from '../security/piiDetector.js';
import { detectSecrets } from '../security/secretDetector.js';
import { detectPromptInjection } from '../security/promptInjectionDetector.js';
import { redactText } from '../security/redactor.js';
import { evaluateFirewallPolicy } from './policyEngine.js';
import { upsertMemory } from '../memory/trustMemoryService.js';
import { logger } from '../utils/logger.js';

export const scanPrompt = async ({ prompt, aiSystemId, userId }) => {
  const policy = await db.firewallPolicies.findOne(p => p.ai_system_id === aiSystemId) || {
    enabled: true,
    pii_action: 'redact',
    prompt_injection_action: 'block',
    sensitive_data_action: 'block',
  };

  const aiProfile = await db.aiProfiles.findOne(p => p.ai_system_id === aiSystemId);

  // If firewall is disabled for this AI, allow immediately
  if (policy.enabled === false) {
    return {
      action: 'allow',
      processedPrompt: prompt,
      riskScore: 0,
      reason: 'Firewall is currently bypassed/disabled for this AI system.',
      detectionDetails: {},
    };
  }

  // Pre-Input Scans
  const pii = detectPII(prompt);
  const secrets = detectSecrets(prompt);
  const injection = detectPromptInjection(prompt);

  const evaluation = evaluateFirewallPolicy({
    detectionResults: { pii, secrets, injection },
    policy,
    aiProfile,
  });

  let processedPrompt = prompt;
  if (evaluation.action === 'redact') {
    const { redactedText } = redactText(prompt);
    processedPrompt = redactedText;
  } else if (evaluation.action === 'block') {
    processedPrompt = '[BLOCKED BY TRUSTGUARD FIREWALL]';
  }

  // Record firewall telemetry event
  const event = await db.firewallEvents.create({
    user_id: userId || '00000000-0000-4000-8000-000000000001',
    ai_system_id: aiSystemId,
    event_type: evaluation.matchedThreat ? `${evaluation.matchedThreat}_attempt` : 'clean_request',
    input_text: prompt,
    output_text: processedPrompt,
    risk_score: evaluation.riskScore,
    action: evaluation.action,
    reason: evaluation.reason,
    detection_details: {
      piiMatches: pii.matches,
      secretMatches: secrets.matches,
      injectionMatches: injection.matches,
    },
  });

  // Update Trust Memory if block occurred (Section 31: Firewall Learning)
  if (evaluation.action === 'block' && evaluation.matchedThreat === 'prompt_injection') {
    await upsertMemory(
      aiSystemId,
      'firewall_pattern',
      'repeated_injection_attempts',
      'Firewall actively intercepted and neutralized adversarial prompt injection attacks.',
      'high',
      'firewall_gateway',
      { lastEventId: event.id }
    );
  }

  return {
    action: evaluation.action,
    processedPrompt,
    riskScore: evaluation.riskScore,
    reason: evaluation.reason,
    detectionDetails: {
      hasPII: pii.hasPII,
      hasSecrets: secrets.hasSecrets,
      isInjection: injection.isInjection,
      matchedThreat: evaluation.matchedThreat,
    },
    eventId: event.id,
  };
};

export const scanResponse = async ({ responseText, aiSystemId, userId }) => {
  const policy = await db.firewallPolicies.findOne(p => p.ai_system_id === aiSystemId) || {
    enabled: true,
    pii_action: 'redact',
    secret_action: 'redact',
  };

  if (policy.enabled === false) {
    return {
      action: 'allow',
      processedResponse: responseText,
      redacted: false,
      detectionDetails: {},
    };
  }

  const pii = detectPII(responseText);
  const secrets = detectSecrets(responseText);

  let processedResponse = responseText;
  let action = 'allow';
  let reason = 'Response scanned clean.';

  if (secrets.hasSecrets) {
    action = policy.secret_action || 'redact';
    reason = 'Response contained sensitive tokens or secret patterns.';
    if (action === 'redact') {
      const res = redactText(processedResponse, { redactSecrets: true });
      processedResponse = res.redactedText;
    } else if (action === 'block') {
      processedResponse = '[RESPONSE BLOCKED DUE TO CONFIDENTIAL DATA DETECTED]';
    }
  }

  if (pii.hasPII) {
    action = policy.pii_action || 'redact';
    reason = 'Response contained customer PII records.';
    if (action === 'redact') {
      const res = redactText(processedResponse, { redactEmail: true, redactPhone: true, redactSSN: true });
      processedResponse = res.redactedText;
    } else if (action === 'block') {
      processedResponse = '[RESPONSE BLOCKED DUE TO UNMASKED PII DETECTED]';
    }
  }

  if (action !== 'allow') {
    await db.firewallEvents.create({
      user_id: userId || '00000000-0000-4000-8000-000000000001',
      ai_system_id: aiSystemId,
      event_type: 'response_sanitization',
      input_text: '[AI Model Output]',
      output_text: processedResponse,
      risk_score: 75,
      action,
      reason,
      detection_details: { pii: pii.matches, secrets: secrets.matches },
    });
  }

  return {
    action,
    processedResponse,
    redacted: action === 'redact',
    reason,
    detectionDetails: {
      piiFound: pii.details.types,
      secretsFound: secrets.details.types,
    },
  };
};
