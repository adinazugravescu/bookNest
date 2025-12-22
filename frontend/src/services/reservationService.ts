import { api } from '../config/api';
import { Reservation } from '../types';

export const reservationService = {
  createReservation: async (bookId: string): Promise<Reservation> => {
    const response = await api.post('/reservations', { bookId });
    return response.data;
  },

  getMyReservations: async (): Promise<Reservation[]> => {
    const response = await api.get('/reservations/me');
    return response.data;
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  cancelReservation: async (id: string): Promise<Reservation> => {
    const response = await api.delete(`/reservations/${id}`);
    return response.data;
  },
};

