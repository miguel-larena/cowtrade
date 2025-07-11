import React, { useState, useEffect } from 'react';
import type { GameState } from '../types';
import CardComponent from './Card';

interface AuctionPanelProps {
  gameState: GameState;
  currentPlayerId: string;
  onStartAuction: (auctioneerId: string) => void;
  onPlaceBid: (bidderId: string, amount: number) => void;
  onEndAuction: () => void;
  onMatchBid: () => void;
}

const AuctionPanel: React.FC<AuctionPanelProps> = ({
  gameState,
  currentPlayerId,
  onStartAuction,
  onPlaceBid,
  onEndAuction,
  onMatchBid
}) => {
  const [bidAmount, setBidAmount] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const auctioneer = gameState.players.find(p => p.id === gameState.auctioneer);

  // Timer effect
  useEffect(() => {
    if ((gameState.auctionState === 'in_progress' || gameState.auctionState === 'match_bid_phase') && gameState.auctionEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((gameState.auctionEndTime! - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          onEndAuction();
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.auctionState, gameState.auctionEndTime, onEndAuction]);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBidAmount(value);
  };

  const handlePlaceBid = () => {
    const isValidBid = bidAmount >= 10 && bidAmount % 10 === 0 && bidAmount > gameState.currentBid;
    const canAfford = currentPlayer && bidAmount <= currentPlayer.money;
    const isBluffing = isValidBid && !canAfford;
    
    if (isValidBid || isBluffing) {
      onPlaceBid(currentPlayerId, bidAmount);
      setBidAmount(gameState.currentBid + 10); // Set next valid bid amount
    }
  };

  const isCurrentPlayerTurn = gameState.currentTurn === currentPlayerId;
  const isAuctioneer = gameState.auctioneer === currentPlayerId;
  const isValidBid = currentPlayer && 
                     gameState.auctionState === 'in_progress' && 
                     !isAuctioneer && 
                     bidAmount > gameState.currentBid && 
                     bidAmount % 10 === 0;
  const canAfford = currentPlayer && bidAmount <= currentPlayer.money;
  const canBid = isValidBid && canAfford;
  const isBluffing = isValidBid && !canAfford;

  const canStartAuction = isCurrentPlayerTurn && gameState.auctionState === 'none';
  
  // Check if deck has animal cards
  const animalCardsInDeck = gameState.deck.filter(card => card.type === 'animal');
  const canDrawCard = animalCardsInDeck.length > 0;
  const canStartAuctionWithCard = canStartAuction && canDrawCard;
  
  // Debug logging
  console.log('AuctionPanel Debug:', {
    currentPlayerId,
    currentTurn: gameState.currentTurn,
    isCurrentPlayerTurn,
    auctionState: gameState.auctionState,
    canStartAuction,
    canDrawCard,
    animalCardsInDeck: animalCardsInDeck.length,
    currentPlayerName: gameState.players.find(p => p.id === currentPlayerId)?.name,
    currentTurnPlayerName: gameState.players.find(p => p.id === gameState.currentTurn)?.name
  });

  return (
    <div style={{
      border: '2px solid #4CAF50',
      borderRadius: '8px',
      padding: '20px',
      margin: '16px',
      backgroundColor: '#f0f8f0'
    }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#2E7D32' }}>
        Auction Phase
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
      
      {/* Auction State Display */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          Status: {gameState.auctionState === 'none' ? 'No Auction' : 
                   gameState.auctionState === 'in_progress' ? 'Auction in Progress' : 
                   gameState.auctionState === 'match_bid_phase' ? 'Match Bid Phase' :
                   'Auction Ended'}
        </div>
        
        {/* Deck Status */}
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Animal Cards in Deck: {animalCardsInDeck.length}/40
          {animalCardsInDeck.length === 0 && (
            <span style={{ 
              marginLeft: '8px', 
              color: '#FF5722', 
              fontWeight: 'bold',
              fontStyle: 'italic'
            }}>
              (Deck Empty - No More Auctions)
            </span>
          )}
        </div>
        
        {(gameState.auctionState === 'in_progress' || gameState.auctionState === 'match_bid_phase') && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Time Left: {timeLeft} seconds
          </div>
        )}
      </div>

      {/* Empty Deck Message */}
      {canStartAuction && !canDrawCard && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#fff3cd',
          border: '2px solid #ffc107',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>
            🃏 Deck Empty
          </div>
          <div style={{ fontSize: '14px', color: '#856404' }}>
            All animal cards have been auctioned. No more auctions can be started.
          </div>
        </div>
      )}

      {/* Start Auction Button */}
      {canStartAuctionWithCard && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => onStartAuction(currentPlayerId)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Start Auction (Draw Card)
          </button>
        </div>
      )}

      {/* Auction Card Display */}
      {gameState.auctionCard && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>
            Current Auction Card:
            {auctioneer && ` (Auctioneer: ${auctioneer.name})`}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CardComponent card={gameState.auctionCard} />
          </div>
        </div>
      )}

      {/* Bidding Section */}
      {gameState.auctionState === 'in_progress' && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            Current Bid: ${gameState.currentBid}
          </div>
          {gameState.currentBidder && (
            <div style={{ fontSize: '14px', color: '#666' }}>
              Current Bidder: {gameState.players.find(p => p.id === gameState.currentBidder)?.name}
            </div>
          )}
          
          {!isAuctioneer && currentPlayer && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                Your Money: ${currentPlayer.money}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={handleBidChange}
                  min={gameState.currentBid + 10}
                  max={1000}
                  step={10}
                  style={{
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    width: '100px'
                  }}
                  placeholder="Bid amount"
                />
                <button
                  onClick={handlePlaceBid}
                  disabled={!canBid && !isBluffing}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: canBid ? '#4CAF50' : isBluffing ? '#FF5722' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: (canBid || isBluffing) ? 'pointer' : 'not-allowed'
                  }}
                >
                  {canBid ? 'Place Bid' : isBluffing ? 'Bluff' : 'Place Bid'}
                </button>
              </div>
              {bidAmount > 0 && !canBid && !isBluffing && (
                <div style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                  {bidAmount <= gameState.currentBid 
                    ? 'Bid must be higher than current bid' 
                    : bidAmount % 10 !== 0
                    ? 'Bid must be a multiple of 10'
                    : 'Invalid bid'}
                </div>
              )}
              {isBluffing && (
                <div style={{ fontSize: '12px', color: '#FF5722', marginTop: '4px', fontWeight: 'bold' }}>
                  Bluffing! You only have ${currentPlayer?.money}
                </div>
              )}
            </div>
          )}
          
          {isAuctioneer && (
            <div style={{ 
              color: '#666', 
              fontStyle: 'italic',
              marginTop: '16px'
            }}>
              You are the auctioneer and cannot bid on your own auction
            </div>
          )}
        </div>
      )}

      {/* Match Bid Phase */}
      {gameState.auctionState === 'match_bid_phase' && gameState.auctioneer === currentPlayerId && (
        <div style={{ marginTop: '20px' }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FF5722',
            marginBottom: '12px',
            textAlign: 'center'
          }}>
            Match Bid Phase - Time Left: {timeLeft} seconds
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            You can match the highest bid of ${gameState.currentBid} to keep the card
          </div>
          {currentPlayer && currentPlayer.money >= gameState.currentBid ? (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={onMatchBid}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#FF5722',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  minWidth: '200px'
                }}
              >
                Match Bid (${gameState.currentBid})
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '12px 24px',
                backgroundColor: '#ccc',
                color: '#666',
                border: '1px solid #999',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'inline-block',
                maxWidth: '300px'
              }}>
                Cannot Match Bid - Not Enough Money (You have ${currentPlayer?.money || 0})
              </div>
            </div>
          )}
        </div>
      )}

      {/* Manual End Auction Button (for testing) */}
      {gameState.auctionState === 'in_progress' && (
        <button
          onClick={onEndAuction}
          style={{
            padding: '12px 24px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '20px',
            width: '100%'
          }}
        >
          End Auction (Manual)
        </button>
      )}

    </div>
  );
};

export default AuctionPanel; 