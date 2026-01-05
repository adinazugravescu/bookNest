# BookNest - Book Rental Platform

Web platform for managing books and reservations.

## Architecture

- **Frontend**: React + TypeScript web application
- **Keycloak**: SSO Authentication (OIDC)
- **User Profile Service**: User profile management
- **Library API Service**: Book and reservation management
- **PostgreSQL**: Main database
- **Redis**: Caching and rate limiting

## Docker Networks

- `internal_net`: Communication between microservices
- `auth_net`: Keycloak ↔ User Profile Service communication
- `db_net`: PostgreSQL ↔ Library API communication

## Setup

1. Initialize Docker Swarm (if not already initialized):
docker swarm init

2. Build Docker images for microservices:
```bash
# User Profile Service
docker build -t user-profile-service:latest ./user-profile-service

# Library API Service
docker build -t library-api-service:latest ./library-api-service

# Frontend
docker build -t frontend:latest ./frontend
```

3. Deploy stack:
docker stack deploy -c docker-compose.yml booknest

4. Wait for all services to start (30-60 seconds):
docker service ls

5. Check service logs (if needed)  :
```bash
# User Profile Service
docker service logs booknest_user-profile-service

## Library API Service
docker service logs booknest_library-api-service
```

6. Access Keycloak Admin Console: http://localhost:8080/admin
   - Username: `admin`
   - Password: `admin`

7. Access the Frontend Application: http://localhost:3000
   - Login with test accounts

## Frontend Features

The web application provides the following pages:

- **Dashboard** (`/`) - Browse all available books, search by title or author, view book availability status
- **Book Details** (`/books/:id`) - View detailed information about a book and reserve it
- **My Reservations** (`/reservations`) - View and manage your active reservations, cancel reservations
- **Profile** (`/profile`) - View and edit your profile information (first name, last name)
- **Admin Panel** (`/admin`) - Manage books (create, update, delete) - Admin role required

## Test Users
The `booknest` realm is automatically imported with the following users:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  - Email: `admin@booknest.com`
  - Roles: `admin`, `user`

- **User1**: 
  - Username: `user1`
  - Password: `user123`
  - Email: `user1@booknest.com`
  - Roles: `user`

- **User2**: 
  - Username: `user2`
  - Password: `user123`
  - Email: `user2@booknest.com`
  - Roles: `user`

## Get JWT Token

To obtain a JWT token for testing:

curl -X POST http://localhost:8080/realms/booknest/protocol/openid-connect/token \
  -d "client_id=booknest-web" \
  -d "username=user1" \
  -d "password=user123" \
  -d "grant_type=password"
  
  The response will contain an `access_token` that can be used to access the APIs.

## API Testing

Example of testing with token:

## Get token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/booknest/protocol/openid-connect/token \
  -d "client_id=booknest-web" \
  -d "username=user1" \
  -d "password=user123" \
  -d "grant_type=password" | jq -r '.access_token')

## Test User Profile Service
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/profile/me

## Test Library API
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/books## Endpoints..

### User Profile Service
- `GET /profile/me` - View own profile
- `PUT /profile/me` - Update own profile

### Library API Service
- `GET /books` - List books (authenticated, rate limited, cached)
- `GET /books/:id` - Book details (authenticated, rate limited, cached)
- `POST /books` - Add book (admin)
- `PUT /books/:id` - Update book (admin)
- `DELETE /books/:id` - Delete book (admin)
- `POST /reservations` - Reserve book (authenticated, rate limited)
- `GET /reservations/me` - View own reservations (authenticated)
- `GET /reservations/:id` - Reservation details (authenticated)
- `DELETE /reservations/:id` - Cancel reservation (authenticated)

## Advanced Modules

### Distributed Rate Limiting

Rate limiting is implemented using Redis to ensure it works across all replicas of the Library API Service.

**Configuration:**
- Maximum requests: **30 requests per minute** per user
- Window: 60 seconds
- Storage: Redis (distributed)

**Applied endpoints:**
- `GET /books`
- `GET /books/:id`
- `POST /reservations`

**Response headers:**
- `X-RateLimit-Limit`: Maximum allowed requests (30)
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Timestamp when the limit resets

**TEST:**
```bash
# Make 35 requests to test rate limiting
./test-rate-limit.sh
```

### Response Caching

Caching is implemented using Redis to improve performance and reduce database load.

**Configuration:**
- Cache TTL: **5 minutes** (300 seconds)
- Storage: Redis

**Cached endpoints:**
- `GET /books`
- `GET /books/:id`

**Cache invalidation:**
Cache is automatically invalidated when:
- A new book is created
- A book is updated
- A book is deleted
- A reservation is created (book becomes unavailable)
- A reservation is cancelled (book becomes available)
- A reservation is completed (book becomes available)

**TEST:**
```bash
./test-cache.sh
```
