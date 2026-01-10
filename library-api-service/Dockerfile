FROM node:20-slim

WORKDIR /app

# Install OpenSSL (necessary for Prisma)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client (force OpenSSL 3.0.x for Linux ARM64)
# Modify temporarily schema to use only the binary for Docker
RUN sed -i 's/binaryTargets = \["native", "debian-openssl-3.0.x", "linux-arm64-openssl-3.0.x"\]/binaryTargets = ["linux-arm64-openssl-3.0.x"]/' prisma/schema.prisma && \
    rm -rf node_modules/.prisma node_modules/@prisma/client && \
    npx prisma generate && \
    echo "=== Prisma binaries generated ===" && \
    ls -la node_modules/.prisma/client/ | grep -E "openssl|query_engine" | head -5

# Copy source code and test files
COPY src ./src
COPY tsconfig.json ./
COPY jest.config.js ./
COPY .env* ./

# Run unit tests before build
RUN npm test

# Build TypeScript
RUN npm run build

EXPOSE 3002

# Run migrations on startup, then start server
CMD ["npm", "run", "start:migrate"]
