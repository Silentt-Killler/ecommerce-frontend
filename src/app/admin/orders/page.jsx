'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, X, Truck, Package, Calendar, Phone, MapPin, User } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders', color: '#6b7280' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
  { value: 'processing', label: 'Processing', color: '#8b5cf6' },
  { value: 'shipped', label: 'Shipped', color: '#06b6d4' },
  { value: 'delivered', label: 'Delivered', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/orders/admin/all?limit=50`;
      if (selectedStatus !== 'all') url += `&status=${selectedStatus}`;
      const res = await api.get(url);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
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

  const exportOrders = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Address', 'Amount', 'Status', 'Payment', 'Date'];
    const rows = orders.map(o => [
      o.order_number || o._id.slice(-8),
      o.shipping_address?.name || '',
      o.shipping_address?.phone || '',
      `${o.shipping_address?.address || ''}, ${o.shipping_address?.city || ''}`,
      o.total || 0,
      o.status,
      o.payment_method || 'COD',
      formatDate(o.created_at)
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Orders</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage and track customer orders</p>
        </div>
        <button
          onClick={exportOrders}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            backgroundColor: '#10b981',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: 16,
        padding: 8,
        marginBottom: 24,
        display: 'flex',
        gap: 4,
        flexWrap: 'wrap'
      }}>
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            onClick={() => setSelectedStatus(status.value)}
            style={{
              padding: '12px 20px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: selectedStatus === status.value ? '#3b82f6' : 'transparent',
              color: selectedStatus === status.value ? '#fff' : '#9ca3af',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order ID</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? orders.map((order, index) => {
                  const statusStyle = getStatusStyle(order.status);
                  return (
                    <tr key={order._id} style={{ borderTop: '1px solid #374151' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 600, color: '#fff' }}>
                          #{order.order_number || order._id.slice(-8)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>{order.shipping_address?.name || 'N/A'}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>{order.shipping_address?.phone}</p>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: 14, color: '#9ca3af' }}>{formatDate(order.created_at)}</span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{formatCurrency(order.total)}</span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '6px 12px',
                          backgroundColor: '#374151',
                          color: '#d1d5db',
                          borderRadius: 6
                        }}>
                          {order.payment_method || 'COD'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order._id, e.target.value)}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '8px 16px',
                            borderRadius: 20,
                            border: 'none',
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 16px',
                            backgroundColor: '#374151',
                            color: '#3b82f6',
                            fontSize: 13,
                            fontWeight: 500,
                            borderRadius: 8,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} style={{ padding: 80, textAlign: 'center' }}>
                      <Package size={64} style={{ color: '#374151', marginBottom: 16 }} />
                      <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No orders found</p>
                      <p style={{ fontSize: 14, color: '#6b7280' }}>Orders will appear here once customers start purchasing</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1f2937', borderRadius: 20 }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Order #{selectedOrder.order_number || selectedOrder._id.slice(-8)}</h2>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Status & Total */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, padding: 20, backgroundColor: '#111827', borderRadius: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 600, padding: '8px 16px', borderRadius: 20, backgroundColor: getStatusStyle(selectedOrder.status).bg, color: getStatusStyle(selectedOrder.status).color, textTransform: 'capitalize' }}>
                  {selectedOrder.status}
                </span>
                <span style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{formatCurrency(selectedOrder.total)}</span>
              </div>

              {/* Customer Info */}
              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <User size={18} style={{ color: '#3b82f6' }} />
                  Customer Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Name</p>
                    <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{selectedOrder.shipping_address?.name}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Phone</p>
                    <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{selectedOrder.shipping_address?.phone}</p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Address</p>
                    <p style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}>{selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Order Items</h3>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: index > 0 ? '1px solid #374151' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#374151', overflow: 'hidden' }}>
                        {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Courier Options */}
              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Truck size={18} style={{ color: '#10b981' }} />
                  Courier Options
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <button style={{ padding: 14, backgroundColor: '#f97316', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                    Pathao
                  </button>
                  <button style={{ padding: 14, backgroundColor: '#8b5cf6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                    CarryBe
                  </button>
                </div>
                <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 12 }}>API integration coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
