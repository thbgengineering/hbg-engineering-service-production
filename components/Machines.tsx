
import React, { useState, useMemo } from 'react';
import { Machine, MachineStatus } from '../types';
import { AlertOctagon, Wrench, Power, Plus, Activity, Calendar, History, DollarSign, Database, Cog, Server, Layers, BarChart3, Trash2 } from 'lucide-react';
import { Modal } from './Modal';

interface MachinesProps {
  machines: Machine[];
  onAddMachine: (machine: Omit<Machine, 'id' | 'efficiency' | 'operatingTime' | 'downtime' | 'lastMaintenance' | 'nextMaintenance' | 'maintenanceLog'>) => void;
  onStatusChange: (id: string, status: MachineStatus) => void;
  onDeleteMachine: (id: string) => void;
}

export const Machines: React.FC<MachinesProps> = ({ machines, onAddMachine, onStatusChange, onDeleteMachine }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Enhanced Form State
  const [formData, setFormData] = useState({
      name: '',
      reference: '',
      type: '',
      function: '',
      capacity: '',
      purchaseCost: 0
  });
  
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

  // --- Machine Dashboard Statistics ---
  const stats = useMemo(() => {
    const total = machines.length;
    const running = machines.filter(m => m.status === MachineStatus.RUNNING).length;
    const down = machines.filter(m => m.status === MachineStatus.DOWN).length;
    const maintenance = machines.filter(m => m.status === MachineStatus.MAINTENANCE).length;
    const idle = machines.filter(m => m.status === MachineStatus.IDLE).length;
    
    const totalCost = machines.reduce((acc, m) => acc + (m.purchaseCost || 0), 0);
    const avgEfficiency = total > 0 ? Math.round(machines.reduce((acc, m) => acc + m.efficiency, 0) / total) : 0;

    // Group by Type
    const byType = machines.reduce((acc, m) => {
        acc[m.type] = (acc[m.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return { total, running, down, maintenance, idle, totalCost, avgEfficiency, byType };
  }, [machines]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMachine({
      ...formData,
      status: MachineStatus.IDLE
    });
    setFormData({ name: '', reference: '', type: '', function: '', capacity: '', purchaseCost: 0 });
    setIsModalOpen(false);
  };

  const openDetails = (machine: Machine) => {
    setSelectedMachine(machine);
  };

  const handleDelete = (e: React.MouseEvent, machine: Machine) => {
    e.stopPropagation(); // Prevent opening details modal
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la machine "${machine.name}" ?`)) {
        onDeleteMachine(machine.id);
    }
  };

  const getStatusColor = (status: MachineStatus) => {
    switch(status) {
      case MachineStatus.RUNNING: return 'border-green-500 bg-green-50';
      case MachineStatus.DOWN: return 'border-red-500 bg-red-50';
      case MachineStatus.MAINTENANCE: return 'border-orange-500 bg-orange-50';
      case MachineStatus.IDLE: return 'border-gray-400 bg-gray-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getStatusIcon = (status: MachineStatus) => {
    switch(status) {
      case MachineStatus.RUNNING: return <Power className="text-green-600" />;
      case MachineStatus.DOWN: return <AlertOctagon className="text-red-600" />;
      case MachineStatus.MAINTENANCE: return <Wrench className="text-orange-600" />;
      case MachineStatus.IDLE: return <Power className="text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parc Machines</h1>
          <p className="text-gray-500">Surveillance en temps réel des équipements</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvelle Machine
        </button>
      </div>

      {/* --- DASHBOARD HEADER --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Valeur Parc */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <DollarSign size={20} />
                </div>
                <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {stats.total} Machines
                </span>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Valeur d'achat totale</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCost.toLocaleString()} MAD</p>
            </div>
        </div>

        {/* Card 2: État */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
                <Activity size={18} className="text-gray-500" />
                <p className="text-sm font-bold text-gray-700">État du Parc</p>
            </div>
            <div className="space-y-2 text-xs font-medium">
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> En Marche
                    </span>
                    <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded">{stats.running}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div> En Panne
                    </span>
                    <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded">{stats.down}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-gray-600">
                        <div className="w-2 h-2 rounded-full bg-orange-500"></div> Maintenance
                    </span>
                    <span className="text-orange-700 bg-orange-50 px-2 py-0.5 rounded">{stats.maintenance}</span>
                </div>
            </div>
        </div>

        {/* Card 3: Efficacité */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <BarChart3 size={20} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stats.avgEfficiency > 80 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    Moyenne
                </span>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">Efficacité Globale (TRS)</p>
                <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold text-gray-900">{stats.avgEfficiency}%</p>
                    <div className="w-full bg-gray-100 h-2 rounded-full mb-2 max-w-[100px]">
                        <div className="bg-purple-500 h-2 rounded-full" style={{width: `${stats.avgEfficiency}%`}}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Card 4: Types */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 overflow-y-auto max-h-[140px] custom-scrollbar">
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white pb-1">
                <Layers size={18} className="text-gray-500" />
                <p className="text-sm font-bold text-gray-700">Par Type</p>
            </div>
            <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between w-full text-xs bg-gray-50 p-1.5 rounded border border-gray-100">
                         <span className="text-gray-600 truncate font-medium">{type}</span>
                         <span className="bg-white text-gray-800 px-1.5 rounded shadow-sm font-bold border">{count}</span>
                    </div>
                ))}
                 {Object.keys(stats.byType).length === 0 && <span className="text-xs text-gray-400">Aucune donnée</span>}
            </div>
        </div>
      </div>

      {/* --- MACHINES GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.map((machine) => (
          <div 
            key={machine.id} 
            onClick={() => openDetails(machine)}
            className={`relative bg-white rounded-xl p-6 border-l-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${getStatusColor(machine.status).split(' ')[0]}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{machine.name}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{machine.reference} • {machine.type}</p>
              </div>
              <div className="flex items-start gap-2">
                <div className={`p-2 rounded-full bg-white shadow-sm`}>
                    {getStatusIcon(machine.status)}
                </div>
                {/* Delete Button */}
                <button 
                    onClick={(e) => handleDelete(e, machine)}
                    className="p-2 rounded-full bg-white text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Supprimer"
                >
                    <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Statut</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded ${getStatusColor(machine.status)}`}>
                  {machine.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                 <span className="text-gray-500 text-sm">Efficacité (OEE)</span>
                 <span className="text-sm font-bold text-gray-800">{machine.efficiency}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${machine.efficiency}%` }}></div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Fonction</p>
                  <p className="text-sm font-medium text-gray-700 truncate">{machine.function}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Capacité</p>
                  <p className="text-sm font-medium text-gray-700">{machine.capacity}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Machine Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une Machine">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la machine</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Presse Injection A4"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="Ex: CNC, Presse"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fonction</label>
                <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  value={formData.function} onChange={e => setFormData({...formData, function: e.target.value})} placeholder="Ex: Pliage"/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacité</label>
                <input required type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                  value={formData.capacity} onChange={e => setFormData({...formData, capacity: e.target.value})} placeholder="Ex: 500 Tonnes"/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coût d'achat (MAD)</label>
            <input required type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none"
                value={formData.purchaseCost} onChange={e => setFormData({...formData, purchaseCost: parseFloat(e.target.value)})} />
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Ajouter la machine
          </button>
        </form>
      </Modal>

      {/* Machine Details Modal */}
      <Modal isOpen={!!selectedMachine} onClose={() => setSelectedMachine(null)} title={selectedMachine?.name || 'Détails Machine'}>
         {selectedMachine && (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div>
                        <div className="text-xs text-gray-500">Référence</div>
                        <div className="font-semibold">{selectedMachine.reference}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Type</div>
                        <div className="font-semibold">{selectedMachine.type}</div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500">Coût Acquisition</div>
                        <div className="font-semibold">{selectedMachine.purchaseCost?.toLocaleString()} MAD</div>
                    </div>
                     <div>
                        <div className="text-xs text-gray-500">Capacité</div>
                        <div className="font-semibold">{selectedMachine.capacity}</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-700 mb-3">Contrôle Direct</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <button 
                            onClick={() => { onStatusChange(selectedMachine.id, MachineStatus.RUNNING); setSelectedMachine({...selectedMachine, status: MachineStatus.RUNNING}); }}
                            className={`p-2 rounded-lg text-sm font-medium flex flex-col items-center gap-1 transition-colors ${selectedMachine.status === MachineStatus.RUNNING ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-white border hover:bg-gray-50'}`}
                        >
                            <Power size={16} /> Démarrer
                        </button>
                        <button 
                            onClick={() => { onStatusChange(selectedMachine.id, MachineStatus.IDLE); setSelectedMachine({...selectedMachine, status: MachineStatus.IDLE}); }}
                            className={`p-2 rounded-lg text-sm font-medium flex flex-col items-center gap-1 transition-colors ${selectedMachine.status === MachineStatus.IDLE ? 'bg-gray-200 text-gray-800 ring-2 ring-gray-500' : 'bg-white border hover:bg-gray-50'}`}
                        >
                            <Activity size={16} /> Pause / Attente
                        </button>
                        <button 
                            onClick={() => { onStatusChange(selectedMachine.id, MachineStatus.MAINTENANCE); setSelectedMachine({...selectedMachine, status: MachineStatus.MAINTENANCE}); }}
                            className={`p-2 rounded-lg text-sm font-medium flex flex-col items-center gap-1 transition-colors ${selectedMachine.status === MachineStatus.MAINTENANCE ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-500' : 'bg-white border hover:bg-gray-50'}`}
                        >
                            <Wrench size={16} /> Maintenance
                        </button>
                        <button 
                            onClick={() => { onStatusChange(selectedMachine.id, MachineStatus.DOWN); setSelectedMachine({...selectedMachine, status: MachineStatus.DOWN}); }}
                            className={`p-2 rounded-lg text-sm font-medium flex flex-col items-center gap-1 transition-colors ${selectedMachine.status === MachineStatus.DOWN ? 'bg-red-100 text-red-700 ring-2 ring-red-500' : 'bg-white border hover:bg-gray-50'}`}
                        >
                            <AlertOctagon size={16} /> En Panne
                        </button>
                    </div>
                </div>

                {/* Maintenance History */}
                <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <History size={18} /> Historique Maintenance
                    </h4>
                    <div className="bg-white border border-gray-100 rounded-xl max-h-48 overflow-y-auto">
                        {selectedMachine.maintenanceLog && selectedMachine.maintenanceLog.length > 0 ? (
                            <ul className="divide-y divide-gray-100">
                                {selectedMachine.maintenanceLog.map(log => (
                                    <li key={log.id} className="p-3">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-gray-800">{log.date}</span>
                                            <span className={`text-xs px-1.5 rounded ${log.type === 'Preventive' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>{log.type}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{log.description}</p>
                                        <p className="text-xs text-gray-400 mt-1">Tech: {log.technician}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="p-4 text-sm text-gray-400 text-center">Aucun historique disponible.</p>
                        )}
                    </div>
                </div>
            </div>
         )}
      </Modal>
    </div>
  );
};
