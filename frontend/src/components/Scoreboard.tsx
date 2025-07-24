import React from 'react';
import type { Player, GameState, AuctionState, Card, AuctionSummary } from '../types';
import CardComponent from './Card';

interface ScoreboardProps {
  players: Player[];
  currentTurn: string;
  currentPhase: string;
  auctionState: AuctionState;
  auctionCard?: Card;
  currentBid: number;
  currentBidder: string | null;
  auctioneer: string | null;
  auctionSummary?: AuctionSummary;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ 
  players, 
  currentTurn, 
  currentPhase, 
  auctionState, 
  auctionCard, 
  currentBid, 
  currentBidder, 
  auctioneer, 
  auctionSummary 
}) => {
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

  const currentTurnPlayer = players.find(p => p.id === currentTurn);
  const currentBidderPlayer = players.find(p => p.id === currentBidder);
  const auctioneerPlayer = players.find(p => p.id === auctioneer);

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
        🏆 Scoreboard
      </h2>

      {/* Game Status */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#2c3e50', fontSize: '16px' }}>
          Game Status
        </h3>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>Phase:</strong> {currentPhase}
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <strong>Current Turn:</strong> {currentTurnPlayer?.name || 'Unknown'}
        </div>

        {auctionState !== 'none' && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Auction State:</strong> {auctionState}
          </div>
        )}

        {auctionCard && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Auction Card:</strong> {auctionCard.name} (${auctionCard.value})
          </div>
        )}

        {currentBid > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Current Bid:</strong> ${currentBid} by {currentBidderPlayer?.name || 'Unknown'}
          </div>
        )}

        {auctioneer && (
          <div style={{ marginBottom: '8px' }}>
            <strong>Auctioneer:</strong> {auctioneerPlayer?.name || 'Unknown'}
          </div>
        )}

        {auctionSummary && (
          <div style={{
            marginTop: '12px',
            padding: '8px',
            backgroundColor: '#e8f5e8',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            <strong>Auction Summary:</strong> {auctionSummary.message}
          </div>
        )}
      </div>

      {/* Player Scores */}
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
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <h3 style={{
                  margin: 0,
                  color: '#2c3e50',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {player.name}
                  {player.id === currentTurn && (
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      Turn
                    </span>
                  )}
                </h3>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#28a745'
                  }}>
                    ${player.money}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#6c757d'
                  }}>
                    Score: {player.score}
                  </div>
                </div>
              </div>

              {/* Animal Cards */}
              {animalCards.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#495057',
                    marginBottom: '8px'
                  }}>
                    Animal Cards ({animalCards.length}):
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                  }}>
                    {animalCards.map(card => (
                      <CardComponent
                        key={card.id}
                        card={card}
                        showValue={true}
                        isOwnCard={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Money Cards */}
              {moneyCards.length > 0 && (
                <div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#495057',
                    marginBottom: '8px'
                  }}>
                    Money Cards ({moneyCards.length}):
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px'
                  }}>
                    {moneyCards.map(card => (
                      <CardComponent
                        key={card.id}
                        card={card}
                        showValue={true}
                        isOwnCard={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard; 