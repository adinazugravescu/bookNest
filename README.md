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

## Replication and Scalability

- **Library API Service**: 3 replicas with automatic load balancing
- **Distributed features**: Rate limiting and caching work across all replicas via Redis
- **Scaling**: `docker service scale booknest_library-api-service=N`

## Persistent Storage

- **`postgres_data`** - Application database
- **`postgres_keycloak_data`** - Keycloak database  
- **`redis_data`** - Redis persistence (cache & rate limiting)

## Setup

1. Initialize Docker Swarm :
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
- **Profile** (`/profile`) - View and edit your profile information
- **Admin Panel** (`/admin`) - Manage books (create, update, delete) and active reservations (complete returns) - Admin role required

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
- `PUT /reservations/:id/complete` - Complete reservation (admin only)
- `DELETE /reservations/:id` - Cancel reservation (authenticated)

## Reservation Features

- **Statuses**: `active`, `completed`, `cancelled`
- **Validations**: Book must be available; user cannot have duplicate active reservations
- **Authorization**: Users can cancel own reservations; admins can complete any reservation

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

**Response headers:**
- `X-Cache: HIT` - Response served from cache
- `X-Cache: MISS` - Response fetched from database

**Cache invalidation:**
Cache is automatically invalidated when:
- A new book is created
- A book is updated or deleted
- A reservation is created, cancelled or completed

**TEST:**
```bash
./test-cache.sh
```

## Unit Tests

The advanced features are covered by unit tests.

### Running Unit Tests

**Run tests locally (using Docker):**
```bash
cd library-api-service
./run-tests.sh
```

**Tests run automatically during Docker build:**
```bash
docker build -t library-api-service:latest ./library-api-service
```

If tests fail, the build fails.

### Test Coverage

The unit tests use mocked Redis to verify that the distributed features function correctly in a multi-replica environment.
