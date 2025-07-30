import { useState, useEffect, useCallback, useRef } from 'react';
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
  leaveGame: () => Promise<void>;
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
  const [originalPlayerName, setOriginalPlayerName] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousPhaseRef = useRef<string | null>(null);

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
      
      // Debug logging for money card transfers
      if (gameState && updatedGameState) {
        console.log(`=== Frontend game state update ===`);
        
        // Log all players' money card changes
        gameState.players.forEach(currentPlayer => {
          const updatedPlayer = updatedGameState.players.find(p => p.id === currentPlayer.id);
          if (updatedPlayer) {
            const currentMoneyCards = currentPlayer.hand.filter(c => c.type === 'money');
            const updatedMoneyCards = updatedPlayer.hand.filter(c => c.type === 'money');
            
            if (currentMoneyCards.length !== updatedMoneyCards.length || 
                currentPlayer.money !== updatedPlayer.money) {
              console.log(`${currentPlayer.name} money cards: ${currentMoneyCards.length} -> ${updatedMoneyCards.length}`);
              console.log(`${currentPlayer.name} money total: $${currentPlayer.money} -> $${updatedPlayer.money}`);
              console.log(`${currentPlayer.name} money cards before:`, currentMoneyCards.map(c => `${c.name} ($${c.value})`));
              console.log(`${currentPlayer.name} money cards after:`, updatedMoneyCards.map(c => `${c.name} ($${c.value})`));
            }
          }
        });
      }
      
      setGameState(updatedGameState);
    } catch (err) {
      console.error('Failed to refresh game state:', err);
      
      // Check if the game was deleted (404 error)
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Game not found') || errorMessage.includes('404')) {
        console.log('Game was deleted, kicking player back to lobby');
        // Clear all game state and return to main lobby
        setGameState(null);
        setGameId(null);
        setCurrentPlayerId(null);
        setOriginalPlayerName(null);
        
        // Clear the polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    }
  }, [gameId, gameState, currentPlayerId]);

  // Start polling when gameId is set
  useEffect(() => {
    if (gameId) {
      // Clear any existing interval
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      
      // Start polling every 2 seconds
      const interval = setInterval(() => {
        refreshGameState();
      }, 2000);
      
      pollingIntervalRef.current = interval;
      
      // Cleanup on unmount or when gameId changes
      return () => {
        clearInterval(interval);
      };
    } else {
      // Clear interval when no game
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, [gameId]);

  // Separate effect to handle currentPlayerId validation when game state changes
  useEffect(() => {
    if (gameState && originalPlayerName && currentPlayerId) {
      const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
      if (!currentPlayer) {
        // Our current player ID is no longer valid, try to find our player by name
        const ourPlayer = gameState.players.find(p => 
          p.name === originalPlayerName || p.name.startsWith(originalPlayerName + ' (')
        );
        if (ourPlayer) {
          setCurrentPlayerId(ourPlayer.id);
        }
      }
    }
  }, [gameState, originalPlayerName, currentPlayerId]);

  // Effect to detect game phase changes and trigger navigation
  useEffect(() => {
    if (gameState && previousPhaseRef.current === 'lobby' && gameState.currentPhase !== 'lobby') {
      // Game has started! Trigger navigation by dispatching a custom event
      window.dispatchEvent(new CustomEvent('gameStarted'));
    }
    
    // Update previous phase reference
    if (gameState) {
      previousPhaseRef.current = gameState.currentPhase;
    } else {
      // Reset when no game state
      previousPhaseRef.current = null;
    }
  }, [gameState]);

  // Game management
  const createGame = useCallback(async (playerName: string) => {
    await handleApiCall(
      () => ApiService.createGame(playerName),
      (newGameState) => {
        setGameState(newGameState);
        setGameId(newGameState.id);
        setCurrentPlayerId(newGameState.players[0]?.id || null);
        setOriginalPlayerName(playerName);
      }
    );
  }, [handleApiCall]);

  const joinGame = useCallback(async (gameIdToJoin: string, playerName: string) => {
    await handleApiCall(
      () => ApiService.joinGame(gameIdToJoin, playerName),
      (updatedGameState) => {
        setGameState(updatedGameState);
        setGameId(gameIdToJoin);
        setOriginalPlayerName(playerName);
        
        // Find the player that just joined
        // Look for players with our name (including modified versions like "yo (1)")
        const matchingPlayers = updatedGameState.players.filter(p => 
          p.name === playerName || p.name.startsWith(playerName + ' (')
        );
        
        if (matchingPlayers.length === 1) {
          // Only one player with this name, must be us
          setCurrentPlayerId(matchingPlayers[0].id);
        } else if (matchingPlayers.length > 1) {
          // Multiple players with similar names, find the one with the most recent ID
          // Since ID format is random + timestamp, we'll use a simpler approach:
          // Find the player that was NOT in the original game state
          // We'll assume the last player in the array is the newest one
          const lastPlayer = matchingPlayers[matchingPlayers.length - 1];
          setCurrentPlayerId(lastPlayer.id);
        }
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

  const leaveGame = useCallback(async () => {
    if (!gameId || !currentPlayerId) return;
    
    await handleApiCall(
      () => ApiService.leaveGame(gameId, currentPlayerId),
      () => {
        setGameState(null);
        setGameId(null);
        setCurrentPlayerId(null);
        setOriginalPlayerName(null);
      }
    );
  }, [gameId, currentPlayerId, handleApiCall]);

  const deleteGame = useCallback(async () => {
    if (!gameId) return;
    
    await handleApiCall(
      () => ApiService.deleteGame(gameId),
      () => {
        setGameState(null);
        setGameId(null);
        setCurrentPlayerId(null);
        setOriginalPlayerName(null);
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
    leaveGame,
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