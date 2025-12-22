import axios from 'axios';
import keycloak from './keycloak';

const api = axios.create({
  baseURL: '/api',
});

const profileApi = axios.create({
  baseURL: '/profile-api',
});

api.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    } else {
      console.warn('No Keycloak token available for request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

profileApi.interceptors.request.use(
  (config) => {
    if (keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      try {
        await keycloak.updateToken(30);
        if (keycloak.token) {
          error.config.headers.Authorization = `Bearer ${keycloak.token}`;
          return api.request(error.config);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        keycloak.logout();
      }
    }
    return Promise.reject(error);
  }
);

profileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await keycloak.updateToken(30);
        if (keycloak.token) {
          error.config.headers.Authorization = `Bearer ${keycloak.token}`;
          return profileApi.request(error.config);
        }
      } catch (refreshError) {
        keycloak.logout();
      }
    }
    return Promise.reject(error);
  }
);

export { api, profileApi };

