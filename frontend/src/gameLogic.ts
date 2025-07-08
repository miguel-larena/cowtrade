import type { GameState } from './types';

// Simulate bidding
export const placeBid = (playerId: string, bidAmount: number, gameState: GameState): GameState => {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player || player.money < bidAmount) {
    return gameState; // Invalid bid
  }

  return {
    ...gameState,
    currentBid: bidAmount,
    currentBidder: playerId,
  };
};

// Simulate winning an auction
export const winAuction = (gameState: GameState): GameState => {
  if (!gameState.currentBidder || !gameState.auctionCard) {
    return gameState; // No bidder or auction card
  }

  const updatedPlayers = gameState.players.map(player => {
    if (player.id === gameState.currentBidder && gameState.auctionCard) {
      return {
        ...player,
        hand: [...player.hand, gameState.auctionCard],
        money: player.money - gameState.currentBid,
      };
    }
    return player;
  });

  return {
    ...gameState,
    players: updatedPlayers,
    currentBid: 0,
    currentBidder: null,
    auctionCard: gameState.deck[Math.floor(Math.random() * gameState.deck.length)],
  };
};

// Simulate trading cards
export const tradeCards = (
  player1Id: string,
  player2Id: string,
  card1Id: string,
  card2Id: string,
  gameState: GameState
): GameState => {
  // Step 1: Find both players and validate they exist
  const player1 = gameState.players.find(p => p.id === player1Id);
  const player2 = gameState.players.find(p => p.id === player2Id);
  
  if (!player1 || !player2) {
    return gameState; // Invalid trade - players don't exist
  }
  
  // Step 2: Validate both cards exist in their respective hands
  const card1ToTrade = player1.hand.find(card => card.id === card1Id);
  const card2ToTrade = player2.hand.find(card => card.id === card2Id);
  
  if (!card1ToTrade || !card2ToTrade) {
    return gameState; // Invalid trade - cards don't exist
  }
  
  // Step 3: Create updated players with the traded cards
  const updatedPlayers = gameState.players.map(player => {
    if (player.id === player1Id) {
      return {
        ...player,
        hand: player.hand.filter(card => card.id !== card1Id).concat(card2ToTrade),
      };
    }
    
    if (player.id === player2Id) {
      return {
        ...player,
        hand: player.hand.filter(card => card.id !== card2Id).concat(card1ToTrade),
      };
    }
    
    return player;
  });
  
  return {
    ...gameState,
    players: updatedPlayers,
  };
};