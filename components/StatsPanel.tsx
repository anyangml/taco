import React from 'react';
import { PlayerStats } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Users, Drumstick } from 'lucide-react';

interface StatsPanelProps {
  stats: PlayerStats;
  netWorth: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, netWorth }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-gradient-to-br from-green-500 to-emerald-700 p-4 rounded-xl text-white shadow-lg">
        <div className="flex items-center space-x-2 opacity-80 mb-1">
          <DollarSign size={18} />
          <span className="text-sm font-bold uppercase">Liquid Cash</span>
        </div>
        <div className="text-2xl font-black">${stats.cash.toLocaleString()}</div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-4 rounded-xl text-white shadow-lg">
        <div className="flex items-center space-x-2 opacity-80 mb-1">
          <TrendingUp size={18} />
          <span className="text-sm font-bold uppercase">Net Worth</span>
        </div>
        <div className="text-2xl font-black">${netWorth.toLocaleString()}</div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-rose-700 p-4 rounded-xl text-white shadow-lg">
        <div className="flex items-center space-x-2 opacity-80 mb-1">
          <Users size={18} />
          <span className="text-sm font-bold uppercase">Approval</span>
        </div>
        <div className="text-2xl font-black">{stats.approval}%</div>
      </div>

      <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-xl text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center space-x-2 opacity-80 mb-1 z-10 relative">
          <Drumstick size={18} />
          <span className="text-sm font-bold uppercase text-black">TACO Meter</span>
        </div>
        <div className="text-2xl font-black text-black z-10 relative">
            {stats.tacoMeter > 50 ? 'CHICKEN' : 'BOLD'} ({stats.tacoMeter}%)
        </div>
        <div 
            className="absolute bottom-0 left-0 h-2 bg-black opacity-20 transition-all duration-500" 
            style={{ width: `${stats.tacoMeter}%` }}
        />
      </div>
    </div>
  );
};