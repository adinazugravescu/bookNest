# BookNest - Platformă de Închirieri de Cărți

Platformă web pentru gestionarea cărților și rezervărilor, construită cu microservicii orchestrate în Docker Swarm.

## Arhitectură

- **Keycloak**: SSO Authentication (OIDC)
- **User Profile Service**: Gestionarea profilurilor utilizatorilor
- **Library API Service**: Gestionarea cărților și rezervărilor
- **PostgreSQL**: Baza de date principală
- **Redis**: Caching și rate limiting

## Rețele Docker

- `internal_net`: Comunicare între microservicii
- `auth_net`: Comunicare Keycloak ↔ User Profile Service
- `db_net`: Comunicare PostgreSQL ↔ Library API

## Setup

1. Inițializează Docker Swarm (dacă nu e deja inițializat):
```bash
docker swarm init
```

2. Construiește imaginile Docker pentru microservicii:
```bash
# User Profile Service
docker build -t user-profile-service:latest ./user-profile-service

# Library API Service
docker build -t library-api-service:latest ./library-api-service
```

3. Deploy stack:
```bash
docker stack deploy -c docker-compose.yml booknest
```

4. Așteaptă ca toate serviciile să pornească (30-60 secunde):
```bash
docker service ls
```

5. Verifică log-urile serviciilor (dacă e nevoie):
```bash
# User Profile Service
docker service logs booknest_user-profile-service

# Library API Service
docker service logs booknest_library-api-service
```

6. Accesează Keycloak Admin Console: http://localhost:8080/admin
   - Username: `admin`
   - Password: `admin`

## Utilizatori de test

Realm-ul `booknest` este importat automat cu următorii utilizatori:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  - Email: `admin@booknest.com`
  - Roluri: `admin`, `user`

- **User**: 
  - Username: `user1`
  - Password: `user123`
  - Email: `user1@booknest.com`
  - Roluri: `user`

## Obținere Token JWT

Pentru a obține un token JWT pentru testare:

```bash
curl -X POST http://localhost:8080/realms/booknest/protocol/openid-connect/token \
  -d "client_id=booknest-web" \
  -d "username=user1" \
  -d "password=user123" \
  -d "grant_type=password"
```

Răspunsul va conține `access_token` care poate fi folosit pentru a accesa API-urile.

## Testare API-uri

Exemplu de testare cu token:

```bash
# Obține token
TOKEN=$(curl -s -X POST http://localhost:8080/realms/booknest/protocol/openid-connect/token \
  -d "client_id=booknest-web" \
  -d "username=user1" \
  -d "password=user123" \
  -d "grant_type=password" | jq -r '.access_token')

# Testează User Profile Service
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/profile/me

# Testează Library API
curl -H "Authorization: Bearer $TOKEN" http://localhost:3002/books
```

## Endpoint-uri

### User Profile Service
- `GET /profile/me` - Vizualizare profil propriu
- `PUT /profile/me` - Actualizare profil propriu

### Library API Service
- `GET /books` - Listare cărți (autentificat)
- `GET /books/:id` - Detalii carte (autentificat)
- `POST /books` - Adăugare carte (admin)
- `PUT /books/:id` - Actualizare carte (admin)
- `DELETE /books/:id` - Ștergere carte (admin)
- `POST /reservations` - Rezervare carte (autentificat)
- `GET /reservations/me` - Vizualizare rezervări proprii (autentificat)
- `GET /reservations/:id` - Detalii rezervare (autentificat)
- `DELETE /reservations/:id` - Anulare rezervare (autentificat)

