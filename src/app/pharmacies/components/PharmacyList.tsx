'use client';
import { ReactElement, useCallback, useState } from 'react';

import { Controller, useForm } from 'react-hook-form';

import CreatePharmacyContent from '@/app/global-components/admin/CreatePharmacyContent';
import { Button } from '@/app/global-components/buttons/Button';
import GoogleMapComponent from '@/app/global-components/GoogleMapComponent';
import { Input, InputStyleType } from '@/app/global-components/inputs/Input';
import Pagination from '@/app/global-components/Pagination';
import { Select } from '@/app/global-components/selects/Select';
import { CountyType, PageType } from '@/domains/interfaces';
import { GetPharmaciesDto, PharmacyProps } from '@/domains/pharmacy';
import { usePharmaciesQuery } from '@/features/pharmacies/hooks/usePharmaciesQuery';
import AdminProtected from '@/hooks/utils/protections/components/useAdminProtected';

import PharmacyListItemCardHorizontal from './PharmacyListItemCardHorizontal';

const limit: number = 12;

const PharmacyList = (): ReactElement => {
  const { control, handleSubmit, getValues, reset } = useForm<GetPharmaciesDto>({
    defaultValues: {
      query: '',
      county: '',
      partner: false,
      healthInsuranceAuthorized: false,
    },
  });

  const [currentPage, setCurrentPage] = useState<number>(1);

  const {
    data: { pharmacies = [], total = 0 } = {},
    isLoading,
    isError,
    refetch,
  } = usePharmaciesQuery({
    query: getValues('query'),
    county: getValues('county'),
    partner: getValues('partner'),
    healthInsuranceAuthorized: getValues('healthInsuranceAuthorized'),
    page: currentPage,
    limit,
  });

  const totalPages = Math.ceil(total / limit);

  const onPageChange = useCallback((page: number) => setCurrentPage(page), []);

  const onSubmit = useCallback(
    (formData: GetPharmaciesDto) => {
      refetch();
      reset(formData);
      setCurrentPage(1);
    },
    [refetch, reset]
  );

  return (
    <div className="container mx-auto flex flex-col gap-y-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold">{PageType.PHARMACIES}</h1>
        <AdminProtected>
          <CreatePharmacyContent />
        </AdminProtected>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-4/5">
          <Controller
            name="query"
            control={control}
            render={({ field }) => (
              <input type="text" placeholder="藥局名稱" {...field} className="border rounded px-4 py-2 w-full" />
            )}
          />

          <Controller
            name="county"
            control={control}
            render={({ field }) => <Select {...field} defaultValue="所有縣市" options={Object.values(CountyType)} />}
          />

          <Controller
            name="healthInsuranceAuthorized"
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="flex items-center">
                <Input type={InputStyleType.Checkbox} checked={value} onChange={(e) => onChange(e.target.checked)} />
                <label className="text-sm">健保特約藥局</label>
              </div>
            )}
          />
        </div>

        <div className="w-1/5">
          <Button text="搜尋" type="submit" className="w-full" />
        </div>
      </form>

      <GoogleMapComponent locationData={pharmacies} />

      {/* Loading overlay */}
      <div className="relative w-full min-h-[400px]">
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-70">
            <span className="text-gray-500 text-lg">搜尋中...</span>
          </div>
        )}
        {isError && <span>搜尋時發生錯誤</span>}

        {/* Hospital list */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {!pharmacies.length && <label>沒有符合藥局</label>}
          {pharmacies.map(
            ({ _id, title, partner, county, district, address, healthInsuranceAuthorized, featuredImg }: PharmacyProps) => (
              <PharmacyListItemCardHorizontal
                key={_id.toString()}
                _id={_id}
                image={featuredImg ? featuredImg : process.env.NEXT_PUBLIC_FEATURED_IMAGE}
                title={title}
                county={county}
                district={district}
                address={address}
                healthInsuranceAuthorized={healthInsuranceAuthorized}
                partner={partner}
              />
            )
          )}
        </section>

        {/* Pagination */}
        <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={onPageChange} />

        <div className="my-4 text-center">
          <label>歡迎隨時告知我們，以便我們及時更新資料庫，讓更多人受益，感謝您的協助!</label>
        </div>
      </div>
    </div>
  );
};

export default PharmacyList;
