# Blameless Postmortem Incident Report

**Incident ID:** INC-YYYYMMDD-XX  
**Severity:** SEV-1 (Critical Life Safety) / SEV-2 (High) / SEV-3 (Moderate)  
**Date:** YYYY-MM-DD  
**Incident Commander:** [Name]  
**Lead SRE:** [Name]  
**Status:** DRAFT / FINAL  

---

## 1. Executive Summary
Brief non-technical overview of the outage, impact on early warnings, duration, and root cause.

## 2. Impact Analysis
- **SLO Error Budget Burn:** XX%
- **Users Impacted:** XX district authorities
- **Advisories Delayed / Dropped:** XX
- **Data Loss / Repudiation Risk:** NONE (Hash-chain verified)

## 3. Timeline (UTC / IST)
- `14:02 UTC`: Initial anomaly detected by synthetic health monitor.
- `14:05 UTC`: PagerDuty triggers SRE on-call.
- `14:12 UTC`: Mitigation applied (e.g., switched to Mode 2 local geocore fallback).
- `14:20 UTC`: Upstream service recovered and full AI mode restored.

## 4. Root Cause Analysis (5 Whys)
1. *Why did the dispatch fail?*
2. *Why was the upstream unreachable?*
3. *Why did the timeout trigger?*
4. *Why was cache empty?*
5. *Why was pre-warming skipped?*

## 5. Action Items & Lessons Learned
| Action Item | Type | Owner | Target Date |
|:---|:---|:---|:---|
| Add secondary redundant SMS gateway | Preventative | SRE Lead | 2026-10-15 |
| Increase pre-warm cache TTL from 2h to 6h | Mitigation | Core Dev | 2026-10-05 |
