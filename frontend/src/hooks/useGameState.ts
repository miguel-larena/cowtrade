import { useState, useCallback } from 'react';
import { testGameState, animalCards } from '../testData';
import { placeBid, winAuction, tradeCards } from '../gameLogic';
import type { GameState, Player, GamePhase, TradeOffer } from '../types';
import { selectPaymentCards } from '../utils/payment';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(testGameState);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>('player1');

  // Phase management
  const changePhase = useCallback((newPhase: GamePhase) => {
    setGameState(prev => {
      return {
        ...prev,
        currentPhase: newPhase,
        currentBid: 0,
        currentBidder: null,
        auctionCard: undefined, // No auction card when switching phases
        disqualifiedPlayers: newPhase === 'auction' ? [] : prev.disqualifiedPlayers, // Reset disqualified players when entering auction phase
        // Reset trading state when changing phases
        tradeState: 'none',
        tradeInitiator: null,
        tradePartner: null,
        tradeOffers: [],
        tradeConfirmed: false
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
        currentBidder: null,
        disqualifiedPlayers: [] // Reset disqualified players for new auction
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

  const matchBid = useCallback(() => {
    setGameState(prev => {
      if (prev.auctionState !== 'match_bid_phase') {
        return prev;
      }

      const auctioneer = prev.players.find(p => p.id === prev.auctioneer);
      const winningBidder = prev.players.find(p => p.id === prev.currentBidder);

      if (!auctioneer || !winningBidder || !prev.auctionCard) {
        return prev;
      }

      console.log('Auctioneer matching bid:', {
        auctioneer: auctioneer.name,
        bidAmount: prev.currentBid,
        winningBidder: winningBidder.name
      });

      // Calculate payment from auctioneer to winning bidder
      const moneyCards = auctioneer.hand.filter(card => card.type === 'money');
      const requiredAmount = prev.currentBid;
      
      // Use utility to select payment cards
      const cardsToRemove = selectPaymentCards(moneyCards, requiredAmount);
      const totalPaid = moneyCards.filter(card => cardsToRemove.includes(card.id)).reduce((sum, card) => sum + card.value, 0);

      console.log('Match bid payment calculation:', {
        requiredAmount,
        totalPaid,
        cardsToRemove,
        overpayment: totalPaid - requiredAmount
      });

      // Get the money cards that the auctioneer is paying with
      const paidMoneyCards = auctioneer.hand.filter(card => cardsToRemove.includes(card.id));
      
      // Update players
      const updatedPlayers = prev.players.map(player => {
        if (player.id === auctioneer.id) {
          // Auctioneer pays the bid amount and keeps the card
          const newHand = player.hand.filter(card => !cardsToRemove.includes(card.id));
          if (prev.auctionCard) {
            newHand.push(prev.auctionCard);
          }
          
          return {
            ...player,
            hand: newHand,
            money: player.money - totalPaid
          };
        }
        
        if (player.id === winningBidder.id) {
          // Winning bidder receives the money cards but doesn't get the auction card
          const newHand = [...player.hand, ...paidMoneyCards];
          
          return {
            ...player,
            hand: newHand,
            money: player.money + totalPaid
          };
        }
        
        return player;
      });

      // Progress to next turn after successful auction
      const currentIndex = prev.players.findIndex(p => p.id === prev.currentTurn);
      const nextIndex = (currentIndex + 1) % prev.players.length;
      
      const updatedDeck = prev.auctionCard ? prev.deck.filter(card => card.id !== prev.auctionCard!.id) : prev.deck;
      
      return {
        ...prev,
        players: updatedPlayers,
        auctionState: 'none', // Reset to 'none' for next player's turn
        currentBid: 0,
        currentBidder: null,
        auctionCard: undefined,
        auctioneer: null,
        auctionEndTime: undefined,
        currentTurn: prev.players[nextIndex].id,
        deck: updatedDeck
      };
    });
  }, []);

  const endAuction = useCallback(() => {
    setGameState(prev => {
      if (prev.auctionState === 'match_bid_phase') {
        // Match bid phase timed out, proceed with original transaction
        console.log('Match bid phase timed out, proceeding with original transaction');
        
        const winningBidder = prev.players.find(p => p.id === prev.currentBidder);
        const auctioneer = prev.players.find(p => p.id === prev.auctioneer);

        if (!winningBidder || !auctioneer || !prev.auctionCard) {
          return {
            ...prev,
            auctionState: 'ended',
            currentBid: 0,
            currentBidder: null,
            auctionCard: undefined,
            auctioneer: null,
            auctionEndTime: undefined
          };
        }

        // Check if this was a bluff (winning bidder can't afford the bid)
        const moneyCards = winningBidder.hand.filter(card => card.type === 'money');
        const totalMoney = moneyCards.reduce((sum, card) => sum + card.value, 0);
        
        if (totalMoney < prev.currentBid) {
          // Bluff detected - bluffer is disqualified
          console.log('Bluff detected - bluffer disqualified:', {
            bidder: winningBidder.name,
            bidAmount: prev.currentBid,
            availableMoney: totalMoney
          });
          
          const newDisqualifiedPlayers = [...prev.disqualifiedPlayers, winningBidder.id];
          
          // Check if all bidders are now disqualified
          const bidders = prev.players.filter(player => player.id !== prev.auctioneer);
          const allBiddersDisqualified = bidders.every(bidder => newDisqualifiedPlayers.includes(bidder.id));
          
          if (allBiddersDisqualified) {
            // All bidders disqualified - auctioneer takes card for free
            if (prev.auctionCard) {
              console.log('All bidders disqualified - auctioneer takes card for free');
              
              const updatedPlayers = prev.players.map(player => {
                if (player.id === auctioneer.id) {
                  return {
                    ...player,
                    hand: [...player.hand, prev.auctionCard!]
                  };
                }
                return player;
              });
              
              // Progress to next turn after all bidders disqualified
              const currentIndex = prev.players.findIndex(p => p.id === prev.currentTurn);
              const nextIndex = (currentIndex + 1) % prev.players.length;
              
              const updatedDeck = prev.auctionCard ? prev.deck.filter(card => card.id !== prev.auctionCard!.id) : prev.deck;
              
              return {
                ...prev,
                players: updatedPlayers,
                disqualifiedPlayers: newDisqualifiedPlayers,
                auctionState: 'none', // Reset to 'none' for next player's turn
                currentBid: 0,
                currentBidder: null,
                auctionCard: undefined,
                auctioneer: null,
                auctionEndTime: undefined,
                currentTurn: prev.players[nextIndex].id,
                deck: updatedDeck
              };
            }
          }
          
          // Restart auction with the bluffing bidder disqualified
          const newEndTime = Date.now() + 60000; // 60 seconds (1 minute)
          
          const updatedDeck = prev.auctionCard ? prev.deck.filter(card => card.id !== prev.auctionCard!.id) : prev.deck;
          
          return {
            ...prev,
            disqualifiedPlayers: newDisqualifiedPlayers,
            auctionState: 'in_progress',
            currentBid: 0,
            currentBidder: null,
            auctionEndTime: newEndTime,
            deck: updatedDeck
          };
        }
        
        // Normal transaction - winning bidder can afford the bid
        const requiredAmount = prev.currentBid;
        
        // Use utility to select payment cards
        const cardsToRemove = selectPaymentCards(moneyCards, requiredAmount);
        const totalPaid = moneyCards.filter(card => cardsToRemove.includes(card.id)).reduce((sum, card) => sum + card.value, 0);

        console.log('Original transaction payment calculation:', {
          requiredAmount,
          totalPaid,
          cardsToRemove,
          overpayment: totalPaid - requiredAmount
        });

        // Update players for original transaction
        const updatedPlayers = prev.players.map(player => {
          if (player.id === winningBidder.id) {
            // Remove paid money cards and add auction card
            const newHand = player.hand.filter(card => !cardsToRemove.includes(card.id));
            if (prev.auctionCard) {
              newHand.push(prev.auctionCard);
            }
            
            return {
              ...player,
              hand: newHand,
              money: player.money - totalPaid
            };
          }
          
          if (player.id === auctioneer.id) {
            // Auctioneer receives the payment - get the money cards that were paid
            const paidMoneyCards = winningBidder.hand.filter(card => cardsToRemove.includes(card.id));
            return {
              ...player,
              hand: [...player.hand, ...paidMoneyCards],
              money: player.money + totalPaid
            };
          }
          
          return player;
        });

        // Progress to next turn after successful auction
        const currentIndex = prev.players.findIndex(p => p.id === prev.currentTurn);
        const nextIndex = (currentIndex + 1) % prev.players.length;
        
        const updatedDeck = prev.auctionCard ? prev.deck.filter(card => card.id !== prev.auctionCard!.id) : prev.deck;
        
        return {
          ...prev,
          players: updatedPlayers,
          auctionState: 'none', // Reset to 'none' for next player's turn
          currentBid: 0,
          currentBidder: null,
          auctionCard: undefined,
          auctioneer: null,
          auctionEndTime: undefined,
          currentTurn: prev.players[nextIndex].id,
          deck: updatedDeck
        };
      }

      if (prev.auctionState !== 'in_progress') {
        return prev;
      }

      // If no one bid, auctioneer takes the card for free
      if (!prev.currentBidder || !prev.auctionCard) {
        const auctioneer = prev.players.find(p => p.id === prev.auctioneer);
        
        if (auctioneer && prev.auctionCard) {
          console.log('No bids - auctioneer takes card for free:', {
            auctioneer: auctioneer.name,
            card: prev.auctionCard.name
          });
          
          // Update auctioneer to receive the card
          const updatedPlayers = prev.players.map(player => {
            if (player.id === auctioneer.id) {
              return {
                ...player,
                hand: [...player.hand, prev.auctionCard!]
              };
            }
            return player;
          });
          
          // Progress to next turn after auctioneer takes card for free
          const currentIndex = prev.players.findIndex(p => p.id === prev.currentTurn);
          const nextIndex = (currentIndex + 1) % prev.players.length;
          
          const updatedDeck = prev.auctionCard ? prev.deck.filter(card => card.id !== prev.auctionCard!.id) : prev.deck;
          
          return {
            ...prev,
            players: updatedPlayers,
            auctionState: 'none', // Reset to 'none' for next player's turn
            currentBid: 0,
            currentBidder: null,
            auctionCard: undefined,
            auctioneer: null,
            auctionEndTime: undefined,
            currentTurn: prev.players[nextIndex].id,
            deck: updatedDeck
          };
        }
        
        const updatedDeck = prev.auctionCard ? prev.deck.filter(card => card.id !== prev.auctionCard!.id) : prev.deck;
        
        return {
          ...prev,
          auctionState: 'none', // Reset to 'none' for next player's turn
          currentBid: 0,
          currentBidder: null,
          auctionCard: undefined,
          auctioneer: null,
          auctionEndTime: undefined,
          deck: updatedDeck
        };
      }

      // Check if the winning bidder can afford their bid
      const winningBidder = prev.players.find(p => p.id === prev.currentBidder);
      if (!winningBidder) {
        return prev;
      }

      const moneyCards = winningBidder.hand.filter(card => card.type === 'money');
      const totalMoney = moneyCards.reduce((sum, card) => sum + card.value, 0);
      
      // If the winning bidder bluffed and can't afford the bid
      if (totalMoney < prev.currentBid) {
        console.log('Bluffing bidder detected - entering match bid phase:', {
          bidder: winningBidder.name,
          bidAmount: prev.currentBid,
          availableMoney: totalMoney,
          bluffAmount: prev.currentBid - totalMoney
        });
        
        // Go to match bid phase - auctioneer can choose to match the bluff
        // If auctioneer matches, the bluff is successful and auctioneer pays the bluffer
        // If auctioneer doesn't match, the bluff is detected and bluffer is disqualified
        return {
          ...prev,
          auctionState: 'match_bid_phase',
          auctionEndTime: Date.now() + 5000 // 5 seconds for match bid phase
          // Don't update players yet - wait for match bid decision or timeout
        };
      }

      const auctioneer = prev.players.find(p => p.id === prev.auctioneer);

      if (!auctioneer) {
        return prev;
      }

      console.log('Processing auction end:', {
        winningBidder: winningBidder.name,
        bidAmount: prev.currentBid,
        auctioneer: auctioneer.name,
        auctionCard: prev.auctionCard?.name
      });

      // Calculate payment - find the best combination of money cards
      const requiredAmount = prev.currentBid;
      // Use utility to select payment cards
      const cardsToRemove = selectPaymentCards(moneyCards, requiredAmount);
      const totalPaid = moneyCards.filter(card => cardsToRemove.includes(card.id)).reduce((sum, card) => sum + card.value, 0);

      console.log('Payment calculation:', {
        requiredAmount,
        totalPaid,
        cardsToRemove,
        overpayment: totalPaid - requiredAmount
      });

      return {
        ...prev,
        auctionState: 'match_bid_phase',
        auctionEndTime: Date.now() + 5000 // 5 seconds for match bid phase
        // Don't update players yet - wait for match bid decision or timeout
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

  // Debug functions for testing
  const emptyDeck = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      deck: prev.deck.filter(card => card.type !== 'animal')
    }));
  }, []);

  const addAnimalCards = useCallback(() => {
    setGameState(prev => {
      return {
        ...prev,
        deck: [...prev.deck, ...animalCards]
      };
    });
  }, []);

  // Trading functions
  const initiateTrade = useCallback((initiatorId: string, partnerId?: string) => {
    console.log('initiateTrade called:', { initiatorId, partnerId });
    
    setGameState(prev => {
      console.log('initiateTrade state update:', {
        currentTurn: prev.currentTurn,
        initiatorId,
        isTurnMatch: prev.currentTurn === initiatorId
      });
      
      // Check if it's the player's turn
      if (prev.currentTurn !== initiatorId) {
        console.log('Not player\'s turn, ignoring initiateTrade');
        return prev; // Not their turn
      }

      // If partnerId is provided, go directly to making_offers
      if (partnerId) {
        console.log('Going directly to making_offers with partner:', partnerId);
        return {
          ...prev,
          tradeState: 'making_offers',
          tradeInitiator: initiatorId,
          tradePartner: partnerId,
          tradeOffers: [],
          tradeConfirmed: false
        };
      }

      // Otherwise, go to selecting_partner
      console.log('Going to selecting_partner');
      return {
        ...prev,
        tradeState: 'selecting_partner',
        tradeInitiator: initiatorId,
        tradePartner: null,
        tradeOffers: [],
        tradeConfirmed: false
      };
    });
  }, []);

  const selectTradePartner = useCallback((partnerId: string) => {
    setGameState(prev => {
      if (prev.tradeState !== 'selecting_partner') {
        return prev;
      }

      return {
        ...prev,
        tradeState: 'making_offers',
        tradePartner: partnerId
      };
    });
  }, []);

  const makeTradeOffer = useCallback((playerId: string, animalCards: string[], moneyCards: string[]) => {
    setGameState(prev => {
      if (prev.tradeState !== 'making_offers') {
        return prev;
      }

      // Calculate total value of money cards
      const totalValue = prev.players
        .find(p => p.id === playerId)
        ?.hand.filter(card => moneyCards.includes(card.id))
        .reduce((sum, card) => sum + card.value, 0) || 0;

      const newOffer: TradeOffer = {
        playerId,
        animalCards,
        moneyCards,
        totalValue
      };

      // Update or add the offer
      const updatedOffers = prev.tradeOffers.filter(offer => offer.playerId !== playerId);
      updatedOffers.push(newOffer);

      // If both players have made offers, move to confirmation
      const bothOffersMade = updatedOffers.length === 2;
      
      return {
        ...prev,
        tradeOffers: updatedOffers,
        tradeState: bothOffersMade ? 'confirming_trade' : 'making_offers'
      };
    });
  }, []);

  const confirmTrade = useCallback((playerId: string) => {
    setGameState(prev => {
      if (prev.tradeState !== 'confirming_trade') {
        return prev;
      }

      console.log(`Player ${playerId} confirmed the trade`);
      return {
        ...prev,
        tradeConfirmed: true
      };
    });
  }, []);

  const executeTrade = useCallback(() => {
    setGameState(prev => {
      if (prev.tradeState !== 'confirming_trade' || !prev.tradeConfirmed) {
        return prev;
      }

      if (prev.tradeOffers.length !== 2) {
        return prev;
      }

      const [offer1, offer2] = prev.tradeOffers;
      const player1 = prev.players.find(p => p.id === offer1.playerId);
      const player2 = prev.players.find(p => p.id === offer2.playerId);

      if (!player1 || !player2) {
        return prev;
      }

      // Validate trade: both players must trade same number of animal cards
      const animalCardCount1 = offer1.animalCards.length;
      const animalCardCount2 = offer2.animalCards.length;
      
      if (animalCardCount1 !== animalCardCount2 || (animalCardCount1 !== 2 && animalCardCount1 !== 4)) {
        return prev; // Invalid trade
      }

      // Execute the trade
      const updatedPlayers = prev.players.map(player => {
        if (player.id === offer1.playerId) {
          // Player 1 gives animal cards and money cards, receives player 2's offer
          const newHand = player.hand.filter(card => 
            !offer1.animalCards.includes(card.id) && 
            !offer1.moneyCards.includes(card.id)
          );
          
          // Add player 2's animal cards
          const player2AnimalCards = player2.hand.filter(card => 
            offer2.animalCards.includes(card.id)
          );
          
          // Add player 2's money cards
          const player2MoneyCards = player2.hand.filter(card => 
            offer2.moneyCards.includes(card.id)
          );

          return {
            ...player,
            hand: [...newHand, ...player2AnimalCards, ...player2MoneyCards]
          };
        }
        
        if (player.id === offer2.playerId) {
          // Player 2 gives animal cards and money cards, receives player 1's offer
          const newHand = player.hand.filter(card => 
            !offer2.animalCards.includes(card.id) && 
            !offer2.moneyCards.includes(card.id)
          );
          
          // Add player 1's animal cards
          const player1AnimalCards = player1.hand.filter(card => 
            offer1.animalCards.includes(card.id)
          );
          
          // Add player 1's money cards
          const player1MoneyCards = player1.hand.filter(card => 
            offer1.moneyCards.includes(card.id)
          );

          return {
            ...player,
            hand: [...newHand, ...player1AnimalCards, ...player1MoneyCards]
          };
        }
        
        return player;
      });

      // Progress to next turn after successful trade
      const currentIndex = prev.players.findIndex(p => p.id === prev.currentTurn);
      const nextIndex = (currentIndex + 1) % prev.players.length;

      return {
        ...prev,
        players: updatedPlayers,
        tradeState: 'trade_complete',
        currentTurn: prev.players[nextIndex].id
      };
    });
  }, []);

  const cancelTrade = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      tradeState: 'none',
      tradeInitiator: null,
      tradePartner: null,
      tradeOffers: [],
      tradeConfirmed: false
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
    matchBid,
    
    // Trading actions
    initiateTrade,
    selectTradePartner,
    makeTradeOffer,
    confirmTrade,
    executeTrade,
    cancelTrade,
    
    // Utilities
    getCurrentPlayer,
    getPlayerById,
    isCurrentPlayerTurn,
    
    // Setters
    setCurrentPlayerId,
    
    // Debug functions
    emptyDeck,
    addAnimalCards
  };
}; 