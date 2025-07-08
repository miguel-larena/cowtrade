import React, { useState } from 'react';
import type { GameState } from '../types';
import CardComponent from './Card';

interface AuctionPanelProps {
  gameState: GameState;
  currentPlayerId: string;
  onPlaceBid: (amount: number) => void;
  onWinAuction: () => void;
}

const AuctionPanel: React.FC<AuctionPanelProps> = ({
  gameState,
  currentPlayerId,
  onPlaceBid,
  onWinAuction
}) => {
  const [bidAmount, setBidAmount] = useState<number>(0);
  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setBidAmount(value);
  };

  const handlePlaceBid = () => {
    if (bidAmount > 0 && currentPlayer && bidAmount <= currentPlayer.money) {
      onPlaceBid(bidAmount);
      setBidAmount(0);
    }
  };

  const canBid = currentPlayer && bidAmount > gameState.currentBid && bidAmount <= currentPlayer.money;

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
      
      {gameState.auctionCard ? (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0' }}>Current Auction Card:</h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <CardComponent card={gameState.auctionCard} />
          </div>
        </div>
      ) : (
        <div style={{ 
          color: '#666', 
          fontStyle: 'italic',
          marginBottom: '20px'
        }}>
          No card currently being auctioned
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
          Current Bid: ${gameState.currentBid}
        </div>
        {gameState.currentBidder && (
          <div style={{ fontSize: '14px', color: '#666' }}>
            Current Bidder: {gameState.players.find(p => p.id === gameState.currentBidder)?.name}
          </div>
        )}
      </div>

      {currentPlayer && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            Your Money: ${currentPlayer.money}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="number"
              value={bidAmount}
              onChange={handleBidChange}
              min={gameState.currentBid + 1}
              max={currentPlayer.money}
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
                : 'Not enough money'}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onWinAuction}
        disabled={!gameState.currentBidder}
        style={{
          padding: '12px 24px',
          backgroundColor: gameState.currentBidder ? '#FF9800' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: gameState.currentBidder ? 'pointer' : 'not-allowed',
          fontSize: '16px'
        }}
      >
        End Auction
      </button>
    </div>
  );
};

export default AuctionPanel; 