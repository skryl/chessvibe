ENV['RACK_ENV'] = 'test'

require 'rack/test'
require 'rspec'
require 'active_record'
require 'sqlite3'

# Connect to in-memory database before loading models
ActiveRecord::Base.establish_connection(
  adapter: 'sqlite3',
  database: ':memory:'
)

# Create database schema for tests
require_relative 'db_setup'

# Now load the application and models after database setup
require_relative '../app'

# Load all the models, routes, etc.
Dir[File.join(File.dirname(__FILE__), '../models', '*.rb')].each { |file| require file }
Dir[File.join(File.dirname(__FILE__), '../lib', '**', '*.rb')].each { |file| require file }
Dir[File.join(File.dirname(__FILE__), '../api/routes', '*.rb')].each { |file| require file }
Dir[File.join(File.dirname(__FILE__), '../services', '*.rb')].each { |file| require file }

module RSpecMixin
  include Rack::Test::Methods

  def app
    Rack::Builder.new do
      map('/api/users') { run UsersController }
      map('/api/games') { run GamesController }
      map('/') { run ChessApp }
    end
  end

  def json_response
    JSON.parse(last_response.body)
  end
end

RSpec.configure do |config|
  config.include RSpecMixin

  config.before(:each) do
    # Clear database for each test in the correct order to respect foreign key constraints
    Move.delete_all
    Game.delete_all
    User.delete_all
  end
end