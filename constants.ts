
import { Machine, MachineStatus, Material, Operator, OrderStatus, ProductionOrder, QualityReport, ManufacturingProcess, TraceabilityEvent } from './types';

export const MOCK_ORDERS: ProductionOrder[] = [
  {
    id: 'OP-2023-001',
    productName: 'Boîtier Métallique X500',
    reference: 'REF-BM-500',
    quantityPlanned: 5000,
    quantityProduced: 3250,
    startDate: '2023-10-25',
    dueDate: '2023-10-30',
    status: OrderStatus.IN_PROGRESS,
    progress: 65,
    assignedMachineIds: ['M-01'],
    assignedOperatorIds: ['OP-04']
  },
  {
    id: 'OP-2023-002',
    productName: 'Support Plastique A1',
    reference: 'REF-SP-A1',
    quantityPlanned: 1200,
    quantityProduced: 0,
    startDate: '2023-11-01',
    dueDate: '2023-11-02',
    status: OrderStatus.PLANNED,
    progress: 0,
    assignedMachineIds: ['M-04'],
    assignedOperatorIds: []
  },
  {
    id: 'OP-2023-003',
    productName: 'Vis Assemblage M5',
    reference: 'REF-VIS-M5',
    quantityPlanned: 10000,
    quantityProduced: 9800,
    startDate: '2023-10-20',
    dueDate: '2023-10-24',
    status: OrderStatus.COMPLETED,
    progress: 100,
    assignedMachineIds: ['M-02'],
    assignedOperatorIds: ['OP-01']
  },
  {
    id: 'OP-2023-004',
    productName: 'Connecteur RJ45',
    reference: 'REF-CON-RJ',
    quantityPlanned: 2000,
    quantityProduced: 450,
    startDate: '2023-10-26',
    dueDate: '2023-10-28',
    status: OrderStatus.DELAYED,
    progress: 22,
    assignedMachineIds: ['M-03'],
    assignedOperatorIds: ['OP-02', 'OP-03']
  }
];

export const MOCK_MACHINES: Machine[] = [
  {
    id: 'M-01',
    name: 'Presse Hydraulique A',
    reference: 'MACH-PH-001',
    type: 'Presse',
    function: 'Pliage',
    capacity: '500 T',
    purchaseCost: 150000,
    status: MachineStatus.RUNNING,
    efficiency: 92,
    operatingTime: 120,
    downtime: 2,
    lastMaintenance: '2023-10-01',
    nextMaintenance: '2023-11-01',
    maintenanceLog: [
      { id: 'ML-01', machineId: 'M-01', date: '2023-10-01', type: 'Preventive', description: 'Changement huile hydraulique', technician: 'Paul Martin' }
    ]
  },
  {
    id: 'M-02',
    name: 'Centre Usinage CNC',
    reference: 'MACH-CNC-X2',
    type: 'CNC',
    function: 'Usinage',
    capacity: '3 Axes',
    purchaseCost: 220000,
    status: MachineStatus.DOWN,
    efficiency: 45,
    operatingTime: 40,
    downtime: 12,
    lastMaintenance: '2023-09-15',
    nextMaintenance: '2023-10-27',
    maintenanceLog: [
      { id: 'ML-02', machineId: 'M-02', date: '2023-09-15', type: 'Preventive', description: 'Calibrage axes X/Y', technician: 'Paul Martin' },
      { id: 'ML-03', machineId: 'M-02', date: '2023-10-24', type: 'Corrective', description: 'Blocage broche', technician: 'Externe' }
    ]
  },
  {
    id: 'M-03',
    name: 'Ligne Assemblage 1',
    reference: 'LIGNE-ASS-01',
    type: 'Assemblage',
    function: 'Montage',
    capacity: '200 u/h',
    purchaseCost: 80000,
    status: MachineStatus.RUNNING,
    efficiency: 88,
    operatingTime: 300,
    downtime: 5,
    lastMaintenance: '2023-10-10',
    nextMaintenance: '2023-11-10',
    maintenanceLog: []
  },
  {
    id: 'M-04',
    name: 'Robot Peinture',
    reference: 'ROBOT-P-05',
    type: 'Robot',
    function: 'Peinture',
    capacity: '6 Axes',
    purchaseCost: 180000,
    status: MachineStatus.IDLE,
    efficiency: 98,
    operatingTime: 80,
    downtime: 0,
    lastMaintenance: '2023-10-20',
    nextMaintenance: '2023-11-20',
    maintenanceLog: []
  }
];

export const MOCK_OPERATORS: Operator[] = [
  ];

export const MOCK_MATERIALS: Material[] = [
  { id: 'MAT-01', name: 'Acier Inox 304', stock: 450, unit: 'kg', minThreshold: 500, dailyConsumption: 50, unitCost: 12.5 },
  { id: 'MAT-02', name: 'Granulés ABS', stock: 1200, unit: 'kg', minThreshold: 200, dailyConsumption: 100, unitCost: 4.2 },
  { id: 'MAT-03', name: 'Peinture Epoxy', stock: 50, unit: 'L', minThreshold: 20, dailyConsumption: 5, unitCost: 45.0 },
];

export const MOCK_QUALITY: QualityReport[] = [
  { id: 'QC-01', orderId: 'OP-2023-003', checkedQuantity: 100, rejectedQuantity: 2, defectReason: 'Rayures', date: '2023-10-24', inspector: 'Marie Curie' },
  { id: 'QC-02', orderId: 'OP-2023-001', checkedQuantity: 50, rejectedQuantity: 0, defectReason: undefined, date: '2023-10-26', inspector: 'Marie Curie' },
  { id: 'QC-03', orderId: 'OP-2023-004', checkedQuantity: 200, rejectedQuantity: 15, defectReason: 'Dimensions', date: '2023-10-27', inspector: 'Marie Curie' },
  { id: 'QC-04', orderId: 'OP-2023-001', checkedQuantity: 120, rejectedQuantity: 5, defectReason: 'Aspect', date: '2023-10-28', inspector: 'Marie Curie' },
];

export const MOCK_PROCESSES: ManufacturingProcess[] = [
  {
    id: 'PROC-001',
    productReference: 'REF-BM-500',
    name: 'Gamme Standard Boîtier Métal',
    version: 'v1.2',
    steps: [
      { id: 'ST-01', order: 1, name: 'Découpe Laser', machineType: 'Laser Cutter', standardTime: 15, instructions: 'Vérifier l\'épaisseur de la tôle (2mm)' },
      { id: 'ST-02', order: 2, name: 'Pliage', machineType: 'Presse Hydraulique', standardTime: 10, instructions: 'Angle de 90°, tolérance +/- 0.5°' },
      { id: 'ST-03', order: 3, name: 'Soudure TIG', machineType: 'Poste Soudure', standardTime: 25, instructions: 'Soudure étanche sur les 4 coins' },
      { id: 'ST-04', order: 4, name: 'Peinture', machineType: 'Robot Peinture', standardTime: 30, instructions: 'Couleur RAL 7035, 2 couches' }
    ]
  },
  {
    id: 'PROC-002',
    productReference: 'REF-SP-A1',
    name: 'Injection Plastique Standard',
    version: 'v2.0',
    steps: [
      { id: 'ST-01', order: 1, name: 'Injection', machineType: 'Presse Injection', standardTime: 45, instructions: 'Température buse 230°C' },
      { id: 'ST-02', order: 2, name: 'Ébavurage', machineType: 'Manuel', standardTime: 5, instructions: 'Retirer carottes et bavures' }
    ]
  }
];

export const MOCK_TRACEABILITY: TraceabilityEvent[] = [
  { id: 'TR-001', orderId: 'OP-2023-001', timestamp: '2023-10-25 08:30', type: 'MATERIAL', description: 'Sortie Stock Matière', actor: 'Magasinier', details: { 'Batch': 'ACIER-LOT-884', 'Qty': '250kg' } },
  { id: 'TR-002', orderId: 'OP-2023-001', timestamp: '2023-10-25 09:15', type: 'PROCESS', description: 'Début Découpe', actor: 'Sophie Germain', details: { 'Machine': 'M-01', 'Program': 'P-CUT-500' } },
  { id: 'TR-003', orderId: 'OP-2023-001', timestamp: '2023-10-25 14:00', type: 'PROCESS', description: 'Fin Pliage', actor: 'Sophie Germain', details: { 'PiecesOK': '500', 'Scrap': '2' } },
  { id: 'TR-004', orderId: 'OP-2023-001', timestamp: '2023-10-26 10:30', type: 'QUALITY', description: 'Contrôle Intermédiaire', actor: 'Marie Curie', details: { 'Result': 'PASS', 'Dimensions': 'OK' } },
];

export const MOCK_OEE_HISTORY = [
  { date: 'Lun', value: 78 },
  { date: 'Mar', value: 82 },
  { date: 'Mer', value: 81 },
  { date: 'Jeu', value: 85 },
  { date: 'Ven', value: 79 },
  { date: 'Sam', value: 88 },
  { date: 'Dim', value: 90 },
];

export const MOCK_PARETO_DEFECTS = [
  { reason: 'Rayures', count: 45 },
  { reason: 'Dimensions', count: 28 },
  { reason: 'Aspect', count: 15 },
  { reason: 'Bavures', count: 8 },
  { reason: 'Autres', count: 4 },
];
