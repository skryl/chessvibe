require_relative '../spec_helper'

describe 'Users API' do
  describe 'POST /api/users' do
    it 'creates a new user' do
      header 'Content-Type', 'application/json'
      post '/api/users', { username: 'testuser' }.to_json

      expect(last_response.status).to eq(201)
      expect(json_response['username']).to eq('testuser')
      expect(json_response['elo_rating']).to eq(1200)
    end

    it 'returns error for duplicate username' do
      User.create!(username: 'existinguser')
      header 'Content-Type', 'application/json'
      post '/api/users', { username: 'existinguser' }.to_json

      expect(last_response.status).to eq(422)
      expect(json_response['error']).to include('Username has already been taken')
    end
  end

  describe 'GET /api/users/:id' do
    let!(:user) { User.create!(username: 'testuser') }

    it 'returns user data' do
      get "/api/users/#{user.id}"

      expect(last_response.status).to eq(200)
      expect(json_response['username']).to eq('testuser')
      expect(json_response['elo_rating']).to eq(1200)
      expect(json_response['stats']).to include(
        'games_played' => 0,
        'wins' => 0,
        'losses' => 0,
        'draws' => 0
      )
    end

    it 'returns 404 for non-existent user' do
      get '/api/users/9999'

      expect(last_response.status).to eq(404)
      expect(json_response['error']).to eq('User not found')
    end
  end

  describe 'GET /api/users' do
    before do
      User.create!(username: 'user1')
      User.create!(username: 'user2')
    end

    it 'returns all users' do
      get '/api/users'

      expect(last_response.status).to eq(200)
      expect(json_response.length).to eq(2)
      expect(json_response.map { |u| u['username'] }).to include('user1', 'user2')
    end
  end

  describe 'GET /api/users/:id/rating_history' do
    let!(:user1) { User.create!(username: 'player1') }
    let!(:user2) { User.create!(username: 'player2') }
    let!(:game) { Game.create!(white_player: user1, black_player: user2) }

    it 'returns empty rating history for new user' do
      get "/api/users/#{user1.id}/rating_history"

      expect(last_response.status).to eq(200)
      expect(json_response).to be_empty
    end

    it 'returns rating history for user with completed games' do
      game.complete('white_win')

      get "/api/users/#{user1.id}/rating_history"

      expect(last_response.status).to eq(200)
      expect(json_response.length).to eq(1)
      expect(json_response[0]['game_id']).to eq(game.id)
      expect(json_response[0]['rating_change']).to be_a(Integer)
      expect(json_response[0]['opponent']).to eq('player2')
    end
  end
end