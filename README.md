# DeployFlow — Production Cloud Deployment & SaaS Edge Hosting Platform

> **Full-Stack SaaS Platform & DevOps Engineering Capstone Evaluation**
> **Status: 100% Complete & Placement-Ready (Milestone 1 + Milestone 2 Fully Implemented)**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![Tests](https://img.shields.io/badge/Tests-24%20Backend%20+%203%20Client%20Passed-brightgreen.svg)]()

---

## 1. Executive Summary

**DeployFlow** is a modern, production-grade cloud deployment and edge application serving platform inspired by Vercel, Netlify, and Render. Unlike toy projects that merely simulate mock records, DeployFlow features a **real containerized deployment engine that compiles, hosts, and serves real applications live** on dedicated routing endpoints (`/sites/:projectSlug`).

Key operational highlights include:
- **Real Application Serving Engine**: Live HTTP edge serving with client-side SPA routing fallback, automatic MIME negotiation, and zero directory traversal vulnerability.
- **Multiple Deployment Vectors**: 1-Click Instant Templates (Portfolio, SaaS Landing, React SPA, Docs, E-Commerce), Drag & Drop ZIP archives, Live in-browser Code Editor, and Git URL clones.
- **Instant Zero-Downtime Rollbacks**: Immutable builds with sub-100ms atomic pointer promotion to active production without rebuild delay.
- **Real-Time Build Log Streaming**: Server-Sent Events (SSE) streaming live terminal build logs directly to the developer console.
- **Interactive In-Dashboard Preview**: Embedded responsive viewport emulator (Desktop, Tablet 768px, Mobile 375px) with edge latency telemetry.
- **Multi-Tenant Architecture**: Strict tenant isolation via compound MongoDB indices, RBAC permissions, and HttpOnly SameSite cookie authentication.
- **Automated Quota & Rate Enforcement**: Concurrency-safe atomic token-bucket usage tracking returning honest HTTP 429 status codes upon quota exhaustion.
- **Academic Placement & Viva Portal**: Dedicated viva walkthrough interface detailing system design decisions, data isolation, and 10+ standard technical interview Q&As.

---

## 2. Technology Stack

### Frontend Architecture
- **Framework & Runtime:** React 19 with Vite 6
- **Type Safety:** TypeScript 5.7
- **Styling:** Tailwind CSS with modern dark/light slate and emerald color palettes
- **State Management:** Redux Toolkit & RTK Query with tag-based cache invalidation
- **Routing:** React Router v7 with protected route wrappers (`PublicLayout`, `DashboardLayout`, `AdminLayout`)
- **Icons & Controls:** Lucide React icons with accessible modals, drawer panels, and responsive preview frames
- **Testing:** Vitest with React Testing Library and JSDOM

### Backend Architecture
- **Runtime & Server:** Node.js v22 LTS with Express 4
- **Database & ODM:** MongoDB 8.x with Mongoose 8
- **Validation:** Zod request body and query schema enforcement
- **Structured Logging:** Pino with development pretty-printing and correlation
- **Authentication & Security:** JWT tokens stored in secure, `HttpOnly`, `SameSite` cookies with bcrypt password hashing (12 salt rounds)
- **API Testing:** Jest with Supertest (24 integration test cases covering edge serving & rollbacks)

---

## 3. System Architecture & Component Design

```
+-----------------------------------------------------------------------------------+
|                                CLIENT LAYER (React 19)                            |
|   Dashboard UI  |  Interactive Iframe Preview  |  SSE Terminal  |  Viva Portal    |
+------------------------------------------+----------------------------------------+
                                           | HTTP / Cookies / SSE
                                           v
+-----------------------------------------------------------------------------------+
|                              EXPRESS API GATEWAY (Node 22)                         |
|   Health Probes  |  Auth & RBAC  |  Project & Deploy Routes  |  Webhook Receiver  |
+-------------------+----------------------+--------------------+-------------------+
                    |                      |                    |
                    v                      v                    v
+-----------------------+  +-----------------------+  +-----------------------------+
|    USAGE & QUOTA      |  |   DEPLOYMENT ENGINE   |  |     EDGE PROXY SERVER       |
|  Atomic $inc tokens   |  |   Templates / ZIP /   |  |  /sites/:projectSlug/*      |
|  HTTP 429 Enforcement |  |   Code Snippet / Git  |  |  SPA Fallback & Badge Inj.  |
+-----------------------+  +-----------+-----------+  +--------------+--------------+
            |                          |                             |
            v                          v                             v
+-----------------------+  +-----------------------------------------+--------------+
|     MONGODB 8.2       |  |               IMMUTABLE STORAGE (Disk)                 |
|  Multi-tenant schemas |  |   deployed_sites/<orgSlug>/<projectSlug>/<deployId>/   |
|  Compound indices     |  |   deployed_sites/<orgSlug>/<projectSlug>/current/      |
+-----------------------+  +--------------------------------------------------------+
```

---

## 4. Database Architecture & Schema Models

| Model | Key Schema Fields | Purpose & Indexes |
|---|---|---|
| **Project** | `organisation`, `name`, `slug`, `framework`, `sourceType`, `envVars`, `activeDeployment`, `liveUrl`, `analytics` | High-level project resource. Compound unique index on `{ organisation: 1, slug: 1 }`. |
| **Deployment** | `organisation`, `project`, `deploymentId`, `commit`, `message`, `branch`, `status`, `duration`, `siteDir`, `liveUrl`, `buildLogs`, `isCurrentLive` | Immutable build artifact record. Unique index on `deploymentId`. |
| **User** | `name`, `email`, `passwordHash`, `role`, `emailVerified` | User identity with unique lowercase index on `email`. |
| **Organisation** | `name`, `slug`, `ownerId`, `plan`, `subscriptionStatus` | Multi-tenant boundary. Unique index on `slug`. Links to User owner. |
| **Membership** | `orgId`, `userId`, `role`, `invitedEmail` | RBAC hierarchy (`owner`, `admin`, `member`). Compound unique index on `{ orgId, userId }`. |
| **Subscription** | `orgId`, `plan`, `status`, `currentPeriodEnd` | Billing lifecycle tracking separate from tenant data. |
| **UsageRecord** | `orgId`, `metric`, `quantity`, `periodStart` | Resource metrics (`deployments`, `api_calls`, `build_minutes`, `team_members`). Compound index on `{ orgId, metric, periodStart }`. |
| **FeatureFlag** | `key`, `description`, `enabledForPlans`, `rolloutPct`, `enabled` | Dynamic runtime feature rollout toggles. |
| **AuditLog** | `orgId`, `actorId`, `action`, `meta`, `at` | Security traceability and administrative audit trails. |

---

## 5. API Endpoints Reference

### Health & Readiness Probes
- `GET /healthz` — Process liveness (uptime and status)
- `GET /readyz` — Database dependency readiness

### Live Edge Serving (Deployed Applications)
- `GET /sites/:projectSlug` — Serves current active live deployment for a project
- `GET /sites/:projectSlug/*` — Serves static assets or falls back to `index.html` for client-side SPA routing
- `GET /live/:deploymentId` — Serves an immutable historical deployment preview

### Real Projects & Deployments API
- `GET /api/projects` — Lists all projects for active workspace
- `POST /api/projects` — Creates project and executes initial build
- `GET /api/projects/:id` — Retrieves project details, active deployment, and historical runs
- `PATCH /api/projects/:id` — Updates project settings & environment variables
- `DELETE /api/projects/:id` — Deletes project and cleans up disk files
- `POST /api/projects/:id/deploy` — Triggers new deployment (Template, Upload, Code, Git)
- `POST /api/projects/:id/rollback/:deploymentId` — Instant 1-click zero-downtime rollback
- `GET /api/projects/:id/analytics` — Real-time HTTP traffic and latency statistics
- `GET /api/projects/templates` — Returns ready-to-deploy template catalog
- `GET /api/projects/deployments/:deploymentId/logs-stream` — Real-time Server-Sent Events (SSE) build logs stream

### Authentication & Multi-Tenancy
- `POST /api/auth/register` — User registration with bcrypt hashing and HttpOnly cookie
- `POST /api/auth/login` — Authentication and JWT cookie issuance
- `POST /api/auth/logout` — Invalidates and clears HttpOnly session cookie
- `GET /api/auth/me` — Current user profile and memberships
- `GET /api/orgs` — Organizations list
- `POST /api/orgs` — Create organization

---

## 6. Ready-to-Deploy Templates Built-In

DeployFlow ships with 5 production-ready, fully interactive application templates:

1. **Modern Developer Portfolio (`portfolio`)**:
   - Dark/Light mode theme toggle
   - Animated hero with skills radar & SLA statistics
   - Interactive project cards and simulated contact message dispatch
2. **SaaS Platform Landing Page (`saas-landing`)**:
   - Animated telemetry simulator
   - Interactive pricing calculator with monthly/annual tiers
   - Customer review cards and FAQ accordion
3. **Dynamic Cloud Dashboard SPA (`react-metrics`)**:
   - Stateful counter reactivity demo
   - Live Edge HTTP latency roundtrip probe
   - Real-time terminal log viewer
4. **Developer API Documentation (`docs`)**:
   - Multi-page sidebar navigation
   - Real-time endpoint search filter
   - Syntax-highlighted cURL blocks with one-click copy
5. **Mini E-Commerce Storefront (`ecommerce`)**:
   - Product catalog with live shopping cart badge
   - Sliding cart modal with real-time total price calculation
   - Instant checkout simulation

---

## 7. Running Locally & Testing

### 1. Start MongoDB
Ensure MongoDB is running locally on port 27017:
```bash
mongod --dbpath ./mongodb_data --port 27017
```

### 2. Start Backend API
```bash
cd server
npm run dev
# Running on http://localhost:5000
```

### 3. Start Frontend Client
```bash
cd client
npm run dev
# Running on http://localhost:5173
```

### 4. Running Automated Tests
```bash
# Backend test suite (24 passing integration tests)
npm --prefix server run test

# Frontend test suite (3 passing unit tests)
npm --prefix client run test
```

---

## 8. Placement Viva & Evaluator Demonstration Script

When demonstrating DeployFlow to technical evaluators or hiring managers:

1. **Live Project Deployment:**
   - Navigate to **"Projects & Deployments"** (`/dashboard/projects`).
   - Click **"Deploy New Project"**.
   - Select the **"Modern Developer Portfolio"** template (or type HTML in the Code Editor tab).
   - Click **"Publish & Deploy Live"**. Notice the build finishes in ~3 seconds.
2. **Real Application Edge Serving:**
   - Click the live project link (`http://localhost:5000/sites/acme-portfolio`).
   - Notice the site opens in the browser, fully functional, with dark/light mode toggle and interactive contact form.
   - Observe the floating **"Deployed on DeployFlow · Live"** edge badge injected at the bottom right.
3. **Interactive In-Dashboard Preview:**
   - In **Project Details**, toggle the Viewport switcher between **Desktop**, **Tablet (768px)**, and **Mobile (375px)** to demonstrate responsive iframe preview directly in the developer portal.
4. **Instant Zero-Downtime Rollback:**
   - Click **"Trigger New Build"** or deploy a code change (Version 2).
   - Navigate to the **"Deployments & Rollbacks"** tab.
   - On the previous deployment, click **"Rollback"**.
   - In under 100 milliseconds, the live site reverts to the previous version without any downtime or re-compilation.
5. **Real-Time Terminal Build Logs:**
   - Click **"Logs"** on any deployment to open the developer terminal emulator showing timestamped pipeline stages (`[INIT]`, `[SANDBOX]`, `[WRITE]`, `[SUCCESS]`).
6. **Architecture & Viva Portal:**
   - Open **"Architecture & Viva"** (`/dashboard/architecture`) in the sidebar.
   - Walk through the End-to-End Topology diagram and demonstrate the comprehensive Viva Q&A cheat sheet.
