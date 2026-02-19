
import React, { useState } from 'react';
import { TraceabilityEvent, ProductionOrder } from '../types';
import { Search, Package, Settings, CheckCircle, Truck, FileText, User } from 'lucide-react';

interface TraceabilityProps {
  events: TraceabilityEvent[];
  orders: ProductionOrder[];
}

export const Traceability: React.FC<TraceabilityProps> = ({ events, orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEvents = selectedOrder 
    ? events.filter(e => e.orderId === selectedOrder).sort((a,b) => a.timestamp.localeCompare(b.timestamp))
    : [];

  const getIcon = (type: string) => {
    switch(type) {
        case 'MATERIAL': return <Package size={20} />;
        case 'PROCESS': return <Settings size={20} />;
        case 'QUALITY': return <CheckCircle size={20} />;
        case 'DISPATCH': return <Truck size={20} />;
        default: return <FileText size={20} />;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
        case 'MATERIAL': return 'bg-blue-100 text-blue-600';
        case 'PROCESS': return 'bg-amber-100 text-amber-600';
        case 'QUALITY': return 'bg-purple-100 text-purple-600';
        case 'DISPATCH': return 'bg-green-100 text-green-600';
        default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Traçabilité Produit</h1>
        <p className="text-gray-500">Suivi de A à Z : Matières, Paramètres et Opérateurs</p>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Rechercher par ID OP, Référence Produit ou Lot..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-[500px] overflow-y-auto">
            <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                Résultats ({filteredOrders.length})
            </div>
            <div className="divide-y divide-gray-100">
                {filteredOrders.map(order => (
                    <div 
                        key={order.id} 
                        onClick={() => setSelectedOrder(order.id)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-blue-50 ${selectedOrder === order.id ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
                    >
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-gray-800">{order.id}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{order.status}</span>
                        </div>
                        <p className="text-sm text-blue-600 font-medium mt-1">{order.productName}</p>
                        <p className="text-xs text-gray-500 mt-1">Réf: {order.reference}</p>
                    </div>
                ))}
                {filteredOrders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">Aucune commande trouvée.</div>
                )}
            </div>
        </div>

        {/* Timeline Detail */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[500px] overflow-y-auto">
            {!selectedOrder ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>Sélectionnez une commande pour voir sa généalogie.</p>
                </div>
            ) : (
                <div>
                     <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Historique : {selectedOrder}</h2>
                        <button className="text-sm text-blue-600 hover:underline">Télécharger PDF</button>
                     </div>

                     <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {activeEvents.map((event, idx) => (
                            <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                
                                {/* Icon */}
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${getColor(event.type)}`}>
                                    {getIcon(event.type)}
                                </div>
                                
                                {/* Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 shadow-sm bg-white">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-slate-900">{event.description}</div>
                                        <time className="font-mono text-xs font-medium text-slate-500">{event.timestamp.split(' ')[1]}</time>
                                    </div>
                                    <div className="text-slate-500 text-sm mb-2">{event.timestamp.split(' ')[0]}</div>
                                    
                                    <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 space-y-1">
                                        <div className="flex items-center gap-2 mb-2 text-gray-800 font-medium border-b border-gray-200 pb-1">
                                            <User size={12} /> {event.actor}
                                        </div>
                                        {Object.entries(event.details).map(([key, value]) => (
                                            <div key={key} className="flex justify-between">
                                                <span className="text-gray-500">{key}:</span>
                                                <span className="font-mono">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                         {activeEvents.length === 0 && (
                             <p className="text-center text-gray-500 italic ml-10">Aucun événement tracé pour le moment.</p>
                         )}
                     </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
