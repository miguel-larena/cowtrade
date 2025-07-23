import { Router, Request, Response } from 'express';
import { gameManager } from '../gameManager';
import { CreateGameRequest, GameResponse } from '../types';

const router = Router();

// Create a new game
router.post('/create', (req: Request<{}, {}, CreateGameRequest>, res: Response<GameResponse>) => {
  try {
    const { players } = req.body;
    
    if (!players || !Array.isArray(players) || players.length < 2) {
      return res.status(400).json({
        gameState: null as any,
        error: 'At least 2 players are required to create a game'
      });
    }

    if (players.length > 6) {
      return res.status(400).json({
        gameState: null as any,
        error: 'Maximum 6 players allowed per game'
      });
    }

    const gameId = gameManager.createGame(players);
    const gameState = gameManager.getGame(gameId);
    
    if (!gameState) {
      return res.status(500).json({
        gameState: null as any,
        error: 'Failed to create game'
      });
    }

    res.status(201).json({
      gameState,
      message: `Game created successfully with ID: ${gameId}`
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({
      gameState: null as any,
      error: 'Internal server error'
    });
  }
});

// Get game state
router.get('/:gameId', (req: Request, res: Response<GameResponse>) => {
  try {
    const { gameId } = req.params;
    const gameState = gameManager.getGame(gameId);
    
    if (!gameState) {
      return res.status(404).json({
        gameState: null as any,
        error: 'Game not found'
      });
    }

    res.json({
      gameState,
      message: 'Game state retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({
      gameState: null as any,
      error: 'Internal server error'
    });
  }
});

// Start an auction
router.post('/:gameId/auction/start', (req: Request, res: Response<GameResponse>) => {
  try {
    const { gameId } = req.params;
    const { auctioneerId } = req.body;
    
    if (!auctioneerId) {
      return res.status(400).json({
        gameState: null as any,
        error: 'auctioneerId is required'
      });
    }

    const gameState = gameManager.startAuction(gameId, auctioneerId);
    
    if (!gameState) {
      return res.status(400).json({
        gameState: null as any,
        error: 'Cannot start auction. Check if it\'s your turn and no auction is in progress.'
      });
    }

    res.json({
      gameState,
      message: 'Auction started successfully'
    });
  } catch (error) {
    console.error('Error starting auction:', error);
    res.status(500).json({
      gameState: null as any,
      error: 'Internal server error'
    });
  }
});

// Place a bid
router.post('/:gameId/auction/bid', (req: Request, res: Response<GameResponse>) => {
  try {
    const { gameId } = req.params;
    const { bidderId, amount } = req.body;
    
    if (!bidderId || typeof amount !== 'number') {
      return res.status(400).json({
        gameState: null as any,
        error: 'bidderId and amount are required'
      });
    }

    const gameState = gameManager.placeBid(gameId, bidderId, amount);
    
    if (!gameState) {
      return res.status(400).json({
        gameState: null as any,
        error: 'Cannot place bid. Check if auction is in progress and bid is valid.'
      });
    }

    res.json({
      gameState,
      message: 'Bid placed successfully'
    });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({
      gameState: null as any,
      error: 'Internal server error'
    });
  }
});

// Get all active games
router.get('/', (req: Request, res: Response) => {
  try {
    const activeGames = gameManager.getActiveGames();
    res.json({
      games: activeGames,
      message: 'Active games retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting active games:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Delete a game
router.delete('/:gameId', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const deleted = gameManager.deleteGame(gameId);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Game not found'
      });
    }

    res.json({
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

export default router; 