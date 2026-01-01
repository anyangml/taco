export enum GamePhase {
  START = 'START',
  TRADING = 'TRADING',
  TWEETING = 'TWEETING',
  RESULTS = 'RESULTS',
  GAME_OVER = 'GAME_OVER'
}

export interface MarketData {
  tech: number;
  energy: number;
  realEstate: number;
  crypto: number;
}

export interface PlayerStats {
  cash: number;
  approval: number;
  tacoMeter: number; // 0 = Bold, 100 = Chicken
  portfolio: {
    tech: number;
    energy: number;
    realEstate: number;
    crypto: number;
  };
}

export interface GameChoice {
  id: string;
  label: string;
  description: string;
  type: 'AGGRESSIVE' | 'DEFENSIVE' | 'CHAOTIC';
}

export interface GameEvent {
  headline: string;
  description: string;
  impactForecast: string;
  choices: GameChoice[];
}

export interface TurnResult {
  tweet: string;
  marketImpact: Partial<MarketData>;
  approvalChange: number;
  tacoChange: number;
  analysis: string;
  marketAnalysis: string; // Explaining the logical/financial reasoning for market moves
}

export interface HistoryItem {
  turn: number;
  event: string;
  action: string;
  netWorthChange: number;
}