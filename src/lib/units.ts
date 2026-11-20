import type { UnitSystem } from '@/lib/types';

const KG_PER_LB = 0.45359237;
const CM_PER_IN = 2.54;

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function weightUnit(units: UnitSystem): 'kg' | 'lb' {
  return units === 'imperial' ? 'lb' : 'kg';
}

export function lengthUnit(units: UnitSystem): 'cm' | 'in' {
  return units === 'imperial' ? 'in' : 'cm';
}

/** Stored kg → display value. */
export function toDisplayWeight(kg: number, units: UnitSystem): number {
  return round1(units === 'imperial' ? kg / KG_PER_LB : kg);
}

/** Display value → stored kg. */
export function fromDisplayWeight(value: number, units: UnitSystem): number {
  return units === 'imperial' ? value * KG_PER_LB : value;
}

/** Stored cm → display value. */
export function toDisplayLength(cm: number, units: UnitSystem): number {
  return round1(units === 'imperial' ? cm / CM_PER_IN : cm);
}

/** Display value → stored cm. */
export function fromDisplayLength(value: number, units: UnitSystem): number {
  return units === 'imperial' ? value * CM_PER_IN : value;
}
