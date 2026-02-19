
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Line } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Clock, AlertOctagon, Package, Zap, TrendingUp, DollarSign, Wrench, Calendar, Users, Server } from 'lucide-react';
import { Machine, ProductionOrder, Material, DashboardMetrics, MachineStatus, OrderStatus, Operator } from '../types';
import { StatCard } from './StatCard';

interface DashboardProps {
  orders: ProductionOrder[];
  machines: Machine[];
  materials: Material[];
  metrics: DashboardMetrics;
  operators: Operator[];
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, machines, materials, metrics, operators }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'production' | 'maintenance' | 'quality' | 'finance'>('overview');
  
  // Date Range State
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const [startDate, setStartDate] = useState<string>(startOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(today.toISOString().split('T')[0]);

  // --- Time Filtering Logic ---
  const { filteredOrders, daysDiff } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Include the full end day
    end.setHours(23, 59, 59, 999);

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const filtered = orders.filter(o => {
      const orderDate = new Date(o.startDate);
      return orderDate >= start && orderDate <= end;
    });

    return { filteredOrders: filtered, daysDiff: diffDays || 1 };
  }, [orders, startDate, endDate]);

  // --- Dynamic Chart Data Generator ---
  const chartData = useMemo(() => {
    const data = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    
    // Determine granularity based on range duration
    let interval = 1;
    if (totalDays > 31) interval = 7; // Weekly for > 1 month
    if (totalDays > 180) interval = 30; // Monthly for > 6 months

    let current = new Date(start);
    while (current <= end) {
      let label = '';
      if (totalDays <= 31) {
        label = `${current.getDate()}/${current.getMonth() + 1}`;
      } else if (totalDays <= 180) {
        label = `S${Math.ceil((current.getDate() + new Date(current.getFullYear(), current.getMonth(), 1).getDay()) / 7)}`;
      } else {
        label = current.toLocaleString('default', { month: 'short' });
      }

      // Simulate varying data based on base metrics + random noise
      const noise = Math.random() * 10 - 5;
      const value = Math.min(100, Math.max(0, metrics.oee.global + noise));

      data.push({
        date: label,
        value: Math.round(value)
      });

      current.setDate(current.getDate() + interval);
    }
    return data;
  }, [startDate, endDate, metrics.oee.global]);

  // --- Data Prep ---
  const ordersByStatus = [
    { name: 'Planifié', value: filteredOrders.filter(o => o.status === OrderStatus.PLANNED).length },
    { name: 'En Cours', value: filteredOrders.filter(o => o.status === OrderStatus.IN_PROGRESS).length },
    { name: 'Terminé', value: filteredOrders.filter(o => o.status === OrderStatus.COMPLETED).length },
    { name: 'Retard', value: filteredOrders.filter(o => o.status === OrderStatus.DELAYED).length },
  ];

  const machinesByStatus = [
      { name: 'Marche', value: machines.filter(m => m.status === MachineStatus.RUNNING).length },
      { name: 'Arrêt', value: machines.filter(m => m.status === MachineStatus.DOWN).length },
      { name: 'Attente', value: machines.filter(m => m.status === MachineStatus.IDLE).length },
      { name: 'Maint.', value: machines.filter(m => m.status === MachineStatus.MAINTENANCE).length },
  ];

  // Financials adjusted by number of days selected
  const costMultiplier = daysDiff;
  const currentCostData = [
    { name: 'Matières', value: metrics.finance.materialCost * costMultiplier },
    { name: 'Main d\'œuvre', value: metrics.finance.laborCost * costMultiplier },
    { name: 'Machines', value: metrics.finance.machineCost * costMultiplier },
  ];

  const criticalStock = materials.filter(m => m.stock <= m.minThreshold);
  const downMachines = machines.filter(m => m.status === MachineStatus.DOWN);
  const COLORS = ['#94a3b8', '#3b82f6', '#22c55e', '#ef4444'];
  const MACHINE_COLORS = ['#22c55e', '#ef4444', '#9ca3af', '#f97316'];
  const COST_COLORS = ['#6366f1', '#ec4899', '#eab308'];

  // --- Smart Widgets Logic ---
  const smartAlerts = [];
  if (metrics.oee.global < 60) smartAlerts.push({ type: 'critical', msg: 'TRS Global Critique (<60%). Action requise sur les goulots.' });
  if (downMachines.length > 0) smartAlerts.push({ type: 'critical', msg: `${downMachines.length} Machine(s) à l'arrêt critique.` });
  if (criticalStock.length > 0) smartAlerts.push({ type: 'warning', msg: `${criticalStock.length} référence(s) matière en rupture potentielle.` });
  if (metrics.production.onTimeDelivery < 95) smartAlerts.push({ type: 'info', msg: 'Taux de service en baisse. Vérifier le planning.' });

  // --- Sub-Components for Tabs ---

  const OverviewTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Global KPIs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="TRS Global (OEE)" value={`${metrics.oee.global}%`} icon={Activity} color={metrics.oee.global >= 75 ? "green" : "orange"} trend="+1.2%" />
            <StatCard title="Total Employés" value={operators.length} icon={Users} color="purple" />
            <StatCard title="Parc Machines" value={machines.length} icon={Server} color="blue" />
            <StatCard title={`Coût Total (${daysDiff} jours)`} value={`${(metrics.finance.totalDailyCost * costMultiplier).toLocaleString()} MAD`} icon={DollarSign} color="gray" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Trend Chart */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Évolution du TRS</h3>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded capitalize">Période: {daysDiff} jours</span>
                </div>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorOee" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" axisLine={false} tickLine={false} minTickGap={30} />
                            <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorOee)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Machine Status Pie */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-gray-500" /> État Machines
                </h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={machinesByStatus} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                {machinesByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={MACHINE_COLORS[index % MACHINE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                    {smartAlerts.map((alert, idx) => (
                         <div key={idx} className={`text-xs p-2 rounded border-l-2 ${
                             alert.type === 'critical' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-blue-50 border-blue-500 text-blue-700'
                         }`}>
                             {alert.msg}
                         </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );

  const ProductionTab = () => (
     <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Commandes (Période)" value={filteredOrders.length} icon={Package} color="blue" />
            <StatCard title="Retards (Période)" value={filteredOrders.filter(o => o.status === OrderStatus.DELAYED).length} icon={AlertTriangle} color="red" />
            <StatCard title="Taux de Service" value={`${metrics.production.onTimeDelivery}%`} icon={TrendingUp} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Répartition des OP ({daysDiff} jours)</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={ordersByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {ordersByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Orders Progress List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-y-auto max-h-[340px]">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Suivi d'avancement ({filteredOrders.length} OP)</h3>
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                         <p className="text-gray-400 text-center italic py-4">Aucun ordre de production pour cette période.</p>
                    ) : (
                        filteredOrders.filter(o => o.status !== OrderStatus.COMPLETED).map(order => (
                            <div key={order.id}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">{order.productName}</span>
                                    <span className="text-gray-500">{order.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5">
                                    <div className={`h-2.5 rounded-full ${order.status === OrderStatus.DELAYED ? 'bg-red-500' : 'bg-blue-600'}`} style={{width: `${order.progress}%`}}></div>
                                </div>
                                <div className="flex justify-between mt-1">
                                    <span className="text-xs text-gray-400">{order.id}</span>
                                    <span className="text-xs text-gray-400">Échéance: {order.dueDate}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
     </div>
  );

  const MaintenanceTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="MTBF" value={`${metrics.maintenance.mtbf} h`} icon={Clock} color="green" />
            <StatCard title="MTTR" value={`${metrics.maintenance.mttr} h`} icon={Wrench} color="orange" />
            <StatCard title="Incidents Actifs" value={metrics.maintenance.incidentsCount} icon={AlertOctagon} color={metrics.maintenance.incidentsCount > 0 ? "red" : "green"} />
            <StatCard title="Complétion Maint." value={`${metrics.maintenance.preventiveCompletionRate}%`} icon={CheckCircle} color="blue" />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">État du Parc Machines</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {machines.map(m => (
                     <div key={m.id} className="p-4 border rounded-lg bg-gray-50">
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="font-bold text-sm">{m.name}</h4>
                             <div className={`w-3 h-3 rounded-full ${m.status === MachineStatus.RUNNING ? 'bg-green-500' : m.status === MachineStatus.DOWN ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                         </div>
                         <div className="text-xs text-gray-500 mb-2">Efficacité: {m.efficiency}%</div>
                         <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                             <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${m.efficiency}%`}}></div>
                         </div>
                         <div className="text-xs text-gray-400">Prochaine Maint: {m.nextMaintenance}</div>
                     </div>
                 ))}
             </div>
        </div>
    </div>
  );

  const QualityTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Taux de Rebut" value={`${metrics.quality.scrapRate}%`} icon={AlertTriangle} color={metrics.quality.scrapRate > 2 ? "red" : "green"} />
            <StatCard title="PPM (Parts Per Million)" value={metrics.quality.ppm} icon={Activity} color="orange" />
            <StatCard title="Taux de Conformité" value={`${100 - metrics.quality.scrapRate}%`} icon={CheckCircle} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pareto Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Pareto des Défauts (80/20)</h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={metrics.quality.topDefects}>
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="reason" />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="count" barSize={20} fill="#413ea0" name="Nombre" />
                            <Line yAxisId="right" type="monotone" dataKey="count" stroke="#ff7300" name="Tendance" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Inspector Performance (Mock) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Dernières Inspections</h3>
                <div className="overflow-y-auto h-80">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-2">Période</th>
                                <th className="p-2">Raison</th>
                                <th className="p-2 text-right">Qté Rejetée</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {metrics.quality.topDefects.map((d, i) => (
                                <tr key={i}>
                                    <td className="p-2 text-gray-600">S{42+i}</td>
                                    <td className="p-2 font-medium">{d.reason}</td>
                                    <td className="p-2 text-right font-bold text-red-600">{d.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );

  const FinanceTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title={`Coût Total (${daysDiff}j)`} value={`${(metrics.finance.totalDailyCost * costMultiplier).toLocaleString()} MAD`} icon={DollarSign} color="blue" />
            <StatCard title="Marge Unitaire Moy." value={`${metrics.finance.unitMargin}%`} icon={TrendingUp} color="green" />
            <StatCard title="Valeur du Stock Actuel" value={`${metrics.stock.value.toLocaleString()} MAD`} icon={Package} color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Répartition des Coûts ({daysDiff} jours)</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={currentCostData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                {currentCostData.map((entry, index) => <Cell key={`cell-${index}`} fill={COST_COLORS[index % COST_COLORS.length]} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toLocaleString()} MAD`} />
                            <Legend verticalAlign="bottom" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Couverture Stock (Jours)</h3>
                <div className="flex items-center justify-center h-64 flex-col">
                    <div className="text-6xl font-bold text-blue-600">{metrics.stock.coverageDays}</div>
                    <div className="text-gray-500 mt-2">Jours de stock moyen</div>
                    <div className="mt-6 w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                         <div className={`h-4 ${metrics.stock.coverageDays < 5 ? 'bg-red-500' : metrics.stock.coverageDays > 30 ? 'bg-orange-500' : 'bg-green-500'}`} style={{width: `${Math.min(metrics.stock.coverageDays * 2, 100)}%`}}></div>
                    </div>
                    <div className="flex justify-between w-full text-xs text-gray-400 mt-1">
                        <span>0j (Critique)</span>
                        <span>50j (Excès)</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with Navigation and Time Filter */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Industriel</h1>
          <p className="text-gray-500">Pilotage de la performance en temps réel</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
             {/* Date Range Picker */}
             <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg shadow-sm border border-gray-200 text-sm">
                <Calendar size={18} className="text-gray-400 ml-2" />
                
                <div className="flex items-center gap-2 px-2">
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Du</label>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="outline-none text-gray-700 font-medium bg-transparent cursor-pointer"
                        />
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex flex-col">
                        <label className="text-[10px] text-gray-400 font-semibold uppercase">Au</label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="outline-none text-gray-700 font-medium bg-transparent cursor-pointer"
                        />
                    </div>
                </div>
             </div>

             {/* View Mode Tabs */}
             <div className="flex bg-white p-1 rounded-lg shadow-sm border border-gray-200 overflow-x-auto max-w-full">
                <button onClick={() => setViewMode('overview')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${viewMode === 'overview' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Global</button>
                <button onClick={() => setViewMode('production')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${viewMode === 'production' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Production</button>
                <button onClick={() => setViewMode('maintenance')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${viewMode === 'maintenance' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Maintenance</button>
                <button onClick={() => setViewMode('quality')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${viewMode === 'quality' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Qualité</button>
                <button onClick={() => setViewMode('finance')} className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${viewMode === 'finance' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>Finance</button>
            </div>
        </div>
      </div>

      {viewMode === 'overview' && <OverviewTab />}
      {viewMode === 'production' && <ProductionTab />}
      {viewMode === 'maintenance' && <MaintenanceTab />}
      {viewMode === 'quality' && <QualityTab />}
      {viewMode === 'finance' && <FinanceTab />}
    </div>
  );
};
