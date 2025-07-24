import type { GameState } from '../types';

const API_BASE_URL = 'http://localhost:3001/api/game';

export class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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

  // Game management
  static async createGame(playerName: string): Promise<GameState> {
    return this.makeRequest<GameState>('/create', {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
  }

  static async getGame(gameId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}`);
  }

  static async joinGame(gameId: string, playerName: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
  }

  static async startGame(gameId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/start`, {
      method: 'POST',
    });
  }

  static async deleteGame(gameId: string): Promise<void> {
    return this.makeRequest<void>(`/${gameId}`, {
      method: 'DELETE',
    });
  }

  // Auction endpoints
  static async startAuction(gameId: string, playerId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/auction/start`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  static async placeBid(gameId: string, playerId: string, amount: number): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/auction/bid`, {
      method: 'POST',
      body: JSON.stringify({ playerId, amount }),
    });
  }

  static async endAuction(gameId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/auction/end`, {
      method: 'POST',
    });
  }

  static async matchBid(gameId: string, playerId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/auction/match`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  static async clearAuctionSummary(gameId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/auction/clear-summary`, {
      method: 'POST',
    });
  }

  static async restartAuctionAfterBluff(gameId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/auction/restart-after-bluff`, {
      method: 'POST',
    });
  }

  // Trade endpoints (for future implementation)
  static async initiateTrade(gameId: string, initiatorId: string, partnerId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/trade/initiate`, {
      method: 'POST',
      body: JSON.stringify({ initiatorId, partnerId }),
    });
  }

  static async makeTradeOffer(
    gameId: string, 
    playerId: string, 
    moneyCards: string[], 
    animalCards: string[]
  ): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/trade/offer`, {
      method: 'POST',
      body: JSON.stringify({ playerId, moneyCards, animalCards }),
    });
  }

  static async executeTrade(gameId: string): Promise<GameState> {
    return this.makeRequest<GameState>(`/${gameId}/trade/execute`, {
      method: 'POST',
    });
  }
} 