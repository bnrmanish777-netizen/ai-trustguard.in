import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/index.js';
import { getTargetAIProvider } from '../ai/providerFactory.js';
import { detectPII } from '../security/piiDetector.js';
import { detectSecrets } from '../security/secretDetector.js';
import { detectPromptInjection } from '../security/promptInjectionDetector.js';
import { redactText } from '../security/redactor.js';
import { evaluateFirewallPolicy } from '../firewall/policyEngine.js';
import { upsertMemory } from '../memory/trustMemoryService.js';
import { logger } from '../utils/logger.js';

// Helper to determine Safety Status label and band
export const determineSafetyStatus = (score) => {
  if (score >= 90) return { status: 'SAFE', badge: '🟢', label: '🟢 YES — CURRENTLY SAFE', summary: 'Continuous monitoring active. No critical threats.' };
  if (score >= 80) return { status: 'SAFE', badge: '🟢', label: '🟢 YES — GENERALLY SAFE', summary: 'Passing security baseline with minor warnings.' };
  if (score >= 70) return { status: 'WATCH', badge: '🟡', label: '🟡 WATCH — MINOR RISKS', summary: 'Elevated threat observations. Review recent incidents.' };
  if (score >= 50) return { status: 'HIGH_RISK', badge: '🟠', label: '🟠 HIGH RISK — ACTION NEEDED', summary: 'Multiple unmitigated vulnerabilities or repeat leaks.' };
  return { status: 'CRITICAL', badge: '🔴', label: '🔴 CRITICAL — UNSAFE FOR PRODUCTION', summary: 'Active exploit risk or severe credential exposure.' };
};

// Retrieve latest dynamic trust score for an AI system
export const getCurrentTrustScore = async (aiSystemId) => {
  const history = await db.trustScoreHistory.find(h => h.ai_system_id === aiSystemId);
  if (history.length > 0) {
    const latest = [...history].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return Number(latest.score);
  }
  const evals = await db.evaluations.find(e => e.ai_system_id === aiSystemId);
  if (evals.length > 0) {
    const latest = [...evals].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    return Number(latest.trust_score);
  }
  return 74.50;
};

// Update Dynamic Trust Score with audit trail in trust_score_history
export const recordTrustScoreAdjustment = async ({ aiSystemId, delta, reason, eventType = 'incident' }) => {
  const currentScore = await getCurrentTrustScore(aiSystemId);
  const newScore = Math.min(100, Math.max(15, Number((currentScore + delta).toFixed(2))));
  
  const historyEntry = await db.trustScoreHistory.create({
    ai_system_id: aiSystemId,
    score: newScore,
    previous_score: currentScore,
    change: delta,
    reason,
    event_type: eventType,
  });

  return { newScore, previousScore: currentScore, historyEntry };
};

// Inline AI Gateway Pipeline
export const routeThroughTrustGuard = async ({
  aiSystemId,
  userId = '00000000-0000-4000-8000-000000000001',
  prompt = '',
  throughFirewall = true,
}) => {
  const requestId = `req_${uuidv4().substring(0, 8)}`;
  const startTime = Date.now();

  const aiSystem = await db.aiSystems.findById(aiSystemId);
  if (!aiSystem) {
    throw new Error(`AI System with ID ${aiSystemId} not found`);
  }

  const aiProfile = await db.aiProfiles.findOne(p => p.ai_system_id === aiSystemId);
  const policy = await db.firewallPolicies.findOne(p => p.ai_system_id === aiSystemId) || {
    enabled: true,
    pii_action: 'redact',
    prompt_injection_action: 'block',
    sensitive_data_action: 'block',
    secret_action: 'redact',
  };

  // STEP 1: INPUT FIREWALL SCAN
  const inputPii = detectPII(prompt);
  const inputSecrets = detectSecrets(prompt);
  const inputInjection = detectPromptInjection(prompt);

  const inputEvaluation = throughFirewall && policy.enabled !== false
    ? evaluateFirewallPolicy({
        detectionResults: { pii: inputPii, secrets: inputSecrets, injection: inputInjection },
        policy,
        aiProfile,
      })
    : { action: 'allow', riskScore: 10, reason: 'Firewall bypassed', matchedThreat: null, details: [] };

  let processedPrompt = prompt;
  let wasBlocked = false;
  let wasRedacted = false;
  let incidentCreated = null;
  let scoreDelta = 0;

  if (inputEvaluation.action === 'block') {
    wasBlocked = true;
    processedPrompt = '[BLOCKED BY TRUSTGUARD FIREWALL: INBOUND THREAT INTERCEPTED]';
  } else if (inputEvaluation.action === 'redact') {
    const redactedInput = redactText(prompt);
    processedPrompt = redactedInput.redactedText;
    wasRedacted = true;
  }

  // STEP 2: AI MODEL EXECUTION (Only if not blocked)
  let rawResponse = '';
  let processedResponse = '';
  let latencyMs = 0;

  if (wasBlocked) {
    rawResponse = '[NOT INVOKED - INPUT WAS BLOCKED]';
    processedResponse = `[BLOCKED BY TRUSTGUARD FIREWALL] Threat: ${inputEvaluation.matchedThreat?.toUpperCase() || 'ADVERSARIAL_INPUT'}. ${inputEvaluation.reason}`;
    latencyMs = Date.now() - startTime;

    // Create Inbound Security Incident
    scoreDelta = -5.00;
    incidentCreated = await db.securityIncidents.create({
      user_id: userId,
      ai_system_id: aiSystemId,
      threat_type: inputEvaluation.matchedThreat === 'prompt_injection' ? 'Prompt Injection' : 'Adversarial Request',
      severity: 'critical',
      direction: 'inbound',
      input_text: prompt,
      output_text: processedResponse,
      detection_reason: inputEvaluation.reason,
      action_taken: 'blocked',
      trust_score_impact: scoreDelta,
      recommended_action: 'Run advanced prompt injection evaluation suite.',
      detection_details: {
        matches: inputEvaluation.details,
        riskScore: inputEvaluation.riskScore,
      },
    });

    // Adjust Dynamic Trust Score
    await recordTrustScoreAdjustment({
      aiSystemId,
      delta: scoreDelta,
      reason: `Adversarial prompt injection intercepted in inbound request: ${inputEvaluation.reason}`,
      eventType: 'incident',
    });

    // Firewall Learning (Memory)
    await upsertMemory(
      aiSystemId,
      'firewall_learning',
      'inbound_injection_attempt',
      `Firewall successfully blocked prompt injection: "${prompt.substring(0, 60)}..."`,
      'high',
      'gateway_firewall',
      { incidentId: incidentCreated.id }
    );
  } else {
    // Invoke Target AI Application
    const provider = getTargetAIProvider(aiSystem);
    const invokeResult = await provider.invoke(processedPrompt);
    rawResponse = invokeResult.text;
    latencyMs = invokeResult.latencyMs || (Date.now() - startTime);

    // STEP 3: RESPONSE FIREWALL SCAN
    const outputPii = detectPII(rawResponse);
    const outputSecrets = detectSecrets(rawResponse);

    processedResponse = rawResponse;

    if (throughFirewall && policy.enabled !== false) {
      if (outputSecrets.hasSecrets) {
        const secretAction = policy.secret_action || 'redact';
        if (secretAction === 'redact') {
          const res = redactText(processedResponse, { redactSecrets: true });
          processedResponse = res.redactedText;
          wasRedacted = true;
        } else if (secretAction === 'block') {
          processedResponse = '[RESPONSE BLOCKED BY TRUSTGUARD: CONFIDENTIAL CREDENTIAL DETECTED]';
          wasBlocked = true;
        }

        scoreDelta = -4.50;
        incidentCreated = await db.securityIncidents.create({
          user_id: userId,
          ai_system_id: aiSystemId,
          threat_type: 'Secret Exposure',
          severity: 'high',
          direction: 'outbound',
          input_text: prompt,
          output_text: processedResponse,
          detection_reason: 'AI attempted to expose credentials or tokens in response.',
          action_taken: secretAction === 'block' ? 'blocked' : 'redacted',
          trust_score_impact: scoreDelta,
          recommended_action: 'Audit AI prompt context and purge internal credentials.',
          detection_details: { secrets: outputSecrets.matches },
        });

        await recordTrustScoreAdjustment({
          aiSystemId,
          delta: scoreDelta,
          reason: 'Confidential secret pattern intercepted and protected by TrustGuard.',
          eventType: 'incident',
        });
      } else if (outputPii.hasPII) {
        const piiAction = policy.pii_action || 'redact';
        if (piiAction === 'redact') {
          const res = redactText(processedResponse, {
            redactEmail: true,
            redactPhone: true,
            redactSSN: true,
            redactCreditCard: true,
          });
          processedResponse = res.redactedText;
          wasRedacted = true;
        } else if (piiAction === 'block') {
          processedResponse = '[RESPONSE BLOCKED BY TRUSTGUARD: UNMASKED PII DETECTED]';
          wasBlocked = true;
        }

        scoreDelta = -4.00;
        incidentCreated = await db.securityIncidents.create({
          user_id: userId,
          ai_system_id: aiSystemId,
          threat_type: 'PII Leakage',
          severity: 'high',
          direction: 'outbound',
          input_text: prompt,
          output_text: processedResponse,
          detection_reason: 'AI attempted to generate response containing personal customer identifiers.',
          action_taken: piiAction === 'block' ? 'blocked' : 'redacted',
          trust_score_impact: scoreDelta,
          recommended_action: 'Retest PII handling and verify masking rules in AI TrustGuard Firewall.',
          detection_details: { pii: outputPii.matches },
        });

        await recordTrustScoreAdjustment({
          aiSystemId,
          delta: scoreDelta,
          reason: 'Synthetic customer PII intercepted and redacted in response.',
          eventType: 'incident',
        });

        // Firewall Learning for PII leaks
        await upsertMemory(
          aiSystemId,
          'firewall_learning',
          'pii_leakage_observed',
          `AI output contained unmasked PII records (${outputPii.details.types.join(', ')}). Mandatory redaction enforced.`,
          'high',
          'gateway_firewall',
          { incidentId: incidentCreated.id }
        );
      } else {
        // Clean interaction reinforcement (+0.10, ceiling 100)
        scoreDelta = 0.10;
        await recordTrustScoreAdjustment({
          aiSystemId,
          delta: scoreDelta,
          reason: 'Clean interaction passed through AI TrustGuard with zero security violations.',
          eventType: 'monitoring',
        });
      }
    }
  }

  // STEP 4: RECORD TELEMETRY EVENT (Monitoring Stream)
  const monitoringEvent = await db.monitoringEvents.create({
    user_id: userId,
    ai_system_id: aiSystemId,
    request_id: requestId,
    prompt,
    response: processedResponse,
    request_risk_level: wasBlocked ? 'critical' : inputEvaluation.riskScore > 60 ? 'high' : 'safe',
    response_risk_level: incidentCreated ? 'high' : 'safe',
    detected_threats: incidentCreated ? [incidentCreated.threat_type] : [],
    detected_pii: inputPii.matches.concat(detectPII(rawResponse).matches).map(m => `${m.type}: ${m.value || ''}`),
    detected_secrets: inputSecrets.matches.concat(detectSecrets(rawResponse).matches).map(m => m.name || m.type),
    prompt_injection_status: inputInjection.isInjection ? 'blocked_vector' : 'none',
    policy_decision: wasBlocked ? 'block' : wasRedacted ? 'redact' : 'allow',
    redactions: wasRedacted ? ['pii_or_secrets'] : [],
    blocked: wasBlocked,
    latency_ms: latencyMs,
  });

  // Calculate latest dynamic score and safety status
  const currentScore = await getCurrentTrustScore(aiSystemId);
  const safetyStatus = determineSafetyStatus(currentScore);

  return {
    requestId,
    aiSystemId,
    timestamp: new Date().toISOString(),
    originalPrompt: prompt,
    processedPrompt,
    rawResponse,
    protectedResponse: processedResponse,
    wasBlocked,
    wasRedacted,
    latencyMs,
    inputAnalysis: {
      riskLevel: wasBlocked ? 'critical' : inputEvaluation.riskScore > 60 ? 'high' : 'safe',
      riskScore: inputEvaluation.riskScore,
      detectedThreats: inputInjection.isInjection ? ['prompt_injection'] : [],
      hasPII: inputPii.hasPII,
      piiMatches: inputPii.matches,
      hasSecrets: inputSecrets.hasSecrets,
      secretMatches: inputSecrets.matches,
      isPromptInjection: inputInjection.isInjection,
      decision: inputEvaluation.action,
      reason: inputEvaluation.reason,
      whyThisCheck: inputEvaluation.whySelected || 'Baseline proactive input boundary check.',
    },
    responseAnalysis: {
      riskLevel: incidentCreated && incidentCreated.direction === 'outbound' ? 'high' : 'safe',
      hasPII: detectPII(rawResponse).hasPII,
      hasSecrets: detectSecrets(rawResponse).hasSecrets,
      decision: wasBlocked ? 'block' : wasRedacted ? 'redact' : 'allow',
      whyThisCheck: 'Outbound privacy boundary check ensures zero unmasked leakage to users.',
    },
    incident: incidentCreated,
    monitoringEventId: monitoringEvent.id,
    currentTrustScore: currentScore,
    trustScoreDelta: scoreDelta,
    safetyStatus,
  };
};
