import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '../services/reservationService';
import { Reservation } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getMyReservations();
      setReservations(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setCancelling(id);
      setError(null);
      await reservationService.cancelReservation(id);
      await loadReservations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel reservation');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
        <p className="mt-2 text-gray-600">Manage your book reservations</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 text-lg mb-4">You don't have any reservations yet.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link
                    to={`/books/${reservation.book.id}`}
                    className="text-xl font-semibold text-gray-900 hover:text-primary-600"
                  >
                    {reservation.book.title}
                  </Link>
                  <p className="text-gray-600 mt-1">by {reservation.book.author}</p>
                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span>
                      Reserved: {new Date(reservation.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </div>
                </div>
                {reservation.status === 'active' && (
                  <button
                    onClick={() => handleCancel(reservation.id)}
                    disabled={cancelling === reservation.id}
                    className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling === reservation.id ? 'Cancelling...' : 'Cancel'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reservations;

