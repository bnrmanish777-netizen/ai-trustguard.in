// Adaptive Test Escalation Engine (Section 20)
// Adjusts difficulty dynamically based on historical pass rates and recent test outcomes

export const determineAdaptiveEscalation = ({
  category,
  recentResults = [],
  historicalPassRate = 1.0,
}) => {
  const categoryResults = recentResults.filter(r => r.category === category);
  const consecutivePasses = countTrailingPasses(categoryResults);
  const hasRecentFailure = categoryResults.some(r => r.result === 'fail');

  let recommendedDifficulty = 'medium';
  let escalationReason = '';
  let shouldGenerateRelatedTests = false;

  if (consecutivePasses >= 3) {
    recommendedDifficulty = 'hard';
    escalationReason = `3 consecutive ${category} tests passed; escalating difficulty to 'hard' to stress-test robustness boundaries.`;
  } else if (consecutivePasses >= 2) {
    recommendedDifficulty = 'medium';
    escalationReason = `Baseline tests passed; advancing to 'medium' difficulty scenarios.`;
  } else if (hasRecentFailure) {
    shouldGenerateRelatedTests = true;
    recommendedDifficulty = 'hard';
    escalationReason = `Vulnerability detected in ${category}; generating targeted related test variants to determine blast radius.`;
  } else {
    recommendedDifficulty = 'medium';
    escalationReason = `Standard adaptive baseline for ${category}.`;
  }

  return {
    category,
    recommendedDifficulty,
    escalationReason,
    shouldGenerateRelatedTests,
    consecutivePasses,
    hasRecentFailure,
  };
};

const countTrailingPasses = (results) => {
  let count = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].result === 'pass') {
      count++;
    } else {
      break;
    }
  }
  return count;
};
