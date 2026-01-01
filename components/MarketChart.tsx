import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MarketData } from '../types';

interface MarketChartProps {
  history: { turn: number; market: MarketData }[];
}

export const MarketChart: React.FC<MarketChartProps> = ({ history }) => {
  const data = history.map(h => ({
    name: `T${h.turn}`,
    Tech: h.market.tech,
    Energy: h.market.energy,
    RealEstate: h.market.realEstate,
    Crypto: h.market.crypto,
  }));

  return (
    <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-slate-200">
      <h3 className="text-xl font-bold mb-4 text-slate-800 uppercase tracking-tighter">Market Trends</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Tech" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Energy" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="RealEstate" stroke="#10b981" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Crypto" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};