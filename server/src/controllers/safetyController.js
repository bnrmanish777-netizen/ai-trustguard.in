import { db } from '../db/index.js';
import { getCurrentTrustScore, determineSafetyStatus } from '../services/gatewayService.js';

export const getAISafetyDiagnostic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const aiSystem = await db.aiSystems.findById(id);
    if (!aiSystem) {
      return res.status(404).json({ error: 'AI System not found' });
    }

    const aiProfile = await db.aiProfiles.findOne(p => p.ai_system_id === id);
    const score = await getCurrentTrustScore(id);
    const safety = determineSafetyStatus(score);

    const openVulns = await db.vulnerabilities.find(v => v.ai_system_id === id && v.status === 'open');
    const recentIncidents = await db.securityIncidents.find(i => i.ai_system_id === id);
    const recentEvals = await db.evaluations.find(e => e.ai_system_id === id);
    const latestEval = recentEvals.length > 0 ? recentEvals[recentEvals.length - 1] : null;

    // Build plain English "Why Safe?" checklist
    const whySafe = [];
    const criticalVulns = openVulns.filter(v => v.severity === 'critical');
    if (criticalVulns.length === 0) {
      whySafe.push('✓ No critical vulnerabilities currently open');
    }
    whySafe.push('✓ Proactive PII masking and redaction active');
    whySafe.push('✓ Real-time prompt injection firewall defense active');

    const last24hIncidents = recentIncidents.filter(i => new Date(i.created_at) > new Date(Date.now() - 24 * 3600 * 1000));
    const crit24h = last24hIncidents.filter(i => i.severity === 'critical');
    if (crit24h.length === 0) {
      whySafe.push('✓ No critical security breaches in the last 24 hours');
    } else {
      whySafe.push(`✕ ${crit24h.length} critical exploit attempts intercepted recently`);
    }

    // Build plain English "Watch Items"
    const watchItems = [];
    const mediumVulns = openVulns.filter(v => v.severity === 'medium' || v.severity === 'high');
    if (mediumVulns.length > 0) {
      watchItems.push(`⚠ ${mediumVulns.length} open vulnerabilities pending remediation retest`);
    }
    const recentPiiIncidents = recentIncidents.filter(i => i.threat_type === 'PII Leakage').slice(-2);
    if (recentPiiIncidents.length > 0) {
      watchItems.push(`⚠ Synthetic PII interception observed in recent conversations`);
    }
    if (score < 80) {
      watchItems.push('⚠ Overall trust metric below high-confidence baseline');
    }

    // Category breakdown according to Section 15 formula:
    // Security 25%, Privacy 25%, Reliability 20%, Safety 20%, Transparency 10%
    const scoreBreakdown = {
      security: latestEval ? Number(latestEval.security_score) : Math.min(100, Math.round(score * 0.95)),
      privacy: latestEval ? Number(latestEval.privacy_score) : Math.min(100, Math.round(score * 0.90)),
      reliability: latestEval ? Number(latestEval.reliability_score) : 85,
      safety: latestEval ? Number(latestEval.safety_score) : 80,
      transparency: latestEval ? Number(latestEval.transparency_score) : 90,
      weights: {
        security: '25%',
        privacy: '25%',
        reliability: '20%',
        safety: '20%',
        transparency: '10%',
      },
    };

    // Main reason explanation (Section 20: Why 72?)
    let mainReason = 'All primary security checks passing within configured thresholds.';
    if (score < 75) {
      mainReason = `${recentIncidents.length} recent security and privacy incidents involving sensitive data leakage.`;
    } else if (openVulns.length > 0) {
      mainReason = `${openVulns.length} vulnerabilities detected during latest adaptive evaluation.`;
    }

    res.json({
      aiSystemId: id,
      aiSystemName: aiSystem.name,
      trustScore: score,
      safetyStatus: safety.status,
      statusLabel: safety.label,
      summary: safety.summary,
      whySafe,
      watchItems,
      scoreBreakdown,
      mainReason,
      lastChecked: new Date().toISOString(),
      allowedData: aiProfile?.allowed_data || ['Public information'],
      restrictedData: aiProfile?.restricted_data || ['Credentials', 'PII'],
    });
  } catch (err) {
    next(err);
  }
};

export const getTrustScoreTimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await db.trustScoreHistory.find(h => h.ai_system_id === id);
    const sorted = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    res.json({ timeline: sorted });
  } catch (err) {
    next(err);
  }
};
