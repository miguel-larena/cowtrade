import { useState, useCallback } from 'react';
import { testGameState } from '../testData';
import { placeBid, winAuction, tradeCards } from '../gameLogic';
import type { GameState, Player, GamePhase } from '../types';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(testGameState);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('player1');

  // Phase management
  const changePhase = useCallback((newPhase: GamePhase) => {
    setGameState(prev => ({
      ...prev,
      currentPhase: newPhase,
      currentBid: 0,
      currentBidder: null,
      auctionCard: newPhase === 'auction' ? prev.deck[Math.floor(Math.random() * prev.deck.length)] : undefined
    }));
  }, []);

  // Turn management
  const nextTurn = useCallback(() => {
    setGameState(prev => {
      const currentIndex = prev.players.findIndex(p => p.id === prev.currentTurn);
      const nextIndex = (currentIndex + 1) % prev.players.length;
      return {
        ...prev,
        currentTurn: prev.players[nextIndex].id
      };
    });
  }, []);

  // Bidding actions
  const handlePlaceBid = useCallback((playerId: string, amount: number) => {
    setGameState(prev => placeBid(playerId, amount, prev));
  }, []);

  const handleWinAuction = useCallback(() => {
    setGameState(prev => winAuction(prev));
  }, []);

  // Trading actions
  const handleTradeCards = useCallback((
    player1Id: string,
    player2Id: string,
    card1Id: string,
    card2Id: string
  ) => {
    setGameState(prev => tradeCards(player1Id, player2Id, card1Id, card2Id, prev));
  }, []);

  // Player management
  const addPlayer = useCallback((name: string) => {
    setGameState(prev => {
      const newPlayer: Player = {
        id: `player${prev.players.length + 1}`,
        name,
        hand: [],
        money: 100
      };
      return {
        ...prev,
        players: [...prev.players, newPlayer]
      };
    });
  }, []);

  const removePlayer = useCallback((playerId: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  }, []);

  // Game flow actions
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPhase: 'auction',
      currentTurn: prev.players[0]?.id || 'player1',
      auctionCard: prev.deck[Math.floor(Math.random() * prev.deck.length)]
    }));
  }, []);

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      currentPhase: 'end'
    }));
  }, []);

  // Utility functions
  const getCurrentPlayer = useCallback(() => {
    return gameState.players.find(p => p.id === currentPlayerId);
  }, [gameState.players, currentPlayerId]);

  const getPlayerById = useCallback((playerId: string) => {
    return gameState.players.find(p => p.id === playerId);
  }, [gameState.players]);

  const isCurrentPlayerTurn = useCallback((playerId: string) => {
    return gameState.currentTurn === playerId;
  }, [gameState.currentTurn]);

  return {
    // State
    gameState,
    currentPlayerId,
    
    // Actions
    changePhase,
    nextTurn,
    handlePlaceBid,
    handleWinAuction,
    handleTradeCards,
    addPlayer,
    removePlayer,
    startGame,
    endGame,
    
    // Utilities
    getCurrentPlayer,
    getPlayerById,
    isCurrentPlayerTurn,
    
    // Setters
    setCurrentPlayerId
  };
}; 