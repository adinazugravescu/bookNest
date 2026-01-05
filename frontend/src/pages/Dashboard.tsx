import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '../services/bookService';
import { Book } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async (search?: string) => {
    try {
      setLoading(true);
      const data = await bookService.getAllBooks(search);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    loadBooks(searchTerm || undefined);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHasSearched(false);
    if (e.target.value === '') {
      setHasSearched(false);
      loadBooks();
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

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="max-w-2xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by title or author..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setHasSearched(false);
                  loadBooks();
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
        {hasSearched && searchTerm && (
          <p className="mt-2 text-sm text-gray-600">
            {books.length === 0
              ? 'No books found matching your search.'
              : `Found ${books.length} book${books.length !== 1 ? 's' : ''} matching "${searchTerm}"`}
          </p>
        )}
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

