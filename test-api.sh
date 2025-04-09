#!/bin/bash

echo "Testing backend API endpoints..."
echo "==============================="

echo "1. Testing users endpoint:"
curl -s http://localhost:4567/api/users | json_pp
echo ""
echo ""

echo "2. Testing GET /api/games endpoint:"
curl -s http://localhost:4567/api/games | json_pp
echo ""
echo ""

echo "3. Testing Creating a user:"
curl -s -X POST http://localhost:4567/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser_'"$(date +%s)"'"}' | json_pp
echo ""
echo ""

echo "API test completed."