import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Welcome to Chess Game</h1>
        <p>Challenge your friends to a game of chess and climb the leaderboards!</p>
        <div className="cta-buttons">
          <Link to="/setup" className="btn btn-primary">Start New Game</Link>
          <Link to="/leaderboard" className="btn">View Leaderboard</Link>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>Play Chess Online</h3>
          <p>Challenge your friends to a game of chess with our intuitive interface.</p>
        </div>
        <div className="feature-card">
          <h3>Track Your Progress</h3>
          <p>Monitor your Elo rating and see how you stack up against other players.</p>
        </div>
        <div className="feature-card">
          <h3>Improve Your Skills</h3>
          <p>Learn from your games and become a better chess player.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;