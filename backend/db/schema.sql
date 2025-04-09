CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  elo_rating INTEGER DEFAULT 1200,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX index_users_on_username ON users (username);

CREATE TABLE games (
  id INTEGER PRIMARY KEY,
  white_player_id INTEGER REFERENCES users(id),
  black_player_id INTEGER REFERENCES users(id),
  status VARCHAR(255) DEFAULT 'active',
  winner_id INTEGER REFERENCES users(id),
  white_player_rating_before INTEGER,
  black_player_rating_before INTEGER,
  white_player_rating_change INTEGER DEFAULT 0,
  black_player_rating_change INTEGER DEFAULT 0,
  board_state TEXT,
  current_turn VARCHAR(255) DEFAULT 'white',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE moves (
  id INTEGER PRIMARY KEY,
  game_id INTEGER REFERENCES games(id),
  player_id INTEGER REFERENCES users(id),
  from_position VARCHAR(255) NOT NULL,
  to_position VARCHAR(255) NOT NULL,
  piece_type VARCHAR(255) NOT NULL,
  notation VARCHAR(255),
  move_number INTEGER,
  is_capture BOOLEAN DEFAULT 0,
  is_check BOOLEAN DEFAULT 0,
  is_checkmate BOOLEAN DEFAULT 0,
  is_castling BOOLEAN DEFAULT 0,
  is_en_passant BOOLEAN DEFAULT 0,
  is_promotion BOOLEAN DEFAULT 0,
  promotion_piece_type VARCHAR(255),
  board_state_after TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);