import React, { useState } from 'react';
import type { Player, Card } from '../types';
import CardComponent from './Card';

interface PlayerHandProps {
  player: Player;
  currentPlayerId?: string; // ID of the current player viewing the hand
  onCardClick?: (card: Card) => void;
  selectable?: boolean;
  selectedCards?: Card[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  player, 
  currentPlayerId,
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
      padding: '12px',
      margin: '4px',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ 
        margin: '0 0 8px 0', 
        color: '#333',
        fontSize: 'clamp(14px, 3vw, 18px)'
      }}>
        {player.name}'s Hand
      </h3>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '6px',
        minHeight: '100px'
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
          player.hand.map(card => {
            const isOwnCard = currentPlayerId === player.id;
            const showValue = isOwnCard || card.type === 'animal'; // Show value for own cards or animal cards
            
            return (
              <CardComponent
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
                selected={isCardSelected(card)}
                isOwnCard={isOwnCard}
                showValue={showValue}
              />
            );
          })
        )}
      </div>
      {currentPlayerId === player.id && (
        <div style={{ 
          marginTop: '6px', 
          fontSize: 'clamp(12px, 2.5vw, 14px)', 
          color: '#666',
          fontWeight: 'bold'
        }}>
          Money: ${player.money}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;