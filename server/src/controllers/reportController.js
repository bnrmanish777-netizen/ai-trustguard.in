import { db } from '../db/index.js';
import { generateSecurityReport } from '../services/reportService.js';

export const listReports = async (req, res, next) => {
  try {
    const { aiSystemId } = req.query;
    let reports = await db.reports.find();
    if (aiSystemId) reports = reports.filter(r => r.ai_system_id === aiSystemId);

    // Enrich with AI names
    const enriched = await Promise.all(reports.map(async r => {
      const system = await db.aiSystems.findById(r.ai_system_id);
      return {
        ...r,
        aiSystemName: system ? system.name : 'Target AI',
      };
    }));

    res.json({ reports: enriched.reverse() });
  } catch (err) {
    next(err);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await db.reports.findById(id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const system = await db.aiSystems.findById(report.ai_system_id);

    res.json({
      report: {
        ...report,
        aiSystemName: system ? system.name : 'Target AI',
      },
    });
  } catch (err) {
    next(err);
  }
};

export const createReportForEvaluation = async (req, res, next) => {
  try {
    const { evaluationId } = req.params;
    const report = await generateSecurityReport(evaluationId, req.user.id);
    res.status(201).json({
      message: 'Formal Security Audit Report successfully generated',
      report,
    });
  } catch (err) {
    next(err);
  }
};
