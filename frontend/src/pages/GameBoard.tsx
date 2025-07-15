import React, { useState } from 'react';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
import GameControls from '../components/GameControls';
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
  onCancelTrade
}) => {
  const [testPlayerId, setTestPlayerId] = useState(currentPlayerId);

  const renderPhaseContent = () => {
    switch (gameState.currentPhase) {
      case 'lobby':
        return (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#555',
            fontStyle: 'italic',
            fontSize: '18px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
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
          />
        );
      
      case 'end':
        return (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#F44336',
            fontSize: '20px',
            fontWeight: 'bold',
            backgroundColor: '#ffebee',
            borderRadius: '8px',
            border: '2px solid #F44336'
          }}>
            Game Over! Check the final scores below.
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#333'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#2E7D32', 
        marginBottom: '32px',
        fontSize: '32px',
        fontWeight: 'bold'
      }}>
        Kuhhandel - Game Board
      </h1>

      {/* Player Switcher for Testing */}
      <div style={{
        backgroundColor: '#f0f8ff',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '2px solid #2196F3'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#1976D2' }}>
          🧪 Testing Mode - Switch Player View
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 'bold', color: '#555' }}>View as:</span>
          {gameState.players.map(player => (
            <button
              key={player.id}
              onClick={() => setTestPlayerId(player.id)}
              style={{
                padding: '8px 16px',
                backgroundColor: testPlayerId === player.id ? '#2196F3' : '#e3f2fd',
                color: testPlayerId === player.id ? 'white' : '#1976D2',
                border: `2px solid ${testPlayerId === player.id ? '#1976D2' : '#2196F3'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              {player.name}
              {isCurrentPlayerTurn(player.id) && (
                <span style={{ marginLeft: '4px', fontSize: '12px' }}>👑</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ 
          marginTop: '8px', 
          fontSize: '14px', 
          color: '#666',
          fontStyle: 'italic'
        }}>
          Current turn: {gameState.players.find(p => p.id === gameState.currentTurn)?.name}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Left Sidebar - Game Controls */}
        <div style={{ order: 1 }}>
          <GameControls
            gameState={gameState}
            currentPlayerId={testPlayerId}
            onPhaseChange={onPhaseChange}
          />
        </div>

        {/* Main Content Area */}
        <div style={{ order: 2 }}>
          {/* Phase-specific content */}
          {renderPhaseContent()}

          {/* Player Hands */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginTop: '32px'
          }}>
            {gameState.players.map(player => (
              <PlayerHand 
                key={player.id} 
                player={player}
                selectable={gameState.currentPhase === 'trade'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      {gameState.currentPhase !== 'lobby' && gameState.currentPhase !== 'end' && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          backgroundColor: isCurrentPlayerTurn(testPlayerId) ? '#4CAF50' : '#FF9800',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {isCurrentPlayerTurn(testPlayerId) ? 'Your Turn!' : `${gameState.players.find(p => p.id === gameState.currentTurn)?.name}'s Turn`}
        </div>
      )}
    </div>
  );
};

export default GameBoard;