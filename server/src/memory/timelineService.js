import { db } from '../db/index.js';

export const buildSecurityTimeline = async (aiSystemId) => {
  const system = await db.aiSystems.findById(aiSystemId);
  if (!system) return [];

  const evaluations = await db.evaluations.find(e => e.ai_system_id === aiSystemId);
  const vulnerabilities = await db.vulnerabilities.find(v => v.ai_system_id === aiSystemId);
  const firewallEvents = await db.firewallEvents.find(e => e.ai_system_id === aiSystemId);
  const memories = await db.trustMemory.find(m => m.ai_system_id === aiSystemId);

  const timeline = [];

  // 1. AI Creation Event
  timeline.push({
    date: system.created_at,
    title: 'AI System Added',
    description: `${system.name} registered with purpose: ${system.description || 'Support assistant'}.`,
    type: 'system',
    icon: 'Bot',
    badge: 'registered',
  });

  // 2. Risk Profile Generation
  const riskProfile = await db.riskProfiles.findOne(r => r.ai_system_id === aiSystemId);
  if (riskProfile) {
    timeline.push({
      date: riskProfile.created_at || system.created_at,
      title: 'Initial Risk Profile Created',
      description: `Primary risk identified as ${riskProfile.primary_risk} (Confidence: ${riskProfile.risk_confidence}%).`,
      type: 'risk',
      icon: 'ShieldAlert',
      badge: 'profile',
    });
  }

  // 3. Evaluations Run
  evaluations.forEach((evalItem) => {
    timeline.push({
      date: evalItem.created_at,
      title: evalItem.is_retest ? 'Retest Assessment Completed' : 'Security Assessment Executed',
      description: `Trust Score calculated at ${evalItem.trust_score}/100 (${evalItem.passed_tests} Passed, ${evalItem.failed_tests} Failed).`,
      type: evalItem.trust_score >= 80 ? 'success' : 'warning',
      icon: 'Activity',
      badge: `Score: ${evalItem.trust_score}`,
    });
  });

  // 4. Vulnerability Discoveries
  vulnerabilities.forEach(v => {
    timeline.push({
      date: v.created_at,
      title: `Vulnerability Discovered: ${v.title}`,
      description: `${v.severity.toUpperCase()} severity in category '${v.category}': ${v.description}`,
      type: 'vulnerability',
      icon: 'AlertTriangle',
      badge: v.severity,
    });
  });

  // 5. Firewall Events & Milestones
  if (firewallEvents.length > 0) {
    const blockedCount = firewallEvents.filter(e => e.action === 'block').length;
    timeline.push({
      date: firewallEvents[0].created_at,
      title: 'AI TrustGuard Firewall Enforced',
      description: `Firewall actively protecting endpoint; ${blockedCount} malicious injection attempt(s) blocked.`,
      type: 'firewall',
      icon: 'ShieldCheck',
      badge: 'firewall',
    });
  }

  // Sort timeline chronologically (latest first or earliest first - earliest first is standard chronological progression)
  return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
};
