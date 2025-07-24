import { useState, useEffect, useCallback } from 'react';
import type { GameState } from '../types';
import { ApiService } from '../services/api';

interface UseGameStateReturn {
  gameState: GameState | null;
  loading: boolean;
  error: string | null;
  currentPlayerId: string | null;
  gameId: string | null;
  
  // Game management
  createGame: (playerName: string) => Promise<void>;
  joinGame: (gameId: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  deleteGame: () => Promise<void>;
  
  // Auction actions
  startAuction: (auctioneerId: string) => Promise<void>;
  placeBid: (bidderId: string, amount: number) => Promise<void>;
  endAuction: () => Promise<void>;
  matchBid: () => Promise<void>;
  clearAuctionSummary: () => Promise<void>;
  restartAuctionAfterBluff: () => Promise<void>;
  
  // Trade actions (for future implementation)
  initiateTrade: (initiatorId: string, partnerId: string) => Promise<void>;
  makeTradeOffer: (playerId: string, moneyCards: string[], animalCards: string[]) => Promise<void>;
  executeTrade: () => Promise<void>;
  
  // Utility
  refreshGameState: () => Promise<void>;
}

export const useGameState = (): UseGameStateReturn => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    successCallback?: (result: T) => void
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      if (successCallback) {
        successCallback(result);
      }
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshGameState = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const updatedGameState = await ApiService.getGame(gameId);
      setGameState(updatedGameState);
    } catch (err) {
      console.error('Failed to refresh game state:', err);
    }
  }, [gameId]);

  // Game management
  const createGame = useCallback(async (playerName: string) => {
    await handleApiCall(
      () => ApiService.createGame(playerName),
      (newGameState) => {
        setGameState(newGameState);
        setGameId(newGameState.id);
        setCurrentPlayerId(newGameState.players[0]?.id || null);
      }
    );
  }, [handleApiCall]);

  const joinGame = useCallback(async (gameIdToJoin: string, playerName: string) => {
    await handleApiCall(
      () => ApiService.joinGame(gameIdToJoin, playerName),
      (updatedGameState) => {
        setGameState(updatedGameState);
        setGameId(gameIdToJoin);
        // Find the player that just joined
        const newPlayer = updatedGameState.players.find(p => p.name === playerName);
        setCurrentPlayerId(newPlayer?.id || null);
      }
    );
  }, [handleApiCall]);

  const startGame = useCallback(async () => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.startGame(gameId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  const deleteGame = useCallback(async () => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.deleteGame(gameId),
      () => {
        setGameState(null);
        setGameId(null);
        setCurrentPlayerId(null);
      }
    );
  }, [gameId, handleApiCall]);

  // Auction actions
  const startAuction = useCallback(async (auctioneerId: string) => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.startAuction(gameId, auctioneerId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  const placeBid = useCallback(async (bidderId: string, amount: number) => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.placeBid(gameId, bidderId, amount),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  const endAuction = useCallback(async () => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.endAuction(gameId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  const matchBid = useCallback(async () => {
    if (!gameId || !currentPlayerId) return;
    
    await handleApiCall(
      () => ApiService.matchBid(gameId, currentPlayerId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, currentPlayerId, handleApiCall]);

  const clearAuctionSummary = useCallback(async () => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.clearAuctionSummary(gameId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  const restartAuctionAfterBluff = useCallback(async () => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.restartAuctionAfterBluff(gameId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  // Trade actions (for future implementation)
  const initiateTrade = useCallback(async (initiatorId: string, partnerId: string) => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.initiateTrade(gameId, initiatorId, partnerId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  const makeTradeOffer = useCallback(async (playerId: string, moneyCards: string[], animalCards: string[]) => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.makeTradeOffer(gameId, playerId, moneyCards, animalCards),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  const executeTrade = useCallback(async () => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.executeTrade(gameId),
      (updatedGameState) => {
        setGameState(updatedGameState);
      }
    );
  }, [gameId, handleApiCall]);

  return {
    gameState,
    loading,
    error,
    currentPlayerId,
    gameId,
    
    // Game management
    createGame,
    joinGame,
    startGame,
    deleteGame,
    
    // Auction actions
    startAuction,
    placeBid,
    endAuction,
    matchBid,
    clearAuctionSummary,
    restartAuctionAfterBluff,
    
    // Trade actions
    initiateTrade,
    makeTradeOffer,
    executeTrade,
    
    // Utility
    refreshGameState,
  };
}; 