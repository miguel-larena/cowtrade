import type { Player, Card, GameState } from './types';

// Test animal cards
export const animalCards: Card[] = [
  { id: 'chicken', type: 'animal', value: 10, name: 'Chicken' },
  { id: 'goose', type: 'animal', value: 40, name: 'Goose' },
  { id: 'cat', type: 'animal', value: 90, name: 'Cat' },
  { id: 'dog', type: 'animal', value: 160, name: 'Dog' },
  { id: 'sheep', type: 'animal', value: 250, name: 'Sheep' },
  { id: 'goat', type: 'animal', value: 350, name: 'Goat' },
  { id: 'donkey', type: 'animal', value: 500, name: 'Donkey' },
  { id: 'pig', type: 'animal', value: 650, name: 'Pig' },
  { id: 'bull', type: 'animal', value: 800, name: 'Bull' },
  { id: 'cow', type: 'animal', value: 1000, name: 'Cow' },
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

// Test players
export const testPlayers: Player[] = [
  {
    id: 'player1',
    name: 'Alice',
    hand: [animalCards[0], moneyCards[1]],
    money: 150,
  },
  {
    id: 'player2',
    name: 'Bob',
    hand: [animalCards[2], moneyCards[3]],
    money: 120,
  },
  {
    id: 'player3',
    name: 'Charlie',
    hand: [animalCards[4], moneyCards[5]],
    money: 200,
  },
  {
    id: 'player4',
    name: 'Darla',
    hand: [animalCards[5], moneyCards[5]],
    money: 200,
  },
];

// Test game state
export const testGameState: GameState = {
  players: testPlayers,
  deck: [...animalCards, ...moneyCards],
  currentTurn: 'player1',
  currentPhase: 'auction',
  auctionCard: animalCards[3],
  currentBid: 0,
  currentBidder: null,
};
