export type CardType = 'animal' | 'money';
export type GamePhase = 'lobby' | 'auction' | 'trade' | 'end';

export interface Card {
  id: string;
  type: CardType;
  value: number;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  money: number;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  currentTurn: string;
  currentPhase: GamePhase;
  auctionCard: Card | null;
  currentBid: number;
  currentBidder: string | null;
}