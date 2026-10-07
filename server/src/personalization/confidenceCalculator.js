// Transparent Personalization Confidence Calculator (Section 18)

export const calculatePersonalizationConfidence = ({
  aiProfile,
  evaluationCount = 0,
  vulnerabilitiesCount = 0,
  firewallEventsCount = 0,
  feedbackCount = 0,
}) => {
  const signals = [];
  let score = 30; // Baseline starting score

  // 1. AI purpose identified (+10)
  if (aiProfile?.purpose && aiProfile.purpose.trim().length > 10) {
    signals.push({ name: 'AI purpose identified', weight: 10, present: true });
    score += 10;
  } else {
    signals.push({ name: 'AI purpose identified', weight: 10, present: false });
  }

  // 2. Industry identified (+10)
  if (aiProfile?.industry && aiProfile.industry.trim().length > 0) {
    signals.push({ name: 'Industry context identified', weight: 10, present: true });
    score += 10;
  } else {
    signals.push({ name: 'Industry context identified', weight: 10, present: false });
  }

  // 3. Data sensitivity identified (+10)
  if (aiProfile?.data_sensitivity) {
    signals.push({ name: 'Data sensitivity profile defined', weight: 10, present: true });
    score += 10;
  } else {
    signals.push({ name: 'Data sensitivity profile defined', weight: 10, present: false });
  }

  // 4. Historical evaluations available (+15)
  if (evaluationCount > 0) {
    const boost = Math.min(15, 10 + evaluationCount * 2);
    signals.push({ name: 'Historical evaluations recorded', weight: boost, present: true });
    score += boost;
  } else {
    signals.push({ name: 'Historical evaluations recorded', weight: 15, present: false });
  }

  // 5. Previous vulnerabilities available (+10)
  if (vulnerabilitiesCount > 0) {
    signals.push({ name: 'Known vulnerabilities cataloged', weight: 10, present: true });
    score += 10;
  } else {
    signals.push({ name: 'Known vulnerabilities cataloged', weight: 10, present: false });
  }

  // 6. Firewall history available (+10)
  if (firewallEventsCount > 0) {
    signals.push({ name: 'Firewall telemetry active', weight: 10, present: true });
    score += 10;
  } else {
    signals.push({ name: 'Firewall telemetry active', weight: 10, present: false });
  }

  // 7. User feedback available (+10)
  if (feedbackCount > 0) {
    signals.push({ name: 'Operator feedback incorporated', weight: 10, present: true });
    score += 10;
  } else {
    signals.push({ name: 'Operator feedback incorporated', weight: 10, present: false });
  }

  // Clamp confidence between 40 and 98%
  const confidenceScore = Math.min(98, Math.max(40, score));

  return {
    confidenceScore,
    signals,
    presentSignalsCount: signals.filter(s => s.present).length,
    totalSignalsCount: signals.length,
  };
};
