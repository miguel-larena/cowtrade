import { GameState, Player, Card } from './types';
import { createNewGameState, animalCards } from './gameData';

interface Game {
  id: string;
  state: GameState;
  createdAt: Date;
  lastActivity: Date;
}

class GameManager {
  private games: Map<string, Game> = new Map();

  // Create a new game
  createGame(playerNames: string[]): string {
    const gameId = this.generateGameId();
    const gameState = createNewGameState(playerNames);
    
    const game: Game = {
      id: gameId,
      state: gameState,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.games.set(gameId, game);
    console.log(`Created game ${gameId} with players: ${playerNames.join(', ')}`);
    return gameId;
  }

  // Get a game by ID
  getGame(gameId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) {
      return null;
    }
    
    game.lastActivity = new Date();
    return game.state;
  }

  // Update a game's state
  updateGame(gameId: string, newState: GameState): boolean {
    const game = this.games.get(gameId);
    if (!game) {
      return false;
    }

    game.state = newState;
    game.lastActivity = new Date();
    return true;
  }

  // Delete a game
  deleteGame(gameId: string): boolean {
    return this.games.delete(gameId);
  }

  // Get all active games
  getActiveGames(): Array<{ id: string; playerCount: number; createdAt: Date }> {
    return Array.from(this.games.values()).map(game => ({
      id: game.id,
      playerCount: game.state.players.length,
      createdAt: game.createdAt
    }));
  }

  // Helper function to calculate Tuna bonus amount
  private getTunaBonusAmount(tunaNumber: number): number {
    switch (tunaNumber) {
      case 1: return 50;
      case 2: return 100;
      case 3: return 200;
      case 4: return 500;
      default: return 0;
    }
  }

  // Start an auction
  startAuction(gameId: string, auctioneerId: string): GameState | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const state = game.state;

    // Check if it's the player's turn
    if (state.currentTurn !== auctioneerId) {
      return null;
    }

    // Check if auction is already in progress
    if (state.auctionState === 'in_progress') {
      return null;
    }

    // Filter animal cards for auction selection
    const availableAnimalCards = state.deck.filter(card => card.type === 'animal');
    
    if (availableAnimalCards.length === 0) {
      return null; // No animal cards left
    }

    // Select random animal card
    const selectedCard = availableAnimalCards[Math.floor(Math.random() * availableAnimalCards.length)];
    
    // Check if the selected card is a Tuna
    const isTuna = selectedCard.name === 'Tuna';
    const newTunaCardsDrawn = isTuna ? state.tunaCardsDrawn + 1 : state.tunaCardsDrawn;
    const tunaBonusAmount = isTuna ? this.getTunaBonusAmount(newTunaCardsDrawn) : 0;
    
    // Set auction end time (1 minute from now)
    const endTime = Date.now() + 60000; // 60 seconds (1 minute)

    // Only reset disqualified players if this is a completely new auction
    const shouldResetDisqualified = state.auctioneer !== auctioneerId || !state.auctioneer;

    // If it's a Tuna, give bonus money to all players
    let updatedPlayers = state.players;
    if (isTuna && tunaBonusAmount > 0) {
      console.log(`Tuna drawn! Giving $${tunaBonusAmount} to all players`);
      updatedPlayers = state.players.map(player => {
        const bonusCard: Card = {
          id: `bonus_${player.id}_tuna_${newTunaCardsDrawn}`,
          type: 'money',
          value: tunaBonusAmount,
          name: tunaBonusAmount.toString()
        };
        return {
          ...player,
          hand: [...player.hand, bonusCard],
          money: player.money + tunaBonusAmount
        };
      });
    }

    const newState: GameState = {
      ...state,
      players: updatedPlayers,
      auctionState: 'in_progress',
      auctionCard: selectedCard,
      auctioneer: auctioneerId,
      auctionEndTime: endTime,
      currentBid: 0,
      currentBidder: null,
      disqualifiedPlayers: shouldResetDisqualified ? [] : state.disqualifiedPlayers,
      tunaCardsDrawn: newTunaCardsDrawn
    };

    this.updateGame(gameId, newState);
    return newState;
  }

  // Place a bid in an auction
  placeBid(gameId: string, bidderId: string, amount: number): GameState | null {
    const game = this.games.get(gameId);
    if (!game) return null;

    const state = game.state;
    
    // Check if auction is in progress
    if (state.auctionState !== 'in_progress') {
      return null;
    }

    // Check if bidder is the auctioneer
    if (bidderId === state.auctioneer) {
      return null; // Auctioneer cannot bid
    }

    // Check if bidder is disqualified
    if (state.disqualifiedPlayers.includes(bidderId)) {
      return null; // Disqualified players cannot bid
    }

    // Check if bid is valid (multiple of 10 and higher than current bid)
    if (amount % 10 !== 0 || amount <= state.currentBid) {
      return null; // Invalid bid
    }

    // Check if bidder exists
    const bidder = state.players.find(p => p.id === bidderId);
    if (!bidder) {
      return null;
    }
    
    // Log if this is a bluff
    if (bidder.money < amount) {
      console.log('Bluff detected:', { bidderId, bidderMoney: bidder.money, amount });
    }

    const newState: GameState = {
      ...state,
      currentBid: amount,
      currentBidder: bidderId
    };

    this.updateGame(gameId, newState);
    return newState;
  }

  // Generate a unique game ID
  private generateGameId(): string {
    return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Clean up old games (optional - for memory management)
  cleanupOldGames(maxAgeHours: number = 24): number {
    const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [gameId, game] of this.games.entries()) {
      if (game.lastActivity < cutoff) {
        this.games.delete(gameId);
        cleanedCount++;
      }
    }

    console.log(`Cleaned up ${cleanedCount} old games`);
    return cleanedCount;
  }
}

// Export a singleton instance
export const gameManager = new GameManager(); 