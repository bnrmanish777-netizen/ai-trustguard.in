// AI Risk Profile Generator
// Generates deterministic risk dimensions based on AI Purpose, Industry, Data Sensitivity, Risk Tolerance, and Historical Data

export const generateRiskProfile = ({
  aiProfile,
  evaluationHistory = [],
  firewallEvents = [],
  vulnerabilities = [],
}) => {
  const sensitivity = (aiProfile?.data_sensitivity || 'Medium').toLowerCase();
  const tolerance = (aiProfile?.risk_tolerance || 'Medium').toLowerCase();
  const industry = (aiProfile?.industry || '').toLowerCase();
  const purpose = (aiProfile?.purpose || '').toLowerCase();

  // Baseline risk calculations based on context
  let securityRisk = 50;
  let privacyRisk = 50;
  let reliabilityRisk = 50;
  let safetyRisk = 50;
  let transparencyRisk = 40;

  // 1. Data Sensitivity Adjustments
  if (sensitivity === 'very high' || sensitivity === 'critical') {
    privacyRisk += 35;
    securityRisk += 25;
  } else if (sensitivity === 'high') {
    privacyRisk += 25;
    securityRisk += 20;
  } else if (sensitivity === 'low') {
    privacyRisk -= 15;
  }

  // 2. Risk Tolerance Adjustments
  if (tolerance === 'very low') {
    securityRisk += 15;
    reliabilityRisk += 20;
    safetyRisk += 20;
  } else if (tolerance === 'low') {
    securityRisk += 10;
    reliabilityRisk += 10;
    safetyRisk += 10;
  } else if (tolerance === 'high') {
    securityRisk -= 10;
    reliabilityRisk -= 10;
  }

  // 3. Industry Specific Hazards
  if (industry.includes('finance') || industry.includes('banking')) {
    privacyRisk += 15;
    reliabilityRisk += 15;
    transparencyRisk += 20;
  } else if (industry.includes('commerce') || industry.includes('retail')) {
    privacyRisk += 15;
    securityRisk += 15;
  } else if (industry.includes('software') || industry.includes('tech') || industry.includes('developer')) {
    securityRisk += 25;
    transparencyRisk -= 10;
  } else if (industry.includes('health') || industry.includes('medical')) {
    privacyRisk += 30;
    safetyRisk += 25;
    reliabilityRisk += 20;
  }

  // 4. Historical Vulnerability Impact
  const openVulns = vulnerabilities.filter(v => v.status === 'open');
  openVulns.forEach(v => {
    if (v.category === 'prompt_injection' || v.category === 'system_prompt_extraction' || v.category === 'sensitive_data') {
      securityRisk += (v.severity === 'critical' ? 12 : 8);
    } else if (v.category === 'pii_leakage') {
      privacyRisk += (v.severity === 'critical' ? 14 : 10);
    } else if (v.category === 'hallucination' || v.category === 'reliability') {
      reliabilityRisk += 10;
    } else if (v.category === 'unsafe_response' || v.category === 'fairness') {
      safetyRisk += 10;
    }
  });

  // 5. Firewall History Impact (Section 31: Firewall Learning)
  const recentBlockedInjection = firewallEvents.filter(e => e.event_type.includes('injection') && e.action === 'block').length;
  if (recentBlockedInjection > 5) {
    securityRisk += 10;
  }
  const recentRedactions = firewallEvents.filter(e => e.action === 'redact').length;
  if (recentRedactions > 5) {
    privacyRisk += 8;
  }

  // Clamp risks between 10 and 99
  securityRisk = Math.min(99, Math.max(15, securityRisk));
  privacyRisk = Math.min(99, Math.max(15, privacyRisk));
  reliabilityRisk = Math.min(99, Math.max(15, reliabilityRisk));
  safetyRisk = Math.min(99, Math.max(15, safetyRisk));
  transparencyRisk = Math.min(99, Math.max(10, transparencyRisk));

  // Determine Primary & Secondary Risks
  const riskScores = [
    { name: 'Security Risk (Prompt Injection & Secrets)', score: securityRisk, cat: 'security' },
    { name: 'Privacy Risk (PII & Sensitive Data Leakage)', score: privacyRisk, cat: 'privacy' },
    { name: 'Reliability Risk (Hallucination & Scope Creep)', score: reliabilityRisk, cat: 'reliability' },
    { name: 'Safety Risk (Unsafe Output & Alignment)', score: safetyRisk, cat: 'safety' },
    { name: 'Transparency Risk (Opaque Logic & Explanations)', score: transparencyRisk, cat: 'transparency' },
  ].sort((a, b) => b.score - a.score);

  const primaryRisk = riskScores[0].name;
  const secondaryRisks = riskScores.slice(1, 3).map(r => r.name);

  // Derive Recommended Test Categories
  const recommendedTestCategories = [];
  if (securityRisk >= 70) {
    recommendedTestCategories.push('prompt_injection', 'system_prompt_extraction', 'sensitive_data');
  }
  if (privacyRisk >= 70) {
    recommendedTestCategories.push('pii_leakage');
  }
  if (reliabilityRisk >= 65) {
    recommendedTestCategories.push('hallucination', 'reliability');
  }
  if (safetyRisk >= 65) {
    recommendedTestCategories.push('unsafe_response');
  }
  if (transparencyRisk >= 60) {
    recommendedTestCategories.push('transparency');
  }

  return {
    security_risk: securityRisk,
    privacy_risk: privacyRisk,
    reliability_risk: reliabilityRisk,
    safety_risk: safetyRisk,
    transparency_risk: transparencyRisk,
    primary_risk: primaryRisk,
    secondary_risks: secondaryRisks,
    recommended_test_categories: [...new Set(recommendedTestCategories)],
  };
};
