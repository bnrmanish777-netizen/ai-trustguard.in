import { db } from '../db/index.js';

export const submitFeedback = async (req, res, next) => {
  try {
    const {
      aiSystemId,
      evaluationId,
      feedbackType = 'evaluation_review',
      rating,
      comment,
      prioritizedCategories = [],
    } = req.body;

    const feedback = await db.userFeedback.create({
      user_id: req.user.id,
      ai_system_id: aiSystemId || null,
      evaluation_id: evaluationId || null,
      feedback_type: feedbackType,
      rating: rating ? Number(rating) : 5,
      comment: comment || '',
      prioritized_categories: prioritizedCategories,
    });

    res.status(201).json({
      message: 'Feedback received and incorporated into future personalization loops',
      feedback,
    });
  } catch (err) {
    next(err);
  }
};

export const listFeedback = async (req, res, next) => {
  try {
    const { aiSystemId } = req.query;
    let feedback = await db.userFeedback.find();
    if (aiSystemId) feedback = feedback.filter(f => f.ai_system_id === aiSystemId);
    res.json({ feedback: feedback.reverse() });
  } catch (err) {
    next(err);
  }
};
