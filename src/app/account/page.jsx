'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  User, Package, Truck, MapPin, Lock, LogOut, 
  ChevronRight, Plus, Trash2, X, Heart, Settings, Bell, CreditCard, HelpCircle,
  CheckCircle, Clock
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  const [isMobile, setIsMobile] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', email: '', phone: '', gender: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressData, setAddressData] = useState({ label: 'Home', street: '', city: '', state: '', postal_code: '', phone: '' });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user) { setProfileData({ name: user.name || '', email: user.email || '', phone: user.phone || '', gender: user.gender || '' }); }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'track') { fetchOrders(); }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try { const res = await api.get('/orders/my-orders'); setOrders(res.data.orders || []); } 
    catch (error) { console.error('Failed to fetch orders:', error); } 
    finally { setOrdersLoading(false); }
  };

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status));

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.put('/users/me', { name: profileData.name, phone: profileData.phone, gender: profileData.gender }); await checkAuth(); toast.success('Profile updated successfully'); } 
    catch (error) { toast.error('Failed to update profile'); } 
    finally { setLoading(false); }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try { await api.put('/users/me/password', { current_password: passwordData.current_password, new_password: passwordData.new_password }); toast.success('Password updated successfully'); setPasswordData({ current_password: '', new_password: '', confirm_password: '' }); } 
    catch (error) { toast.error(error.response?.data?.detail || 'Failed to update password'); } 
    finally { setLoading(false); }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try { await api.post('/users/me/addresses', addressData); await checkAuth(); toast.success('Address added'); setShowAddressModal(false); setAddressData({ label: 'Home', street: '', city: '', state: '', postal_code: '', phone: '' }); } 
    catch (error) { toast.error('Failed to add address'); }
  };

  const handleDeleteAddress = async (index) => {
    if (!confirm('Delete this address?')) return;
    try { await api.delete(`/users/me/addresses/${index}`); await checkAuth(); toast.success('Address deleted'); } 
    catch (error) { toast.error('Failed to delete address'); }
  };

  const handleLogout = () => { logout(); toast.success('Logged out'); router.push('/'); };
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();
  const getStatusColor = (status) => {
    const colors = { pending: { bg: '#FEF3C7', text: '#D97706' }, confirmed: { bg: '#DBEAFE', text: '#2563EB' }, processing: { bg: '#E0E7FF', text: '#4F46E5' }, shipped: { bg: '#D1FAE5', text: '#059669' }, delivered: { bg: '#D1FAE5', text: '#059669' }, cancelled: { bg: '#FEE2E2', text: '#DC2626' } };
    return colors[status] || colors.pending;
  };

  if (!isAuthenticated) return null;

  // Mobile Menu Items for navigation style
  const mobileMenuItems = [
    { icon: Package, label: 'My Orders', id: 'orders', count: orders.length },
    { icon: MapPin, label: 'Addresses', id: 'address' },
    { icon: Lock, label: 'Password', id: 'password' },
    { icon: Truck, label: 'Track Order', id: 'track' },
    { icon: Settings, label: 'Edit Profile', id: 'profile' },
    { icon: HelpCircle, label: 'Help & Support', href: '/contact' },
  ];

  // ============ MOBILE LAYOUT - Original Design Style ============
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', paddingTop: 56, paddingBottom: 100 }}>
        {/* Profile Header - Black with Avatar */}
        <div style={{
          backgroundColor: '#0C0C0C',
          padding: '30px 20px 25px',
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 70,
              height: 70,
              backgroundColor: '#B08B5C',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 600 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: 0, marginBottom: 4 }}>
                {user?.name || 'User'}
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {user?.email}
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('profile')}
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 20,
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 12, 
          padding: '20px',
          marginTop: -20
        }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '16px 12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#0C0C0C', margin: 0 }}>{orders.length}</p>
            <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>Orders</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '16px 12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#0C0C0C', margin: 0 }}>{user?.addresses?.length || 0}</p>
            <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>Addresses</p>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: '16px 12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#0C0C0C', margin: 0 }}>{activeOrders.length}</p>
            <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>Active</p>
          </div>
        </div>

        {/* Content based on activeTab */}
        {activeTab === 'profile' ? (
          // Profile Edit Form
          <div style={{ padding: '0 20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: '#0C0C0C' }}>Edit Profile</h2>
              <form onSubmit={handleProfileSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#666' }}>Full Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#666' }}>Email</label>
                  <input type="email" value={profileData.email} disabled style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, backgroundColor: '#F5F5F5' }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#666' }}>Phone</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#666' }}>Gender</label>
                  <select value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })} style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
              <button onClick={() => setActiveTab(null)} style={{ width: '100%', padding: '14px', backgroundColor: 'transparent', color: '#919191', border: 'none', fontSize: 14, marginTop: 12, cursor: 'pointer' }}>
                ← Back to Menu
              </button>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          // Orders List
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>My Orders</h2>
              <button onClick={() => setActiveTab(null)} style={{ fontSize: 13, color: '#B08B5C', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
            </div>
            {ordersLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}><div style={{ width: 30, height: 30, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
            ) : orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {orders.map((order) => (<OrderCard key={order._id} order={order} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} showTracking={false} />))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, textAlign: 'center' }}><Package size={40} color="#E0E0E0" /><p style={{ color: '#919191', marginTop: 12 }}>No orders yet</p></div>
            )}
          </div>
        ) : activeTab === 'track' ? (
          // Track Orders
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Track Orders</h2>
              <button onClick={() => setActiveTab(null)} style={{ fontSize: 13, color: '#B08B5C', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
            </div>
            {activeOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activeOrders.map((order) => (<OrderCard key={order._id} order={order} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} showTracking={true} />))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, textAlign: 'center' }}><Truck size={40} color="#E0E0E0" /><p style={{ color: '#919191', marginTop: 12 }}>No active orders</p></div>
            )}
          </div>
        ) : activeTab === 'address' ? (
          // Address Management
          <div style={{ padding: '0 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Addresses</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowAddressModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 12 }}><Plus size={14} /> Add</button>
                <button onClick={() => setActiveTab(null)} style={{ fontSize: 13, color: '#B08B5C', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
              </div>
            </div>
            {user?.addresses?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {user.addresses.map((addr, index) => (
                  <div key={index} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#B08B5C', textTransform: 'uppercase' }}>{addr.label}</span>
                      <button onClick={() => handleDeleteAddress(index)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                    <p style={{ fontSize: 14, color: '#0C0C0C', margin: 0, marginBottom: 4 }}>{addr.street}</p>
                    <p style={{ fontSize: 13, color: '#919191', margin: 0 }}>{addr.city}, {addr.state} {addr.postal_code}</p>
                    <p style={{ fontSize: 13, color: '#919191', margin: 0, marginTop: 4 }}>{addr.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 40, textAlign: 'center' }}><MapPin size={40} color="#E0E0E0" /><p style={{ color: '#919191', marginTop: 12 }}>No addresses saved</p></div>
            )}
          </div>
        ) : activeTab === 'password' ? (
          // Password Change
          <div style={{ padding: '0 20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Change Password</h2>
                <button onClick={() => setActiveTab(null)} style={{ fontSize: 13, color: '#B08B5C', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
              </div>
              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#666' }}>Current Password</label>
                  <input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} required style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#666' }}>New Password</label>
                  <input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} required style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#666' }}>Confirm Password</label>
                  <input type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} required style={{ width: '100%', padding: '12px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Default: Menu Items List
          <>
            {/* Recent Orders Preview */}
            {orders.length > 0 && (
              <div style={{ padding: '0 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} style={{ fontSize: 13, color: '#B08B5C', background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {orders.slice(0, 2).map((order, index) => (
                    <div 
                      key={order._id} 
                      onClick={() => setActiveTab('orders')}
                      style={{ display: 'flex', alignItems: 'center', padding: 16, borderBottom: index < 1 ? '1px solid #F0F0F0' : 'none', cursor: 'pointer' }}
                    >
                      <div style={{ width: 50, height: 50, backgroundColor: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Package size={24} color="#919191" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Order #{order.order_number}</p>
                        <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>{order.items?.length || 0} items • {formatCurrency(order.total)}</p>
                      </div>
                      <div style={{ padding: '4px 10px', backgroundColor: getStatusColor(order.status).bg, borderRadius: 12, fontSize: 11, fontWeight: 500, color: getStatusColor(order.status).text, textTransform: 'capitalize' }}>
                        {order.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div style={{ padding: '0 20px' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {mobileMenuItems.map((item, index) => (
                  item.href ? (
                    <Link key={item.label} href={item.href} style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: index < mobileMenuItems.length - 1 ? '1px solid #F5F5F5' : 'none', textDecoration: 'none' }}>
                      <item.icon size={22} color="#0C0C0C" strokeWidth={1.5} />
                      <span style={{ flex: 1, marginLeft: 14, fontSize: 15, color: '#0C0C0C', fontWeight: 500 }}>{item.label}</span>
                      <ChevronRight size={20} color="#CCCCCC" />
                    </Link>
                  ) : (
                    <button key={item.label} onClick={() => { setActiveTab(item.id); if(item.id === 'orders') fetchOrders(); }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '16px 20px', borderBottom: index < mobileMenuItems.length - 1 ? '1px solid #F5F5F5' : 'none', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <item.icon size={22} color="#0C0C0C" strokeWidth={1.5} />
                      <span style={{ flex: 1, marginLeft: 14, fontSize: 15, color: '#0C0C0C', fontWeight: 500 }}>{item.label}</span>
                      {item.count > 0 && (
                        <span style={{ backgroundColor: '#B08B5C', color: '#FFFFFF', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, marginRight: 8 }}>{item.count}</span>
                      )}
                      <ChevronRight size={20} color="#CCCCCC" />
                    </button>
                  )
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div style={{ padding: '20px' }}>
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px', backgroundColor: '#FFFFFF', border: '1px solid #FFCDD2', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#B00020', cursor: 'pointer' }}>
                <LogOut size={20} /> Log Out
              </button>
            </div>
          </>
        )}

        {/* Address Modal */}
        {showAddressModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
            <div style={{ width: '100%', backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Add Address</h3>
                <button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleAddAddress}>
                <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Label</label><select value={addressData.label} onChange={(e) => setAddressData({ ...addressData, label: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8 }}><option value="Home">Home</option><option value="Office">Office</option><option value="Other">Other</option></select></div>
                <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Street *</label><input type="text" value={addressData.street} onChange={(e) => setAddressData({ ...addressData, street: e.target.value })} required style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8 }} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>City *</label><input type="text" value={addressData.city} onChange={(e) => setAddressData({ ...addressData, city: e.target.value })} required style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8 }} /></div>
                  <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>State *</label><input type="text" value={addressData.state} onChange={(e) => setAddressData({ ...addressData, state: e.target.value })} required style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8 }} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Postal</label><input type="text" value={addressData.postal_code} onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8 }} /></div>
                  <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Phone *</label><input type="tel" value={addressData.phone} onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })} required style={{ width: '100%', padding: '12px', border: '1px solid #E0E0E0', borderRadius: 8 }} /></div>
                </div>
                <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>Save</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ DESKTOP LAYOUT ============
  return (
    <div style={{ backgroundColor: '#F7F7F7', minHeight: '100vh', paddingTop: 80 }}>
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E0E0E0', padding: '40px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#0C0C0C', marginBottom: 8 }}>My Account</h1>
          <p style={{ fontSize: 14, color: '#919191' }}>Home / My Account</p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32 }}>
          <div>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 16px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #B08B5C' }}>
                {user?.avatar ? (<Image src={user.avatar} alt={user.name} fill style={{ objectFit: 'cover' }} />) : (<div style={{ width: '100%', height: '100%', backgroundColor: '#B08B5C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 36, fontWeight: 600, color: '#FFFFFF' }}>{user?.name?.charAt(0)?.toUpperCase()}</span></div>)}
              </div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', marginBottom: 4 }}>{user?.name}</h2>
              <p style={{ fontSize: 13, color: '#919191' }}>{user?.email}</p>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' }}>
              {MENU_ITEMS.map((item, index) => { const Icon = item.icon; const isActive = activeTab === item.id; return (<button key={item.id} onClick={() => setActiveTab(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', backgroundColor: isActive ? '#F7F7F7' : 'transparent', border: 'none', borderBottom: index < MENU_ITEMS.length - 1 ? '1px solid #F0F0F0' : 'none', cursor: 'pointer', textAlign: 'left', borderLeft: isActive ? '3px solid #B08B5C' : '3px solid transparent' }}><Icon size={20} style={{ color: isActive ? '#B08B5C' : '#919191' }} /><span style={{ fontSize: 14, color: isActive ? '#0C0C0C' : '#666', fontWeight: isActive ? 500 : 400 }}>{item.name}</span><ChevronRight size={16} style={{ marginLeft: 'auto', color: '#D0D0D0' }} /></button>); })}
              <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', borderLeft: '3px solid transparent' }}><LogOut size={20} style={{ color: '#DC2626' }} /><span style={{ fontSize: 14, color: '#DC2626' }}>Logout</span></button>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 32 }}>
            {activeTab === 'profile' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>Personal Information</h2>
                <form onSubmit={handleProfileSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                    <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Full Name *</label><input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div>
                    <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email *</label><input type="email" value={profileData.email} disabled style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, backgroundColor: '#F5F5F5' }} /></div>
                    <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Phone</label><input type="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div>
                    <div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Gender</label><select value={profileData.gender} onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option></select></div>
                  </div>
                  <button type="submit" disabled={loading} style={{ padding: '14px 32px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>{loading ? 'Saving...' : 'Save Changes'}</button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>My Orders</h2>
                {ordersLoading ? (<div style={{ textAlign: 'center', padding: 60 }}><div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>) : orders.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{orders.map((order) => (<OrderCard key={order._id} order={order} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} showTracking={false} />))}</div>) : (<div style={{ textAlign: 'center', padding: 60 }}><Package size={48} style={{ color: '#E0E0E0' }} /><p style={{ color: '#919191', marginTop: 16 }}>No orders yet</p></div>)}
              </div>
            )}

            {activeTab === 'track' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>Track Orders</h2>
                {activeOrders.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{activeOrders.map((order) => (<OrderCard key={order._id} order={order} formatDate={formatDate} formatCurrency={formatCurrency} getStatusColor={getStatusColor} showTracking={true} />))}</div>) : (<div style={{ textAlign: 'center', padding: 60 }}><Truck size={48} style={{ color: '#E0E0E0' }} /><p style={{ color: '#919191', marginTop: 16 }}>No active orders</p></div>)}
              </div>
            )}

            {activeTab === 'address' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C' }}>Manage Address</h2><button onClick={() => setShowAddressModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}><Plus size={18} /> Add New</button></div>
                {user?.addresses?.length > 0 ? (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{user.addresses.map((addr, index) => (<div key={index} style={{ border: '1px solid #E0E0E0', borderRadius: 12, padding: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span style={{ fontSize: 12, fontWeight: 600, color: '#B08B5C', textTransform: 'uppercase', letterSpacing: 1 }}>{addr.label}</span><button onClick={() => handleDeleteAddress(index)} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer' }}><Trash2 size={16} /></button></div><p style={{ fontSize: 14, color: '#0C0C0C', marginBottom: 4 }}>{addr.street}</p><p style={{ fontSize: 13, color: '#919191' }}>{addr.city}, {addr.state} {addr.postal_code}</p><p style={{ fontSize: 13, color: '#919191', marginTop: 8 }}>{addr.phone}</p></div>))}</div>) : (<div style={{ textAlign: 'center', padding: 60 }}><MapPin size={48} style={{ color: '#E0E0E0' }} /><p style={{ color: '#919191', marginTop: 16 }}>No addresses</p></div>)}
              </div>
            )}

            {activeTab === 'password' && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>Password Manager</h2>
                <form onSubmit={handlePasswordSubmit} style={{ maxWidth: 400 }}>
                  <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Current Password *</label><input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div>
                  <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>New Password *</label><input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div>
                  <div style={{ marginBottom: 24 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Confirm Password *</label><input type="password" value={passwordData.confirm_password} onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div>
                  <button type="submit" disabled={loading} style={{ padding: '14px 32px', backgroundColor: '#0C0C0C', color: '#FFFFFF', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>{loading ? 'Updating...' : 'Update Password'}</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddressModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h3 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Add New Address</h3><button onClick={() => setShowAddressModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button></div>
            <form onSubmit={handleAddAddress}>
              <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Label</label><select value={addressData.label} onChange={(e) => setAddressData({ ...addressData, label: e.target.value })} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }}><option value="Home">Home</option><option value="Office">Office</option><option value="Other">Other</option></select></div>
              <div style={{ marginBottom: 20 }}><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Street *</label><input type="text" value={addressData.street} onChange={(e) => setAddressData({ ...addressData, street: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}><div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>City *</label><input type="text" value={addressData.city} onChange={(e) => setAddressData({ ...addressData, city: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div><div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>State *</label><input type="text" value={addressData.state} onChange={(e) => setAddressData({ ...addressData, state: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}><div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Postal</label><input type="text" value={addressData.postal_code} onChange={(e) => setAddressData({ ...addressData, postal_code: e.target.value })} style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div><div><label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Phone *</label><input type="tel" value={addressData.phone} onChange={(e) => setAddressData({ ...addressData, phone: e.target.value })} required style={{ width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14 }} /></div></div>
              <button type="submit" style={{ width: '100%', padding: '14px', backgroundColor: '#0C0C0C', color: '#FFFFFF', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 8, cursor: 'pointer' }}>Save Address</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, formatDate, formatCurrency, getStatusColor, showTracking }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = getStatusColor(order.status);
  const statusSteps = [{ key: 'pending', label: 'Placed', icon: Clock }, { key: 'confirmed', label: 'Confirmed', icon: CheckCircle }, { key: 'processing', label: 'Processing', icon: Package }, { key: 'shipped', label: 'Shipped', icon: Truck }];
  const currentStepIndex = statusSteps.findIndex(s => s.key === order.status);

  return (
    <div style={{ border: '1px solid #E0E0E0', borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding: 16, cursor: 'pointer', backgroundColor: expanded ? '#FAFAFA' : '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div><p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Order #{order.order_number}</p><p style={{ fontSize: 12, color: '#919191', marginTop: 4 }}>{formatDate(order.created_at)}</p></div>
          <div style={{ textAlign: 'right' }}><span style={{ display: 'inline-block', padding: '5px 10px', backgroundColor: statusColor.bg, color: statusColor.text, fontSize: 11, fontWeight: 500, borderRadius: 6, textTransform: 'capitalize' }}>{order.status}</span><p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginTop: 6 }}>{formatCurrency(order.total)}</p></div>
        </div>
        <p style={{ fontSize: 12, color: '#919191' }}>{order.items?.length || 0} items • Tap to {expanded ? 'hide' : 'view'}</p>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid #E0E0E0' }}>
          {showTracking && order.status !== 'cancelled' && (
            <div style={{ padding: 16, backgroundColor: '#F7F7F7' }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#0C0C0C', marginBottom: 12 }}>Progress</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {statusSteps.map((step, index) => { const Icon = step.icon; const isCompleted = index <= currentStepIndex; return (<div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: index < 3 ? 1 : 'none' }}><div style={{ textAlign: 'center' }}><div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: isCompleted ? '#059669' : '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px' }}><Icon size={14} style={{ color: isCompleted ? '#FFFFFF' : '#919191' }} /></div><p style={{ fontSize: 9, color: isCompleted ? '#059669' : '#919191', margin: 0 }}>{step.label}</p></div>{index < 3 && (<div style={{ flex: 1, height: 2, backgroundColor: index < currentStepIndex ? '#059669' : '#E0E0E0', margin: '0 4px 16px' }} />)}</div>); })}
              </div>
            </div>
          )}
          <div style={{ padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#0C0C0C', marginBottom: 10 }}>Items</p>
            {order.items?.map((item, i) => (<div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid #F0F0F0' : 'none' }}><div style={{ width: 50, height: 50, borderRadius: 6, backgroundColor: '#F0F0F0', flexShrink: 0, overflow: 'hidden' }}>{item.image ? (<img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />) : (<div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} style={{ color: '#D0D0D0' }} /></div>)}</div><div style={{ flex: 1 }}><p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', margin: 0 }}>{item.name}</p><p style={{ fontSize: 11, color: '#919191', margin: 0 }}>Qty: {item.quantity}</p></div><p style={{ fontSize: 13, fontWeight: 600, color: '#0C0C0C' }}>{formatCurrency(item.price * item.quantity)}</p></div>))}
          </div>
        </div>
      )}
    </div>
  );
}
