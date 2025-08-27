import React from 'react';
import type { Card as CardType } from '../types';

interface CardModalProps {
  card: CardType;
  isOpen: boolean;
  onClose: () => void;
  isOwnCard?: boolean; // Whether this card belongs to the current player
}

const CardModal: React.FC<CardModalProps> = ({ card, isOpen, onClose, isOwnCard = false }) => {
  if (!isOpen) return null;

  const getCardImage = (card: CardType) => {
    if (card.type === 'money' && !isOwnCard) {
      // Show card back for other players' money cards
      return "/images/cards/back.png";
    } else if (card.type === 'money') {
      // Show actual money card for own cards
      return `/images/cards/${card.value}.png`;
    } else {
      // Always show animal cards
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
              case 'swordfish': return '🐟';
      case 'dolphin': return '🐬';
      case 'shark': return '🦈';
      case 'whale': return '🐋';
      default: return '🐠';
    }
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
    padding: 'clamp(8px, 2vw, 16px)',
  };

  const modalContentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: 'clamp(16px, 4vw, 24px)',
    position: 'relative' as const,
    maxWidth: 'clamp(300px, 90vw, 500px)',
    maxHeight: 'clamp(400px, 90vh, 600px)',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  };

  const closeButtonStyle = {
    position: 'absolute' as const,
    top: 'clamp(8px, 2vw, 12px)',
    right: 'clamp(8px, 2vw, 12px)',
    background: 'none',
    border: 'none',
    fontSize: 'clamp(18px, 4vw, 24px)',
    cursor: 'pointer',
    color: '#666',
    padding: '4px',
    lineHeight: 1,
    zIndex: 10001,
  };

  const cardImageStyle = {
    width: '100%',
    height: 'auto',
    maxHeight: 'clamp(200px, 60vh, 400px)',
    objectFit: 'contain' as const,
    borderRadius: '8px',
  };

  const cardInfoStyle = {
    marginTop: 'clamp(12px, 3vw, 16px)',
    textAlign: 'center' as const,
  };

  const cardNameStyle = {
    fontSize: 'clamp(16px, 4vw, 24px)',
    fontWeight: 'bold' as const,
    color: '#333',
    marginBottom: 'clamp(4px, 1vw, 8px)',
  };

  const cardValueStyle = {
    fontSize: 'clamp(14px, 3.5vw, 18px)',
    color: '#666',
    marginBottom: 'clamp(8px, 2vw, 12px)',
  };

  const cardTypeStyle = {
    fontSize: 'clamp(12px, 3vw, 16px)',
    color: '#999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  };

  const fallbackStyle = {
    width: '100%',
    height: 'clamp(200px, 60vh, 400px)',
    backgroundColor: card.type === 'animal' ? '#f0f8ff' : '#fff8dc',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '8px',
    border: '2px solid #ddd',
  };

  // Get display information based on card type and ownership
  const getCardDisplayInfo = () => {
    if (card.type === 'money' && !isOwnCard) {
      // Other player's money card - show as face-down
      return {
        name: 'Money Card',
        value: '???',
        type: 'Money Card (Face-down)',
        showValue: false
      };
    } else if (card.type === 'money') {
      // Own money card
      return {
        name: `$${card.value}`,
        value: card.value,
        type: 'Money Card',
        showValue: true
      };
    } else {
      // Animal card
      return {
        name: card.name,
        value: card.value,
        type: 'Animal Card',
        showValue: true
      };
    }
  };

  const cardInfo = getCardDisplayInfo();

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button style={closeButtonStyle} onClick={onClose}>
          ✕
        </button>

        {/* Card Image */}
        <img
          src={getCardImage(card)}
          alt={card.type === 'money' ? `$${card.value} money card` : `${card.name} animal card`}
          style={cardImageStyle}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            const fallback = document.createElement('div');
            Object.assign(fallback.style, fallbackStyle);
            
            if (card.type === 'money' && !isOwnCard) {
              // Show card back for other players' money cards
              fallback.innerHTML = `
                <div style="font-size: clamp(24px, 6vw, 48px); margin-bottom: 16px;">
                  🂠
                </div>
                <div style="font-size: clamp(16px, 4vw, 20px); color: #666;">
                  Money Card (Face-down)
                </div>
              `;
            } else if (card.type === 'money') {
              // Show actual value for own money cards
              fallback.innerHTML = `
                <div style="font-size: clamp(32px, 8vw, 64px); font-weight: bold; color: #333; margin-bottom: 16px;">
                  $${card.value}
                </div>
                <div style="font-size: clamp(16px, 4vw, 20px); color: #666;">
                  Money Card
                </div>
              `;
            } else {
              // Animal card
              fallback.innerHTML = `
                <div style="font-size: clamp(24px, 6vw, 48px); margin-bottom: 16px;">
                  ${getAnimalEmoji(card.name)}
                </div>
                <div style="font-size: clamp(18px, 4.5vw, 24px); font-weight: bold; color: #333; margin-bottom: 8px; text-align: center;">
                  ${card.name}
                </div>
                <div style="font-size: clamp(16px, 4vw, 20px); color: #666;">
                  Animal Card
                </div>
              `;
            }
            
            target.parentNode?.replaceChild(fallback, target);
          }}
        />

        {/* Card Information */}
        <div style={cardInfoStyle}>
          <div style={cardNameStyle}>
            {cardInfo.name}
          </div>
          <div style={cardValueStyle}>
            Value: {cardInfo.value}
          </div>
          <div style={cardTypeStyle}>
            {cardInfo.type}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
