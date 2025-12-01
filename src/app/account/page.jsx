'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Plus, Trash2 } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Bangladesh',
    phone: ''
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
  }, [isAuthenticated, user, router]);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddressChange = (e) => {
    setAddressData({
      ...addressData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/users/me', profileData);
      await checkAuth();
      toast.success('Profile updated');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    try {
      await api.post('/users/me/addresses', addressData);
      await checkAuth();
      toast.success('Address added');
      setShowAddressModal(false);
      setAddressData({
        street: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Bangladesh',
        phone: ''
      });
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (index) => {
    if (!confirm('Delete this address?')) return;

    try {
      await api.delete(`/users/me/addresses/${index}`);
      await checkAuth();
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                <User size={24} className="text-gold" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Profile Information</h2>
                <p className="text-muted text-sm">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="input-field"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Addresses */}
          <div className="bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                  <MapPin size={24} className="text-gold" />
                </div>
                <h2 className="text-xl font-bold">Saved Addresses</h2>
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="btn-outline flex items-center gap-2 text-sm"
              >
                <Plus size={18} /> Add New
              </button>
            </div>

            {user?.addresses?.length > 0 ? (
              <div className="space-y-4">
                {user.addresses.map((address, index) => (
                  <div
                    key={index}
                    className="border p-4 flex justify-between items-start"
                  >
                    <div>
                      <p>{address.street}</p>
                      <p className="text-muted">
                        {address.city}, {address.state} {address.postal_code}
                      </p>
                      <p className="text-muted">{address.country}</p>
                      <p className="mt-2 font-medium">{address.phone}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(index)}
                      className="text-red-500 hover:text-red-600 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center py-8">
                No saved addresses yet
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-white shadow-sm p-6">
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/orders" className="text-muted hover:text-gold block py-2">
                  My Orders
                </a>
              </li>
              <li>
                <a href="/cart" className="text-muted hover:text-gold block py-2">
                  Shopping Cart
                </a>
              </li>
              <li>
                <a href="/shop" className="text-muted hover:text-gold block py-2">
                  Continue Shopping
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">Add New Address</h2>
            </div>

            <form onSubmit={handleAddAddress} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Street Address *</label>
                <input
                  type="text"
                  name="street"
                  value={addressData.street}
                  onChange={handleAddressChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State *</label>
                  <input
                    type="text"
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Postal Code *</label>
                  <input
                    type="text"
                    name="postal_code"
                    value={addressData.postal_code}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={addressData.phone}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
