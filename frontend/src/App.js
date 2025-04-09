import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GameSetupPage from './pages/GameSetupPage';
import GamePlayPage from './pages/GamePlayPage';
import GameResultPage from './pages/GameResultPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ApiDebugger from './components/ApiDebugger';

const App = () => {
  return (
    <div className="app">
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<GameSetupPage />} />
          <Route path="/game/:gameId" element={<GamePlayPage />} />
          <Route path="/result/:gameId" element={<GameResultPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ApiDebugger />
    </div>
  );
};

export default App;