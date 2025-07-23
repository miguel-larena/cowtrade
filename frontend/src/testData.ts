import type { Player, Card, GameState } from './types';

// Test animal cards (4 of each type = 40 total)
export const animalCards: Card[] = [
  // Shrimp (4) - lowest value
  { id: 'shrimp_1', type: 'animal', value: 10, name: 'Shrimp' },
  { id: 'shrimp_2', type: 'animal', value: 10, name: 'Shrimp' },
  { id: 'shrimp_3', type: 'animal', value: 10, name: 'Shrimp' },
  { id: 'shrimp_4', type: 'animal', value: 10, name: 'Shrimp' },

  // Clam (4) - second lowest value
  { id: 'clam_1', type: 'animal', value: 40, name: 'Clam' },
  { id: 'clam_2', type: 'animal', value: 40, name: 'Clam' },
  { id: 'clam_3', type: 'animal', value: 40, name: 'Clam' },
  { id: 'clam_4', type: 'animal', value: 40, name: 'Clam' }, 

  // Lobster (4) - third lowest value
  { id: 'lobster_1', type: 'animal', value: 90, name: 'Lobster' },
  { id: 'lobster_2', type: 'animal', value: 90, name: 'Lobster' },
  { id: 'lobster_3', type: 'animal', value: 90, name: 'Lobster' },
  { id: 'lobster_4', type: 'animal', value: 90, name: 'Lobster' },
  
  // Puffer Fish (4) - fourth lowest value
  { id: 'puffer_fish_1', type: 'animal', value: 160, name: 'Puffer Fish' },
  { id: 'puffer_fish_2', type: 'animal', value: 160, name: 'Puffer Fish' },
  { id: 'puffer_fish_3', type: 'animal', value: 160, name: 'Puffer Fish' },
  { id: 'puffer_fish_4', type: 'animal', value: 160, name: 'Puffer Fish' },
  
  // Turtle (4) - fifth lowest value
  { id: 'turtle_1', type: 'animal', value: 250, name: 'Turtle' },
  { id: 'turtle_2', type: 'animal', value: 250, name: 'Turtle' },
  { id: 'turtle_3', type: 'animal', value: 250, name: 'Turtle' },
  { id: 'turtle_4', type: 'animal', value: 250, name: 'Turtle' },
  
  // Octopus (4) - sixth lowest value
  { id: 'octopus_1', type: 'animal', value: 350, name: 'Octopus' },
  { id: 'octopus_2', type: 'animal', value: 350, name: 'Octopus' },
  { id: 'octopus_3', type: 'animal', value: 350, name: 'Octopus' },
  { id: 'octopus_4', type: 'animal', value: 350, name: 'Octopus' },
  
  // Tuna (4) - seventh lowest value
  { id: 'tuna_1', type: 'animal', value: 500, name: 'Tuna' },
  { id: 'tuna_2', type: 'animal', value: 500, name: 'Tuna' },
  { id: 'tuna_3', type: 'animal', value: 500, name: 'Tuna' },
  { id: 'tuna_4', type: 'animal', value: 500, name: 'Tuna' },
  
  // Dolphin (4) - eighth lowest value
  { id: 'dolphin_1', type: 'animal', value: 650, name: 'Dolphin' },
  { id: 'dolphin_2', type: 'animal', value: 650, name: 'Dolphin' },
  { id: 'dolphin_3', type: 'animal', value: 650, name: 'Dolphin' },
  { id: 'dolphin_4', type: 'animal', value: 650, name: 'Dolphin' },
  
  // Shark (4) - ninth lowest value
  { id: 'shark_1', type: 'animal', value: 800, name: 'Shark' },
  { id: 'shark_2', type: 'animal', value: 800, name: 'Shark' },
  { id: 'shark_3', type: 'animal', value: 800, name: 'Shark' },
  { id: 'shark_4', type: 'animal', value: 800, name: 'Shark' },
  
  // Whale (4) - highest value
  { id: 'whale_1', type: 'animal', value: 1000, name: 'Whale' },
  { id: 'whale_2', type: 'animal', value: 1000, name: 'Whale' },
  { id: 'whale_3', type: 'animal', value: 1000, name: 'Whale' },
  { id: 'whale_4', type: 'animal', value: 1000, name: 'Whale' },
];

// Test money cards
export const moneyCards: Card[] = [
  { id: '0', type: 'money', value: 0, name: '0' },
  { id: '10', type: 'money', value: 10, name: '10' },
  { id: '50', type: 'money', value: 50, name: '50' },
  { id: '100', type: 'money', value: 100, name: '100' },
  { id: '200', type: 'money', value: 200, name: '200' },
  { id: '500', type: 'money', value: 500, name: '500' },
];

// Test players with default hands (money cards only, no animal cards)
export const testPlayers: Player[] = [
  {
    id: 'player1',
    name: 'Alice',
    hand: [
      { id: 'money10_1_1', type: 'money', value: 10, name: '10' },
      { id: 'money10_1_2', type: 'money', value: 10, name: '10' },
      { id: 'money10_1_3', type: 'money', value: 10, name: '10' },
      { id: 'money10_1_4', type: 'money', value: 10, name: '10' },
      { id: 'money0_1_1', type: 'money', value: 0, name: '0' },
      { id: 'money0_1_2', type: 'money', value: 0, name: '0' },
      { id: 'money50_1_1', type: 'money', value: 50, name: '50' }
    ],
    money: 90,
  },
  {
    id: 'player2',
    name: 'Bob',
    hand: [
      { id: 'money10_2_1', type: 'money', value: 10, name: '10' },
      { id: 'money10_2_2', type: 'money', value: 10, name: '10' },
      { id: 'money10_2_3', type: 'money', value: 10, name: '10' },
      { id: 'money10_2_4', type: 'money', value: 10, name: '10' },
      { id: 'money0_2_1', type: 'money', value: 0, name: '0' },
      { id: 'money0_2_2', type: 'money', value: 0, name: '0' },
      { id: 'money50_2_1', type: 'money', value: 50, name: '50' }
    ],
    money: 90,
  },
  {
    id: 'player3',
    name: 'Charlie',
    hand: [
      { id: 'money10_3_1', type: 'money', value: 10, name: '10' },
      { id: 'money10_3_2', type: 'money', value: 10, name: '10' },
      { id: 'money10_3_3', type: 'money', value: 10, name: '10' },
      { id: 'money10_3_4', type: 'money', value: 10, name: '10' },
      { id: 'money0_3_1', type: 'money', value: 0, name: '0' },
      { id: 'money0_3_2', type: 'money', value: 0, name: '0' },
      { id: 'money50_3_1', type: 'money', value: 50, name: '50' }
    ],
    money: 90,
  },
  {
    id: 'player4',
    name: 'Darla',
    hand: [
      { id: 'money10_4_1', type: 'money', value: 10, name: '10' },
      { id: 'money10_4_2', type: 'money', value: 10, name: '10' },
      { id: 'money10_4_3', type: 'money', value: 10, name: '10' },
      { id: 'money10_4_4', type: 'money', value: 10, name: '10' },
      { id: 'money0_4_1', type: 'money', value: 0, name: '0' },
      { id: 'money0_4_2', type: 'money', value: 0, name: '0' },
      { id: 'money50_4_1', type: 'money', value: 50, name: '50' }
    ],
    money: 90,
  },
  {
    id: 'player5',
    name: 'Eve',
    hand: [
      { id: 'money10_5_1', type: 'money', value: 10, name: '10' },
      { id: 'money10_5_2', type: 'money', value: 10, name: '10' },
      { id: 'money10_5_3', type: 'money', value: 10, name: '10' },
      { id: 'money10_5_4', type: 'money', value: 10, name: '10' },
      { id: 'money0_5_1', type: 'money', value: 0, name: '0' },
      { id: 'money0_5_2', type: 'money', value: 0, name: '0' },
      { id: 'money50_5_1', type: 'money', value: 50, name: '50' }
    ],
    money: 90,
  },
  {
    id: 'player6',
    name: 'Frank',
    hand: [
      { id: 'money10_6_1', type: 'money', value: 10, name: '10' },
      { id: 'money10_6_2', type: 'money', value: 10, name: '10' },
      { id: 'money10_6_3', type: 'money', value: 10, name: '10' },
      { id: 'money10_6_4', type: 'money', value: 10, name: '10' },
      { id: 'money0_6_1', type: 'money', value: 0, name: '0' },
      { id: 'money0_6_2', type: 'money', value: 0, name: '0' },
      { id: 'money50_6_1', type: 'money', value: 50, name: '50' }
    ],
    money: 90,
  },
];

// Test game state
export const testGameState: GameState = {
  players: testPlayers,
  // All animal cards are in the deck, plus money cards
  deck: [
    ...animalCards,
    ...moneyCards
  ],
  currentTurn: 'player1',
  currentPhase: 'auction',
  auctionCard: undefined, // No auction card initially
  currentBid: 0,
  currentBidder: null,
  auctionState: 'none', // No auction in progress initially
  auctioneer: null, // No auctioneer initially
  auctionEndTime: undefined, // No end time initially
  disqualifiedPlayers: [], // No disqualified players initially
  tunaCardsDrawn: 0, // No Tuna cards drawn initially
  
  // Trading state
  tradeState: 'none',
  tradeInitiator: null,
  tradePartner: null,
  tradeOffers: [],
  tradeConfirmed: false,
  selectedAnimalCards: []
};
