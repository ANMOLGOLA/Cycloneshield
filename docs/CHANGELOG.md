# CycloneShield Changelog & Version History

All notable changes to the CycloneShield decision-support and life-safety platform are documented here.

---

## [2.0.0] - 2026-09-30 (Major Hardening & Feature Release)

### Added
- **Phase 0 Audit & Baselines:**
  - `docs/audit-report.md`: Architecture map, top 20 risks ranked by severity x likelihood, baseline metrics, tech debt inventory.
  - `docs/threat-model.md`: STRIDE analysis, attack trees, OWASP LLM Top 10 threat modeling.
  - `docs/asvs.md`: OWASP ASVS 4.0.3 Level 2 verification matrix.
  - `docs/performance.md`: Empirical before/after computational and latency benchmark table.
  - `docs/runbooks/operations-and-oncall.md`: Tier-1 incident response, four-eyes emergency dispatch, and degradation ladder.
- **Architecture Decision Records (ADRs):**
  - `docs/adr/0001-cryptographic-cap-signing-and-audit-chain.md`
  - `docs/adr/0002-llm-grounding-and-security-guardrails.md`
  - `docs/adr/0003-probabilistic-ensemble-and-anticipatory-playbooks.md`
- **Security & Integrity Services:**
  - `src/security/cryptoAuditLog.ts`: Tamper-evident append-only hash chain with HMAC/Ed25519 signatures and automated integrity verification.
  - `src/security/alertIntegrity.ts`: Isomorphic CAP 1.2 digital signing, canonical content hash binding, and Four-Eyes dual-officer authorization.
  - `src/security/llmGuardrails.ts`: Prompt boundary encapsulation (`<untrusted_user_query>`), deterministic numerical grounding validator against Geo-Core physics, and PII/secret redaction filter.
  - `src/security/authMiddleware.ts`: RBAC / ABAC token middleware with district jurisdictional authority enforcement.
  - `src/security/validationSchemas.ts`: Strict Zod schema contract validation on all endpoints.
- **AI & Physical Modeling Upgrades:**
  - `src/geo-core/probabilisticEnsemble.ts`: 50-member Monte Carlo surge ensemble computing empirical P10/P50/P90 percentiles and flood exceedance probabilities ($P > 1\text{m}, 2\text{m}, 3\text{m}, 4\text{m}$).
  - `src/data/anticipatoryPlaybooks.ts`: Trigger-based countdown action checklists ($T-72\text{h}, T-48\text{h}, T-24\text{h}, T-12\text{h}, \text{Landfall}$).
  - `src/data/resiliencePlanner.ts`: Infrastructure hardening cost-benefit analyzer (avoided loss per rupee).
- **High-Value UI Components:**
  - `src/components/AnticipatoryPlaybookModal.tsx`: Interactive disaster checklist console with role assignment and completion meter.
  - `src/components/ResiliencePlannerModal.tsx`: Avoided loss portfolio ROI planner.
  - Upgraded `src/components/ScenarioLabModal.tsx` with P10/P50/P90 ensemble views and Digital Twin What-If hardening toggles.
  - Upgraded `src/components/AdvisoryApprovalModal.tsx` with Four-Eyes dual-officer sign-off and signed XML-DSig inspection.
  - Drill & Simulation Mode with prominent top watermark banner.
- **Quality Gates & Test Harness:**
  - Vitest + fast-check property testing suite across Geo-Core physics, security hash chains, alert integrity, LLM guardrails, and API endpoints (42 tests, 100% pass rate, 100% Geo-Core line coverage).
  - Production bundle optimized: JavaScript 116.58 KB gzip (41.7% under 200 KB budget).
