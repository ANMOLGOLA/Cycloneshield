# ADR 0001: Cryptographic CAP Alert Digital Signing & Append-Only Hash Chain

## Status
Accepted

## Context
In early warning systems for natural hazards (cyclones, storm surge, flooding), life safety depends on the authenticity and integrity of Common Alerting Protocol (CAP 1.2) emergency broadcasts. Malicious injection, tampering, or post-hoc repudiation of evacuation orders poses catastrophic risk. The baseline repository stored volatile dispatches in memory with non-verifiable SHA-256 strings.

## Decision
1. Implement canonical content hashing (`computeAlertContentHash`) binding headline, instructions, district ID, peak wind speed, and peak surge depth.
2. Enforce a cryptographic digital signature (HMAC-SHA256 / Ed25519) on all CAP 1.2 XML outputs.
3. Enforce a Two-Person ("Four-Eyes") authorization rule for high-consequence evacuation orders: requires distinct tokens from the Primary Duty Officer and the Relief Commissioner.
4. Record all state-altering events in an append-only cryptographic hash chain (`CryptoAuditChain`), where each record verifies `prevHash`, `payloadHash`, and HMAC signature.

## Consequences
- **Positive:** Guarantees non-repudiation, tamper detection, and multi-officer sign-off for evacuation alerts.
- **Trade-offs:** Additional token verification computation (< 1 ms overhead).
