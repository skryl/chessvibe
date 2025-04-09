import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import './GameResultPage.css';

const GameResultPage = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [whitePlayer, setWhitePlayer] = useState(null);
  const [blackPlayer, setBlackPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGameResults();
  }, [gameId]);

  const fetchGameResults = async () => {
    try {
      setIsLoading(true);

      // Get the game data
      const gameData = await api.getGame(gameId);
      setGame(gameData);

      // Get updated player data with current ratings
      const whitePlayerData = await api.getUser(gameData.white_player.id);
      const blackPlayerData = await api.getUser(gameData.black_player.id);

      setWhitePlayer(whitePlayerData);
      setBlackPlayer(blackPlayerData);

      setError('');
    } catch (err) {
      setError('Failed to load game results. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading game results...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!game || !whitePlayer || !blackPlayer) {
    return <div className="error">Game results not found</div>;
  }

  // Determine game result message
  let resultMessage = '';
  if (game.status === 'draw') {
    resultMessage = 'The game ended in a draw';
  } else if (game.winner_id === whitePlayer.id) {
    resultMessage = `${whitePlayer.username} (White) won by ${game.in_checkmate ? 'checkmate' : 'resignation'}`;
  } else if (game.winner_id === blackPlayer.id) {
    resultMessage = `${blackPlayer.username} (Black) won by ${game.in_checkmate ? 'checkmate' : 'resignation'}`;
  }

  // Calculate Elo changes (approximate) - this should be done on the server in a real app
  // Just for display purposes here
  const whiteEloChange = whitePlayer.id === game.winner_id
    ? '+15'
    : (game.status === 'draw' ? '0' : '-15');

  const blackEloChange = blackPlayer.id === game.winner_id
    ? '+15'
    : (game.status === 'draw' ? '0' : '-15');

  return (
    <div className="game-result-page">
      <h1 className="result-title">Game Results</h1>

      <div className="result-card">
        <div className="result-header">
          <h2>{resultMessage}</h2>
          <p className="game-info">Game #{gameId}</p>
        </div>

        <div className="players-result">
          <div className="player-result white">
            <h3>{whitePlayer.username} (White)</h3>
            <div className="elo-change">
              <span className="elo-rating">New Elo: {whitePlayer.elo_rating}</span>
              <span className={`elo-diff ${whiteEloChange.startsWith('+') ? 'positive' : (whiteEloChange === '0' ? 'neutral' : 'negative')}`}>
                {whiteEloChange}
              </span>
            </div>
            <div className="player-stats">
              <p>Wins: {whitePlayer.stats.wins}</p>
              <p>Losses: {whitePlayer.stats.losses}</p>
              <p>Draws: {whitePlayer.stats.draws}</p>
            </div>
          </div>

          <div className="vs">vs</div>

          <div className="player-result black">
            <h3>{blackPlayer.username} (Black)</h3>
            <div className="elo-change">
              <span className="elo-rating">New Elo: {blackPlayer.elo_rating}</span>
              <span className={`elo-diff ${blackEloChange.startsWith('+') ? 'positive' : (blackEloChange === '0' ? 'neutral' : 'negative')}`}>
                {blackEloChange}
              </span>
            </div>
            <div className="player-stats">
              <p>Wins: {blackPlayer.stats.wins}</p>
              <p>Losses: {blackPlayer.stats.losses}</p>
              <p>Draws: {blackPlayer.stats.draws}</p>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <Link to="/leaderboard" className="btn">View Leaderboard</Link>
          <Link to="/setup" className="btn btn-primary">Play Again</Link>
        </div>
      </div>
    </div>
  );
};

export default GameResultPage;