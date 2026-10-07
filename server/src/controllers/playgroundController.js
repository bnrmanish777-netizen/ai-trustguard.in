import { db } from '../db/index.js';
import { getTargetAIProvider } from '../ai/providerFactory.js';
import { scanPrompt, scanResponse } from '../firewall/firewallService.js';
import { detectPII } from '../security/piiDetector.js';
import { detectSecrets } from '../security/secretDetector.js';
import { detectPromptInjection } from '../security/promptInjectionDetector.js';

export const runPlaygroundTest = async (req, res, next) => {
  try {
    const { prompt, aiSystemId, throughFirewall = false } = req.body;
    if (!prompt || !aiSystemId) {
      return res.status(400).json({ error: 'prompt and aiSystemId are required' });
    }

    const aiSystem = await db.aiSystems.findById(aiSystemId);
    if (!aiSystem) return res.status(404).json({ error: 'AI System not found' });

    const provider = getTargetAIProvider(aiSystem);

    let promptToSend = prompt;
    let firewallPromptDecision = null;
    let wasBlocked = false;

    // Pre-scan if throughFirewall is toggled
    if (throughFirewall) {
      firewallPromptDecision = await scanPrompt({ prompt, aiSystemId, userId: req.user.id });
      if (firewallPromptDecision.action === 'block') {
        wasBlocked = true;
      } else if (firewallPromptDecision.action === 'redact') {
        promptToSend = firewallPromptDecision.processedPrompt;
      }
    }

    let actualResponse = '';
    let latencyMs = 0;

    if (wasBlocked) {
      actualResponse = '[BLOCKED BY AI TRUSTGUARD FIREWALL: ADVERSARIAL THREAT INTERCEPTED]';
      latencyMs = 20;
    } else {
      const respObj = await provider.invoke(promptToSend);
      actualResponse = respObj.text;
      latencyMs = respObj.latencyMs;

      // Post-scan if throughFirewall
      if (throughFirewall) {
        const respDecision = await scanResponse({ responseText: actualResponse, aiSystemId, userId: req.user.id });
        actualResponse = respDecision.processedResponse;
      }
    }

    // Security Analysis
    const piiCheck = detectPII(actualResponse);
    const secretCheck = detectSecrets(actualResponse);
    const injectionCheck = detectPromptInjection(prompt);

    const riskLevel = wasBlocked ? 'mitigated' : (piiCheck.hasPII || secretCheck.hasSecrets) ? 'high' : injectionCheck.isInjection ? 'critical' : 'safe';

    res.json({
      prompt,
      targetResponse: actualResponse,
      throughFirewall,
      wasBlocked,
      latencyMs,
      firewallDecision: firewallPromptDecision,
      securityAnalysis: {
        riskLevel,
        hasPII: piiCheck.hasPII,
        piiMatches: piiCheck.matches,
        hasSecrets: secretCheck.hasSecrets,
        secretMatches: secretCheck.matches,
        isPromptInjection: injectionCheck.isInjection,
      },
      recommendation: wasBlocked
        ? 'Firewall successfully intercepted malicious input before model exposure.'
        : piiCheck.hasPII
        ? 'Enable AI TrustGuard Firewall response redaction to prevent PII exposure.'
        : 'Output verified safe under test conditions.',
    });
  } catch (err) {
    next(err);
  }
};
