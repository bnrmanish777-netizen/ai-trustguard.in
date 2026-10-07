import { db } from '../db/index.js';
import { runEvaluation, compareEvaluations } from '../services/evaluationService.js';

export const listEvaluations = async (req, res, next) => {
  try {
    const { aiSystemId } = req.query;
    const filter = aiSystemId
      ? (e) => e.ai_system_id === aiSystemId
      : () => true;

    const evaluations = await db.evaluations.find(filter);
    
    // Enrich with AI System names
    const enriched = await Promise.all(evaluations.map(async e => {
      const system = await db.aiSystems.findById(e.ai_system_id);
      return {
        ...e,
        aiSystemName: system ? system.name : 'Unknown AI System',
      };
    }));

    res.json({ evaluations: enriched.reverse() });
  } catch (err) {
    next(err);
  }
};

export const getEvaluationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const evaluation = await db.evaluations.findById(id);
    if (!evaluation) return res.status(404).json({ error: 'Evaluation not found' });

    const system = await db.aiSystems.findById(evaluation.ai_system_id);
    const results = await db.testResults.find(r => r.evaluation_id === id);
    const vulnerabilities = await db.vulnerabilities.find(v => v.evaluation_id === id);

    res.json({
      evaluation: {
        ...evaluation,
        aiSystemName: system ? system.name : 'Unknown AI System',
      },
      results,
      vulnerabilities,
    });
  } catch (err) {
    next(err);
  }
};

export const getEvaluationResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.testResults.find(r => r.evaluation_id === id);
    res.json({ results });
  } catch (err) {
    next(err);
  }
};

export const createAndRunEvaluation = async (req, res, next) => {
  try {
    const {
      aiSystemId,
      name,
      isRetest = false,
      withFirewall = false,
      customTestCases = null,
    } = req.body;

    if (!aiSystemId) {
      return res.status(400).json({ error: 'aiSystemId is required' });
    }

    const result = await runEvaluation({
      aiSystemId,
      userId: req.user.id,
      name,
      isRetest,
      withFirewall,
      customTestCases,
    });

    res.status(201).json({
      message: isRetest ? 'Retest evaluation completed with active protection' : 'Personalized evaluation completed',
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

export const compareEvaluationsHandler = async (req, res, next) => {
  try {
    const { baselineId, retestId } = req.query;
    if (!baselineId || !retestId) {
      // If none provided, pick baseline and latest retest automatically
      const evals = await db.evaluations.find();
      const baseline = evals.find(e => !e.is_retest) || evals[0];
      const retest = evals.find(e => e.is_retest) || evals[evals.length - 1];

      if (!baseline || !retest) {
        return res.status(400).json({ error: 'Need at least two evaluations to compare' });
      }

      const comparison = await compareEvaluations({ baselineId: baseline.id, retestId: retest.id });
      return res.json(comparison);
    }

    const comparison = await compareEvaluations({ baselineId, retestId });
    res.json(comparison);
  } catch (err) {
    next(err);
  }
};
