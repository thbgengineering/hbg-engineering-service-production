import React, { useState } from 'react';
import { QualityReport, ProductionOrder } from '../types';
import { BarChart2, CheckCircle, XCircle, Plus, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { StatCard } from './StatCard';

interface QualityControlProps {
  reports: QualityReport[];
  orders: ProductionOrder[];
  onAddReport: (report: Omit<QualityReport, 'id' | 'date'>) => void;
}

export const QualityControl: React.FC<QualityControlProps> = ({ reports, orders, onAddReport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    checkedQuantity: 0,
    rejectedQuantity: 0,
    defectReason: '',
    inspector: ''
  });

  const totalChecked = reports.reduce((acc, r) => acc + r.checkedQuantity, 0);
  const totalRejected = reports.reduce((acc, r) => acc + r.rejectedQuantity, 0);
  const defectRate = totalChecked > 0 ? ((totalRejected / totalChecked) * 100).toFixed(2) : "0";

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddReport(formData);
    setFormData({ orderId: '', checkedQuantity: 0, rejectedQuantity: 0, defectReason: '', inspector: '' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contrôle Qualité</h1>
          <p className="text-gray-500">Suivi des non-conformités et inspections</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Nouveau Contrôle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
            title="Pièces Contrôlées" 
            value={totalChecked} 
            icon={CheckCircle} 
            color="blue"
        />
        <StatCard 
            title="Pièces Rejetées" 
            value={totalRejected} 
            icon={XCircle} 
            color="red"
        />
        <StatCard 
            title="Taux de Rejet Global" 
            value={`${defectRate}%`} 
            icon={AlertTriangle} 
            color={parseFloat(defectRate) > 5 ? "red" : "green"}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Historique des inspections</h3>
        </div>
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
                <th className="p-4 text-sm font-semibold text-gray-500">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-500">OP Référence</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Inspecteur</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Contrôlé</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Rejets</th>
                <th className="p-4 text-sm font-semibold text-gray-500">Statut</th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
            {reports.map(qc => {
                const rate = (qc.rejectedQuantity / qc.checkedQuantity) * 100;
                const isBad = rate > 0;
                return (
                <tr key={qc.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-600 text-sm">{qc.date}</td>
                    <td className="p-4 font-medium text-blue-600">{qc.orderId}</td>
                    <td className="p-4 text-gray-800">{qc.inspector}</td>
                    <td className="p-4 text-gray-600">{qc.checkedQuantity}</td>
                    <td className="p-4 font-bold text-rose-600">{qc.rejectedQuantity}</td>
                    <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold border ${isBad ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                            {isBad ? `Non-Conforme (${qc.defectReason})` : 'Conforme'}
                        </span>
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer un Contrôle Qualité">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordre de Production</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              value={formData.orderId}
              onChange={e => setFormData({...formData, orderId: e.target.value})}
            >
                <option value="">Sélectionner un OP...</option>
                {orders.map(o => (
                    <option key={o.id} value={o.id}>{o.id} - {o.productName}</option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qté Contrôlée</label>
                <input 
                required
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                value={formData.checkedQuantity}
                onChange={e => setFormData({...formData, checkedQuantity: parseInt(e.target.value)})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qté Rejetée</label>
                <input 
                required
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
                value={formData.rejectedQuantity}
                onChange={e => setFormData({...formData, rejectedQuantity: parseInt(e.target.value)})}
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Raison du défaut (si rejet)</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              value={formData.defectReason}
              onChange={e => setFormData({...formData, defectReason: e.target.value})}
              placeholder="Ex: Rayures, Dimensions incorrectes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inspecteur</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              value={formData.inspector}
              onChange={e => setFormData({...formData, inspector: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-rose-600 text-white py-2.5 rounded-lg font-medium hover:bg-rose-700 transition-colors">
            Valider le rapport
          </button>
        </form>
      </Modal>
    </div>
  );
};