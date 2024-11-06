import { ObjectId } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { ValidationError } from 'yup';

import { UserProps } from '@/domains/user';
import { ManageProps, UserLoginReturnType } from '@/services/interfaces';
import { HttpStatus } from '@/utils/api';
import { getManageRecordsByUserId, getUserByUserId } from '@/utils/apiFunctions';
import { generateToken, isExpiredToken } from '@/utils/token';

const handler = async (req: NextApiRequest, res: NextApiResponse<UserLoginReturnType>) => {
  if (req.method !== 'GET') {
    return res.status(HttpStatus.MethodNotAllowed).json({ message: 'Method not allowed' });
  }

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

  if (typeof _id !== 'string' || !ObjectId.isValid(_id))
    return res.status(HttpStatus.BadRequest).json({ message: '取得帳號失敗!' });

  try {
    const user: UserProps | null = await getUserByUserId(new ObjectId(_id));
    const manage: ManageProps = await getManageRecordsByUserId(new ObjectId(_id));

    if (!user) return res.status(HttpStatus.BadRequest).json({ message: '取得帳號失敗!' });
    const token = await generateToken({ user, manage });

    res.status(HttpStatus.Ok).json({
      token,
      message: 'Success',
    });
  } catch (error) {
    if (error instanceof ValidationError)
      return res.status(HttpStatus.BadRequest).json({ message: error.errors.join(', ') });
    console.error('Error logging in:', error);
    res.status(HttpStatus.InternalServerError).json({ message: `Server error: ${error}` });
  }
};

export default handler;
