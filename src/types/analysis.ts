export type ComponentType = 
  | 'lighting' 
  | 'socket' 
  | 'hvac' 
  | 'motor' 
  | 'appliance' 
  | 'emergency_exit' 
  | 'fire_alarm' 
  | 'data_outlet' 
  | 'telephone' 
  | 'tv_outlet' 
  | 'exhaust_fan' 
  | 'distribution_board' 
  | 'meter' 
  | 'other';

export interface ElectricalComponent {
  id: string;
  name: string;
  type: ComponentType;
  rating: number;
  quantity: number;
  totalLoad: number;
  unitPrice: number;
  totalPrice: number;
  symbol?: string;
}

export interface SymbolMatch {
  id: string;
  symbolImage?: string;
  name: string;
  count: number;
  unitPrice: number;
  totalPrice: number;
  rating: number;
  type: ComponentType;
}

export interface CalculationStep {
  step: number;
  title: string;
  description: string;
  value?: number | string;
  formula?: string;
}

export interface LoadCalculation {
  components: ElectricalComponent[];
  tcl: number;
  diversityFactor: number;
  md: number;
  redundancy: {
    n1: number;
    n2: number;
  };
  totalComponentCost: number;
}

export interface ComplianceCheck {
  standard: string;
  passed: boolean;
  notes: string;
}

export interface PowerRecommendation {
  type: 'grid' | 'solar' | 'battery' | 'generator';
  percentage: number;
  capacity: string;
  reasoning: string;
}

export interface UploadedFile {
  name: string;
  type: string;
  data: string;
}

export interface Analysis {
  id: string;
  fileName: string;
  fileType: string;
  fileData: string;
  legendFile?: UploadedFile;
  floorPlanFile?: UploadedFile;
  timestamp: number;
  buildingType: 'residential' | 'industrial' | 'commercial';
  calculationSteps: CalculationStep[];
  loadCalculation: LoadCalculation;
  complianceChecks: ComplianceCheck[];
  recommendations: PowerRecommendation[];
  summary: string;
  symbolMatches: SymbolMatch[];
}

export interface PaymentTransaction {
  reference: string;
  amount: number;
  email: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
}

// Pricing constants in Ghana Cedi (₵)
export const COMPONENT_PRICES: Record<ComponentType, number> = {
  lighting: 2325,
  socket: 47,
  hvac: 38750,
  motor: 12400,
  appliance: 9300,
  emergency_exit: 1550,
  fire_alarm: 775,
  data_outlet: 93,
  telephone: 62,
  tv_outlet: 78,
  exhaust_fan: 1163,
  distribution_board: 7750,
  meter: 3875,
  other: 500
};

export const COMPONENT_LABELS: Record<ComponentType, string> = {
  lighting: 'Light Fixture',
  socket: 'Socket Outlet',
  hvac: 'HVAC Unit',
  motor: 'Motor',
  appliance: 'Appliance',
  emergency_exit: 'Emergency Exit Light',
  fire_alarm: 'Fire Alarm',
  data_outlet: 'Data/Network Outlet',
  telephone: 'Telephone Outlet',
  tv_outlet: 'TV Outlet',
  exhaust_fan: 'Exhaust Fan',
  distribution_board: 'Distribution Board',
  meter: 'Electric Meter',
  other: 'Other Component'
};

export function getDefaultPrice(type: ComponentType): number {
  return COMPONENT_PRICES[type] || 500;
}

export function getComponentLabel(type: ComponentType): string {
  return COMPONENT_LABELS[type] || 'Unknown Component';
}
