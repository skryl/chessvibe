#!/bin/bash

# Error handling
set -e  # Exit immediately if a command exits with a non-zero status

# Function to check if a port is in use
is_port_in_use() {
  lsof -i:"$1" > /dev/null 2>&1
  return $?
}

# Function to handle exit and kill all processes
function cleanup {
  echo -e "\nStopping servers and log streaming..."
  # Kill processes only if they exist
  if ps -p $BACKEND_PID > /dev/null 2>&1; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi
  if ps -p $TAIL_PID > /dev/null 2>&1; then
    kill $TAIL_PID 2>/dev/null || true
  fi
  echo "All processes terminated."
  exit
}

# Set trap to clean up on exit
trap cleanup EXIT INT TERM

# Go to backend directory
cd "$(dirname "$0")/backend"
echo "Current directory: $(pwd)"

# Check if the database exists
DB_FILE="./db/chess.sqlite3"
if [ ! -f "$DB_FILE" ]; then
  echo "Database file not found. Creating database..."

  # Check if the db directory exists, create it if it doesn't
  mkdir -p ./db

  # Create and migrate the database
  echo "Running database creation and migrations..."
  bundle exec rake db:create
  bundle exec rake db:migrate

  # Seed the database with initial data
  echo "Seeding database with initial users..."
  bundle exec rake db:seed

  echo "Database setup complete."
else
  echo "Database already exists."
fi

# Create log directories if they don't exist
mkdir -p ./log
mkdir -p ../frontend/log
echo "Ensuring log directories exist..."

# Check if backend port is available
if is_port_in_use 4567; then
  echo "ERROR: Port 4567 is already in use. Backend server cannot start."
  exit 1
fi

# Check if frontend port is available
if is_port_in_use 3001; then
  echo "ERROR: Port 3001 is already in use. Frontend server cannot start."
  exit 1
fi

# Start the backend server with logs using rackup
echo "Starting backend server..."
bundle exec rackup config.ru -p 4567 -o 0.0.0.0 > ./log/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend server started with PID: $BACKEND_PID"

# Give the backend a moment to start
sleep 2

# Check if backend started successfully
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "ERROR: Backend server failed to start. Check ./log/backend.log for details:"
  cat ./log/backend.log
  cleanup
  exit 1
fi

# Start the frontend dev server with logs
echo "Starting frontend server..."
cd ../frontend
npm start > ./log/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend server started with PID: $FRONTEND_PID"

# Give the frontend a moment to start
sleep 2

# Check if frontend started successfully
if ! ps -p $FRONTEND_PID > /dev/null; then
  echo "ERROR: Frontend server failed to start. Check ./log/frontend.log for details:"
  cat ./log/frontend.log
  cleanup
  exit 1
fi

# Start streaming logs
echo "==========================="
echo "Starting log streaming. Press Ctrl+C to stop servers."
echo "==========================="

# Start tail processes for both logs
cd ../backend
tail -f ./log/backend.log ./log/development.log ../frontend/log/frontend.log &
TAIL_PID=$!

# Keep the script running
echo "Servers started successfully. Frontend: http://localhost:3001, Backend: http://localhost:4567"
wait $BACKEND_PID $FRONTEND_PID