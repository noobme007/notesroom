import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { User, IUser } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No authentication token provided' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    const decodedToken = await firebaseAuth.verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decodedToken.uid });

    if (!user) {
      user = await User.create({
        firebaseUid: decodedToken.uid,
        name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
        email: decodedToken.email || '',
        profilePicture: decodedToken.picture || '',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
