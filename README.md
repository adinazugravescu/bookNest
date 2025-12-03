# BookNest - Book Rental Platform

Web platform for managing books and reservations.

## Architecture

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
# User Profile Service
docker build -t user-profile-service:latest ./user-profile-service

# Library API Service
docker build -t library-api-service:latest ./library-api-service

3. Deploy stack:sh
docker stack deploy -c docker-compose.yml booknest

4. Wait for all services to start (30-60 seconds):h
docker service ls

5. Check service logs (if needed):
# User Profile Service
docker service logs booknest_user-profile-service

# Library API Service
docker service logs booknest_library-api-service

6. Access Keycloak Admin Console: http://localhost:8080/admin
   - Username: `admin`
   - Password: `admin`

## Test Users
The `booknest` realm is automatically imported with the following users:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  - Email: `admin@booknest.com`
  - Roles: `admin`, `user`

- **User**: 
  - Username: `user1`
  - Password: `user123`
  - Email: `user1@booknest.com`
  - Roles: `user`

- **User**: 
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

# Get token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/booknest/protocol/openid-connect/token \
  -d "client_id=booknest-web" \
  -d "username=user1" \
  -d "password=user123" \
  -d "grant_type=password" | jq -r '.access_token')

# Test User Profile Service
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/profile/me

# Test Library API
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/books## Endpoints..

### User Profile Service
- `GET /profile/me` - View own profile
- `PUT /profile/me` - Update own profile

### Library API Service
- `GET /books` - List books (authenticated)
- `GET /books/:id` - Book details (authenticated)
- `POST /books` - Add book (admin)
- `PUT /books/:id` - Update book (admin)
- `DELETE /books/:id` - Delete book (admin)
- `POST /reservations` - Reserve book (authenticated)
- `GET /reservations/me` - View own reservations (authenticated)
- `GET /reservations/:id` - Reservation details (authenticated)
- `DELETE /reservations/:id` - Cancel reservation (authenticated)
