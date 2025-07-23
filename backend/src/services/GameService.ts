import { GameState, Player, Card } from '../types/game';
import { generateId } from '../utils/idGenerator';
import { createInitialDeck, createStartingHand } from '../utils/gameSetup';

export class GameService {
  private games: Map<string, GameState> = new Map();

  // Game management methods
  async createGame(playerName: string): Promise<GameState> {
    const gameId = generateId();
    const playerId = generateId();
    
    const startingHand = createStartingHand();
    const player: Player = {
      id: playerId,
      name: playerName,
      hand: startingHand,
      money: 90
    };

    const game: GameState = {
      id: gameId,
      players: [player],
      deck: createInitialDeck(),
      currentTurn: playerId,
      currentPhase: 'lobby',
      auctionCard: undefined,
      currentBid: 0,
      currentBidder: null,
      auctionState: 'none',
      auctioneer: null,
      auctionEndTime: undefined,
      disqualifiedPlayers: [],
      tunaCardsDrawn: 0,
      auctionSummary: undefined,
      tradeState: 'none',
      tradeInitiator: null,
      tradePartner: null,
      tradeOffers: [],
      tradeConfirmed: false,
      selectedAnimalCards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.games.set(gameId, game);
    return game;
  }

  async getGame(gameId: string): Promise<GameState | null> {
    return this.games.get(gameId) || null;
  }

  async joinGame(gameId: string, playerName: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentPhase !== 'lobby') {
      throw new Error('Game has already started');
    }

    if (game.players.length >= 6) {
      throw new Error('Game is full');
    }

    const playerId = generateId();
    const startingHand = createStartingHand();
    const player: Player = {
      id: playerId,
      name: playerName,
      hand: startingHand,
      money: 90
    };

    game.players.push(player);
    game.updatedAt = new Date();

    return game;
  }

  async deleteGame(gameId: string): Promise<void> {
    const deleted = this.games.delete(gameId);
    if (!deleted) {
      throw new Error('Game not found');
    }
  }

  // Game action methods
  async startGame(gameId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    game.currentPhase = 'auction';
    game.updatedAt = new Date();

    return game;
  }

  async startAuction(gameId: string, playerId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentTurn !== playerId) {
      throw new Error('Not your turn');
    }

    if (game.auctionState === 'in_progress') {
      throw new Error('Auction already in progress');
    }

    // TODO: Implement auction logic
    // For now, just return the game state
    game.updatedAt = new Date();
    return game;
  }

  async placeBid(gameId: string, playerId: string, amount: number): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // TODO: Implement bidding logic
    game.updatedAt = new Date();
    return game;
  }

  async endAuction(gameId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // TODO: Implement auction end logic
    game.updatedAt = new Date();
    return game;
  }

  async matchBid(gameId: string, playerId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // TODO: Implement match bid logic
    game.updatedAt = new Date();
    return game;
  }

  async initiateTrade(gameId: string, initiatorId: string, partnerId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // TODO: Implement trade initiation logic
    game.updatedAt = new Date();
    return game;
  }

  async makeTradeOffer(gameId: string, playerId: string, moneyCards: string[], animalCards: string[]): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // TODO: Implement trade offer logic
    game.updatedAt = new Date();
    return game;
  }

  async executeTrade(gameId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // TODO: Implement trade execution logic
    game.updatedAt = new Date();
    return game;
  }
} 