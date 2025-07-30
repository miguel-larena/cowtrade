import React, { useState } from 'react';
import type { Player, Card } from '../types';
import CardComponent from './Card';

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
  onCardClick?: (card: Card) => void;
  selectable?: boolean;
  selectedCards?: Card[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  player, 
  isCurrentPlayer,
  isCurrentTurn,
  onCardClick, 
  selectable = false,
  selectedCards = []
}) => {
  const handleCardClick = (card: Card) => {
    onCardClick?.(card);
  };

  const isCardSelected = (card: Card) => {
    // Only show selection when we have selectedCards prop (for trading context)
    if (selectedCards.length > 0) {
      return selectedCards.some(selectedCard => selectedCard.id === card.id);
    }
    // Don't show selection for general card viewing
    return false;
  };

  return (
    <div style={{ 
      border: isCurrentTurn ? '3px solid #28a745' : '2px solid #ddd', 
      borderRadius: '8px', 
      padding: '12px',
      margin: '4px',
      backgroundColor: isCurrentTurn ? '#e8f5e8' : '#f9f9f9',
      boxShadow: isCurrentTurn ? '0 4px 8px rgba(40,167,69,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 8px 0', 
        color: '#333',
        fontSize: 'clamp(14px, 3vw, 18px)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {player.name}
        {isCurrentPlayer && (
          <span style={{ 
            fontSize: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            You
          </span>
        )}
        {isCurrentTurn && (
          <span style={{ 
            fontSize: '12px',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px'
          }}>
            Turn
          </span>
        )}
      </h3>
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 'clamp(4px, 1vw, 8px)',
        minHeight: 'clamp(100px, 15vw, 160px)',
        alignItems: 'flex-start'
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
            const showValue = isCurrentPlayer || card.type === 'animal'; // Show value for own cards or animal cards
            
            return (
              <CardComponent
                key={card.id}
                card={card}
                onClick={() => handleCardClick(card)}
                selected={isCardSelected(card)}
                isOwnCard={isCurrentPlayer}
                showValue={showValue}
              />
            );
          })
        )}
      </div>
      {isCurrentPlayer && (
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