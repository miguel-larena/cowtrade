import { useState, useCallback } from 'react';
import { testGameState, animalCards } from '../testData';
import { placeBid, winAuction, tradeCards } from '../gameLogic';
import type { GameState, Player, GamePhase, TradeOffer, TradeState, Card } from '../types';
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
        disqualifiedPlayers: [], // Reset disqualified players when changing phases
        // Reset trading state when changing phases
        tradeState: 'none',
        tradeInitiator: null,
        tradePartner: null,
        tradeOffers: [],
        tradeConfirmed: false,
        selectedAnimalCards: []
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

  // Helper function to calculate Tuna bonus amount
  const getTunaBonusAmount = useCallback((tunaNumber: number) => {
    switch (tunaNumber) {
      case 1: return 50;
      case 2: return 100;
      case 3: return 200;
      case 4: return 500;
      default: return 0;
    }
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
      
      // Check if the selected card is a Tuna
      const isTuna = selectedCard.name === 'Tuna';
      const newTunaCardsDrawn = isTuna ? prev.tunaCardsDrawn + 1 : prev.tunaCardsDrawn;
      const tunaBonusAmount = isTuna ? getTunaBonusAmount(newTunaCardsDrawn) : 0;
      
      // Set auction end time (1 minute from now)
      const endTime = Date.now() + 60000; // 60 seconds (1 minute)

      // Only reset disqualified players if this is a completely new auction
      // (different auctioneer or no previous auctioneer)
      const shouldResetDisqualified = prev.auctioneer !== auctioneerId || !prev.auctioneer;

      // If it's a Tuna, give bonus money to all players
      let updatedPlayers = prev.players;
      if (isTuna && tunaBonusAmount > 0) {
        console.log(`Tuna drawn! Giving $${tunaBonusAmount} to all players`);
        updatedPlayers = prev.players.map(player => {
          const bonusCard: Card = {
            id: `bonus_${player.id}_tuna_${newTunaCardsDrawn}`,
            type: 'money',
            value: tunaBonusAmount,
            name: tunaBonusAmount.toString()
          };
          return {
            ...player,
            hand: [...player.hand, bonusCard],
            money: player.money + tunaBonusAmount
          };
        });
      }

      return {
        ...prev,
        players: updatedPlayers,
        auctionState: 'in_progress',
        auctionCard: selectedCard,
        auctioneer: auctioneerId,
        auctionEndTime: endTime,
        currentBid: 0,
        currentBidder: null,
        disqualifiedPlayers: shouldResetDisqualified ? [] : prev.disqualifiedPlayers, // Only reset for new auctions
        tunaCardsDrawn: newTunaCardsDrawn
      };
    });
  }, [getTunaBonusAmount]);

  const placeBidInAuction = useCallback((bidderId: string, amount: number) => {
    setGameState(prev => {
      console.log('placeBidInAuction called:', {
        bidderId,
        amount,
        currentBid: prev.currentBid,
        auctionState: prev.auctionState,
        auctioneer: prev.auctioneer,
        disqualifiedPlayers: prev.disqualifiedPlayers
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

      // Check if bidder is disqualified
      if (prev.disqualifiedPlayers.includes(bidderId)) {
        console.log('Bidder is disqualified:', { bidderId, disqualifiedPlayers: prev.disqualifiedPlayers });
        return prev; // Disqualified players cannot bid
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
        auctionState: 'summary',
        auctionSummary: {
          type: 'matched_bid',
          message: `${auctioneer.name} matched ${winningBidder.name}'s highest bid of $${prev.currentBid}. ${prev.auctionCard?.name} goes to ${auctioneer.name}`,
          auctioneerName: auctioneer.name,
          winnerName: winningBidder.name,
          bidAmount: prev.currentBid,
          animalName: prev.auctionCard?.name
        },
        currentBid: 0,
        currentBidder: null,
        auctionCard: undefined,
        auctioneer: null,
        auctionEndTime: undefined,
        disqualifiedPlayers: [], // Reset disqualified players when auction completes successfully
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
                auctionState: 'summary',
                auctionSummary: {
                  type: 'no_bids',
                  message: `No bids! ${prev.auctionCard.name} goes to ${auctioneer.name}`,
                  auctioneerName: auctioneer.name,
                  animalName: prev.auctionCard.name
                },
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
            auctionState: 'summary',
            auctionSummary: {
              type: 'bluff_detected',
              message: `${winningBidder.name} bluffed! They bid $${prev.currentBid}, but only has $${totalMoney}. The auction will restart in 5 seconds`,
              auctioneerName: auctioneer.name,
              blufferName: winningBidder.name,
              bidAmount: prev.currentBid,
              blufferMoney: totalMoney,
              animalName: prev.auctionCard?.name
            },
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
          auctionState: 'summary',
          auctionSummary: {
            type: 'normal_win',
            message: `${winningBidder.name} wins with a highest bid of $${prev.currentBid}! ${prev.auctionCard?.name} goes to ${winningBidder.name}`,
            auctioneerName: auctioneer.name,
            winnerName: winningBidder.name,
            bidAmount: prev.currentBid,
            animalName: prev.auctionCard?.name
          },
          currentBid: 0,
          currentBidder: null,
          auctionCard: undefined,
          auctioneer: null,
          auctionEndTime: undefined,
          disqualifiedPlayers: [], // Reset disqualified players when auction completes successfully
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
            auctionState: 'summary',
            auctionSummary: {
              type: 'no_bids',
              message: `No bids! ${prev.auctionCard.name} goes to ${auctioneer.name}`,
              auctioneerName: auctioneer.name,
              animalName: prev.auctionCard.name
            },
            currentBid: 0,
            currentBidder: null,
            auctionCard: undefined,
            auctioneer: null,
            auctionEndTime: undefined,
            disqualifiedPlayers: [], // Reset disqualified players when auction completes successfully
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
          disqualifiedPlayers: [], // Reset disqualified players when auction completes successfully
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

      // If partnerId is provided, go directly to challenger_selecting_cards
      if (partnerId) {
        console.log('Going directly to challenger_selecting_cards with partner:', partnerId);
        return {
          ...prev,
          tradeState: 'challenger_selecting_cards',
          tradeInitiator: initiatorId,
          tradePartner: partnerId,
          tradeOffers: [],
          tradeConfirmed: false,
          selectedAnimalCards: []
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
        tradeConfirmed: false,
        selectedAnimalCards: []
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
        tradeState: 'challenger_selecting_cards',
        tradePartner: partnerId
      };
    });
  }, []);

  const selectAnimalCardsForTrade = useCallback((animalCards: string[]) => {
    setGameState(prev => {
      if (prev.tradeState !== 'challenger_selecting_cards') {
        return prev;
      }

      return {
        ...prev,
        selectedAnimalCards: animalCards,
        tradeState: 'challenger_bidding'
      };
    });
  }, []);

  const makeTradeOffer = useCallback((playerId: string, moneyCards: string[]) => {
    setGameState(prev => {
      // Check if it's the correct player's turn to bid
      if (prev.tradeState === 'challenger_bidding' && playerId !== prev.tradeInitiator) {
        return prev; // Only challenger can bid in challenger_bidding state
      }
      if (prev.tradeState === 'challenged_bidding' && playerId !== prev.tradePartner) {
        return prev; // Only challenged player can bid in challenged_bidding state
      }
      if (prev.tradeState !== 'challenger_bidding' && prev.tradeState !== 'challenged_bidding') {
        return prev;
      }

      // Calculate total value of money cards
      const totalValue = prev.players
        .find(p => p.id === playerId)
        ?.hand.filter(card => moneyCards.includes(card.id))
        .reduce((sum, card) => sum + card.value, 0) || 0;

      const newOffer: TradeOffer = {
        playerId,
        animalCards: playerId === prev.tradeInitiator ? prev.selectedAnimalCards : [], // Only challenger has animal cards
        moneyCards,
        totalValue
      };

      // Update or add the offer
      const updatedOffers = prev.tradeOffers.filter(offer => offer.playerId !== playerId);
      updatedOffers.push(newOffer);

      // Determine next state based on who just bid
      let nextState: TradeState;
      if (prev.tradeState === 'challenger_bidding') {
        // Challenger just bid, now it's challenged player's turn
        nextState = 'challenged_bidding';
      } else {
        // Challenged player just bid, now both have bid - execute trade immediately
        nextState = 'confirming_trade';
        
        // Execute the trade immediately since both players have bid
        const [offer1, offer2] = updatedOffers;
        const player1 = prev.players.find(p => p.id === offer1.playerId);
        const player2 = prev.players.find(p => p.id === offer2.playerId);

        if (!player1 || !player2) {
          return {
            ...prev,
            tradeOffers: updatedOffers,
            tradeState: nextState
          };
        }

        // Check for tie - if both offers are the same value, show tie summary
        if (offer1.totalValue === offer2.totalValue) {
          console.log('Trade tie detected - showing tie summary');
          return {
            ...prev,
            tradeState: 'trade_tie_summary',
            tradeOffers: updatedOffers, // Keep the offers for the summary
            tradeConfirmed: false
          };
        }

        // Determine winner based on money card offers
        const winner = offer1.totalValue > offer2.totalValue ? player1 : player2;
        const loser = winner.id === player1.id ? player2 : player1;
        const winningOffer = winner.id === player1.id ? offer1 : offer2;
        const losingOffer = winner.id === player1.id ? offer2 : offer1;

        // Get all animal cards involved in the trade
        const allAnimalCards = [...prev.selectedAnimalCards];
        
        // Get animal cards from the challenged player (same types as challenger selected)
        const challengedPlayer = prev.tradePartner ? prev.players.find(p => p.id === prev.tradePartner) : null;
        if (challengedPlayer) {
          const selectedAnimalTypes = new Set(
            prev.selectedAnimalCards.map(cardId => 
              prev.players.find(p => p.id === prev.tradeInitiator)?.hand.find(card => card.id === cardId)?.name
            ).filter(Boolean)
          );
          
          const challengedAnimalCards = challengedPlayer.hand
            .filter(card => card.type === 'animal' && selectedAnimalTypes.has(card.name))
            .slice(0, prev.selectedAnimalCards.length); // Same number as challenger selected
          
          allAnimalCards.push(...challengedAnimalCards.map(card => card.id));
        }

        // Execute the trade according to the new rules:
        // 1. Winner keeps their wagered animal cards AND gets loser's animal cards
        // 2. Players exchange money cards (Alice gets Bob's money, Bob gets Alice's money)
        const updatedPlayers = prev.players.map(player => {
          if (player.id === winner.id) {
            // Winner: lose their money cards, keep their wagered animal cards, get loser's animal cards, get loser's money cards
            const newHand = player.hand.filter(card => 
              !winningOffer.moneyCards.includes(card.id)
              // Note: NOT removing wagered animal cards - winner keeps them!
            );
            
            // Add loser's animal cards (same types as wagered)
            const loserAnimalCardObjects = loser.hand.filter(card => 
              allAnimalCards.includes(card.id)
            );
            
            // Add loser's money cards
            const loserMoneyCardObjects = loser.hand.filter(card => 
              losingOffer.moneyCards.includes(card.id)
            );
            
            return {
              ...player,
              hand: [...newHand, ...loserAnimalCardObjects, ...loserMoneyCardObjects]
            };
          }
          
          if (player.id === loser.id) {
            // Loser: lose their money cards, lose their animal cards, get winner's money cards
            const newHand = player.hand.filter(card => 
              !losingOffer.moneyCards.includes(card.id) && 
              !allAnimalCards.includes(card.id)
            );
            
            // Add winner's money cards
            const winnerMoneyCardObjects = winner.hand.filter(card => 
              winningOffer.moneyCards.includes(card.id)
            );
            
            return {
              ...player,
              hand: [...newHand, ...winnerMoneyCardObjects]
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
          currentTurn: prev.players[nextIndex].id,
          selectedAnimalCards: prev.selectedAnimalCards, // Preserve the animal cards for the summary
          tradeOffers: updatedOffers // Preserve the offers for the summary
        };
      }
      
      return {
        ...prev,
        tradeOffers: updatedOffers,
        tradeState: nextState
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
      if (prev.tradeState !== 'trade_complete') {
        return prev;
      }

      // Clear the trade state and move to next turn
      const updatedState: GameState = {
        ...prev,
        tradeState: 'none' as const,
        tradeInitiator: null,
        tradePartner: null,
        tradeOffers: [],
        tradeConfirmed: false,
        selectedAnimalCards: []
      };

      // Check end game conditions after trade
      const shouldEndGame = checkEndGameConditions(updatedState);
      if (shouldEndGame) {
        return {
          ...updatedState,
          currentPhase: 'end'
        };
      }

      return updatedState;
    });
  }, []);

  const restartTradeAfterTie = useCallback(() => {
    setGameState(prev => {
      if (prev.tradeState !== 'trade_tie_summary') {
        return prev;
      }

      console.log('Restarting trade after tie summary');
      return {
        ...prev,
        tradeState: 'challenger_bidding',
        tradeOffers: [],
        tradeConfirmed: false
      };
    });
  }, []);

  // Helper function to check end game conditions
  const checkEndGameConditions = useCallback((state: GameState) => {
    // Condition 1: All animal cards have been auctioned off (deck has no animal cards)
    const animalCardsInDeck = state.deck.filter(card => card.type === 'animal');
    if (animalCardsInDeck.length > 0) {
      return false;
    }

    // Condition 2: All animal quartets have been decided (no player has 1, 2, or 3 of a kind)
    for (const player of state.players) {
      const animalCards = player.hand.filter(card => card.type === 'animal');
      const animalCounts = new Map<string, number>();
      
      for (const card of animalCards) {
        animalCounts.set(card.name, (animalCounts.get(card.name) || 0) + 1);
      }
      
      // Check if any player has incomplete quartets (1, 2, or 3 of a kind)
      for (const [animalType, count] of animalCounts) {
        if (count > 0 && count < 4) {
          return false; // Game should continue - incomplete quartet found
        }
      }
    }

    // All conditions met - game should end
    return true;
  }, []);

  const cancelTrade = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      tradeState: 'none',
      tradeInitiator: null,
      tradePartner: null,
      tradeOffers: [],
      tradeConfirmed: false,
      selectedAnimalCards: []
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

  const clearAuctionSummary = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      auctionState: 'none',
      auctionSummary: undefined
    }));
  }, []);

  const restartAuctionAfterBluff = useCallback(() => {
    setGameState(prev => {
      if (prev.auctionState !== 'summary' || prev.auctionSummary?.type !== 'bluff_detected') {
        return prev;
      }

      // Restart auction with the same card and disqualified players
      const newEndTime = Date.now() + 60000; // 60 seconds (1 minute)
      
      return {
        ...prev,
        auctionState: 'in_progress',
        auctionSummary: undefined,
        currentBid: 0,
        currentBidder: null,
        auctionEndTime: newEndTime
        // Keep the same auctionCard and disqualifiedPlayers
      };
    });
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
    clearAuctionSummary,
    restartAuctionAfterBluff,
    
    // Trading actions
    initiateTrade,
    selectTradePartner,
    selectAnimalCardsForTrade,
    makeTradeOffer,
    confirmTrade,
    executeTrade,
    cancelTrade,
    restartTradeAfterTie,
    
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