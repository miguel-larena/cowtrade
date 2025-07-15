import type { Player, Card, GameState } from './types';

// Test animal cards (4 of each type = 40 total)
export const animalCards: Card[] = [
  // Chickens (4)
  { id: 'chicken_1', type: 'animal', value: 10, name: 'Chicken' },
  { id: 'chicken_2', type: 'animal', value: 10, name: 'Chicken' },
  { id: 'chicken_3', type: 'animal', value: 10, name: 'Chicken' },
  { id: 'chicken_4', type: 'animal', value: 10, name: 'Chicken' },
  
  // Geese (4)
  { id: 'goose_1', type: 'animal', value: 40, name: 'Goose' },
  { id: 'goose_2', type: 'animal', value: 40, name: 'Goose' },
  { id: 'goose_3', type: 'animal', value: 40, name: 'Goose' },
  { id: 'goose_4', type: 'animal', value: 40, name: 'Goose' },
  
  // Cats (4)
  { id: 'cat_1', type: 'animal', value: 90, name: 'Cat' },
  { id: 'cat_2', type: 'animal', value: 90, name: 'Cat' },
  { id: 'cat_3', type: 'animal', value: 90, name: 'Cat' },
  { id: 'cat_4', type: 'animal', value: 90, name: 'Cat' },
  
  // Dogs (4)
  { id: 'dog_1', type: 'animal', value: 160, name: 'Dog' },
  { id: 'dog_2', type: 'animal', value: 160, name: 'Dog' },
  { id: 'dog_3', type: 'animal', value: 160, name: 'Dog' },
  { id: 'dog_4', type: 'animal', value: 160, name: 'Dog' },
  
  // Sheep (4)
  { id: 'sheep_1', type: 'animal', value: 250, name: 'Sheep' },
  { id: 'sheep_2', type: 'animal', value: 250, name: 'Sheep' },
  { id: 'sheep_3', type: 'animal', value: 250, name: 'Sheep' },
  { id: 'sheep_4', type: 'animal', value: 250, name: 'Sheep' },
  
  // Goats (4)
  { id: 'goat_1', type: 'animal', value: 350, name: 'Goat' },
  { id: 'goat_2', type: 'animal', value: 350, name: 'Goat' },
  { id: 'goat_3', type: 'animal', value: 350, name: 'Goat' },
  { id: 'goat_4', type: 'animal', value: 350, name: 'Goat' },
  
  // Donkeys (4)
  { id: 'donkey_1', type: 'animal', value: 500, name: 'Donkey' },
  { id: 'donkey_2', type: 'animal', value: 500, name: 'Donkey' },
  { id: 'donkey_3', type: 'animal', value: 500, name: 'Donkey' },
  { id: 'donkey_4', type: 'animal', value: 500, name: 'Donkey' },
  
  // Pigs (4)
  { id: 'pig_1', type: 'animal', value: 650, name: 'Pig' },
  { id: 'pig_2', type: 'animal', value: 650, name: 'Pig' },
  { id: 'pig_3', type: 'animal', value: 650, name: 'Pig' },
  { id: 'pig_4', type: 'animal', value: 650, name: 'Pig' },
  
  // Bulls (4)
  { id: 'bull_1', type: 'animal', value: 800, name: 'Bull' },
  { id: 'bull_2', type: 'animal', value: 800, name: 'Bull' },
  { id: 'bull_3', type: 'animal', value: 800, name: 'Bull' },
  { id: 'bull_4', type: 'animal', value: 800, name: 'Bull' },
  
  // Cows (4)
  { id: 'cow_1', type: 'animal', value: 1000, name: 'Cow' },
  { id: 'cow_2', type: 'animal', value: 1000, name: 'Cow' },
  { id: 'cow_3', type: 'animal', value: 1000, name: 'Cow' },
  { id: 'cow_4', type: 'animal', value: 1000, name: 'Cow' },
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
  
  // Trading state
  tradeState: 'none',
  tradeInitiator: null,
  tradePartner: null,
  tradeOffers: [],
  tradeConfirmed: false,
  selectedAnimalCards: []
};
