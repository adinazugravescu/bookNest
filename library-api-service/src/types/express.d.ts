import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string; // Keycloak user ID
                email: string;
                preferred_username: string;
                realm_access?: {
                    roles: string[];
                };
            };
        }
    }
}

