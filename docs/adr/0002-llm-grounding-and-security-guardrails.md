# ADR 0002: LLM Numerical Grounding Verification & Prompt Security Guardrails

## Status
Accepted

## Context
Deploying Generative AI in disaster command centers introduces severe risks of prompt injection (LLM01), ungrounded hallucinations (LLM09), and sensitive data leakage. Duty officers making life-safety decisions cannot rely on unverified numerical claims.

## Decision
1. Isolate user input with explicit prompt boundary markers (`<untrusted_user_query>`) and system constraints.
2. Restrict LLM tools strictly to read-only query interfaces; models cannot execute dispatch or data alteration tools.
3. Pass all generated text through a deterministic `verifyNumericalGrounding` filter that cross-checks extracted wind speeds, central pressures, and surge depths against live computed physics. Claims exceeding physical thresholds are flagged.
4. Redact PII (phone numbers, email addresses, API secrets) before streaming responses to clients.
5. Provide a deterministic offline reasoning engine when the external AI model is unreachable.

## Consequences
- **Positive:** Eliminates prompt injection overrides and prevents mathematical hallucinations in disaster advisories.
- **Trade-offs:** Regular expression parsing overhead on output text (~1–3 ms).
