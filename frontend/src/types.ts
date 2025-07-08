export type CardType = 'animal' | 'money';
export type GamePhase = 'lobby' | 'auction' | 'trade' | 'end';
export type AuctionState = 'none' | 'in_progress' | 'ended';

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
  auctionCard?: Card;
  currentBid: number;
  currentBidder: string | null;
  auctionState: AuctionState;
  auctioneer: string | null;
  auctionEndTime?: number; // timestamp when auction ends
}