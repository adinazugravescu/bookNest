export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  location?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  book: Book;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  location?: string;
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  location?: string;
  available?: boolean;
}

