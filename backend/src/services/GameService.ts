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
              swordfishCardsDrawn: 0,
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
    const game = this.games.get(gameId) || null;
    if (game) {
      console.log(`=== getGame called for ${gameId} ===`);
      game.players.forEach(player => {
        const moneyCards = player.hand.filter(c => c.type === 'money');
        console.log(`${player.name}: $${player.money}, ${moneyCards.length} money cards:`, moneyCards.map(c => `${c.name} ($${c.value})`));
      });
    }
    return game;
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

    // Handle Swordfish bonus
    if (auctionCard.name === 'Swordfish') {
      game.swordfishCardsDrawn++;
      const bonusAmount = this.calculateSwordfishBonus(game.swordfishCardsDrawn);
      
      console.log(`=== Swordfish Bonus: ${game.swordfishCardsDrawn} Swordfish drawn, bonus amount: $${bonusAmount} ===`);
      
      // Give bonus to all players
      game.players.forEach(player => {
        console.log(`Before Swordfish bonus - ${player.name}: $${player.money}, ${player.hand.filter(c => c.type === 'money').length} money cards`);
        
        // Add money to player's total
        player.money += bonusAmount;
        
        // Add the appropriate money card to player's hand
        const bonusCard: Card = {
          id: `swordfish_bonus_${game.swordfishCardsDrawn}_${player.id}_${Date.now()}`,
          type: 'money',
          value: bonusAmount,
          name: bonusAmount.toString()
        };
        
        player.hand.push(bonusCard);
        
        console.log(`After Swordfish bonus - ${player.name}: $${player.money}, ${player.hand.filter(c => c.type === 'money').length} money cards`);
        console.log(`Added bonus card: ${bonusCard.name} ($${bonusCard.value})`);
      });
      
      console.log(`=== Swordfish Bonus Complete ===`);
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

    // Allow bluffing - don't check affordability here
    // Bluff detection will happen during match bid phase when auctioneer tries to match

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
      // Match bid phase timed out - check if current bidder was bluffing
      if (game.currentBidder && game.currentBid > 0) {
        const currentBidder = game.players.find(p => p.id === game.currentBidder!);
        if (!currentBidder) {
          throw new Error('Current bidder not found');
        }

        // Check if current bidder can actually afford their bid
        const bidderMoneyCards = currentBidder.hand.filter(card => card.type === 'money' && card.value > 0);
        const bidderTotalMoney = bidderMoneyCards.reduce((sum, card) => sum + card.value, 0);
        
        if (bidderTotalMoney < game.currentBid) {
          // Current bidder was bluffing - disqualify them
          game.disqualifiedPlayers.push(game.currentBidder!);
          
          // Create bluff detection summary
          game.auctionState = 'summary';
          game.auctionSummary = {
            type: 'bluff_detected',
            message: `${currentBidder.name} was caught bluffing! They only have $${bidderTotalMoney} in money cards but bid $${game.currentBid}. They are disqualified from this auction.`,
            auctioneerName: game.players.find(p => p.id === game.auctioneer!)?.name || 'Unknown',
            blufferName: currentBidder.name,
            blufferMoney: bidderTotalMoney,
            animalName: game.auctionCard?.name,
            bidAmount: game.currentBid
          };
        } else {
          // Bidder can afford - normal win
          this.finalizeAuction(game, 'normal_win');
        }
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

    // Check if auctioneer has enough money cards to pay the bid (excluding $0 bluff cards)
    const moneyCards = auctioneer.hand.filter(card => card.type === 'money' && card.value > 0);
    const totalMoneyCards = moneyCards.reduce((sum, card) => sum + card.value, 0);
    
    if (totalMoneyCards < game.currentBid) {
      // Auctioneer can't afford to match - check if current bidder was bluffing
      const currentBidder = game.players.find(p => p.id === game.currentBidder!);
      if (!currentBidder) {
        throw new Error('Current bidder not found');
      }

      // Check if current bidder can actually afford their bid
      const bidderMoneyCards = currentBidder.hand.filter(card => card.type === 'money' && card.value > 0);
      const bidderTotalMoney = bidderMoneyCards.reduce((sum, card) => sum + card.value, 0);
      
      if (bidderTotalMoney < game.currentBid) {
        // Current bidder was bluffing - disqualify them
        game.disqualifiedPlayers.push(game.currentBidder!);
        
        // Create bluff detection summary
        game.auctionState = 'summary';
        game.auctionSummary = {
          type: 'bluff_detected',
          message: `${currentBidder.name} was caught bluffing! They only have $${bidderTotalMoney} in money cards but bid $${game.currentBid}. They are disqualified from this auction.`,
          auctioneerName: auctioneer.name,
          blufferName: currentBidder.name,
          blufferMoney: bidderTotalMoney,
          animalName: game.auctionCard?.name,
          bidAmount: game.currentBid
        };
        
        game.updatedAt = new Date();
        return game;
      } else {
        // Auctioneer can't afford but bidder can - normal win
        this.finalizeAuction(game, 'normal_win');
        game.updatedAt = new Date();
        return game;
      }
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
    console.log(`🔄 restartAuctionAfterBluff called for game: ${gameId}`);
    
    const game = this.games.get(gameId);
    if (!game) {
      console.error(`❌ Game not found: ${gameId}`);
      throw new Error('Game not found');
    }

    console.log(`📊 Game state check:`, {
      gameId: game.id,
      auctionState: game.auctionState,
      auctionSummaryType: game.auctionSummary?.type,
      auctionSummary: game.auctionSummary,
      auctioneer: game.auctioneer,
      currentBid: game.currentBid,
      currentBidder: game.currentBidder,
      disqualifiedPlayers: game.disqualifiedPlayers
    });

    if (game.auctionState !== 'summary' || game.auctionSummary?.type !== 'bluff_detected') {
      console.error(`❌ Cannot restart auction - invalid state:`, {
        expectedState: 'summary',
        actualState: game.auctionState,
        expectedSummaryType: 'bluff_detected',
        actualSummaryType: game.auctionSummary?.type
      });
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

  async giveCardToAuctioneer(gameId: string): Promise<GameState> {
    console.log(`🎁 giveCardToAuctioneer called for game: ${gameId}`);
    
    const game = this.games.get(gameId);
    if (!game) {
      console.error(`❌ Game not found: ${gameId}`);
      throw new Error('Game not found');
    }

    console.log(`📊 Game state check for giveCardToAuctioneer:`, {
      gameId: game.id,
      auctionState: game.auctionState,
      auctionSummaryType: game.auctionSummary?.type,
      auctionSummary: game.auctionSummary,
      auctioneer: game.auctioneer,
      auctionCard: game.auctionCard ? game.auctionCard.name : 'none',
      disqualifiedPlayers: game.disqualifiedPlayers,
      totalPlayers: game.players.length
    });

    if (game.auctionState !== 'summary' || game.auctionSummary?.type !== 'bluff_detected') {
      console.error(`❌ Cannot give card to auctioneer - invalid state:`, {
        expectedState: 'summary',
        actualState: game.auctionState,
        expectedSummaryType: 'bluff_detected',
        actualSummaryType: game.auctionSummary?.type
      });
      throw new Error('Cannot give card to auctioneer - no bluff detected');
    }

    if (!game.auctionCard || !game.auctioneer) {
      console.error(`❌ Cannot give card to auctioneer - missing data:`, {
        hasAuctionCard: !!game.auctionCard,
        hasAuctioneer: !!game.auctioneer
      });
      throw new Error('No auction card or auctioneer found');
    }

    // Check if all other players are disqualified
    const activePlayers = game.players.filter(player => 
      player.id !== game.auctioneer && 
      !game.disqualifiedPlayers.includes(player.id)
    );

    if (activePlayers.length > 0) {
      throw new Error('Cannot give card to auctioneer - there are still active players');
    }

    // Find the auctioneer player
    const auctioneer = game.players.find(p => p.id === game.auctioneer);
    if (!auctioneer) {
      throw new Error('Auctioneer not found');
    }

    // Give the auction card to the auctioneer
    auctioneer.hand.push(game.auctionCard);

    // Create summary message
    game.auctionSummary = {
      type: 'auctioneer_wins',
      message: `All other players were disqualified. ${auctioneer.name} receives the ${game.auctionCard.name} card.`,
      auctioneerName: auctioneer.name,
      winnerName: auctioneer.name,
      bidAmount: 0,
      animalName: game.auctionCard.name
    };

    // Reset auction state
    game.auctionState = 'summary';
    game.auctionCard = undefined;
    game.currentBid = 0;
    game.currentBidder = null;
    game.auctionEndTime = undefined;
    game.auctioneer = null;

    game.updatedAt = new Date();
    return game;
  }

  // Helper methods
  private calculateSwordfishBonus(swordfishCardsDrawn: number): number {
    switch (swordfishCardsDrawn) {
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
      // Transfer money cards from auctioneer to winner
      console.log(`Before transfer - Auctioneer: ${auctioneer.name} ($${auctioneer.money}, ${auctioneer.hand.filter(c => c.type === 'money').length} money cards)`);
      console.log(`Before transfer - Winner: ${winner.name} ($${winner.money}, ${winner.hand.filter(c => c.type === 'money').length} money cards)`);
      
      const transferredCards = this.transferMoneyCards(auctioneer, winner, game.currentBid);
      auctioneer.hand.push(game.auctionCard);
      
      console.log(`After transfer - Auctioneer: ${auctioneer.name} ($${auctioneer.money}, ${auctioneer.hand.filter(c => c.type === 'money').length} money cards)`);
      console.log(`After transfer - Winner: ${winner.name} ($${winner.money}, ${winner.hand.filter(c => c.type === 'money').length} money cards)`);
      console.log(`Transferred ${transferredCards.length} cards:`, transferredCards.map(c => `${c.name} ($${c.value})`));
      
      game.auctionSummary = {
        type: 'matched_bid',
        message: `${auctioneer.name} matched the bid of $${game.currentBid} and keeps the ${game.auctionCard.name}. ${winner.name} receives $${game.currentBid} in money cards.`,
        auctioneerName: auctioneer.name,
        winnerName: auctioneer.name,
        bidAmount: game.currentBid,
        animalName: game.auctionCard.name
      };
    } else {
      // Winner gets the card and pays the bid to auctioneer
      console.log(`Before transfer - Winner: ${winner.name} ($${winner.money}, ${winner.hand.filter(c => c.type === 'money').length} money cards)`);
      console.log(`Before transfer - Auctioneer: ${auctioneer.name} ($${auctioneer.money}, ${auctioneer.hand.filter(c => c.type === 'money').length} money cards)`);
      
      const transferredCards = this.transferMoneyCards(winner, auctioneer, game.currentBid);
      winner.hand.push(game.auctionCard);
      
      console.log(`After transfer - Winner: ${winner.name} ($${winner.money}, ${winner.hand.filter(c => c.type === 'money').length} money cards)`);
      console.log(`After transfer - Auctioneer: ${auctioneer.name} ($${auctioneer.money}, ${auctioneer.hand.filter(c => c.type === 'money').length} money cards)`);
      console.log(`Transferred ${transferredCards.length} cards:`, transferredCards.map(c => `${c.name} ($${c.value})`));
      
      game.auctionSummary = {
        type: 'normal_win',
        message: `${winner.name} won the ${game.auctionCard.name} for $${game.currentBid}. ${auctioneer.name} receives $${game.currentBid} in money cards.`,
        auctioneerName: auctioneer.name,
        winnerName: winner.name,
        bidAmount: game.currentBid,
        animalName: game.auctionCard.name
      };
    }

    game.auctionState = 'summary';
  }

  private getCombinations(cards: Card[], size: number): Card[][] {
    if (size === 0) return [[]];
    if (cards.length === 0) return [];
    
    const [first, ...rest] = cards;
    const withoutFirst = this.getCombinations(rest, size);
    const withFirst = this.getCombinations(rest, size - 1).map(combination => [first, ...combination]);
    
    return [...withoutFirst, ...withFirst];
  }

  private transferMoneyCards(fromPlayer: Player, toPlayer: Player, amount: number): Card[] {
    const transferredCards: Card[] = [];
    let remainingAmount = amount;
    
    console.log(`=== Starting money transfer: ${fromPlayer.name} -> ${toPlayer.name} for $${amount} ===`);
    console.log(`From player hand before:`, fromPlayer.hand.map(c => `${c.name} ($${c.value})`));
    console.log(`To player hand before:`, toPlayer.hand.map(c => `${c.name} ($${c.value})`));
    
    // Get money cards (excluding $0 bluff cards) and sort by value (highest first for optimal overpayment)
    const moneyCards = fromPlayer.hand
      .filter(card => card.type === 'money' && card.value > 0)
      .sort((a, b) => b.value - a.value);
    
    console.log(`Money cards to transfer (sorted by highest first):`, moneyCards.map(c => `${c.name} ($${c.value})`));
    
    // Strategy 1: Try to find exact payment using lowest denominations
    const exactPaymentCards = fromPlayer.hand
      .filter(card => card.type === 'money' && card.value > 0)
      .sort((a, b) => a.value - b.value);
    
    let exactPaymentTotal = 0;
    const exactPayment = [];
    
    for (const card of exactPaymentCards) {
      if (exactPaymentTotal >= amount) break;
      exactPaymentTotal += card.value;
      exactPayment.push(card);
    }
    
    console.log(`Exact payment attempt: ${exactPaymentTotal} using ${exactPayment.length} cards`);
    
    // Strategy 2: Find the smallest single card that covers the amount
    const smallestCoveringCard = moneyCards.find(card => card.value >= amount);
    const singleCardOverpayment = smallestCoveringCard ? smallestCoveringCard.value - amount : Infinity;
    
    // Strategy 3: Calculate overpayment if we use exact payment strategy
    const exactPaymentOverpayment = exactPaymentTotal >= amount ? exactPaymentTotal - amount : Infinity;
    
    console.log(`Single card overpayment: $${singleCardOverpayment}`);
    console.log(`Exact payment overpayment: $${exactPaymentOverpayment}`);
    
    // Choose the strategy: exact payment if possible, otherwise minimal overpayment
    if (exactPaymentTotal >= amount && exactPaymentOverpayment === 0) {
      // Use exact payment strategy (no overpayment)
      console.log(`Using exact payment strategy (no overpayment)`);
      for (const card of exactPayment) {
        if (remainingAmount <= 0) break;
        
        const cardIndex = fromPlayer.hand.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
          const removedCard = fromPlayer.hand.splice(cardIndex, 1)[0];
          console.log(`Removed card: ${removedCard.name} ($${removedCard.value})`);
          
          toPlayer.hand.push(removedCard);
          transferredCards.push(removedCard);
          remainingAmount -= removedCard.value;
          
          console.log(`Remaining amount to transfer: $${remainingAmount}`);
        }
      }
    } else {
      // Exact payment not possible, use minimal overpayment strategy
      console.log(`Exact payment not possible, using minimal overpayment strategy`);
      
      // Find the combination of cards that results in minimal overpayment
      let bestCombination: Card[] = [];
      let bestOverpayment = Infinity;
      
      // Try all possible combinations of cards
      const allMoneyCards = fromPlayer.hand.filter(card => card.type === 'money' && card.value > 0);
      
      // Generate all possible combinations (power set)
      for (let i = 1; i <= allMoneyCards.length; i++) {
        const combinations = this.getCombinations(allMoneyCards, i);
        for (const combination of combinations) {
          const totalValue = combination.reduce((sum: number, card: Card) => sum + card.value, 0);
          if (totalValue >= amount) {
            const overpayment = totalValue - amount;
            if (overpayment < bestOverpayment) {
              bestOverpayment = overpayment;
              bestCombination = combination;
            }
          }
        }
      }
      
      if (bestCombination.length > 0) {
        console.log(`Using combination: ${bestCombination.map((c: Card) => `$${c.value}`).join(' + ')} = $${bestCombination.reduce((sum: number, c: Card) => sum + c.value, 0)} (overpayment: $${bestOverpayment})`);
        
        for (const card of bestCombination) {
          const cardIndex = fromPlayer.hand.findIndex(c => c.id === card.id);
          if (cardIndex !== -1) {
            const removedCard = fromPlayer.hand.splice(cardIndex, 1)[0];
            console.log(`Removed card: ${removedCard.name} ($${removedCard.value})`);
            
            toPlayer.hand.push(removedCard);
            transferredCards.push(removedCard);
            remainingAmount -= removedCard.value;
            
            console.log(`Remaining amount to transfer: $${remainingAmount}`);
          }
        }
      }
    }
    
    // Update money totals based on actual cards transferred
    const actualTransferredValue = transferredCards.reduce((sum, card) => sum + card.value, 0);
    fromPlayer.money -= actualTransferredValue;
    toPlayer.money += actualTransferredValue;
    
    console.log(`=== Transfer complete ===`);
    console.log(`Actual transferred value: $${actualTransferredValue}`);
    console.log(`From player hand after:`, fromPlayer.hand.map(c => `${c.name} ($${c.value})`));
    console.log(`To player hand after:`, toPlayer.hand.map(c => `${c.name} ($${c.value})`));
    console.log(`From player money: ${fromPlayer.money}, money cards: ${fromPlayer.hand.filter(c => c.type === 'money').length}`);
    console.log(`To player money: ${toPlayer.money}, money cards: ${toPlayer.hand.filter(c => c.type === 'money').length}`);
    console.log(`Transferred cards:`, transferredCards.map(c => `${c.name} ($${c.value})`));
    
    return transferredCards;
  }

  private moveToNextTurn(game: GameState): void {
    const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentTurn);
    const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
    game.currentTurn = game.players[nextPlayerIndex].id;
  }

  private drawAuctionCard(game: GameState): Card | null {
    if (game.deck.length === 0) {
      return null; // No more cards to draw
    }
    
    const drawnCard = game.deck.pop()!;
    console.log(`Drew auction card: ${drawnCard.name} ($${drawnCard.value})`);
    return drawnCard;
  }

  // Trading methods
  async initiateTrade(gameId: string, initiatorId: string, partnerId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Validate that it's the initiator's turn
    if (game.currentTurn !== initiatorId) {
      throw new Error('Not your turn to initiate trade');
    }

    // Validate that both players exist
    const initiator = game.players.find(p => p.id === initiatorId);
    const partner = game.players.find(p => p.id === partnerId);
    if (!initiator || !partner) {
      throw new Error('Player not found');
    }

    // Check if both players have animal cards
    const initiatorAnimalCards = initiator.hand.filter(card => card.type === 'animal');
    const partnerAnimalCards = partner.hand.filter(card => card.type === 'animal');
    
    if (initiatorAnimalCards.length === 0 || partnerAnimalCards.length === 0) {
      throw new Error('Both players must have animal cards to trade');
    }

    // Check if they have any animal types in common
    const initiatorAnimalTypes = new Set(initiatorAnimalCards.map(card => card.name));
    const partnerAnimalTypes = new Set(partnerAnimalCards.map(card => card.name));
    const commonAnimalTypes = [...initiatorAnimalTypes].filter(type => partnerAnimalTypes.has(type));
    
    if (commonAnimalTypes.length === 0) {
      throw new Error('Players must have at least one animal type in common to trade');
    }

    // Initialize trade state
    game.tradeState = 'challenger_selecting_cards';
    game.tradeInitiator = initiatorId;
    game.tradePartner = partnerId;
    game.selectedAnimalCards = [];
    game.tradeOffers = [];
    game.tradeConfirmed = false;

    game.updatedAt = new Date();
    return game;
  }

  async makeTradeOffer(gameId: string, playerId: string, moneyCards: string[], animalCards: string[]): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Validate that trade is in progress
    if (game.tradeState === 'none') {
      throw new Error('No trade in progress');
    }

    // Validate that the player is part of the trade
    if (playerId !== game.tradeInitiator && playerId !== game.tradePartner) {
      throw new Error('You are not part of this trade');
    }

    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Handle animal card selection (challenger's turn)
    if (game.tradeState === 'challenger_selecting_cards' && playerId === game.tradeInitiator) {
      if (animalCards.length === 0) {
        throw new Error('Must select at least one animal card');
      }

      // Validate that all selected cards are animal cards and belong to the player
      const selectedAnimalCards = player.hand.filter(card => 
        animalCards.includes(card.id) && card.type === 'animal'
      );

      if (selectedAnimalCards.length !== animalCards.length) {
        throw new Error('Invalid animal card selection');
      }

      // Check that all selected cards are of the same type
      const animalTypes = new Set(selectedAnimalCards.map(card => card.name));
      if (animalTypes.size > 1) {
        throw new Error('All selected animal cards must be of the same type');
      }

      // Check that the partner also has this animal type
      const partner = game.players.find(p => p.id === game.tradePartner);
      if (partner) {
        const partnerHasType = partner.hand.some(card => 
          card.type === 'animal' && animalTypes.has(card.name)
        );
        if (!partnerHasType) {
          throw new Error('Partner does not have the selected animal type');
        }
      }

      // Store selected animal cards and move to bidding phase
      game.selectedAnimalCards = animalCards;
      game.tradeState = 'challenger_bidding';
      
    } else if (game.tradeState === 'challenger_bidding' && playerId === game.tradeInitiator) {
      // Challenger is making money bid
      if (moneyCards.length === 0) {
        throw new Error('Must select at least one money card');
      }

      // Validate that all selected cards are money cards and belong to the player
      const selectedMoneyCards = player.hand.filter(card => 
        moneyCards.includes(card.id) && card.type === 'money'
      );

      if (selectedMoneyCards.length !== moneyCards.length) {
        throw new Error('Invalid money card selection');
      }

      // Create or update trade offer
      const existingOfferIndex = game.tradeOffers.findIndex(offer => offer.playerId === playerId);
      const totalValue = selectedMoneyCards.reduce((sum, card) => sum + card.value, 0);
      
      if (existingOfferIndex >= 0) {
        game.tradeOffers[existingOfferIndex] = {
          playerId,
          animalCards: game.selectedAnimalCards,
          moneyCards,
          totalValue
        };
      } else {
        game.tradeOffers.push({
          playerId,
          animalCards: game.selectedAnimalCards,
          moneyCards,
          totalValue
        });
      }

      // Move to challenged player's turn
      game.tradeState = 'challenged_bidding';

    } else if (game.tradeState === 'challenged_bidding' && playerId === game.tradePartner) {
      // Challenged player is making money bid
      if (moneyCards.length === 0) {
        throw new Error('Must select at least one money card');
      }

      // Validate that all selected cards are money cards and belong to the player
      const selectedMoneyCards = player.hand.filter(card => 
        moneyCards.includes(card.id) && card.type === 'money'
      );

      if (selectedMoneyCards.length !== moneyCards.length) {
        throw new Error('Invalid money card selection');
      }

      // Create or update trade offer
      const existingOfferIndex = game.tradeOffers.findIndex(offer => offer.playerId === playerId);
      const totalValue = selectedMoneyCards.reduce((sum, card) => sum + card.value, 0);
      
      if (existingOfferIndex >= 0) {
        game.tradeOffers[existingOfferIndex] = {
          playerId,
          animalCards: game.selectedAnimalCards,
          moneyCards,
          totalValue
        };
      } else {
        game.tradeOffers.push({
          playerId,
          animalCards: game.selectedAnimalCards,
          moneyCards,
          totalValue
        });
      }

      // Both players have bid, determine winner
      const challengerOffer = game.tradeOffers.find(offer => offer.playerId === game.tradeInitiator);
      const challengedOffer = game.tradeOffers.find(offer => offer.playerId === game.tradePartner);

      if (challengerOffer && challengedOffer) {
        if (challengerOffer.totalValue === challengedOffer.totalValue) {
          // Tie - restart trade
          game.tradeState = 'trade_tie_summary';
        } else {
          // Trade complete - determine winner
          game.tradeState = 'trade_complete';
        }
      }
    }

    game.updatedAt = new Date();
    return game;
  }

  async executeTrade(gameId: string): Promise<GameState> {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // If trade is complete, execute the actual card exchange
    if (game.tradeState === 'trade_complete') {
      const challengerOffer = game.tradeOffers.find(offer => offer.playerId === game.tradeInitiator);
      const challengedOffer = game.tradeOffers.find(offer => offer.playerId === game.tradePartner);

      if (challengerOffer && challengedOffer) {
        const challenger = game.players.find(p => p.id === game.tradeInitiator);
        const challenged = game.players.find(p => p.id === game.tradePartner);

        if (challenger && challenged) {
          // Determine winner (higher bid wins)
          const winner = challengerOffer.totalValue > challengedOffer.totalValue ? challenger : challenged;
          const loser = winner.id === challenger.id ? challenged : challenger;
          const winnerOffer = winner.id === challenger.id ? challengerOffer : challengedOffer;
          const loserOffer = winner.id === challenger.id ? challengedOffer : challengerOffer;

          // Transfer animal cards to winner
          const animalCardsToTransfer: Card[] = [];
          game.selectedAnimalCards.forEach(cardId => {
            const card = challenger.hand.find(c => c.id === cardId);
            if (card) {
              // Remove from challenger's hand
              const cardIndex = challenger.hand.findIndex(c => c.id === cardId);
              if (cardIndex !== -1) {
                const removedCard = challenger.hand.splice(cardIndex, 1)[0];
                animalCardsToTransfer.push(removedCard);
              }
            }
          });

          // Add animal cards to winner's hand
          winner.hand.push(...animalCardsToTransfer);

          // Exchange money cards between players
          const challengerMoneyCards = challenger.hand.filter(card => 
            challengerOffer.moneyCards.includes(card.id)
          );
          const challengedMoneyCards = challenged.hand.filter(card => 
            challengedOffer.moneyCards.includes(card.id)
          );

          // Remove money cards from both players
          challengerOffer.moneyCards.forEach(cardId => {
            const cardIndex = challenger.hand.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
              challenger.hand.splice(cardIndex, 1);
            }
          });

          challengedOffer.moneyCards.forEach(cardId => {
            const cardIndex = challenged.hand.findIndex(c => c.id === cardId);
            if (cardIndex !== -1) {
              challenged.hand.splice(cardIndex, 1);
            }
          });

          // Exchange money cards
          challenger.hand.push(...challengedMoneyCards);
          challenged.hand.push(...challengerMoneyCards);

          // Update money totals
          challenger.money = challenger.hand
            .filter(card => card.type === 'money')
            .reduce((sum, card) => sum + card.value, 0);
          
          challenged.money = challenged.hand
            .filter(card => card.type === 'money')
            .reduce((sum, card) => sum + card.value, 0);
        }
      }
    }

    // Reset trade state and move to next turn
    game.tradeState = 'none';
    game.tradeInitiator = null;
    game.tradePartner = null;
    game.selectedAnimalCards = [];
    game.tradeOffers = [];
    game.tradeConfirmed = false;

    // Move to next player's turn
    this.moveToNextTurn(game);

    // Start new auction phase
    game.currentPhase = 'auction';
    game.auctionState = 'none';
    game.auctionCard = undefined;
    game.currentBid = 0;
    game.currentBidder = null;
    game.auctioneer = null;
    game.auctionEndTime = undefined;
    game.disqualifiedPlayers = [];
    game.auctionSummary = undefined;

    // Draw a new auction card
    const newAuctionCard = this.drawAuctionCard(game);
    if (newAuctionCard) {
      game.auctionCard = newAuctionCard;
    } else {
      // No more cards in deck, game should end
      game.currentPhase = 'end';
    }

    game.updatedAt = new Date();
    return game;
  }
} 