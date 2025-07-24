import React, { useState } from 'react';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
import GameControls from '../components/GameControls';
import Scoreboard from '../components/Scoreboard';
import type { GameState } from '../types';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string | null;
  onStartAuction: (auctioneerId: string) => Promise<void>;
  onPlaceBid: (bidderId: string, amount: number) => Promise<void>;
  onEndAuction: () => Promise<void>;
  onMatchBid: () => Promise<void>;
  onClearAuctionSummary: () => Promise<void>;
  onRestartAuctionAfterBluff: () => Promise<void>;
  onInitiateTrade: (initiatorId: string, partnerId: string) => Promise<void>;
  onMakeTradeOffer: (playerId: string, moneyCards: string[], animalCards: string[]) => Promise<void>;
  onExecuteTrade: () => Promise<void>;
  onRefreshGameState: () => Promise<void>;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onStartAuction,
  onPlaceBid,
  onEndAuction,
  onMatchBid,
  onClearAuctionSummary,
  onRestartAuctionAfterBluff,
  onInitiateTrade,
  onMakeTradeOffer,
  onExecuteTrade,
  onRefreshGameState
}) => {
  const [testPlayerId, setTestPlayerId] = useState(currentPlayerId || '');

  // Update test player ID when current player ID changes
  React.useEffect(() => {
    if (currentPlayerId) {
      setTestPlayerId(currentPlayerId);
    }
  }, [currentPlayerId]);

  const renderPhaseContent = () => {
    switch (gameState.currentPhase) {
      case 'lobby':
        return (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#6c757d',
            fontStyle: 'italic',
            fontSize: '18px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '16px' }}>🎮</div>
            Use the Game Controls to start the game
          </div>
        );
      
      case 'auction':
        return (
          <div>
            <AuctionPanel
              gameState={gameState}
              currentPlayerId={testPlayerId}
              onStartAuction={onStartAuction}
              onPlaceBid={onPlaceBid}
              onEndAuction={onEndAuction}
              onMatchBid={onMatchBid}
              onClearAuctionSummary={onClearAuctionSummary}
              onRestartAuctionAfterBluff={onRestartAuctionAfterBluff}
            />
          </div>
        );
      
      case 'trade':
        return (
          <TradingPanel
            gameState={gameState}
            currentPlayerId={testPlayerId}
            onInitiateTrade={onInitiateTrade}
            onMakeTradeOffer={onMakeTradeOffer}
            onExecuteTrade={onExecuteTrade}
          />
        );
      
      case 'end':
        return (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#28a745',
            fontSize: '24px',
            fontWeight: 'bold',
            backgroundColor: '#d4edda',
            borderRadius: '12px',
            border: '2px solid #c3e6cb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            🏆 Game Over! Check the scoreboard for final results.
          </div>
        );
      
      default:
        return (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#6c757d',
            fontStyle: 'italic',
            fontSize: '18px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            Unknown game phase
          </div>
        );
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Main Game Area */}
        <div>
          {/* Game Controls */}
          <GameControls
            gameState={gameState}
            currentPlayerId={testPlayerId}
            onRefreshGameState={onRefreshGameState}
          />

          {/* Phase Content */}
          <div style={{ marginTop: '24px' }}>
            {renderPhaseContent()}
          </div>

          {/* Player Hands */}
          <div style={{ marginTop: '24px' }}>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              color: '#2c3e50',
              fontSize: '20px',
              fontWeight: '600'
            }}>
              Player Hands
            </h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {gameState.players.map((player) => (
                <PlayerHand
                  key={player.id}
                  player={player}
                  isCurrentPlayer={player.id === testPlayerId}
                  isCurrentTurn={gameState.currentTurn === player.id}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ position: 'sticky', top: '24px' }}>
          {/* Scoreboard */}
          <Scoreboard
            players={gameState.players}
            currentTurn={gameState.currentTurn}
            currentPhase={gameState.currentPhase}
            auctionState={gameState.auctionState}
            auctionCard={gameState.auctionCard}
            currentBid={gameState.currentBid}
            currentBidder={gameState.currentBidder}
            auctioneer={gameState.auctioneer}
            auctionSummary={gameState.auctionSummary}
          />

          {/* Player Selection (for testing) */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Test Player Selection
            </h3>
            <select
              value={testPlayerId}
              onChange={(e) => setTestPlayerId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#ffffff'
              }}
            >
              {gameState.players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} {player.id === currentPlayerId ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;