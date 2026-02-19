
import React, { useState } from 'react';
import { ManufacturingProcess, ProcessStep } from '../types';
import { FileText, Layers, Clock, Plus, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { Modal } from './Modal';

interface ProcessManagementProps {
  processes: ManufacturingProcess[];
  onAddProcess: (process: ManufacturingProcess) => void;
  onAddStep: (processId: string, step: ProcessStep) => void;
}

export const ProcessManagement: React.FC<ProcessManagementProps> = ({ processes, onAddProcess, onAddStep }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isStepModalOpen, setIsStepModalOpen] = useState(false);
  
  const [newProcName, setNewProcName] = useState('');
  const [newProcRef, setNewProcRef] = useState('');

  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [newStepData, setNewStepData] = useState({
    name: '',
    machineType: '',
    standardTime: 0,
    instructions: ''
  });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    const newProcess: ManufacturingProcess = {
      id: `PROC-${Math.floor(Math.random() * 1000)}`,
      name: newProcName,
      productReference: newProcRef,
      version: 'v1.0',
      steps: []
    };
    onAddProcess(newProcess);
    setIsProcessModalOpen(false);
    setNewProcName('');
    setNewProcRef('');
  };

  const openStepModal = (processId: string) => {
    setSelectedProcessId(processId);
    setIsStepModalOpen(true);
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcessId) return;

    const process = processes.find(p => p.id === selectedProcessId);
    const currentSteps = process ? process.steps.length : 0;

    const step: ProcessStep = {
        id: `ST-${Math.floor(Math.random() * 10000)}`,
        order: currentSteps + 1,
        ...newStepData
    };

    onAddStep(selectedProcessId, step);
    setIsStepModalOpen(false);
    setNewStepData({ name: '', machineType: '', standardTime: 0, instructions: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processus & Gammes</h1>
          <p className="text-gray-500">Définition des gammes de fabrication et instructions</p>
        </div>
        <button 
          onClick={() => setIsProcessModalOpen(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvelle Gamme
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {processes.map((proc) => (
          <div key={proc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleExpand(proc.id)}
            >
              <div className="flex items-center gap-4">
                <div className="bg-teal-50 p-3 rounded-lg text-teal-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{proc.name}</h3>
                  <p className="text-sm text-gray-500">Réf: {proc.productReference} • Version: {proc.version}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-500">
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                    <Layers size={14} />
                    {proc.steps.length} Étapes
                </div>
                {expandedId === proc.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {expandedId === proc.id && (
              <div className="border-t border-gray-100 bg-gray-50 p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-700">Séquence des opérations</h4>
                    <button 
                        onClick={() => openStepModal(proc.id)}
                        className="text-sm text-white bg-teal-600 px-3 py-1.5 rounded hover:bg-teal-700 flex items-center gap-1"
                    >
                        <Plus size={14} /> Ajouter une étape
                    </button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    {proc.steps.map((step) => (
                      <div key={step.id} className="relative pl-12 py-2">
                        <div className="absolute left-2 top-5 w-4 h-4 bg-teal-500 rounded-full border-4 border-white shadow-sm z-10"></div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-800 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded">
                                    {step.order}
                                </span>
                                <h5 className="font-bold text-gray-800">{step.name}</h5>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 text-sm">
                                <Clock size={14} />
                                {step.standardTime} min
                            </div>
                          </div>
                          
                          <div className="flex gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                                <Settings size={14} className="text-gray-400"/>
                                {step.machineType}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 italic">
                            "{step.instructions}"
                          </p>
                        </div>
                      </div>
                    ))}
                    {proc.steps.length === 0 && (
                        <div className="pl-12 text-gray-400 italic text-sm">Aucune étape définie pour le moment.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal New Process */}
      <Modal isOpen={isProcessModalOpen} onClose={() => setIsProcessModalOpen(false)} title="Créer une nouvelle Gamme">
        <form onSubmit={handleAddProcess} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la gamme</label>
            <input 
                required
                type="text" 
                placeholder="Ex: Gamme Montage Pompe V2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                value={newProcName}
                onChange={e => setNewProcName(e.target.value)}
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Référence Produit associée</label>
            <input 
                required
                type="text" 
                placeholder="Ex: REF-PM-200"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                value={newProcRef}
                onChange={e => setNewProcRef(e.target.value)}
            />
            </div>
            <button type="submit" className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors">
                Créer la gamme
            </button>
        </form>
      </Modal>

      {/* Modal New Step */}
      <Modal isOpen={isStepModalOpen} onClose={() => setIsStepModalOpen(false)} title="Ajouter une étape">
         <form onSubmit={handleAddStep} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'opération</label>
                <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={newStepData.name}
                    onChange={e => setNewStepData({...newStepData, name: e.target.value})}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type Machine</label>
                    <input 
                        required
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={newStepData.machineType}
                        onChange={e => setNewStepData({...newStepData, machineType: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temps Standard (min)</label>
                    <input 
                        required
                        type="number" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={newStepData.standardTime}
                        onChange={e => setNewStepData({...newStepData, standardTime: parseInt(e.target.value)})}
                    />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    rows={3}
                    value={newStepData.instructions}
                    onChange={e => setNewStepData({...newStepData, instructions: e.target.value})}
                ></textarea>
            </div>
            <button type="submit" className="w-full bg-teal-600 text-white py-2.5 rounded-lg font-medium hover:bg-teal-700 transition-colors">
                Ajouter l'étape
            </button>
         </form>
      </Modal>
    </div>
  );
};
