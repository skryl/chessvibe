class GamesController < Sinatra::Base
  # Set JSON content type and CORS headers
  before do
    content_type :json
    headers 'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST'],
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization'
  end

  options '*' do
    response.headers['Allow'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
    200
  end

  # Create a new game
  post '/' do
    begin
      data = JSON.parse(request.body.read)

      white_player = User.find_by(id: data['white_player_id'])
      black_player = User.find_by(id: data['black_player_id'])

      unless white_player && black_player
        status 422
        return json error: 'Both players must exist'
      end

      game = Game.new(
        white_player: white_player,
        black_player: black_player
      )

      if game.save
        status 201
        json game
      else
        status 422
        json error: game.errors.full_messages
      end
    rescue => e
      status 500
      json error: e.message
    end
  end

  # Get a specific game
  get '/:id' do
    game = Game.find_by(id: params[:id])

    if game
      chess_game = game.chess_game

      game_state = {
        id: game.id,
        white_player: game.white_player.as_json(only: [:id, :username, :elo_rating]),
        black_player: game.black_player.as_json(only: [:id, :username, :elo_rating]),
        status: game.status,
        current_turn: game.current_turn,
        board_state: game.board_state,
        winner_id: game.winner_id,
        in_check: chess_game.in_check?,
        in_checkmate: chess_game.in_checkmate?,
        in_stalemate: chess_game.in_stalemate?,
        created_at: game.created_at,
        updated_at: game.updated_at
      }

      json game_state
    else
      status 404
      json error: 'Game not found'
    end
  end

  # Get pretty printed board and move history
  get '/:id/pretty' do
    game = Game.find_by(id: params[:id])

    if game
      chess_game = game.chess_game

      # Generate pretty board representation using the presenter
      pretty_board = Chess::Presentation::GamePresenter.pretty_board(chess_game.board)

      # Get move history
      moves = game.moves.order(:move_number).map do |move|
        {
          number: move.move_number,
          notation: move.notation,
          player: move.player.username,
          piece: move.piece_type
        }
      end

      # Format move history using the presenter
      move_history = Chess::Presentation::GamePresenter.format_move_history(
        moves,
        game.white_player.username,
        game.black_player.username
      )

      content_type :json
      json({
        pretty_board: pretty_board,
        move_history: move_history,
        white_player: game.white_player.username,
        black_player: game.black_player.username,
        status: game.status,
        current_turn: game.current_turn,
        in_check: chess_game.in_check?,
        in_checkmate: chess_game.in_checkmate?
      })
    else
      status 404
      json error: 'Game not found'
    end
  end

  # Get all games
  get '/' do
    # Filter by player if specified
    if params[:player_id]
      player = User.find_by(id: params[:player_id])

      if player
        games = player.games
      else
        status 404
        return json error: 'Player not found'
      end
    else
      games = Game.all
    end

    # Filter by status if specified
    if params[:status]
      games = games.where(status: params[:status])
    end

    json games
  end

  # Submit a move
  post '/:id/moves' do
    data = JSON.parse(request.body.read)
    game = Game.find_by(id: params[:id])
    player = User.find_by(id: data['player_id'])

    unless game && player
      status 404
      return json error: 'Game or player not found'
    end

    # Check if it's the player's turn
    unless player.id == game.current_player.id
      status 422
      return json error: 'Not your turn'
    end

    result = Move.record_move(
      game,
      player,
      data['from_position'],
      data['to_position'],
      promotion_piece: data['promotion_piece']
    )

    if result[:success]
      json result[:move]
    else
      status 422
      json error: result[:error]
    end
  end

  # Get move history for a game
  get '/:id/moves' do
    game = Game.find_by(id: params[:id])

    if game
      moves = game.moves.order(:move_number)
      json moves
    else
      status 404
      json error: 'Game not found'
    end
  end

  # Get legal moves for a piece
  get '/:id/legal_moves/:position' do
    game = Game.find_by(id: params[:id])

    if game
      position = params[:position]
      chess_game = game.chess_game

      if chess_game.board.piece_at(position)
        legal_moves = chess_game.legal_moves_for(position)
        json legal_moves
      else
        status 422
        json error: 'No piece at that position'
      end
    else
      status 404
      json error: 'Game not found'
    end
  end

  # Complete a game (resign or draw)
  post '/:id/complete' do
    data = JSON.parse(request.body.read)
    game = Game.find_by(id: params[:id])

    unless game
      status 404
      return json error: 'Game not found'
    end

    if game.status != 'active'
      status 422
      return json error: 'Game already completed'
    end

    result = data['result']

    if result && ['white_win', 'black_win', 'draw'].include?(result)
      game.complete(result)
      json game
    else
      status 422
      json error: 'Invalid result'
    end
  end
end
