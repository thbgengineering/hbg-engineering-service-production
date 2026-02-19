
import React, { useState, useMemo } from 'react';
import { ProductionOrder, OrderStatus } from '../types';
import { Calendar, Search, Package, ArrowRight } from 'lucide-react';

interface PlanningAPSProps {
  orders: ProductionOrder[];
  // machines prop removed as requested previously
  onScheduleOrder?: (orderId: string, machineId: string, startDate: string, dueDate: string) => void;
}

export const PlanningAPS: React.FC<PlanningAPSProps> = ({ orders }) => {
  // State for Time Navigation (Start Range)
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [startMonth, setStartMonth] = useState(new Date().getMonth()); // 0-11
  
  // State for Time Navigation (End Range) - Default to 3 months ahead
  const [endYear, setEndYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth() + 3);

  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. CALCULATE RANGE & VIEW MODE ---
  const { viewStartDate, viewEndDate, viewMode, columns } = useMemo(() => {
    const start = new Date(startYear, startMonth, 1);
    const end = new Date(endYear, endMonth + 1, 0);
    
    // Validation
    if (end < start) return { viewStartDate: start, viewEndDate: start, viewMode: 'day', columns: [] };

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let mode: 'day' | 'month' | 'year' = 'day';
    if (diffDays > 60 && diffDays <= 1825) mode = 'month'; // > 2 months and <= 5 years
    else if (diffDays > 1825) mode = 'year'; // > 5 years

    const cols: { label: string; date: Date; subLabel?: string }[] = [];
    const curr = new Date(start);

    if (mode === 'day') {
        while (curr <= end) {
            cols.push({
                label: curr.getDate().toString(),
                subLabel: curr.toLocaleString('default', { weekday: 'narrow' }),
                date: new Date(curr)
            });
            curr.setDate(curr.getDate() + 1);
        }
    } else if (mode === 'month') {
        // Snap to start of month
        curr.setDate(1);
        while (curr <= end) {
            cols.push({
                label: curr.toLocaleString('default', { month: 'short' }),
                subLabel: curr.getFullYear().toString(),
                date: new Date(curr)
            });
            curr.setMonth(curr.getMonth() + 1);
        }
    } else {
        // Year mode
        curr.setMonth(0, 1);
        while (curr <= end) {
            cols.push({
                label: curr.getFullYear().toString(),
                date: new Date(curr)
            });
            curr.setFullYear(curr.getFullYear() + 1);
        }
    }

    return { viewStartDate: start, viewEndDate: end, viewMode: mode, columns: cols };
  }, [startYear, startMonth, endYear, endMonth]);


  // --- 2. CONFIGURATION CONSTANTS ---
  const COLUMN_WIDTH = viewMode === 'day' ? 30 : viewMode === 'month' ? 60 : 80;

  // --- 3. FILTER ORDERS ---
  const visibleOrders = useMemo(() => {
    if (columns.length === 0) return [];

    return orders.filter(o => {
      if (!o.startDate || !o.dueDate) return false;
      const start = new Date(o.startDate);
      const end = new Date(o.dueDate);
      
      const matchesSearch = 
        o.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase());

      const overlapsRange = start <= viewEndDate && end >= viewStartDate;

      return overlapsRange && matchesSearch;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [orders, columns, searchTerm, viewStartDate, viewEndDate]);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PLANNED: return 'bg-slate-400 border-slate-500';
      case OrderStatus.IN_PROGRESS: return 'bg-blue-500 border-blue-600';
      case OrderStatus.COMPLETED: return 'bg-emerald-500 border-emerald-600';
      case OrderStatus.DELAYED: return 'bg-rose-500 border-rose-600';
      default: return 'bg-gray-400 border-gray-500';
    }
  };

  // --- 4. POSITIONING LOGIC ---
  const getBarStyles = (order: ProductionOrder) => {
    if (columns.length === 0) return { display: 'none' };

    const start = new Date(order.startDate);
    const end = new Date(order.dueDate);
    end.setHours(23, 59, 59); 

    // Clamp dates to view range
    const effectiveStart = start < viewStartDate ? viewStartDate : start;
    const effectiveEnd = end > viewEndDate ? viewEndDate : end;

    if (effectiveEnd < effectiveStart) return { display: 'none' };

    let left = 0;
    let width = 0;

    if (viewMode === 'day') {
        const msPerDay = 1000 * 60 * 60 * 24;
        const diffTimeStart = effectiveStart.getTime() - viewStartDate.getTime();
        const diffStartDays = diffTimeStart / msPerDay;
        const durationDays = (effectiveEnd.getTime() - effectiveStart.getTime()) / msPerDay;
        
        left = diffStartDays * COLUMN_WIDTH;
        width = Math.max(durationDays, 0.9) * COLUMN_WIDTH; // Min width ~1 day
    } 
    else if (viewMode === 'month') {
        // Calculate Month Difference + partial month offset
        const startTotalMonths = (effectiveStart.getFullYear() - viewStartDate.getFullYear()) * 12 + (effectiveStart.getMonth() - viewStartDate.getMonth());
        const daysInStartMonth = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth() + 1, 0).getDate();
        const startOffset = effectiveStart.getDate() / daysInStartMonth;
        
        const endTotalMonths = (effectiveEnd.getFullYear() - viewStartDate.getFullYear()) * 12 + (effectiveEnd.getMonth() - viewStartDate.getMonth());
        const daysInEndMonth = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth() + 1, 0).getDate();
        const endOffset = effectiveEnd.getDate() / daysInEndMonth;

        const totalDurationMonths = (endTotalMonths + endOffset) - (startTotalMonths + startOffset);

        left = (startTotalMonths + startOffset) * COLUMN_WIDTH;
        // Fix layout shift: shift left by 1 column width offset if needed, but here we start from 0 relative to container
        // Actually, since we render columns from index 0, left=0 is correct for first month.
        
        width = Math.max(totalDurationMonths, 0.1) * COLUMN_WIDTH;
    } 
    else {
        // Year Mode
        const startTotalYears = (effectiveStart.getFullYear() - viewStartDate.getFullYear());
        const startOffset = (effectiveStart.getMonth() * 30 + effectiveStart.getDate()) / 365; // Approx
        
        const endTotalYears = (effectiveEnd.getFullYear() - viewStartDate.getFullYear());
        const endOffset = (effectiveEnd.getMonth() * 30 + effectiveEnd.getDate()) / 365;

        const totalDurationYears = (endTotalYears + endOffset) - (startTotalYears + startOffset);

        left = (startTotalYears + startOffset) * COLUMN_WIDTH;
        width = Math.max(totalDurationYears, 0.1) * COLUMN_WIDTH;
    }

    return {
      left: `${left}px`,
      width: `${width}px`
    };
  };

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const handleMonthChange = (type: 'start' | 'end', value: number) => {
      if (type === 'start') setStartMonth(value);
      else setEndMonth(value);
  };

  const handleYearChange = (type: 'start' | 'end', value: number) => {
      if (type === 'start') setStartYear(value);
      else setEndYear(value);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Planning & Ordonnancement (APS)</h1>
          <p className="text-gray-500">Vue Gantt dynamique ({viewMode === 'day' ? 'Journalière' : viewMode === 'month' ? 'Mensuelle' : 'Annuelle'})</p>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
             {/* Search Box */}
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Filtrer produits..." 
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
             </div>

             {/* Time Range Selector */}
             <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 gap-2">
                <div className="flex items-center gap-2 px-2">
                    <Calendar size={18} className="text-blue-600" />
                    <span className="text-xs font-bold text-gray-500 uppercase">Du:</span>
                    <select 
                        value={startMonth} 
                        onChange={(e) => handleMonthChange('start', parseInt(e.target.value))}
                        className="text-sm font-bold text-gray-800 bg-transparent outline-none cursor-pointer hover:bg-gray-50 rounded"
                    >
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select 
                        value={startYear} 
                        onChange={(e) => handleYearChange('start', parseInt(e.target.value))}
                        className="text-sm font-bold text-gray-800 bg-transparent outline-none cursor-pointer hover:bg-gray-50 rounded"
                    >
                        {Array.from({length: 10}, (_, i) => 2022 + i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <ArrowRight size={14} className="text-gray-400" />

                <div className="flex items-center gap-2 px-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">Au:</span>
                    <select 
                        value={endMonth} 
                        onChange={(e) => handleMonthChange('end', parseInt(e.target.value))}
                        className="text-sm font-bold text-blue-600 bg-transparent outline-none cursor-pointer hover:bg-gray-50 rounded"
                    >
                        {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <select 
                        value={endYear} 
                        onChange={(e) => handleYearChange('end', parseInt(e.target.value))}
                        className="text-sm font-bold text-blue-600 bg-transparent outline-none cursor-pointer hover:bg-gray-50 rounded"
                    >
                        {Array.from({length: 10}, (_, i) => 2022 + i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
             </div>
        </div>
      </div>

      {/* Validation Error */}
      {columns.length === 0 && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 text-center font-medium">
              La date de fin doit être postérieure à la date de début.
          </div>
      )}

      {/* GANTT CONTAINER */}
      {columns.length > 0 && (
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-[500px]">
        
        {/* HEADER ROW */}
        <div className="flex border-b border-gray-200 bg-gray-50 z-10">
            <div className="w-72 flex-shrink-0 p-4 border-r border-gray-200 font-bold text-gray-700 bg-gray-50 sticky left-0 z-20 flex items-center shadow-sm">
                PRODUIT / OP
            </div>
            <div className="flex overflow-hidden">
                {columns.map((col, i) => {
                    const isNewPeriod = 
                        (viewMode === 'day' && col.date.getDate() === 1) || 
                        (viewMode === 'month' && col.date.getMonth() === 0);

                    return (
                        <div 
                            key={i} 
                            className={`flex-shrink-0 border-r border-gray-100 p-2 text-center flex flex-col justify-center relative ${isNewPeriod ? 'border-l-2 border-l-gray-300' : ''}`}
                            style={{ width: `${COLUMN_WIDTH}px` }}
                        >
                            {isNewPeriod && (
                                <span className="absolute top-0 left-1 text-[9px] font-bold bg-gray-200 px-1 rounded shadow-sm whitespace-nowrap z-10">
                                    {viewMode === 'day' ? col.date.toLocaleString('default', {month: 'long', year: 'numeric'}) : col.date.getFullYear()}
                                </span>
                            )}
                            <span className="text-xs font-bold text-gray-600">
                                {col.label}
                            </span>
                            {col.subLabel && (
                                <span className="text-[9px] text-gray-400 mt-0.5 uppercase">
                                    {col.subLabel}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative">
            <div style={{ width: `${288 + (columns.length * COLUMN_WIDTH)}px` }}>
                {visibleOrders.length === 0 ? (
                    <div className="p-10 text-center text-gray-400 italic w-full sticky left-0">
                        Aucun ordre de production sur cette période.
                    </div>
                ) : (
                    visibleOrders.map((order) => (
                        <div key={order.id} className="flex group hover:bg-blue-50/30 transition-colors relative border-b border-gray-50 h-16">
                            
                            {/* Product Column (Sticky Left) */}
                            <div className="w-72 flex-shrink-0 px-4 py-2 border-r border-gray-200 bg-white group-hover:bg-blue-50/30 sticky left-0 z-10 flex flex-col justify-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="font-bold text-gray-800 text-sm truncate flex items-center gap-2">
                                    <Package size={14} className="text-gray-400"/>
                                    {order.productName}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 rounded">{order.id}</span>
                                    <span className="text-[10px] text-gray-400">{order.quantityPlanned} u</span>
                                </div>
                            </div>

                            {/* Timeline Grid Background */}
                            <div className="relative flex h-full">
                                {columns.map((col, i) => {
                                    const isNewPeriod = 
                                        (viewMode === 'day' && col.date.getDate() === 1) || 
                                        (viewMode === 'month' && col.date.getMonth() === 0);
                                    return (
                                        <div 
                                            key={i} 
                                            className={`flex-shrink-0 border-r border-gray-50 h-full ${isNewPeriod ? 'border-l-2 border-l-gray-200' : ''}`}
                                            style={{ width: `${COLUMN_WIDTH}px` }}
                                        />
                                    );
                                })}

                                {/* The Gantt Bar */}
                                <div 
                                    className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md shadow-sm border flex flex-col justify-center overflow-hidden hover:brightness-110 cursor-pointer transition-all group/bar ${getStatusColor(order.status)}`}
                                    style={getBarStyles(order)}
                                    title={`${order.productName} (${order.progress}%) - Du ${order.startDate} au ${order.dueDate}`}
                                >
                                    {/* Progress Fill */}
                                    <div 
                                        className="absolute left-0 top-0 bottom-0 bg-white/20" 
                                        style={{ width: `${order.progress}%` }}
                                    ></div>
                                    
                                    {/* Label inside bar */}
                                    <div className="relative px-2 text-white text-xs font-bold whitespace-nowrap overflow-hidden truncate z-10">
                                        {order.progress}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
        
        {/* Legend Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 flex gap-6 text-xs font-medium text-gray-600 overflow-x-auto sticky bottom-0 z-30">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-400"></div> Planifié</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div> En Cours</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500"></div> Terminé</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-rose-500"></div> En Retard</div>
            <div className="ml-auto text-gray-400">Mode: {viewMode.toUpperCase()}</div>
        </div>
      </div>
      )}
    </div>
  );
};
