
export enum OrderStatus {
  PLANNED = 'Planifié',
  IN_PROGRESS = 'En Cours',
  COMPLETED = 'Terminé',
  DELAYED = 'Retard'
}

export enum MachineStatus {
  RUNNING = 'En Marche',
  IDLE = 'En Attente',
  DOWN = 'En Panne',
  MAINTENANCE = 'Maintenance'
}

export interface ProductionOrder {
  id: string;
  productName: string;
  reference: string;
  quantityPlanned: number;
  quantityProduced: number;
  startDate: string; // ISO Date
  dueDate: string; // ISO Date
  status: OrderStatus;
  progress: number; // 0-100
  assignedMachineIds: string[]; // Updated: Multiple machines
  assignedOperatorIds: string[]; // Updated: Multiple operators
}

export interface MaintenanceLog {
  id: string;
  machineId: string;
  date: string;
  type: 'Preventive' | 'Corrective';
  description: string;
  technician: string;
}

export interface Machine {
  id: string;
  name: string;
  reference: string; // New
  type: string; // New
  function: string; // New
  capacity: string; // New (e.g., "500 units/h")
  purchaseCost: number; // New
  status: MachineStatus;
  efficiency: number; // OEE percentage
  operatingTime: number; // hours
  downtime: number; // hours
  lastMaintenance: string;
  nextMaintenance: string;
  maintenanceLog?: MaintenanceLog[];
}

export interface Operator {
  id: string;
  name: string;
  role: string;
  shift: 'Matin' | 'Après-midi' | 'Nuit';
  skills: string[];
  present: boolean;
  efficiency?: number; 
  salary: number; // New
}

export interface Material {
  id: string;
  name: string;
  stock: number;
  unit: string;
  minThreshold: number;
  dailyConsumption?: number;
  unitCost?: number;
}

export interface QualityReport {
  id: string;
  orderId: string;
  checkedQuantity: number;
  rejectedQuantity: number;
  defectReason?: string;
  date: string;
  inspector: string;
}

// Detailed Metrics Structure
export interface OEEData {
  global: number;
  availability: number;
  performance: number;
  quality: number;
  history: { date: string; value: number }[];
}

export interface MaintenanceKPIs {
  mtbf: number; // Hours
  mttr: number; // Hours
  totalDowntime: number; // Hours
  incidentsCount: number;
  preventiveCompletionRate: number; // %
}

export interface FinancialKPIs {
  totalDailyCost: number;
  materialCost: number;
  laborCost: number;
  machineCost: number;
  unitMargin: number;
}

export interface QualityKPIs {
  scrapRate: number; // %
  ppm: number; // Parts Per Million
  topDefects: { reason: string; count: number }[];
}

export interface DashboardMetrics {
  oee: OEEData;
  maintenance: MaintenanceKPIs;
  finance: FinancialKPIs;
  quality: QualityKPIs;
  production: {
    onTimeDelivery: number; // %
    averageCycleTimeGap: number; // % diff theoretical vs real
  };
  stock: {
    value: number;
    coverageDays: number;
    riskItems: number;
  }
}

// Process Types
export interface ProcessStep {
  id: string;
  order: number;
  name: string;
  machineType: string;
  standardTime: number; // minutes
  instructions: string;
}

export interface ManufacturingProcess {
  id: string;
  productReference: string; // Links to Product Reference
  name: string;
  version: string;
  steps: ProcessStep[];
}

// Traceability Types
export interface TraceabilityEvent {
  id: string;
  orderId: string;
  timestamp: string;
  type: 'MATERIAL' | 'PROCESS' | 'QUALITY' | 'DISPATCH';
  description: string;
  actor: string; // Operator or Inspector name
  details: Record<string, string>; 
}
