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
    borderRadius: '8px',
    padding: 'clamp(6px, 1.5vw, 12px)',
    margin: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: card.type === 'animal' ? '#f0f8ff' : '#fff8dc',
    opacity: disabled ? 0.6 : 1,
    width: 'clamp(70px, 8vw, 120px)',
    height: 'clamp(100px, 12vw, 160px)',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box' as const,
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
              fontSize: 'clamp(14px, 2.5vw, 20px)', 
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
              <div className="card-name" style={{ 
                fontWeight: 'bold', 
                fontSize: 'clamp(10px, 1.8vw, 14px)', 
                textAlign: 'center',
                lineHeight: '1.2',
                marginBottom: 'clamp(2px, 0.5vw, 4px)'
              }}>
                {card.name}
              </div>
              <div className="card-emoji" style={{ 
                fontSize: 'clamp(18px, 3vw, 24px)', 
                textAlign: 'center', 
                margin: 'clamp(2px, 0.5vw, 4px) 0'
              }}>
                {getAnimalEmoji(card.name)}
              </div>
              <div className="card-value" style={{ 
                fontSize: 'clamp(12px, 2vw, 16px)', 
                fontWeight: 'bold', 
                color: '#333', 
                textAlign: 'center'
              }}>
                {card.value}
              </div>
            </>
          )}
        </>
      ) : card.type === 'money' ? (
        <div className="card-value" style={{ 
          fontSize: 'clamp(14px, 2.5vw, 20px)', 
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
          <div className="card-name" style={{ 
            fontWeight: 'bold', 
            fontSize: 'clamp(10px, 1.8vw, 14px)', 
            textAlign: 'center',
            lineHeight: '1.2',
            marginBottom: 'clamp(2px, 0.5vw, 4px)'
          }}>
            {card.name}
          </div>
          <div className="card-emoji" style={{ 
            fontSize: 'clamp(18px, 3vw, 24px)', 
            textAlign: 'center', 
            margin: 'clamp(2px, 0.5vw, 4px) 0'
          }}>
            {getAnimalEmoji(card.name)}
          </div>
          <div className="card-value" style={{ 
            fontSize: 'clamp(12px, 2vw, 16px)', 
            fontWeight: 'bold', 
            color: '#333', 
            textAlign: 'center'
          }}>
            {card.value}
          </div>
        </>
      )}
    </div>
  );
};

export default CardComponent; 