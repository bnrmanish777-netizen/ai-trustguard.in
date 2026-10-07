import { db } from '../db/index.js';
import { generatePersonalizedTestsWithAI } from '../ai/geminiProvider.js';

export const listTests = async (req, res, next) => {
  try {
    const { category, difficulty } = req.query;
    let tests = await db.testCases.find();

    if (category) {
      tests = tests.filter(t => t.category === category);
    }
    if (difficulty) {
      tests = tests.filter(t => t.difficulty === difficulty);
    }

    res.json({ tests });
  } catch (err) {
    next(err);
  }
};

export const generatePersonalizedTests = async (req, res, next) => {
  try {
    const { aiSystemId, category = 'prompt_injection', difficulty = 'medium', count = 3 } = req.body;

    const profile = aiSystemId ? await db.aiProfiles.findOne(p => p.ai_system_id === aiSystemId) : null;
    const generated = await generatePersonalizedTestsWithAI({
      aiProfile: profile,
      category,
      difficulty,
      count: Number(count),
    });

    // Optionally save them into testCases table
    const saved = [];
    for (const testItem of generated) {
      const record = await db.testCases.create({
        ...testItem,
        is_custom: true,
        ai_system_id: aiSystemId || null,
      });
      saved.push(record);
    }

    res.status(201).json({
      message: `Successfully generated ${saved.length} personalized test cases`,
      tests: saved,
    });
  } catch (err) {
    next(err);
  }
};
