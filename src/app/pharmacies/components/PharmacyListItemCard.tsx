import { ReactElement } from 'react';

import { ObjectId } from 'mongodb';
import Image from 'next/image';
import Link from 'next/link';

import Tag from '@/app/global-components/tags/Tag';
import { DistrictType, getPageUrlByType, PageType } from '@/domains/interfaces';

interface PharmacyListItemCardProps {
  _id: ObjectId;
  partner: boolean;
  image: string;
  title: string;
  county: string;
  district: DistrictType;
  address: string;
  healthInsuranceAuthorized: boolean;
}

const PharmacyListItemCard = ({
  _id,
  image,
  title,
  county,
  district,
  address,
  healthInsuranceAuthorized,
}: PharmacyListItemCardProps): ReactElement => (
  <Link
    href={`${getPageUrlByType(PageType.PHARMACIES)}/${_id}`}
    target="_blank"
    className="flex flex-col gap-1 border rounded p-4 shadow-lg hover:scale-105 transition-transform duration-300 bg-white"
  >
    <Image src={image} alt="Hospital Image" width={720} height={480} className="rounded" priority={true} />
    <div className="flex flex-col items-start">
      <span className="text-xl font-bold">{title}</span>
      {/* {partner && <Tag text="合作夥伴" />} */}
    </div>
    <p>{`${county}${district}${address}`}</p>
    <div className="flex flex-col items-start">{healthInsuranceAuthorized && <Tag text="健保特約藥局" />}</div>
  </Link>
);

export default PharmacyListItemCard;
