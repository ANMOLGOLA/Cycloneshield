/**
 * Shared Type-Safe Units & Physical Dimensions Library
 * Prevents mixing meters, feet, knots, km/h, hPa, Pascals, and UTC/IST timestamps.
 */

// Branded types for compile-time unit separation
export type Knots = number & { readonly __unit: 'knots' };
export type MetersPerSecond = number & { readonly __unit: 'm/s' };
export type KilometersPerHour = number & { readonly __unit: 'km/h' };
export type Hectopascals = number & { readonly __unit: 'hPa' };
export type Pascals = number & { readonly __unit: 'Pa' };
export type Meters = number & { readonly __unit: 'meters' };
export type Kilometers = number & { readonly __unit: 'km' };

export const Units = {
  // Speed conversions
  knotsToMs(kt: number): MetersPerSecond {
    return (kt * 0.514444444) as MetersPerSecond;
  },
  msToKnots(ms: number): Knots {
    return (ms * 1.943844492) as Knots;
  },
  knotsToKmh(kt: number): KilometersPerHour {
    return (kt * 1.852) as KilometersPerHour;
  },
  kmhToKnots(kmh: number): Knots {
    return (kmh / 1.852) as Knots;
  },

  // Pressure conversions
  hpaToPascals(hpa: number): Pascals {
    return (hpa * 100) as Pascals;
  },
  pascalsToHpa(pa: number): Hectopascals {
    return (pa / 100) as Hectopascals;
  },

  // Length conversions
  kmToMeters(km: number): Meters {
    return (km * 1000) as Meters;
  },
  metersToKm(m: number): Kilometers {
    return (m / 1000) as Kilometers;
  },

  // Timestamp formatting
  utcToIst(utcIsoString: string): string {
    const d = new Date(utcIsoString);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }) + ' IST';
  },

  // Inverse Barometer: 1.02 cm per 1 hPa deficit
  inverseBarometerMeters(ambientHpa: number, centralHpa: number): Meters {
    const deltaP = Math.max(0, ambientHpa - centralHpa);
    return (deltaP * 0.0102) as Meters;
  },
};
