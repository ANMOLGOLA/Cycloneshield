/**
 * Holland (1980) Parametric Wind Field Profile
 * V(r) = sqrt( (B / rho_a) * (Rmax / r)^B * (Pn - Pc) * 100 * exp(-(Rmax / r)^B) + (r * f / 2)^2 ) - (r * f / 2)
 */

import { HollandParameters } from '../types/cyclone';

const OMEGA = 7.2921159e-5; // Earth angular velocity rad/s

export function calculateCoriolisParameter(latitudeDeg: number): number {
  const phi = (latitudeDeg * Math.PI) / 180;
  return 2 * OMEGA * Math.sin(phi);
}

export function calculateHollandWindSpeedKt(
  rKm: number,
  params: HollandParameters,
  latitudeDeg: number = 19.5,
  azimuthDeg: number = 90
): number {
  if (rKm <= 0.1) return 0;

  const rMeters = rKm * 1000;
  const RmaxMeters = params.RmaxKm * 1000;
  const deltaP_Pascals = (params.Pn - params.Pc) * 100; // hPa to Pa
  const f = calculateCoriolisParameter(latitudeDeg);
  const B = params.B;
  const rho_a = params.rho_a || 1.15; // kg/m^3

  const ratio = RmaxMeters / rMeters;
  const ratioPowerB = Math.pow(ratio, B);
  const expTerm = Math.exp(-ratioPowerB);

  const term1 = (B / rho_a) * ratioPowerB * deltaP_Pascals * expTerm;
  const coriolisTerm = (rMeters * f) / 2;
  const radical = term1 + Math.pow(coriolisTerm, 2);

  if (radical < 0) return 0;

  let v_gradient_ms = Math.sqrt(radical) - coriolisTerm;

  // Add asymmetric forward motion component (translation speed vector)
  // Wind is stronger on the right side of the storm track in the Northern Hemisphere
  const relAngle = ((azimuthDeg - params.translationDirectionDeg) * Math.PI) / 180;
  const translation_ms = (params.translationSpeedKt * 0.514444) * 0.5 * (1 + Math.cos(relAngle));
  
  // Surface reduction factor (standard 0.85 from gradient to 10m 10-minute sustained)
  const v_surface_ms = (v_gradient_ms * 0.85) + translation_ms;

  // Convert m/s to Knots (1 m/s = 1.94384 kt)
  return Math.max(0, Math.round(v_surface_ms * 1.94384));
}

export function computeHollandIsotachs(params: HollandParameters, latitudeDeg: number = 19.5) {
  // Generate curve from r = 1 km to 250 km
  const profile: { rKm: number; windKt: number }[] = [];
  let r34kt = 0;
  let r50kt = 0;
  let r64kt = 0;

  for (let r = 2; r <= 300; r += 2) {
    const wind = calculateHollandWindSpeedKt(r, params, latitudeDeg, 90);
    profile.push({ rKm: r, windKt: wind });

    if (wind >= 64) r64kt = r;
    if (wind >= 50) r50kt = r;
    if (wind >= 34) r34kt = r;
  }

  const vMax = calculateHollandWindSpeedKt(params.RmaxKm, params, latitudeDeg, 90);

  return {
    profile,
    vMaxKt: vMax,
    rMaxKm: params.RmaxKm,
    r64ktKm: r64kt,
    r50ktKm: r50kt,
    r34ktKm: r34kt,
  };
}
