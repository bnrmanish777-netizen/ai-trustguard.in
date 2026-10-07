import { verifyToken } from '../utils/crypto.js';
import { db } from '../db/index.js';
import { logger } from '../utils/logger.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Missing or malformed Authorization header with Bearer token',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token has expired or is invalid',
      });
    }

    const user = await db.users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'The account associated with this token no longer exists',
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    logger.error('Auth middleware unexpected error', { error: err.message });
    return res.status(500).json({ error: 'Internal authentication error' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required to access this endpoint',
    });
  }
  next();
};

// Authorization helper to verify ownership of an AI system or resource
export const verifyOwnership = async (aiSystemId, userId) => {
  const system = await db.aiSystems.findById(aiSystemId);
  if (!system) return { found: false, authorized: false };
  return { found: true, authorized: system.user_id === userId, system };
};
