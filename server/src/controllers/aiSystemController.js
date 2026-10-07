import { db } from '../db/index.js';
import { generateRiskProfile } from '../personalization/riskProfileGenerator.js';
import { generatePersonalizedStrategy } from '../personalization/personalizationEngine.js';
import { getWhatTrustGuardLearned } from '../memory/trustMemoryService.js';
import { buildSecurityTimeline } from '../memory/timelineService.js';
import { calculatePersonalizationConfidence } from '../personalization/confidenceCalculator.js';
import { getCurrentTrustScore, determineSafetyStatus } from '../services/gatewayService.js';

export const getAISystems = async (req, res, next) => {
  try {
    const systems = await db.aiSystems.find();
    // Return systems with profile and latest score summary
    const enhanced = await Promise.all(systems.map(async s => {
      const profile = await db.aiProfiles.findOne(p => p.ai_system_id === s.id);
      const risk = await db.riskProfiles.findOne(r => r.ai_system_id === s.id);
      const evals = await db.evaluations.find(e => e.ai_system_id === s.id);
      const score = await getCurrentTrustScore(s.id);
      const safety = determineSafetyStatus(score);

      return {
        ...s,
        api_key_encrypted: undefined, // Never expose API keys (Section 11)
        profile,
        riskProfile: risk,
        latestTrustScore: score,
        safetyStatus: safety.status,
        safetyLabel: safety.label,
        evaluationsCount: evals.length,
      };
    }));

    res.json({ aiSystems: enhanced });
  } catch (err) {
    next(err);
  }
};

export const getAISystemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const system = await db.aiSystems.findById(id);
    if (!system) return res.status(404).json({ error: 'AI System not found' });

    const profile = await db.aiProfiles.findOne(p => p.ai_system_id === id);
    const riskProfile = await db.riskProfiles.findOne(r => r.ai_system_id === id);
    const strategy = await db.personalizationStrategies.findOne(s => s.ai_system_id === id);
    const learned = await getWhatTrustGuardLearned(id);
    const timeline = await buildSecurityTimeline(id);
    const firewallPolicy = await db.firewallPolicies.findOne(p => p.ai_system_id === id);

    const score = await getCurrentTrustScore(id);
    const safety = determineSafetyStatus(score);

    res.json({
      aiSystem: {
        ...system,
        api_key_encrypted: undefined,
        latestTrustScore: score,
        safetyStatus: safety.status,
        safetyLabel: safety.label,
      },
      profile,
      riskProfile,
      strategy,
      whatTrustGuardLearned: learned,
      timeline,
      firewallPolicy,
      safety,
    });
  } catch (err) {
    next(err);
  }
};

export const createAISystem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      provider = 'gemini',
      model_name = 'gemini-1.5-pro',
      endpoint_url,
      system_type = 'custom',
      purpose,
      industry = 'Technology',
      data_sensitivity = 'Medium',
      risk_tolerance = 'Medium',
      security_priority = 25,
      privacy_priority = 25,
      reliability_priority = 20,
      safety_priority = 20,
      transparency_priority = 10,
      allowed_data = ['Public information', 'Customer names'],
      restricted_data = ['Passwords', 'Credit card numbers', 'Authentication tokens'],
      ai_restrictions = ['Must not expose personal data', 'Must not expose system prompts', 'Must not reveal credentials'],
    } = req.body;

    if (!name) return res.status(400).json({ error: 'AI System name is required' });

    const newSystem = await db.aiSystems.create({
      user_id: req.user.id,
      name,
      description,
      provider,
      model_name,
      endpoint_url,
      system_type,
      status: 'active',
    });

    const newProfile = await db.aiProfiles.create({
      ai_system_id: newSystem.id,
      purpose: purpose || description || 'Custom assistant',
      industry,
      data_sensitivity,
      risk_tolerance,
      security_priority,
      privacy_priority,
      reliability_priority,
      safety_priority,
      transparency_priority,
      user_type: 'end_users',
      allowed_data: Array.isArray(allowed_data) ? allowed_data : [allowed_data],
      restricted_data: Array.isArray(restricted_data) ? restricted_data : [restricted_data],
      ai_restrictions: Array.isArray(ai_restrictions) ? ai_restrictions : [ai_restrictions],
      known_capabilities: ['Conversational assistance'],
      known_restrictions: ['Must protect sensitive information'],
    });

    // Generate Initial Risk Profile & Strategy
    const initialRisk = generateRiskProfile({ aiProfile: newProfile });
    const newRiskProfile = await db.riskProfiles.create({
      ai_system_id: newSystem.id,
      ...initialRisk,
      risk_confidence: 85,
      profile_version: 1,
    });

    const initialStrategy = generatePersonalizedStrategy({
      aiProfile: newProfile,
      riskProfile: newRiskProfile,
    });

    await db.personalizationStrategies.create({
      ai_system_id: newSystem.id,
      security_weight: initialStrategy.securityWeight,
      privacy_weight: initialStrategy.privacyWeight,
      reliability_weight: initialStrategy.reliabilityWeight,
      safety_weight: initialStrategy.safetyWeight,
      transparency_weight: initialStrategy.transparencyWeight,
      priority_categories: initialStrategy.priorityCategories,
      recommended_difficulty: initialStrategy.recommendedDifficulty,
      recommended_tests_count: initialStrategy.recommendedTestsCount,
      reasoning: initialStrategy.reasoning,
      confidence_score: initialStrategy.confidenceScore,
    });

    // Default Firewall Policy
    await db.firewallPolicies.create({
      ai_system_id: newSystem.id,
      pii_action: 'redact',
      prompt_injection_action: 'block',
      sensitive_data_action: 'block',
      secret_action: 'redact',
      unsafe_content_action: 'block',
      enabled: true,
    });

    // Initialize Baseline Trust Score History
    await db.trustScoreHistory.create({
      ai_system_id: newSystem.id,
      score: 85.00,
      previous_score: null,
      change: 0,
      reason: 'AI System successfully onboarded with personalized security profile.',
      event_type: 'onboarding',
    });

    res.status(201).json({
      message: 'AI System and Personalized Profile created successfully',
      aiSystem: newSystem,
      profile: newProfile,
      riskProfile: newRiskProfile,
    });
  } catch (err) {
    next(err);
  }
};

export const updateAISystem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await db.aiSystems.updateById(id, req.body);
    if (!updated) return res.status(404).json({ error: 'AI System not found' });
    res.json({ message: 'AI System updated', aiSystem: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteAISystem = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.aiSystems.deleteById(id);
    res.json({ message: 'AI System deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const getAIProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const profile = await db.aiProfiles.findOne(p => p.ai_system_id === id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ profile });
  } catch (err) {
    next(err);
  }
};

export const updateAIProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.aiProfiles.findOne(p => p.ai_system_id === id);
    if (!existing) return res.status(404).json({ error: 'Profile not found' });

    const updatedProfile = await db.aiProfiles.updateById(existing.id, req.body);

    // Refresh Risk Profile & Strategy when profile updates
    const vulns = await db.vulnerabilities.find(v => v.ai_system_id === id);
    const evals = await db.evaluations.find(e => e.ai_system_id === id);
    const updatedRisk = generateRiskProfile({ aiProfile: updatedProfile, vulnerabilities: vulns, evaluationHistory: evals });
    
    const riskRecord = await db.riskProfiles.findOne(r => r.ai_system_id === id);
    if (riskRecord) {
      await db.riskProfiles.updateById(riskRecord.id, {
        ...updatedRisk,
        profile_version: (riskRecord.profile_version || 1) + 1,
      });
    }

    res.json({ message: 'AI Profile updated and Risk Profile synchronized', profile: updatedProfile });
  } catch (err) {
    next(err);
  }
};

export const getAIPersonalizationCenter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const system = await db.aiSystems.findById(id);
    if (!system) return res.status(404).json({ error: 'AI System not found' });

    const profile = await db.aiProfiles.findOne(p => p.ai_system_id === id);
    const riskProfile = await db.riskProfiles.findOne(r => r.ai_system_id === id);
    const vulns = await db.vulnerabilities.find(v => v.ai_system_id === id);
    const evals = await db.evaluations.find(e => e.ai_system_id === id);
    const firewallEvents = await db.firewallEvents.find(e => e.ai_system_id === id);
    const feedback = await db.userFeedback.find(f => f.ai_system_id === id);

    const strategy = generatePersonalizedStrategy({
      aiProfile: profile,
      riskProfile,
      evaluationHistory: evals,
      vulnerabilities: vulns,
      firewallEvents,
      userFeedback: feedback,
    });

    const learned = await getWhatTrustGuardLearned(id);

    const { confidenceScore, signals } = calculatePersonalizationConfidence({
      aiProfile: profile,
      evaluationCount: evals.length,
      vulnerabilitiesCount: vulns.length,
      firewallEventsCount: firewallEvents.length,
      feedbackCount: feedback.length,
    });

    res.json({
      aiSystem: system,
      profile,
      riskProfile,
      strategy,
      whatTrustGuardLearned: learned,
      personalizationConfidence: {
        score: confidenceScore,
        signals,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAITrustMemory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const memories = await db.trustMemory.find(m => m.ai_system_id === id);
    const learned = await getWhatTrustGuardLearned(id);
    const timeline = await buildSecurityTimeline(id);

    res.json({
      memories,
      whatTrustGuardLearned: learned,
      timeline,
    });
  } catch (err) {
    next(err);
  }
};
