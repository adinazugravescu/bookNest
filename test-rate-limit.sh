#!/bin/bash

# Get token
echo "Getting token..."
TOKEN=$(curl -s -X POST http://localhost:8080/realms/booknest/protocol/openid-connect/token \
  -d "client_id=booknest-web" \
  -d "username=user1" \
  -d "password=user123" \
  -d "grant_type=password" | jq -r '.access_token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "Token obtained. Testing rate limiting..."
echo "Making 35 requests to GET /books..."
echo ""

# Make 35 requests
for i in {1..35}; do
  response=$(curl -s -i -H "Authorization: Bearer $TOKEN" http://localhost:3002/books)
  
  http_code=$(echo "$response" | grep "HTTP/" | awk '{print $2}')
  remaining=$(echo "$response" | grep -i "X-RateLimit-Remaining" | cut -d: -f2 | tr -d ' ')
  
  if [ "$http_code" == "429" ]; then
    echo "Request $i: ❌ RATE LIMITED (429) - Remaining: $remaining"
  else
    echo "Request $i: ✅ OK ($http_code) - Remaining: $remaining"
  fi
  
  # Small delay to see results
  sleep 0.1
done

echo ""
echo "Test completed!"