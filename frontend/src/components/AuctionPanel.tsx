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
    if (bidAmount >= 10 && bidAmount % 10 === 0 && bidAmount > gameState.currentBid) {
      onPlaceBid(currentPlayerId, bidAmount);
      setBidAmount(gameState.currentBid + 10); // Set next valid bid amount
    }
  };

  const isCurrentPlayerTurn = gameState.currentTurn === currentPlayerId;
  const isAuctioneer = gameState.auctioneer === currentPlayerId;
  const canBid = currentPlayer && 
                 gameState.auctionState === 'in_progress' && 
                 !isAuctioneer && 
                 bidAmount > gameState.currentBid && 
                 bidAmount <= currentPlayer.money &&
                 bidAmount % 10 === 0;

  const canStartAuction = isCurrentPlayerTurn && gameState.auctionState === 'none';

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
      
      {/* Auction State Display */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
          Status: {gameState.auctionState === 'none' ? 'No Auction' : 
                   gameState.auctionState === 'in_progress' ? 'Auction in Progress' : 
                   gameState.auctionState === 'match_bid_phase' ? 'Match Bid Phase' :
                   'Auction Ended'}
        </div>
        
        {(gameState.auctionState === 'in_progress' || gameState.auctionState === 'match_bid_phase') && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Time Left: {timeLeft} seconds
          </div>
        )}
      </div>

      {/* Start Auction Button */}
      {canStartAuction && (
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
                  max={currentPlayer.money}
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
                  disabled={!canBid}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: canBid ? '#4CAF50' : '#ccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: canBid ? 'pointer' : 'not-allowed'
                  }}
                >
                  Place Bid
                </button>
              </div>
              {bidAmount > 0 && !canBid && (
                <div style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                  {bidAmount <= gameState.currentBid 
                    ? 'Bid must be higher than current bid' 
                    : bidAmount % 10 !== 0
                    ? 'Bid must be a multiple of 10'
                    : 'Not enough money'}
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