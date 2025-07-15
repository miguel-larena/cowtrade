import React from 'react';
import type { Player } from '../types';
import CardComponent from './Card';

interface ScoreboardProps {
  players: Player[];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players }) => {
  // Calculate scores for each player
  const calculateScore = (player: Player) => {
    const animalCards = player.hand.filter(card => card.type === 'animal');
    const animalCounts = new Map<string, number>();
    
    // Count each animal type
    for (const card of animalCards) {
      animalCounts.set(card.name, (animalCounts.get(card.name) || 0) + 1);
    }
    
    let totalScore = 0;
    let quartetCount = 0;
    
    // Calculate score for each quartet
    for (const [animalType, count] of animalCounts) {
      if (count === 4) {
        // Find the face value of this animal type
        const animalCard = animalCards.find(card => card.name === animalType);
        if (animalCard) {
          totalScore += animalCard.value;
          quartetCount++;
        }
      }
    }
    
    // Multiply by number of quartets if player has multiple quartets
    if (quartetCount > 1) {
      totalScore *= quartetCount;
    }
    
    return { score: totalScore, quartetCount };
  };

  // Sort players by score (highest first)
  const playersWithScores = players.map(player => {
    const { score, quartetCount } = calculateScore(player);
    return { ...player, score, quartetCount };
  }).sort((a, b) => b.score - a.score);

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      border: '2px solid #4CAF50',
      marginBottom: '24px'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#2E7D32',
        marginBottom: '24px',
        fontSize: '28px',
        fontWeight: 'bold'
      }}>
        🏆 Final Scoreboard
      </h2>

      <div style={{
        display: 'grid',
        gap: '16px'
      }}>
        {playersWithScores.map((player, index) => {
          const animalCards = player.hand.filter(card => card.type === 'animal');
          const moneyCards = player.hand.filter(card => card.type === 'money');
          
          return (
            <div key={player.id} style={{
              padding: '20px',
              backgroundColor: index === 0 ? '#fff3cd' : '#ffffff',
              borderRadius: '8px',
              border: `2px solid ${index === 0 ? '#ffc107' : '#e0e0e0'}`,
              position: 'relative'
            }}>
              {/* Position indicator */}
              {index === 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  backgroundColor: '#ffc107',
                  color: '#333',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  1st Place 🥇
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '20px',
                alignItems: 'start'
              }}>
                {/* Player Info and Cards */}
                <div>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    color: '#333',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>
                    {player.name}
                  </h3>
                  
                  {/* Score */}
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '6px',
                    border: '1px solid #4CAF50'
                  }}>
                    <p style={{
                      margin: '0',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#2E7D32'
                    }}>
                      Score: {player.score} points
                    </p>
                    {player.quartetCount > 0 && (
                      <p style={{
                        margin: '4px 0 0 0',
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {player.quartetCount} quartet{player.quartetCount > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Animal Cards */}
                  <div style={{ marginBottom: '16px' }}>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      color: '#333',
                      fontSize: '16px'
                    }}>
                      Animal Cards ({animalCards.length}):
                    </h4>
                    {animalCards.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        {animalCards.map(card => (
                          <CardComponent
                            key={card.id}
                            card={card}
                            selected={false}
                            onClick={() => {}} // No click handler for scoreboard
                          />
                        ))}
                      </div>
                    ) : (
                      <p style={{
                        margin: '0',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        No animal cards
                      </p>
                    )}
                  </div>

                  {/* Money Cards */}
                  <div>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      color: '#333',
                      fontSize: '16px'
                    }}>
                      Money Cards ({moneyCards.length}):
                    </h4>
                    {moneyCards.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                      }}>
                        {moneyCards.map(card => (
                          <CardComponent
                            key={card.id}
                            card={card}
                            selected={false}
                            onClick={() => {}} // No click handler for scoreboard
                          />
                        ))}
                      </div>
                    ) : (
                      <p style={{
                        margin: '0',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        No money cards
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div style={{
                  minWidth: '200px',
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}>
                  <h4 style={{
                    margin: '0 0 12px 0',
                    color: '#333',
                    fontSize: '16px'
                  }}>
                    Score Breakdown:
                  </h4>
                  {(() => {
                    const animalCounts = new Map<string, number>();
                    for (const card of animalCards) {
                      animalCounts.set(card.name, (animalCounts.get(card.name) || 0) + 1);
                    }
                    
                    const breakdown = [];
                    for (const [animalType, count] of animalCounts) {
                      if (count === 4) {
                        const animalCard = animalCards.find(card => card.name === animalType);
                        if (animalCard) {
                          breakdown.push(
                            <div key={animalType} style={{
                              marginBottom: '8px',
                              padding: '8px',
                              backgroundColor: '#e8f5e8',
                              borderRadius: '4px',
                              border: '1px solid #4CAF50'
                            }}>
                              <p style={{
                                margin: '0',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#2E7D32'
                              }}>
                                {animalType} Quartet: {animalCard.value} points
                              </p>
                            </div>
                          );
                        }
                      }
                    }
                    
                    if (breakdown.length === 0) {
                      return (
                        <p style={{
                          margin: '0',
                          color: '#666',
                          fontStyle: 'italic',
                          fontSize: '14px'
                        }}>
                          No complete quartets
                        </p>
                      );
                    }
                    
                    return breakdown;
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard; 