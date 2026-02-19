
import React, { useState, useMemo } from 'react';
import { Operator } from '../types';
import { Users, Plus, User, DollarSign, Trash2, Briefcase, Clock, Activity } from 'lucide-react';
import { Modal } from './Modal';

interface PersonnelProps {
  operators: Operator[];
  onAddOperator: (op: Omit<Operator, 'id' | 'present'>) => void;
  onDeleteOperator: (id: string) => void;
}

export const Personnel: React.FC<PersonnelProps> = ({ operators, onAddOperator, onDeleteOperator }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    shift: 'Matin' as const,
    skills: '', // Comma separated string for input
    salary: ''
  });

  // --- Statistics Calculations ---
  const stats = useMemo(() => {
    const totalOperators = operators.length;
    const presentOperators = operators.filter(op => op.present).length;
    const totalSalary = operators.reduce((acc, op) => acc + (op.salary || 0), 0);
    
    const shifts = {
      Matin: operators.filter(op => op.shift === 'Matin').length,
      ApresMidi: operators.filter(op => op.shift === 'Après-midi').length,
      Nuit: operators.filter(op => op.shift === 'Nuit').length,
    };

    const roles = operators.reduce((acc, op) => {
      acc[op.role] = (acc[op.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get top 3 roles
    const topRoles = Object.entries(roles)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return { totalOperators, presentOperators, totalSalary, shifts, topRoles };
  }, [operators]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOperator({
      name: formData.name,
      role: formData.role,
      shift: formData.shift,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
      salary: formData.salary
    });
    setFormData({ name: '', role: '', shift: 'Matin', skills: '', salary: 2000 });
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} de la liste du personnel ?`)) {
      onDeleteOperator(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personnel</h1>
          <p className="text-gray-500">Gestion des équipes et des compétences</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
        >
          <Plus size={18} />
          Nouvel Employé
        </button>
      </div>

      {/* --- HR DASHBOARD SUMMARY --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Effectif */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
               <Users size={20} />
             </div>
             <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
               {Math.round((stats.presentOperators / (stats.totalOperators || 1)) * 100)}% Présents
             </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Effectif Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalOperators}</p>
          </div>
        </div>

        {/* Card 2: Salaires */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
             <div className="p-2 bg-green-50 rounded-lg text-green-600">
               <DollarSign size={20} />
             </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Masse Salariale Mensuelle</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalSalary.toLocaleString()} MAD</p>
          </div>
        </div>

        {/* Card 3: Équipes */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-blue-500" />
            <p className="text-sm font-bold text-gray-700">Répartition Équipes</p>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Matin</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-blue-400 h-1.5 rounded-full" style={{width: `${(stats.shifts.Matin / (stats.totalOperators || 1)) * 100}%`}}></div>
                </div>
                <span className="font-bold">{stats.shifts.Matin}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Après-midi</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-orange-400 h-1.5 rounded-full" style={{width: `${(stats.shifts.ApresMidi / (stats.totalOperators || 1)) * 100}%`}}></div>
                </div>
                <span className="font-bold">{stats.shifts.ApresMidi}</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Nuit</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-indigo-400 h-1.5 rounded-full" style={{width: `${(stats.shifts.Nuit / (stats.totalOperators || 1)) * 100}%`}}></div>
                </div>
                <span className="font-bold">{stats.shifts.Nuit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Rôles */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase size={16} className="text-gray-500" />
            <p className="text-sm font-bold text-gray-700">Top Postes</p>
          </div>
          <div className="space-y-2">
             {stats.topRoles.length > 0 ? (
               stats.topRoles.map(([role, count], idx) => (
                 <div key={role} className="flex justify-between items-center text-xs">
                   <span className="text-gray-600 truncate max-w-[120px]" title={role}>{idx + 1}. {role}</span>
                   <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{count}</span>
                 </div>
               ))
             ) : (
               <span className="text-xs text-gray-400">Aucune donnée</span>
             )}
          </div>
        </div>
      </div>

      {/* --- OPERATOR LIST --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {operators.map(op => (
          <div key={op.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between relative group">
             <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-50 p-3 rounded-full text-purple-600">
                        <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{op.name}</h3>
                      <p className="text-sm text-gray-500">{op.role}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className={`px-2 py-1 rounded text-xs font-bold ${op.present ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {op.present ? 'Présent' : 'Absent'}
                   </div>
                   <button 
                      onClick={() => handleDelete(op.id, op.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>
             </div>
             
             <div className="space-y-2">
                  <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Équipe</span>
                      <span className="font-medium">{op.shift}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Salaire</span>
                      <span className="font-medium">{op.salary?.toLocaleString()} MAD</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-gray-400 block mb-1">Compétences</span>
                    <div className="flex gap-1 flex-wrap">
                        {op.skills.map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 border border-gray-200">
                                {skill}
                            </span>
                        ))}
                    </div>
                  </div>
             </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un Employé">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle / Poste</label>
                <input 
                required
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salaire (MAD)</label>
                <input 
                required
                type="number" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                value={formData.salary}
                onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})}
                />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Équipe (Shift)</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              value={formData.shift}
              onChange={e => setFormData({...formData, shift: e.target.value as any})}
            >
                <option value="Matin">Matin</option>
                <option value="Après-midi">Après-midi</option>
                <option value="Nuit">Nuit</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Compétences (séparées par des virgules)</label>
            <input 
              type="text" 
              placeholder="Ex: Soudure, CNC, Montage"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors">
            Ajouter l'opérateur
          </button>
        </form>
      </Modal>
    </div>
  );
};
