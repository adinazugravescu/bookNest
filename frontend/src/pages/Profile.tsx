import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types';

const Profile = () => {
  const { user: authUser, refreshUser } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(authUser);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setFirstName(authUser.firstName || '');
      setLastName(authUser.lastName || '');
    }
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updated = await profileService.updateProfile({ firstName, lastName });
      setUser(updated);
      await refreshUser();
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-2 text-gray-600">Manage your profile information</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
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

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

