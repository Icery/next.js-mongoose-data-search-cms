import { GetGoogleInfosDto, GoogleBusinessStatus } from '@/domains/google';
import { apiOrigin, logApiError } from '@/utils/api';

import { GetGoogleInfosReturnType } from './interfaces';

export const getGoogleInfos = async ({ query, byTitle }: GetGoogleInfosDto): Promise<GetGoogleInfosReturnType> => {
  try {
    const { data } = await apiOrigin.get('/get-google-infos', { params: { query, byTitle } });

    const {
      address_components,
      adr_address,
      business_status,
      formatted_address,
      formatted_phone_number,
      geometry,
      icon,
      icon_background_color,
      icon_mask_base_uri,
      international_phone_number,
      name,
      opening_hours,
      photos,
      place_id,
      plus_code,
      types,
      url,
      utc_offset,
      vicinity,
      website,
      price_level,
      rating,
      reviews,
      user_ratings_total,
      scope,
      permanently_closed,
      reservable,
      serves_beer,
      serves_breakfast,
      serves_brunch,
      serves_dinner,
      serves_lunch,
      serves_vegetarian_food,
      takeout,
    } = data;

    return {
      address_components,
      adr_address,
      business_status,
      formatted_address,
      formatted_phone_number,
      geometry,
      icon,
      icon_background_color,
      icon_mask_base_uri,
      international_phone_number,
      name,
      opening_hours,
      photos,
      place_id,
      plus_code,
      types,
      url,
      utc_offset,
      vicinity,
      website,
      price_level,
      rating,
      reviews,
      user_ratings_total,
      scope,
      permanently_closed,
      reservable,
      serves_beer,
      serves_breakfast,
      serves_brunch,
      serves_dinner,
      serves_lunch,
      serves_vegetarian_food,
      takeout,
    };
  } catch (error) {
    const message: string = '搜尋Google資料失敗!';
    logApiError({ error, message });

    // Return default values in case of error
    return {
      address_components: [],
      adr_address: '',
      business_status: GoogleBusinessStatus.Operational, // Default to 'OPERATIONAL'
      formatted_address: '',
      formatted_phone_number: '',
      geometry: null,
      icon: '',
      icon_background_color: '',
      icon_mask_base_uri: '',
      international_phone_number: '',
      name: '',
      opening_hours: null,
      photos: [],
      place_id: '',
      plus_code: null,
      types: [],
      url: '',
      utc_offset: 0,
      vicinity: '',
      website: '',
      price_level: null,
      rating: 0,
      reviews: [],
      user_ratings_total: 0,
      scope: '',
      permanently_closed: false,
      reservable: false,
      serves_beer: false,
      serves_breakfast: false,
      serves_brunch: false,
      serves_dinner: false,
      serves_lunch: false,
      serves_vegetarian_food: false,
      takeout: false,
    };
  }
};
