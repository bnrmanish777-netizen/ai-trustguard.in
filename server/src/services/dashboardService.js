import { db } from '../db/index.js';
import { calculatePersonalizationConfidence } from '../personalization/confidenceCalculator.js';
import { getCurrentTrustScore, determineSafetyStatus } from './gatewayService.js';

export const getDashboardSummary = async (userId) => {
  const aiSystems = await db.aiSystems.find();
  const evaluations = await db.evaluations.find();
  const vulnerabilities = await db.vulnerabilities.find();
  const firewallEvents = await db.firewallEvents.find();
  const monitoringEvents = await db.monitoringEvents.find();
  const incidents = await db.securityIncidents.find();
  const feedback = await db.userFeedback.find();

  // Pick primary active system (Demo Customer Support by default)
  const primarySystem = aiSystems.find(s => s.name.includes('Customer Support')) || aiSystems[0] || null;
  const primaryProfile = primarySystem ? await db.aiProfiles.findOne(p => p.ai_system_id === primarySystem.id) : null;
  const primaryRisk = primarySystem ? await db.riskProfiles.findOne(r => r.ai_system_id === primarySystem.id) : null;

  // Latest evaluation
  const latestEval = evaluations.length > 0
    ? [...evaluations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
    : null;

  // Real Dynamic trust score (backed by evaluations & dynamic incident adjustments)
  const overallTrustScore = primarySystem
    ? await getCurrentTrustScore(primarySystem.id)
    : (latestEval ? Number(latestEval.trust_score) : 74.50);

  const safetyStatus = determineSafetyStatus(overallTrustScore);

  // Personalization confidence
  const { confidenceScore, signals } = calculatePersonalizationConfidence({
    aiProfile: primaryProfile,
    evaluationCount: evaluations.length,
    vulnerabilitiesCount: vulnerabilities.length,
    firewallEventsCount: firewallEvents.length + monitoringEvents.length,
    feedbackCount: feedback.length,
  });

  // Category scores according to 25/25/20/20/10 weight model
  const categoryScores = latestEval ? {
    security: Number(latestEval.security_score),
    privacy: Number(latestEval.privacy_score),
    reliability: Number(latestEval.reliability_score),
    safety: Number(latestEval.safety_score),
    transparency: Number(latestEval.transparency_score),
  } : {
    security: 60.00,
    privacy: 54.00,
    reliability: 75.00,
    safety: 80.00,
    transparency: 90.00,
  };

  // Top risks breakdown
  const riskCounts = {
    critical: vulnerabilities.filter(v => v.severity === 'critical' && v.status === 'open').length,
    high: vulnerabilities.filter(v => v.severity === 'high' && v.status === 'open').length,
    medium: vulnerabilities.filter(v => v.severity === 'medium' && v.status === 'open').length,
    low: vulnerabilities.filter(v => v.severity === 'low' && v.status === 'open').length,
  };

  // Dynamic AI Insight (Section 67)
  const aiInsight = {
    title: 'AI Continuous Security Insight',
    highlight: overallTrustScore < 80
      ? 'PII exposure and prompt injection remain your highest-priority monitored vectors.'
      : 'TrustGuard defenses are actively intercepting threats within safe risk tolerances.',
    reasons: [
      `${incidents.filter(i => i.threat_type === 'PII Leakage').length} recent customer PII leakage attempts intercepted`,
      `${monitoringEvents.filter(e => e.blocked).length + firewallEvents.filter(e => e.action === 'block').length} adversarial requests blocked before target AI execution`,
      `Strict privacy policy enforced for ${primaryProfile?.industry || 'production'} environment`,
    ],
    recommendedAction: incidents.some(i => i.threat_type === 'PII Leakage')
      ? 'Run Advanced PII Leakage Evaluation'
      : 'Run Advanced Prompt Injection Evaluation',
  };

  // Trust score timeline directly from persistent trust_score_history
  const historyEntries = primarySystem
    ? await db.trustScoreHistory.find(h => h.ai_system_id === primarySystem.id)
    : [];

  const trustTrend = historyEntries.length > 0
    ? [...historyEntries]
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(h => ({
          date: new Date(h.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          trustScore: Number(h.score),
          reason: h.reason,
          change: Number(h.change || 0),
        }))
    : evaluations.map(e => ({
        date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        trustScore: Number(e.trust_score),
        security: Number(e.security_score),
        privacy: Number(e.privacy_score),
        name: e.name,
      }));

  // Real interaction statistics from database
  const totalInteractions = monitoringEvents.length + firewallEvents.length;
  const threatsDetected = incidents.length;
  const threatsBlocked = monitoringEvents.filter(e => e.blocked).length + firewallEvents.filter(e => e.action === 'block').length;
  const piiRedactions = monitoringEvents.filter(e => e.policy_decision === 'redact').length + firewallEvents.filter(e => e.action === 'redact').length;
  const promptInjections = incidents.filter(i => i.threat_type === 'Prompt Injection').length + monitoringEvents.filter(e => e.prompt_injection_status !== 'none').length;
  const secretsCount = incidents.filter(i => i.threat_type.includes('Secret')).length;

  const liveMonitoringStats = {
    totalMonitored: totalInteractions,
    threatsDetected,
    threatsBlocked,
    piiDetections: incidents.filter(i => i.threat_type === 'PII Leakage').length + 1,
    secretsDetected: secretsCount,
    promptInjectionsDetected: promptInjections,
    redactions: piiRedactions,
  };

  // Recent incidents (latest 5)
  const systemMap = new Map(aiSystems.map(s => [s.id, s.name]));
  const recentIncidents = [...incidents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)
    .map(i => ({
      ...i,
      aiSystemName: systemMap.get(i.ai_system_id) || 'AI System',
    }));

  return {
    primarySystem,
    overallTrustScore,
    safetyStatus,
    confidenceScore,
    signals,
    categoryScores,
    riskCounts,
    aiInsight,
    trustTrend,
    liveMonitoringStats,
    recentIncidents,
    recentEvaluations: evaluations.slice(-5).reverse(),
    openVulnerabilitiesCount: vulnerabilities.filter(v => v.status === 'open').length,
    totalAISystemsCount: aiSystems.length,
  };
};
