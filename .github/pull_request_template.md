## CycloneShield Pull Request (Life-Safety Critical Standard)

### 1. Summary of Changes
- **Category**: `[ ] Physics/Geo` | `[ ] Security/Crypto` | `[ ] AI/Grounding` | `[ ] SRE/Performance` | `[ ] UI/Accessibility`
- **Description**: Provide a concise summary of the architectural rationale and implementation details.

### 2. Quality & Security Checklist (OWASP ASVS Level 2)
- [ ] `npm run lint` passes with 0 type errors and 0 warnings (`tsc --noEmit`).
- [ ] `npm test` passes with 100% green status across all test suites.
- [ ] Geo-core test line coverage maintained $\ge 95\%$.
- [ ] No hardcoded secrets or PII added.
- [ ] Cryptographic hash chain and Four-Eyes approval checks untouched or verified.
- [ ] Any physical unit conversions use branded types in `src/geo-core/units.ts`.

### 3. Architecture Decision Records & Docs
- [ ] Relevant ADR updated or created in `docs/adr/`.
- [ ] `docs/CHANGELOG.md` updated with semantic version bump.

### 4. Rollback Plan
- Describe the exact rollback procedure if regression is identified post-merge.
