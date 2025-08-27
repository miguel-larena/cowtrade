import { Card } from '../types/game';

// Animal cards (4 of each type = 40 total)
const animalCards: Card[] = [
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
  
  // Swordfish (4) - seventh lowest value
  { id: 'swordfish_1', type: 'animal', value: 500, name: 'Swordfish' },
  { id: 'swordfish_2', type: 'animal', value: 500, name: 'Swordfish' },
  { id: 'swordfish_3', type: 'animal', value: 500, name: 'Swordfish' },
  { id: 'swordfish_4', type: 'animal', value: 500, name: 'Swordfish' },
  
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

// Money cards
const moneyCards: Card[] = [
  { id: '0', type: 'money', value: 0, name: '0' },
  { id: '10', type: 'money', value: 10, name: '10' },
  { id: '50', type: 'money', value: 50, name: '50' },
  { id: '100', type: 'money', value: 100, name: '100' },
  { id: '200', type: 'money', value: 200, name: '200' },
  { id: '500', type: 'money', value: 500, name: '500' },
];

export function createInitialDeck(): Card[] {
  return [...animalCards, ...moneyCards];
}

export function createStartingHand(): Card[] {
  return [
    { id: `money10_${Date.now()}_1`, type: 'money', value: 10, name: '10' },
    { id: `money10_${Date.now()}_2`, type: 'money', value: 10, name: '10' },
    { id: `money10_${Date.now()}_3`, type: 'money', value: 10, name: '10' },
    { id: `money10_${Date.now()}_4`, type: 'money', value: 10, name: '10' },
    { id: `money0_${Date.now()}_1`, type: 'money', value: 0, name: '0' },
    { id: `money0_${Date.now()}_2`, type: 'money', value: 0, name: '0' },
    { id: `money50_${Date.now()}_1`, type: 'money', value: 50, name: '50' }
  ];
} 