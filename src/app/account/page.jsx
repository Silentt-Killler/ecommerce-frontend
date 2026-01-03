'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  User, Package, Truck, MapPin, Lock, LogOut, 
  ChevronRight, Plus, Trash2, Edit2, X, Camera,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

// Sidebar menu items
const MENU_ITEMS = [
  { id: 'profile', name: 'Personal Information', icon: User },
  { id: 'orders', name: 'My Orders', icon: Package },
  { id: 'track', name: 'Track Order', icon: Truck },
  { id: 'address', name: 'Manage Address', icon: MapPin },
  { id: 'password', name: 'Password Manager', icon: Lock },
];

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: ''
  });

  // Password form
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressData, setAddressData] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    postal_code: '',
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
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || ''
      });
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'track') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders/my-orders');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Filter orders based on tab
  const completedOrders = orders.filter(o => o.status === 'delivered');
  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/me', {
        name: profileData.name,
        phone: profileData.phone,
        gender: profileData.gender
      });
      await checkAuth();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/users/me/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('Password updated successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update password');
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
      setAddressData({ label: 'Home', street: '', city: '', state: '', postal_code: '', phone: '' });
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

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#FEF3C7', text: '#D97706' },
      confirmed: { bg: '#DBEAFE', text: '#2563EB' },
      processing: { bg: '#E0E7FF', text: '#4F46E5' },
      shipped: { bg: '#D1FAE5', text: '#059669' },
      delivered: { bg: '#D1FAE5', text: '#059669' },
      cancelled: { bg: '#FEE2E2', text: '#DC2626' }
    };
    return colors[status] || colors.pending;
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 80 }}>
      {/* Header */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', padding: '40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>
            My Account
          </h1>
          <p style={{ fontSize: 14, color: '#919191' }}>
            Home / My Account
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
          
          {/* Sidebar */}
          <div>
            {/* Profile Card */}
            <div style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: 12, 
              padding: 24, 
              marginBottom: 16,
              textAlign: 'center'
            }}>
              <div style={{ 
                position: 'relative', 
                width: 100, 
                height: 100, 
                margin: '0 auto 16px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid #B08B5C'
              }}>
                {user?.avatar ? (
                  <Image src={user.avatar} alt="Profile" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: '#F0F0F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={40} style={{ color: '#919191' }} />
                  </div>
                )}
                <button style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 32,
                  height: 32,
                  backgroundColor: '#B08B5C',
                  borderRadius: '50%',
                  border: '2px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <Camera size={14} style={{ color: '#FFFFFF' }} />
                </button>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>
                {user?.name || 'User'}
              </h3>
              <p style={{ fontSize: 13, color: '#919191' }}>{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '16px 20px',
                      backgroundColor: isActive ? '#B08B5C' : 'transparent',
                      border: 'none',
                      borderBottom: '1px solid #F0F0F0',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={20} style={{ color: isActive ? '#FFFFFF' : '#919191' }} />
                    <span style={{ 
                      flex: 1, 
                      fontSize: 14, 
                      fontWeight: isActive ? 500 : 400,
                      color: isActive ? '#FFFFFF' : '#0C0C0C'
                    }}>
                      {item.name}
                    </span>
                    <ChevronRight size={16} style={{ color: isActive ? '#FFFFFF' : '#D0D0D0' }} />
                  </button>
                );
              })}

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <LogOut size={20} style={{ color: '#DC2626' }} />
                <span style={{ fontSize: 14, color: '#DC2626' }}>Logout</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32 }}>
            
            {/* Personal Information */}
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>
                  Personal Information
                </h2>
                
                <form onSubmit={handleProfileSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.name.split(' ')[0] || ''}
                        onChange={(e) => {
                          const lastName = profileData.name.split(' ').slice(1).join(' ');
                          setProfileData({ ...profileData, name: `${e.target.value} ${lastName}`.trim() });
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={profileData.name.split(' ').slice(1).join(' ') || ''}
                        onChange={(e) => {
                          const firstName = profileData.name.split(' ')[0] || '';
                          setProfileData({ ...profileData, name: `${firstName} ${e.target.value}`.trim() });
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #E0E0E0',
                          borderRadius: 8,
                          fontSize: 14,
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Email *
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        fontSize: 14,
                        backgroundColor: '#F7F7F7',
                        color: '#919191'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+0123-456-789"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Gender *
                    </label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none',
                        backgroundColor: '#FFFFFF'
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '14px 32px',
                      backgroundColor: '#0C0C0C',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 8,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* My Orders (Completed) */}
            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>
                  My Orders
                </h2>

                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : completedOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <Package size={48} style={{ color: '#D0D0D0', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 16, color: '#919191' }}>No completed orders yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {completedOrders.map((order) => (
                      <OrderCard key={order._id} order={order} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Track Order (Active Orders) */}
            {activeTab === 'track' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>
                  Track Order
                </h2>

                {ordersLoading ? (
                  <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                  </div>
                ) : activeOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 60 }}>
                    <Truck size={48} style={{ color: '#D0D0D0', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 16, color: '#919191' }}>No active orders to track</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {activeOrders.map((order) => (
                      <OrderCard key={order._id} order={order} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} showTracking />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Manage Address */}
            {activeTab === 'address' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C' }}>
                    Manage Address
                  </h2>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 20px',
                      backgroundColor: '#B08B5C',
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                    Add New Address
                  </button>
                </div>

                {user?.addresses?.length > 0 ? (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {user.addresses.map((address, index) => (
                      <div
                        key={index}
                        style={{
                          padding: 20,
                          border: '1px solid #E0E0E0',
                          borderRadius: 12,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}
                      >
                        <div>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            backgroundColor: '#F0F0F0',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 500,
                            color: '#0C0C0C',
                            marginBottom: 12
                          }}>
                            {address.label || 'Home'}
                          </span>
                          <p style={{ fontSize: 14, color: '#0C0C0C', marginBottom: 4 }}>{address.street}</p>
                          <p style={{ fontSize: 14, color: '#919191', marginBottom: 4 }}>
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p style={{ fontSize: 14, color: '#0C0C0C', fontWeight: 500, marginTop: 8 }}>{address.phone}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(index)}
                          style={{
                            padding: 8,
                            backgroundColor: '#FEE2E2',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} style={{ color: '#DC2626' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 60, border: '2px dashed #E0E0E0', borderRadius: 12 }}>
                    <MapPin size={48} style={{ color: '#D0D0D0', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 16, color: '#919191', marginBottom: 16 }}>No saved addresses</p>
                    <button
                      onClick={() => setShowAddressModal(true)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#0C0C0C',
                        color: '#FFFFFF',
                        fontSize: 14,
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer'
                      }}
                    >
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Password Manager */}
            {activeTab === 'password' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>
                  Password Manager
                </h2>

                <form onSubmit={handlePasswordSubmit}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Current Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                      minLength={6}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 8 }}>
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirm_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: '1px solid #E0E0E0',
                        borderRadius: 8,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '14px 32px',
                      backgroundColor: '#0C0C0C',
                      color: '#FFFFFF',
                      fontSize: 14,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 8,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 24
        }}>
          <div style={{
            width: '100%',
            maxWidth: 500,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid #E0E0E0'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C' }}>Add New Address</h3>
              <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} style={{ padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Label</label>
                <select
                  value={addressData.label}
                  onChange={(e) => setAddressData({ ...addressData, label: e.target.value })}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Street Address *</label>
                <input
                  type="text"
                  value={addressData.street}
                  onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                  required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>City *</label>
                  <input
                    type="text"
                    value={addressData.city}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>State/Area *</label>
                  <input
                    type="text"
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Postal Code</label>
                  <input
                    type="text"
                    value={addressData.postal_code}
                    onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Phone *</label>
                  <input
                    type="tel"
                    value={addressData.phone}
                    onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#0C0C0C',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 500,
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer'
                }}
              >
                Save Address
              </button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Order Card Component
function OrderCard({ order, formatDate, formatCurrency, getStatusColor, showTracking }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = getStatusColor(order.status);

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div style={{ border: '1px solid #E0E0E0', borderRadius: 12, overflow: 'hidden' }}>
      {/* Order Header */}
      <div 
        onClick={() => setExpanded(!expanded)}
        style={{ 
          padding: 20, 
          cursor: 'pointer',
          backgroundColor: expanded ? '#FAFAFA' : '#FFFFFF',
          transition: 'background 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>
              Order #{order.order_number}
            </p>
            <p style={{ fontSize: 12, color: '#919191', marginTop: 4 }}>
              {formatDate(order.created_at)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              padding: '6px 12px',
              backgroundColor: statusColor.bg,
              color: statusColor.text,
              fontSize: 12,
              fontWeight: 500,
              borderRadius: 6,
              textTransform: 'capitalize'
            }}>
              {order.status}
            </span>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', marginTop: 8 }}>
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        <p style={{ fontSize: 13, color: '#919191' }}>
          {order.items?.length || 0} item(s) • Click to {expanded ? 'collapse' : 'view details'}
        </p>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ borderTop: '1px solid #E0E0E0' }}>
          {/* Tracking Progress (for active orders) */}
          {showTracking && order.status !== 'cancelled' && (
            <div style={{ padding: 20, backgroundColor: '#F7F7F7' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Order Progress</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {statusSteps.slice(0, -1).map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: index < 3 ? 1 : 'none' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? '#059669' : '#E0E0E0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 8px',
                          border: isCurrent ? '2px solid #B08B5C' : 'none'
                        }}>
                          <Icon size={18} style={{ color: isCompleted ? '#FFFFFF' : '#919191' }} />
                        </div>
                        <p style={{ fontSize: 11, color: isCompleted ? '#059669' : '#919191', fontWeight: isCurrent ? 600 : 400 }}>
                          {step.label}
                        </p>
                      </div>
                      {index < 3 && (
                        <div style={{
                          flex: 1,
                          height: 2,
                          backgroundColor: index < currentStepIndex ? '#059669' : '#E0E0E0',
                          margin: '0 8px 24px'
                        }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Items */}
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C', marginBottom: 16 }}>Order Items</p>
            {order.items?.map((item, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                gap: 16, 
                padding: '12px 0',
                borderBottom: index < order.items.length - 1 ? '1px solid #F0F0F0' : 'none'
              }}>
                <div style={{
                  width: 70,
                  height: 70,
                  borderRadius: 8,
                  overflow: 'hidden',
                  backgroundColor: '#F0F0F0',
                  flexShrink: 0
                }}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Package size={24} style={{ color: '#D0D0D0' }} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 4 }}>{item.name}</p>
                  {item.variant && (
                    <p style={{ fontSize: 12, color: '#919191', marginBottom: 4 }}>
                      {item.variant.size && `Size: ${item.variant.size}`}
                      {item.variant.color && ` • Color: ${item.variant.color}`}
                    </p>
                  )}
                  <p style={{ fontSize: 12, color: '#919191' }}>Qty: {item.quantity}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
