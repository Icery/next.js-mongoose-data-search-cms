'use client';
import { ReactElement, useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';

import DeleteHospitalContent from '@/app/global-components/admin/DeleteHospitalContent';
import ManageHospitalContent from '@/app/global-components/admin/ManageHospitalContent';
import Breadcrumb from '@/app/global-components/Breadcrumb';
import Card from '@/app/global-components/Card';
import GoogleMapComponent from '@/app/global-components/GoogleMapComponent';
import GoogleOpening from '@/app/global-components/GoogleOpeningHours';
import GooglePhotoCarousel from '@/app/global-components/GooglePhotoCarousel';
import GoogleReviews from '@/app/global-components/GoogleReviews';
import Tab from '@/app/global-components/tabs/Tab';
import Tag from '@/app/global-components/tags/Tag';
import SidebarLayout from '@/app/hospitals/[id]/components/SidebarLayout';
import { DepartmentsType, HospitalExtraFieldType } from '@/domains/hospital';
import { getPageUrlByType, PageType } from '@/domains/interfaces';
import { ManageCategoryType } from '@/domains/manage';
import { defaultHospitalExcerpt } from '@/domains/metadatas';
import { useGoogleInfosMutation } from '@/features/google/hooks/useGoogleInfosMutation';
import { useHospitalQuery } from '@/features/hospitals/hooks/useHospitalQuery';
import AdminProtected from '@/hooks/utils/protections/components/useAdminProtected';
import ManagerProtected from '@/hooks/utils/protections/components/useManagerProtected';
import ConvertLink, { LinkType } from '@/utils/links';

import BasicInfos from './BasicInfos';

const HospitalContent = (): ReactElement => {
  const params = useParams();
  const paramsId: string = params?.id as string;
  const router = useRouter();

  const { data: { hospital } = {}, isLoading, isError, refetch } = useHospitalQuery({ _id: paramsId });

  const { data: googleInfo, mutateAsync: fetchGoogleInfo } = useGoogleInfosMutation();

  const [isAddressChecked, setIsAddressChecked] = useState<boolean>(false);

  useEffect(() => {
    const checkAndFetchGoogleData = async () => {
      if (isLoading || isError || !hospital) return;

      const googleTitle = hospital.title;
      const googleAddress = `${hospital.county}${hospital.district}${hospital.address}`;

      const fetchBasedOn = (query: string) => fetchGoogleInfo({ title: query });

      if (!isAddressChecked && googleTitle) {
        const { formatted_address } = await fetchBasedOn(googleTitle);

        if (!formatted_address?.includes('號')) await fetchBasedOn(googleAddress);
        setIsAddressChecked(true);
      }
    };

    checkAndFetchGoogleData();
  }, [isLoading, isError, hospital, isAddressChecked, fetchGoogleInfo]);

  useEffect(() => {
    if (!isLoading && !hospital && !isError) notFound();
  }, [isLoading, hospital, isError, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <span className="text-gray-500 text-lg">載入中...</span>
        </div>
      </div>
    );
  }

  if (isError) return <span>搜尋時發生錯誤</span>;
  if (!hospital) return <span>沒有符合醫院</span>;

  const {
    _id,
    partner,
    orgCode,
    owner,
    gender,
    title,
    email,
    phone,
    county,
    doctors,
    departments,
    excerpt,
    content,
    websiteUrl,
    featuredImg,
    lineId,
  } = hospital;

  const {
    business_status,
    formatted_address,
    formatted_phone_number,
    international_phone_number,
    opening_hours,
    website,
    rating,
    user_ratings_total,
    icon,
    icon_background_color,
    name,
    reviews,
    photos,
  } = googleInfo || {};

  const usedExcerpt: string = excerpt ? excerpt : defaultHospitalExcerpt(hospital);

  return (
    <div className="container mx-auto p-6">
      <div className="relative w-full">
        <SidebarLayout pageId={_id} county={county}>
          <div className="flex flex-col gap-y-6">
            <Image
              src={featuredImg ? featuredImg : process.env.NEXT_PUBLIC_FEATURED_IMAGE}
              alt={title}
              width={720}
              height={480}
              className="rounded-xl w-auto h-auto"
              priority={true}
            />
            <Breadcrumb pageName={title} />

            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <ManagerProtected pageId={_id.toString()} type={ManageCategoryType.Hospital}>
                <ManageHospitalContent hospital={hospital} refetch={refetch} />
              </ManagerProtected>
              <AdminProtected>
                <DeleteHospitalContent
                  _id={_id}
                  title={title}
                  afterDelete={() => router.push(getPageUrlByType(PageType.HOSPITALS))}
                />
              </AdminProtected>
              <div className="flex items-center">
                {icon && (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: icon_background_color }}
                  >
                    <Image src={icon} alt={`${name}圖標`} width={40} height={40} />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold">{title}</h1>
                  {name && (
                    <span className="text-sm text-gray-600">
                      Google資料來源: {ConvertLink({ text: name, type: LinkType.GoogleMapSearch })}
                    </span>
                  )}
                </div>
              </div>
              {partner && <Tag text="先豐科技合作夥伴" />}
              {lineId && (
                <Link href={`https://line.me/R/ti/p/${lineId}`} target="_blank">
                  <h3 className="bg-[#00C338] text-sm px-2 py-1 text-white text-center w-[120px] rounded">加入Line</h3>
                </Link>
              )}
            </div>

            <Card>
              <blockquote className="border-l-4 pl-4 italic text-gray-600">{usedExcerpt}</blockquote>
            </Card>

            <Tab
              tabs={[
                {
                  title: '基本資料',
                  content: (
                    <BasicInfos
                      rating={rating}
                      user_ratings_total={user_ratings_total}
                      business_status={business_status}
                      owner={owner}
                      gender={gender}
                      orgCode={orgCode}
                      formatted_address={formatted_address}
                      websiteUrl={websiteUrl}
                      website={website}
                      email={email}
                      phone={phone}
                      international_phone_number={international_phone_number}
                      formatted_phone_number={formatted_phone_number}
                    />
                  ),
                },
                !opening_hours
                  ? undefined
                  : {
                      title: '營業時間',
                      content: <GoogleOpening opening_hours={opening_hours} />,
                    },
              ]}
            />

            <Card>
              <>
                <h2 className="text-xl font-bold">關於{title}</h2>
                <p>{content ? content : `尚無關於${title}的相關資訊，歡迎醫院提供補充!`}</p>
              </>
            </Card>

            <Card>
              <>
                <div className="flex flex-wrap gap-2 mt-2">
                  {departments.map((department: DepartmentsType) => (
                    <Tag key={department} text={department} />
                  ))}
                </div>
                {doctors && <h3 className="text-xl font-bold">本院醫生: {doctors && doctors.join(', ')}</h3>}
                <ul className="list-disc ml-5 grid grid-cols-1 md:grid-cols-3">
                  {Object.keys(HospitalExtraFieldType).map((key) => {
                    const label = HospitalExtraFieldType[key as keyof typeof HospitalExtraFieldType]; // Get the label from the enum
                    const value = hospital[label]; // Get the value from hospital

                    return (
                      !!value && (
                        <li key={label}>
                          <label>
                            {label}: {value}位
                          </label>
                        </li>
                      )
                    );
                  })}
                </ul>
              </>
            </Card>

            <Card>
              <GoogleMapComponent locationData={[hospital]} />
            </Card>

            {photos && <GooglePhotoCarousel title={title} photos={photos} />}

            {reviews && <GoogleReviews reviews={reviews} />}
          </div>
        </SidebarLayout>
      </div>
    </div>
  );
};

export default HospitalContent;
