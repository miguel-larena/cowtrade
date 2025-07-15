import React, { useState } from 'react';
import type { GameState, Player } from '../types';
import CardComponent from './Card';

interface TradingPanelProps {
  gameState: GameState;
  currentPlayerId: string;
  onSelectTradePartner: (partnerId: string) => void;
  onSelectAnimalCardsForTrade: (animalCards: string[]) => void;
  onMakeTradeOffer: (playerId: string, moneyCards: string[]) => void;
  onConfirmTrade: (playerId: string) => void;
  onExecuteTrade: () => void;
  onCancelTrade: () => void;
  onInitiateTrade: (playerId: string, partnerId?: string) => void;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
  gameState,
  currentPlayerId,
  onSelectTradePartner,
  onSelectAnimalCardsForTrade,
  onMakeTradeOffer,
  onConfirmTrade,
  onExecuteTrade,
  onCancelTrade,
  onInitiateTrade
}) => {
  const [selectedAnimalCards, setSelectedAnimalCards] = useState<string[]>([]);
  const [selectedMoneyCards, setSelectedMoneyCards] = useState<string[]>([]);

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isCurrentPlayerTurn = gameState.currentTurn === currentPlayerId;
  const canInitiateTrade = isCurrentPlayerTurn && gameState.tradeState === 'none';
  const isChallenger = currentPlayerId === gameState.tradeInitiator;
  const isChallenged = currentPlayerId === gameState.tradePartner;

  const currentOffer = gameState.tradeOffers.find(offer => offer.playerId === currentPlayerId);
  const otherOffer = gameState.tradeOffers.find(offer => offer.playerId !== currentPlayerId);

  // Helper function to check if a player has the same animal types as current player
  const hasSameAnimalTypes = (player: Player) => {
    if (!currentPlayer) return false;
    
    const currentPlayerAnimalTypes = new Set(
      currentPlayer.hand
        .filter((card: any) => card.type === 'animal')
        .map((card: any) => card.name)
    );
    
    const otherPlayerAnimalTypes = new Set(
      player.hand
        .filter((card: any) => card.type === 'animal')
        .map((card: any) => card.name)
    );
    
    // Check if there's any overlap in animal types
    for (const animalType of currentPlayerAnimalTypes) {
      if (otherPlayerAnimalTypes.has(animalType)) {
        return true;
      }
    }
    
    return false;
  };

  const handleAnimalCardClick = (cardId: string) => {
    if (gameState.tradeState !== 'challenger_selecting_cards' || !isChallenger) return;

    const clickedCard = currentPlayer?.hand.find(card => card.id === cardId);
    if (!clickedCard || clickedCard.type !== 'animal') return;

    setSelectedAnimalCards(prev => {
      // If clicking the same card, toggle it
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      }
      
      // If clicking a different animal type, replace all selected animals
      const selectedCardTypes = prev.map(id => 
        currentPlayer?.hand.find(card => card.id === id)?.name
      ).filter(Boolean);
      
      if (selectedCardTypes.length > 0 && !selectedCardTypes.includes(clickedCard.name)) {
        // Different animal type - replace all selected animals with this one
        return [cardId];
      } else {
        // Same animal type or no animals selected - add to selection
        return [...prev, cardId];
      }
    });
  };

  const handleMoneyCardClick = (cardId: string) => {
    if (gameState.tradeState !== 'making_offers') return;

    setSelectedMoneyCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleSubmitAnimalSelection = () => {
    if (selectedAnimalCards.length === 0) return;
    
    onSelectAnimalCardsForTrade(selectedAnimalCards);
    setSelectedAnimalCards([]);
  };

  const handleSubmitMoneyOffer = () => {
    if (selectedMoneyCards.length === 0) return;
    
    onMakeTradeOffer(currentPlayerId, selectedMoneyCards);
    setSelectedMoneyCards([]);
  };

  // Helper for initiating trade
  const handleInitiateTrade = (partnerId: string) => {
    console.log('handleInitiateTrade called:', {
      partnerId,
      currentPlayerId,
      tradeState: gameState.tradeState,
      currentTurn: gameState.currentTurn,
      isCurrentPlayerTurn: isCurrentPlayerTurn
    });
    
    if (gameState.tradeState === 'none') {
      // Start the trade and select the partner in one atomic operation
      console.log('Initiating trade with partner:', partnerId);
      onInitiateTrade(currentPlayerId, partnerId);
    } else {
      console.log('Selecting trade partner:', partnerId);
      onSelectTradePartner(partnerId);
    }
  };

  const renderTradeInitiator = () => (
    <div style={{
      padding: '20px',
      backgroundColor: '#e8f5e8',
      borderRadius: '8px',
      border: '2px solid #4CAF50',
      textAlign: 'center'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#2E7D32' }}>
        🎯 Your Turn - Initiate Trade
      </h3>
      <p style={{ margin: '0 0 16px 0', color: '#666' }}>
        Select a player to trade with (only players with same animal types)
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {(() => {
          const availablePlayers = gameState.players
            .filter(player => player.id !== currentPlayerId)
            .filter(player => hasSameAnimalTypes(player));
          
          if (availablePlayers.length === 0) {
            return (
              <div style={{
                padding: '16px',
                backgroundColor: '#ffebee',
                borderRadius: '6px',
                border: '1px solid #f44336',
                color: '#d32f2f',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0', fontWeight: 'bold' }}>
                  No players available for trading
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                  You can only trade with players who have the same animal types as you.
                </p>
              </div>
            );
          }
          
          return availablePlayers.map(player => (
            <button
              key={player.id}
              onClick={() => handleInitiateTrade(player.id)}
              style={{
                padding: '12px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Trade with {player.name}
            </button>
          ));
        })()}
      </div>
    </div>
  );

  const renderChallengerSelectingCards = () => {
    const partner = gameState.players.find(p => p.id === gameState.tradePartner);
    const myAnimalCards = currentPlayer?.hand.filter(card => card.type === 'animal') || [];

    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '2px solid #ffc107'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>
          🎯 Select Animal Cards to Trade
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          Choose which animal cards to trade with {partner?.name}. 
          {partner?.name} must offer the same animal types.
        </p>

        {/* Animal Cards Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Select Animal Cards (One Type Only):</h4>
          {myAnimalCards.length === 0 ? (
            <div style={{
              padding: '12px',
              backgroundColor: '#ffebee',
              borderRadius: '4px',
              border: '1px solid #f44336',
              color: '#d32f2f',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0', fontSize: '14px' }}>
                No animal cards available
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {myAnimalCards.map(card => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    selected={selectedAnimalCards.includes(card.id)}
                    onClick={() => handleAnimalCardClick(card.id)}
                  />
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Selected: {selectedAnimalCards.length} cards
              </p>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSubmitAnimalSelection}
            disabled={selectedAnimalCards.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedAnimalCards.length > 0 ? '#ffc107' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedAnimalCards.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Confirm Animal Selection
          </button>
        </div>
      </div>
    );
  };

  const renderMakingOffers = () => {
    const partner = gameState.players.find(p => 
      p.id === (isChallenger ? gameState.tradePartner : gameState.tradeInitiator)
    );
    const myMoneyCards = currentPlayer?.hand.filter(card => card.type === 'money') || [];

    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '2px solid #2196F3'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1976D2' }}>
          💰 {isChallenger ? 'Make Your Bid' : 'Respond to Trade Challenge'}
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          {isChallenger 
            ? `Select money cards to bid for all ${gameState.selectedAnimalCards.length} animal cards`
            : `${gameState.tradeInitiator && gameState.players.find(p => p.id === gameState.tradeInitiator)?.name} selected ${gameState.selectedAnimalCards.length} animal cards. Select money cards to bid.`
          }
        </p>

        {/* Money Cards Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Money Cards (Face-down):</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {myMoneyCards.map(card => (
              <CardComponent
                key={card.id}
                card={card}
                selected={selectedMoneyCards.includes(card.id)}
                onClick={() => handleMoneyCardClick(card.id)}
              />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Selected: {selectedMoneyCards.length} cards (Total: ${selectedMoneyCards.reduce((sum, cardId) => {
              const card = myMoneyCards.find(c => c.id === cardId);
              return sum + (card?.value || 0);
            }, 0)})
          </p>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSubmitMoneyOffer}
            disabled={selectedMoneyCards.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedMoneyCards.length > 0 ? '#2196F3' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedMoneyCards.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Submit Bid
          </button>
        </div>

        {currentOffer && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderRadius: '4px',
            border: '1px solid #2196F3'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#1976D2' }}>
              ✅ Your bid submitted: {currentOffer.moneyCards.length} money cards (${currentOffer.totalValue})
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderConfirmingTrade = () => {
    const partner = gameState.players.find(p => 
      p.id === (isChallenger ? gameState.tradePartner : gameState.tradeInitiator)
    );
    const myOffer = currentOffer;
    const partnerOffer = otherOffer;

    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f3e5f5',
        borderRadius: '8px',
        border: '2px solid #9C27B0'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#7B1FA2' }}>
          ✅ Confirm Trade
        </h3>

        {/* Trade Summary */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Trade Summary:</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* My Offer */}
            <div style={{
              padding: '12px',
              backgroundColor: '#e8f5e8',
              borderRadius: '4px',
              border: '1px solid #4CAF50'
            }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>Your Bid:</h5>
              {myOffer && (
                <div>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Money Cards: {myOffer.moneyCards.length} (${myOffer.totalValue})
                  </p>
                </div>
              )}
            </div>

            {/* Partner's Offer */}
            <div style={{
              padding: '12px',
              backgroundColor: '#fff3cd',
              borderRadius: '4px',
              border: '1px solid #ffc107'
            }}>
              <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>{partner?.name}'s Bid:</h5>
              {partnerOffer && (
                <div>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Money Cards: {partnerOffer.moneyCards.length} (${partnerOffer.totalValue})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Winner Display */}
          {myOffer && partnerOffer && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: myOffer.totalValue > partnerOffer.totalValue ? '#e8f5e8' : '#ffebee',
              borderRadius: '4px',
              border: `1px solid ${myOffer.totalValue > partnerOffer.totalValue ? '#4CAF50' : '#f44336'}`,
              textAlign: 'center'
            }}>
              <p style={{ 
                margin: '0', 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: myOffer.totalValue > partnerOffer.totalValue ? '#2E7D32' : '#d32f2f'
              }}>
                {myOffer.totalValue > partnerOffer.totalValue ? '🏆 You Win!' : '❌ You Lose'}
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                {myOffer.totalValue > partnerOffer.totalValue 
                  ? `You get all ${gameState.selectedAnimalCards.length} animal cards`
                  : `${partner?.name} gets all ${gameState.selectedAnimalCards.length} animal cards`
                }
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => onConfirmTrade(currentPlayerId)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Confirm Trade
          </button>
          <button
            onClick={onCancelTrade}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Cancel Trade
          </button>
        </div>
      </div>
    );
  };

  const renderTradeComplete = () => (
    <div style={{
      padding: '20px',
      backgroundColor: '#e8f5e8',
      borderRadius: '8px',
      border: '2px solid #4CAF50',
      textAlign: 'center'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#2E7D32' }}>
        ✅ Trade Complete
      </h3>
      <p style={{ margin: '0 0 16px 0', color: '#666' }}>
        The trade has been executed successfully.
      </p>
      <button
        onClick={onExecuteTrade}
        style={{
          padding: '12px 24px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        Continue
      </button>
    </div>
  );

  // Main render logic
  if (!currentPlayer) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#ffebee',
        borderRadius: '8px',
        border: '2px solid #f44336',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0', color: '#d32f2f' }}>
          Player not found
        </p>
      </div>
    );
  }

  // Render based on trade state
  switch (gameState.tradeState) {
    case 'none':
      return canInitiateTrade ? renderTradeInitiator() : null;
    
    case 'selecting_partner':
      return renderTradeInitiator();
    
    case 'challenger_selecting_cards':
      return isChallenger ? renderChallengerSelectingCards() : (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '2px solid #ffc107',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>
            ⏳ Waiting for Challenger
          </h3>
          <p style={{ margin: '0', color: '#666' }}>
            {gameState.tradeInitiator && gameState.players.find(p => p.id === gameState.tradeInitiator)?.name} 
            is selecting animal cards to trade...
          </p>
        </div>
      );
    
    case 'making_offers':
      return renderMakingOffers();
    
    case 'confirming_trade':
      return renderConfirmingTrade();
    
    case 'trade_complete':
      return renderTradeComplete();
    
    default:
      return null;
  }
};

export default TradingPanel; 