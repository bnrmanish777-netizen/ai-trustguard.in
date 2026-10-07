# AI TrustGuard — Architecture & Technical Specification

## 1. System Overview
**AI TrustGuard** is an Adaptive AI Red-Team, Personalized Trust Evaluation, and AI Firewall platform built for the hackathon theme **Personalized AI Experiences**.

Rather than treating every AI system generically, TrustGuard learns each AI's purpose, industry, data sensitivity, risk tolerance, vulnerability history, and firewall events to personalize security testing, calculate a deterministic Trust Score, enforce an adaptive AI firewall, and continuously learn through Trust Memory.

---

## 2. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AI TrustGuard Frontend (React + Vite)                │
│  - Cybersecurity Dark SaaS UI (Tailwind CSS, Lucide Icons, Recharts)   │
│  - Personalization Center, Trust Memory Timeline, Radar & Gauges       │
│  - Live Firewall Playground, Retest Before/After Comparison            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (JWT Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   AI TrustGuard API (Express.js / Node.js)             │
│  ├── Middleware: Helmet, CORS, Rate Limiters, JWT, Zod Validator       │
│  ├── Routes & Controllers: Auth, AI Systems, Evaluations, Firewall...  │
│  ├── Personalization Engine:                                           │
│  │     - AI Context Analyzer (Purpose, Industry, Sensitivity)          │
│  │     - Risk Profile Generator (Deterministic & Context-driven)       │
│  │     - "Why This Test?" Recommendation Reasoner                     │
│  │     - Confidence Calculator (% based on profile signals)            │
│  ├── Trust Memory Subsystem:                                           │
│  │     - Recurring & Resolved Vulnerability Tracking                   │
│  │     - Security Learning Timeline                                    │
│  │     - Firewall Feedback Loop into Risk Profiles                     │
│  ├── Hybrid Evaluation Engine:                                         │
│  │     - Deterministic Checks (PII regex, Secret regex, keywords)      │
│  │     - Semantic AI Evaluation (Gemini API with Zod validation)       │
│  │     - Adaptive Difficulty Escalation (Easy → Medium → Hard)         │
│  ├── Deterministic Trust Score Engine:                                 │
│  │     Trust Score = 0.25*Sec + 0.25*Priv + 0.20*Rel + 0.20*Safe + 0.10*Trans
│  ├── AI TrustGuard Firewall:                                           │
│  │     - Pre-input Scanner & Prompt Injection Detector                 │
│  │     - Post-response Scanner & Sensitive Data Redactor               │
│  │     - Policy Engine: ALLOW / WARN / BLOCK / REDACT                  │
│  └── Target AI Providers:                                              │
│        - Gemini Provider                                               │
│        - OpenAI / Anthropic / Custom Provider                          │
│        - Realistic Controlled Demo Targets (Support, Code, Finance)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Connection Pool
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Database Layer (Supabase PostgreSQL)               │
│  - users, ai_systems, ai_profiles, risk_profiles                       │
│  - evaluations, test_cases, test_results, vulnerabilities              │
│  - firewall_events, firewall_policies, trust_memory                   │
│  - personalization_strategies, user_feedback, reports                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
d:/AI SECURITY/
├── package.json               # Root monorepo orchestrator (dev, client, server, build, test)
├── .gitignore                 # Ignores .env, node_modules, dist, logs
├── .env.example               # Full environment configuration template
├── README.md                  # Comprehensive product, architecture & setup docs
├── docs/
│   ├── ARCHITECTURE.md        # Deep architectural blueprint
│   ├── API.md                 # Full OpenAPI / REST API documentation
│   └── DEMO_GUIDE.md          # 3-5 minute Judge demo script
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── database/
│   │   ├── schema.sql         # 14 normalized tables, foreign keys, indexes
│   │   └── seed.sql           # Demo users, 3 distinct AI systems, test library, history
│   └── src/
│       ├── app.js             # Express app setup, middleware, route mounting
│       ├── server.js          # HTTP server listener & graceful shutdown
│       ├── config/            # Environment parsing & constants
│       ├── db/                # PostgreSQL connection pool & query wrappers
│       ├── middleware/        # JWT auth, rate limiting, error handler, validation
│       ├── routes/            # REST API routers
│       ├── controllers/       # Controller handlers
│       ├── services/          # Business logic services
│       ├── validators/        # Zod schemas for requests & responses
│       ├── security/          # PII regex, Secret regex, Redaction, Injection matchers
│       ├── scoring/           # Deterministic Trust Score & category calculator
│       ├── personalization/   # Personalization Engine & confidence calculator
│       ├── memory/            # Trust Memory tracking & timeline builder
│       ├── firewall/          # AI Firewall pre/post inspection & policy engine
│       ├── ai/                # Gemini client, Target AI providers & Demo targets
│       └── utils/             # Logger, crypto helpers, string sanitizers
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/           # AuthContext, NotificationContext
        ├── routes/            # App routes & ProtectedRoute wrappers
        ├── layouts/           # AppLayout (Sidebar, Topbar), AuthLayout
        ├── components/        # Reusable UI components (Badges, Cards, Modals, Drawer)
        ├── charts/            # ScoreGauge, CategoryRadar, RiskTrendChart, FirewallBarChart
        ├── services/          # Axios API client modules
        ├── pages/             # Dashboard, AI Systems, Personalization, Evaluations,
                               # Compare, Vulnerabilities, Firewall, Playground,
                               # Test Library, Reports, Landing, Login, Register
        └── utils/             # Formatters, color helpers, risk calculators
```

---

## 4. Phase-by-Phase Implementation Plan

- **Phase 0: Architecture, Skeleton & Environment Setup**
  - Create root workspace configs, server and client folder scaffolding, dependencies list.
- **Phase 1: Database Architecture, Security Schema & Authentication**
  - Write `schema.sql` (14 tables with UUIDs, indexes, constraints), write `seed.sql`.
  - Implement database abstraction layer with `pg` pool and schema auto-initialization.
  - Implement bcrypt hashing, JWT token issuance/verification, auth routes and middleware.
  - Verify with auth tests.
- **Phase 2: Core Security Engines, Hybrid Evaluation & Scoring**
  - Build deterministic PII, Secret, and Prompt Injection regex/pattern engines.
  - Build Redaction engine for data masking.
  - Build Target AI provider abstraction with Gemini & Controlled Demo Target AIs.
  - Build deterministic Trust Score calculator (Security 25%, Privacy 25%, Reliability 20%, Safety 20%, Transparency 10%).
  - Verify with security unit tests.
- **Phase 3: Personalization Engine, Trust Memory & Adaptive Planning**
  - Implement AI Context Analyzer & Risk Profile generation.
  - Implement Personalization Engine with confidence metrics and "Why This Test?" reasoning.
  - Implement Adaptive Test Planner (difficulty escalation and dynamic category selection).
  - Implement Trust Memory service and timeline generator.
  - Verify test planner and memory workflows.
- **Phase 4: AI TrustGuard Firewall & Retest Pipeline**
  - Implement Pre-Input scanner and Post-Response scanner.
  - Implement personalized firewall policy enforcement (ALLOW / WARN / BLOCK / REDACT).
  - Implement Before/After retest and comparison pipeline.
  - Implement formal Cybersecurity Audit Report generator.
  - Complete all server API controllers and routes.
  - Verify full end-to-end backend test suite.
- **Phase 5: Cybersecurity Frontend Application**
  - Initialize Vite React app with Tailwind CSS, Lucide React, and Recharts.
  - Build dark cybersecurity theme layout, sidebar, navigation, and state management.
  - Implement Dashboard, AI Systems, Personalization Center, Risk Profile, Trust Memory, Evaluations, Compare, Vulnerabilities, Firewall, Playground, Test Library, Reports.
- **Phase 6: Verification, End-to-End Demo Workflow & Documentation**
  - Run full test suite, seed demo data, test live demo flow.
  - Write `README.md` and `docs/API.md`.
  - Validate production builds.
