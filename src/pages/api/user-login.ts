import bcrypt from 'bcrypt';
import { NextApiRequest, NextApiResponse } from 'next';
import { ValidationError } from 'yup';

import { getUsersCollection } from '@/lib/mongodb';
import { loginValidationSchema } from '@/lib/validation';
import { UserLoginReturnType } from '@/services/interfaces';
import { HttpStatus } from '@/utils/api';
import { generateToken } from '@/utils/token';

const handler = async (req: NextApiRequest, res: NextApiResponse<UserLoginReturnType>) => {
  if (req.method !== 'POST') {
    return res.status(HttpStatus.MethodNotAllowed).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    await loginValidationSchema.validate(req.body, { abortEarly: false });

    const usersCollection = await getUsersCollection();

    const user = await usersCollection.findOne({ email, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] });

    if (!user) {
      return res.status(HttpStatus.Unauthorized).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(HttpStatus.Unauthorized).json({ message: 'Invalid email or password' });
    }

    const token = await generateToken({ _id: user._id.toString(), role: user.role }); // Use _id and role in the token
    res.status(HttpStatus.Ok).json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        manages: user.manages,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
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
