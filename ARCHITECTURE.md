# Enterprise Accounts Receivable & Billing Operating System

## System Architecture

### Overview

Enterprise-grade AR & Billing OS designed for 100M+ invoices with multi-tenant SaaS architecture.

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend (Web) | Next.js 15, React 19, TailwindCSS, shadcn/ui |
| Mobile | React Native (Expo) for iOS/Android |
| API | Next.js API Routes, tRPC, REST |
| Database | Neon PostgreSQL (Serverless) |
| ORM | Drizzle ORM |
| Auth | Clerk |
| Payments | Stripe |
| AI/ML | OpenAI Agents SDK |
| Background Jobs | Trigger.dev v3 |
| Deployment | Vercel |
| Cache | Redis (Upstash) |
| Queue | Trigger.dev |
| Storage | Vercel Blob / S3 |

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Next.js Web   │  iOS (Expo)     │  Android (Expo)             │
│   Dashboard     │  Native App     │  Native App                 │
└────────┬────────┴────────┬────────┴──────────────┬──────────────┘
         │                 │                       │
┌────────▼─────────────────▼───────────────────────▼──────────────┐
│                        API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  tRPC Router  │  REST API  │  WebSocket  │  Webhook Endpoints   │
└────────┬───────┴────┬───────┴─────┬───────┴──────────┬──────────┘
         │            │             │                   │
┌────────▼────────────▼─────────────▼───────────────────▼─────────┐
│                     SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│  Auth Service  │  Billing Service  │  Invoice Service           │
│  (Clerk)       │  (Stripe)         │  (Core)                    │
├─────────────────┼──────────────────┼────────────────────────────┤
│  Collection     │  Analytics       │  Tax Engine                │
│  Service        │  Service         │  Service                   │
├─────────────────┼──────────────────┼────────────────────────────┤
│  Reconciliation │  Reporting       │  Notification              │
│  Service        │  Service         │  Service                   │
└────────┬────────┴────────┬─────────┴────────────┬──────────────┘
         │                 │                      │
┌────────▼─────────────────▼──────────────────────▼──────────────┐
│                      AI AGENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Invoice Agent  │  Collection Agent  │  Reminder Agent          │
├─────────────────┼────────────────────┼──────────────────────────┤
│  Payment Agent  │  Reconciliation    │  Audit Agent             │
│                 │  Agent             │                          │
├─────────────────┼────────────────────┼──────────────────────────┤
│  Fraud Agent    │  Forecasting       │  Orchestrator            │
│                 │  Agent             │  Agent                   │
└────────┬────────┴────────┬───────────┴────────────┬─────────────┘
         │                 │                        │
┌────────▼─────────────────▼────────────────────────▼─────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Neon PostgreSQL  │  Redis (Upstash)  │  Vercel Blob            │
│  (Primary DB)     │  (Cache/Sessions) │  (File Storage)         │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Tenant SaaS Design

```
┌─────────────────────────────────────────────────────────────────┐
│                    TENANT ISOLATION MODEL                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tenant A                    Tenant B                    Tenant C│
│  ┌─────────┐                ┌─────────┐                ┌────────┐│
│  │ Schema  │                │ Schema  │                │ Schema ││
│  │ /data_a │                │ /data_b │                │ /data_c││
│  └────┬────┘                └────┬────┘                └───┬────┘│
│       │                         │                         │     │
│  ┌────▼─────────────────────────▼─────────────────────────▼───┐ │
│  │              Shared Application Layer                       │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │ │
│  │  │ Auth    │ │ Billing │ │ Invoice │ │ Reports │          │ │
│  │  │ Service │ │ Service │ │ Service │ │ Service │          │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │ │
│  └────────────────────────────────────────────────────────────┘ │
│       │                         │                         │     │
│  ┌────▼─────────────────────────▼─────────────────────────▼───┐ │
│  │              Shared Database (Row-Level Security)           │ │
│  │  ┌─────────────────────────────────────────────────────┐   │ │
│  │  │  PostgreSQL with RLS policies per tenant_id         │   │ │
│  │  └─────────────────────────────────────────────────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Core Workflows

#### 1. Invoice Lifecycle

```
Customer Created
      │
      ▼
Invoice Generated ──────────────────────────────────────┐
      │                                                  │
      ▼                                                  │
Payment Reminder (T-7, T-3, T-0, T+3, T+7, T+14)       │
      │                                                  │
      ▼                                                  │
Payment Collection ──┐                                   │
      │              │                                   │
      ▼              ▼                                   │
   Success        Failed                                │
      │              │                                   │
      │              ▼                                   │
      │        Retry Logic                              │
      │              │                                   │
      ▼              ▼                                   │
Reconciliation ◄────┘                                   │
      │                                                  │
      ▼                                                  │
Ledger Update ◄─────────────────────────────────────────┘
      │
      ▼
Reporting & Analytics
```

#### 2. AI-Driven Collection Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                   AI COLLECTION PIPELINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Predict Late Payments                                       │
│     │  - Historical payment patterns                            │
│     │  - Customer risk score                                    │
│     │  - Industry benchmarks                                    │
│     ▼                                                           │
│  2. Fraud Detection                                             │
│     │  - Anomaly detection                                       │
│     │  - Pattern matching                                        │
│     │  - Velocity checks                                        │
│     ▼                                                           │
│  3. Strategy Recommendation                                     │
│     │  - Optimal contact timing                                  │
│     │  - Channel selection (email/SMS/phone)                     │
│     │  - Escalation paths                                        │
│     ▼                                                           │
│  4. Revenue Forecasting                                         │
│     │  - Cash flow projections                                   │
│     │  - DSO predictions                                         │
│     │  - Bad debt reserves                                       │
│     ▼                                                           │
│  5. Automated Execution                                         │
│        - Trigger.dev workflows                                   │
│        - Real-time adjustments                                   │
│        - Human-in-the-loop fallback                              │
└─────────────────────────────────────────────────────────────────┘
```

### Database Strategy (100M+ Invoices)

#### Partitioning Strategy

```sql
-- Range partitioning by invoice date (monthly)
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_amount DECIMAL(19,4) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    issued_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (issued_date);

-- Monthly partitions
CREATE TABLE invoices_2024_01 PARTITION OF invoices
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Indexes for common queries
CREATE INDEX idx_invoices_tenant_status ON invoices(tenant_id, status);
CREATE INDEX idx_invoices_tenant_customer ON invoices(tenant_id, customer_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE status = 'pending';
```

#### Sharding Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    SHARDING ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Shard 1 (Tenants 1-1000)      Shard 2 (Tenants 1001-2000)    │
│  ┌─────────────────────┐       ┌─────────────────────┐         │
│  │  Neon DB Instance 1 │       │  Neon DB Instance 2 │         │
│  │  ┌───────────────┐  │       │  ┌───────────────┐  │         │
│  │  │ Schema A      │  │       │  │ Schema B      │  │         │
│  │  │ Schema B      │  │       │  │ Schema C      │  │         │
│  │  │ Schema C      │  │       │  │ Schema D      │  │         │
│  │  └───────────────┘  │       │  └───────────────┘  │         │
│  └─────────────────────┘       └─────────────────────┘         │
│                                                                 │
│  Shard 3 (Tenants 2001-3000)  Shard 4 (Tenants 3001+)          │
│  ┌─────────────────────┐       ┌─────────────────────┐         │
│  │  Neon DB Instance 3 │       │  Neon DB Instance 4 │         │
│  │  ┌───────────────┐  │       │  ┌───────────────┐  │         │
│  │  │ Schema E      │  │       │  │ Schema G      │  │         │
│  │  │ Schema F      │  │       │  │ Schema H      │  │         │
│  │  │ Schema G      │  │       │  │ Schema I      │  │         │
│  │  └───────────────┘  │       │  └───────────────┘  │         │
│  └─────────────────────┘       └─────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Security Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Authentication Layer                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Clerk Authentication                                     │   │
│  │  - JWT Tokens (RS256)                                    │   │
│  │  - Multi-factor Authentication                           │   │
│  │  - SSO (SAML/OIDC)                                       │   │
│  │  - Session Management                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Authorization Layer                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Role-Based Access Control (RBAC)                         │   │
│  │  - Owner / Admin / Manager / Viewer                      │   │
│  │  - Custom Roles per Tenant                               │   │
│  │  - Resource-level Permissions                            │   │
│  │  - API Key Scopes                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Data Protection                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - Row-Level Security (RLS) per tenant_id               │   │
│  │  - Encryption at rest (AES-256)                          │   │
│  │  - Encryption in transit (TLS 1.3)                       │   │
│  │  - Field-level encryption for PII                        │   │
│  │  - Audit logging for all data access                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Compliance                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - SOC 2 Type II                                        │   │
│  │  - GDPR / CCPA                                          │   │
│  │  - PCI DSS Level 1                                      │   │
│  │  - HIPAA (Healthcare billing)                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### AI Agent Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI AGENT ORCHESTRATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  ORCHESTRATOR AGENT                      │   │
│  │  - Routes tasks to specialized agents                    │   │
│  │  - Manages agent communication                           │   │
│  │  - Handles failures and retries                          │   │
│  │  - Maintains conversation context                        │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│         ┌───────────────┼───────────────┐                      │
│         │               │               │                      │
│  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐              │
│  │  Invoice    │ │  Collection │ │  Reminder   │              │
│  │  Agent      │ │  Agent      │ │  Agent      │              │
│  │             │ │             │ │             │              │
│  │ - Generate  │ │ - Strategy  │ │ - Schedule  │              │
│  │ - Validate  │ │ - Escalate  │ │ - Personalize│              │
│  │ - Optimize  │ │ - Negotiate │ │ - Multi-ch  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│         │               │               │                      │
│  ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐              │
│  │  Payment    │ │  Reconcile  │ │  Audit      │              │
│  │  Agent      │ │  Agent      │ │  Agent      │              │
│  │             │ │             │ │             │              │
│  │ - Process   │ │ - Match     │ │ - Compliance│              │
│  │ - Retry     │ │ - Clear     │ │ - Anomaly   │              │
│  │ - Refund    │ │ - Report    │ │ - Report    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│         │               │               │                      │
│  ┌──────▼──────┐ ┌──────▼──────┐                             │
│  │  Fraud      │ │  Forecast   │                             │
│  │  Agent      │ │  Agent      │                             │
│  │             │ │             │                             │
│  │ - Detect    │ │ - Revenue   │                             │
│  │ - Block     │ │ - Cashflow  │                             │
│  │ - Alert     │ │ - DSO       │                             │
│  └─────────────┘ └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### API Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      API ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  External APIs                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  REST API (v1)                                           │   │
│  │  - /api/v1/customers                                     │   │
│  │  - /api/v1/invoices                                      │   │
│  │  - /api/v1/payments                                      │   │
│  │  - /api/v1/subscriptions                                 │   │
│  │  - /api/v1/reports                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Internal APIs                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  tRPC (Type-safe internal)                               │   │
│  │  - Fully typed procedures                                │   │
│  │  - Real-time subscriptions                               │   │
│  │  - Input validation with Zod                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Webhook APIs                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Stripe Webhooks                                         │   │
│  │  - payment_intent.succeeded                              │   │
│  │  - invoice.paid                                          │   │
│  │  - customer.subscription.updated                         │   │
│  │                                                          │   │
│  │  Clerk Webhooks                                          │   │
│  │  - user.created / user.updated                           │   │
│  │  - organization.created                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Real-time APIs                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  WebSocket (Server-Sent Events)                          │   │
│  │  - Live invoice status updates                           │   │
│  │  - Payment notifications                                 │   │
│  │  - Dashboard metrics                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   MOBILE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  React Native (Expo)                     │   │
│  │                                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │  iOS App    │  │ Android App │  │  Shared     │     │   │
│  │  │  (Swift)    │  │  (Kotlin)   │  │  Components │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │              Shared Business Logic               │   │   │
│  │  │  - API Client (React Query)                      │   │   │
│  │  │  - State Management (Zustand)                    │   │   │
│  │  │  - Offline Support (WatermelonDB)                │   │   │
│  │  │  - Push Notifications (Expo Notifications)       │   │   │
│  │  │  - Biometric Auth (Expo Local Auth)              │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Mobile Features                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - Invoice scanning (OCR)                                │   │
│  │  - Push payment reminders                                │   │
│  │  - Mobile payments (Apple Pay / Google Pay)              │   │
│  │  - Offline invoice creation                              │   │
│  │  - Receipt capture and matching                          │   │
│  │  - Biometric authentication                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Performance Targets

| Metric | Target |
|--------|--------|
| Invoice Processing | 10,000/second |
| API Response Time | < 100ms (p99) |
| Database Query Time | < 10ms (p95) |
| Real-time Updates | < 500ms latency |
| System Uptime | 99.99% |
| Data Durability | 99.999999% |
| Backup Recovery | < 1 hour RPO, < 15 min RTO |

### Cost Optimization

| Component | Strategy |
|-----------|----------|
| Compute | Vercel Edge Functions, Serverless |
| Database | Neon Autoscaling, Read Replicas |
| Cache | Upstash Redis (Pay-per-request) |
| Storage | Vercel Blob / S3 Lifecycle |
| AI | OpenAI Batch API, Model Selection |
| Background Jobs | Trigger.dev (Usage-based) |
