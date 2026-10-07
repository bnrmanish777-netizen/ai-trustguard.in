import { db } from '../db/index.js';
import { scanPrompt, scanResponse } from '../firewall/firewallService.js';

export const checkPrompt = async (req, res, next) => {
  try {
    const { prompt, aiSystemId } = req.body;
    if (!prompt || !aiSystemId) {
      return res.status(400).json({ error: 'prompt and aiSystemId are required' });
    }

    const result = await scanPrompt({
      prompt,
      aiSystemId,
      userId: req.user ? req.user.id : null,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const checkResponse = async (req, res, next) => {
  try {
    const { responseText, aiSystemId } = req.body;
    if (!responseText || !aiSystemId) {
      return res.status(400).json({ error: 'responseText and aiSystemId are required' });
    }

    const result = await scanResponse({
      responseText,
      aiSystemId,
      userId: req.user ? req.user.id : null,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getFirewallEvents = async (req, res, next) => {
  try {
    const { aiSystemId, action } = req.query;
    let events = await db.firewallEvents.find();

    if (aiSystemId) events = events.filter(e => e.ai_system_id === aiSystemId);
    if (action) events = events.filter(e => e.action === action);

    // Enrich with system names
    const enriched = await Promise.all(events.map(async e => {
      const system = await db.aiSystems.findById(e.ai_system_id);
      return {
        ...e,
        aiSystemName: system ? system.name : 'Target AI',
      };
    }));

    res.json({ events: enriched.reverse() });
  } catch (err) {
    next(err);
  }
};

export const getFirewallPolicy = async (req, res, next) => {
  try {
    const { aiSystemId } = req.params;
    let policy = await db.firewallPolicies.findOne(p => p.ai_system_id === aiSystemId);
    if (!policy) {
      policy = await db.firewallPolicies.create({
        ai_system_id: aiSystemId,
        pii_action: 'redact',
        prompt_injection_action: 'block',
        sensitive_data_action: 'block',
        secret_action: 'redact',
        unsafe_content_action: 'block',
        enabled: true,
      });
    }
    res.json({ policy });
  } catch (err) {
    next(err);
  }
};

export const updateFirewallPolicy = async (req, res, next) => {
  try {
    const { aiSystemId } = req.params;
    const existing = await db.firewallPolicies.findOne(p => p.ai_system_id === aiSystemId);

    let updated;
    if (existing) {
      updated = await db.firewallPolicies.updateById(existing.id, req.body);
    } else {
      updated = await db.firewallPolicies.create({
        ai_system_id: aiSystemId,
        ...req.body,
      });
    }

    res.json({ message: 'Firewall policy updated successfully', policy: updated });
  } catch (err) {
    next(err);
  }
};
