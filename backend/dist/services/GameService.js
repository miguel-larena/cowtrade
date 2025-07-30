"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const idGenerator_1 = require("../utils/idGenerator");
const gameSetup_1 = require("../utils/gameSetup");
class GameService {
    constructor() {
        this.games = new Map();
    }
    // Game management methods
    async createGame(playerName) {
        const gameId = (0, idGenerator_1.generateId)();
        const playerId = (0, idGenerator_1.generateId)();
        const startingHand = (0, gameSetup_1.createStartingHand)();
        const player = {
            id: playerId,
            name: playerName,
            hand: startingHand,
            money: 90
        };
        const game = {
            id: gameId,
            players: [player],
            deck: (0, gameSetup_1.createInitialDeck)(),
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
    async getGame(gameId) {
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
    async joinGame(gameId, playerName) {
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
        const playerId = (0, idGenerator_1.generateId)();
        const startingHand = (0, gameSetup_1.createStartingHand)();
        const player = {
            id: playerId,
            name: finalPlayerName,
            hand: startingHand,
            money: 90
        };
        game.players.push(player);
        game.updatedAt = new Date();
        return game;
    }
    async leaveGame(gameId, playerId) {
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
    async deleteGame(gameId) {
        const deleted = this.games.delete(gameId);
        if (!deleted) {
            throw new Error('Game not found');
        }
    }
    // Testing helper method
    clearAllGames() {
        this.games.clear();
    }
    // Game action methods
    async startGame(gameId) {
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
    async startAuction(gameId, playerId) {
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
            console.log(`=== Tuna Bonus: ${game.tunaCardsDrawn} Tuna drawn, bonus amount: $${bonusAmount} ===`);
            // Give bonus to all players
            game.players.forEach(player => {
                console.log(`Before Tuna bonus - ${player.name}: $${player.money}, ${player.hand.filter(c => c.type === 'money').length} money cards`);
                // Add money to player's total
                player.money += bonusAmount;
                // Add the appropriate money card to player's hand
                const bonusCard = {
                    id: `tuna_bonus_${game.tunaCardsDrawn}_${player.id}_${Date.now()}`,
                    type: 'money',
                    value: bonusAmount,
                    name: bonusAmount.toString()
                };
                player.hand.push(bonusCard);
                console.log(`After Tuna bonus - ${player.name}: $${player.money}, ${player.hand.filter(c => c.type === 'money').length} money cards`);
                console.log(`Added bonus card: ${bonusCard.name} ($${bonusCard.value})`);
            });
            console.log(`=== Tuna Bonus Complete ===`);
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
    async placeBid(gameId, playerId, amount) {
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
        // Check if player has enough money cards to pay the bid (excluding $0 bluff cards)
        const moneyCards = player.hand.filter(card => card.type === 'money' && card.value > 0);
        const totalMoneyCards = moneyCards.reduce((sum, card) => sum + card.value, 0);
        const canAfford = totalMoneyCards >= amount;
        if (!canAfford) {
            // Player is bluffing - disqualify them
            game.disqualifiedPlayers.push(playerId);
            // Create bluff detection summary
            game.auctionState = 'summary';
            game.auctionSummary = {
                type: 'bluff_detected',
                message: `${player.name} was caught bluffing! They only have $${totalMoneyCards} in money cards but bid $${amount}. They are disqualified from this auction.`,
                auctioneerName: game.players.find(p => p.id === game.auctioneer)?.name || 'Unknown',
                blufferName: player.name,
                blufferMoney: totalMoneyCards,
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
    async endAuction(gameId) {
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
                    message: `No one bid on the ${game.auctionCard?.name}. ${game.players.find(p => p.id === game.auctioneer)?.name} keeps the card.`,
                    auctioneerName: game.players.find(p => p.id === game.auctioneer)?.name || 'Unknown',
                    animalName: game.auctionCard?.name
                };
                // Give card to auctioneer
                if (game.auctionCard) {
                    const auctioneer = game.players.find(p => p.id === game.auctioneer);
                    if (auctioneer) {
                        auctioneer.hand.push(game.auctionCard);
                    }
                }
            }
            else {
                // There were bids - auctioneer ALWAYS gets option to match
                game.auctionState = 'match_bid_phase';
                game.auctionEndTime = Date.now() + (15 * 1000); // 15 seconds to decide
            }
        }
        else if (game.auctionState === 'match_bid_phase') {
            // Match bid phase timed out - highest bidder wins
            if (game.currentBidder && game.currentBid > 0) {
                this.finalizeAuction(game, 'normal_win');
            }
            else {
                // This shouldn't happen, but handle it gracefully
                game.auctionState = 'summary';
                game.auctionSummary = {
                    type: 'no_bids',
                    message: `No valid bids found. ${game.players.find(p => p.id === game.auctioneer)?.name} keeps the card.`,
                    auctioneerName: game.players.find(p => p.id === game.auctioneer)?.name || 'Unknown',
                    animalName: game.auctionCard?.name
                };
                // Give card to auctioneer
                if (game.auctionCard) {
                    const auctioneer = game.players.find(p => p.id === game.auctioneer);
                    if (auctioneer) {
                        auctioneer.hand.push(game.auctionCard);
                    }
                }
            }
        }
        else {
            throw new Error('No auction in progress');
        }
        game.updatedAt = new Date();
        return game;
    }
    async matchBid(gameId, playerId) {
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
            throw new Error('Not enough money cards to match the bid');
        }
        // Auctioneer matches the bid
        this.finalizeAuction(game, 'matched_bid');
        game.updatedAt = new Date();
        return game;
    }
    async clearAuctionSummary(gameId) {
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
    async restartAuctionAfterBluff(gameId) {
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
    calculateTunaBonus(tunaCardsDrawn) {
        switch (tunaCardsDrawn) {
            case 1: return 50;
            case 2: return 100;
            case 3: return 200;
            default: return 500;
        }
    }
    finalizeAuction(game, summaryType) {
        const winner = game.players.find(p => p.id === game.currentBidder);
        const auctioneer = game.players.find(p => p.id === game.auctioneer);
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
        }
        else {
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
    transferMoneyCards(fromPlayer, toPlayer, amount) {
        const transferredCards = [];
        let remainingAmount = amount;
        console.log(`=== Starting money transfer: ${fromPlayer.name} -> ${toPlayer.name} for $${amount} ===`);
        console.log(`From player hand before:`, fromPlayer.hand.map(c => `${c.name} ($${c.value})`));
        console.log(`To player hand before:`, toPlayer.hand.map(c => `${c.name} ($${c.value})`));
        // Get money cards (excluding $0 bluff cards) and sort by value (highest first for optimal overpayment)
        const moneyCards = fromPlayer.hand
            .filter(card => card.type === 'money' && card.value > 0)
            .sort((a, b) => b.value - a.value);
        console.log(`Money cards to transfer (sorted by highest first):`, moneyCards.map(c => `${c.name} ($${c.value})`));
        // First, try to find exact payment using lowest denominations
        const exactPaymentCards = fromPlayer.hand
            .filter(card => card.type === 'money' && card.value > 0)
            .sort((a, b) => a.value - b.value);
        let exactPaymentTotal = 0;
        const exactPayment = [];
        for (const card of exactPaymentCards) {
            if (exactPaymentTotal >= amount)
                break;
            exactPaymentTotal += card.value;
            exactPayment.push(card);
        }
        console.log(`Exact payment attempt: ${exactPaymentTotal} using ${exactPayment.length} cards`);
        // If we can make exact payment, use that
        if (exactPaymentTotal >= amount) {
            console.log(`Using exact payment strategy`);
            for (const card of exactPayment) {
                if (remainingAmount <= 0)
                    break;
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
        else {
            // If we can't make exact payment, use the smallest single card that covers the amount
            console.log(`Using overpayment strategy`);
            const smallestCoveringCard = moneyCards.find(card => card.value >= amount);
            if (smallestCoveringCard) {
                const cardIndex = fromPlayer.hand.findIndex(c => c.id === smallestCoveringCard.id);
                if (cardIndex !== -1) {
                    const removedCard = fromPlayer.hand.splice(cardIndex, 1)[0];
                    console.log(`Removed card: ${removedCard.name} ($${removedCard.value}) - overpayment of $${removedCard.value - amount}`);
                    toPlayer.hand.push(removedCard);
                    transferredCards.push(removedCard);
                    remainingAmount = 0; // Fully covered by this card
                    console.log(`Remaining amount to transfer: $${remainingAmount}`);
                }
            }
        }
        // Update money totals
        const actualTransferredAmount = amount - remainingAmount;
        fromPlayer.money -= actualTransferredAmount;
        toPlayer.money += actualTransferredAmount;
        console.log(`=== Transfer complete ===`);
        console.log(`Actual transferred amount: $${actualTransferredAmount}`);
        console.log(`From player hand after:`, fromPlayer.hand.map(c => `${c.name} ($${c.value})`));
        console.log(`To player hand after:`, toPlayer.hand.map(c => `${c.name} ($${c.value})`));
        console.log(`From player money: ${fromPlayer.money}, money cards: ${fromPlayer.hand.filter(c => c.type === 'money').length}`);
        console.log(`To player money: ${toPlayer.money}, money cards: ${toPlayer.hand.filter(c => c.type === 'money').length}`);
        console.log(`Transferred cards:`, transferredCards.map(c => `${c.name} ($${c.value})`));
        return transferredCards;
    }
    moveToNextTurn(game) {
        const currentPlayerIndex = game.players.findIndex(p => p.id === game.currentTurn);
        const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
        game.currentTurn = game.players[nextPlayerIndex].id;
    }
    // Trading methods (to be implemented later)
    async initiateTrade(gameId, initiatorId, partnerId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        // TODO: Implement trade initiation logic
        game.updatedAt = new Date();
        return game;
    }
    async makeTradeOffer(gameId, playerId, moneyCards, animalCards) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        // TODO: Implement trade offer logic
        game.updatedAt = new Date();
        return game;
    }
    async executeTrade(gameId) {
        const game = this.games.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        // TODO: Implement trade execution logic
        game.updatedAt = new Date();
        return game;
    }
}
exports.GameService = GameService;
//# sourceMappingURL=GameService.js.map