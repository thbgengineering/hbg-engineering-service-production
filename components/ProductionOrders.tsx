
import React, { useState } from 'react';
import { ProductionOrder, OrderStatus, Machine, Operator } from '../types';
import { Play, CheckSquare, Clock, AlertCircle, Plus, Search, Sliders, Users, Zap } from 'lucide-react';
import { Modal } from './Modal';

interface ProductionOrdersProps {
  orders: ProductionOrder[];
  machines?: Machine[]; // Added for selection
  operators?: Operator[]; // Added for selection
  onUpdateStatus: (id: string, newStatus: OrderStatus) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onAddOrder: (order: Omit<ProductionOrder, 'id' | 'status' | 'progress' | 'quantityProduced'>) => void;
}

export const ProductionOrders: React.FC<ProductionOrdersProps> = ({ orders, machines = [], operators = [], onUpdateStatus, onUpdateQuantity, onAddOrder }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [tempQuantity, setTempQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    productName: '',
    reference: '',
    quantityPlanned: 0,
    startDate: '',
    dueDate: '',
    assignedMachineIds: [] as string[],
    assignedOperatorIds: [] as string[]
  });

  // Sort: Earliest Due Date first (Ascending)
  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrder(formData);
    setIsModalOpen(false);
    setFormData({ 
        productName: '', reference: '', quantityPlanned: 0, startDate: '', dueDate: '',
        assignedMachineIds: [], assignedOperatorIds: []
    });
  };

  const toggleMachineSelection = (id: string) => {
    setFormData(prev => {
        const exists = prev.assignedMachineIds.includes(id);
        return {
            ...prev,
            assignedMachineIds: exists 
                ? prev.assignedMachineIds.filter(mid => mid !== id)
                : [...prev.assignedMachineIds, id]
        };
    });
  };

  const toggleOperatorSelection = (id: string) => {
    setFormData(prev => {
        const exists = prev.assignedOperatorIds.includes(id);
        return {
            ...prev,
            assignedOperatorIds: exists 
                ? prev.assignedOperatorIds.filter(oid => oid !== id)
                : [...prev.assignedOperatorIds, id]
        };
    });
  };

  const openUpdateModal = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setTempQuantity(order.quantityProduced);
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (selectedOrder) {
      onUpdateQuantity(selectedOrder.id, tempQuantity);
      setUpdateModalOpen(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PLANNED: return 'bg-gray-100 text-gray-600';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700';
      case OrderStatus.DELAYED: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ordres de Production</h1>
          <p className="text-gray-500">Trié par échéance la plus proche</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvel OP
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Rechercher par ID, Référence ou Produit..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">ID / Référence</th>
                <th className="p-4 font-semibold">Produit</th>
                <th className="p-4 font-semibold">Avancement</th>
                <th className="p-4 font-semibold">Ressources</th>
                <th className="p-4 font-semibold">Quantité</th>
                <th className="p-4 font-semibold">Échéance</th>
                <th className="p-4 font-semibold">Statut</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{order.id}</div>
                    <div className="text-xs text-gray-500">{order.reference}</div>
                  </td>
                  <td className="p-4 text-gray-700 font-medium">{order.productName}</td>
                  <td className="p-4 w-40">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-bold">{order.progress}%</span>
                      <span className="text-gray-400">{order.quantityProduced}/{order.quantityPlanned}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer hover:ring-2 ring-blue-100" onClick={() => openUpdateModal(order)}>
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${order.status === OrderStatus.DELAYED ? 'bg-red-500' : order.status === OrderStatus.COMPLETED ? 'bg-green-500' : 'bg-blue-500'}`} 
                        style={{ width: `${Math.min(order.progress, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="p-4">
                      <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600" title="Machines">
                              <Zap size={12} className="text-orange-500"/>
                              <span>{order.assignedMachineIds?.length || 0}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600" title="Opérateurs">
                              <Users size={12} className="text-purple-500"/>
                              <span>{order.assignedOperatorIds?.length || 0}</span>
                          </div>
                      </div>
                  </td>
                  <td className="p-4 text-gray-600">{order.quantityPlanned} u</td>
                  <td className="p-4 text-gray-600 flex items-center gap-2">
                    <Clock size={14} />
                    {order.dueDate}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                          onClick={() => openUpdateModal(order)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                          title="Déclarer production"
                        >
                          <Sliders size={18} />
                       </button>
                      
                      {order.status === OrderStatus.PLANNED && (
                        <button 
                          onClick={() => onUpdateStatus(order.id, OrderStatus.IN_PROGRESS)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Démarrer"
                        >
                          <Play size={18} />
                        </button>
                      )}
                      {order.status === OrderStatus.IN_PROGRESS && (
                         <>
                          <button 
                            onClick={() => onUpdateStatus(order.id, OrderStatus.DELAYED)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                            title="Signaler Retard"
                          >
                            <AlertCircle size={18} />
                          </button>
                          <button 
                            onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Terminer"
                          >
                            <CheckSquare size={18} />
                          </button>
                         </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ORDER MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvel Ordre de Production">
        {/* ADDED SCROLLBAR CONTAINER */}
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du Produit</label>
                <input 
                required
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.productName}
                onChange={e => setFormData({...formData, productName: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input 
                required
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.reference}
                onChange={e => setFormData({...formData, reference: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité à produire</label>
                <input 
                required
                type="number" 
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={formData.quantityPlanned}
                onChange={e => setFormData({...formData, quantityPlanned: parseInt(e.target.value)})}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input 
                    required
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin prévue</label>
                <input 
                    required
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                />
                </div>
            </div>

            {/* Machines Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Machines Assignées</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded bg-gray-50 custom-scrollbar">
                    {machines.length === 0 && <span className="text-xs text-gray-400">Aucune machine configurée</span>}
                    {machines.map(m => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMachineSelection(m.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                                formData.assignedMachineIds.includes(m.id) 
                                ? 'bg-blue-600 text-white border-blue-600' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {m.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Operators Selection */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Personnel Assigné</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border p-2 rounded bg-gray-50 custom-scrollbar">
                    {operators.length === 0 && <span className="text-xs text-gray-400">Aucun personnel configuré</span>}
                    {operators.map(op => (
                        <button
                            key={op.id}
                            type="button"
                            onClick={() => toggleOperatorSelection(op.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                                formData.assignedOperatorIds.includes(op.id) 
                                ? 'bg-purple-600 text-white border-purple-600' 
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            {op.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 sticky bottom-0 bg-white">
                <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Créer l'ordre
                </button>
            </div>
            </form>
        </div>
      </Modal>

      {/* UPDATE QUANTITY MODAL */}
      <Modal isOpen={updateModalOpen} onClose={() => setUpdateModalOpen(false)} title="Déclarer Production">
         <div className="space-y-6 p-2">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
                <h3 className="text-lg font-bold text-gray-900">{selectedOrder?.productName}</h3>
                <p className="text-gray-500 text-sm mb-2">{selectedOrder?.id}</p>
                <div className="flex justify-center gap-8 text-sm">
                   <div className="flex flex-col">
                        <span className="text-gray-500 uppercase text-[10px] font-bold">Prévu</span>
                        <span className="font-bold text-gray-800">{selectedOrder?.quantityPlanned} u</span>
                   </div>
                   <div className="flex flex-col">
                        <span className="text-gray-500 uppercase text-[10px] font-bold">Réalisé</span>
                        <span className="font-bold text-blue-600">{selectedOrder?.quantityProduced} u</span>
                   </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nouvelle quantité totale produite</label>
                <div className="relative">
                    <input 
                        type="number" 
                        min="0" 
                        value={tempQuantity} 
                        onChange={(e) => setTempQuantity(parseInt(e.target.value))}
                        className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold text-gray-800"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 font-medium">unités</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Avancement calculé : <span className="font-bold text-blue-600">
                        {selectedOrder ? Math.min(100, Math.round((tempQuantity / selectedOrder.quantityPlanned) * 100)) : 0}%
                    </span>
                </p>
            </div>
            
            <button 
                onClick={handleUpdateSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
                Mettre à jour la production
            </button>
         </div>
      </Modal>
    </div>
  );
};
