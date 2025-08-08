import React from 'react';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
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
  onExecuteTrade
}) => {

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
            Waiting for the game to start...
          </div>
        );
      
      case 'auction':
        return (
          <div>
            <AuctionPanel
              gameState={gameState}
              currentPlayerId={currentPlayerId || ''}
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
            currentPlayerId={currentPlayerId || ''}
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
      width: '100vw',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Current Player's Hand - Top */}
        {currentPlayerId && (
          <div style={{
            width: '100%',
            maxWidth: '100%'
          }}>
            <h2 style={{ 
              margin: '0 0 16px 0', 
              color: '#2c3e50',
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: '600'
            }}>
              Your Hand
            </h2>
            <div style={{ 
              display: 'grid', 
              gap: '16px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
                          {gameState.players
              .filter(player => player.id === currentPlayerId)
              .map((player) => (
                <PlayerHand
                  key={player.id}
                  player={player}
                  isCurrentPlayer={true}
                  isCurrentTurn={gameState.currentTurn === player.id}
                  showBluffInfo={gameState.auctionState === 'summary' && gameState.auctionSummary?.type === 'bluff_detected'}
                  bluffInfo={gameState.auctionSummary?.type === 'bluff_detected' && 
                    gameState.auctionSummary.blufferName && 
                    gameState.auctionSummary.blufferMoney !== undefined && 
                    gameState.auctionSummary.bidAmount !== undefined && 
                    gameState.auctionSummary.animalName ? {
                    blufferName: gameState.auctionSummary.blufferName,
                    blufferMoney: gameState.auctionSummary.blufferMoney,
                    bidAmount: gameState.auctionSummary.bidAmount,
                    animalName: gameState.auctionSummary.animalName
                  } : undefined}
                  currentAuctioneer={gameState.auctioneer}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Game Area - Auction/Trade Panels */}
        <div style={{
          width: '100%',
          maxWidth: '100%'
        }}>
          {/* Phase Content */}
          <div style={{
            width: '100%',
            marginBottom: '24px'
          }}>
            {renderPhaseContent()}
          </div>
        </div>

        {/* Other Players' Hands - Bottom */}
        <div style={{
          width: '100%',
          maxWidth: '100%'
        }}>
          <h2 style={{ 
            margin: '0 0 16px 0', 
            color: '#2c3e50',
            fontSize: 'clamp(18px, 4vw, 24px)',
            fontWeight: '600'
          }}>
            Other Players
          </h2>
          <div style={{ 
            display: 'grid', 
            gap: '16px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
          }}>
            {gameState.players
              .filter(player => player.id !== currentPlayerId)
              .map((player) => (
                <PlayerHand
                  key={player.id}
                  player={player}
                  isCurrentPlayer={false}
                  isCurrentTurn={gameState.currentTurn === player.id}
                  showBluffInfo={gameState.auctionState === 'summary' && gameState.auctionSummary?.type === 'bluff_detected'}
                  bluffInfo={gameState.auctionSummary?.type === 'bluff_detected' && 
                    gameState.auctionSummary.blufferName && 
                    gameState.auctionSummary.blufferMoney !== undefined && 
                    gameState.auctionSummary.bidAmount !== undefined && 
                    gameState.auctionSummary.animalName ? {
                    blufferName: gameState.auctionSummary.blufferName,
                    blufferMoney: gameState.auctionSummary.blufferMoney,
                    bidAmount: gameState.auctionSummary.bidAmount,
                    animalName: gameState.auctionSummary.animalName
                  } : undefined}
                  currentAuctioneer={gameState.auctioneer}
                />
              ))}
          </div>
        </div>

        {/* Sidebar - Only show when game ends */}
        {gameState.currentPhase === 'end' && (
          <div style={{
            width: '100%',
            maxWidth: '100%',
            order: -1
          }}>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;