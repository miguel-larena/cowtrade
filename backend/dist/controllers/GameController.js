"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const GameService_1 = require("../services/GameService");
class GameController {
    constructor() {
        // Game management methods
        this.createGame = async (req, res) => {
            try {
                const { playerName } = req.body;
                const game = await this.gameService.createGame(playerName);
                res.status(201).json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to create game' });
            }
        };
        this.getGame = async (req, res) => {
            try {
                const { gameId } = req.params;
                const game = await this.gameService.getGame(gameId);
                if (!game) {
                    return res.status(404).json({ error: 'Game not found' });
                }
                res.json(game);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to get game' });
            }
        };
        this.joinGame = async (req, res) => {
            try {
                const { gameId } = req.params;
                const { playerName } = req.body;
                const game = await this.gameService.joinGame(gameId, playerName);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to join game' });
            }
        };
        this.deleteGame = async (req, res) => {
            try {
                const { gameId } = req.params;
                await this.gameService.deleteGame(gameId);
                res.status(204).send();
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to delete game' });
            }
        };
        // Game action methods
        this.startGame = async (req, res) => {
            try {
                const { gameId } = req.params;
                const game = await this.gameService.startGame(gameId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to start game' });
            }
        };
        this.startAuction = async (req, res) => {
            try {
                const { gameId } = req.params;
                const { playerId } = req.body;
                const game = await this.gameService.startAuction(gameId, playerId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to start auction' });
            }
        };
        this.placeBid = async (req, res) => {
            try {
                const { gameId } = req.params;
                const { playerId, amount } = req.body;
                const game = await this.gameService.placeBid(gameId, playerId, amount);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to place bid' });
            }
        };
        this.endAuction = async (req, res) => {
            try {
                const { gameId } = req.params;
                const game = await this.gameService.endAuction(gameId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to end auction' });
            }
        };
        this.matchBid = async (req, res) => {
            try {
                const { gameId } = req.params;
                const { playerId } = req.body;
                const game = await this.gameService.matchBid(gameId, playerId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to match bid' });
            }
        };
        this.clearAuctionSummary = async (req, res) => {
            try {
                const { gameId } = req.params;
                const game = await this.gameService.clearAuctionSummary(gameId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to clear auction summary' });
            }
        };
        this.restartAuctionAfterBluff = async (req, res) => {
            try {
                const { gameId } = req.params;
                const game = await this.gameService.restartAuctionAfterBluff(gameId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to restart auction after bluff' });
            }
        };
        this.initiateTrade = async (req, res) => {
            try {
                const { gameId } = req.params;
                const { initiatorId, partnerId } = req.body;
                const game = await this.gameService.initiateTrade(gameId, initiatorId, partnerId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to initiate trade' });
            }
        };
        this.makeTradeOffer = async (req, res) => {
            try {
                const { gameId } = req.params;
                const { playerId, moneyCards, animalCards } = req.body;
                const game = await this.gameService.makeTradeOffer(gameId, playerId, moneyCards, animalCards);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to make trade offer' });
            }
        };
        this.executeTrade = async (req, res) => {
            try {
                const { gameId } = req.params;
                const game = await this.gameService.executeTrade(gameId);
                res.json(game);
            }
            catch (error) {
                res.status(400).json({ error: 'Failed to execute trade' });
            }
        };
        this.gameService = new GameService_1.GameService();
    }
}
exports.GameController = GameController;
//# sourceMappingURL=GameController.js.map