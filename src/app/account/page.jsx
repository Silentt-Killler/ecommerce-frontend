'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Package, MapPin, Heart, LogOut, ChevronRight, Settings, Bell, CreditCard, HelpCircle } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized, logout, checkAuth } = useAuthStore();
  const [isMobile, setIsMobile] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    } else if (isInitialized && isAuthenticated) {
      fetchOrders();
    }
  }, [isInitialized, isAuthenticated, router]);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my-orders?limit=3');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (!isInitialized || loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F7F7' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const menuItems = [
    { icon: Package, label: 'My Orders', href: '/account/orders', count: orders.length },
    { icon: MapPin, label: 'Addresses', href: '/account/addresses' },
    { icon: Heart, label: 'Wishlist', href: '/account/wishlist' },
    { icon: CreditCard, label: 'Payment Methods', href: '/account/payments' },
    { icon: Bell, label: 'Notifications', href: '/account/notifications' },
    { icon: Settings, label: 'Account Settings', href: '/account/settings' },
    { icon: HelpCircle, label: 'Help & Support', href: '/contact' },
  ];

  // Mobile Layout
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', paddingBottom: 100 }}>
        {/* Profile Header */}
        <div style={{
          backgroundColor: '#0C0C0C',
          padding: '50px 20px 30px',
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar */}
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
            
            {/* Info */}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: '#FFFFFF', margin: 0, marginBottom: 4 }}>
                {user?.name || 'User'}
              </h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                {user?.email}
              </p>
            </div>

            {/* Edit Button */}
            <Link href="/account/settings" style={{
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 20,
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 500,
              textDecoration: 'none'
            }}>
              Edit
            </Link>
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
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 12, 
            padding: '16px 12px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#0C0C0C', margin: 0 }}>{orders.length}</p>
            <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>Orders</p>
          </div>
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 12, 
            padding: '16px 12px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#0C0C0C', margin: 0 }}>{user?.addresses?.length || 0}</p>
            <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>Addresses</p>
          </div>
          <div style={{ 
            backgroundColor: '#FFFFFF', 
            borderRadius: 12, 
            padding: '16px 12px', 
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#0C0C0C', margin: 0 }}>0</p>
            <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>Wishlist</p>
          </div>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Recent Orders</h2>
              <Link href="/account/orders" style={{ fontSize: 13, color: '#B08B5C', textDecoration: 'none' }}>View All</Link>
            </div>
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {orders.slice(0, 2).map((order, index) => (
                <Link 
                  key={order._id} 
                  href={`/account/orders/${order._id}`}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: 16, 
                    borderBottom: index < orders.length - 1 ? '1px solid #F0F0F0' : 'none',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ 
                    width: 50, 
                    height: 50, 
                    backgroundColor: '#F5F5F5', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Package size={24} color="#919191" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>
                      Order #{order.order_number}
                    </p>
                    <p style={{ fontSize: 12, color: '#919191', margin: '4px 0 0 0' }}>
                      {order.items?.length || 0} items • ৳{order.total?.toLocaleString()}
                    </p>
                  </div>
                  <div style={{
                    padding: '4px 10px',
                    backgroundColor: order.status === 'delivered' ? '#E8F5E9' : order.status === 'cancelled' ? '#FFEBEE' : '#FFF3E0',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 500,
                    color: order.status === 'delivered' ? '#1E7F4F' : order.status === 'cancelled' ? '#B00020' : '#E65100',
                    textTransform: 'capitalize'
                  }}>
                    {order.status}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div style={{ padding: '0 20px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {menuItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: index < menuItems.length - 1 ? '1px solid #F5F5F5' : 'none',
                  textDecoration: 'none'
                }}
              >
                <item.icon size={22} color="#0C0C0C" strokeWidth={1.5} />
                <span style={{ flex: 1, marginLeft: 14, fontSize: 15, color: '#0C0C0C', fontWeight: 500 }}>
                  {item.label}
                </span>
                {item.count > 0 && (
                  <span style={{ 
                    backgroundColor: '#B08B5C', 
                    color: '#FFFFFF', 
                    fontSize: 11, 
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 10,
                    marginRight: 8
                  }}>
                    {item.count}
                  </span>
                )}
                <ChevronRight size={20} color="#CCCCCC" />
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Button */}
        <div style={{ padding: '20px' }}>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '16px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #FFCDD2',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              color: '#B00020',
              cursor: 'pointer'
            }}
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', paddingTop: 80, paddingBottom: 60 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 30 }}>
          {/* Sidebar */}
          <div>
            {/* Profile Card */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  backgroundColor: '#B08B5C',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ color: '#FFFFFF', fontSize: 24, fontWeight: 600 }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>{user?.name}</h2>
                  <p style={{ fontSize: 13, color: '#919191', margin: '4px 0 0 0' }}>{user?.email}</p>
                </div>
              </div>
              <Link href="/account/settings" style={{
                display: 'block',
                textAlign: 'center',
                padding: '10px',
                backgroundColor: '#F5F5F5',
                borderRadius: 8,
                color: '#0C0C0C',
                fontSize: 14,
                fontWeight: 500,
                textDecoration: 'none'
              }}>
                Edit Profile
              </Link>
            </div>

            {/* Menu */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              {menuItems.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 20px',
                    borderBottom: index < menuItems.length - 1 ? '1px solid #F5F5F5' : 'none',
                    textDecoration: 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FAFAFA'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <item.icon size={20} color="#666" strokeWidth={1.5} />
                  <span style={{ flex: 1, marginLeft: 12, fontSize: 14, color: '#0C0C0C' }}>{item.label}</span>
                  <ChevronRight size={18} color="#CCC" />
                </Link>
              ))}
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '14px 20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  borderTop: '1px solid #F5F5F5'
                }}
              >
                <LogOut size={20} color="#B00020" strokeWidth={1.5} />
                <span style={{ flex: 1, marginLeft: 12, fontSize: 14, color: '#B00020', textAlign: 'left' }}>Log Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#0C0C0C', marginBottom: 24 }}>My Account</h1>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 30 }}>
              {[
                { label: 'Total Orders', value: orders.length },
                { label: 'Pending', value: orders.filter(o => o.status === 'pending').length },
                { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length },
                { label: 'Wishlist', value: 0 }
              ].map(stat => (
                <div key={stat.label} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#0C0C0C', margin: 0 }}>{stat.value}</p>
                  <p style={{ fontSize: 13, color: '#919191', margin: '4px 0 0 0' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Recent Orders</h2>
                <Link href="/account/orders" style={{ fontSize: 14, color: '#B08B5C', textDecoration: 'none' }}>View All →</Link>
              </div>

              {orders.length > 0 ? (
                <div>
                  {orders.map((order, index) => (
                    <Link
                      key={order._id}
                      href={`/account/orders/${order._id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 0',
                        borderBottom: index < orders.length - 1 ? '1px solid #F5F5F5' : 'none',
                        textDecoration: 'none'
                      }}
                    >
                      <div style={{ width: 50, height: 50, backgroundColor: '#F5F5F5', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                        <Package size={24} color="#919191" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', margin: 0 }}>Order #{order.order_number}</p>
                        <p style={{ fontSize: 13, color: '#919191', margin: '4px 0 0 0' }}>{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C', marginRight: 20 }}>৳{order.total?.toLocaleString()}</p>
                      <span style={{
                        padding: '6px 14px',
                        backgroundColor: order.status === 'delivered' ? '#E8F5E9' : order.status === 'cancelled' ? '#FFEBEE' : '#FFF3E0',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 500,
                        color: order.status === 'delivered' ? '#1E7F4F' : order.status === 'cancelled' ? '#B00020' : '#E65100',
                        textTransform: 'capitalize'
                      }}>
                        {order.status}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Package size={48} color="#E0E0E0" strokeWidth={1} />
                  <p style={{ color: '#919191', marginTop: 16 }}>No orders yet</p>
                  <Link href="/shop" style={{ display: 'inline-block', marginTop: 16, padding: '12px 24px', backgroundColor: '#0C0C0C', color: '#FFFFFF', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
