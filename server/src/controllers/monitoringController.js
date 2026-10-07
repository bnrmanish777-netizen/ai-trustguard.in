import { db } from '../db/index.js';
import { getCurrentTrustScore, determineSafetyStatus } from '../services/gatewayService.js';

export const getLiveMonitoringStream = async (req, res, next) => {
  try {
    const { aiSystemId, limit = 50 } = req.query;

    let events = await db.monitoringEvents.find();
    if (aiSystemId) {
      events = events.filter(e => e.ai_system_id === aiSystemId);
    }

    const systems = await db.aiSystems.find();
    const systemMap = new Map(systems.map(s => [s.id, s.name]));

    const enriched = events.map(e => ({
      ...e,
      aiSystemName: systemMap.get(e.ai_system_id) || 'Unknown AI System',
    }));

    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      total: enriched.length,
      events: enriched.slice(0, Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

export const getMonitoringStats = async (req, res, next) => {
  try {
    const { aiSystemId } = req.query;

    let events = await db.monitoringEvents.find();
    let incidents = await db.securityIncidents.find();

    if (aiSystemId) {
      events = events.filter(e => e.ai_system_id === aiSystemId);
      incidents = incidents.filter(i => i.ai_system_id === aiSystemId);
    }

    // Target AI system for score evaluation
    const targetSystemId = aiSystemId || (events[0]?.ai_system_id) || '11111111-1111-4000-8000-000000000001';
    const score = await getCurrentTrustScore(targetSystemId);
    const safety = determineSafetyStatus(score);

    const totalMonitored = events.length;
    const threatsDetected = incidents.length;
    const threatsBlocked = events.filter(e => e.blocked === true).length + incidents.filter(i => i.action_taken === 'blocked').length;
    const piiDetections = incidents.filter(i => i.threat_type === 'PII Leakage').length + events.filter(e => e.detected_pii?.length > 0).length;
    const secretsDetected = incidents.filter(i => i.threat_type.includes('Secret')).length + events.filter(e => e.detected_secrets?.length > 0).length;
    const promptInjections = incidents.filter(i => i.threat_type === 'Prompt Injection').length + events.filter(e => e.prompt_injection_status !== 'none').length;
    const redactions = events.filter(e => e.policy_decision === 'redact').length + incidents.filter(i => i.action_taken === 'redacted').length;

    res.json({
      totalMonitored,
      threatsDetected,
      threatsBlocked,
      piiDetections,
      secretsDetected,
      promptInjections,
      redactions,
      currentTrustScore: score,
      safetyStatus: safety.status,
      safetyLabel: safety.label,
      safetySummary: safety.summary,
    });
  } catch (err) {
    next(err);
  }
};
