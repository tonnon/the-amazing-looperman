import HeroSection from './components/HeroSection/HeroSection';
import './styles/App.css';
import { Route, Routes } from 'react-router-dom';
import GameCanvas from './components/GameCanvas/GameCanvas';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<HeroSection />} />
        <Route path="/game" element={<GameCanvas />} />
      </Routes>
    </div>
  );
}

export default App;