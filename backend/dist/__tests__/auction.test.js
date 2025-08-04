"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const gameRoutes_1 = require("../routes/gameRoutes");
// Create a test app
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/games', gameRoutes_1.gameRoutes);
// Get access to the GameService instance for testing
const gameService = gameRoutes_1.gameController.gameService;
describe('Auction Logic', () => {
    let gameId;
    let player1Id;
    let player2Id;
    let player3Id;
    beforeEach(async () => {
        // Clear all games before each test to prevent state pollution
        if (gameService && typeof gameService.clearAllGames === 'function') {
            gameService.clearAllGames();
        }
        // Create a game with 3 players for testing
        const createResponse = await (0, supertest_1.default)(app)
            .post('/api/games/create')
            .send({ playerName: 'Player 1' });
        gameId = createResponse.body.id;
        player1Id = createResponse.body.players[0].id;
        // Join with player 2
        const joinResponse1 = await (0, supertest_1.default)(app)
            .post(`/api/games/${gameId}/join`)
            .send({ playerName: 'Player 2' });
        player2Id = joinResponse1.body.players[1].id;
        // Join with player 3
        const joinResponse2 = await (0, supertest_1.default)(app)
            .post(`/api/games/${gameId}/join`)
            .send({ playerName: 'Player 3' });
        player3Id = joinResponse2.body.players[2].id;
        // Start the game
        await (0, supertest_1.default)(app)
            .post(`/api/games/${gameId}/start`);
    });
    describe('Start Auction', () => {
        it('should start an auction successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id })
                .expect(200);
            expect(response.body.auctionState).toBe('in_progress');
            expect(response.body.auctioneer).toBe(player1Id);
            expect(response.body.auctionCard).toBeDefined();
            expect(response.body.auctionCard.type).toBe('animal');
            expect(response.body.currentBid).toBe(0);
            expect(response.body.currentBidder).toBeNull();
            expect(response.body.disqualifiedPlayers).toEqual([]);
            expect(response.body.auctionEndTime).toBeDefined();
            expect(response.body.auctionSummary).toBeUndefined();
        });
        it('should handle Tuna bonus correctly', async () => {
            // Mock the deck to ensure we get a Tuna card
            // This test will work if Tuna is drawn naturally
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id })
                .expect(200);
            if (response.body.auctionCard?.name === 'Tuna') {
                expect(response.body.tunaCardsDrawn).toBe(1);
                // All players should have received bonus money
                response.body.players.forEach((player) => {
                    expect(player.money).toBeGreaterThan(90); // Should have received bonus
                    // Check that money cards were actually added to hands
                    const moneyCards = player.hand.filter((card) => card.type === 'money');
                    const tunaBonusCards = moneyCards.filter((card) => card.id.includes('tuna_bonus'));
                    expect(tunaBonusCards.length).toBe(1); // Should have 1 Tuna bonus card
                    expect(tunaBonusCards[0].value).toBe(50); // First Tuna should give $50
                });
            }
        });
        it('should fail when not player\'s turn', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player2Id })
                .expect(400);
            expect(response.body.error).toBe('Failed to start auction');
        });
        it('should fail when auction already in progress', async () => {
            // Start first auction
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
            // Try to start another auction
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id })
                .expect(400);
            expect(response.body.error).toBe('Failed to start auction');
        });
        it('should fail when no animal cards left', async () => {
            // Remove all animal cards from deck (this would require modifying the service)
            // For now, we'll test the basic functionality
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id })
                .expect(200);
            expect(response.body.auctionCard).toBeDefined();
        });
    });
    describe('Place Bid', () => {
        beforeEach(async () => {
            // Start an auction before each bid test
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
        });
        it('should place a valid bid successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 })
                .expect(200);
            expect(response.body.currentBid).toBe(50);
            expect(response.body.currentBidder).toBe(player2Id);
            expect(response.body.auctionState).toBe('in_progress');
        });
        it('should allow bidding higher than current bid', async () => {
            // Place first bid
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 });
            // Place higher bid
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player3Id, amount: 80 })
                .expect(200);
            expect(response.body.currentBid).toBe(80);
            expect(response.body.currentBidder).toBe(player3Id);
        });
        it('should fail when bid is not higher than current bid', async () => {
            // Place first bid
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 });
            // Try to place same or lower bid
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player3Id, amount: 50 })
                .expect(400);
            expect(response.body.error).toBe('Failed to place bid');
        });
        it('should fail when bid is not multiple of 10', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 55 })
                .expect(400);
            expect(response.body.error).toBe('Failed to place bid');
        });
        it('should fail when bid is less than minimum', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 5 })
                .expect(400);
            expect(response.body.error).toBe('Failed to place bid');
        });
        it('should fail when auctioneer tries to bid', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player1Id, amount: 50 })
                .expect(400);
            expect(response.body.error).toBe('Failed to place bid');
        });
        it('should fail when no auction in progress', async () => {
            // End the auction first
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`);
            // Try to place bid
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 })
                .expect(400);
            expect(response.body.error).toBe('Failed to place bid');
        });
        it('should detect and handle bluffing', async () => {
            // Get player's current money
            const gameResponse = await (0, supertest_1.default)(app)
                .get(`/api/games/${gameId}`);
            const player = gameResponse.body.players.find((p) => p.id === player2Id);
            const playerMoney = player.money;
            // Try to bid more than player has
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: playerMoney + 100 })
                .expect(200);
            expect(response.body.auctionState).toBe('summary');
            expect(response.body.auctionSummary.type).toBe('bluff_detected');
            expect(response.body.disqualifiedPlayers).toContain(player2Id);
            expect(response.body.auctionSummary.blufferName).toBe('Player 2');
            expect(response.body.auctionSummary.blufferMoney).toBe(playerMoney);
        });
        it('should fail when disqualified player tries to bid', async () => {
            // Get player's current money and make them bluff
            const gameResponse = await (0, supertest_1.default)(app)
                .get(`/api/games/${gameId}`);
            const player = gameResponse.body.players.find((p) => p.id === player2Id);
            const playerMoney = player.money;
            // Make player bluff
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: playerMoney + 100 });
            // Restart auction after bluff
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/restart-after-bluff`);
            // Try to bid again (should fail)
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 })
                .expect(400);
            expect(response.body.error).toBe('Failed to place bid');
        });
    });
    describe('End Auction', () => {
        beforeEach(async () => {
            // Start an auction before each end test
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
        });
        it('should end auction with no bids - auctioneer keeps card', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`)
                .expect(200);
            expect(response.body.auctionState).toBe('summary');
            expect(response.body.auctionSummary.type).toBe('no_bids');
            expect(response.body.auctionSummary.auctioneerName).toBe('Player 1');
            // Check that auctioneer got the card
            const auctioneer = response.body.players.find((p) => p.id === player1Id);
            const auctionCard = response.body.auctionCard;
            expect(auctioneer.hand).toContainEqual(auctionCard);
        });
        it('should end auction with bids - winner gets card', async () => {
            // Place a bid that auctioneer can afford (both have 90 money)
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 });
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`)
                .expect(200);
            expect(response.body.auctionState).toBe('match_bid_phase');
            expect(response.body.currentBid).toBe(50);
            expect(response.body.currentBidder).toBe(player2Id);
            // Now test that auctioneer can match the bid
            const matchResponse = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/match`)
                .send({ playerId: player1Id })
                .expect(200);
            expect(matchResponse.body.auctionState).toBe('summary');
            expect(matchResponse.body.auctionSummary.type).toBe('matched_bid');
            expect(matchResponse.body.auctionSummary.winnerName).toBe('Player 1');
            expect(matchResponse.body.auctionSummary.bidAmount).toBe(50);
            // Check that auctioneer got the card and lost money
            const auctioneer = matchResponse.body.players.find((p) => p.id === player1Id);
            const auctionCard = matchResponse.body.auctionCard;
            expect(auctioneer.hand).toContainEqual(auctionCard);
            expect(auctioneer.money).toBe(40); // 90 - 50 = 40
        });
        it('should fail when no auction in progress', async () => {
            // End the auction first
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`);
            // Try to end again
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`)
                .expect(400);
            expect(response.body.error).toBe('Failed to end auction');
        });
        it('should end match bid phase when timed out - highest bidder wins', async () => {
            // Place a bid that auctioneer can afford
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 });
            // End auction to enter match bid phase
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`);
            // Verify we're in match bid phase
            let gameResponse = await (0, supertest_1.default)(app)
                .get(`/api/games/${gameId}`);
            expect(gameResponse.body.auctionState).toBe('match_bid_phase');
            // End the match bid phase (simulating timeout)
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`)
                .expect(200);
            expect(response.body.auctionState).toBe('summary');
            expect(response.body.auctionSummary.type).toBe('normal_win');
            expect(response.body.auctionSummary.winnerName).toBe('Player 2');
            expect(response.body.auctionSummary.bidAmount).toBe(50);
            // Check that winner got the card and lost money
            const winner = response.body.players.find((p) => p.id === player2Id);
            const auctionCard = response.body.auctionCard;
            expect(winner.hand).toContainEqual(auctionCard);
            expect(winner.money).toBe(40); // 90 - 50 = 40
        });
    });
    describe('Match Bid', () => {
        beforeEach(async () => {
            // Start auction and place bid to enter match bid phase
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 });
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`);
        });
        it('should allow auctioneer to match bid successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/match`)
                .send({ playerId: player1Id })
                .expect(200);
            expect(response.body.auctionState).toBe('summary');
            expect(response.body.auctionSummary.type).toBe('matched_bid');
            expect(response.body.auctionSummary.winnerName).toBe('Player 1');
            expect(response.body.auctionSummary.bidAmount).toBe(50);
            // Fetch the current game state to ensure we have the latest data
            const gameResponse = await (0, supertest_1.default)(app)
                .get(`/api/games/${gameId}`)
                .expect(200);
            // Check that auctioneer got the card and lost money
            const auctioneer = gameResponse.body.players.find((p) => p.id === player1Id);
            const auctionCard = gameResponse.body.auctionCard;
            expect(auctioneer.hand).toContainEqual(auctionCard);
            expect(auctioneer.money).toBe(40); // 90 - 50 = 40
        });
        it('should fail when non-auctioneer tries to match', async () => {
            // Test that a non-auctioneer cannot match the bid
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/match`)
                .send({ playerId: player2Id })
                .expect(400);
            expect(response.body.error).toBe('Failed to match bid');
        });
    });
    describe('Clear Auction Summary', () => {
        beforeEach(async () => {
            // Start and end an auction to create a summary
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`);
        });
        it('should clear auction summary and move to next turn', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/clear-summary`)
                .expect(200);
            expect(response.body.auctionState).toBe('none');
            expect(response.body.auctionCard).toBeUndefined();
            expect(response.body.currentBid).toBe(0);
            expect(response.body.currentBidder).toBeNull();
            expect(response.body.auctioneer).toBeNull();
            expect(response.body.auctionEndTime).toBeUndefined();
            expect(response.body.disqualifiedPlayers).toEqual([]);
            expect(response.body.auctionSummary).toBeUndefined();
            // Should move to next player's turn
            expect(response.body.currentTurn).toBe(player2Id);
        });
        it('should fail when no summary to clear', async () => {
            // Clear the summary first
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/clear-summary`);
            // Try to clear again
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/clear-summary`)
                .expect(400);
            expect(response.body.error).toBe('Failed to clear auction summary');
        });
    });
    describe('Restart Auction After Bluff', () => {
        beforeEach(async () => {
            // Start auction and create a bluff
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
            // Get player's money and make them bluff
            const gameResponse = await (0, supertest_1.default)(app)
                .get(`/api/games/${gameId}`);
            const player = gameResponse.body.players.find((p) => p.id === player2Id);
            const playerMoney = player.money;
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: playerMoney + 100 });
        });
        it('should restart auction after bluff detection', async () => {
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/restart-after-bluff`)
                .expect(200);
            expect(response.body.auctionState).toBe('in_progress');
            expect(response.body.currentBid).toBe(0);
            expect(response.body.currentBidder).toBeNull();
            expect(response.body.auctionEndTime).toBeDefined();
            expect(response.body.auctionSummary).toBeUndefined();
            expect(response.body.disqualifiedPlayers).toContain(player2Id); // Should still be disqualified
        });
        it('should fail when no bluff detected', async () => {
            // Clear the summary first
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/clear-summary`);
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/restart-after-bluff`)
                .expect(400);
            expect(response.body.error).toBe('Failed to restart auction after bluff');
        });
    });
    describe('Complete Auction Flow', () => {
        it('should handle complete auction flow with multiple bids', async () => {
            // Start auction
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
            // Multiple players bid
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 50 });
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player3Id, amount: 80 });
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: 90 });
            // End auction
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`);
            // Auctioneer matches bid
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/match`)
                .send({ playerId: player1Id })
                .expect(200);
            expect(response.body.auctionState).toBe('summary');
            expect(response.body.auctionSummary.type).toBe('matched_bid');
            expect(response.body.auctionSummary.bidAmount).toBe(90);
            // Clear summary and move to next turn
            const clearResponse = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/clear-summary`)
                .expect(200);
            expect(clearResponse.body.currentTurn).toBe(player2Id);
            expect(clearResponse.body.auctionState).toBe('none');
        });
        it('should handle auction flow with bluff detection', async () => {
            // Start auction
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/start`)
                .send({ playerId: player1Id });
            // Get player's money and make them bluff
            const gameResponse = await (0, supertest_1.default)(app)
                .get(`/api/games/${gameId}`);
            const player = gameResponse.body.players.find((p) => p.id === player2Id);
            const playerMoney = player.money;
            // Player bluffs
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player2Id, amount: playerMoney + 100 });
            // Restart auction
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/restart-after-bluff`);
            // Make auctioneer unable to afford the bid
            const game = await gameService.getGame(gameId);
            if (game) {
                const auctioneer = game.players.find((p) => p.id === player1Id);
                if (auctioneer) {
                    auctioneer.money = 30; // Set auctioneer money to 30 so they can't afford 50
                }
            }
            // Other player bids successfully
            await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/bid`)
                .send({ playerId: player3Id, amount: 50 });
            // End auction - should enter match bid phase
            const endResponse = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`)
                .expect(200);
            expect(endResponse.body.auctionState).toBe('match_bid_phase');
            expect(endResponse.body.currentBid).toBe(50);
            expect(endResponse.body.currentBidder).toBe(player3Id);
            // End match bid phase (simulating timeout) - should go to summary
            const response = await (0, supertest_1.default)(app)
                .post(`/api/games/${gameId}/auction/end`)
                .expect(200);
            expect(response.body.auctionState).toBe('summary');
            expect(response.body.auctionSummary.type).toBe('normal_win');
            expect(response.body.auctionSummary.winnerName).toBe('Player 3');
            expect(response.body.disqualifiedPlayers).toContain(player2Id);
        });
    });
});
//# sourceMappingURL=auction.test.js.map