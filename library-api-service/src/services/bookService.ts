import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function getAllBooks() {
  return prisma.book.findMany({
    include: {
      reservations: {
        where: {
          status: 'active',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getBookById(id: string) {
  return prisma.book.findUnique({
    where: { id },
    include: {
      reservations: {
        where: {
          status: 'active',
        },
      },
    },
  });
}

export async function createBook(data: CreateBookInput) {
  return prisma.book.create({
    data,
  });
}

export async function updateBook(id: string, data: UpdateBookInput) {
  return prisma.book.update({
    where: { id },
    data,
  });
}

export async function deleteBook(id: string) {
  return prisma.book.delete({
    where: { id },
  });
}

export async function checkBookAvailability(bookId: string): Promise<boolean> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      reservations: {
        where: {
          status: 'active',
        },
      },
    },
  });

  if (!book) {
    return false;
  }

  // Cartea e disponibilă dacă e marked as available ȘI nu are rezervări active
  return book.available && book.reservations.length === 0;
}

