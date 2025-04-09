require './app'
require 'sinatra/base'

# Load all route files
Dir.glob('./api/routes/*.rb').each { |file| require file }

# Mount controllers at specific paths
map('/api/users') { run UsersController }
map('/api/games') { run GamesController }
map('/') { run ChessApp }
