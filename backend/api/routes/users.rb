class UsersController < Sinatra::Base
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

  # Create a new user
  post '/' do
    begin
      data = JSON.parse(request.body.read)
      user = User.new(username: data['username'])

      if user.save
        status 201
        json user
      else
        status 422
        json error: user.errors.full_messages
      end
    rescue => e
      status 500
      json error: e.message
    end
  end

  # Get a specific user
  get '/:id' do
    begin
      user = User.find_by(id: params[:id])

      if user
        stats = {
          games_played: user.games_played,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws,
          elo_rating: user.elo_rating
        }

        json user.as_json.merge(stats: stats)
      else
        status 404
        json error: 'User not found'
      end
    rescue => e
      status 500
      json error: e.message
    end
  end

  # Get all users
  get '/' do
    begin
      users = User.all
      json users
    rescue => e
      status 500
      json error: e.message
    end
  end

  # Get user's rating history
  get '/:id/rating_history' do
    begin
      user = User.find_by(id: params[:id])

      if user
        # Get games where this user was a player
        games = user.games.where('status != ?', 'active').order(created_at: :asc)

        rating_history = []
        current_rating = 1200 # Starting Elo

        games.each do |game|
          if game.white_player_id == user.id
            change = game.white_player_rating_change
          else
            change = game.black_player_rating_change
          end

          current_rating += change

          rating_history << {
            game_id: game.id,
            timestamp: game.updated_at,
            rating_change: change,
            rating_after: current_rating,
            opponent: game.opponent_of(user).username
          }
        end

        json rating_history
      else
        status 404
        json error: 'User not found'
      end
    rescue => e
      status 500
      json error: e.message
    end
  end
end
