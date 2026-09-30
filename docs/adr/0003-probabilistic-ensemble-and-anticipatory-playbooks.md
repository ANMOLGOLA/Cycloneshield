# ADR 0003: Probabilistic Ensemble Forecasting & Anticipatory Action Playbooks

## Status
Accepted

## Context
Deterministic cyclone forecasts create a false sense of certainty regarding landfall location, surge height, and wind swath. Operational emergency planning requires probabilistic spreads ("Most Likely" vs "Reasonable Worst Case") and structured action playbooks tied to countdown milestones ($T-72\text{h}$, $T-48\text{h}$, $T-24\text{h}$, Landfall).

## Decision
1. Implement a fast Monte Carlo ensemble generator perturbing central pressure ($\pm 10\text{ hPa}$), translation speed ($\pm 20\%$), track azimuth ($\pm 15^\circ$), and tide phase.
2. Provide interactive percentile views:
   - **P50 (Most Likely):** Baseline physical forecast.
   - **P90 (Reasonable Worst Case):** High-surge / high-wind scenario for conservative evacuation decisions.
   - **P10 (Conservative / Minimal):** Lower-bound impact threshold.
3. Implement Anticipatory Action Playbooks with trigger checklists, responsible roles, and countdown status.
4. Add Digital Twin What-If modeling (embankment height elevation $+1\text{m}$, substation hardening) and Resilience Investment Cost-Benefit ranking.

## Consequences
- **Positive:** Empowers district disaster authorities with actionable uncertainty bands and concrete readiness checklists.
- **Trade-offs:** Client-side compute scales with ensemble member count (optimized with vectorized loops).
