import React, { useState } from 'react';
import type { GameState } from '../types';

interface BidderWindowsProps {
  gameState: GameState;
  onPlaceBid: (bidderId: string, amount: number) => void;
}

const BidderWindows: React.FC<BidderWindowsProps> = ({
  gameState,
  onPlaceBid
}) => {
  const [bidAmounts, setBidAmounts] = useState<{ [playerId: string]: number }>({});

  const handleBidChange = (playerId: string, value: string) => {
    const amount = parseInt(value) || 0;
    setBidAmounts(prev => ({
      ...prev,
      [playerId]: amount
    }));
  };

  const handlePlaceBid = (playerId: string) => {
    // Use the current bid amount from the input (which defaults to 10)
    const currentBidAmount = bidAmounts[playerId] || 10;
    const player = gameState.players.find(p => p.id === playerId);
    const isValidBid = currentBidAmount >= 10 && currentBidAmount % 10 === 0 && currentBidAmount > gameState.currentBid;
    const canAfford = player && currentBidAmount <= player.money;
    const isBluffing = isValidBid && !canAfford;
    
    console.log('Attempting to place bid:', {
      playerId,
      amount: currentBidAmount,
      currentBid: gameState.currentBid,
      playerMoney: player?.money,
      isValid: isValidBid,
      canAfford,
      isBluffing
    });
    
    if (isValidBid) {
      onPlaceBid(playerId, currentBidAmount);
      // Update all players' bid amounts to current bid + 10
      setBidAmounts(prev => {
        const newBidAmounts = { ...prev };
        bidders.forEach(bidder => {
          newBidAmounts[bidder.id] = currentBidAmount + 10;
        });
        return newBidAmounts;
      });
    }
  };

  const isAuctionInProgress = gameState.auctionState === 'in_progress';
  const bidders = gameState.players.filter(player => player.id !== gameState.auctioneer);

  if (!isAuctionInProgress) {
    return (
      <div style={{
        border: '2px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        margin: '16px',
        backgroundColor: '#f9f9f9',
        textAlign: 'center',
        color: '#666'
      }}>
        <h3>Bidder Windows</h3>
        <p>No auction in progress</p>
      </div>
    );
  }

  return (
    <div style={{
      border: '2px solid #2196F3',
      borderRadius: '8px',
      padding: '20px',
      margin: '16px',
      backgroundColor: '#f0f8ff'
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#1976D2' }}>
        Bidder Windows - Current Bid: ${gameState.currentBid}
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px'
      }}>
        {bidders.map(player => {
          const currentBidAmount = bidAmounts[player.id] || 10;
          const isValidBid = currentBidAmount >= 10 && 
                            currentBidAmount > gameState.currentBid && 
                            currentBidAmount % 10 === 0;
          const canAfford = currentBidAmount <= player.money;
          const canBid = isValidBid && canAfford;
          const isBluffing = isValidBid && !canAfford;
          const isCurrentBidder = gameState.currentBidder === player.id;

          return (
            <div key={player.id} style={{
              border: isCurrentBidder ? '2px solid #4CAF50' : '1px solid #ddd',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: isCurrentBidder ? '#f0f8f0' : 'white',
              boxShadow: isCurrentBidder ? '0 2px 8px rgba(76, 175, 80, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <h4 style={{ margin: 0, color: '#333' }}>
                  {player.name}
                  {isCurrentBidder && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      color: '#4CAF50',
                      fontWeight: 'bold'
                    }}>
                      (Current Bidder)
                    </span>
                  )}
                </h4>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#666'
                }}>
                  ${player.money}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Bid Amount:
                </div>
                                                 <input
                  type="number"
                  value={currentBidAmount}
                  onChange={(e) => handleBidChange(player.id, e.target.value)}
                  min={10}
                  max={1000}
                  step={10}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    fontSize: '14px'
                  }}
                />
              </div>

              <button
                onClick={() => handlePlaceBid(player.id)}
                disabled={!canBid && !isBluffing}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: canBid ? '#2196F3' : isBluffing ? '#FF5722' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (canBid || isBluffing) ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {canBid ? 'Place Bid' : isBluffing ? 'Bluff' : 'Place Bid'}
              </button>

              {currentBidAmount > 0 && !canBid && !isBluffing && (
                <div style={{
                  fontSize: '11px',
                  color: '#f44336',
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {currentBidAmount < 10
                    ? 'Minimum bid is $10'
                    : currentBidAmount <= gameState.currentBid 
                    ? 'Bid too low' 
                    : currentBidAmount % 10 !== 0
                    ? 'Must be multiple of 10'
                    : 'Invalid bid'}
                </div>
              )}
              
              {isBluffing && (
                <div style={{
                  fontSize: '11px',
                  color: '#FF5722',
                  marginTop: '8px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Bluffing! You only have ${player.money}
                </div>
              )}

              {/* Display player's hand */}
              <div style={{ marginTop: '12px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Hand ({player.hand.length} cards):
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  maxHeight: '60px',
                  overflow: 'hidden'
                }}>
                  {player.hand.slice(0, 5).map((card) => (
                    <div key={card.id} style={{
                      width: '20px',
                      height: '30px',
                      backgroundColor: card.type === 'animal' ? '#FF9800' : '#4CAF50',
                      border: '1px solid #ccc',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      {card.type === 'animal' ? card.name.charAt(0) : '?'}
                    </div>
                  ))}
                  {player.hand.length > 5 && (
                    <div style={{
                      width: '20px',
                      height: '30px',
                      backgroundColor: '#666',
                      border: '1px solid #ccc',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white',
                      fontWeight: 'bold'
                    }}>
                      +{player.hand.length - 5}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BidderWindows; 