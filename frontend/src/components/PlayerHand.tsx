import React from 'react';
import type { Player, Card } from '../types';
import CardComponent from './Card';

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer: boolean;
  isCurrentTurn: boolean;
  onCardClick?: (card: Card) => void;
  selectable?: boolean;
  selectedCards?: Card[];
  showBluffInfo?: boolean;
  bluffInfo?: {
    blufferName: string;
    blufferMoney: number;
    bidAmount: number;
    animalName: string;
  };
  currentAuctioneer?: string | null;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ 
  player, 
  isCurrentPlayer,
  isCurrentTurn,
  onCardClick, 
  selectable = false,
  selectedCards = [],
  showBluffInfo = false,
  bluffInfo,
  currentAuctioneer
}) => {
  // Debug logging for Tuna bonus cards
  React.useEffect(() => {
    const tunaBonusCards = player.hand.filter(card => card.id.includes('tuna_bonus'));
    if (tunaBonusCards.length > 0) {
      console.log(`🎯 PlayerHand: ${player.name} has ${tunaBonusCards.length} Tuna bonus cards:`, tunaBonusCards.map(c => `${c.name} ($${c.value})`));
    }
  }, [player.hand, player.name]);
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
      padding: 'clamp(4px, 1vw, 8px)',
      margin: '4px',
      backgroundColor: isCurrentTurn ? '#e8f5e8' : '#f9f9f9',
      boxShadow: isCurrentTurn ? '0 4px 8px rgba(40,167,69,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ 
        margin: '0 0 clamp(4px, 1vw, 6px) 0', 
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
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(100px, 10vw, 140px), 1fr))',
        columnGap: 'clamp(1px, 0.3vw, 3px)',
        rowGap: 'clamp(1px, 0.3vw, 3px)',
        minHeight: 'clamp(140px, 14vw, 196px)',
        alignItems: 'start',
        justifyItems: 'center'
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
      
      {/* Bluff Information - Only show when current player is still auctioneer */}
      {showBluffInfo && bluffInfo && player.name === bluffInfo.blufferName && currentAuctioneer && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '4px',
          fontSize: 'clamp(11px, 2vw, 13px)',
          color: '#856404',
          fontWeight: 'bold'
        }}>
          🚫 BLUFF DETECTED!
          <br />
          Bid: ${bluffInfo.bidAmount} | Has: ${bluffInfo.blufferMoney}
          <br />
          Disqualified from auction
        </div>
      )}
    </div>
  );
};

export default PlayerHand;