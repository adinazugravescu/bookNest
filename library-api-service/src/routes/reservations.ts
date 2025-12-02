import { Router, Request, Response } from 'express';
import {
  createReservation,
  getUserReservations,
  getReservationById,
  cancelReservation,
} from '../services/reservationService';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /reservations - Rezervare carte
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'bookId is required' });
    }

    // Folosim sub (Keycloak ID) ca userId
    const reservation = await createReservation({
      userId: req.user.sub,
      bookId,
    });

    res.status(201).json(reservation);
  } catch (error: any) {
    console.error('Error creating reservation:', error);
    if (error.message === 'Book is not available for reservation') {
      return res.status(409).json({ error: error.message });
    }
    if (error.message === 'User already has an active reservation for this book') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reservations/me - Vizualizare rezervări proprii
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reservations = await getUserReservations(req.user.sub);
    res.json(reservations);
  } catch (error: any) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /reservations/:id - Detalii rezervare
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const reservation = await getReservationById(id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Doar utilizatorul care a făcut rezervarea sau admin-ul o poate vedea
    const roles = req.user.realm_access?.roles || [];
    if (reservation.userId !== req.user.sub && !roles.includes('admin')) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(reservation);
  } catch (error: any) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /reservations/:id - Anulare rezervare
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const reservation = await cancelReservation(id, req.user.sub);

    res.json(reservation);
  } catch (error: any) {
    console.error('Error cancelling reservation:', error);
    if (error.message === 'Reservation not found') {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === 'Unauthorized: You can only cancel your own reservations') {
      return res.status(403).json({ error: error.message });
    }
    if (error.message === 'Reservation is not active') {
      return res.status(409).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

