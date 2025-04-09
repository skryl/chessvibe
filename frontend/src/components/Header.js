import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">Chess Game</Link>
          </div>
          <nav className="nav">
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/setup">New Game</Link></li>
              <li><Link to="/leaderboard">Leaderboard</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;