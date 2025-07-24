export type CardType = 'animal' | 'money';
export type GamePhase = 'lobby' | 'auction' | 'trade' | 'end';
export type AuctionState = 'none' | 'in_progress' | 'ended' | 'match_bid_phase' | 'summary';
export type TradeState = 'none' | 'selecting_partner' | 'challenger_selecting_cards' | 'challenger_bidding' | 'challenged_bidding' | 'confirming_trade' | 'trade_complete' | 'trade_tie_summary';
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
    animalCards: string[];
    moneyCards: string[];
    totalValue: number;
}
export interface AuctionSummary {
    type: 'no_bids' | 'matched_bid' | 'bluff_detected' | 'normal_win';
    message: string;
    auctioneerName: string;
    winnerName?: string;
    bidAmount?: number;
    blufferName?: string;
    blufferMoney?: number;
    animalName?: string;
}
export interface GameState {
    id: string;
    players: Player[];
    deck: Card[];
    currentTurn: string;
    currentPhase: GamePhase;
    auctionCard?: Card;
    currentBid: number;
    currentBidder: string | null;
    auctionState: AuctionState;
    auctioneer: string | null;
    auctionEndTime?: number;
    disqualifiedPlayers: string[];
    tunaCardsDrawn: number;
    auctionSummary?: AuctionSummary;
    tradeState: TradeState;
    tradeInitiator: string | null;
    tradePartner: string | null;
    tradeOffers: TradeOffer[];
    tradeConfirmed: boolean;
    selectedAnimalCards: string[];
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=game.d.ts.map