import { useState, useCallback } from 'react';
import { testGameState } from '../testData';
import { placeBid, winAuction, tradeCards } from '../gameLogic';
import type { GameState, Player, GamePhase } from '../types';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(testGameState);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('player1');

  // Phase management
  const changePhase = useCallback((newPhase: GamePhase) => {
    setGameState(prev => {
      // Filter animal cards for auction selection
      const animalCards = prev.deck.filter(card => card.type === 'animal');
      
      return {
        ...prev,
        currentPhase: newPhase,
        currentBid: 0,
        currentBidder: null,
        auctionCard: newPhase === 'auction' && animalCards.length > 0 
          ? animalCards[Math.floor(Math.random() * animalCards.length)] 
          : undefined
      };
    });
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
      // Create starting hand: 4 tens, 2 zeros, 1 fifty
      const startingHand = [
        { id: `money10_${prev.players.length + 1}_1`, type: 'money' as const, value: 10, name: '10' },
        { id: `money10_${prev.players.length + 1}_2`, type: 'money' as const, value: 10, name: '10' },
        { id: `money10_${prev.players.length + 1}_3`, type: 'money' as const, value: 10, name: '10' },
        { id: `money10_${prev.players.length + 1}_4`, type: 'money' as const, value: 10, name: '10' },
        { id: `money0_${prev.players.length + 1}_1`, type: 'money' as const, value: 0, name: '0' },
        { id: `money0_${prev.players.length + 1}_2`, type: 'money' as const, value: 0, name: '0' },
        { id: `money50_${prev.players.length + 1}_1`, type: 'money' as const, value: 50, name: '50' }
      ];

      const newPlayer: Player = {
        id: `player${prev.players.length + 1}`,
        name,
        hand: startingHand,
        money: 90
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
    setGameState(prev => {
      // Filter animal cards for auction selection
      const animalCards = prev.deck.filter(card => card.type === 'animal');
      
      return {
        ...prev,
        currentPhase: 'auction',
        currentTurn: prev.players[0]?.id || 'player1',
        auctionCard: animalCards.length > 0 
          ? animalCards[Math.floor(Math.random() * animalCards.length)]
          : undefined
      };
    });
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