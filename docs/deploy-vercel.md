# CycloneShield Vercel Deployment Guide

## 1. Executive Summary & Architecture Split
CycloneShield is engineered for high-availability coastal disaster decision support across the Bay of Bengal. The architecture strictly separates **lightweight edge/serverless operations** from **heavy offline/numerical compute workloads**:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Vercel Edge Network                     │
                  │  - Global CDN & Edge Caching (BOM1 Mumbai)               │
                  │  - React 19 Frontend SPA / Next.js Routes               │
                  │  - Lightweight Serverless APIs (Auth, Read, CAP Feed)   │
                  │  - Vercel Cron (IMD Bulletin & Tide Polling)            │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
                    ┌─────────────────────────┴──────────────────────────┐
                    ▼                                                    ▼
   ┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
   │ Managed Data Layer              │                 │ Secured Numerical Compute Host  │
   │ - Neon / Supabase PostGIS (Pool)│                 │ (Cloud Run / Fly.io / Precalc)  │
   │ - Upstash Redis (Cache/Limiter) │                 │ - 50-Member Monte Carlo Ensemble│
   │ - Cloudflare R2 / Vercel Blob   │                 │ - High-res Bathymetry Bathtub   │
   │   (PMTiles & 30m COGs)          │                 │ - GEE Sentinel-1 SAR Processor  │
   └─────────────────────────────────┘                 └─────────────────────────────────┘
```

---

## 2. Pre-Deployment Readiness Checklist
Ensure all local quality gates pass prior to initiating deployment:

```bash
# 1. Environment & system diagnostics
npm run doctor

# 2. Strict static typecheck (0 errors)
npm run lint

# 3. Comprehensive unit & property test battery
npm test

# 4. Production bundle build
npm run build
```

---

## 3. Step-by-Step Vercel Deployment (< 15 Minutes)

### Step 1: Import Repository
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project** and select `ANMOLGOLA/Cycloneshield`.
3. Set **Framework Preset**: `Vite` (or `Next.js` for monorepo web app).
4. Set **Root Directory**: `./`.
5. Ensure Build Command is `npm run build` and Output Directory is `dist`.

### Step 2: Configure Region & Function Limits (`vercel.json`)
The repo includes a preconfigured [vercel.json](file:///c:/Users/praty/OneDrive/Desktop/Cycloneshield/vercel.json):
- **Region**: `bom1` (Mumbai, India) for lowest sub-30ms round-trip latency to Odisha, Andhra Pradesh, and West Bengal SEOCs.
- **Function maxDuration**: `30` seconds for standard APIs, `60` seconds for batch report generation.
- **Security Headers**: HSTS (`max-age=63072000; preload`), strict CSP, and `nosniff`.

### Step 3: Inject Environment Variables
Configure the following in **Project Settings > Environment Variables**:

| Variable Name | Environment | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | Production, Preview | `production` |
| `GEMINI_API_KEY` | Production, Preview | Google Gemini Generative AI Key for grounded reasoning |
| `GEMINI_MODEL` | Production, Preview | `gemini-2.5-flash` |
| `SESSION_SECRET` | Production, Preview | High-entropy random secret (min 32 chars) for HMAC audit logs |
| `DATABASE_URL` | Production, Preview | Pooled Neon/Supabase PostGIS connection string |
| `REDIS_URL` | Production, Preview | Upstash Redis connection string |
| `GEE_SERVICE_ACCOUNT_BASE64` | Production | Base64-encoded Earth Engine Service Account JSON |
| `VITE_MAP_STYLE_URL` | All (Public) | Vector tile style URL |

### Step 4: Deploy & Verify
Click **Deploy**. Build output will compile the Vite asset bundle with gzip compression (~116 KB) and deploy serverless functions to `bom1`.

---

## 4. Post-Deployment Verification & Smoke Tests
Once the production deployment finishes, execute the following smoke verification sequence:

1. **System Health Probe**:
   ```bash
   curl -s https://<your-vercel-domain>.vercel.app/api/health | jq .
   # Expected: {"status":"HEALTHY","version":"2.0.0",...}
   ```

2. **Readiness Probe**:
   ```bash
   curl -s https://<your-vercel-domain>.vercel.app/api/ready | jq .
   # Expected: {"ready":true,"status":"READY",...}
   ```

3. **Signed CAP 1.2 XML Feed**:
   ```bash
   curl -s https://<your-vercel-domain>.vercel.app/api/cap/feed.xml
   # Expected: Valid XML containing <Signature> and <ds:DigestValue>
   ```

4. **Replay Flow Validation**:
   - Open the web application.
   - Verify zero console errors in Developer Tools.
   - Switch between historical cyclones (FANI 2019, AMPHAN 2020).
   - Test AI Reasoning panel and Digital Twin What-If scenario simulations.

---

## 5. Local Production Parity Mode

To replicate the Vercel serverless environment locally:

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Run local parity server
vercel dev

# 3. Optional: Run local Postgres/Redis stack via Docker Compose
docker run --name cycloneshield-redis -p 6379:6379 -d redis:7-alpine
```
