#!/bin/bash

echo "!! Running unit tests in Docker container..."

docker run --rm -it \
  -v $(pwd):/app \
  -w /app \
  node:20-slim \
  bash -c "
    apt-get update -qq > /dev/null 2>&1 && \
    apt-get install -y -qq openssl > /dev/null 2>&1 && \
    npm install && \
    npm test
  "

