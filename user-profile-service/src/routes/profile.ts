import { Router, Request, Response } from 'express';
import { getOrCreateUser, updateUser, getUserByKeycloakId } from '../services/userService';

const router = Router();

/**
 * GET /profile/me
 * Get current user's profile
 * Auto-creates profile if it doesn't exist (from Keycloak token)
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get or create user profile (auto-creation on first login)
    const user = await getOrCreateUser(req.user);

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error: any) {
    console.error('Error getting profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /profile/me
 * Update current user's profile
 * Users can only update their own profile
 */
router.put('/me', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get or create user first
    const user = await getOrCreateUser(req.user);

    // Extract allowed fields
    const { firstName, lastName } = req.body;

    // Update user profile
    const updatedUser = await updateUser(user.id, {
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      // Note: email and role are managed by Keycloak, not updatable here
    });

    res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

