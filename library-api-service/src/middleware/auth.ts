import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'booknest';

// Create JWKS client
const client = jwksClient({
  jwksUri: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/certs`,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    jwt.verify(
      token,
      getKey,
      {
        // Audience verificare comentată - public clients pot avea audience diferit
        // audience: 'booknest-web',
        // Accept both localhost and keycloak issuer (for tokens obtained from outside Docker)
        issuer: [
          `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
          `http://localhost:8080/realms/${KEYCLOAK_REALM}`,
          `http://keycloak:8080/realms/${KEYCLOAK_REALM}`
        ],
        algorithms: ['RS256'],
      },
      (err, decoded: any) => {
        if (err) {
          console.error('JWT verification error:', err);
          return res.status(403).json({ error: 'Invalid or expired token' });
        }

        // Attach user info to request
        req.user = {
          sub: decoded.sub,
          email: decoded.email || decoded.preferred_username,
          preferred_username: decoded.preferred_username,
          realm_access: decoded.realm_access,
        };

        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ error: 'Authentication error' });
  }
};

