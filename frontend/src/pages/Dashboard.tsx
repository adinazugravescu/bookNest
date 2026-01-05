import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { Book } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks();
      setBooks(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading books:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load books';
      setError(`${errorMessage} (Status: ${err.response?.status || 'N/A'})`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Available Books</h1>
        <p className="mt-2 text-gray-600">Browse and reserve books from our library</p>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {books.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {book.title}
                  </h3>
                  {book.available ? (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Reserved
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                {book.description && (
                  <p className="text-gray-500 text-sm line-clamp-3 mt-2">{book.description}</p>
                )}
                {book.isbn && (
                  <p className="text-gray-400 text-xs mt-2">ISBN: {book.isbn}</p>
                )}
                <div className="mt-4 pt-4 border-t">
                  <span className="text-primary-600 text-sm font-medium hover:text-primary-700">
                    View Details →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;

