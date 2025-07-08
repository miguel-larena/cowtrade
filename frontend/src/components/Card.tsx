import React from 'react';
import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, onClick, selected = false, disabled = false }) => {
  const cardStyle = {
    border: selected ? '3px solid #4CAF50' : '2px solid #ccc',
    borderRadius: '8px',
    padding: '12px',
    margin: '4px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    backgroundColor: card.type === 'animal' ? '#f0f8ff' : '#fff8dc',
    opacity: disabled ? 0.6 : 1,
    minWidth: '80px',
    textAlign: 'center' as const,
    transition: 'all 0.2s ease',
  };

  return (
    <div 
      style={cardStyle}
      onClick={disabled ? undefined : onClick}
    >
      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
        {card.name}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {card.type === 'animal' ? 'Animal' : 'Money'}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
        {card.type === 'money' ? '$' : ''}{card.value}
      </div>
    </div>
  );
};

export default CardComponent; 