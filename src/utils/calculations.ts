import { ElectricalComponent } from '../types/analysis';

export function calculateTCL(components: ElectricalComponent[]): number {
  return components.reduce((sum, component) => sum + component.totalLoad, 0);
}

export function calculateMD(tcl: number, diversityFactor: number): number {
  return tcl * diversityFactor;
}

export function getDiversityFactor(buildingType: string): number {
  switch (buildingType) {
    case 'residential':
      return 0.7; // 0.6-0.8 range
    case 'commercial':
      return 0.8; // 0.7-0.9 range
    case 'industrial':
      return 0.6; // 0.5-0.7 range
    default:
      return 0.75;
  }
}

export function calculateRedundancy(md: number): { n1: number; n2: number } {
  return {
    n1: md * 1.2, // N+1 = 20% extra
    n2: md * 1.4  // N+2 = 40% extra
  };
}

export function formatLoad(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} MW`;
  }
  return `${value.toFixed(2)} kW`;
}

export function formatCurrency(amount: number, currency: string = 'GHS'): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
}
