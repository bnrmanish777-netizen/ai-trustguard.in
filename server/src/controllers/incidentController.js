import { db } from '../db/index.js';
import { upsertMemory } from '../memory/trustMemoryService.js';

export const getIncidents = async (req, res, next) => {
  try {
    const { aiSystemId, severity, threatType, limit = 50 } = req.query;

    let incidents = await db.securityIncidents.find();

    if (aiSystemId) {
      incidents = incidents.filter(i => i.ai_system_id === aiSystemId);
    }
    if (severity) {
      incidents = incidents.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
    }
    if (threatType) {
      incidents = incidents.filter(i => i.threat_type.toLowerCase() === threatType.toLowerCase());
    }

    // Attach AI system name to each incident
    const systems = await db.aiSystems.find();
    const systemMap = new Map(systems.map(s => [s.id, s.name]));

    const enriched = incidents.map(i => ({
      ...i,
      aiSystemName: systemMap.get(i.ai_system_id) || 'Unknown AI System',
    }));

    // Sort newest first
    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json({
      total: enriched.length,
      incidents: enriched.slice(0, Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

export const getIncidentsByAISystem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incidents = await db.securityIncidents.find(i => i.ai_system_id === id);
    const sorted = [...incidents].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json({ incidents: sorted });
  } catch (err) {
    next(err);
  }
};

export const recordIncidentFeedback = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { feedback, comment, category } = req.body;
    // feedback: 'useful' | 'not_useful' | 'false_positive' | 'too_aggressive' | 'correct_detection'

    const incident = await db.securityIncidents.findById(id);
    if (!incident) {
      return res.status(404).json({ error: 'Security incident not found' });
    }

    const updated = await db.securityIncidents.updateById(id, {
      user_feedback: feedback || category,
    });

    // Record in Trust Memory so personalization adapts
    await upsertMemory(
      incident.ai_system_id,
      'user_feedback',
      `incident_feedback_${id.substring(0, 8)}`,
      `User classified incident detection as "${feedback || category}": ${comment || 'User validated firewall rule accuracy.'}`,
      feedback === 'false_positive' ? 'medium' : 'high',
      'user_feedback_loop',
      { incidentId: id, feedback, comment }
    );

    res.json({
      message: 'Feedback recorded successfully and incorporated into AI Trust Memory',
      incident: updated,
    });
  } catch (err) {
    next(err);
  }
};
