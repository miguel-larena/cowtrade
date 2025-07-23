const API_BASE_URL = 'http://localhost:3001/api';

export interface CreateGameRequest {
  players: string[];
}

export interface GameResponse {
  gameState: GameState;
  message?: string;
  error?: string;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  currentTurn: string;
  currentPhase: 'lobby' | 'auction' | 'trade' | 'end';
  auctionCard?: Card;
  currentBid: number;
  currentBidder: string | null;
  auctionState: 'none' | 'in_progress' | 'ended' | 'match_bid_phase' | 'summary';
  auctioneer: string | null;
  auctionEndTime?: number;
  disqualifiedPlayers: string[];
  tunaCardsDrawn: number;
  tradeState: 'none' | 'selecting_partner' | 'challenger_selecting_cards' | 'challenger_bidding' | 'challenged_bidding' | 'confirming_trade' | 'trade_complete' | 'trade_tie_summary';
  tradeInitiator: string | null;
  tradePartner: string | null;
  tradeOffers: TradeOffer[];
  tradeConfirmed: boolean;
  selectedAnimalCards: string[];
  auctionSummary?: {
    type: 'no_bids' | 'matched_bid' | 'bluff_detected' | 'normal_win';
    message: string;
    auctioneerName: string;
    winnerName?: string;
    bidAmount?: number;
    blufferName?: string;
    blufferMoney?: number;
    animalName?: string;
  };
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  money: number;
}

export interface Card {
  id: string;
  type: 'animal' | 'money';
  value: number;
  name: string;
}

export interface TradeOffer {
  playerId: string;
  animalCards: string[]; // card IDs
  moneyCards: string[]; // card IDs (face-down)
  totalValue: number; // sum of money card values
}

export interface ActiveGame {
  id: string;
  playerCount: number;
  createdAt: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Create a new game
  async createGame(players: string[]): Promise<GameResponse> {
    return this.request<GameResponse>('/games/create', {
      method: 'POST',
      body: JSON.stringify({ players }),
    });
  }

  // Get game state
  async getGameState(gameId: string): Promise<GameResponse> {
    return this.request<GameResponse>(`/games/${gameId}`);
  }

  // Get all active games
  async getActiveGames(): Promise<{ games: ActiveGame[]; message: string }> {
    return this.request<{ games: ActiveGame[]; message: string }>('/games');
  }

  // Start an auction
  async startAuction(gameId: string, auctioneerId: string): Promise<GameResponse> {
    return this.request<GameResponse>(`/games/${gameId}/auction/start`, {
      method: 'POST',
      body: JSON.stringify({ auctioneerId }),
    });
  }

  // Place a bid
  async placeBid(gameId: string, bidderId: string, amount: number): Promise<GameResponse> {
    return this.request<GameResponse>(`/games/${gameId}/auction/bid`, {
      method: 'POST',
      body: JSON.stringify({ bidderId, amount }),
    });
  }

  // Delete a game
  async deleteGame(gameId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/games/${gameId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService(); 