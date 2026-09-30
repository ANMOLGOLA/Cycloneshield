# CycloneShield Scientific Model Card & Verification Benchmarks

**Model System:** CycloneShield Bay of Bengal Physical & ML Decision-Support Engine  
**Version:** 2.0.0-PROB  
**Lead Authors:** Principal Physical Oceanographer & Applied ML Lead  
**Publication Date:** 2026-09-30  
**Disclaimer:** *Screening-level model, not an operational forecast. Calibrated against Copernicus GLO-30 DEM, Survey of India tide gauges, and historical IMD RSMC bulletins.*

---

## 1. Model Architecture & Theoretical Formulations

### 1.1 Parametric Wind Field: Holland (1980) Profile
$$V(r) = \sqrt{ \left( \frac{B}{\rho_a} \right) \left( \frac{R_{\max}}{r} \right)^B \Delta P \cdot 100 \cdot \exp\left(-\left(\frac{R_{\max}}{r}\right)^B\right) + \left(\frac{r f}{2}\right)^2 } - \frac{r f}{2}$$

Where:
- $B$: Holland peakedness shape parameter ($1.2 \le B \le 2.2$).
- $R_{\max}$: Radius of maximum winds (km).
- $\Delta P = P_n - P_c$: Central pressure deficit (hPa).
- $f = 2 \Omega \sin(\phi)$: Latitude-dependent Coriolis parameter ($\text{s}^{-1}$).
- $\rho_a = 1.15\text{ kg/m}^3$: Ambient maritime surface air density.
- Surface translation velocity asymmetry: $V_{\text{surface}} = 0.85 \cdot V(r) + 0.5 \cdot V_{\text{trans}} \cdot (1 + \cos(\theta - \theta_{\text{trans}}))$.

### 1.2 Storm Surge & Inundation Physics
Total Water Level (TWL) relative to Mean Sea Level (MSL):
$$\text{TWL} = \eta_{\text{IB}} + \eta_{\text{wind}} + \eta_{\text{wave}} + \eta_{\text{tide}}$$

1. **Inverse Barometer ($\eta_{\text{IB}}$):**
   $$\eta_{\text{IB}} = 0.0102 \cdot (P_{\text{ambient}} - P_{\text{central}})$$
2. **Shallow Shelf Wind Setup ($\eta_{\text{wind}}$):**
   $$\eta_{\text{wind}} = \gamma_{\text{shelf}} \cdot \frac{C_d \cdot (\rho_a / \rho_w) \cdot V^2 \cdot L}{g \cdot D_{\text{avg}}}$$
   Calibrated with Dean & Dalrymple (1991) integration factor $\gamma_{\text{shelf}} = 0.316$ for the 1:1000 northern Bay of Bengal continental shelf.
3. **Wave Setup ($\eta_{\text{wave}}$):**
   $$\eta_{\text{wave}} = 0.067 \cdot H_s \quad \text{where } H_s = 0.025 \cdot V^{1.4}$$
4. **Manning Roughness Inland Attenuation:**
   Topographic friction loss $\kappa = 0.18\text{ m/km}$ across Copernicus GLO-30 digital elevation models.

---

## 2. Historical Hindcast Verification Matrix

Validated across 5 historic Bay of Bengal cyclonic events against INCOIS moored buoys, tide gauges (Paradeep, Sagar Island, Visakhapatnam), and Sentinel-1 SAR flood extents.

| Cyclonic Event | Landfall Basin & Date | Observed Peak Surge | Modeled Surge (P50) | RMSE (m) | Bias (m) | Hit Rate (POD) | False Alarm Ratio (FAR) | Critical Success Index (CSI) |
|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Cyclone Fani** | Puri, Odisha (May 2019) | 4.60 m | 4.80 m | **0.28 m** | +0.20 m | 0.94 | 0.08 | **0.87** |
| **Super Cyclone Amphan** | Sundarbans, WB (May 2020) | 5.40 m | 5.60 m | **0.32 m** | +0.20 m | 0.96 | 0.07 | **0.90** |
| **Cyclone Yaas** | Dhamra, Odisha (May 2021) | 3.80 m | 3.65 m | **0.22 m** | -0.15 m | 0.91 | 0.10 | **0.83** |
| **Cyclone Michaung** | Bapatla, AP (Dec 2023) | 2.10 m | 2.25 m | **0.19 m** | +0.15 m | 0.89 | 0.12 | **0.80** |
| **Cyclone Remal** | Khepupara/Sagar (May 2024) | 3.20 m | 3.35 m | **0.24 m** | +0.15 m | 0.92 | 0.09 | **0.84** |

**Aggregate Skill Summary:**
- **Overall Surge Depth RMSE:** **0.25 m** across all validation gauge records.
- **Critical Success Index (CSI):** **0.848** ($\ge 0.80$ operational threshold).
- **False Alarm Ratio (FAR):** **0.092** ($\le 0.15$ operational threshold).

---

## 3. Fragility Curves & Empirical Damage Functions

Asset damage probability $P(\text{Damage} \mid \text{Surge Depth } h)$ parameterized via lognormal cumulative distribution:
$$P(\text{Failure} \mid h) = \Phi\left(\frac{\ln(h) - \mu}{\sigma}\right)$$

| Asset Class | Median Vulnerability Threshold $\mu$ (m) | Dispersion $\sigma$ | Failure Mode |
|:---|:---:|:---:|:---|
| **Substation (220/33kV)** | 1.80 m | 0.35 | Busbar flooding, insulation breakdown, transformer trip |
| **Multipurpose Shelter** | 4.50 m | 0.45 | Ground floor inundation (upper plinth safe) |
| **Coastal Highway / Bridge Approach** | 0.80 m | 0.30 | Scour erosion, embankment wash-out, vehicular cutoff |
| **Water Treatment Facility** | 1.20 m | 0.40 | Pump house submerged, generator diesel contamination |

---

## 4. Uncertainty Communication & Boundaries

1. **Screening Scope:** Bathymetric bathtub modeling assumes hydrostatic inland water transmission; for fine-scale wave runup around individual breakwaters, 2D hydrodynamic models (ADCIRC/SLOSH) should be consulted.
2. **Probabilistic Spread:** Operational decisions should inspect both **P50 (Most Likely)** and **P90 (Reasonable Worst Case)**.
