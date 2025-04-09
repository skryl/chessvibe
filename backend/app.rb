require 'sinatra/base'
require 'sinatra/json'
require 'sinatra/activerecord'
require 'json'
require 'logger'

# Load all models, lib files, and services
Dir.glob('./models/*.rb').each { |file| require file }
Dir.glob('./lib/**/*.rb').each { |file| require file }
Dir.glob('./services/*.rb').each { |file| require file }

class ChessApp < Sinatra::Base
  register Sinatra::ActiveRecordExtension

  # Set up logging
  configure do
    enable :logging
    file = File.new("./log/#{settings.environment}.log", 'a+')
    file.sync = true
    use Rack::CommonLogger, file

    # Add a custom logger for debugging
    logger = Logger.new(file)
    logger.level = Logger::DEBUG
    set :logger, logger
  end

  # Request/Response logging middleware
  before do
    # Log the request details
    request_body = request.body.read
    request.body.rewind  # rewind to ensure the body can be read again
    logger.debug "\n============ REQUEST ============"
    logger.debug "Method: #{request.request_method}"
    logger.debug "Path: #{request.path}"
    logger.debug "Params: #{params.inspect}"
    logger.debug "Body: #{request_body}" unless request_body.empty?
    logger.debug "=================================="
  end

  after do
    # Log the response details
    logger.debug "\n============ RESPONSE ============"
    logger.debug "Status: #{response.status}"
    logger.debug "Body: #{response.body}" if response.body
    logger.debug "=================================="
  end

  # Database configuration
  set :database, {
    adapter: 'sqlite3',
    database: './db/chess.sqlite3'
  }

  # Enable CORS
  before do
    content_type :json
    headers 'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST']
  end

  options '*' do
    response.headers['Allow'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, Accept'
    200
  end

  # Root endpoint
  get '/' do
    json message: 'Chess Game API', version: '1.0'
  end

  # Error handling
  not_found do
    json error: 'Not Found'
  end

  error do
    json error: env['sinatra.error'].message
  end
end
