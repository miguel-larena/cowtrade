import { Card } from '../types';

interface PlayerHandProps {
  cards: Card[];
}

const PlayerHand: React.FC<PlayerHandProps> = ({ cards }) => (
  <div>
    <h3>Your Hand</h3>
    <ul>
      {cards.map(card => (
        <li key={card.id}>{card.name} ({card.type}, {card.value})</li>
      ))}
    </ul>
  </div>
);

export default PlayerHand;