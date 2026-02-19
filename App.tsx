
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProductionOrders } from './components/ProductionOrders';
import { Machines } from './components/Machines';
import { Inventory } from './components/Inventory';
import { Personnel } from './components/Personnel';
import { QualityControl } from './components/QualityControl';
import { ProcessManagement } from './components/ProcessManagement';
import { PlanningAPS } from './components/PlanningAPS';
import { Traceability } from './components/Traceability';
import { MOCK_ORDERS, MOCK_MACHINES, MOCK_MATERIALS, MOCK_OPERATORS, MOCK_QUALITY, MOCK_PROCESSES, MOCK_TRACEABILITY, MOCK_OEE_HISTORY, MOCK_PARETO_DEFECTS } from './constants';
import { ProductionOrder, OrderStatus, DashboardMetrics, Machine, Material, Operator, QualityReport, ManufacturingProcess, ProcessStep, MachineStatus } from './types';

// Helper for local storage initialization
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    console.error("Failed to load from storage", e);
    return fallback;
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Persistent State Initialization
  const [orders, setOrders] = useState<ProductionOrder[]>(() => loadFromStorage('prod_orders', MOCK_ORDERS));
  const [machines, setMachines] = useState<Machine[]>(() => loadFromStorage('prod_machines', MOCK_MACHINES));
  const [materials, setMaterials] = useState<Material[]>(() => loadFromStorage('prod_materials', MOCK_MATERIALS));
  const [operators, setOperators] = useState<Operator[]>(() => loadFromStorage('prod_operators', MOCK_OPERATORS));
  const [qualityReports, setQualityReports] = useState<QualityReport[]>(() => loadFromStorage('prod_quality', MOCK_QUALITY));
  const [processes, setProcesses] = useState<ManufacturingProcess[]>(() => loadFromStorage('prod_processes', MOCK_PROCESSES));
  const [traceabilityEvents] = useState(() => loadFromStorage('prod_traceability', MOCK_TRACEABILITY)); // Read-only logic for now

  const [metrics, setMetrics] = useState<DashboardMetrics>({
    oee: { global: 0, availability: 0, performance: 0, quality: 0, history: [] },
    maintenance: { mtbf: 0, mttr: 0, totalDowntime: 0, incidentsCount: 0, preventiveCompletionRate: 0 },
    finance: { totalDailyCost: 0, materialCost: 0, laborCost: 0, machineCost: 0, unitMargin: 0 },
    quality: { scrapRate: 0, ppm: 0, topDefects: [] },
    production: { onTimeDelivery: 0, averageCycleTimeGap: 0 },
    stock: { value: 0, coverageDays: 0, riskItems: 0 }
  });

  // --- Persistence Effects (Save on Change) ---
  useEffect(() => { localStorage.setItem('prod_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('prod_machines', JSON.stringify(machines)); }, [machines]);
  useEffect(() => { localStorage.setItem('prod_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('prod_operators', JSON.stringify(operators)); }, [operators]);
  useEffect(() => { localStorage.setItem('prod_quality', JSON.stringify(qualityReports)); }, [qualityReports]);
  useEffect(() => { localStorage.setItem('prod_processes', JSON.stringify(processes)); }, [processes]);

  // --- Dynamic Metrics Calculation ---
  useEffect(() => {
    // 1. OEE Calculation (Dynamic)
    const runningMachines = machines.filter(m => m.status === MachineStatus.RUNNING).length;
    const totalMachines = machines.length;
    
    // Availability: % of machines currently running
    const availability = totalMachines > 0 ? Math.round((runningMachines / totalMachines) * 100) : 0;
    
    // Performance: Average efficiency of running machines
    const avgPerformance = machines.length > 0 
        ? Math.round(machines.reduce((acc, m) => acc + m.efficiency, 0) / totalMachines) 
        : 0;
    
    // Quality Rate: Based on all quality reports
    const totalChecked = qualityReports.reduce((acc, r) => acc + r.checkedQuantity, 0);
    const totalRejected = qualityReports.reduce((acc, r) => acc + r.rejectedQuantity, 0);
    const qualityRate = totalChecked > 0 ? Math.round(((totalChecked - totalRejected) / totalChecked) * 100) : 100;
    
    const globalOEE = Math.round((availability/100) * (avgPerformance/100) * (qualityRate/100) * 100);

    // 2. Stock Logic (Dynamic)
    const lowStockCount = materials.filter(m => m.stock <= m.minThreshold).length;
    const totalStockValue = Math.round(materials.reduce((acc, m) => acc + (m.stock * (m.unitCost || 0)), 0));
    
    // 3. Financial Logic (Dynamic)
    const activeOperators = operators.filter(op => op.present).length;
    const dailyLaborCost = Math.round(activeOperators * 200); // Approx cost if salary unknown, but we can improve this
    const dailyMachineCost = runningMachines * 500; // Approx 500€ per running machine/day
    // Material cost based on average consumption (mock calculation for dashboard)
    const dailyMaterialCost = Math.round(materials.reduce((acc, m) => acc + ((m.dailyConsumption || 0) * (m.unitCost || 0)), 0));
    const totalDailyCost = dailyLaborCost + dailyMachineCost + dailyMaterialCost;

    // 4. Maintenance Logic (Dynamic)
    const totalDownTime = machines.reduce((acc, m) => acc + m.downtime, 0);
    const downMachinesCount = machines.filter(m => m.status === MachineStatus.DOWN).length;

    // 5. Production Logic (Dynamic)
    const delayedOrders = orders.filter(o => o.status === OrderStatus.DELAYED).length;
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED).length;
    const totalOrders = orders.filter(o => o.status !== OrderStatus.PLANNED).length;
    const onTimeRate = totalOrders > 0 ? Math.round(((totalOrders - delayedOrders) / totalOrders) * 100) : 100;

    setMetrics({
      oee: {
        availability: availability,
        performance: avgPerformance,
        quality: qualityRate,
        global: globalOEE,
        history: MOCK_OEE_HISTORY // Keeping mock history for charts as we don't have historical DB
      },
      production: {
        onTimeDelivery: onTimeRate,
        averageCycleTimeGap: -2
      },
      maintenance: {
        mtbf: 145,
        mttr: 4.5,
        totalDowntime: totalDownTime,
        incidentsCount: downMachinesCount,
        preventiveCompletionRate: 85
      },
      finance: {
        totalDailyCost: totalDailyCost,
        laborCost: dailyLaborCost,
        machineCost: dailyMachineCost,
        materialCost: dailyMaterialCost,
        unitMargin: 24
      },
      quality: {
        scrapRate: parseFloat(((totalRejected / totalChecked) * 100).toFixed(2)) || 0,
        ppm: Math.round((totalRejected / totalChecked) * 1000000) || 0,
        topDefects: MOCK_PARETO_DEFECTS // Keeping mock pareto for chart complexity
      },
      stock: {
        riskItems: lowStockCount,
        value: totalStockValue,
        coverageDays: 14
      }
    });

  }, [machines, orders, qualityReports, materials, operators]);

  // --- Action Handlers ---

  const handleUpdateOrderStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(order => {
      if (order.id === id) {
        const updates: Partial<ProductionOrder> = { status: newStatus };
        if (newStatus === OrderStatus.COMPLETED) {
            updates.progress = 100;
            updates.quantityProduced = order.quantityPlanned;
        }
        if (newStatus === OrderStatus.IN_PROGRESS && order.progress === 0) {
             updates.progress = 1; // Just start it
        }
        return { ...order, ...updates };
      }
      return order;
    }));
  };

  // Updated: Calculates progress based on quantity input
  const handleUpdateProducedQuantity = (id: string, quantity: number) => {
    setOrders(prev => prev.map(order => {
        if (order.id === id) {
            const newQuantity = Math.max(0, quantity); // Ensure no negative
            const progressPercent = Math.min(100, Math.round((newQuantity / order.quantityPlanned) * 100));
            
            let newStatus = order.status;
            if (progressPercent >= 100) newStatus = OrderStatus.COMPLETED;
            else if (progressPercent > 0 && order.status === OrderStatus.PLANNED) newStatus = OrderStatus.IN_PROGRESS;

            return { 
                ...order, 
                quantityProduced: newQuantity,
                progress: progressPercent,
                status: newStatus
            };
        }
        return order;
    }));
  };

  const handleScheduleOrder = (orderId: string, machineId: string, startDate: string, dueDate: string) => {
      setOrders(prev => prev.map(order => {
          if (order.id === orderId) {
              return {
                  ...order,
                  assignedMachineIds: [machineId], // Set as primary assigned
                  startDate,
                  dueDate
              };
          }
          return order;
      }));
  };

  const handleAddOrder = (orderData: Omit<ProductionOrder, 'id' | 'status' | 'progress' | 'quantityProduced'>) => {
    const newOrder: ProductionOrder = {
      id: `OP-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      ...orderData,
      status: OrderStatus.PLANNED,
      progress: 0,
      quantityProduced: 0,
    };
    setOrders(prev => [...prev, newOrder]);
  };

  const handleAddMachine = (machineData: Omit<Machine, 'id' | 'efficiency' | 'operatingTime' | 'downtime' | 'lastMaintenance' | 'nextMaintenance' | 'maintenanceLog'>) => {
    const newMachine: Machine = {
      id: `M-${Math.floor(Math.random() * 100)}`,
      ...machineData,
      efficiency: 100,
      operatingTime: 0,
      downtime: 0,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
      maintenanceLog: []
    };
    setMachines(prev => [...prev, newMachine]);
  };

  const handleStatusChange = (id: string, status: MachineStatus) => {
    setMachines(prev => prev.map(m => {
        if (m.id === id) return { ...m, status };
        return m;
    }));
  };
  
  const handleDeleteMachine = (id: string) => {
      setMachines(prev => prev.filter(m => m.id !== id));
  };

  const handleAddMaterial = (materialData: Omit<Material, 'id'>) => {
    const newMaterial: Material = {
      id: `MAT-${Math.floor(Math.random() * 1000)}`,
      ...materialData
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const handleAddOperator = (operatorData: Omit<Operator, 'id' | 'present'>) => {
      const newOp: Operator = {
          id: `OP-${Math.floor(Math.random() * 1000)}`,
          ...operatorData,
          present: true
      };
      setOperators(prev => [...prev, newOp]);
  };

  const handleDeleteOperator = (id: string) => {
    setOperators(prev => prev.filter(op => op.id !== id));
  };

  const handleAddQualityReport = (reportData: Omit<QualityReport, 'id' | 'date'>) => {
    const newReport: QualityReport = {
        id: `QC-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        ...reportData
    };
    setQualityReports(prev => [newReport, ...prev]); // Add to top
  };

  const handleAddProcess = (process: ManufacturingProcess) => {
    setProcesses(prev => [...prev, process]);
  };

  const handleAddStep = (processId: string, step: ProcessStep) => {
      setProcesses(prev => prev.map(p => {
          if (p.id === processId) {
              return { ...p, steps: [...p.steps, step] };
          }
          return p;
      }));
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return <Dashboard orders={orders} machines={machines} materials={materials} metrics={metrics} operators={operators} />;
      case 'planning':
        return <PlanningAPS orders={orders} onScheduleOrder={handleScheduleOrder} />;
      case 'production':
        return <ProductionOrders orders={orders} machines={machines} operators={operators} onUpdateStatus={handleUpdateOrderStatus} onUpdateQuantity={handleUpdateProducedQuantity} onAddOrder={handleAddOrder} />;
      case 'process':
        return <ProcessManagement processes={processes} onAddProcess={handleAddProcess} onAddStep={handleAddStep} />;
      case 'machines':
        return <Machines machines={machines} onAddMachine={handleAddMachine} onStatusChange={handleStatusChange} onDeleteMachine={handleDeleteMachine} />;
      case 'inventory':
        return <Inventory materials={materials} onAddMaterial={handleAddMaterial} />;
      case 'quality':
        return <QualityControl reports={qualityReports} orders={orders} onAddReport={handleAddQualityReport} />;
      case 'traceability':
        return <Traceability events={traceabilityEvents} orders={orders} />;
      case 'personnel':
        return <Personnel operators={operators} onAddOperator={handleAddOperator} onDeleteOperator={handleDeleteOperator} />;
      default:
        return <Dashboard orders={orders} machines={machines} materials={materials} metrics={metrics} operators={operators} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-20 p-8 overflow-y-auto h-screen transition-all duration-300">
        <div className="max-w-7xl mx-auto pb-10">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
