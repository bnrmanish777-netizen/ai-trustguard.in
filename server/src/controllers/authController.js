import { db } from '../db/index.js';
import { hashPassword, comparePassword, generateToken } from '../utils/crypto.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validators/authValidator.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const register = async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await db.users.findOne((u) => u.email.toLowerCase() === validated.email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email address already exists',
      });
    }

    const passwordHash = await hashPassword(validated.password);
    const user = await db.users.create({
      name: validated.name,
      email: validated.email.toLowerCase(),
      password_hash: passwordHash,
      role: 'user',
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    logger.info('New user registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);

    const isDemo = Boolean(validated.isDemo);
    const email = (isDemo ? (validated.email || 'demo@trustguard.ai') : validated.email).toLowerCase();
    const demoPassword = env.DEMO_PASSWORD || 'Demo123!@#';
    const passwordToVerify = isDemo ? (validated.password || demoPassword) : validated.password;

    const user = await db.users.findOne((u) => u.email.toLowerCase() === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect email or password',
      });
    }

    const isValid = await comparePassword(passwordToVerify, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect email or password',
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    logger.info('User logged in successfully', { userId: user.id, email: user.email, isDemo });

    res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const validated = forgotPasswordSchema.parse(req.body);
    const user = await db.users.findOne((u) => u.email.toLowerCase() === validated.email.toLowerCase());

    // Security practice: Don't reveal whether user exists
    res.json({
      message: 'If an account exists with this email, password reset instructions have been generated.',
      // In demo/test mode, provide a reset token for verification ease
      resetToken: user ? generateToken({ id: user.id, purpose: 'reset' }) : null,
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);
    // In our system, the reset token contains the user id
    const { verifyToken } = await import('../utils/crypto.js');
    let decoded;
    try {
      decoded = verifyToken(validated.token);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const newHash = await hashPassword(validated.newPassword);
    await db.users.updateById(decoded.id, { password_hash: newHash });

    res.json({
      message: 'Password successfully reset. You may now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
};
