import { PrismaClient } from '@prisma/client';
import { checkBookAvailability } from './bookService';

const prisma = new PrismaClient();

export interface CreateReservationInput {
  userId: string;
  bookId: string;
}

export async function createReservation(data: CreateReservationInput) {
  // Verify if the book is available
  const isAvailable = await checkBookAvailability(data.bookId);
  if (!isAvailable) {
    throw new Error('Book is not available for reservation');
  }

  // Verify if the user already has an active reservation for this book
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      userId: data.userId,
      bookId: data.bookId,
      status: 'active',
    },
  });

  if (existingReservation) {
    throw new Error('User already has an active reservation for this book');
  }

  return prisma.reservation.create({
    data,
    include: {
      book: true,
    },
  });
}

export async function getUserReservations(userId: string) {
  return prisma.reservation.findMany({
    where: {
      userId,
    },
    include: {
      book: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getReservationById(id: string) {
  return prisma.reservation.findUnique({
    where: { id },
    include: {
      book: true,
    },
  });
}

export async function cancelReservation(id: string, userId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  // Only the user who made the reservation or admin can cancel it
  if (reservation.userId !== userId) {
    throw new Error('Unauthorized: You can only cancel your own reservations');
  }

  if (reservation.status !== 'active') {
    throw new Error('Reservation is not active');
  }

  return prisma.reservation.update({
    where: { id },
    data: {
      status: 'cancelled',
    },
    include: {
      book: true,
    },
  });
}

export async function completeReservation(id: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    throw new Error('Reservation not found');
  }

  if (reservation.status !== 'active') {
    throw new Error('Reservation is not active');
  }

  return prisma.reservation.update({
    where: { id },
    data: {
      status: 'completed',
    },
    include: {
      book: true,
    },
  });
}

