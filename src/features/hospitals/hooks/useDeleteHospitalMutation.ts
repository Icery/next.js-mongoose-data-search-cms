import { useMemo } from 'react';

import { useMutation } from '@tanstack/react-query';

import { DeleteHospitalDto } from '@/domains/hospital';
import { deleteHospital } from '@/services/hospital';
import { UpdateHospitalReturnType } from '@/services/interfaces';
import type { UseMutationFn } from '@/utils/reactQuery';

export const useDeleteHospitalMutation: UseMutationFn<UpdateHospitalReturnType, DeleteHospitalDto> = (args) => {
  const { onError, onSuccess, mutationPrefixKey = [] } = args ?? {};
  const {
    isPending: isLoading,
    isError,
    error,
    data,
    mutate,
    mutateAsync,
  } = useMutation({
    mutationKey: [...mutationPrefixKey],
    mutationFn: deleteHospital,
    onSuccess,
    onError,
  });

  return useMemo(() => {
    return { isLoading, isError, error, data, mutate, mutateAsync };
  }, [isLoading, isError, error, data, mutate, mutateAsync]);
};
