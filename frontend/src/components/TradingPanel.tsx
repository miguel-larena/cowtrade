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
    if (gameState.tradeState !== 'challenger_bidding' && gameState.tradeState !== 'challenged_bidding') return;

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
    
    // Get animal types that both players have
    const myAnimalTypes = new Set(
      currentPlayer?.hand
        .filter(card => card.type === 'animal')
        .map(card => card.name) || []
    );
    
    const partnerAnimalTypes = new Set(
      partner?.hand
        .filter(card => card.type === 'animal')
        .map(card => card.name) || []
    );
    
    // Find overlapping animal types
    const sharedAnimalTypes = new Set(
      [...myAnimalTypes].filter(type => partnerAnimalTypes.has(type))
    );
    
    // Filter animal cards to only show types that partner also has
    const myAnimalCards = currentPlayer?.hand.filter(card => 
      card.type === 'animal' && sharedAnimalTypes.has(card.name)
    ) || [];

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
          Only animal types that {partner?.name} also has are available.
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
                No shared animal types with {partner?.name}
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

  const renderChallengerBidding = () => {
    const partner = gameState.players.find(p => p.id === gameState.tradePartner);
    const myMoneyCards = currentPlayer?.hand.filter(card => card.type === 'money') || [];

    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#e8f5e8',
        borderRadius: '8px',
        border: '2px solid #4CAF50'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#2E7D32' }}>
          💰 Challenger's Turn - Make Your Bid
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          Select money cards to bid for all {gameState.selectedAnimalCards.length} animal cards
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
              backgroundColor: selectedMoneyCards.length > 0 ? '#4CAF50' : '#ccc',
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
            backgroundColor: '#e8f5e8',
            borderRadius: '4px',
            border: '1px solid #4CAF50'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#2E7D32' }}>
              ✅ Your bid submitted: {currentOffer.moneyCards.length} money cards (${currentOffer.totalValue})
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderChallengedBidding = () => {
    const challenger = gameState.players.find(p => p.id === gameState.tradeInitiator);
    const challengerOffer = gameState.tradeOffers.find(offer => offer.playerId === gameState.tradeInitiator);
    const myMoneyCards = currentPlayer?.hand.filter(card => card.type === 'money') || [];

    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        border: '2px solid #ffc107'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#856404' }}>
          💰 Challenged Player's Turn - Respond to Bid
        </h3>
        <p style={{ margin: '0 0 16px 0', color: '#666' }}>
          {challenger?.name} selected {gameState.selectedAnimalCards.length} animal cards and bid {challengerOffer?.moneyCards.length || 0} money cards.
          Select your money cards to bid.
        </p>
        {(() => {
          const animalCardTypes = new Set(
            gameState.selectedAnimalCards.map(cardId => 
              challenger?.hand.find(card => card.id === cardId)?.name
            ).filter(Boolean)
          );
          if (animalCardTypes.size > 0) {
            return (
              <p style={{ margin: '8px 0 16px 0', fontSize: '14px', fontWeight: 'bold', color: '#856404' }}>
                Animal type: {Array.from(animalCardTypes).join(', ')}
              </p>
            );
          }
          return null;
        })()}

        {/* Show challenger's bid cards (face-down) */}
        {challengerOffer && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>{challenger?.name}'s Bid Cards:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {challengerOffer.moneyCards.map((cardId, index) => (
                <div
                  key={index}
                  style={{
                    width: '60px',
                    height: '80px',
                    backgroundColor: '#666',
                    border: '2px solid #333',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  ?
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Money Cards Selection */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Your Money Cards (Face-down):</h4>
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
              backgroundColor: selectedMoneyCards.length > 0 ? '#ffc107' : '#ccc',
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
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffc107'
          }}>
            <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
              ✅ Your bid submitted: {currentOffer.moneyCards.length} money cards (${currentOffer.totalValue})
            </p>
          </div>
        )}
      </div>
    );
  };

    const renderSpectatorView = () => {
    const challenger = gameState.players.find(p => p.id === gameState.tradeInitiator);
    const challenged = gameState.players.find(p => p.id === gameState.tradePartner);
    const challengerOffer = gameState.tradeOffers.find(offer => offer.playerId === gameState.tradeInitiator);
    const challengedOffer = gameState.tradeOffers.find(offer => offer.playerId === gameState.tradePartner);
    const isCurrentPlayerChallenger = currentPlayerId === gameState.tradeInitiator;
    const isCurrentPlayerChallenged = currentPlayerId === gameState.tradePartner;

    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '2px solid #9e9e9e'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#424242' }}>
          👀 Spectating Trade
        </h3>
        
        {/* Trade Details */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>Trade Details:</h4>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            <strong>{challenger?.name}</strong> challenged <strong>{challenged?.name}</strong> to trade
          </p>
          <p style={{ margin: '4px 0', fontSize: '14px' }}>
            Animal cards being traded: {gameState.selectedAnimalCards.length} cards
          </p>
          {(() => {
            const animalCardTypes = new Set(
              gameState.selectedAnimalCards.map(cardId => 
                challenger?.hand.find(card => card.id === cardId)?.name
            ).filter(Boolean)
            );
            if (animalCardTypes.size > 0) {
              return (
                <p style={{ margin: '4px 0', fontSize: '14px', fontWeight: 'bold', color: '#2E7D32' }}>
                  Type: {Array.from(animalCardTypes).join(', ')}
                </p>
              );
            }
            return null;
          })()}
        </div>

        {/* Bids Display */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          {/* Challenger's Bid */}
          <div style={{
            padding: '12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '4px',
            border: '1px solid #4CAF50'
          }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>{challenger?.name}'s Bid:</h5>
            {challengerOffer ? (
              <div>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Money Cards: {challengerOffer.moneyCards.length} (face-down)
                  {isCurrentPlayerChallenger && (
                    <span style={{ color: '#2E7D32', fontWeight: 'bold' }}>
                      {' '}- Your bid: ${challengerOffer.totalValue}
                    </span>
                  )}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                  {challengerOffer.moneyCards.map((cardId, index) => (
                    <div
                      key={index}
                      style={{
                        width: '40px',
                        height: '50px',
                        backgroundColor: '#666',
                        border: '1px solid #333',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      ?
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                Waiting for bid...
              </p>
            )}
          </div>

          {/* Challenged Player's Bid */}
          <div style={{
            padding: '12px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffc107'
          }}>
            <h5 style={{ margin: '0 0 8px 0', color: '#856404' }}>{challenged?.name}'s Bid:</h5>
            {challengedOffer ? (
              <div>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Money Cards: {challengedOffer.moneyCards.length} (face-down)
                  {isCurrentPlayerChallenged && (
                    <span style={{ color: '#856404', fontWeight: 'bold' }}>
                      {' '}- Your bid: ${challengedOffer.totalValue}
                    </span>
                  )}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                  {challengedOffer.moneyCards.map((cardId, index) => (
                    <div
                      key={index}
                      style={{
                        width: '40px',
                        height: '50px',
                        backgroundColor: '#666',
                        border: '1px solid #333',
                        borderRadius: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      ?
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                Waiting for bid...
              </p>
            )}
          </div>
        </div>

                          {/* Winner Display (if both have bid) */}
        {challengerOffer && challengedOffer && (
          <div style={{
            padding: '12px',
            backgroundColor: challengerOffer.totalValue === challengedOffer.totalValue ? '#ffebee' : 
              challengerOffer.totalValue > challengedOffer.totalValue ? '#e8f5e8' : '#fff3cd',
            borderRadius: '4px',
            border: `1px solid ${challengerOffer.totalValue === challengedOffer.totalValue ? '#f44336' : 
              challengerOffer.totalValue > challengedOffer.totalValue ? '#4CAF50' : '#ffc107'}`,
            textAlign: 'center'
          }}>
            {challengerOffer.totalValue === challengedOffer.totalValue ? (
              <>
                <p style={{ 
                  margin: '0', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: '#d32f2f'
                }}>
                  🎯 Tie! Trade will restart
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Both players bid the same amount
                </p>
              </>
            ) : (
              <>
                <p style={{ 
                  margin: '0', 
                  fontSize: '16px', 
                  fontWeight: 'bold',
                  color: challengerOffer.totalValue > challengedOffer.totalValue ? '#2E7D32' : '#856404'
                }}>
                  {challengerOffer.totalValue > challengedOffer.totalValue ? `${challenger?.name} Wins!` : `${challenged?.name} Wins!`}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                  Gets all {gameState.selectedAnimalCards.length} animal cards
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                  Money cards exchanged between players
                </p>
              </>
            )}
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
              backgroundColor: myOffer.totalValue === partnerOffer.totalValue ? '#ffebee' :
                myOffer.totalValue > partnerOffer.totalValue ? '#e8f5e8' : '#ffebee',
              borderRadius: '4px',
              border: `1px solid ${myOffer.totalValue === partnerOffer.totalValue ? '#f44336' :
                myOffer.totalValue > partnerOffer.totalValue ? '#4CAF50' : '#f44336'}`,
              textAlign: 'center'
            }}>
              {myOffer.totalValue === partnerOffer.totalValue ? (
                <>
                  <p style={{ 
                    margin: '0', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: '#d32f2f'
                  }}>
                    🎯 Tie! Trade will restart
                  </p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
                    Both players bid the same amount
                  </p>
                </>
              ) : (
                <>
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
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                    Money cards will be exchanged between players
                  </p>
                </>
              )}
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

  const renderTradeComplete = () => {
    const challenger = gameState.players.find(p => p.id === gameState.tradeInitiator);
    const challenged = gameState.players.find(p => p.id === gameState.tradePartner);
    const challengerOffer = gameState.tradeOffers.find(offer => offer.playerId === gameState.tradeInitiator);
    const challengedOffer = gameState.tradeOffers.find(offer => offer.playerId === gameState.tradePartner);
    const isParticipant = isChallenger || isChallenged;

    if (!challengerOffer || !challengedOffer) {
      return (
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
    }

    const winner = challengerOffer.totalValue > challengedOffer.totalValue ? challenger : challenged;
    const loser = winner?.id === challenger?.id ? challenged : challenger;
    const winnerOffer = winner?.id === challenger?.id ? challengerOffer : challengedOffer;
    const loserOffer = winner?.id === challenger?.id ? challengedOffer : challengerOffer;

    return (
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

        {/* Trade Summary */}
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>Trade Summary:</h4>
          
          {isParticipant ? (
            // Detailed view for participants
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Winner Details */}
              <div style={{
                padding: '12px',
                backgroundColor: '#e8f5e8',
                borderRadius: '4px',
                border: '1px solid #4CAF50'
              }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#2E7D32' }}>🏆 {winner?.name} (Winner):</h5>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Bid: {winnerOffer.moneyCards.length} money cards (${winnerOffer.totalValue})
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Received: All {gameState.selectedAnimalCards.length * 2} animal cards
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Received: {loserOffer.moneyCards.length} money cards from {loser?.name}
                </p>
              </div>

              {/* Loser Details */}
              <div style={{
                padding: '12px',
                backgroundColor: '#ffebee',
                borderRadius: '4px',
                border: '1px solid #f44336'
              }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#d32f2f' }}>❌ {loser?.name} (Loser):</h5>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Bid: {loserOffer.moneyCards.length} money cards (${loserOffer.totalValue})
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Lost: All {gameState.selectedAnimalCards.length * 2} animal cards
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Received: {winnerOffer.moneyCards.length} money cards from {winner?.name}
                </p>
              </div>
            </div>
          ) : (
            // Simplified view for spectators
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Challenger */}
              <div style={{
                padding: '12px',
                backgroundColor: winner?.id === challenger?.id ? '#e8f5e8' : '#ffebee',
                borderRadius: '4px',
                border: `1px solid ${winner?.id === challenger?.id ? '#4CAF50' : '#f44336'}`
              }}>
                <h5 style={{ 
                  margin: '0 0 8px 0', 
                  color: winner?.id === challenger?.id ? '#2E7D32' : '#d32f2f'
                }}>
                  {winner?.id === challenger?.id ? '🏆' : '❌'} {challenger?.name}:
                </h5>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Bid: {challengerOffer.moneyCards.length} money cards (face-down)
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  {winner?.id === challenger?.id ? `Won all ${gameState.selectedAnimalCards.length * 2} animal cards` : `Lost all ${gameState.selectedAnimalCards.length * 2} animal cards`}
                </p>
              </div>

              {/* Challenged Player */}
              <div style={{
                padding: '12px',
                backgroundColor: winner?.id === challenged?.id ? '#e8f5e8' : '#ffebee',
                borderRadius: '4px',
                border: `1px solid ${winner?.id === challenged?.id ? '#4CAF50' : '#f44336'}`
              }}>
                <h5 style={{ 
                  margin: '0 0 8px 0', 
                  color: winner?.id === challenged?.id ? '#2E7D32' : '#d32f2f'
                }}>
                  {winner?.id === challenged?.id ? '🏆' : '❌'} {challenged?.name}:
                </h5>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  Bid: {challengedOffer.moneyCards.length} money cards (face-down)
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  {winner?.id === challenged?.id ? `Won all ${gameState.selectedAnimalCards.length * 2} animal cards` : `Lost all ${gameState.selectedAnimalCards.length * 2} animal cards`}
                </p>
              </div>
            </div>
          )}
        </div>

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
  };

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
    
    case 'challenger_bidding':
      if (isChallenger) {
        return renderChallengerBidding();
      } else {
        return renderSpectatorView();
      }
    
    case 'challenged_bidding':
      if (isChallenged) {
        return renderChallengedBidding();
      } else {
        return renderSpectatorView();
      }
    
    case 'confirming_trade':
      // This state should no longer be reached since trades execute immediately
      return renderTradeComplete();
    
    case 'trade_complete':
      return renderTradeComplete();
    
    default:
      return null;
  }
};

export default TradingPanel; 