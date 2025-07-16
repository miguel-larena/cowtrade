import React from 'react';
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  isOwnCard?: boolean; // Whether this card belongs to the current player
  showValue?: boolean; // Whether to show the card's value
}

const CardComponent: React.FC<CardProps> = ({ 
  card, 
  onClick, 
  selected = false, 
  disabled = false,
  isOwnCard = true,
  showValue = true
}) => {
  const getAnimalEmoji = (animalName: string) => {
    switch (animalName.toLowerCase()) {
      case 'shrimp': return '🦐';
      case 'clam': return '🦪';
      case 'lobster': return '🦞';
      case 'puffer fish': return '🐡';
      case 'turtle': return '🐢';
      case 'octopus': return '🐙';
      case 'tuna': return '🐟';
      case 'dolphin': return '🐬';
      case 'shark': return '🦈';
      case 'whale': return '🐋';
      default: return '🐠';
    }
  };
  const cardStyle = {
    border: selected ? '3px solid #4CAF50' : '2px solid #ccc',
    borderRadius: '6px',
    padding: '8px',
    margin: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: card.type === 'animal' ? '#f0f8ff' : '#fff8dc',
    opacity: disabled ? 0.6 : 1,
    minWidth: '60px',
    maxWidth: '80px',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
  };

  return (
    <div 
      className="card"
      style={cardStyle}
      onClick={disabled ? undefined : onClick}
    >
      {showValue ? (
        <>
          {card.type === 'money' ? (
            <div className="card-value" style={{ 
              fontSize: 'clamp(12px, 3vw, 16px)', 
              fontWeight: 'bold', 
              color: '#333', 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              ${card.value}
            </div>
          ) : (
            <>
              <div className="card-name" style={{ fontWeight: 'bold', fontSize: 'clamp(10px, 2.5vw, 14px)', textAlign: 'center' }}>
                {card.name}
              </div>
              <div className="card-emoji" style={{ fontSize: 'clamp(16px, 4vw, 20px)', textAlign: 'center', margin: '4px 0' }}>
                {getAnimalEmoji(card.name)}
              </div>
              <div className="card-value" style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
                {card.value}
              </div>
            </>
          )}
        </>
      ) : card.type === 'money' ? (
        <div className="card-value" style={{ 
          fontSize: 'clamp(12px, 3vw, 16px)', 
          fontWeight: 'bold', 
          color: '#666', 
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}>
          ❓
        </div>
      ) : (
        <>
          <div className="card-name" style={{ fontWeight: 'bold', fontSize: 'clamp(10px, 2.5vw, 14px)', textAlign: 'center' }}>
            {card.name}
          </div>
          <div className="card-emoji" style={{ fontSize: 'clamp(16px, 4vw, 20px)', textAlign: 'center', margin: '4px 0' }}>
            {getAnimalEmoji(card.name)}
          </div>
          <div className="card-value" style={{ fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold', color: '#333', textAlign: 'center' }}>
            {card.value}
          </div>
        </>
      )}
    </div>
  );
};

export default CardComponent; 