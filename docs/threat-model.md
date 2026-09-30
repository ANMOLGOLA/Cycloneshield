# CycloneShield Threat Model
**System:** CycloneShield Emergency Decision-Support & Early Warning Platform  
**Methodology:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) + Attack Trees + OWASP LLM Top 10  
**Target Security Assurance Level:** OWASP ASVS Level 2 / High-Consequence Life Safety  
**Version:** 1.0.0 (Baseline)  
**Date:** 2026-09-30  

---

## 1. System Context & Asset Valuation

| Asset Class | Assets in Scope | Impact of Compromise | Target Security Objective |
|:---|:---|:---|:---|
| **Class A (Life-Safety Critical)** | CAP Emergency Bulletins, Evacuation Orders, Siren Triggers | **Catastrophic:** Loss of life due to suppressed evacuation or mass panic from forged evacuation orders. | Strict Cryptographic Integrity, Non-repudiation, Dual-Authorization (Four-Eyes). |
| **Class B (Financial / Contractual)** | Parametric Insurance Triggers, Loss Estimates, Treasury Disbursement Feeds | **Severe:** Multi-million dollar unauthorized treasury payouts or wrongful claim denial. | Oracle Feed Authenticity, Append-only Auditability, Idempotency. |
| **Class C (Operational Intelligence)** | Holland Wind Grids, Bathymetric DEM Inundation Depth, Cascading Infrastructure Graphs | **High:** Misallocation of NDRF rescue boats, ambulances, and mobile generators. | Grounding Verification, Physical Plausibility Checks, Input Sanitization. |
| **Class D (PII / Sensitive Contacts)** | Duty Officer IDs, Evacuation Contact Lists, Shelter Occupancy Records | **Moderate:** Privacy breach under India DPDP Act 2023 & GDPR. | Field-Level Encryption, Least Privilege, Role-Based Access. |

---

## 2. STRIDE Analysis Matrix

| STRIDE Category | Threat Description | Attack Vector | Severity | Existing Defense | Target Hardening (Plan) |
|:---|:---|:---|:---:|:---|:---|
| **Spoofing** | Adversary injects fake CAP 1.2 evacuation alert claiming to originate from State Relief Commissioner. | Unauthenticated `POST /api/dispatch/send` with forged payload. | **CRITICAL** | None (In-memory mock). | OIDC/JWT auth, Ed25519 digital signing, public key PKI distribution. |
| **Tampering** | Malicious actor modifies surge depth thresholds or wind speeds in transit or database. | MITM on API traffic or database row mutation. | **HIGH** | Plain HTTPS (in prod). | TLS 1.3 only, HSTS preload, SHA-256 Merkle hash chain for all state transitions. |
| **Repudiation** | Duty Officer denies authorizing an erroneous mass evacuation order. | Forged or ambiguous approval timestamps. | **HIGH** | Simple SHA-256 string hash. | Cryptographic signature bound to duty officer identity, hardware token, and exact payload hash. |
| **Information Disclosure** | Unauthorized extraction of vulnerable population lists and critical grid topology. | Unrestricted API endpoints or LLM prompt leaking backend context. | **MEDIUM** | None. | RBAC/ABAC district scoping, PII redaction layer on LLM outputs. |
| **Denial of Service** | Upstream flood of scenario runs or Gemini API exhaustion during storm landfall window ($T-12\text{h}$). | HTTP flood / un-cached complex simulation triggers. | **CRITICAL** | None. | Token-bucket rate limiting, Redis caching, single-flight request coalescing, offline fallback. |
| **Elevation of Privilege** | District field operator elevates permissions to broadcast state-wide evacuation or trigger state treasury payouts. | Missing ABAC / RBAC checks on API routes. | **HIGH** | None. | Policy-based authorization (district-scoped tokens, admin-only insurance triggers). |

---

## 3. Attack Trees

### Attack Tree 1: Forging or Manipulating a Public Evacuation Advisory
```
Forged Public Evacuation Advisory
├── 1. Direct API Injection (No Authentication)
│   ├── Send malformed POST to /api/dispatch/send [HIGH RISK - CURRENT]
│   └── Bypass front-end UI and submit rogue CAP XML directly
├── 2. LLM Prompt Injection via Advisory Generation
│   ├── Inject adversarial instructions via district name / custom context
│   └── Force Gemini model to output panic-inducing fake orders
└── 3. Compromise of Duty Officer Credentials
    ├── Phish duty officer single-factor credentials
    └── Execute unauthorized broadcast without dual approval (Four-Eyes)
```

### Attack Tree 2: Tampering with Parametric Insurance Payout Trigger
```
Parametric Insurance Fraud
├── 1. Oracle Data Poisoning
│   ├── Spoof IMD AWS anemometer wind telemetry (> 135 kt)
│   └── Send corrupted tide gauge elevation to /api/insurance/claim
└── 2. Replay & Double-Spending Attacks
    ├── Replay valid historical storm event payload (Fani)
    └── Submit duplicate claims without unique cryptographic nonces
```

---

## 4. LLM Threat Analysis (OWASP Top 10 for LLM)

1. **LLM01 - Prompt Injection:** User input passed to `/api/gemini/chat` and `/api/gemini/advisory` is isolated using strict XML tagging `<untrusted_user_input>` and explicit system prompt boundary constraints.
2. **LLM02 - Insecure Output Handling:** AI text outputs pass through a structural parser and numerical claim validator before rendering.
3. **LLM06 - Excessive Agency:** AI model tools are strictly `read-only` query functions. The LLM has zero capability to trigger dispatch or modify records.
4. **LLM09 - Misinformation / Hallucination:** A deterministic grounding verifier checks generated numbers against live physics calculations (e.g. Holland wind speed and GLO-30 surge).

---

## 5. Security Architecture Target State

- **Authentication & RBAC:** OIDC with PKCE, JWT bearer tokens containing `roles: ['duty_officer', 'state_admin', 'viewer']` and `district_scope: ['puri', 'ganjam']`.
- **Digital Signing:** CAP 1.2 XML signed with Ed25519 / W3C XML-DSig.
- **Audit Persistence:** Merkle tree / hash-chained append-only log storing `(record_id, prev_hash, current_hash, signature)`.
- **Input Validation:** Zod schemas on every endpoint with strict bounds checking.
- **Two-Person Rule (Four-Eyes):** High-severity evacuation dispatches require two distinct cryptographic authorization tokens.
