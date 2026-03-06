import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models';

/**
 * POST /api/auth/google
 * Authenticate with Google (Firebase token). Auto-registers new users.
 */
export const googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // The authenticate middleware already handles user creation
    // Just return the user data
    const user = req.user!;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user.
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
};
