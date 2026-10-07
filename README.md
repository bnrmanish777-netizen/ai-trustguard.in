# AI TrustGuard
### Adaptive & Personalized AI Security, Privacy & Trust Platform

> **Tagline:** Understand. Personalize. Attack. Detect. Protect. Learn. Adapt.  
> **Theme:** Personalized AI Experiences

---

## 1. Project Overview
**AI TrustGuard** is an enterprise-grade Adaptive AI Red-Team, Personalized Trust Evaluation, and AI Firewall platform built for the **Personalized AI Experiences** hackathon. 

Rather than executing static, generic security tests against every AI model, AI TrustGuard dynamically learns each AI system's unique operational purpose, industry context, data sensitivity, risk tolerance, previous vulnerabilities, evaluation history, and firewall events to personalize security testing, derive deterministic Trust Scores, enforce real-time firewall policies, and evolve over time through Trust Memory.

---

## 2. Problem Statement
Today, thousands of distinct AI applications are being deployed across industries—from customer support chatbots handling consumer addresses and billing tickets, to developer code assistants handling cloud credentials, to wealth management advisors handling high-net-worth portfolios.

Traditional AI security tools treat all these AI systems identically:
- They run the exact same static prompt injection probes against a healthcare bot as they do against a code refactoring copilot.
- They lack awareness of data sensitivity thresholds or operational compliance rules.
- They do not remember recurring vulnerabilities or learn from real-time gateway firewall telemetry.
- They provide opaque, arbitrary security numbers without deterministic explanations.

---

## 3. Personalized AI Solution
AI TrustGuard introduces a **continuous personalization feedback loop**:

```
AI SYSTEM CONTEXT (Purpose, Industry, Sensitivity, Tolerance)
       ↓
BEHAVIOR & TELEMETRY (History, Vulnerabilities, Firewall Events)
       ↓
AI PERSONALIZATION ENGINE
       ↓
PERSONALIZED TEST STRATEGY & ADAPTIVE ESCALATION
       ↓
ATTACK & HYBRID DETECTION (Regex/NER + Semantic Evaluation)
       ↓
DETERMINISTIC TRUST SCORE (25% Sec, 25% Priv, 20% Rel, 20% Safe, 10% Trans)
       ↓
PERSONALIZED FIREWALL ENFORCEMENT (Allow, Warn, Block, Redact)
       ↓
PROTECTED RETEST (+23 Trust Score Improvement)
       ↓
TRUST MEMORY UPDATE & NEXT RECOMMENDED EVALUATION
```

### Key Differentiators:
- **Demo Customer Support AI** prioritizes: *PII Leakage, Prompt Injection, Sensitive Data Exposure, System Prompt Extraction*.
- **Demo Coding Assistant** prioritizes: *Secret Token Leakage, Malicious Instruction Handling, Data Exfiltration*.
- **Demo Financial Assistant** prioritizes: *Financial Data Confidentiality, Hallucinated Market Returns, Compliance Transparency*.

---

## 4. Features
1. **Dynamic Risk Profiling**: Calculates multidimensional risk scores across Security, Privacy, Reliability, Safety, and Transparency.
2. **Transparent Personalization Confidence**: Verified checklist of profile signals (Purpose, Industry, Sensitivity, History, Vulnerabilities, Firewall, Feedback).
3. **"Why This Test?" Justifications**: Clear, human-readable explanations in the UI detailing why each test was selected.
4. **Hybrid Evaluation Engine**: Combines deterministic regex/NER scanners with semantic evaluation powered by Google Gemini.
5. **Deterministic Trust Score Engine**: Transparent formula bounded from 0 to 100 with actionable explanations on score drivers.
6. **Adaptive Test Escalation**: Dynamically raises test difficulty (Easy → Medium → Hard) upon consecutive passes, and generates targeted variants upon failure.
7. **AI TrustGuard Firewall**: Real-time pre-input and post-response inspection gateway supporting `ALLOW`, `WARN`, `BLOCK`, and `REDACT`.
8. **Demonstrated Before / After Retest (+23 Score Jump)**: Baseline score of 68 increases to 91 when firewall policies are enforced.
9. **Trust Memory & Security Timeline**: Long-term tracking of recurring vs resolved vulnerabilities and chronological security milestones.
10. **Interactive Test Playground**: Live attack sandbox with toggleable firewall interception and real-time threat telemetry.
11. **Adversarial Test Library**: 11 reusable attack categories with AI test case synthesis.
12. **Formal Cybersecurity Audit Reports**: Sourced strictly from verified database records with print/PDF export.

---

## 5. Personalization Architecture
The backend `personalizationEngine` fuses:
1. **AI Context Profile**: Purpose, Industry, Sensitivity (`Low`, `Medium`, `High`, `Critical`), Risk Tolerance (`Low`, `Medium`, `High`).
2. **Historical Evaluations**: Scores, duration, failure frequency.
3. **Known Vulnerabilities**: Open vs resolved security findings.
4. **Firewall Telemetry**: Frequency of blocked injections, redacted PII records, and threat shifts.
5. **Operator Feedback**: User priorities (e.g. Privacy First, Security First).

It computes:
- Dynamic pillar weights (`securityWeight`, `privacyWeight`, `reliabilityWeight`, `safetyWeight`, `transparencyWeight`).
- Target category prioritization.
- Recommended difficulty and test count.
- Structured reasoning validated via **Zod**.

---

## 6. Security Architecture
- **Authentication**: JWT tokens (HMAC-SHA256) + bcrypt password hashing (work factor 10).
- **Authorization**: Strict tenant isolation (`user_id` ownership verification on all operations).
- **Protection Middleware**: Helmet security headers, CORS restricted to frontend origin, centralized error handling without secret leaks.
- **Rate Limiting**: Granular windows on authentication (30 req/15m), AI evaluations (60 req/10m), and firewall checks (120 req/m).
- **Zero Real PII Rule**: Only synthetic data is utilized during testing.

---

## 7. System Workflow
1. **Understand**: Register AI with operational purpose, industry, and sensitivity.
2. **Build Risk Profile**: System derives primary and secondary hazards.
3. **Personalize Test Plan**: System selects tailored test cases and explains why.
4. **Attack**: Red-team vectors sent to target AI via provider abstraction.
5. **Detect**: Hybrid scanners inspect model response for PII, tokens, and prompt injection surrender.
6. **Calculate Score**: Deterministic Trust Score computed from actual results.
7. **Protect**: Personalized firewall policy active on gateway.
8. **Retest**: Re-evaluate endpoint under protection to verify vulnerability resolution.
9. **Learn**: Trust Memory updated; next evaluation recommended.

---

## 8. AI Evaluation Methodology
AI TrustGuard never assumes an LLM alone can evaluate safety. It uses a **Hybrid Evaluation Engine**:
- **Deterministic Checks First**:
  - Email, Phone, SSN, Credit Card regex and pattern matches.
  - JWT token, AWS key, database URI, and secret token detectors.
  - Keyword refusal and delimiter pattern matching.
- **Semantic Evaluation Second**:
  - Calls Google Gemini with a structured prompt.
  - Validates output using **Zod** schema (`result`, `severity`, `evidence`, `explanation`, `recommendation`).
  - Graceful heuristic fallback if external API is unreachable or schema mismatch occurs.

---

## 9. Adaptive Testing
Difficulty is not static:
- **Easy → Medium**: Triggered after baseline checks pass.
- **Medium → Hard**: Triggered after 3 consecutive passes in a category.
- **Hard → Related Variants**: Triggered when a vulnerability is uncovered to evaluate the blast radius.

---

## 10. Trust Score Methodology
Deterministic Trust Score Formula:
```text
Trust Score = Security × 0.25 + Privacy × 0.25 + Reliability × 0.20 + Safety × 0.20 + Transparency × 0.10
```

### Tier Classifications:
- **90–100**: Excellent (Emerald)
- **80–89**: High (Cyan)
- **70–79**: Moderate (Amber)
- **50–69**: Low (Orange)
- **0–49**: Critical (Rose)

---

## 11. Trust Memory
Trust Memory tracks:
- **Recurring Vulnerabilities**: Weaknesses detected across multiple evaluations.
- **Resolved Vulnerabilities**: Mitigations verified through protected retests.
- **Firewall Patterns**: Threat clusters intercepted at the gateway.
- **Recommended Next Tests**: Dynamic priorities for subsequent evaluation runs.

---

## 12. AI Firewall
Operating inline between the user and target AI:
- **Pre-Input Scanner**: Inspects user input for instruction overrides, DAN jailbreaks, and delimiter attacks.
  - Action: `ALLOW`, `WARN`, `BLOCK`, `REDACT`.
- **Response Scanner**: Inspects model output for leaked customer PII or hardcoded credentials.
  - Action: Real-time redaction into `[REDACTED_EMAIL]`, `[REDACTED_PHONE]`, `[REDACTED_SECRET]`.

---

## 13. Database Schema
14 normalized tables in Supabase PostgreSQL:
1. `users` (id UUID PK, name, email UNIQUE, password_hash, role, timestamps)
2. `ai_systems` (id UUID PK, user_id FK, name, description, provider, model_name, endpoint_url, timestamps)
3. `ai_profiles` (id UUID PK, ai_system_id FK UNIQUE, purpose, industry, data_sensitivity, risk_tolerance, priorities)
4. `risk_profiles` (id UUID PK, ai_system_id FK, security_risk, privacy_risk, reliability_risk, safety_risk, transparency_risk, primary_risk, confidence)
5. `personalization_strategies` (id UUID PK, ai_system_id FK, weights, priority_categories, reasoning, confidence)
6. `test_cases` (id UUID PK, category, difficulty, name, prompt, expected_behavior, severity, reason)
7. `evaluations` (id UUID PK, user_id FK, ai_system_id FK, trust_score, pillar_scores, is_retest)
8. `test_results` (id UUID PK, evaluation_id FK, test_case_id FK, prompt, actual_response, result, evidence, why_selected)
9. `vulnerabilities` (id UUID PK, user_id FK, ai_system_id FK, evaluation_id FK, title, severity, status)
10. `firewall_policies` (id UUID PK, ai_system_id FK UNIQUE, pii_action, prompt_injection_action, secret_action, enabled)
11. `firewall_events` (id UUID PK, user_id FK, ai_system_id FK, event_type, input_text, output_text, action, risk_score)
12. `trust_memory` (id UUID PK, ai_system_id FK, memory_type, memory_key, memory_value, confidence, source)
13. `user_feedback` (id UUID PK, user_id FK, ai_system_id FK, rating, comment, prioritized_categories)
14. `reports` (id UUID PK, user_id FK, ai_system_id FK, evaluation_id FK, title, executive_summary, report_data)

---

## 14. API Documentation
See full REST API specifications in [docs/API.md](docs/API.md).

---

## 15. Local Setup

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone repository
git clone <repo-url>
cd "AI SECURITY"

# Install all monorepo dependencies
npm run install:all
```

### Running Locally
```bash
# Start both Backend (Port 5000) and Frontend (Port 5173) concurrently:
npm run dev
```
Open `http://localhost:5173` in your browser.

### Running Backend Tests
```bash
npm test
```
All unit and end-to-end integration tests will execute and report status.

---

## 16. Environment Variables
Copy `.env.example` to `server/.env`:
```bash
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:...@...supabase.com:6543/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=ai_trustguard_super_secure_jwt_secret_key_at_least_32_chars!
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

---

## 17. Supabase Setup
1. Create a free project at [supabase.com](https://supabase.com).
2. Under **Project Settings → Database**, copy the **Connection string (URI)**.
3. Paste into `DATABASE_URL` in `server/.env`.
4. Run schema migration:
```bash
npm --prefix server run seed
```

---

## 18. Gemini Setup
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com).
2. Set `GEMINI_API_KEY` in `server/.env`.
3. *Note: If no Gemini key is provided, the platform automatically activates high-fidelity heuristic semantic evaluators so judges and offline evaluators can run the full product seamlessly.*

---

## 19. Deployment
- **Frontend**: Deploy `client/` to Vercel. Set `VITE_API_URL` to backend URL.
- **Backend**: Deploy `server/` to Render. Set environment variables from `.env.example`.
- **Database**: Supabase PostgreSQL.

---

## 20. Demo Credentials
- **Email**: `demo@trustguard.ai`
- **Password**: `Demo123!@#`
- **1-Click**: Click the **"Launch with Demo SecOps Account"** button on `/login`.

---

## 21. Demo Workflow
See the complete step-by-step judge walkthrough in [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md).

---

## 22. Limitations
- Security evaluations communicate via black-box API queries rather than inspecting raw model weights.
- Regex and pattern matching may not catch novel obfuscated steganographic jailbreaks.

---

## 23. Future Improvements
- Multi-modal image and audio injection screening.
- Automated system prompt re-synthesis and synthetic fine-tuning dataset generation.
- Real-time Kubernetes sidecar proxy deployment for production LLM pipelines.

---

## 24. Responsible AI Disclaimer
> **This report and platform represent an automated security and trust assessment based on the tests executed by AI TrustGuard. It does not guarantee that an AI system is completely secure, private, unbiased, or trustworthy. Passing tests does not guarantee complete security; failing tests indicate areas requiring investigation.**
