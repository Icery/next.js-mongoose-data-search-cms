import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

import { UserProps } from '@/domains/user';
import { GetUserReturnType, ManageProps } from '@/services/interfaces';
import { HttpStatus } from '@/utils/api';
import { getManageRecordsByUserId, getUserByUserId } from '@/utils/apiFunctions';
import { isExpiredToken } from '@/utils/token';

const handler = async (req: NextApiRequest, res: NextApiResponse<GetUserReturnType>) => {
  if (req.method !== 'GET') return res.status(HttpStatus.MethodNotAllowed).json({ message: 'Method not allowed' });

  if (req.headers.authorization) {
    try {
      const isExpired = await isExpiredToken(req.headers.authorization);
      if (isExpired) return res.status(HttpStatus.Unauthorized).json({ message: 'Token expired' });
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(HttpStatus.Unauthorized).json({ message: 'Invalid token' });
    }
  }

  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    console.error('Unauthorized');
    return res.status(HttpStatus.Unauthorized).json({ message: 'Unauthorized' });
  }

  const { _id } = req.query;

  if (typeof _id !== 'string') {
    return res.status(HttpStatus.BadRequest).json({ message: 'Invalid body' });
  }

  try {
    // Find the user by _id
    const user: UserProps | null = await getUserByUserId(new ObjectId(_id));

    if (!user) {
      console.error('User not found');
      return res.status(HttpStatus.NotFound).json({ message: '帳號不存在!' });
    }

    const manage: ManageProps = await getManageRecordsByUserId(new ObjectId(_id));

    // Return user details with managed hospitals and pharmacies
    res.status(HttpStatus.Ok).json({
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      manage,
      message: 'Success',
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(HttpStatus.InternalServerError).json({ message: `Server error: ${error}` });
  }
};

export default handler;
