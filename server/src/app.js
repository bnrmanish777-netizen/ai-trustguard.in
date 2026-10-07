import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { standardLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import aiSystemRoutes from './routes/aiSystemRoutes.js';
import evaluationRoutes from './routes/evaluationRoutes.js';
import testRoutes from './routes/testRoutes.js';
import vulnerabilityRoutes from './routes/vulnerabilityRoutes.js';
import firewallRoutes from './routes/firewallRoutes.js';
import playgroundRoutes from './routes/playgroundRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import gatewayRoutes from './routes/gatewayRoutes.js';
import incidentRoutes from './routes/incidentRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';

const app = express();

// Security headers with Helmet
app.use(helmet());

// CORS configuration (Section 85: never origin: * in production)
const allowedOrigins = [
  env.FRONTEND_URL?.replace(/\/+$/, ''),
  'https://ai-trustguard-in.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request parsing & size limits (Section 70)
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logging & general rate limiting
app.use(requestLogger);
app.use(standardLimiter);

// Health check (Section 79)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI TrustGuard',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount All API Routes (Supports both /api prefix and root prefix for resilience)
const routeModules = [
  ['/auth', authRoutes],
  ['/ai-systems', aiSystemRoutes],
  ['/evaluations', evaluationRoutes],
  ['/tests', testRoutes],
  ['/vulnerabilities', vulnerabilityRoutes],
  ['/firewall', firewallRoutes],
  ['/gateway', gatewayRoutes],
  ['/incidents', incidentRoutes],
  ['/monitoring', monitoringRoutes],
  ['/playground', playgroundRoutes],
  ['/reports', reportRoutes],
  ['/feedback', feedbackRoutes],
  ['/dashboard', dashboardRoutes],
];

for (const [routePath, routeHandler] of routeModules) {
  app.use(`/api${routePath}`, routeHandler);
  app.use(routePath, routeHandler);
}

// Centralized error handler
app.use(errorHandler);

export default app;
