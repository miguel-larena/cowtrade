import { Routes, Route, Link } from 'react-router-dom';
import Lobby from './pages/Lobby';
import GameBoard from './pages/GameBoard';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Lobby</Link> | <Link to="/game">Game Board</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/game" element={<GameBoard />} />
      </Routes>
    </div>
  )
}

export default App
