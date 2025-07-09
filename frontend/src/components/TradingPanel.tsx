import React, { useState } from 'react';
import type { GameState } from '../types';
import CardComponent from './Card';

interface TradingPanelProps {
  gameState: GameState;
  currentPlayerId: string;
  onSelectTradePartner: (partnerId: string) => void;
  onMakeTradeOffer: (playerId: string, animalCards: string[], moneyCards: string[]) => void;
  onConfirmTrade: (playerId: string) => void;
  onExecuteTrade: () => void;
  onCancelTrade: () => void;
  onInitiateTrade: (playerId: string, partnerId?: string) => void;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
  gameState,
  currentPlayerId,
  onSelectTradePartner,
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

  const currentOffer = gameState.tradeOffers.find(offer => offer.playerId === currentPlayerId);
  const otherOffer = gameState.tradeOffers.find(offer => offer.playerId !== currentPlayerId);

  const handleCardClick = (cardId: string, cardType: 'animal' | 'money') => {
    if (gameState.tradeState !== 'making_offers') return;

    if (cardType === 'animal') {
      setSelectedAnimalCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    } else {
      setSelectedMoneyCards(prev => 
        prev.includes(cardId) 
          ? prev.filter(id => id !== cardId)
          : [...prev, cardId]
      );
    }
  };

  const handleSubmitOffer = () => {
    if (selectedAnimalCards.length === 0) return;
    
    onMakeTradeOffer(currentPlayerId, selectedAnimalCards, selectedMoneyCards);
    setSelectedAnimalCards([]);
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
        Select a player to trade with
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {gameState.players
          .filter(player => player.id !== currentPlayerId)
          .map(player => (
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
          ))}
      </div>
    </div>
  );

  const renderTradePartner = () => (
    <div style={{
      padding: '20px',
      backgroundColor: '#fff3cd',
      borderRadius: '8px',
      border: '2px solid #ffc107',
      textAlign: 'center'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>
        🤝 Trade Partner Selected
      </h3>
      <p style={{ margin: '0 0 16px 0', color: '#666' }}>
        {gameState.tradeInitiator && gameState.players.find(p => p.id === gameState.tradeInitiator)?.name} 
        wants to trade with {gameState.tradePartner && gameState.players.find(p => p.id === gameState.tradePartner)?.name}
      </p>
      <button
        onClick={() => onSelectTradePartner(gameState.tradePartner!)}
        style={{
          padding: '12px 20px',
          backgroundColor: '#FF9800',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        Accept Trade
      </button>
    </div>
  );

  const renderMakingOffers = () => {
    const partner = gameState.players.find(p => p.id === gameState.tradePartner);
    const myAnimalCards = currentPlayer?.hand.filter(card => card.type === 'animal') || [];
    const myMoneyCards = currentPlayer?.hand.filter(card => card.type === 'money') || [];

    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f0f8ff',
        borderRadius: '8px',
        border: '2px solid #2196F3'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1976D2' }}>
          💰 Making Trade Offer
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          Select animal cards and money cards to offer to {partner?.name}
        </p>

        {/* Animal Cards Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Animal Cards:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {myAnimalCards.map(card => (
              <CardComponent
                key={card.id}
                card={card}
                selected={selectedAnimalCards.includes(card.id)}
                onClick={() => handleCardClick(card.id, 'animal')}
              />
            ))}
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            Selected: {selectedAnimalCards.length} cards
          </p>
        </div>

        {/* Money Cards Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Money Cards (Face-down):</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {myMoneyCards.map(card => (
              <CardComponent
                key={card.id}
                card={card}
                selected={selectedMoneyCards.includes(card.id)}
                onClick={() => handleCardClick(card.id, 'money')}
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
            onClick={handleSubmitOffer}
            disabled={selectedAnimalCards.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedAnimalCards.length > 0 ? '#2196F3' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: selectedAnimalCards.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Submit Offer
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
              ✅ Your offer submitted: {currentOffer.animalCards.length} animal cards, {currentOffer.moneyCards.length} money cards (${currentOffer.totalValue})
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderConfirmingTrade = () => {
    const partner = gameState.players.find(p => p.id === gameState.tradePartner);
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
              <h5 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>Your Offer:</h5>
              {myOffer && (
                <div>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Animal Cards: {myOffer.animalCards.length}
                  </p>
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
              <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>{partner?.name}'s Offer:</h5>
              {partnerOffer && (
                <div>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Animal Cards: {partnerOffer.animalCards.length}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>
                    Money Cards: {partnerOffer.moneyCards.length} (${partnerOffer.totalValue})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation */}
        {myOffer && partnerOffer && (
          <div style={{ marginBottom: '16px' }}>
            {myOffer.animalCards.length === partnerOffer.animalCards.length ? (
              <div style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                ✅ Valid trade: Both players offering {myOffer.animalCards.length} animal cards
              </div>
            ) : (
              <div style={{ color: '#F44336', fontWeight: 'bold' }}>
                ❌ Invalid trade: Different number of animal cards
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => onConfirmTrade(currentPlayerId)}
            disabled={gameState.tradeConfirmed}
            style={{
              padding: '12px 24px',
              backgroundColor: gameState.tradeConfirmed ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: gameState.tradeConfirmed ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {gameState.tradeConfirmed ? 'Confirmed' : 'Confirm Trade'}
          </button>
          
          <button
            onClick={onExecuteTrade}
            disabled={!gameState.tradeConfirmed}
            style={{
              padding: '12px 24px',
              backgroundColor: gameState.tradeConfirmed ? '#9C27B0' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: gameState.tradeConfirmed ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Execute Trade
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
        🎉 Trade Complete!
      </h3>
      <p style={{ margin: '0 0 16px 0', color: '#666' }}>
        The trade has been executed successfully. Turn will progress to the next player.
      </p>
    </div>
  );

  return (
    <div style={{
      border: '2px solid #2196F3',
      borderRadius: '8px',
      padding: '20px',
      margin: '16px',
      backgroundColor: '#f0f8ff'
    }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#1976D2' }}>
        Trading Phase
      </h2>

      {/* Turn Indicator */}
      <div style={{ 
        marginBottom: '16px',
        padding: '8px 12px',
        backgroundColor: isCurrentPlayerTurn ? '#4CAF50' : '#f5f5f5',
        borderRadius: '4px',
        border: isCurrentPlayerTurn ? '2px solid #2E7D32' : '1px solid #ddd'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 'bold',
          color: isCurrentPlayerTurn ? 'white' : '#666'
        }}>
          Current Turn: {gameState.players.find(p => p.id === gameState.currentTurn)?.name || 'Unknown'}
          {isCurrentPlayerTurn && (
            <span style={{ marginLeft: '8px', fontSize: '12px' }}>
              (Your Turn)
            </span>
          )}
        </div>
      </div>

      {/* Trade State Display */}
      {gameState.tradeState === 'none' && canInitiateTrade && renderTradeInitiator()}
      {gameState.tradeState === 'selecting_partner' && renderTradePartner()}
      {gameState.tradeState === 'making_offers' && renderMakingOffers()}
      {gameState.tradeState === 'confirming_trade' && renderConfirmingTrade()}
      {gameState.tradeState === 'trade_complete' && renderTradeComplete()}

      {/* Cancel Button */}
      {gameState.tradeState !== 'none' && gameState.tradeState !== 'trade_complete' && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            onClick={onCancelTrade}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel Trade
          </button>
        </div>
      )}

      {/* Instructions */}
      {gameState.tradeState === 'none' && !canInitiateTrade && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>Waiting for {gameState.players.find(p => p.id === gameState.currentTurn)?.name}'s turn to trade</p>
        </div>
      )}
    </div>
  );
};

export default TradingPanel; 