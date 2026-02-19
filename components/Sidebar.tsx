
import React from 'react';
import { LayoutDashboard, ClipboardList, Settings, Package, Users, BarChart2, Calendar, FileText, Search } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
    { id: 'production', label: 'Production (OP)', icon: ClipboardList },
    { id: 'planning', label: 'Planning APS', icon: Calendar },
    { id: 'process', label: 'Gammes & Process', icon: FileText },
    { id: 'machines', label: 'Machines', icon: Settings },
    { id: 'inventory', label: 'Stocks', icon: Package },
    { id: 'quality', label: 'Qualité', icon: BarChart2 },
    { id: 'traceability', label: 'Traçabilité', icon: Search },
    { id: 'personnel', label: 'Personnel', icon: Users },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen bg-slate-900 text-white shadow-xl z-50 flex flex-col transition-all duration-300 ease-in-out w-20 hover:w-64 group overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 whitespace-nowrap">
        <div className="min-w-[24px]">
          
          <div className="w-11 h-11 flex items-center justify-center">
            <img 
              src="HBG.png" 
              alt="Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
        <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            HBG engineering
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider">Innovation and Integrity</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="min-w-[24px] flex justify-center">
                <Icon size={22} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              </div>
              <span className="ml-3 font-medium text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75">
                {item.label}
              </span>
              
              {/* Tooltip for collapsed state (optional/fallback) */}
              {!isActive && (
                <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:visible group-hover:opacity-0 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Profile */}
      <div className="p-4 border-t border-slate-800 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs min-w-[40px]">
            RP
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="text-sm font-medium">Production</div>
            <div className="text-xs text-slate-500">Admin Responsable</div>
          </div>
        </div>
      </div>
    </div>
  );
};
