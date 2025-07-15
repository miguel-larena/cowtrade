export type CardType = 'animal' | 'money';
export type GamePhase = 'lobby' | 'auction' | 'trade' | 'end';
export type AuctionState = 'none' | 'in_progress' | 'ended' | 'match_bid_phase';
export type TradeState = 'none' | 'selecting_partner' | 'challenger_selecting_cards' | 'challenger_bidding' | 'challenged_bidding' | 'confirming_trade' | 'trade_complete';

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

export interface TradeOffer {
  playerId: string;
  animalCards: string[]; // card IDs
  moneyCards: string[]; // card IDs (face-down)
  totalValue: number; // sum of money card values
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
  disqualifiedPlayers: string[]; // list of player IDs who are disqualified from current auction
  
  // Trading state
  tradeState: TradeState;
  tradeInitiator: string | null; // player who initiated the trade (challenger)
  tradePartner: string | null; // player being traded with (challenged)
  tradeOffers: TradeOffer[]; // offers from both players
  tradeConfirmed: boolean; // whether both players confirmed the trade
  selectedAnimalCards: string[]; // animal cards selected by challenger for the trade
}