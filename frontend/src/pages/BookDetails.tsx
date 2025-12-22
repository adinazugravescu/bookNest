import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { reservationService } from '../services/reservationService';
import { Book } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadBook();
    }
  }, [id]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const data = await bookService.getBookById(id!);
      setBook(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!id || !book) return;

    try {
      setReserving(true);
      setError(null);
      setSuccess(null);
      await reservationService.createReservation(id);
      setSuccess('Book reserved successfully!');
      // Reload book to update availability
      await loadBook();
      // Redirect to reservations after a short delay
      setTimeout(() => {
        navigate('/reservations');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reserve book');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !book) {
    return (
      <div className="px-4 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary-600 hover:text-primary-700"
        >
          ← Back to Books
        </button>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-primary-600 hover:text-primary-700 flex items-center"
      >
        ← Back to Books
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-4">by {book.author}</p>
              {book.available ? (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Available
                </span>
              ) : (
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  Reserved
                </span>
              )}
            </div>
          </div>

          {book.isbn && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">ISBN: </span>
              <span className="text-sm text-gray-700">{book.isbn}</span>
            </div>
          )}

          {book.location && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">Location: </span>
              <span className="text-sm text-gray-700">{book.location}</span>
            </div>
          )}

          {book.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="mt-8 pt-6 border-t">
            {book.available ? (
              <button
                onClick={handleReserve}
                disabled={reserving}
                className="w-full sm:w-auto px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {reserving ? 'Reserving...' : 'Reserve This Book'}
              </button>
            ) : (
              <p className="text-gray-500">This book is currently not available for reservation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;

