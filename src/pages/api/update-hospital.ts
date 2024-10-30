import { Collection, ObjectId } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

import { HospitalProps } from '@/domains/hospital';
import { getHospitalsCollection } from '@/lib/mongodb';
import { HospitalUpdateReturnType } from '@/services/interfaces';
import { HttpStatus } from '@/utils/api';
import { isAdminToken, isExpiredToken } from '@/utils/token';

const handler = async (req: NextApiRequest, res: NextApiResponse<HospitalUpdateReturnType>) => {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(HttpStatus.MethodNotAllowed).json({ message: `Method ${req.method} not allowed` });
  }

  // renew token
  if (req.headers.authorization) {
    try {
      const isExpired = await isExpiredToken(req.headers.authorization);
      if (isExpired) return res.status(HttpStatus.Unauthorized).json({ message: 'Token expired' });
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(HttpStatus.Unauthorized).json({ message: 'Invalid token' });
    }
  }

  try {
    const isAdmin = await isAdminToken(req.headers.authorization);
    if (!isAdmin) return res.status(HttpStatus.Forbidden).json({ message: 'Insufficient permissions' });
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(HttpStatus.Unauthorized).json({ message: 'Invalid token' });
  }

  // Create an array of keys from HospitalProps
  const requiredFields = Object.keys({} as HospitalProps) as (keyof HospitalProps)[];

  for (const field of requiredFields) {
    if (req.body[field] === undefined) return res.status(HttpStatus.BadRequest).json({ message: `缺少所需資訊: ${field}` });
  }

  if (typeof req.body._id !== 'string' || !ObjectId.isValid(req.body._id))
    return res.status(HttpStatus.BadRequest).json({ message: '更新醫院失敗!' });

  try {
    const hospitalsCollection: Collection<HospitalProps> = await getHospitalsCollection();
    const hospitalId = new ObjectId(req.body._id as string);
    const updateFields = req.body;

    delete updateFields._id;

    const updateData: Partial<HospitalProps> = {
      ...req.body,
      createdAt: new Date(req.body.createdAt),
      updatedAt: new Date(),
    };

    const result = await hospitalsCollection.updateOne(
      { _id: hospitalId, $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }] },
      {
        $set: updateData,
      }
    );

    if (result.modifiedCount === 0) return res.status(HttpStatus.NotFound).json({ message: '醫院不存在!' });

    res.status(HttpStatus.Ok).json({ message: `已更新${updateData.title}!` });
  } catch (error) {
    console.error('Error updating hospital:', error);
    res.status(HttpStatus.InternalServerError).json({ message: `Server error: ${error}` });
  }
};

export default handler;
