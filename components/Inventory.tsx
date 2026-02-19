
import React, { useState } from 'react';
import { Material } from '../types';
import { Package, AlertTriangle, Plus } from 'lucide-react';
import { Modal } from './Modal';

interface InventoryProps {
  materials: Material[];
  onAddMaterial: (material: Omit<Material, 'id'>) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ materials, onAddMaterial }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    stock: 0,
    unit: 'kg',
    minThreshold: 0,
    unitCost: 0
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMaterial(formData);
    setFormData({ name: '', stock: 0, unit: 'kg', minThreshold: 0, unitCost: 0 });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stocks & Matières</h1>
          <p className="text-gray-500">Suivi des niveaux de stock et alertes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvelle Matière
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-sm font-semibold text-gray-500">Matière</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Stock Actuel</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Coût Unitaire</th>
              <th className="p-4 text-sm font-semibold text-gray-500">Seuil Min.</th>
              <th className="p-4 text-sm font-semibold text-gray-500">État</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.map((mat) => {
              const isLow = mat.stock <= mat.minThreshold;
              return (
                <tr key={mat.id}>
                  <td className="p-4 flex items-center gap-3">
                    <div className="bg-indigo-50 p-2 rounded text-indigo-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{mat.name}</div>
                      <div className="text-xs text-gray-500">{mat.id}</div>
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800">
                    {mat.stock} <span className="text-gray-500 text-sm">{mat.unit}</span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {mat.unitCost?.toLocaleString()} MAD
                  </td>
                  <td className="p-4 text-gray-600">
                    {mat.minThreshold} <span className="text-gray-400 text-sm">{mat.unit}</span>
                  </td>
                  <td className="p-4">
                    {isLow ? (
                      <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-semibold w-fit">
                        <AlertTriangle size={12} /> Stock Critique
                      </span>
                    ) : (
                      <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-semibold">
                        OK
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter une Matière Première">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la matière</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock initial</label>
              <input 
                required
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
              >
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="u">unités</option>
                <option value="m">m</option>
                <option value="m2">m²</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coût Unitaire (MAD)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  value={formData.unitCost}
                  onChange={e => setFormData({...formData, unitCost: parseFloat(e.target.value)})}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seuil d'alerte (Min)</label>
                <input 
                  required
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  value={formData.minThreshold}
                  onChange={e => setFormData({...formData, minThreshold: parseFloat(e.target.value)})}
                />
             </div>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Enregistrer le stock
          </button>
        </form>
      </Modal>
    </div>
  );
};
