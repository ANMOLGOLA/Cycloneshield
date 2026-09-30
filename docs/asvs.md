# OWASP ASVS Level 2 Verification Checklist
**System:** CycloneShield Emergency Decision-Support Forecaster  
**Standard:** OWASP Application Security Verification Standard (ASVS) 4.0.3 - Level 2 (Defense in Depth)  
**Target Level:** Level 2 (Recommended for sensitive critical infrastructure & life-safety applications)  
**Status:** Baseline Audited  

---

## Verification Matrix

| ASVS Chapter | Requirement Area | Status | Baseline Finding | Target Remediation |
|:---|:---|:---:|:---|:---|
| **V1: Architecture** | Threat modeling, secure design, component inventory | **IN PROGRESS** | Threat model created in `docs/threat-model.md`. SBOM needed. | Generate CycloneDX SBOM; enforce architectural boundaries. |
| **V2: Authentication** | Password security, MFA, credential storage | **NON-COMPLIANT** | No authentication on API endpoints. | Implement JWT/OIDC bearer authentication, MFA mock/integration, duty officer tokens. |
| **V3: Session Management** | Token expiration, revocation, cookie flags | **NON-COMPLIANT** | Stateless mock without sessions. | Short-lived JWTs (15 min) + secure refresh token rotation and revocation list. |
| **V4: Access Control** | Least privilege, RBAC, multi-tenancy isolation | **NON-COMPLIANT** | Open access to all routes. | Role-Based Access Control (RBAC) + District-level ABAC attributes. |
| **V5: Validation & Sanitization** | Input validation, parameter parsing, output encoding | **NON-COMPLIANT** | Unvalidated JSON body parsing. | Zod schema validation on all API inputs; strict length & type checks. |
| **V6: Cryptography** | Key management, digital signatures, algorithm selection | **PARTIAL** | SHA-256 string hashing without secret keys. | Ed25519 alert digital signatures, HMAC-SHA256 tamper-evident hash chaining. |
| **V7: Error Handling & Logging** | Secure logging, audit trail, no information leakage | **PARTIAL** | Unpersisted console logging & in-memory audit log. | Structured JSON logger (Pino), persistent hash-chained audit log, PII redaction. |
| **V8: Data Protection** | Data classification, at-rest & in-transit encryption | **PARTIAL** | Plaintext in-memory data structures. | Field-level encryption for sensitive contact lists, TLS 1.3 enforced. |
| **V9: Communication** | TLS configuration, certificate validation | **PLANNED** | HTTP in local dev. | Enforce TLS 1.3, HSTS Preload headers, mTLS between microservices. |
| **V10: Malicious Code** | Integrity verification, safe deserialization | **COMPLIANT** | No dangerous `eval` or unsafe deserialization in domain core. | Maintain strict zero-eval rule in build and runtime. |
| **V11: Business Logic** | Anti-replay, idempotency, rate limits | **PARTIAL** | Random UUID generated per dispatch without duplicate rejection. | Idempotency keys bound to request hash, rate limiting on all public routes. |
| **V12: File Upload** | File size caps, type sniffing, malware scanning | **N/A** | Currently no direct multi-part file upload endpoints. | If SAR/drone imagery upload is added, enforce type sniffing + size limit + EXIF stripping. |
| **V13: API & Web Service** | Content-Type enforcement, CORS, REST security | **PARTIAL** | Basic Express JSON middleware. | Explicit CORS allowlists, Helmet HTTP security headers, OpenAPI contracts. |
| **V14: Configuration** | Hardened build, dependency scanning, secret management | **IN PROGRESS** | Dependencies pinned; security linters being installed. | Automated `npm audit`, `pip-audit`, CodeQL, and gitleaks scans. |
| **V15: LLM Applications** | Prompt isolation, tool sandboxing, grounding check | **NON-COMPLIANT** | Direct prompt interpolation into Gemini SDK. | Defensive prompt delimiters, read-only tools, deterministic numerical grounding filter. |
