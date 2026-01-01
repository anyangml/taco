
import React, { useState, useEffect } from 'react';
import { GamePhase, GameEvent, GameChoice, MarketData, PlayerStats, TurnResult } from './types';
import { evaluateTurn, generateFullGameTurn } from './services/gemini';
import { MarketChart } from './components/MarketChart';
import { StatsPanel } from './components/StatsPanel';
import { NewsFeed } from './components/NewsFeed';
import { TweetDeck } from './components/TweetDeck';
import { History, TrendingUp, TrendingDown, RefreshCw, BarChart3, MessageSquareText } from 'lucide-react';

// Initial Constants
const INITIAL_STATS: PlayerStats = {
  cash: 1000000,
  approval: 50,
  tacoMeter: 0,
  portfolio: { tech: 0, energy: 0, realEstate: 0, crypto: 0 },
};

const INITIAL_MARKET: MarketData = {
  tech: 100,
  energy: 100,
  realEstate: 100,
  crypto: 100,
};

const App: React.FC = () => {
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START);
  const [stats, setStats] = useState<PlayerStats>(INITIAL_STATS);
  const [market, setMarket] = useState<MarketData>(INITIAL_MARKET);
  const [marketHistory, setMarketHistory] = useState<{ turn: number; market: MarketData }[]>([
    { turn: 0, market: INITIAL_MARKET }
  ]);
  
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [turnResult, setTurnResult] = useState<TurnResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // New state for insider trading
  const [tradeAmount, setTradeAmount] = useState<number>(0);
  const [selectedSector, setSelectedSector] = useState<keyof MarketData>('tech');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  // Load initial event
  useEffect(() => {
    startNewTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewTurn = async () => {
    setLoading(true);
    setPhase(GamePhase.TRADING);
    setTurnResult(null);
    setCurrentEvent(null);
    
    try {
      // Use the faster multimodal call that gets text and image in one go
      const eventWithImage = await generateFullGameTurn(turn, stats);
      setCurrentEvent(eventWithImage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = () => {
    const cost = tradeAmount * market[selectedSector];
    
    if (tradeType === 'BUY') {
      if (stats.cash >= cost) {
        setStats(prev => ({
          ...prev,
          cash: prev.cash - cost,
          portfolio: {
            ...prev.portfolio,
            [selectedSector]: prev.portfolio[selectedSector] + tradeAmount
          }
        }));
      } else {
        alert("You're broke! Can't buy.");
      }
    } else {
      if (stats.portfolio[selectedSector] >= tradeAmount) {
        setStats(prev => ({
          ...prev,
          cash: prev.cash + cost,
          portfolio: {
            ...prev.portfolio,
            [selectedSector]: prev.portfolio[selectedSector] - tradeAmount
          }
        }));
      } else {
        alert("You don't own that many stonks.");
      }
    }
  };

  const handleAction = async (choice: GameChoice, customTweet: string | null) => {
    if (!currentEvent) return;
    setLoading(true);
    
    try {
      const result = await evaluateTurn(currentEvent, choice, customTweet, market);
      setTurnResult(result);
      
      const newMarket: MarketData = {
        tech: Math.max(1, Math.round(market.tech * (1 + (result.marketImpact.tech || 0) / 100))),
        energy: Math.max(1, Math.round(market.energy * (1 + (result.marketImpact.energy || 0) / 100))),
        realEstate: Math.max(1, Math.round(market.realEstate * (1 + (result.marketImpact.realEstate || 0) / 100))),
        crypto: Math.max(1, Math.round(market.crypto * (1 + (result.marketImpact.crypto || 0) / 100))),
      };
      
      setMarket(newMarket);
      setMarketHistory(prev => [...prev, { turn, market: newMarket }]);
      
      setStats(prev => ({
        ...prev,
        approval: Math.min(100, Math.max(0, prev.approval + (result.approvalChange || 0))),
        tacoMeter: Math.min(100, Math.max(0, prev.tacoMeter + (result.tacoChange || 0))),
      }));

      setPhase(GamePhase.RESULTS);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const advanceTurn = () => {
    setTurn(t => t + 1);
    startNewTurn();
  };

  const calculateNetWorth = () => {
    const portfolioValue = 
      stats.portfolio.tech * market.tech +
      stats.portfolio.energy * market.energy +
      stats.portfolio.realEstate * market.realEstate +
      stats.portfolio.crypto * market.crypto;
    return stats.cash + portfolioValue;
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-black tracking-widest text-yellow-400">
            TACO <span className="text-white text-sm font-normal opacity-70 ml-2 hidden sm:inline text-nowrap">Trump Always Chicken Out</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="bg-slate-800 px-3 py-1 rounded-full text-sm font-mono">Turn: {turn}</span>
            <div className="bg-red-600 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide">
              {phase === GamePhase.TRADING ? 'Trading' : phase === GamePhase.RESULTS ? 'Reaction' : 'TWEETING'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <StatsPanel stats={stats} netWorth={calculateNetWorth()} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {phase !== GamePhase.RESULTS && (
              <NewsFeed event={currentEvent} loading={loading && !currentEvent} />
            )}

            {phase === GamePhase.RESULTS && turnResult && (
              <div className="bg-white border-4 border-slate-900 p-6 shadow-xl rounded-lg animate-fade-in space-y-6">
                 <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2">
                    <History size={24} className="text-blue-600" />
                    <h2 className="text-2xl font-bold uppercase">The Aftermath</h2>
                 </div>
                 
                 <div className="bg-slate-50 p-6 rounded-xl border-l-8 border-blue-500 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 text-blue-600 font-bold uppercase text-xs tracking-widest">
                        <MessageSquareText size={16} />
                        Truth Social Post
                    </div>
                    <p className="italic text-xl text-slate-800 font-serif leading-relaxed">
                        "{turnResult.tweet}"
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase text-slate-400 flex items-center gap-2">
                            <BarChart3 size={16} /> Market Logic
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm leading-relaxed text-slate-700">
                            {turnResult.marketAnalysis}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase text-slate-400">Impact Stats</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white border border-slate-200 rounded shadow-sm">
                                <span className="block text-[10px] text-slate-500 uppercase font-bold">Approval</span>
                                <span className={`text-lg font-black ${turnResult.approvalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {turnResult.approvalChange > 0 ? '+' : ''}{turnResult.approvalChange}%
                                </span>
                            </div>
                            <div className="p-3 bg-white border border-slate-200 rounded shadow-sm">
                                <span className="block text-[10px] text-slate-500 uppercase font-bold">Pundit View</span>
                                <span className="text-xs font-medium block leading-tight">{turnResult.analysis}</span>
                            </div>
                        </div>
                        
                        <div className="bg-slate-900 text-white p-3 rounded text-xs font-mono">
                           <div className="grid grid-cols-2 gap-2">
                                {Object.entries(turnResult.marketImpact || {}).map(([sector, impact]) => (
                                    <div key={sector} className="flex justify-between">
                                        <span className="uppercase opacity-60">{sector}:</span>
                                        <span className={(impact as number) >= 0 ? 'text-green-400' : 'text-red-400'}>
                                            {(impact as number) > 0 ? '+' : ''}{impact as number}%
                                        </span>
                                    </div>
                                ))}
                           </div>
                        </div>
                    </div>
                 </div>

                 <button 
                    onClick={advanceTurn}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg uppercase tracking-widest flex items-center justify-center gap-2"
                 >
                    Next Turn <RefreshCw size={18} />
                 </button>
              </div>
            )}

            {phase === GamePhase.TRADING && !loading && (
              <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <RefreshCw className="text-slate-400" /> Insider Trading Desk
                  </h3>
                  <button 
                    onClick={() => setPhase(GamePhase.TWEETING)}
                    className="text-sm bg-slate-900 text-white px-4 py-2 rounded hover:bg-slate-700"
                  >
                    Post Truth Social &rarr;
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Sector</label>
                    <select 
                        value={selectedSector} 
                        onChange={(e) => setSelectedSector(e.target.value as keyof MarketData)}
                        className="w-full p-2 border rounded font-mono"
                    >
                        <option value="tech">Tech (${market.tech})</option>
                        <option value="energy">Energy (${market.energy})</option>
                        <option value="realEstate">Real Estate (${market.realEstate})</option>
                        <option value="crypto">Crypto (${market.crypto})</option>
                    </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Action</label>
                     <div className="flex bg-white rounded border overflow-hidden">
                        <button 
                            onClick={() => setTradeType('BUY')}
                            className={`flex-1 py-2 text-sm font-bold ${tradeType === 'BUY' ? 'bg-green-100 text-green-700' : 'text-slate-500'}`}
                        >
                            BUY
                        </button>
                        <button 
                            onClick={() => setTradeType('SELL')}
                            className={`flex-1 py-2 text-sm font-bold ${tradeType === 'SELL' ? 'bg-red-100 text-red-700' : 'text-slate-500'}`}
                        >
                            SELL
                        </button>
                     </div>
                  </div>
                  <div className="md:col-span-2">
                     <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Quantity</label>
                     <div className="flex gap-2">
                        <input 
                            type="number" 
                            min="0"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(parseInt(e.target.value) || 0)}
                            className="flex-1 p-2 border rounded font-mono"
                        />
                        <button 
                            onClick={handleTrade}
                            className="bg-slate-900 text-white px-6 rounded font-bold uppercase text-sm"
                        >
                            Execute
                        </button>
                     </div>
                     <p className="text-xs text-slate-400 mt-2 font-mono">
                        Cost: ${(tradeAmount * market[selectedSector]).toLocaleString()}
                     </p>
                  </div>
                </div>
              </div>
            )}

            {phase === GamePhase.TWEETING && (
                <TweetDeck 
                    choices={currentEvent?.choices || []} 
                    onAction={handleAction} 
                    disabled={loading} 
                />
            )}
          </div>

          <div className="space-y-6">
            <MarketChart history={marketHistory} />
            <div className="bg-white p-4 rounded-xl shadow border border-slate-200">
                <h3 className="text-lg font-bold mb-3 uppercase tracking-wider text-slate-800">Your Portfolio</h3>
                <div className="space-y-3">
                    {/* Fix TS error on line 327 by casting stats.portfolio entries to ensure amount is treated as number */}
                    {(Object.entries(stats.portfolio) as [keyof MarketData, number][]).map(([key, amount]) => (
                        <div key={key} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100">
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-500">{key}</span>
                                <span className="font-mono font-bold text-slate-800">{amount} units</span>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-bold text-green-600">${(amount * market[key]).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
