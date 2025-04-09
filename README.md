# Chess Game

A full-stack chess application with a Ruby backend and React frontend. Players can challenge each other, track their Elo ratings, and view the leaderboard.

## Features

- Play chess against other players
- Track Elo ratings and game statistics
- View a leaderboard of all players
- See game results with updated ratings
- Pretty-printed chess board visualization
- Support for all chess rules including castling, en passant, and pawn promotion
- Visual indicators for selected pieces and legal moves
- Checkmate and draw detection

## Technology Stack

### Backend
- Ruby with Sinatra for the API
- SQLite database with ActiveRecord
- Chess engine with move validation, checkmate detection, etc.
- ELO rating calculation
- FEN notation for board state representation

### Frontend
- React with React Router
- Modern ES6+ JavaScript
- CSS for styling
- Responsive design for mobile and desktop
- Interactive chess board with move highlighting

## Project Structure

```
/
├── backend/                 # Ruby backend
│   ├── api/                 # API controllers
│   ├── db/                  # Database migrations
│   ├── lib/                 # Chess engine
│   │   └── chess/           # Chess game logic
│   │       └── presentation/ # Board presentation
│   ├── models/              # ActiveRecord models
│   ├── services/            # Business logic services
│   ├── spec/                # Tests
│   ├── app.rb               # Main application file
│   └── config.ru            # Rack configuration
│
├── frontend/                # React frontend
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   └── package.json         # Frontend dependencies
│
└── start-app.sh             # Script to start both servers
```

## Getting Started

### Prerequisites
- Ruby 2.7+ with Bundler
- Node.js 14+ with npm
- SQLite

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/chess-game.git
   cd chess-game
   ```

2. Install backend dependencies
   ```
   cd backend
   bundle install
   ```

3. Set up the database
   ```
   bundle exec rake db:create
   bundle exec rake db:migrate
   bundle exec rake db:seed  # Optional: adds sample users and games
   ```

4. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

Run both servers with a single command:
```
./start-app.sh
```

Or start them individually:
- Backend: `cd backend && bundle exec rackup config.ru -p 4567`
- Frontend: `cd frontend && npm start`

The frontend will be available at http://localhost:3000 and the backend API at http://localhost:4567.

## How to Play

1. Create a new game or join an existing one from the home page
2. On the game page, select which player you are (white or black)
3. Make moves by:
   - Clicking on a piece to select it
   - Green circles will appear on squares where the piece can legally move
   - Click on one of the highlighted squares to move the piece
4. The game automatically detects check, checkmate, and draw conditions
5. You can resign or offer a draw using the buttons on the game page
6. After the game ends, you'll be redirected to the results page showing updated Elo ratings

## Chess Implementation Details

- The chess engine supports all standard chess rules:
  - Piece movement validation specific to each piece type
  - Special moves: castling, en passant, pawn promotion
  - Check and checkmate detection
  - Stalemate and draw conditions
- Board state is stored using FEN (Forsyth-Edwards Notation)
- Move history is recorded in algebraic notation
- Elo rating system for player skill tracking

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `GET /api/users/:id/rating_history` - Get user's rating history

### Games
- `GET /api/games` - Get all games
- `GET /api/games/:id` - Get game by ID
- `POST /api/games` - Create new game
- `GET /api/games/:id/pretty` - Get pretty-printed board
- `GET /api/games/:id/moves` - Get move history
- `POST /api/games/:id/moves` - Make a move
- `GET /api/games/:id/legal_moves/:position` - Get legal moves for a piece
- `POST /api/games/:id/complete` - Complete a game (resign/draw)

## Frontend Components

### Key Components
- `ChessBoard`: Renders the interactive chess board with move highlighting
- `GamePlayPage`: Main game interface with player info and game controls
- `GameSetupPage`: Interface for creating new games
- `ResultPage`: Shows game outcome and updated ratings
- `LeaderboardPage`: Displays player rankings by Elo rating

## Troubleshooting

If you encounter any issues:
1. Check that both backend and frontend servers are running
2. Ensure the database has been properly migrated
3. Check the browser console and server logs for errors
4. Restart the application using the start-app.sh script

## License

This project is licensed under the MIT License - see the LICENSE file for details.
