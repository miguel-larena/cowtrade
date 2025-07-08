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

  // New auction functions
  const startAuction = useCallback((auctioneerId: string) => {
    setGameState(prev => {
      // Check if it's the player's turn
      if (prev.currentTurn !== auctioneerId) {
        return prev; // Not their turn
      }

      // Check if auction is already in progress
      if (prev.auctionState === 'in_progress') {
        return prev; // Auction already running
      }

      // Filter animal cards for auction selection
      const animalCards = prev.deck.filter(card => card.type === 'animal');
      
      if (animalCards.length === 0) {
        return prev; // No animal cards left
      }

      // Select random animal card
      const selectedCard = animalCards[Math.floor(Math.random() * animalCards.length)];
      
      // Set auction end time (1 minute from now)
      const endTime = Date.now() + 60000; // 60 seconds (1 minute)

      return {
        ...prev,
        auctionState: 'in_progress',
        auctionCard: selectedCard,
        auctioneer: auctioneerId,
        auctionEndTime: endTime,
        currentBid: 0,
        currentBidder: null
      };
    });
  }, []);

  const placeBidInAuction = useCallback((bidderId: string, amount: number) => {
    setGameState(prev => {
      console.log('placeBidInAuction called:', {
        bidderId,
        amount,
        currentBid: prev.currentBid,
        auctionState: prev.auctionState,
        auctioneer: prev.auctioneer
      });
      
      // Check if auction is in progress
      if (prev.auctionState !== 'in_progress') {
        console.log('Auction not in progress');
        return prev;
      }

      // Check if bidder is the auctioneer
      if (bidderId === prev.auctioneer) {
        console.log('Bidder is auctioneer');
        return prev; // Auctioneer cannot bid
      }

      // Check if bid is valid (multiple of 10 and higher than current bid)
      if (amount % 10 !== 0 || amount <= prev.currentBid) {
        console.log('Invalid bid:', { amount, currentBid: prev.currentBid, isMultipleOf10: amount % 10 === 0, isHigher: amount > prev.currentBid });
        return prev; // Invalid bid
      }

      // Check if bidder exists (money check removed to allow bluffing)
      const bidder = prev.players.find(p => p.id === bidderId);
      if (!bidder) {
        console.log('Bidder not found:', bidderId);
        return prev;
      }
      
      // Log if this is a bluff
      if (bidder.money < amount) {
        console.log('Bluff detected:', { bidderId, bidderMoney: bidder.money, amount });
      }

      console.log('Bid accepted:', { bidderId, amount });
      return {
        ...prev,
        currentBid: amount,
        currentBidder: bidderId
      };
    });
  }, []);

  const endAuction = useCallback(() => {
    setGameState(prev => {
      if (prev.auctionState !== 'in_progress') {
        return prev;
      }

      return {
        ...prev,
        auctionState: 'ended'
      };
    });
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
      return {
        ...prev,
        currentPhase: 'auction',
        currentTurn: prev.players[0]?.id || 'player1',
        auctionCard: undefined // No auction card at game start
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
    
    // New auction actions
    startAuction,
    placeBidInAuction,
    endAuction,
    
    // Utilities
    getCurrentPlayer,
    getPlayerById,
    isCurrentPlayerTurn,
    
    // Setters
    setCurrentPlayerId
  };
}; 