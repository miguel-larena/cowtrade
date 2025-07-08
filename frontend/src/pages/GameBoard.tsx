import React, { useState } from 'react';
import { testGameState } from '../testData';
import { placeBid, winAuction } from '../gameLogic';
import PlayerHand from '../components/PlayerHand';
import AuctionPanel from '../components/AuctionPanel';
import type { GameState } from '../types';

const currentPlayerId = 'player1'; // For demo, hardcoded. In a real app, this would be dynamic.

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(testGameState);

  const handlePlaceBid = (amount: number) => {
    setGameState(prev => placeBid(currentPlayerId, amount, prev));
  };

  const handleWinAuction = () => {
    setGameState(prev => winAuction(prev));
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <h1 style={{ textAlign: 'center', color: '#2E7D32', marginBottom: '32px' }}>
        Kuhhandel - Game Board
      </h1>

      <AuctionPanel
        gameState={gameState}
        currentPlayerId={currentPlayerId}
        onPlaceBid={handlePlaceBid}
        onWinAuction={handleWinAuction}
      />

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px',
        justifyContent: 'center',
        marginTop: '32px',
      }}>
        {gameState.players.map(player => (
          <PlayerHand key={player.id} player={player} />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;