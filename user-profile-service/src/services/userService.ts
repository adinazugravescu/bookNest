import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserFromToken {
    sub: string;
    email: string;
    preferred_username: string;
    realm_access?: {
        roles: string[];
    };
}

/**
 * Get or create user profile from Keycloak token
 */
export async function getOrCreateUser(userFromToken: UserFromToken) {
    const { sub, email, preferred_username, realm_access } = userFromToken;

    // Determine role from token
    const roles = realm_access?.roles || [];
    const isAdmin = roles.includes('admin');
    const role = isAdmin ? 'admin' : 'user';

    // Try to find existing user
    let user = await prisma.user.findUnique({
        where: { keycloakId: sub },
    });

    // If user doesn't exist, create it automatically (auto-profile creation)
    if (!user) {
        user = await prisma.user.create({
            data: {
                keycloakId: sub,
                email: email,
                role: role,
            },
        });
    } else {
        // Update role if it changed in Keycloak
        if (user.role !== role) {
            user = await prisma.user.update({
                where: { id: user.id },
                data: { role: role },
            });
        }
    }

    return user;
}

export async function getUserById(userId: string) {
    return prisma.user.findUnique({
        where: { id: userId },
    });
}

export async function getUserByKeycloakId(keycloakId: string) {
    return prisma.user.findUnique({
        where: { keycloakId },
    });
}

export async function updateUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
}) {
    return prisma.user.update({
        where: { id: userId },
        data,
    });
}

