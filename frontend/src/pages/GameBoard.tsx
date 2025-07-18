import React, { useState } from 'react';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
import GameControls from '../components/GameControls';
import Scoreboard from '../components/Scoreboard';
import type { GameState, GamePhase } from '../types';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onPhaseChange: (phase: GamePhase) => void;
  onNextTurn: () => void;
  onPlaceBid: (playerId: string, amount: number) => void;
  onWinAuction: () => void;
  onStartGame: () => void;
  onEndGame: () => void;
  isCurrentPlayerTurn: (playerId: string) => boolean;
  onStartAuction: (auctioneerId: string) => void;
  onPlaceBidInAuction: (bidderId: string, amount: number) => void;
  onEndAuction: () => void;
  onMatchBid: () => void;
  onEmptyDeck: () => void;
  onAddAnimalCards: () => void;
  onInitiateTrade: (initiatorId: string) => void;
  onSelectTradePartner: (partnerId: string) => void;
  onSelectAnimalCardsForTrade: (animalCards: string[]) => void;
  onMakeTradeOffer: (playerId: string, moneyCards: string[]) => void;
  onConfirmTrade: (playerId: string) => void;
  onExecuteTrade: () => void;
  onCancelTrade: () => void;
  onRestartTradeAfterTie: () => void;
  onClearAuctionSummary: () => void;
  onRestartAuctionAfterBluff: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onPhaseChange,
  isCurrentPlayerTurn,
  onStartAuction,
  onPlaceBidInAuction,
  onEndAuction,
  onMatchBid,
  onInitiateTrade,
  onSelectTradePartner,
  onSelectAnimalCardsForTrade,
  onMakeTradeOffer,
  onConfirmTrade,
  onExecuteTrade,
  onCancelTrade,
  onRestartTradeAfterTie,
  onClearAuctionSummary,
  onRestartAuctionAfterBluff
}) => {
  const [testPlayerId, setTestPlayerId] = useState(currentPlayerId);

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
              onPlaceBid={onPlaceBidInAuction}
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
            onSelectTradePartner={onSelectTradePartner}
            onSelectAnimalCardsForTrade={onSelectAnimalCardsForTrade}
            onMakeTradeOffer={onMakeTradeOffer}
            onConfirmTrade={onConfirmTrade}
            onExecuteTrade={onExecuteTrade}
            onCancelTrade={onCancelTrade}
            onRestartTradeAfterTie={onRestartTradeAfterTie}
          />
        );
      
      case 'end':
        return (
          <div>
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: '#155724',
              fontSize: '24px',
              fontWeight: 'bold',
              backgroundColor: '#d4edda',
              borderRadius: '12px',
              border: '2px solid #c3e6cb',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(40,167,69,0.2)'
            }}>
              🎉 Game Over! All animal quartets have been decided.
            </div>
            <Scoreboard players={gameState.players} />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="game-board" style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#2c3e50',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 className="game-title" style={{ 
        textAlign: 'center', 
        color: '#2c3e50', 
        marginBottom: '24px',
        fontSize: 'clamp(24px, 5vw, 36px)',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        🐟 Kuhhandel - Game Board
      </h1>

      {/* Player Switcher for Testing */}
      <div className="player-switcher" style={{
        backgroundColor: '#e3f2fd',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '2px solid #2196F3',
        boxShadow: '0 4px 12px rgba(33,150,243,0.15)'
      }}>
        <h3 style={{ 
          margin: '0 0 12px 0', 
          color: '#1976D2',
          fontSize: 'clamp(14px, 3vw, 18px)',
          fontWeight: '600'
        }}>
          🧪 Testing Mode - Switch Player View
        </h3>
        <div className="player-buttons" style={{ 
          display: 'flex', 
          gap: '8px', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          marginBottom: '12px'
        }}>
          <span style={{ 
            fontWeight: '600', 
            color: '#495057',
            fontSize: 'clamp(12px, 2.5vw, 14px)'
          }}>View as:</span>
          {gameState.players.map(player => (
            <button
              key={player.id}
              className="player-button"
              onClick={() => setTestPlayerId(player.id)}
              style={{
                padding: '8px 12px',
                backgroundColor: testPlayerId === player.id ? '#2196F3' : '#ffffff',
                color: testPlayerId === player.id ? 'white' : '#1976D2',
                border: `2px solid ${testPlayerId === player.id ? '#1976D2' : '#2196F3'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: 'clamp(11px, 2.5vw, 14px)',
                transition: 'all 0.2s ease',
                boxShadow: testPlayerId === player.id ? '0 4px 8px rgba(33,150,243,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                if (testPlayerId !== player.id) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(33,150,243,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (testPlayerId !== player.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }
              }}
            >
              {player.name}
              {isCurrentPlayerTurn(player.id) && (
                <span style={{ 
                  marginLeft: '4px', 
                  fontSize: '10px',
                  color: testPlayerId === player.id ? 'white' : '#28a745'
                }}>👑</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ 
          fontSize: 'clamp(11px, 2.5vw, 14px)', 
          color: '#6c757d',
          fontStyle: 'italic',
          textAlign: 'center'
        }}>
          Current turn: <strong>{gameState.players.find(p => p.id === gameState.currentTurn)?.name}</strong>
        </div>
      </div>

      <div className="main-layout" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: '16px',
        alignItems: 'start'
      }}>
        {/* Game Controls */}
        <div className="game-controls" style={{ 
          order: 1
        }}>
          <GameControls
            gameState={gameState}
            currentPlayerId={testPlayerId}
            onPhaseChange={onPhaseChange}
          />
        </div>

        {/* Main Content Area */}
        <div className="main-content" style={{ 
          order: 2,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '1px solid #e9ecef'
        }}>
          {/* Phase-specific content */}
          {renderPhaseContent()}

          {/* Player Hands */}
          <div className="player-hands" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginTop: '24px'
          }}>
            {gameState.players.map(player => (
              <PlayerHand 
                key={player.id} 
                player={player}
                currentPlayerId={testPlayerId}
                selectable={gameState.currentPhase === 'trade'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      {gameState.currentPhase !== 'lobby' && gameState.currentPhase !== 'end' && (
        <div className="turn-indicator" style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '12px 16px',
          backgroundColor: isCurrentPlayerTurn(testPlayerId) ? '#28a745' : '#ffc107',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: 'clamp(12px, 3vw, 16px)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 1000,
          border: '2px solid rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          maxWidth: '200px',
          textAlign: 'center'
        }}>
          {isCurrentPlayerTurn(testPlayerId) ? '🎯 Your Turn!' : `⏳ ${gameState.players.find(p => p.id === gameState.currentTurn)?.name}'s Turn`}
        </div>
      )}
    </div>
  );
};

export default GameBoard;