import { api } from '../config/api';
import { Book, CreateBookInput, UpdateBookInput } from '../types';

export const bookService = {
  getAllBooks: async (search?: string): Promise<Book[]> => {
    const params = search ? { search } : {};
    const response = await api.get('/books', { params });
    return response.data;
  },

  getBookById: async (id: string): Promise<Book> => {
    const response = await api.get(`/books/${id}`);
    return response.data;
  },

  createBook: async (data: CreateBookInput): Promise<Book> => {
    const response = await api.post('/books', data);
    return response.data;
  },

  updateBook: async (id: string, data: UpdateBookInput): Promise<Book> => {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
  },

  deleteBook: async (id: string): Promise<void> => {
    await api.delete(`/books/${id}`);
  },
};

