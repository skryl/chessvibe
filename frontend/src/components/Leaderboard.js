import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ players }) => {
  // Sort players by Elo rating, descending
  const sortedPlayers = [...players].sort((a, b) => b.elo_rating - a.elo_rating);

  // Helper function to safely get stats value
  const getStat = (player, stat, defaultValue = 0) => {
    return player.stats ? player.stats[stat] : defaultValue;
  };

  return (
    <div className="leaderboard">
      <h2 className="leaderboard-title">Player Rankings</h2>

      <div className="leaderboard-table-container">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Elo Rating</th>
              <th>Games</th>
              <th>Win/Loss/Draw</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.id} className={index === 0 ? 'top-player' : ''}>
                <td>{index + 1}</td>
                <td>{player.username}</td>
                <td>{player.elo_rating}</td>
                <td>{getStat(player, 'games_played')}</td>
                <td>
                  {getStat(player, 'wins')}/{getStat(player, 'losses')}/{getStat(player, 'draws')}
                </td>
              </tr>
            ))}
            {sortedPlayers.length === 0 && (
              <tr>
                <td colSpan="5" className="no-players">No players yet!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;