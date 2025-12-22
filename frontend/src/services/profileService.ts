import { profileApi } from '../config/api';
import { UserProfile } from '../types';

export const profileService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await profileApi.get('/profile/me');
    return response.data;
  },

  updateProfile: async (data: { firstName?: string; lastName?: string }): Promise<UserProfile> => {
    const response = await profileApi.put('/profile/me', data);
    return response.data;
  },
};

