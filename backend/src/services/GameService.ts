import { GameState, Player, Card, AuctionSummary } from '../types/game';
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

    // Check for duplicate names and append a number if needed
    let finalPlayerName = playerName;
    let counter = 1;
    while (game.players.some(p => p.name === finalPlayerName)) {
      finalPlayerName = `${playerName} (${counter})`;
      counter++;
    }

    const playerId = generateId();
    const startingHand = createStartingHand();
    const player: Player = {
      id: playerId,
      name: finalPlayerName,
      hand: startingHand,
      money: 90
    };

    game.players.push(player);
    game.updatedAt = new Date();

    return game;
  }

  async leaveGame(gameId: string, playerId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      throw new Error('Player not found in game');
    }

    // Remove the player from the game
    game.players.splice(playerIndex, 1);
    game.updatedAt = new Date();

    // If no players left, delete the game
    if (game.players.length === 0) {
      this.games.delete(gameId);
      return game;
    }

    return game;
  }

  async deleteGame(gameId: string): Promise<void> {
    const deleted = this.games.delete(gameId);
    if (!deleted) {
      throw new Error('Game not found');
    }
  }

  // Testing helper method
  clearAllGames(): void {
    this.games.clear();
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

    if (game.auctionState !== 'none') {
      throw new Error('Auction already in progress');
    }

    // Check if there are animal cards in the deck
    const animalCards = game.deck.filter(card => card.type === 'animal');
    if (animalCards.length === 0) {
      throw new Error('No animal cards left in deck');
    }

    // Draw a random animal card from the deck
    const randomIndex = Math.floor(Math.random() * animalCards.length);
    const auctionCard = animalCards[randomIndex];
    
    // Remove the card from the deck
    game.deck = game.deck.filter(card => card.id !== auctionCard.id);

    // Handle Tuna bonus
    if (auctionCard.name === 'Tuna') {
      game.tunaCardsDrawn++;
      const bonusAmount = this.calculateTunaBonus(game.tunaCardsDrawn);
      
      // Give bonus to all players
      game.players.forEach(player => {
        player.money += bonusAmount;
      });
    }

    // Set up auction state
    game.auctionCard = auctionCard;
    game.auctioneer = playerId;
    game.auctionState = 'in_progress';
    game.currentBid = 0;
    game.currentBidder = null;
    game.disqualifiedPlayers = [];
    game.auctionEndTime = Date.now() + (30 * 1000); // 30 seconds
    game.auctionSummary = undefined;

    game.updatedAt = new Date();
    return game;
  }

  async placeBid(gameId: string, playerId: string, amount: number): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.auctionState !== 'in_progress') {
      throw new Error('No auction in progress');
    }

    if (game.auctioneer === playerId) {
      throw new Error('Auctioneer cannot bid on their own auction');
    }

    if (game.disqualifiedPlayers.includes(playerId)) {
      throw new Error('You are disqualified from this auction');
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Validate bid amount
    if (amount <= game.currentBid) {
      throw new Error('Bid must be higher than current bid');
    }

    if (amount % 10 !== 0) {
      throw new Error('Bid must be a multiple of 10');
    }

    if (amount < 10) {
      throw new Error('Minimum bid is 10');
    }

    // Check if player can afford the bid
    const canAfford = player.money >= amount;
    
    if (!canAfford) {
      // Player is bluffing - disqualify them
      game.disqualifiedPlayers.push(playerId);
      
      // Create bluff detection summary
      game.auctionState = 'summary';
      game.auctionSummary = {
        type: 'bluff_detected',
        message: `${player.name} was caught bluffing! They only have $${player.money} but bid $${amount}. They are disqualified from this auction.`,
        auctioneerName: game.players.find(p => p.id === game.auctioneer!)?.name || 'Unknown',
        blufferName: player.name,
        blufferMoney: player.money,
        animalName: game.auctionCard?.name,
        bidAmount: amount
      };
      
      game.updatedAt = new Date();
      return game;
    }

    // Valid bid - update auction state
    game.currentBid = amount;
    game.currentBidder = playerId;
    game.updatedAt = new Date();

    return game;
  }

  async endAuction(gameId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.auctionState === 'in_progress') {
      // Check if there were any bids
      if (!game.currentBidder || game.currentBid === 0) {
        // No bids - auctioneer keeps the card
        game.auctionState = 'summary';
        game.auctionSummary = {
          type: 'no_bids',
          message: `No one bid on the ${game.auctionCard?.name}. ${game.players.find(p => p.id === game.auctioneer!)?.name} keeps the card.`,
          auctioneerName: game.players.find(p => p.id === game.auctioneer!)?.name || 'Unknown',
          animalName: game.auctionCard?.name
        };
        
        // Give card to auctioneer
        if (game.auctionCard) {
          const auctioneer = game.players.find(p => p.id === game.auctioneer!);
          if (auctioneer) {
            auctioneer.hand.push(game.auctionCard);
          }
        }
      } else {
        // There were bids - auctioneer ALWAYS gets option to match
        game.auctionState = 'match_bid_phase';
        game.auctionEndTime = Date.now() + (15 * 1000); // 15 seconds to decide
      }
    } else if (game.auctionState === 'match_bid_phase') {
      // Match bid phase timed out - highest bidder wins
      if (game.currentBidder && game.currentBid > 0) {
        this.finalizeAuction(game, 'normal_win');
      } else {
        // This shouldn't happen, but handle it gracefully
        game.auctionState = 'summary';
        game.auctionSummary = {
          type: 'no_bids',
          message: `No valid bids found. ${game.players.find(p => p.id === game.auctioneer!)?.name} keeps the card.`,
          auctioneerName: game.players.find(p => p.id === game.auctioneer!)?.name || 'Unknown',
          animalName: game.auctionCard?.name
        };
        
        // Give card to auctioneer
        if (game.auctionCard) {
          const auctioneer = game.players.find(p => p.id === game.auctioneer!);
          if (auctioneer) {
            auctioneer.hand.push(game.auctionCard);
          }
        }
      }
    } else {
      throw new Error('No auction in progress');
    }

    game.updatedAt = new Date();
    return game;
  }

  async matchBid(gameId: string, playerId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.auctionState !== 'match_bid_phase') {
      throw new Error('Not in match bid phase');
    }

    if (game.auctioneer !== playerId) {
      throw new Error('Only the auctioneer can match the bid');
    }

    const auctioneer = game.players.find(p => p.id === playerId);
    if (!auctioneer) {
      throw new Error('Auctioneer not found');
    }

    if (auctioneer.money < game.currentBid) {
      throw new Error('Not enough money to match the bid');
    }

    // Auctioneer matches the bid
    this.finalizeAuction(game, 'matched_bid');
    game.updatedAt = new Date();

    return game;
  }

  async clearAuctionSummary(gameId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.auctionState !== 'summary') {
      throw new Error('No auction summary to clear');
    }

    // Reset auction state
    game.auctionState = 'none';
    game.auctionCard = undefined;
    game.currentBid = 0;
    game.currentBidder = null;
    game.auctioneer = null;
    game.auctionEndTime = undefined;
    game.disqualifiedPlayers = [];
    game.auctionSummary = undefined;

    // Move to next player's turn
    this.moveToNextTurn(game);

    game.updatedAt = new Date();

    return game;
  }

  async restartAuctionAfterBluff(gameId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.auctionState !== 'summary' || game.auctionSummary?.type !== 'bluff_detected') {
      throw new Error('Cannot restart auction - no bluff detected');
    }

    // Reset auction state but keep the same card and auctioneer
    game.auctionState = 'in_progress';
    game.currentBid = 0;
    game.currentBidder = null;
    game.auctionEndTime = Date.now() + (30 * 1000); // 30 seconds
    game.auctionSummary = undefined;
    // Keep disqualifiedPlayers as they are still disqualified

    game.updatedAt = new Date();
    return game;
  }

  // Helper methods
  private calculateTunaBonus(tunaCardsDrawn: number): number {
    switch (tunaCardsDrawn) {
      case 1: return 50;
      case 2: return 100;
      case 3: return 200;
      default: return 500;
    }
  }

  private finalizeAuction(game: GameState, summaryType: 'normal_win' | 'matched_bid'): void {
    const winner = game.players.find(p => p.id === game.currentBidder!);
    const auctioneer = game.players.find(p => p.id === game.auctioneer!);
    
    if (!winner || !auctioneer || !game.auctionCard) {
      return;
    }

    // Transfer money and card
    if (summaryType === 'matched_bid') {
      // Auctioneer matches the bid and keeps the card
      auctioneer.money -= game.currentBid;
      auctioneer.hand.push(game.auctionCard);
      
      game.auctionSummary = {
        type: 'matched_bid',
        message: `${auctioneer.name} matched the bid of $${game.currentBid} and keeps the ${game.auctionCard.name}.`,
        auctioneerName: auctioneer.name,
        winnerName: auctioneer.name,
        bidAmount: game.currentBid,
        animalName: game.auctionCard.name
      };
    } else {
      // Winner gets the card and pays the bid
      winner.money -= game.currentBid;
      winner.hand.push(game.auctionCard);
      
      game.auctionSummary = {
        type: 'normal_win',
        message: `${winner.name} won the ${game.auctionCard.name} for $${game.currentBid}.`,
        auctioneerName: auctioneer.name,
        winnerName: winner.name,
        bidAmount: game.currentBid,
        animalName: game.auctionCard.name
      };
    }

    game.auctionState = 'summary';
  }

  private moveToNextTurn(game: GameState): void {
    const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextPlayerIndex].id;
  }

  // Trading methods (to be implemented later)
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