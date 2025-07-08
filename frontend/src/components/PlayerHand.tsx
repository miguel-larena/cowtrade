import React, { useState } from 'react';
import type { Player, Card } from '../types';
import CardComponent from './Card';

interface PlayerHandProps {
  player: Player;
  onCardClick?: (card: Card) => void;
  selectable?: boolean;
  selectedCards?: Card[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  player, 
  onCardClick, 
  selectable = false,
  selectedCards = []
}) => {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const handleCardClick = (card: Card) => {
    if (!selectable) {
      onCardClick?.(card);
      return;
    }

    setSelectedCardIds(prev => {
      if (prev.includes(card.id)) {
        return prev.filter(id => id !== card.id);
      } else {
        return [...prev, card.id];
      }
    });
    
    onCardClick?.(card);
  };

  const isCardSelected = (card: Card) => {
    return selectedCards.some(selectedCard => selectedCard.id === card.id) ||
           selectedCardIds.includes(card.id);
  };

  return (
    <div style={{ 
      border: '2px solid #ddd', 
      borderRadius: '8px', 
      padding: '16px',
      margin: '8px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>
        {player.name}'s Hand
      </h3>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px',
        minHeight: '120px'
      }}>
        {player.hand.length === 0 ? (
          <div style={{ 
            color: '#999', 
            fontStyle: 'italic',
            alignSelf: 'center',
            width: '100%',
            textAlign: 'center'
          }}>
            No cards in hand
          </div>
        ) : (
          player.hand.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              onClick={() => handleCardClick(card)}
              selected={isCardSelected(card)}
            />
          ))
        )}
      </div>
      <div style={{ 
        marginTop: '8px', 
        fontSize: '14px', 
        color: '#666',
        fontWeight: 'bold'
      }}>
        Money: ${player.money}
      </div>
    </div>
  );
};

export default PlayerHand;