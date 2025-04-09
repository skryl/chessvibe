import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';
import api from '../services/api';
import './LeaderboardPage.css';

const LeaderboardPage = () => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const users = await api.getUsers();
      setPlayers(users);
      setError('');
    } catch (err) {
      setError('Failed to load players. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="leaderboard-page">
      <h1 className="leaderboard-page-title">Chess Leaderboard</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading players...</div>
      ) : (
        <>
          <Leaderboard players={players} />

          <div className="leaderboard-actions">
            <Link to="/setup" className="btn btn-primary">Start New Game</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default LeaderboardPage;