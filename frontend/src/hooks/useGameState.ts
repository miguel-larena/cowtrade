import { useState, useCallback, useEffect } from 'react';
import { apiService } from '../services/api';
import type { GameState } from '../services/api';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('player1');
  const [gameId, setGameId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling for game state updates
  useEffect(() => {
    if (!gameId) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await apiService.getGameState(gameId);
        setGameState(response.gameState);
        setError(null);
      } catch (err) {
        console.error('Error polling game state:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch game state');
      }
    }, 1000); // Poll every second

    return () => clearInterval(pollInterval);
  }, [gameId]);

  // Create a new game
  const createGame = useCallback(async (players: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.createGame(players);
      setGameState(response.gameState);
      
      // Extract game ID from the response message
      const gameIdMatch = response.message?.match(/ID: (game_\w+)/);
      if (gameIdMatch) {
        setGameId(gameIdMatch[1]);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create game';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Start an auction
  const startAuction = useCallback(async (auctioneerId: string) => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.startAuction(gameId, auctioneerId);
      setGameState(response.gameState);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start auction';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Place a bid
  const placeBid = useCallback(async (bidderId: string, amount: number) => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.placeBid(gameId, bidderId, amount);
      setGameState(response.gameState);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to place bid';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Join an existing game
  const joinGame = useCallback(async (existingGameId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getGameState(existingGameId);
      setGameState(response.gameState);
      setGameId(existingGameId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join game';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all active games
  const getActiveGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getActiveGames();
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get active games';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a game
  const deleteGame = useCallback(async () => {
    if (!gameId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await apiService.deleteGame(gameId);
      setGameState(null);
      setGameId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete game';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  // Utility functions
  const getCurrentPlayer = useCallback(() => {
    if (!gameState) return null;
    return gameState.players.find(p => p.id === currentPlayerId);
  }, [gameState, currentPlayerId]);

  const getPlayerById = useCallback((playerId: string) => {
    if (!gameState) return null;
    return gameState.players.find(p => p.id === playerId);
  }, [gameState]);

  const isCurrentPlayerTurn = useCallback((playerId: string) => {
    if (!gameState) return false;
    return gameState.currentTurn === playerId;
  }, [gameState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    gameState,
    currentPlayerId,
    gameId,
    loading,
    error,
    
    // Actions
    createGame,
    startAuction,
    placeBid,
    joinGame,
    getActiveGames,
    deleteGame,
    
    // Utilities
    getCurrentPlayer,
    getPlayerById,
    isCurrentPlayerTurn,
    clearError,
    
    // Setters
    setCurrentPlayerId
  };
}; 