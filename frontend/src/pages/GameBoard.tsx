import React from 'react';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import TradingPanel from '../components/TradingPanel';
import GameControls from '../components/GameControls';
import BidderWindows from '../components/BidderWindows';
import type { GameState, GamePhase } from '../types';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onPhaseChange: (phase: GamePhase) => void;
  onNextTurn: () => void;
  onPlaceBid: (playerId: string, amount: number) => void;
  onWinAuction: () => void;
  onTradeCards: (player1Id: string, player2Id: string, card1Id: string, card2Id: string) => void;
  onStartGame: () => void;
  onEndGame: () => void;
  isCurrentPlayerTurn: (playerId: string) => boolean;
  onStartAuction: (auctioneerId: string) => void;
  onPlaceBidInAuction: (bidderId: string, amount: number) => void;
  onEndAuction: () => void;
  onMatchBid: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  currentPlayerId,
  onPhaseChange,
  onNextTurn,
  onTradeCards,
  onStartGame,
  onEndGame,
  isCurrentPlayerTurn,
  onStartAuction,
  onPlaceBidInAuction,
  onEndAuction,
  onMatchBid
}) => {

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
              currentPlayerId={currentPlayerId}
              onStartAuction={onStartAuction}
              onPlaceBid={onPlaceBidInAuction}
              onEndAuction={onEndAuction}
              onMatchBid={onMatchBid}
            />
            <BidderWindows
              gameState={gameState}
              onPlaceBid={onPlaceBidInAuction}
            />
          </div>
        );
      
      case 'trade':
        return (
          <TradingPanel
            gameState={gameState}
            onTradeCards={(player1Id, player2Id, card1Id, card2Id) => onTradeCards(player1Id, player2Id, card1Id, card2Id)}
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

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Left Sidebar - Game Controls */}
        <div style={{ order: 1 }}>
          <GameControls
            gameState={gameState}
            currentPlayerId={currentPlayerId}
            onPhaseChange={onPhaseChange}
            onNextTurn={onNextTurn}
            onStartGame={onStartGame}
            onEndGame={onEndGame}
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
          backgroundColor: isCurrentPlayerTurn(currentPlayerId) ? '#4CAF50' : '#FF9800',
          color: 'white',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          {isCurrentPlayerTurn(currentPlayerId) ? 'Your Turn!' : `${gameState.players.find(p => p.id === gameState.currentTurn)?.name}'s Turn`}
        </div>
      )}
    </div>
  );
};

export default GameBoard;