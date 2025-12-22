import Keycloak from 'keycloak-js';

// environment variable or default to localhost for dev
const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';

const keycloak = new Keycloak({
  url: keycloakUrl,
  realm: 'booknest',
  clientId: 'booknest-web',
});

export default keycloak;

