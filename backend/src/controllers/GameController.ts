import { Request, Response } from 'express';
import { GameService } from '../services/GameService';

export class GameController {
  private gameService: GameService;

  constructor() {
    this.gameService = new GameService();
  }

  // Game management methods
  createGame = async (req: Request, res: Response) => {
    try {
      const { playerName } = req.body;
      const game = await this.gameService.createGame(playerName);
      res.status(201).json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create game' });
    }
  };

  getGame = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const game = await this.gameService.getGame(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get game' });
    }
  };

  joinGame = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { playerName } = req.body;
      const game = await this.gameService.joinGame(gameId, playerName);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to join game' });
    }
  };

  deleteGame = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      await this.gameService.deleteGame(gameId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete game' });
    }
  };

  // Game action methods
  startGame = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const game = await this.gameService.startGame(gameId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to start game' });
    }
  };

  startAuction = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.body;
      const game = await this.gameService.startAuction(gameId, playerId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to start auction' });
    }
  };

  placeBid = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { playerId, amount } = req.body;
      const game = await this.gameService.placeBid(gameId, playerId, amount);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to place bid' });
    }
  };

  endAuction = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const game = await this.gameService.endAuction(gameId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to end auction' });
    }
  };

  matchBid = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { playerId } = req.body;
      const game = await this.gameService.matchBid(gameId, playerId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to match bid' });
    }
  };

  clearAuctionSummary = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const game = await this.gameService.clearAuctionSummary(gameId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to clear auction summary' });
    }
  };

  restartAuctionAfterBluff = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const game = await this.gameService.restartAuctionAfterBluff(gameId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to restart auction after bluff' });
    }
  };

  initiateTrade = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { initiatorId, partnerId } = req.body;
      const game = await this.gameService.initiateTrade(gameId, initiatorId, partnerId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to initiate trade' });
    }
  };

  makeTradeOffer = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const { playerId, moneyCards, animalCards } = req.body;
      const game = await this.gameService.makeTradeOffer(gameId, playerId, moneyCards, animalCards);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to make trade offer' });
    }
  };

  executeTrade = async (req: Request, res: Response) => {
    try {
      const { gameId } = req.params;
      const game = await this.gameService.executeTrade(gameId);
      res.json(game);
    } catch (error) {
      res.status(400).json({ error: 'Failed to execute trade' });
    }
  };
} 