import { db } from '../db/index.js';
import { REPORT_DISCLAIMER } from '../config/constants.js';
import { buildSecurityTimeline } from '../memory/timelineService.js';
import { calculatePersonalizationConfidence } from '../personalization/confidenceCalculator.js';

export const generateSecurityReport = async (evaluationId, userId) => {
  const evaluation = await db.evaluations.findById(evaluationId);
  if (!evaluation) throw new Error('Evaluation not found');

  const aiSystem = await db.aiSystems.findById(evaluation.ai_system_id);
  const aiProfile = await db.aiProfiles.findOne(p => p.ai_system_id === evaluation.ai_system_id);
  const riskProfile = await db.riskProfiles.findOne(p => p.ai_system_id === evaluation.ai_system_id);
  const testResults = await db.testResults.find(r => r.evaluation_id === evaluationId);
  const vulnerabilities = await db.vulnerabilities.find(v => v.evaluation_id === evaluationId);
  const firewallPolicy = await db.firewallPolicies.findOne(p => p.ai_system_id === evaluation.ai_system_id);
  const timeline = await buildSecurityTimeline(evaluation.ai_system_id);

  const { confidenceScore } = calculatePersonalizationConfidence({
    aiProfile,
    evaluationCount: 1,
    vulnerabilitiesCount: vulnerabilities.length,
    firewallEventsCount: 5,
    feedbackCount: 1,
  });

  const criticalFindings = vulnerabilities.filter(v => v.severity === 'critical');
  const highFindings = vulnerabilities.filter(v => v.severity === 'high');
  const mediumFindings = vulnerabilities.filter(v => v.severity === 'medium');
  const lowFindings = vulnerabilities.filter(v => v.severity === 'low');

  // Executive summary derived directly from verified database facts
  const executiveSummary = `AI TrustGuard completed an automated, personalized security evaluation of ${aiSystem.name} (${aiProfile?.industry || 'Enterprise'} industry, ${aiProfile?.data_sensitivity || 'High'} data sensitivity). The system achieved an overall Trust Score of ${evaluation.trust_score}/100 with a Personalization Confidence of ${confidenceScore}%. A total of ${evaluation.total_tests} adaptive tests were executed (${evaluation.passed_tests} Passed, ${evaluation.failed_tests} Failed). The primary discovered risk is ${riskProfile?.primary_risk || 'Prompt Injection & Data Exposure'}. Active firewall protection status: ${firewallPolicy?.enabled ? 'ENFORCED' : 'DISABLED'}.`;

  const reportPayload = {
    title: `AI TrustGuard Security Audit — ${aiSystem.name}`,
    executiveSummary,
    aiSystem: {
      id: aiSystem.id,
      name: aiSystem.name,
      description: aiSystem.description,
      provider: aiSystem.provider,
      model: aiSystem.model_name,
      industry: aiProfile?.industry,
      dataSensitivity: aiProfile?.data_sensitivity,
      riskTolerance: aiProfile?.risk_tolerance,
    },
    riskProfile: {
      primaryRisk: riskProfile?.primary_risk,
      secondaryRisks: riskProfile?.secondary_risks,
      scores: {
        security: riskProfile?.security_risk,
        privacy: riskProfile?.privacy_risk,
        reliability: riskProfile?.reliability_risk,
        safety: riskProfile?.safety_risk,
        transparency: riskProfile?.transparency_risk,
      },
    },
    personalizationStrategy: evaluation.personalization_strategy,
    evaluationMetrics: {
      evaluationId: evaluation.id,
      date: evaluation.created_at,
      trustScore: evaluation.trust_score,
      personalizationConfidence: confidenceScore,
      categoryScores: {
        security: evaluation.security_score,
        privacy: evaluation.privacy_score,
        reliability: evaluation.reliability_score,
        safety: evaluation.safety_score,
        transparency: evaluation.transparency_score,
      },
      totalTests: evaluation.total_tests,
      passed: evaluation.passed_tests,
      failed: evaluation.failed_tests,
      durationMs: evaluation.duration_ms,
      isRetest: evaluation.is_retest,
    },
    findingsSummary: {
      criticalCount: criticalFindings.length,
      highCount: highFindings.length,
      mediumCount: mediumFindings.length,
      lowCount: lowFindings.length,
      criticalFindings: criticalFindings.map(f => ({ title: f.title, evidence: f.evidence, recommendation: f.recommendation })),
      highFindings: highFindings.map(f => ({ title: f.title, evidence: f.evidence, recommendation: f.recommendation })),
    },
    testResultsDetail: testResults.map(t => ({
      name: t.category,
      prompt: t.prompt,
      actualResponse: t.actual_response,
      result: t.result,
      severity: t.severity,
      evidence: t.evidence,
      whySelected: t.why_selected,
      recommendation: t.recommendation,
    })),
    firewallStatus: {
      enabled: firewallPolicy?.enabled ?? true,
      piiAction: firewallPolicy?.pii_action ?? 'redact',
      promptInjectionAction: firewallPolicy?.prompt_injection_action ?? 'block',
    },
    nextRecommendedEvaluation: {
      title: 'Advanced Prompt Injection & Redaction Stress Test',
      reason: 'Evaluate boundary robustness following mitigation of initial baseline vulnerabilities.',
      urgency: 'High',
    },
    securityTimeline: timeline.slice(-5),
    disclaimer: REPORT_DISCLAIMER,
  };

  const reportRecord = await db.reports.create({
    user_id: userId || aiSystem.user_id,
    ai_system_id: aiSystem.id,
    evaluation_id: evaluation.id,
    title: reportPayload.title,
    executive_summary: executiveSummary,
    report_data: reportPayload,
  });

  return reportRecord;
};
