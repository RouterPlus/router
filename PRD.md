# Product Requirements Document: router.plus

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Business Model](#2-business-model)
   - 2.1 Revenue Model
   - 2.2 Free Trial System
   - 2.3 Payment Integration
   - 2.4 Partner API & Resellers
3. [Architecture Overview](#3-architecture-overview)
   - 3.1 High-Level System Flow
   - 3.2 Universal Proxy Architecture
   - 3.3 Multi-Server Deployment
   - 3.4 Decision: Build from Scratch, Use OmniRoute as Reference
4. [Database Architecture](#4-database-architecture)
   - 4.1 Core Database Design
   - 4.2 Schema Structure
   - 4.3 Migration System
   - 4.4 Backup & Recovery Strategy
   - 4.5 Performance Optimization
   - 4.6 Health Checks
   - 4.7 Multi-Instance Limitations
5. [Tech Stack](#5-tech-stack)
   - 5.1 Backend Stack
   - 5.2 Frontend Stack
   - 5.3 Telegram Bot Stack
   - 5.4 Payment Integration Stack
   - 5.5 DevOps Stack
6. [Authentication & Security](#6-authentication--security)
   - 6.1 OAuth-Only Authentication
   - 6.2 Authentication Flows
   - 6.3 API Key Management
   - 6.4 Rate Limiting
   - 6.5 Security Best Practices
7. [Payment Integration](#7-payment-integration)
   - 7.1 Primary Method: Telegram @CryptoBot
   - 7.2 Alternative Method: Shkeeper.io
   - 7.3 Subscription Management
   - 7.4 Refund Policy
8. [Telegram Bot UX](#8-telegram-bot-ux)
   - 8.1 Main Menu Structure
   - 8.2 Chat Flow
   - 8.3 Account Screen
   - 8.4 Payment Screen
   - 8.5 Referral System (Replaced with Partner API)
   - 8.6 Settings Screen
   - 8.7 Command Reference
9. [Admin Dashboard](#9-admin-dashboard)
   - 9.1 Dashboard Architecture
10. [Desktop Application: router.plus VPN](#10-desktop-application-routerplus-vpn)
    - 10.1 Overview
    - 10.2 Architecture
    - 10.3 Supported Coding Agents
    - 10.4 User Interface
    - 10.5 Configuration File Structure
    - 10.6 Protocol Translation Details
    - 10.7 Security & Privacy
    - 10.8 Installation & Distribution
    - 10.9 First-Run Experience
    - 10.10 Development Roadmap
    - 10.11 Technical Implementation Notes
11. [Integration Points](#11-integration-points)
    - 11.1 Desktop VPN ↔ Web Platform
    - 11.2 Telegram Bot ↔ Desktop VPN
    - 11.3 Web Dashboard ↔ Desktop VPN
    - 11.4 OpenAI-Compatible API ↔ All Components
    - 11.5 Third-Party Integrations
    - 11.6 Webhook Events
12. [Deployment & Infrastructure](#12-deployment--infrastructure)

---

## 1. Executive Summary

**What we're building:** A B2C SaaS AI model router that provides reliable, cost-optimized access to multiple AI providers through intelligent routing and failover mechanisms.

**Business model:** Single "Vibe" tier at $10/month with unlimited access under fair use policy.24-hour free trial with comprehensive anti-fraud protection.

**Target users:** Developers, power users, and AI enthusiasts who need reliable AI access without provider lock-in or quota concerns.

**Value proposition:** Multi-provider reliability with automatic failover, cost optimization through intelligent routing, and Telegram-first user experience with crypto payments.

**Key differentiators:**

- Silent provider failover with circuit breaker protection
- Capability-aware routing (auto-escalates to vision/tool-capable providers when needed)
- Telegram-native interface with crypto payments
- Universal proxy architecture supporting any OpenAI-compatible endpoint
- Built on OmniRoute's proven patterns (290providers, 130migrations, 19 routing strategies)

**Tech stack:** Node.js 20+, TypeScript, Next.js, SQLite with WAL mode, Redis, React 19, TailwindCSS v4

**Timeline:** 10-12 hours development with parallel AI agent teams

**Domain:** router.plus (verified available)

---

## 2. Business Model

### 2.1 Revenue Model

**Single tier for V1:**

- **"Vibe" tier:** $10/month unlimited access
- Fair use policy: 100 messages/minute rate limit (admin-configurable)
- Manual renewal (no auto-renew due to crypto payment constraints)
- 3-day grace period after subscription expiry

**Future tier expansion:**

- Admin-configurable tier system built into schema
- Flexible model access control per tier via combos/chains/routing

### 2.2 Free Trial System

**24-hour trial with full features:**

- All models and features available (including API keys)
- Same rate limits as paid tier (100 msg/min)
- One trial per user per IP address at account creation
- Trial + subscription time stacks (remaining trial hours + full30days)

**Trial expiry behavior:**

- Soft block: Complete current response, show upgrade overlay, prevent new messages
- No free tier fallback - hard cutoff after trial

**Anti-fraud architecture:**

- Multi-layer detection scoring 0-100 with admin review queue at 70+ score
- Strict IP enforcement: 1trial per IP per24 hours
- OAuth account verification at account creation (no disposable emails)
- Device fingerprinting tracked across OAuth providers
- Geographic restriction capabilities (admin-configurable blocklists)
- Behavioral analysis: message patterns, timing, API usage
- VPN/proxy detection: Flag at first 2FA, queue for manual review (not auto-block)

**Database tables:**

- `trial_history`: user_id, ip_address, device_fingerprint, started_at, expired_at
- `fraud_checks`: user_id, check_type, score, details JSON, reviewed_by, created_at
- `ip_reputation`: ip_address, reputation_score, fraud_count, last_seen, notes
- `device_fingerprints`: fingerprint_hash, user_ids JSON array, first_seen, last_seen

### 2.3 Payment Integration

**Primary method: Telegram @CryptoBot**

- Telegram Stars invoices for in-bot payments
- Instant payment confirmation via webhook
- Seamless UX within Telegram interface

**Alternative: Shkeeper.io**

- Multi-crypto support: USDT, USDC, TON, SOL, TRX,MATIC
- Networks: TRC20, BEP20, Polygon, Solana, ERC20
- Web-based payment flow for non-Telegram users

**Payment flow:**

1. User selects amount ($10 monthly or custom top-up)
2. Crypto and network selection with fee recommendations
3. Unique payment address generated (15-minute expiry)
4. On-chain confirmation detection (1-3 confirmations based on network)
5. Webhook notification to backend
6. Balance update and subscription activation

**Subscription management:**

- Manual renewal only (crypto limitations)
- Balance top-ups never expire (usable for future renewals)
- No refunds ever (crypto irreversibility)

**Database tables:**

- `subscription_plans`: plan_id, name, price_usd, duration_days, features JSON
- `user_subscriptions`: user_id, plan_id, started_at, expires_at, auto_renew, status
- `payments`: payment_id, user_id, amount_usd, crypto_type, network, tx_hash, status, created_at, confirmed_at
- `redeem_codes`: code, discount_percent, max_uses, uses_count, expires_at, created_by

### 2.4 Partner API & Resellers

**Replaced referral system with:**

- Partner API for resellers with balance tracking
- Coupon/promo code system for discounts
- Commission tracking per partner
- Bulk code generation capabilities

**Partner features:**

- Dashboard for code performance
- Balance management and withdrawals
- Custom discount percentages (admin-set)
- Usage analytics per generated code

**Promo code structure:**

- Launch strategy: 1-year promo coupons for heavy user mitigation
- Flexible expiry dates
- Usage limits (max redemptions)
- Percentage or fixed amount discounts

**Database tables:**

- `partners`: partner_id, name, email, balance_usd, commission_rate, status, created_at
- `partner_codes`: code, partner_id, discount_type, discount_value, max_uses, uses_count, expires_at
- `code_redemptions`: redemption_id, code, user_id, discount_applied, redeemed_at

---

## 3. Architecture Overview

### 3.1 High-Level System Flow

```
User → OAuth (Google/GitHub/Telegram) → Subscription Check → Router → Provider Pool → Response↓
                                         Trial/Fraud Check
                                              ↓Rate Limit (Redis)
                                              ↓Capability Detection
                                              ↓
                                    Routing Strategy Selection
                                              ↓Circuit Breaker Check
                                              ↓Provider Selection
                                              ↓
                                       Fallback Chain (if needed)
                                              ↓
                                        Usage Logging (SQLite)
```

### 3.2 Universal Proxy Architecture

**Design philosophy:** Support any OpenAI-compatible endpoint without provider-specific code

**Supported endpoint types:**

- Official APIs (OpenAI, Anthropic, Google, etc.)
- Third-party proxies and aggregators
- Self-hosted models (Ollama, vLLM, etc.)
- Custom endpoints with OpenAI-compatible schema

**Provider configuration:**

- Base URL
- Authentication method (Bearer token, API key, OAuth)
- Model mappings (provider model → standard name)
- Capability overrides (supports vision, tools, streaming, etc.)
- Cost per1M tokens (input/output)
- Rate limits and quotas

### 3.3 Multi-Server Deployment

**Architecture:**

- 3+ VPS servers from day 1 (~$60/month total)
- Redis cluster for rate limiting and session management
- SQLite with cloud sync (no replication, shared volume approach)
- No single point of failure

**Server roles:**

- Load balancer (nginx or Caddy)
- App servers (Node.js instances behind PM2)
- Redis cluster (3-node minimum for quorum)
- Shared storage for SQLite database file

**Scalability:**

- Horizontal scaling via additional app servers
- Redis Cluster automatic sharding
- SQLite WAL mode for concurrent reads
- Future: PostgreSQL migration for true multi-instance writes

### 3.4 Decision: Build from Scratch, Use OmniRoute as Reference

**Critical decision from interview Q12:**

- Do NOT fork OmniRoute directly
- Build from scratch following proven patterns
- Study OmniRoute's database guide and architecture
- Adopt successful patterns, simplify what's not needed

**Adoption strategy:**

- **Adopt:** SQLite + WAL mode, capability-based routing, circuit breakers, comprehensive logging
- **Simplify:** 15 admin pages (not 53), 1-3 providers initially (not 290), 3-4 routing strategies (not 19)
- **Add new:** Trial + fraud system, Partner API, coupon system, multi-language support, Telegram-first UX, crypto payments

---

## 4. Database Architecture

### 4.1 Core Database Design

**Database engine:** SQLite with better-sqlite3 driver

**Single source of truth:** `DATA_DIR/storage.sqlite` with WAL mode enabled

**Multi-driver fallback hierarchy:**

1. better-sqlite3 (primary, native performance)
2. node:sqlite (Node.js built-in fallback)
3. sql.js WASM (browser/edge compatibility)

**SQLite pragmas for performance:**

```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 2000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456;  -- 256MB
```

### 4.2 Schema Structure

**Core tables (from OmniRoute patterns):**

- `provider_connections`: Provider credentials and configuration
- `combos`: Model chains and routing strategies
- `model_combo_mappings`: Model name → combo routing
- `usage_history`: Request logs with costs and latency
- `call_logs`: Detailed request/response metadata
- `key_value`: Namespace-based configuration store

**User & authentication tables:**

- `users`: user_id, oauth_provider, oauth_id, email, display_name, created_at, last_login
- `api_keys`: key_id, user_id, key_hash (SHA256), prefix (sk-rp_), created_at, last_used, status
- `oauth_sessions`: session_id, user_id, provider, access_token_encrypted, expires_at

**Subscription & payment tables:**

- `subscription_plans`: plan_id, name, price_usd, duration_days, features JSON
- `user_subscriptions`: user_id, plan_id, started_at, expires_at, status (active/expired/cancelled)
- `payments`: payment_id, user_id, amount_usd, crypto_type, network, tx_hash, status, webhook_data JSON
- `redeem_codes`: code, discount_percent, max_uses, uses_count, expires_at, created_by

**Usage & analytics tables:**

- `usage_logs`: user_id, model, tokens_in, tokens_out, cost_usd, latency_ms, created_at
- `usage_aggregates`: user_id, date, total_requests, total_cost, total_tokens, models_used JSON

**Anti-fraud tables:**

- `fraud_checks`: user_id, check_type, score (0-100), details JSON, reviewed_by, created_at
- `ip_reputation`: ip_address, reputation_score, fraud_count, last_seen, notes
- `device_fingerprints`: fingerprint_hash, user_ids JSON, first_seen, last_seen
- `trial_history`: user_id, ip_address, device_fingerprint, started_at, expired_at

**Partner & promo tables:**

- `partners`: partner_id, name, email, balance_usd, commission_rate, status
- `partner_codes`: code, partner_id, discount_type, discount_value, max_uses, uses_count, expires_at
- `code_redemptions`: redemption_id, code, user_id, discount_applied, redeemed_at

**Routing & resilience tables:**

- `domain_circuit_breakers`: domain (provider), state (CLOSED/DEGRADED/OPEN/HALF_OPEN), failure_count, last_failure, next_probe
- `domain_fallback_chains`: combo_id, priority, fallback_combo_id, enabled
- `domain_budgets`: session_id, max_cost_usd, current_cost, action (degrade/block/alert), degraded_to_tier

**Provider capability tables:**

- `provider_capabilities`: provider_id, supports_vision, supports_tools, supports_reasoning, supports_audio_input, supports_audio_output, supports_streaming, supports_structured_output, metadata JSON
- `model_capabilities`: model_name, capabilities JSON, detection_source (registry/sync/heuristic)
- `feature_usage_logs`: user_id, request_id, features_used JSON, escalated_to_provider, cost_delta, created_at

### 4.3 Migration System

**Versioned migrations:** 130+ SQL files with naming `NNN_description.sql`

**Migration tracking table:**

```sql
CREATE TABLE _omniroute_migrations (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  applied_at INTEGER NOT NULL
);
```

**Safety mechanisms:**

- Pre-migration automatic backups (skipped in tests)
- Heuristic seeding for existing databases
- Transaction-per-file atomicity
- Mass-migration abort if >50pending on existing DB
- Renamed/superseded migration compatibility

**Implementation:** `/root/router/OmniRoute/src/lib/db/migrationRunner.ts`

### 4.4 Backup & Recovery Strategy

**Trigger points:**

- Pre-write safety snapshot
- Scheduled backups (daily/weekly/monthly)
- Pre-restore checkpoint
- Manual admin trigger

**Storage location:** `DATA_DIR/db_backups/db_<timestamp>_<reason>.sqlite`

**Retention policy:**

- Keep latest N backups (default: 20)
- Age-based cleanup (>30 days deleted)
- 60-minute throttle between auto-backups

**Corruption recovery flow:**

1. Probe failure detection (integrity_check pragma fails)
2. Critical state capture (last known good data)
3. Rename corrupt DB to `.corrupt-<timestamp>`
4. Initialize fresh schema via migrations
5. Selective restore from latest backup
6. Verify integrity post-restore

**Zero-downtime recovery:** Automatic backup + restore with cycle-breaker (max 3 loops)

**Implementation:** `/root/router/OmniRoute/src/lib/db/backup.ts`

### 4.5 Performance Optimization

**Auto-vacuum modes:**

- NONE (default for<1GB databases)
- FULL (automatic cleanup on write)
- INCREMENTAL (gradual cleanup)

**Checkpoint strategy:**

- TRUNCATE on backup/restore/close
- FULL after VACUUM operations
- PASSIVE for opportunistic cleanup

**Query optimization:**

- Prepared statement caching per module
- Read cache layer with TTL
- Batch operations via transactions

**Indexing strategy:**

- Multi-column indexes for composite queries: `(provider, priority)`, `(api_key_id, reset_at DESC)`
- Single-column indexes for frequent filters: timestamps, status, foreign keys

**Table retention policies:**

- `usage_logs`: 30 days (auto-cleanup)
- `call_logs`: 30 days (auto-cleanup)
- `fraud_checks`: 90 days (manual review)

**Large blob offloading:**

- Call log artifacts stored in filesystem: `DATA_DIR/call_log_artifacts/`
- SQLite stores only metadata: relative path, size, SHA256

**Implementation:** `/root/router/OmniRoute/src/lib/db/optimizationSettings.ts`, `vacuumScheduler.ts`

### 4.6 Health Checks

**Startup checks:**

- `PRAGMA integrity_check`
- Schema version match
- Critical table existence
- Foreign key validation

**Auto-repair capabilities:**

- Drop/recreate corrupted indexes
- Re-run missing migrations
- Create pre-repair backups

**Periodic health monitoring:**

- Every 6 hours with unref() timers
- Skipped in cloud/build/test environments

**Liveness probe:**

- Simple `SELECT 1` query for sub-millisecond connectivity check

**Implementation:** `/root/router/OmniRoute/src/lib/db/core.ts`

### 4.7 Multi-Instance Limitations

**Current architecture:** Single-instance, no replication or distributed consensus

**Workarounds for multi-server deployment:**

- Shared volume (NFS, EFS, etc.) - introduces I/O latency
- Leader-follower pattern with read replicas
- External state store (PostgreSQL/Redis) for distributed state
- Session affinity at load balancer

**Future consideration:** PostgreSQL migration for true multi-instance writes

---

## 5. Tech Stack

### 5.1 Backend Stack

**Runtime:** Node.js 20+ LTS

**Language:** TypeScript 5.3+ with strict mode

**Framework:** Next.js 14+ (App Router)

**Database:**

- SQLite with better-sqlite3 driver
- WAL mode enabled
- Automatic migrations via versioned SQL files

**Caching & State:**

- Redis 7+ for rate limiting and session management
- Redis Cluster for multi-server deployment

**API Design:**

- RESTful endpoints for admin and user operations
- OpenAI-compatible proxy endpoints
- Webhook receivers for payment providers

### 5.2 Frontend Stack

**UI Framework:** React 19 with Server Components

**Rendering:** Next.js App Router with SSR and streaming

**Styling:** TailwindCSS v4 with custom design system

**State Management:**

- Zustand for client state
- TanStack Query (React Query) for server state with SWR pattern

**Forms & Validation:**

- React Hook Form
- Zod for schema validation

**Data Visualization:**

- Recharts for analytics dashboards
- Sparklines for 24h traffic trends

### 5.3 Telegram Bot Stack

**Bot Framework:** node-telegram-bot-api

**Message Queue:** Redis Streams with worker pool pattern

**Internationalization:** i18next with7 languages

**Supported languages:**

- English (EN) - default
- Russian (RU)
- Arabic (AR) - RTL support
- Chinese (CN)
- French (FR)
- Spanish (ES)
- Portuguese (PT)
- Hindi (HI)

**RTL Support:** Automatic layout flip for Arabic

**Deep Linking:** OAuth flow with Telegram bot integration

### 5.4 Payment Integration Stack

**Primary:** Telegram @CryptoBot

- Official Telegram Bot API
- Telegram Stars support
- Instant webhook notifications

**Alternative:** Shkeeper.io REST API

- Multi-crypto and multi-network support
- Address generation and monitoring
- Webhook callbacks for confirmations

**Supported cryptocurrencies:**

- USDT (TRC20, BEP20, ERC20, Polygon)
- USDC (TRC20, BEP20, ERC20, Polygon)
- TON (Telegram Open Network)
- SOL (Solana)
- TRX (Tron)
- MATIC (Polygon)
- Telegram Stars (in-app currency)

### 5.5 DevOps Stack

**Development:**

- Docker Compose for local services
- Hot reload with Next.js dev server
- SQLite file-based database (no container needed)

**Production:**

- systemd for process management
- PM2 as process manager alternative
- nginx or Caddy for reverse proxy
- Let's Encrypt for SSL certificates

**Monitoring:**

- Telegram incidents bot for alerts
- AI agent automation for auto-healing
- Metrics dashboard in admin UI

**Deployment:**

- Multi-VPS setup (3+ servers)
- Redis Cluster for distributed state
- Shared volume for SQLite (or leader-follower replication)

---

## 6. Authentication & Security

### 6.1 OAuth-Only Authentication

**Rationale:**

- Prevents disposable email abuse
- Verifies real Google/GitHub/Telegram accounts
- Harder to create fake accounts at scale
- Reduces fraud and trial stacking

**Supported providers:**

- Google OAuth2.0
- GitHub OAuth
- Telegram Login Widget

**No email/password authentication:** Explicitly rejected to enforce OAuth requirement

### 6.2 Authentication Flows

**Web authentication flow:**

1. User clicks "Sign in with Google/GitHub"
2. OAuth redirect to provider
3. Provider authorization and callback
4. Backend exchanges code for tokens
5. User profile creation or lookup
6. Session cookie set (httpOnly, secure, sameSite)
7. Redirect to dashboard

**Telegram bot authentication flow:**

1. User sends `/start` to bot
2. Bot sends deep link button: "🔐 Connect Account"
3. Deep link opens web OAuth flow: `https://router.plus/auth/telegram?bot_token=xxx`
4. After OAuth completion, redirect back to bot
5. Bot notified via webhook
6. Bot sends confirmation: "✅ Account connected!"

### 6.3 API Key Management

**Key format:** `sk-rp_<48-char-random>` (router.plus prefix)

**Storage:** SHA256 hash only, never plaintext

**Display:** Masked `sk-rp_abc123...xyz789` (first 6 + last 4 chars visible)

**Limits:** Maximum 10 API keys per user

**Operations:**

- Create: Generate random key, hash with SHA256, store hash + prefix
- Revoke: Mark as inactive, prevent future use
- Copy: One-click clipboard copy in UI
- Usage tracking: Last used timestamp updated on each request

**Scopes (future expansion):**

- read:messages (default)
- write:messages (default)
- admin:settings (admin users only)

**Rate limiting:** 100 requests/minute per API key (same as user account)

### 6.4 Rate Limiting

**Per-user limits:**

- 100 messages/minute (admin-configurable)
- Applied to both Telegram and API requests
- Shared across all API keys for a user

**Per-IP limits:**

- 1000 requests/minute
- DDoS protection layer
- Applied before authentication

**Implementation:**

- Redis atomic counters with TTL
- Token bucket algorithm
- Circuit breaker on repeated abuse

**Response headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1627849200
```

### 6.5 Security Best Practices

**Secrets management:**

- Environment variables for sensitive config
- No hardcoded credentials in code
- OAuth tokens encrypted at rest

**HTTPS enforcement:**

- All web traffic over TLS 1.3
- HSTS headers enabled
- Certificate auto-renewal via Let's Encrypt

**SQL injection prevention:**

- Parameterized queries only
- No string concatenation for SQL

**XSS prevention:**

- React automatic escaping
- Content Security Policy headers

**CSRF protection:**

- SameSite cookies
- CSRF tokens for state-changing operations

---

## 7. Payment Integration

### 7.1 Primary Method: Telegram @CryptoBot

**Integration approach:**

- Telegram Bot API built-in payment support
- @CryptoBot as payment provider
- Telegram Stars as in-app currency

**Payment flow:**

1. User taps "💳 Subscribe $10/month" in bot
2. Bot sends invoice via `sendInvoice` API
3. User completes payment within Telegram
4. Telegram sends `pre_checkout_query` to bot
5. Bot validates and confirms
6. Telegram sends `successful_payment` update
7. Bot updates subscription status
8. User receives confirmation message

**Webhook handling:**

- Endpoint: `POST /api/webhooks/telegram-payment`
- Signature verification via bot token hash
- Idempotency via payment_charge_id
- Atomic database updates

### 7.2 Alternative Method: Shkeeper.io

**Integration approach:**

- REST API for crypto payments
- Multi-crypto and multi-network support
- On-chain payment monitoring

**Supported networks:**

- TRC20 (Tron) - Lowest fees, recommended for USDT
- BEP20 (Binance Smart Chain) - Low fees
- ERC20 (Ethereum) - Higher fees, most liquidity
- Polygon (Matic) - Low fees, fast confirmations
- Solana - Ultra-low fees, fast

**Payment flow:**

1. User selects subscription or top-up amount
2. User selects crypto (USDT/USDC/TON/SOL/TRX/MATIC)
3. User selects network (TRC20/BEP20/ERC20/Polygon/Solana)
4. Backend calls Shkeeper API to generate payment address
5. User shown QR code and address with15-minute expiry
6. User sends crypto from their wallet
7. Shkeeper monitors blockchain for confirmations
8. Webhook sent to backend after1-3 confirmations
9. Backend updates balance and subscription
10. User notified via email/Telegram

**API endpoints used:**

- `POST /api/v1/create` - Generate payment address
- `GET /api/v1/status/{id}` - Check payment status
- Webhook: `POST /api/webhooks/shkeeper`

**Webhook security:**

- HMAC signature verification
- IP allowlist for Shkeeper servers
- Idempotency via transaction hash

### 7.3 Subscription Management

**Billing cycle:** 30 days from purchase date

**Renewal:** Manual only (no auto-renew due to crypto constraints)

**Grace period:** 3 days after expiry (access continues)

**Balance system:**

- One-time top-ups never expire
- Balance can be used for subscription renewal
- Balance deducted before payment provider
- Display: "Balance: $5.00 (use for next renewal)"

**Expiry notifications:**

- 7 days before expiry: "⏰ Subscription expires in 7 days"
- 1 day before expiry: "⚠️ Subscription expires tomorrow"
- On expiry: "❌ Subscription expired. Top up to continue."

### 7.4 Refund Policy

**Policy:** No refunds ever

**Rationale:** Crypto payments are irreversible on-chain

**Communication:**

- Clearly stated on pricing page
- Confirmation required before payment
- Support for technical issues only (not refunds)

---

## 8. Telegram Bot UX

### 8.1 Main Menu Structure

**Entry point:** `/start` command

**Language selection on first start:**

```
Welcome to router.plus! 🚀

Please select your language:
[🇺🇸 English][🇷🇺 Русский]  [🇸🇦 العربية]
[🇨🇳 中文]  [🇫🇷 Français]  [🇪🇸 Español]  [🇧🇷 Português]
```

**Main menu (after language selection):**

```
router.plus – AI Router🤖

💬 Chat
👤 Account
💳 Top Up
🎟️ Redeem Code
📊 Stats
🎁 Invite Friends
⚙️ Settings
❓ Help
```

### 8.2 Chat Flow

**Starting a chat:**

1. User taps "💬 Chat"
2. Bot shows model selector: "Choose model: [GPT-4] [Claude] [Gemini] [Auto]"
3. User selects model or "Auto" for intelligent routing
4. Bot enters chat mode: "Ready! Send your message. Use /back to return to menu."

**During chat:**

- User sends text/image/file
- Bot shows typing indicator
- Bot streams response (or sends complete message)
- User can switch models: [Switch Model] button appears below each response
- Usage counter: "Tokens used: 1,234 | Cost saved: $0.03"

**Model switching:**

```
Switch Model:
[GPT-4o] [Claude Sonnet] [Gemini Pro]
[Auto Route] [Cancel]
```

**Exiting chat:**

- User taps [Back to Menu] button
- Or sends `/back` command
- Chat history preserved for session

### 8.3 Account Screen

**Display:**

```
👤 Account

Plan: Vibe ($10/month)✅
Status: Active until 2026-08-29
Balance: $5.00

📊 This Month:
├─ Messages: 1,234
├─ Tokens: 456,789
├─ Cost: $8.45
└─ Saved: $12.30vs. retail

🔑 API Keys: 2/10

[Manage API Keys]
[View Usage History]
[Back]
```

**Managing API Keys:**

```
🔑 API Keys (2/10)

1️⃣ sk-rp_abc123...xyz789Created: 2026-07-15
   Last used: 2 hours ago
   [Copy] [Revoke]

2️⃣ sk-rp_def456...uvw012
   Created: 2026-07-01
   Last used: Never
   [Copy] [Revoke]

[+ Create New Key]
[Back]
```

### 8.4 Payment Screen

**Top-up flow:**

```
💳 Top Up

Monthly Plans:
├─ 🎯 $10/month – Vibe Tier
└─ 💎 $50/6 months (save15%) – PROMO

One-Time Credits:
├─ $5 – Never expires
├─ $10 – Never expires
└─ $20 – Never expires (10% bonus)

Select amount: [Continue]
```

**Crypto selection:**

```
Select Cryptocurrency:

⚡ Recommended (lowest fees):
[USDT - TRC20]

💵 Stablecoins:
[USDT - BEP20] [USDT - ERC20]
[USDC - TRC20] [USDC - Polygon]

🪙 Native Tokens:
[TON] [SOL] [TRX] [MATIC]

🌟 Telegram:
[Telegram Stars]

[Back]
```

**Payment address display:**

```
Send $10.00 in USDT (TRC20)

Amount: 10 USDT
Address: TXYz123...abc789

[QR Code Image]

⏱️ Expires in 14:32

Status: Waiting for payment...
[I've sent the payment]
[Cancel]

⚠️ Send EXACT amount to this address.
Network: TRC20 ONLY (Tron network)
```

**Payment confirmation:**

```
✅ Payment Received!

Amount: 10 USDT
Transaction: abc123...xyz789
Confirmations: 3/3

Your subscription is now active! 🎉

Expires: 2026-08-29

[Back to Menu]
```

### 8.5 Referral System (Replaced with Partner API)

**Note:** Traditional referral system removed per decision Q11

**Replacement:** Partner API with coupon/promo code system

**For end users:**

```
🎟️ Redeem Code

Enter your promo code:
[Text Input]

[Redeem]
[Back]
```

**Redemption success:**

```
✅ Promo Code Applied!

Code: LAUNCH2026
Discount: 50% off first month
New price: $5.00 (was $10.00)

[Continue to Payment]
```

### 8.6 Settings Screen

**Options:**

```
⚙️ Settings

🌐 Language: English
🔔 Notifications: On
📧 Email: user@example.com
🔗 Connected: Google

[Change Language]
[Notification Preferences]
[Connect OAuth Account]
[Privacy Policy]
[Terms of Service]
[Contact Admin]
[Back]
```

**Language selection:**

```
🌐 Change Language

[🇺🇸 English]
[🇷🇺 Русский]
[🇸🇦 العربية]
[🇨🇳 中文]
[🇫🇷 Français]
[🇪🇸 Español]
[🇧🇷 Português]

[Back]
```

### 8.7 Command Reference

**Public slash commands (only3):**

- `/start` - Initialize bot, show language selection, main menu
- `/language` - Change interface language
- `/contactadmin` - Open support ticket or send message to admin

**All other features:** Inline keyboard buttons only (no slash commands)

**Rationale:** Cleaner UX, easier discovery, no command memorization needed

---

## 9. Admin Dashboard

### 9.1 Dashboard Architecture

**Dual interface model:**

- **Web Dashboard:** Next.js React app with SSR
- **Terminal UI (TUI):** Ink-based interactive CLI

**Navigation pattern:**

- Tab-based with keyboard shortcuts (1-7 for quick jump)
- Consistent layouts across all sections
- Mobile-first responsive design

**Real-time updates:**

- SWR-based data fetching
- Auto-refresh intervals: 5s (health), 10s (combos/providers), 30s (cost)
- Manual refresh with'r' keyboard shortcut
- WebSocket support for live updates

---

## 10. Desktop Application: router.plus VPN

### 10.1 Overview

**Product name:** router.plus VPN (working title, may be adjusted)

**Value proposition:** Local transparent proxy that routes all AI coding agent traffic through router.plus, acting like a VPN but for AI API calls. Single configuration point for all coding tools.

**Target users:**

- Developers using multiple AI coding assistants (Claude Desktop, VS Code extensions, Cursor, etc.)
- Users who want centralized provider management without editing configs per tool
- Teams standardizing on router.plus infrastructure

**Core behavior:**

- Runs as system tray application (Windows/Mac/Linux)
- Starts local HTTP/HTTPS proxy server (default port: 41100, configurable)
- Intercepts API calls to Claude, OpenAI, Google AI, and other providers
- Rewrites requests to route through router.plus
- Manages authentication via single router.plus API key
- Handles protocol translation (Anthropic ↔ OpenAI format)
- Provides unified configuration UI for all supported coding agents

### 10.2 Architecture

**Technology stack:**

- **Runtime:** Electron (cross-platform desktop)
- **UI:** HTML/CSS/JavaScript (lightweight, no framework overhead)
- **Proxy engine:** Node.js built-in `http`/`https` modules
- **State storage:** JSON files in user data directory
- **System integration:** Native tray icons, system notifications, auto-launch

**Core components:**

1. **Local Proxy Server (Port 41100)**
   - HTTP server listening on `127.0.0.1:41100`
   - Intercepts requests to:
     - `api.anthropic.com` (Claude Desktop, Claude CLI)
     - `api.openai.com` (VS Code, Cursor, Codex)
     - `generativelanguage.googleapis.com` (Gemini)
     - `api.figma.com/ai` (Figma Make Desktop AI features)
   - Request transformation pipeline:
     1. Parse incoming request (headers, body, model ID)
     2. Extract authentication from original request
     3. Replace with router.plus API key
     4. Rewrite endpoint to `https://router.plus/v1/*`
     5. Forward modified request
     6. Stream response back to client
     7. Log request metadata (model, tokens, latency)

2. **Protocol Translation Engine**
   - Anthropic ↔ OpenAI format conversion
   - Model name mapping and routing
   - Tool/function call translation
   - Streaming response handling
   - Error message normalization

3. **Configuration Manager**
   - Detects installed coding agents automatically
   - Generates agent-specific configurations
   - Writes settings files atomically with backups
   - Profile system (save/load/switch provider combos)

4. **System Integration**
   - Tray icon with status indicator (green=active, yellow=partial, red=error)
   - Context menu: Enable/Disable, Open Dashboard, Quit
   - Auto-start on system boot (optional)
   - macOS: Login Items, Windows: Startup folder, Linux: autostart desktop file

### 10.3 Supported Coding Agents

**Tier 1: Full Auto-Configuration**

1. **Claude Desktop**
   - Config path: `~/Library/Application Support/Claude-3p/configLibrary/` (macOS)
   - Config path: `%LOCALAPPDATA%/Claude-3p/configLibrary/` (Windows)
   - Config path: `~/.config/Claude-3p/configLibrary/` (Linux)
   - Method: Write gateway config JSON with router.plus endpoint
   - Features: Model picker routing, protocol passthrough

2. **Claude CLI (Code)**
   - Config path: `~/.claude/settings.json`
   - Method: Set environment variables:
     ```json
     {
       "ANTHROPIC_BASE_URL": "http://127.0.0.1:41100",
       "ANTHROPIC_AUTH_TOKEN": "sk-rp_xxx"
     }
     ```
   - Backup: Timestamped `.openclaude-backup-*` files

3. **VS Code (Continue, Cline, Roo-Cline, Kiro extensions)**
   - Config path: User settings.json or extension-specific
   - Method: Write extension configuration:
     ```json
     {
       "continue.apiBase": "http://127.0.0.1:41100",
       "continue.apiKey": "sk-rp_xxx",
       "cline.anthropic.baseUrl": "http://127.0.0.1:41100"
     }
     ```
   - Supports multiple extensions simultaneously

4. **Cursor**
   - Config path: `~/.cursor/settings.json`
   - Method: Override API endpoint in settings
   - Model mapping: Cursor model IDs → router.plus models

5. **Windsurf**
   - Config path: `~/.windsurf/settings.json`
   - Method: Similar to VS Code pattern

**Tier 2: Manual Configuration Assisted**

6. **JetBrains IDEs (IntelliJ, PyCharm, WebStorm with AI Assistant)**
   - Provides copy-paste config snippet
   - Shows settings path and required values
   - User must paste manually (JetBrains settings are binary/complex)

7. **Zed Editor**
   - Config path: `~/.config/zed/settings.json`
   - Provides config snippet with instructions

8. **Neovim (with copilot.lua, cmp-ai, etc.)**
   - Provides Lua config snippet for init.lua
   - Documents environment variable approach

**Tier 3: Environment Variable Fallback**

9. **Any tool respecting standard env vars**
   - Sets system environment variables:
     - `ANTHROPIC_API_KEY=sk-rp_xxx`
     - `ANTHROPIC_BASE_URL=http://127.0.0.1:41100`
     - `OPENAI_API_KEY=sk-rp_xxx`
     - `OPENAI_BASE_URL=http://127.0.0.1:41100`
   - macOS: `launchctl setenv`
   - Windows: Registry `HKCU\Environment`
   - Linux: `~/.profile` or `~/.bashrc`

### 10.4 User Interface

**Main Window (880x720px, resizable)**

**Tab 1: Dashboard**

```
┌─────────────────────────────────────────────┐
│ router.plus VPN          [●] Connected      │
├─────────────────────────────────────────────┤
│                                             │
│  Status:  ● Active – Routing via router.plus│
│  Proxy:   127.0.0.1:41100                   │
│  Account: user@email.com (Vibe tier)        │
│  Expires: 2026-08-29 (29 days)              │
│                                             │
│  📊 Today's Usage                            │
│  ├─ Requests: 1,234                         │
│  ├─ Tokens: 456,789                         │
│  ├─ Cost: $2.34                             │
│  └─ Saved: $8.90 vs. retail                 │
│                                             │
│  🔍 Detected Agents (4/9)                    │
│  ✅ Claude Desktop – Configured              │
│  ✅ Claude CLI – Configured                  │
│  ✅ VS Code (Continue) – Configured          │
│  ⚠️  Cursor – Not configured yet            │
│                                             │
│  [Configure All]  [Open Web Dashboard]      │
└─────────────────────────────────────────────┘
```

**Tab 2: Agent Configuration**

```
┌─────────────────────────────────────────────┐
│ Configure Coding Agents                     │
├─────────────────────────────────────────────┤
│                                             │
│ 🔍 Auto-Detected:                            │
│                                             │
│ ✅ Claude Desktop    [✓ Enabled]  [Configure]│
│    ~/Library/Application Support/Claude-3p  │
│    Status: Active, last used 2h ago         │
│                                             │
│ ✅ Claude CLI        [✓ Enabled]  [Configure]│
│    ~/.claude/settings.json                  │
│    Status: Active, last used 5m ago         │
│                                             │
│ ⚪ VS Code          [  Enable  ]  [Configure]│
│    Not detected – Click to set up           │
│                                             │
│ ⚪ Cursor           [  Enable  ]  [Configure]│
│    Not detected – Click to set up           │
│                                             │
│ 📋 Manual Setup:                             │
│                                             │
│ ⚙️  JetBrains IDEs  [Copy Config]            │
│ ⚙️  Zed Editor      [Copy Config]            │
│ ⚙️  Neovim          [Copy Config]            │
│                                             │
│ [Enable All Detected]  [Reset All]          │
└─────────────────────────────────────────────┘
```

**Tab 3: Proxy Log**

```
┌─────────────────────────────────────────────┐
│ Live Request Log                 [Clear Log]│
├─────────────────────────────────────────────┤
│ Time      Agent          Model      Status  │
│ 10:05:23  Claude Desktop sonnet-4   200 1.2s│
│ 10:05:18  VS Code       gpt-4o     200 0.8s│
│ 10:04:55  Claude CLI    haiku-3.5  200 0.5s│
│ 10:04:32  Cursor        sonnet-4   200 1.5s│
│                                             │
│ Filters: [All Agents▾] [All Models▾] [✓200]│
│                                             │
│ Request Details (selected):                 │
│ ┌─────────────────────────────────────────┐ │
│ │ Agent: Claude Desktop                   │ │
│ │ Model: claude-sonnet-4                  │ │
│ │ Input tokens: 1,234                     │ │
│ │ Output tokens: 567                      │ │
│ │ Latency: 1,234ms (TTFT: 234ms)         │ │
│ │ Cost: $0.02                             │ │
│ │ Routed via: combo-1 → anthropic-direct │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Tab 4: Settings**

```
┌─────────────────────────────────────────────┐
│ Settings                                    │
├─────────────────────────────────────────────┤
│                                             │
│ Account                                     │
│ ├─ Email: user@email.com                    │
│ ├─ API Key: sk-rp_abc...xyz [Regenerate]    │
│ └─ [Open Web Dashboard]                     │
│                                             │
│ Proxy Settings                              │
│ ├─ Port: [41100]                            │
│ ├─ [✓] Start on system boot                 │
│ ├─ [✓] Show in system tray                  │
│ └─ [ ] Enable debug logging                 │
│                                             │
│ Backup & Recovery                           │
│ ├─ Last backup: 2026-07-31 09:45            │
│ ├─ [Create Backup Now]                      │
│ └─ [Restore from Backup...]                 │
│                                             │
│ Advanced                                    │
│ ├─ [ ] Disable SSL verification (dev only)  │
│ ├─ [ ] Log all request/response bodies      │
│ └─ Data directory: ~/.router-plus-vpn       │
│     [Open in Finder/Explorer]               │
│                                             │
│ About                                       │
│ ├─ Version: 1.0.0                           │
│ ├─ [Check for Updates]                      │
│ └─ [View Changelog]                         │
└─────────────────────────────────────────────┘
```

**System Tray Menu**

```
router.plus VPN
──────────────
● Connected
   127.0.0.1:41100
──────────────
📊 Today: 1.2K requests
💰 Saved: $8.90
──────────────
⚡ Quick Actions
   ▸ Pause Proxy
   ▸ Reload Config
   ▸ View Logs
──────────────
🔧 Detected Agents (4)
   ✅ Claude Desktop
   ✅ Claude CLI
   ✅ VS Code
   ⚠️  Cursor (not configured)
──────────────
Open Dashboard
Settings
──────────────
Quit router.plus VPN
```

### 10.5 Configuration File Structure

**User data directory:**

- macOS: `~/Library/Application Support/router-plus-vpn/`
- Windows: `%APPDATA%/router-plus-vpn/`
- Linux: `~/.config/router-plus-vpn/`

**Files:**

1. **`config.json`** – Main application state

```json
{
  "version": "1.0.0",
  "apiKey": "sk-rp_xxx",
  "proxyPort": 41100,
  "autoStart": true,
  "showInTray": true,
  "logLevel": "info",
  "lastSync": "2026-07-31T10:05:00Z"
}
```

2. **`agents.json`** – Detected agents and their config status

```json
{
  "claude_desktop": {
    "detected": true,
    "enabled": true,
    "configPath": "/Users/user/Library/Application Support/Claude-3p/configLibrary/openclaude.json",
    "lastConfigured": "2026-07-31T09:00:00Z",
    "backupPath": "/Users/user/Library/Application Support/router-plus-vpn/backups/claude-desktop-backup-2026-07-31.json"
  },
  "claude_cli": {
    "detected": true,
    "enabled": true,
    "configPath": "/Users/user/.claude/settings.json",
    "lastConfigured": "2026-07-31T09:00:00Z"
  },
  "vscode_continue": {
    "detected": true,
    "enabled": true,
    "configPath": "/Users/user/Library/Application Support/Code/User/settings.json"
  }
}
```

3. **`proxy-log.jsonl`** – Request log (JSONL format, rotated daily)

```jsonl
{"ts":"2026-07-31T10:05:23Z","agent":"claude_desktop","model":"claude-sonnet-4","status":200,"ms":1234,"tokens_in":1234,"tokens_out":567,"cost":0.02}
{"ts":"2026-07-31T10:05:18Z","agent":"vscode","model":"gpt-4o","status":200,"ms":876,"tokens_in":2000,"tokens_out":300,"cost":0.015}
```

4. **`profiles/`** – Saved configuration profiles (future feature)

```
profiles/
├── default.json
├── work-anthropic-only.json
└── personal-openai-fallback.json
```

### 10.6 Protocol Translation Details

**Anthropic → OpenAI Format**

When a tool using OpenAI format calls the proxy:

```javascript
// Incoming (OpenAI format)
{
  "model": "gpt-4o",
  "messages": [
    {"role": "system", "content": "You are helpful"},
    {"role": "user", "content": "Hello"}
  ]
}

// Transformed to Anthropic format → router.plus
{
  "model": "gpt-4o",  // preserved, router.plus handles routing
  "system": "You are helpful",
  "messages": [
    {"role": "user", "content": [{"type": "text", "text": "Hello"}]}
  ]
}

// Response from router.plus (Anthropic format)
{
  "id": "msg_xxx",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "Hi there!"}],
  "model": "gpt-4o",
  "usage": {"input_tokens": 12, "output_tokens": 5}
}

// Translated back to OpenAI format → client
{
  "id": "chatcmpl_xxx",
  "object": "chat.completion",
  "model": "gpt-4o",
  "choices": [{
    "index": 0,
    "message": {"role": "assistant", "content": "Hi there!"},
    "finish_reason": "stop"
  }],
  "usage": {"prompt_tokens": 12, "completion_tokens": 5}
}
```

**Model Name Routing**

Claude Desktop validates model names must contain "claude" or "anthropic". Workaround:

1. **Display routing:** Insert zero-width spaces (`​`) between characters
   - Input: `gpt-4o`
   - Display in picker: `g​p​t​-​4​o (claude)`
   - User sees: `gpt-4o (claude)` (spaces invisible)

2. **Request routing:** Extract real model name on proxy receive
   - Parse out ZWSP characters and `(claude)` suffix
   - Forward original model name to router.plus: `gpt-4o`

### 10.7 Security & Privacy

**API Key Storage:**

- Encrypted using Electron `safeStorage` (OS keychain)
- macOS: Keychain Access
- Windows: DPAPI (Data Protection API)
- Linux: libsecret

**Network Security:**

- Proxy binds to `127.0.0.1` only (not reachable from network)
- HTTPS verification enabled by default
- Certificate pinning for router.plus domain (optional)
- No telemetry or analytics sent anywhere

**Backup Safety:**

- Timestamped backups before every config write
- Backup retention: Last 10 backups per agent
- Backups stored in user data directory (never uploaded)

**Reset Protection:**

- "Reset All" requires confirmation dialog
- Reset only removes router.plus-managed keys
- User's other settings preserved
- Pre-reset backup always created

### 10.8 Installation & Distribution

**Packaging:**

- **macOS:** DMG with code-signed app bundle (Apple Developer ID)
  - Universal binary (x86_64 + arm64)
  - Gatekeeper-compatible notarization
  - Auto-updater via Electron updater

- **Windows:** NSIS installer (EXE)
  - x64 + x86 builds
  - SmartScreen signed (EV code signing cert)
  - Start menu + desktop shortcuts
  - Uninstaller preserves user data (optional wipe)

- **Linux:** AppImage + Debian package
  - AppImage: Universal, no dependencies
  - DEB: For Ubuntu/Debian apt repositories
  - Auto-detect desktop environment for tray icon

**Download channels:**

- Official: `https://router.plus/download/vpn`
- GitHub Releases: `github.com/routerplus/vpn/releases`
- Homebrew (macOS): `brew install --cask router-plus-vpn`
- Chocolatey (Windows): `choco install router-plus-vpn`

**Auto-updater:**

- Check for updates on startup
- Notify in tray: "Update available – Click to install"
- Background download, install on quit
- Rollback mechanism if update fails

### 10.9 First-Run Experience

**Step 1: Welcome Screen**

```
Welcome to router.plus VPN!

Route all your AI coding tools through one account.

✨ What you'll get:
   • One API key for all tools
   • Centralized cost tracking
   • Automatic failover
   • Usage analytics

[Get Started]  [I already have an account]
```

**Step 2: Authentication**

```
Sign in to router.plus

[Sign in with Google]
[Sign in with GitHub]
[Sign in with Telegram]

Don't have an account? [Sign up on router.plus]
```

**Step 3: Agent Detection**

```
Scanning for coding agents...

✅ Found Claude Desktop
✅ Found Claude CLI
✅ Found VS Code (Continue extension)
⚪ Cursor not found

Configure detected agents now?

[Yes, configure all]  [Skip, I'll do it later]
```

**Step 4: Configuration Applied**

```
✅ Configuration Complete!

Configured agents:
• Claude Desktop → router.plus
• Claude CLI → router.plus
• VS Code (Continue) → router.plus

Your 24-hour free trial is now active.

[Open Dashboard]  [Start Coding]
```

### 10.10 Development Roadmap

**V1.0 (Launch) – Core VPN Functionality**

- Local proxy server (port 41100)
- Anthropic ↔ OpenAI protocol translation
- Auto-detect + configure: Claude Desktop, Claude CLI
- Manual config assist: VS Code, Cursor
- System tray integration
- Request logging
- Basic usage dashboard

**V1.1 – Extended Agent Support**

- Auto-configure: VS Code (Continue, Cline, Roo-Cline, Kiro)
- Auto-configure: Cursor, Windsurf
- Profile system (save/load/switch configs)
- Export config for manual setup

**V1.2 – Team Features**

- Shared team API keys
- Usage quotas per developer
- Admin dashboard integration
- Cost allocation reports

**V1.3 – Advanced Routing**

- Per-agent routing rules (Claude Desktop → only Anthropic, VS Code → any)
- Model fallback chains
- Request retry configuration
- Circuit breaker status in UI

**V2.0 – Multi-Account & Sync**

- Multiple router.plus accounts in one app
- Profile sync across devices
- Remote config management via web dashboard
- Team deployment via MDM

### 10.11 Technical Implementation Notes

**Proxy Server (Node.js http.createServer)**

```javascript
const server = http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks).toString();
    const json = JSON.parse(body);

    // Extract original auth
    const originalAuth = req.headers["authorization"];

    // Replace with router.plus API key
    const headers = {
      ...req.headers,
      authorization: `Bearer ${routerPlusApiKey}`,
      "x-original-agent": detectAgent(req),
      "x-proxy-version": APP_VERSION,
    };

    // Forward to router.plus
    const upstream = https.request(
      {
        hostname: "router.plus",
        port: 443,
        path: req.url,
        method: req.method,
        headers,
      },
      (upstreamRes) => {
        // Pipe response back
        res.writeHead(upstreamRes.statusCode, upstreamRes.headers);
        upstreamRes.pipe(res);
      }
    );

    upstream.write(body);
    upstream.end();
  });
});

server.listen(41100, "127.0.0.1");
```

**Agent Detection (Filesystem Scanning)**

```javascript
function detectAgents() {
  const agents = {};

  // Claude Desktop
  const claudeDesktopPath = path.join(os.homedir(), "Library/Application Support/Claude");
  if (fs.existsSync(claudeDesktopPath)) {
    agents.claude_desktop = {
      detected: true,
      path: claudeDesktopPath,
      configPath: path.join(claudeDesktopPath + "-3p", "configLibrary"),
    };
  }

  // Claude CLI
  const claudeCliPath = path.join(os.homedir(), ".claude/settings.json");
  if (fs.existsSync(claudeCliPath)) {
    agents.claude_cli = {
      detected: true,
      path: claudeCliPath,
    };
  }

  // VS Code
  const vscodeSettingsPath = path.join(
    os.homedir(),
    "Library/Application Support/Code/User/settings.json"
  );
  if (fs.existsSync(vscodeSettingsPath)) {
    agents.vscode = {
      detected: true,
      path: vscodeSettingsPath,
    };
  }

  return agents;
}
```

**Config Writer (Atomic with Backup)**

```javascript
function writeAgentConfig(agent, config) {
  const configPath = agent.configPath;

  // Create timestamped backup
  if (fs.existsSync(configPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = `${configPath}.routerplus-backup-${timestamp}`;
    fs.copyFileSync(configPath, backupPath);
  }

  // Write new config atomically
  const tempPath = `${configPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(config, null, 2) + "\n");
  fs.renameSync(tempPath, configPath);

  return { success: true, backupCreated: true };
}
```

---

## 11. Integration Points

### 11.1 Desktop VPN ↔ Web Platform

**Authentication flow:**

1. User opens desktop app for first time
2. App opens browser to `https://router.plus/auth/desktop?nonce=xxx`
3. User signs in via OAuth (if not already)
4. Web platform generates device-specific API key
5. Redirects to `routerplus://callback?key=sk-rp_xxx&user_id=xxx`
6. Desktop app catches deep link, stores encrypted key
7. Connection established

**API endpoints used by desktop app:**

- `GET /api/v1/user/profile` – Fetch user details, subscription status
- `GET /api/v1/user/usage` – Today's usage stats for dashboard
- `POST /api/v1/proxy/log` – Upload request logs (optional, for analytics)
- `GET /api/v1/agents/detected` – Sync agent configuration state
- `GET /api/v1/health` – Platform health check

**Request headers from desktop proxy:**

```
Authorization: Bearer sk-rp_xxx
X-Proxy-Version: 1.0.0
X-Original-Agent: claude_desktop
X-Original-Model: claude-sonnet-4
X-Device-ID: <uuid>
```

**Response headers to desktop:**

```
X-Router-Combo: combo-anthropic-primary
X-Provider-Used: anthropic-direct
X-Fallback-Depth: 0
X-Request-Id: req_xxx
X-Cost-USD: 0.02
```

### 11.2 Telegram Bot ↔ Desktop VPN

**Deep linking for setup:**

```
User in Telegram bot:
1. Bot sends: "Configure desktop app? [Open Setup]"
2. Button opens: routerplus://setup?bot_token=<telegram_bot_token>
3. Desktop app catches link, auto-fills API key from active session
4. User clicks "Authorize"
5. Bot receives webhook: Desktop connected
6. Bot confirms: "✅ Desktop app linked to your account"
```

**Shared usage tracking:**

- Desktop requests appear in Telegram bot `/stats` command
- Bot shows: "💻 Desktop: 234 requests | 📱 Bot: 123 requests"

### 11.3 Web Dashboard ↔ Desktop VPN

**Real-time sync:**

- Web dashboard shows connected devices: "Desktop VPN (macOS) – Active 5m ago"
- Clicking device opens detail panel:
  - Last active timestamp
  - Configured agents (4/9)
  - Today's usage from this device
  - [Revoke Access] button

**Remote configuration:**

- Admin panel: "Desktop VPN Settings"
  - Force-push new routing rules
  - Disable specific models
  - Set per-device rate limits
  - Trigger config refresh (desktop polls every 60s)

**Activity feed:**

- Web dashboard shows: "Desktop VPN routed 12 requests via combo-fast (last 5m)"
- Clicking opens request log with same detail as desktop proxy log

### 11.4 OpenAI-Compatible API ↔ All Components

**Universal endpoint:** `https://router.plus/v1/chat/completions`

**Authentication:**

- Header: `Authorization: Bearer sk-rp_xxx`
- API key works across: Web API, Desktop proxy, Telegram bot, Direct HTTP calls

**Request format (OpenAI-compatible):**

```json
{
  "model": "claude-sonnet-4",
  "messages": [{ "role": "user", "content": "Hello" }],
  "stream": true
}
```

**Response format:**

```json
{
  "id": "chatcmpl_xxx",
  "object": "chat.completion",
  "model": "claude-sonnet-4",
  "choices": [
    {
      "index": 0,
      "message": { "role": "assistant", "content": "Hi!" },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 3,
    "total_tokens": 13
  },
  "x_router_metadata": {
    "provider": "anthropic-direct",
    "combo": "combo-1",
    "cost_usd": 0.001,
    "latency_ms": 234
  }
}
```

### 11.5 Third-Party Integrations

**Supported via OpenAI-compatible endpoint:**

1. **LangChain**

```python
from langchain.chat_models import ChatOpenAI

llm = ChatOpenAI(
    base_url="https://router.plus/v1",
    api_key="sk-rp_xxx",
    model="claude-sonnet-4"
)
```

2. **LlamaIndex**

```python
from llama_index.llms import OpenAI

llm = OpenAI(
    api_base="https://router.plus/v1",
    api_key="sk-rp_xxx",
    model="gpt-4o"
)
```

3. **OpenAI SDK (Direct)**

```python
import openai

client = openai.OpenAI(
    base_url="https://router.plus/v1",
    api_key="sk-rp_xxx"
)

response = client.chat.completions.create(
    model="claude-sonnet-4",
    messages=[{"role": "user", "content": "Hello"}]
)
```

4. **Anthropic SDK (via Desktop Proxy)**

```python
import anthropic

# Set environment variable: ANTHROPIC_BASE_URL=http://127.0.0.1:41100

client = anthropic.Anthropic()
message = client.messages.create(
    model="claude-sonnet-4",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello"}]
)
```

### 11.6 Webhook Events

**Outbound webhooks (optional feature):**

Users can configure webhook URLs in web dashboard to receive events:

**Event: `request.completed`**

```json
{
  "event": "request.completed",
  "timestamp": "2026-07-31T10:05:23Z",
  "user_id": "user_xxx",
  "request_id": "req_xxx",
  "model": "claude-sonnet-4",
  "provider": "anthropic-direct",
  "tokens": {
    "input": 1234,
    "output": 567
  },
  "cost_usd": 0.02,
  "latency_ms": 1234,
  "source": "desktop_vpn",
  "agent": "claude_desktop"
}
```

**Event: `subscription.expiring`**

```json
{
  "event": "subscription.expiring",
  "timestamp": "2026-07-24T00:00:00Z",
  "user_id": "user_xxx",
  "expires_at": "2026-07-31T23:59:59Z",
  "days_remaining": 7,
  "tier": "vibe"
}
```

**Event: `fraud.detected`**

```json
{
  "event": "fraud.detected",
  "timestamp": "2026-07-31T10:05:23Z",
  "user_id": "user_xxx",
  "check_type": "vpn_detection",
  "score": 75,
  "requires_review": true,
  "details": {
    "ip": "1.2.3.4",
    "country": "XX",
    "vpn_provider": "detected"
  }
}
```

---

## 12. Deployment & Infrastructure
