import { db } from '../db/index.js';
import { logger } from '../utils/logger.js';

export const updateTrustMemoryFromEvaluation = async (aiSystemId, evaluation, testResults, vulnerabilities) => {
  try {
    // 1. Analyze Recurring Vulnerabilities
    const failedCategories = testResults.filter(r => r.result === 'fail').map(r => r.category);
    const categoryCounts = {};
    failedCategories.forEach(c => { categoryCounts[c] = (categoryCounts[c] || 0) + 1; });

    for (const [category, count] of Object.entries(categoryCounts)) {
      if (count >= 2) {
        await upsertMemory(aiSystemId, 'recurring_vulnerability', category, `Detected ${count} failures in category '${category}' during recent evaluation.`, 'high', 'evaluation', { count });
      }
    }

    // 2. Analyze Resolved Vulnerabilities
    const passedCategories = testResults.filter(r => r.result === 'pass').map(r => r.category);
    const previouslyResolved = vulnerabilities.filter(v => v.status === 'resolved');
    for (const resolvedVuln of previouslyResolved) {
      if (passedCategories.includes(resolvedVuln.category)) {
        await upsertMemory(aiSystemId, 'resolved_vulnerability', resolvedVuln.category, `Vulnerability '${resolvedVuln.title}' verified resolved in recent retest.`, 'high', 'retest', { vulnId: resolvedVuln.id });
      }
    }

    // 3. Recommended Next Tests (Section 35)
    if (categoryCounts['prompt_injection']) {
      await upsertMemory(
        aiSystemId,
        'recommended_future_test',
        'advanced_prompt_injection',
        'Run Advanced Prompt Injection Suite with multi-turn jailbreak and DAN vectors.',
        'high',
        'personalization_engine',
        { estimatedTests: 8, urgency: 'high' }
      );
    } else if (categoryCounts['pii_leakage']) {
      await upsertMemory(
        aiSystemId,
        'recommended_future_test',
        'pii_redaction_verification',
        'Run Synthetic PII Extraction Test Suite with obfuscated phone and email queries.',
        'high',
        'personalization_engine',
        { estimatedTests: 6, urgency: 'high' }
      );
    }

    logger.info('Trust Memory updated from evaluation results', { aiSystemId, evaluationId: evaluation.id });
  } catch (err) {
    logger.error('Failed to update Trust Memory', { error: err.message, aiSystemId });
  }
};

export const upsertMemory = async (aiSystemId, memoryType, memoryKey, memoryValue, confidence = 'high', source = 'evaluation', details = {}) => {
  const existing = await db.trustMemory.findOne(
    m => m.ai_system_id === aiSystemId && m.memory_type === memoryType && m.memory_key === memoryKey
  );

  if (existing) {
    return await db.trustMemory.updateById(existing.id, {
      memory_value: memoryValue,
      confidence,
      source,
      details,
    });
  } else {
    return await db.trustMemory.create({
      ai_system_id: aiSystemId,
      memory_type: memoryType,
      memory_key: memoryKey,
      memory_value: memoryValue,
      confidence,
      source,
      details,
    });
  }
};

// Generates the "What TrustGuard Learned" card items (Section 68)
export const getWhatTrustGuardLearned = async (aiSystemId) => {
  const memories = await db.trustMemory.find(m => m.ai_system_id === aiSystemId);
  const profile = await db.aiProfiles.findOne(p => p.ai_system_id === aiSystemId);
  const system = await db.aiSystems.findById(aiSystemId);

  const learnings = [];

  if (profile?.data_sensitivity === 'High' || profile?.data_sensitivity === 'Very High') {
    learnings.push({
      id: 'l1',
      title: 'High Sensitivity Data Processing',
      description: `AI frequently interacts with customer records (${profile.data_sensitivity} sensitivity).`,
      type: 'sensitivity',
      resolved: false,
    });
  }

  const recurringPrompt = memories.find(m => m.memory_type === 'recurring_vulnerability' && m.memory_key === 'prompt_injection');
  if (recurringPrompt) {
    learnings.push({
      id: 'l2',
      title: 'Prompt Injection Susceptibility',
      description: recurringPrompt.memory_value,
      type: 'vulnerability',
      resolved: false,
    });
  }

  const resolvedPII = memories.find(m => m.memory_type === 'resolved_vulnerability' && m.memory_key === 'pii_leakage');
  if (resolvedPII) {
    learnings.push({
      id: 'l3',
      title: 'PII Leakage Mitigated via Firewall',
      description: resolvedPII.memory_value,
      type: 'resolved',
      resolved: true,
    });
  }

  const firewallPattern = memories.find(m => m.memory_type === 'firewall_pattern');
  if (firewallPattern) {
    learnings.push({
      id: 'l4',
      title: 'Adversarial Firewall Patterns Captured',
      description: firewallPattern.memory_value,
      type: 'firewall',
      resolved: false,
    });
  }

  if (learnings.length === 0) {
    learnings.push({
      id: 'l0',
      title: 'Initial Profile Established',
      description: `TrustGuard initialized baseline tracking for ${system?.name || 'AI'}.`,
      type: 'info',
      resolved: true,
    });
  }

  return learnings;
};
