'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Eye
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const productsRes = await api.get('/products?limit=1');
      const ordersRes = await api.get('/orders/admin/all?limit=10');
      const orders = ordersRes.data.orders || [];
      
      const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        totalUsers: new Set(orders.map(o => o.user_id)).size,
        totalProducts: productsRes.data.total || 0,
        totalOrders: orders.length,
        totalRevenue: totalRevenue
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();
  const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#b45309' },
      confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
      processing: { bg: '#ede9fe', color: '#7c3aed' },
      shipped: { bg: '#cffafe', color: '#0891b2' },
      delivered: { bg: '#d1fae5', color: '#059669' },
      cancelled: { bg: '#fee2e2', color: '#dc2626' }
    };
    return styles[status] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #3b82f6',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Admin Dashboard</h1>
      </div>

      {/* Stats Cards - Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
        {/* Total Users */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Total Users</p>
              <p style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>{stats.totalUsers}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#3b82f620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Total Products</p>
              <p style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>{stats.totalProducts}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#10b98120', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={24} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Total Orders</p>
              <p style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>{stats.totalOrders}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#8b5cf620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={24} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Total Revenue</p>
              <p style={{ fontSize: 28, fontWeight: 600, color: '#fff' }}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#f59e0b20', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 24 }}>
        <Link href="/admin/products" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'background 0.2s' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Manage Products</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Add, edit, or remove products</p>
          </div>
        </Link>
        <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'background 0.2s' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>View Orders</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Track and manage customer orders</p>
          </div>
        </Link>
        <Link href="/admin/products" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24, cursor: 'pointer', transition: 'background 0.2s' }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Inventory</h3>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Check stock levels</p>
          </div>
        </Link>
      </div>

      {/* Revenue Overview */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Revenue Overview</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981' }}>
            <TrendingUp size={16} />
            <span style={{ fontSize: 14 }}>+15% from last month</span>
          </div>
        </div>
        
        {/* Chart Bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, gap: 16 }}>
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => (
            <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: '100%',
                height: [100, 130, 90, 140, 110, 160][i],
                backgroundColor: '#3b82f6',
                borderRadius: '4px 4px 0 0'
              }}></div>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>Recent Orders</h2>
          <Link href="/admin/orders" style={{ fontSize: 14, color: '#3b82f6', textDecoration: 'none' }}>
            View All
          </Link>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#111827' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Order ID</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? recentOrders.map((order, index) => {
              const statusStyle = getStatusStyle(order.status);
              return (
                <tr key={order._id} style={{ borderBottom: index < recentOrders.length - 1 ? '1px solid #374151' : 'none' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: 14, fontFamily: 'monospace', color: '#fff' }}>
                      #{order.order_number || order._id.slice(-8)}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: 14, color: '#fff' }}>{order.shipping_address?.name || 'N/A'}</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{order.shipping_address?.phone}</p>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatCurrency(order.total)}</span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '4px 12px',
                      borderRadius: 9999,
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      textTransform: 'capitalize'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ fontSize: 14, color: '#9ca3af' }}>{formatDate(order.created_at)}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <Link href={`/admin/orders?id=${order._id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 14, color: '#3b82f6', textDecoration: 'none' }}>
                      <Eye size={16} />
                      View
                    </Link>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={6} style={{ padding: '48px 24px', textAlign: 'center', color: '#6b7280' }}>
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
