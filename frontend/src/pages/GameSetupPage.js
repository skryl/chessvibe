import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './GameSetupPage.css';

const GameSetupPage = () => {
  const [whitePlayerId, setWhitePlayerId] = useState('');
  const [blackPlayerId, setBlackPlayerId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    // Load the list of users when the component mounts
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const usersList = await api.getUsers();
      setUsers(usersList);
      setError('');
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    try {
      setIsLoading(true);
      const newUser = await api.createUser(newUsername);
      setUsers([...users, newUser]);
      setNewUsername('');
      setIsCreatingUser(false);
      setError('');
    } catch (err) {
      setError('Failed to create user. Username might already exist.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartGame = async (e) => {
    e.preventDefault();

    if (!whitePlayerId || !blackPlayerId) {
      setError('Please select both players');
      return;
    }

    if (whitePlayerId === blackPlayerId) {
      setError('Please select different players for white and black');
      return;
    }

    try {
      setIsLoading(true);
      const newGame = await api.createGame(whitePlayerId, blackPlayerId);
      navigate(`/game/${newGame.id}`);
    } catch (err) {
      setError('Failed to create game. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="game-setup-page">
      <h1 className="setup-title">Start a New Game</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card setup-card">
        <form onSubmit={handleStartGame}>
          <div className="form-group">
            <label htmlFor="whitePlayer">White Player</label>
            <select
              id="whitePlayer"
              className="form-control"
              value={whitePlayerId}
              onChange={(e) => setWhitePlayerId(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select White Player</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} (Elo: {user.elo_rating})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="blackPlayer">Black Player</label>
            <select
              id="blackPlayer"
              className="form-control"
              value={blackPlayerId}
              onChange={(e) => setBlackPlayerId(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select Black Player</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.username} (Elo: {user.elo_rating})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Starting Game...' : 'Start Game'}
            </button>
          </div>
        </form>
      </div>

      {isCreatingUser ? (
        <div className="card create-user-card">
          <h3>Create New Player</h3>
          <form onSubmit={handleCreateUser}>
            <div className="form-group">
              <label htmlFor="newUsername">Username</label>
              <input
                type="text"
                id="newUsername"
                className="form-control"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                disabled={isLoading}
                placeholder="Enter username"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Player'}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => setIsCreatingUser(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="create-user-prompt">
          <p>Don't see a player? <button className="btn" onClick={() => setIsCreatingUser(true)}>Create New Player</button></p>
        </div>
      )}
    </div>
  );
};

export default GameSetupPage;