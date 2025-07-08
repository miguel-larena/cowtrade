import React, { useState } from 'react';
import type { GameState } from '../types';
import CardComponent from './Card';

interface TradingPanelProps {
  gameState: GameState;
  onTradeCards: (player1Id: string, player2Id: string, card1Id: string, card2Id: string) => void;
}

const TradingPanel: React.FC<TradingPanelProps> = ({
  gameState,
  onTradeCards
}) => {
  const [selectedPlayer1, setSelectedPlayer1] = useState<string>('');
  const [selectedPlayer2, setSelectedPlayer2] = useState<string>('');
  const [selectedCard1, setSelectedCard1] = useState<string>('');
  const [selectedCard2, setSelectedCard2] = useState<string>('');

  const player1 = gameState.players.find(p => p.id === selectedPlayer1);
  const player2 = gameState.players.find(p => p.id === selectedPlayer2);

  const handleTrade = () => {
    if (selectedPlayer1 && selectedPlayer2 && selectedCard1 && selectedCard2) {
      onTradeCards(selectedPlayer1, selectedPlayer2, selectedCard1, selectedCard2);
      // Reset selections
      setSelectedPlayer1('');
      setSelectedPlayer2('');
      setSelectedCard1('');
      setSelectedCard2('');
    }
  };

  const canTrade = selectedPlayer1 && selectedPlayer2 && selectedCard1 && selectedCard2;

  return (
    <div style={{
      border: '2px solid #2196F3',
      borderRadius: '8px',
      padding: '20px',
      margin: '16px',
      backgroundColor: '#f0f8ff'
    }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#1976D2' }}>
        Trading Phase
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Player 1 Selection */}
        <div>
          <h3 style={{ margin: '0 0 12px 0' }}>Player 1</h3>
          <select
            value={selectedPlayer1}
            onChange={(e) => {
              setSelectedPlayer1(e.target.value);
              setSelectedCard1(''); // Reset card selection
            }}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="">Select Player 1</option>
            {gameState.players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} (${player.money})
              </option>
            ))}
          </select>

          {player1 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>Select Card to Trade:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {player1.hand.map(card => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    selected={selectedCard1 === card.id}
                    onClick={() => setSelectedCard1(card.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Player 2 Selection */}
        <div>
          <h3 style={{ margin: '0 0 12px 0' }}>Player 2</h3>
          <select
            value={selectedPlayer2}
            onChange={(e) => {
              setSelectedPlayer2(e.target.value);
              setSelectedCard2(''); // Reset card selection
            }}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="">Select Player 2</option>
            {gameState.players.map(player => (
              <option key={player.id} value={player.id}>
                {player.name} (${player.money})
              </option>
            ))}
          </select>

          {player2 && (
            <div>
              <h4 style={{ margin: '0 0 8px 0' }}>Select Card to Trade:</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {player2.hand.map(card => (
                  <CardComponent
                    key={card.id}
                    card={card}
                    selected={selectedCard2 === card.id}
                    onClick={() => setSelectedCard2(card.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trade Summary */}
      {canTrade && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          border: '1px solid #2196F3'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Trade Summary:</h4>
          <p style={{ margin: '0' }}>
            {player1?.name} will give {player1?.hand.find(c => c.id === selectedCard1)?.name} 
            to {player2?.name} in exchange for {player2?.hand.find(c => c.id === selectedCard2)?.name}
          </p>
        </div>
      )}

      {/* Trade Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleTrade}
          disabled={!canTrade}
          style={{
            padding: '12px 24px',
            backgroundColor: canTrade ? '#2196F3' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: canTrade ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          Execute Trade
        </button>
      </div>

      {!canTrade && (
        <div style={{
          textAlign: 'center',
          marginTop: '12px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Select both players and their cards to trade
        </div>
      )}
    </div>
  );
};

export default TradingPanel; 