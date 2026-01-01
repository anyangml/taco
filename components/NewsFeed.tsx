import React, { useMemo } from 'react';
import { GameEvent } from '../types';
import { Loader2, Camera } from 'lucide-react';

interface NewsFeedProps {
  event: GameEvent | null;
  loading: boolean;
}

const PAPER_NAMES = [
  "THE DAILY TWIT",
  "THE WASHINGTON BOAST",
  "FOXES NEWS",
  "NEW YORK CRIMES",
  "THE WALL STREET JOURNALISM",
  "INFO WARS WEEKLY"
];

const ROTATIONS = ["rotate-1", "-rotate-1", "rotate-0"];

export const NewsFeed: React.FC<NewsFeedProps> = ({ event, loading }) => {
  const paperStyle = useMemo(() => {
    if (!event) return {};
    return {
      name: PAPER_NAMES[Math.floor(Math.random() * PAPER_NAMES.length)],
      rotation: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      price: `$${(Math.random() * 5 + 1).toFixed(2)}`
    };
  }, [event]);

  if (loading && !event) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-xl border-4 border-slate-900 flex flex-col items-center justify-center h-[400px]">
        <div className="relative w-24 h-24 mb-6">
           <Loader2 className="animate-spin text-slate-900 absolute inset-0" size={96} strokeWidth={1} />
        </div>
        <p className="text-slate-900 font-black text-2xl uppercase tracking-[0.2em] animate-pulse">
            Developing the narrative...
        </p>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className={`transform ${paperStyle.rotation} transition-all duration-700 mb-8`}>
        <div className="bg-white text-slate-900 shadow-2xl border border-slate-400 relative overflow-hidden ring-1 ring-black/5">
            {/* Ink Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-linen.png')]"></div>

            {/* Header */}
            <div className="border-b-8 border-double border-black p-4 flex flex-col items-center">
                <div className="w-full flex justify-between text-[10px] font-serif font-black border-b border-black/20 pb-1 mb-2">
                    <span>ESTABLISHED 2024</span>
                    <span>{paperStyle.date}</span>
                    <span>PRICE: {paperStyle.price}</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black font-serif uppercase tracking-tighter leading-none text-center">
                    {paperStyle.name}
                </h1>
                <div className="w-full h-1 bg-black mt-2"></div>
            </div>

            {/* Content Section */}
            <div className="p-4 md:p-10 grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-12">
                    <h2 className="text-4xl md:text-6xl font-black font-sans leading-[0.9] mb-6 uppercase tracking-tight decoration-red-600 decoration-4">
                        {event.headline}
                    </h2>
                    <div className="columns-1 md:columns-2 gap-10 text-xl font-serif leading-relaxed text-slate-900 text-justify">
                        <span className="text-7xl font-black float-left mr-3 mt-1 leading-[0.8]">{event.description.charAt(0)}</span>
                        {event.description.slice(1)}
                    </div>
                </div>

                <div className="md:col-span-12">
                    <div className="bg-red-50 p-6 border-2 border-red-900/20 shadow-sm mt-4">
                        <h3 className="font-black uppercase border-b-2 border-red-900/10 mb-3 text-sm text-red-900 tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                            Live Market Forecast
                        </h3>
                        <p className="font-mono text-lg leading-tight text-red-800 font-bold uppercase italic">
                           "{event.impactForecast}"
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};