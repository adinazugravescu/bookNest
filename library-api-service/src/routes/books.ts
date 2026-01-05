import { Router, Request, Response } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../services/bookService';
import { authenticateToken } from '../middleware/auth';
import { requireAdmin } from '../middleware/authorize';

const router = Router();

// GET /books - List books(authenticated)
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const books = await getAllBooks();
    res.json(books);
  } catch (error: any) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /books/:id - Details of a book(authenticated)
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await getBookById(id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error: any) {
    console.error('Error fetching book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /books - Add a book(admin only)
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { title, author, isbn, description, location } = req.body;

      if (!title || !author) {
        return res
          .status(400)
          .json({ error: 'Title and author are required' });
      }

      const book = await createBook({
        title,
        author,
        isbn,
        description,
        location,
      });

      res.status(201).json(book);
    } catch (error: any) {
      console.error('Error creating book:', error);
      if (error.code === 'P2002') {
        // Prisma unique constraint error
        return res.status(409).json({ error: 'ISBN already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// PUT /books/:id - Update a book(admin only)
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, author, isbn, description, location, available } =
        req.body;

      const book = await updateBook(id, {
        title,
        author,
        isbn,
        description,
        location,
        available,
      });

      if (!book) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json(book);
    } catch (error: any) {
      console.error('Error updating book:', error);
      if (error.code === 'P2025') {
        // Prisma record not found
        return res.status(404).json({ error: 'Book not found' });
      }
      if (error.code === 'P2002') {
        return res.status(409).json({ error: 'ISBN already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// DELETE /books/:id - Delete a book(admin only)
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await deleteBook(id);
      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting book:', error);
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Book not found' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;

