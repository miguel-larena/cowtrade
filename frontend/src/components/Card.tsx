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
  isOwnCard = true, // eslint-disable-line @typescript-eslint/no-unused-vars
  showValue = true
}) => {
  const getCardImage = (card: CardType) => {
    if (card.type === 'money') {
      // Use money card images based on value
      return `/images/cards/${card.value}.png`;
    } else {
      // Use animal card images based on name (convert to lowercase and replace spaces with underscores)
      const animalName = card.name.toLowerCase().replace(' ', '_');
      return `/images/cards/${animalName}.png`;
    }
  };

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
  const imageStyle = {
    width: 'clamp(120px, 12vw, 160px)',
    height: 'clamp(168px, 16.8vw, 224px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: selected ? '3px solid #4CAF50' : 'none',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    objectFit: 'contain' as const,
  };

  const fallbackStyle = {
    width: 'clamp(120px, 12vw, 160px)',
    height: 'clamp(168px, 16.8vw, 224px)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: selected ? '3px solid #4CAF50' : 'none',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    backgroundColor: card.type === 'animal' ? '#f0f8ff' : '#fff8dc',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center' as const,
    boxSizing: 'border-box' as const,
    outline: selected ? 'none' : '1px solid #ccc',
  };

  if (showValue) {
    return (
      <img 
        className="card"
        src={getCardImage(card)}
        alt={card.type === 'money' ? `$${card.value} money card` : `${card.name} animal card (${card.value} points)`}
        style={imageStyle}
        onClick={disabled ? undefined : onClick}
        onError={(e) => {
          // Fallback to styled div if image fails to load
          const target = e.target as HTMLImageElement;
          const fallback = document.createElement('div');
          fallback.className = 'card';
          Object.assign(fallback.style, fallbackStyle);
          
          if (card.type === 'money') {
            fallback.textContent = `$${card.value}`;
            fallback.style.fontSize = 'clamp(14px, 2.5vw, 20px)';
            fallback.style.fontWeight = 'bold';
            fallback.style.color = '#333';
          } else {
            fallback.innerHTML = `
              <div style="font-weight: bold; font-size: clamp(8px, 1.5vw, 12px); text-align: center; line-height: 1.1; margin-bottom: clamp(1px, 0.3vw, 2px);">
                ${card.name}
              </div>
              <div style="font-size: clamp(14px, 2.5vw, 20px); text-align: center; margin: clamp(1px, 0.3vw, 2px) 0;">
                ${getAnimalEmoji(card.name)}
              </div>
              <div style="font-size: clamp(10px, 1.8vw, 14px); font-weight: bold; color: #333; text-align: center;">
                ${card.value}
              </div>
            `;
          }
          
          // Add click handler to fallback
          if (!disabled && onClick) {
            fallback.addEventListener('click', onClick);
          }
          
          // Replace the img with the fallback div
          target.parentNode?.replaceChild(fallback, target);
        }}
      />
    );
  } else {
    // Facedown cards show back image with question mark fallback
    return (
      <img 
        className="card"
        src="/images/cards/back.png"
        alt="Face-down card"
        style={imageStyle}
        onClick={disabled ? undefined : onClick}
        onError={(e) => {
          // Fallback to question mark if back image fails to load
          const target = e.target as HTMLImageElement;
          const fallback = document.createElement('div');
          fallback.className = 'card';
          Object.assign(fallback.style, fallbackStyle);
          
          const questionMark = document.createElement('div');
          questionMark.textContent = '❓';
          questionMark.style.cssText = 'font-size: clamp(14px, 2.5vw, 20px); font-weight: bold; color: #666; text-align: center;';
          fallback.appendChild(questionMark);
          
          // Add click handler to fallback
          if (!disabled && onClick) {
            fallback.addEventListener('click', onClick);
          }
          
          // Replace the img with the fallback div
          target.parentNode?.replaceChild(fallback, target);
        }}
      />
    );
  }
};

export default CardComponent; 