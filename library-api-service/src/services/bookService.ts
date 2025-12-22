import { PrismaClient } from '@prisma/client';
import { invalidateCache } from '../middleware/cache';

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

export async function getAllBooks(search?: string) {
  const where = search
    ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { author: { contains: search, mode: 'insensitive' as const } },
      ],
    }
    : {};

  return prisma.book.findMany({
    where,
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
  const book = await prisma.book.create({
    data,
  });
  await invalidateCache('/books*');
  return book;
}

export async function updateBook(id: string, data: UpdateBookInput) {
  const book = await prisma.book.update({
    where: { id },
    data,
  });
  await invalidateCache('/books*');
  await invalidateCache(`/books/${id}*`);
  return book;
}

export async function deleteBook(id: string) {
  const book = await prisma.book.delete({
    where: { id },
  });
  await invalidateCache('/books*');
  await invalidateCache(`/books/${id}*`);
  return book;
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

  // Book is available if it is marked as available and has no active reservations
  return book.available && book.reservations.length === 0;
}

