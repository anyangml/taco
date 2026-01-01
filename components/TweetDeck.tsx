import React, { useState, useEffect } from 'react';
import { Send, BadgeDollarSign, Siren, ShieldAlert, Sparkles } from 'lucide-react';
import { GameChoice } from '../types';

interface TweetDeckProps {
  choices: GameChoice[];
  onAction: (choice: GameChoice, customTweet: string | null) => void;
  disabled: boolean;
}

export const TweetDeck: React.FC<TweetDeckProps> = ({ choices, onAction, disabled }) => {
  const [customTweet, setCustomTweet] = useState('');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);

  // Reset selection when choices change (new turn)
  useEffect(() => {
    setSelectedChoiceId(null);
    setCustomTweet('');
  }, [choices]);

  const selectedChoice = choices.find(c => c.id === selectedChoiceId);

  const handleSubmit = () => {
    if (disabled || !selectedChoice) return;
    onAction(selectedChoice, customTweet.length > 0 ? customTweet : null);
  };

  const getIcon = (type: GameChoice['type']) => {
    switch(type) {
        case 'AGGRESSIVE': return <Siren size={20} />;
        case 'DEFENSIVE': return <ShieldAlert size={20} />;
        case 'CHAOTIC': return <Sparkles size={20} />;
        default: return <BadgeDollarSign size={20} />;
    }
  };

  const getColor = (type: GameChoice['type'], isSelected: boolean) => {
      const base = isSelected ? 'ring-4 ring-offset-2 ring-offset-blue-500' : 'hover:scale-102';
      switch(type) {
          case 'AGGRESSIVE': return `${base} bg-red-600 border-red-800 text-white`;
          case 'DEFENSIVE': return `${base} bg-blue-600 border-blue-800 text-white`;
          case 'CHAOTIC': return `${base} bg-purple-600 border-purple-800 text-white`;
          default: return `${base} bg-slate-600`;
      }
  };

  return (
    <div className="bg-blue-500 p-6 rounded-xl shadow-xl text-white">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <BadgeDollarSign /> Presidential Response Console
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {choices.map((choice) => (
            <button
                key={choice.id}
                onClick={() => setSelectedChoiceId(choice.id)}
                disabled={disabled}
                className={`p-4 rounded-xl border-b-4 transition-all text-left group relative overflow-hidden ${getColor(choice.type, selectedChoiceId === choice.id)}`}
            >
                <div className="absolute top-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    {getIcon(choice.type)}
                </div>
                <div className="font-bold text-lg mb-1 leading-tight">{choice.label}</div>
                <div className="text-xs opacity-80 font-mono leading-tight">{choice.description}</div>
            </button>
        ))}
      </div>

      <div className={`transition-all duration-300 ${selectedChoice ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-2 grayscale pointer-events-none'}`}>
          <div className="bg-white rounded-xl p-4 text-slate-800 mb-4 shadow-inner">
            <div className="flex gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <img src="https://picsum.photos/seed/trump/40/40" alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="w-full">
                    <textarea
                        value={customTweet}
                        onChange={(e) => setCustomTweet(e.target.value)}
                        placeholder={selectedChoice ? `Add your own flair to "${selectedChoice.label}"... (Optional)` : "Select a strategy above first..."}
                        className="w-full h-20 resize-none outline-none text-lg placeholder:text-slate-400 bg-transparent"
                        maxLength={280}
                        disabled={!selectedChoice || disabled}
                    />
                </div>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-sm border-t pt-2">
                <span className="font-mono text-xs uppercase text-blue-500 font-bold">
                    {selectedChoice ? `Strategy: ${selectedChoice.type}` : 'Waiting for input...'}
                </span>
                <span>{customTweet.length}/280</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={disabled || !selectedChoice}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold py-4 rounded-full text-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider"
          >
            <Send size={20} />
            {disabled ? 'Processing...' : 'Post to Truth Social'}
          </button>
      </div>
    </div>
  );
};