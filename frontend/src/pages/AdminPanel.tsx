import { useEffect, useState } from 'react';
import { bookService } from '../services/bookService';
import { reservationService } from '../services/reservationService';
import { Book, CreateBookInput } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPanel = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<CreateBookInput>({
    title: '',
    author: '',
    isbn: '',
    description: '',
    location: '',
  });

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
      setError(err.response?.data?.error || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (editingBook) {
        await bookService.updateBook(editingBook.id, formData);
      } else {
        await bookService.createBook(formData);
      }
      await loadBooks();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      description: book.description || '',
      location: book.location || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      setDeleting(id);
      setError(null);
      await bookService.deleteBook(id);
      await loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete book');
    } finally {
      setDeleting(null);
    }
  };

  const handleCompleteReservation = async (bookId: string) => {
    const book = books.find((b: Book) => b.id === bookId);
    const activeReservation = book?.reservations?.find((r) => r.status === 'active');

    if (!activeReservation) {
      setError('No active reservation found for this book');
      return;
    }

    if (!confirm('Are you sure you want to complete this reservation? This marks the book as returned.')) {
      return;
    }

    try {
      setCompleting(bookId);
      setError(null);
      await reservationService.completeReservation(activeReservation.id);
      await loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete reservation');
    } finally {
      setCompleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      description: '',
      location: '',
    });
    setEditingBook(null);
    setShowForm(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-gray-600">Manage books in the library</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-6 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700"
        >
          + Add Book
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ISBN
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{book.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{book.author}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{book.isbn || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {book.available ? (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Available
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                      Reserved
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {!book.available && (
                    <button
                      onClick={() => handleCompleteReservation(book.id)}
                      disabled={completing === book.id}
                      className="px-1.5 py-0.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {completing === book.id ? 'Completing...' : 'Complete Reservation'}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(book)}
                    className="text-primary-600 hover:text-primary-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book.id)}
                    disabled={deleting === book.id}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    {deleting === book.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;

