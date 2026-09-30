# CycloneShield Operations & On-Call Runbook

**Service:** CycloneShield Bay of Bengal Decision-Support System  
**Classification:** Tier-1 Life-Safety Critical Platform  
**Target Availability SLO:** 99.95% (Emergency Alert Path), 99.90% (Portal & Simulation Engine)  

---

## 1. Fast Incident Triage Checklist

When an active cyclonic storm enters the $T-72\text{h}$ operational cone in the Bay of Bengal:

1. **Verify Audit Chain Integrity:**
   - Run `GET /api/health` and verify `auditChain.integrityValid === true`.
   - If corrupted, inspect `GET /api/audit/logs` to identify any broken hash link.
2. **Pre-Warm Cache & Scale Workers:**
   - Execute baseline simulation runs for top coastal districts (Puri, Ganjam, Jagatsinghpur, Khordha).
   - Ensure redis / in-memory cache is primed with $P50$ and $P90$ surge lookups.
3. **Verify Upstream Telemetry Feeds:**
   - Confirm IMD RSMC New Delhi bulletin stream is $< 30\text{ min}$ old.
   - Check INCOIS Buoy BD-11 and NIOT tide gauge latency.

---

## 2. Four-Eyes Evacuation Dispatch Emergency Protocol

For any **MANDATORY EVACUATION ORDER** broadcast:
1. Primary Duty Meteorologist drafts advisory in `AdvisoryApprovalModal`.
2. Inspect canonical SHA-256 content hash.
3. Second-in-command / State Relief Commissioner verifies coordinates and signs secondary approval token.
4. Cryptographically signed XML (`/api/dispatch/send`) is broadcast to SMS gateways, WhatsApp Business, and civil siren relays.
5. Record hash is anchored in the append-only audit log.

---

## 3. Degradation Ladder (Disaster Continuity)

| Level | Condition | Operational Mode | User Experience |
|:---:|:---|:---|:---|
| **Mode 1** | Normal operations, external AI online | **Full Cloud AI Mode** | Real-time Gemini 2.5/3.8 Flash natural language reasoning, dynamic tool calling. |
| **Mode 2** | AI upstream rate limited or network degraded | **Local Geo-Core Fallback** | Instant deterministic physics reasoning, rule-based citations, $< 5\text{ ms}$ response. |
| **Mode 3** | Severe power / backhaul connectivity outage | **Offline PWA / SMS Gateway** | Stale-while-revalidate cached risk maps, SMS shortcode feeds, static SOP playbooks. |

---

## 4. Emergency Contacts & Escalation Matrix

- **NDMA National Emergency Operations Center (NEOC):** 1070 / ops-center@ndma.gov.in
- **OSDMA State Control Room (Bhubaneswar):** 1077 / relief-odisha@gov.in
- **CycloneShield Lead SRE / On-Call Pager:** oncall-sre@cycloneshield.internal
