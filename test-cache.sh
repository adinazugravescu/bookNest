#!/bin/bash

echo "Clearing cache for /books endpoint..."
REDIS_CONTAINER=$(docker ps -q -f name=redis)
if [ -n "$REDIS_CONTAINER" ]; then
  # Delete all cache keys matching the pattern
  docker exec $REDIS_CONTAINER redis-cli --scan --pattern "cache:/books*" | \
    xargs -r docker exec $REDIS_CONTAINER redis-cli DEL > /dev/null 2>&1
  echo "Cache cleared for /books endpoint."
else
  echo "Warning: Redis container not found. Cache may not be cleared."
fi
echo ""

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

echo "Token obtained. Testing caching..."
echo ""

# First request - should be MISS
echo "Request 1 (should be MISS):"
response1=$(curl -s -i -H "Authorization: Bearer $TOKEN" http://localhost:3002/books)
http_code1=$(echo "$response1" | grep "HTTP/" | awk '{print $2}')
cache1=$(echo "$response1" | grep "X-Cache" | cut -d: -f2 | tr -d ' ')
echo "  HTTP Code: $http_code1"
echo "  X-Cache: $cache1"
echo ""

# Second request - should be HIT
echo "Request 2 (should be HIT):"
response2=$(curl -s -i -H "Authorization: Bearer $TOKEN" http://localhost:3002/books)
http_code2=$(echo "$response2" | grep "HTTP/" | awk '{print $2}')
cache2=$(echo "$response2" | grep "X-Cache" | cut -d: -f2 | tr -d ' ')
echo "  HTTP Code: $http_code2"
echo "  X-Cache: $cache2"
echo ""

# Wait 2 seconds
echo "Waiting 2 seconds..."
sleep 2

# Third request - should still be HIT (within TTL)
echo "Request 3 (should still be HIT):"
response3=$(curl -s -i -H "Authorization: Bearer $TOKEN" http://localhost:3002/books)
http_code3=$(echo "$response3" | grep "HTTP/" | awk '{print $2}')
cache3=$(echo "$response3" | grep "X-Cache" | cut -d: -f2 | tr -d ' ')
echo "  HTTP Code: $http_code3"
echo "  X-Cache: $cache3"
echo ""

# Test cache invalidation - create a book (admin token needed)
echo "Testing cache invalidation..."
echo "Getting admin token..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/realms/booknest/protocol/openid-connect/token \
  -d "client_id=booknest-web" \
  -d "username=admin" \
  -d "password=admin123" \
  -d "grant_type=password" | jq -r '.access_token')

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
  echo "Failed to get admin token - skipping cache invalidation test"
else
  echo "Creating a test book (this should invalidate cache)..."
  create_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
    -X POST http://localhost:3002/books \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"Cache Test Book","author":"Test Author"}')
  
  create_code=$(echo "$create_response" | grep "HTTP_CODE" | cut -d: -f2)
  echo "  Create book HTTP Code: $create_code"
  echo ""
  
  # Next request should be MISS (cache invalidated)
  echo "Request 4 after book creation (should be MISS - cache invalidated):"
  response4=$(curl -s -i -H "Authorization: Bearer $TOKEN" http://localhost:3002/books)
  http_code4=$(echo "$response4" | grep "HTTP/" | awk '{print $2}')
  cache4=$(echo "$response4" | grep "X-Cache" | cut -d: -f2 | tr -d ' ')
  echo "  HTTP Code: $http_code4"
  echo "  X-Cache: $cache4"
  echo ""
fi

echo "Test completed!"
