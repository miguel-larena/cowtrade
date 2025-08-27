import React, { useState } from 'react';
import type { Player, Card } from '../types';
import CardComponent from './Card';
import CardModal from './CardModal';

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
  showBluffInfo = false,
  bluffInfo,
  currentAuctioneer
}) => {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debug logging for Swordfish bonus cards
  React.useEffect(() => {
    const moneyCards = player.hand.filter(card => card.type === 'money');
    const swordfishBonusCards = moneyCards.filter(card => card.id.includes('swordfish_bonus'));
    
    if (swordfishBonusCards.length > 0) {
      console.log(`🎯 SWORDFISH BONUS CARDS FOUND in ${player.name}'s hand:`, swordfishBonusCards.map(c => `${c.name} ($${c.value})`));
    }
  }, [player.hand, player.name]);

  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  // Organize cards: money cards first, then animal cards grouped by type and value
  const organizeCards = (cards: Card[]) => {
    const moneyCards = cards.filter(card => card.type === 'money');
    const animalCards = cards.filter(card => card.type === 'animal');
    
    // Sort money cards by value (ascending)
    const sortedMoneyCards = moneyCards.sort((a, b) => a.value - b.value);
    
    // Group animal cards by type and sort by value
    const animalGroups = new Map<string, Card[]>();
    animalCards.forEach(card => {
      if (!animalGroups.has(card.name)) {
        animalGroups.set(card.name, []);
      }
      animalGroups.get(card.name)!.push(card);
    });
    
    // Sort animal types by value (Shrimp first, Lobster second, etc.)
    const animalTypeOrder = ['Shrimp', 'Clam', 'Lobster', 'Puffer Fish', 'Turtle', 'Octopus', 'Swordfish', 'Dolphin', 'Shark', 'Whale'];
    const sortedAnimalTypes = Array.from(animalGroups.keys()).sort((a, b) => {
      const aIndex = animalTypeOrder.indexOf(a);
      const bIndex = animalTypeOrder.indexOf(b);
      return aIndex - bIndex;
    });
    
    // Sort cards within each animal type by value
    sortedAnimalTypes.forEach(type => {
      animalGroups.get(type)!.sort((a, b) => a.value - b.value);
    });
    
    // Flatten animal cards in order
    const sortedAnimalCards = sortedAnimalTypes.flatMap(type => animalGroups.get(type)!);
    
    return [...sortedMoneyCards, ...sortedAnimalCards];
  };

  const organizedCards = organizeCards(player.hand);

  return (
    <>
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
        
        {/* Condensed single-row card display with horizontal scrolling */}
        <div style={{ 
          display: 'flex',
          flexDirection: 'row',
          gap: 'clamp(2px, 0.5vw, 4px)',
          overflowX: 'auto',
          overflowY: 'visible', // Allow vertical overflow for hovered cards
          padding: '4px 0',
          minHeight: 'clamp(80px, 8vw, 100px)', // Match new card dimensions
          alignItems: 'center',
          position: 'relative' as const
        }}>
          {organizedCards.length === 0 ? (
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
            organizedCards.map(card => {
              const showValue = isCurrentPlayer || card.type === 'animal'; // Show value for own cards or animal cards
              
              return (
                <CardComponent
                  key={card.id}
                  card={card}
                  onClick={() => {}} // Removed onCardClick prop
                  selected={false} // Removed selectedCards prop
                  showValue={showValue}
                  onCardClick={handleCardClick}
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

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isOwnCard={isCurrentPlayer}
        />
      )}
    </>
  );
};

export default PlayerHand;