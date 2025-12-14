'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, X, Truck, Package, Calendar } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = `/orders/admin/all?page=${currentPage}&limit=10`;
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#d97706' },
      confirmed: { bg: '#dbeafe', color: '#2563eb' },
      processing: { bg: '#e9d5ff', color: '#9333ea' },
      shipped: { bg: '#c7d2fe', color: '#4f46e5' },
      delivered: { bg: '#d1fae5', color: '#059669' },
      cancelled: { bg: '#fee2e2', color: '#dc2626' }
    };
    return styles[status] || { bg: '#f1f5f9', color: '#64748b' };
  };

  const exportOrders = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Amount', 'Status', 'Date'];
    const rows = orders.map(o => [
      o.order_number || o._id.slice(-8),
      o.shipping_address?.name || '',
      o.shipping_address?.phone || '',
      o.total || 0,
      o.status,
      formatDate(o.created_at)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Orders</h1>
          <p style={{ color: '#64748b' }}>Manage and track customer orders</p>
        </div>
        <button
          onClick={exportOrders}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ backgroundColor: '#10b981' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div 
        className="rounded-xl p-2 mb-6 flex flex-wrap gap-2"
        style={{ backgroundColor: '#1e293b' }}
      >
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            onClick={() => { setSelectedStatus(status.value); setCurrentPage(1); }}
            className="px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              backgroundColor: selectedStatus === status.value ? '#3b82f6' : 'transparent',
              color: selectedStatus === status.value ? '#ffffff' : '#94a3b8'
            }}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: '#1e293b' }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: '#0f172a' }}>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Order ID</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Payment</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Status</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold uppercase" style={{ color: '#64748b' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order, index) => {
                    const statusStyle = getStatusStyle(order.status);
                    return (
                      <tr 
                        key={order._id}
                        style={{ borderBottom: index < orders.length - 1 ? '1px solid #334155' : 'none' }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono font-medium text-white">
                            #{order.order_number || order._id.slice(-8)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-white">{order.shipping_address?.name || 'N/A'}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>{order.shipping_address?.phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm" style={{ color: '#94a3b8' }}>{formatDate(order.created_at)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-white">{formatCurrency(order.total)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="text-xs font-medium px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: '#334155', color: '#94a3b8' }}
                          >
                            {order.payment_method || 'COD'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateStatus(order._id, e.target.value)}
                            className="text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer capitalize"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                            style={{ color: '#3b82f6' }}
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <Package size={48} className="mx-auto mb-4" style={{ color: '#334155' }} />
                      <p className="text-white font-medium mb-2">No orders found</p>
                      <p className="text-sm" style={{ color: '#64748b' }}>Orders will appear here once customers start purchasing</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ backgroundColor: '#1e293b' }}
          >
            {/* Modal Header */}
            <div 
              className="flex items-center justify-between p-6"
              style={{ borderBottom: '1px solid #334155' }}
            >
              <div>
                <h2 className="text-xl font-bold text-white">
                  Order #{selectedOrder.order_number || selectedOrder._id.slice(-8)}
                </h2>
                <p className="text-sm" style={{ color: '#64748b' }}>
                  <Calendar size={14} className="inline mr-1" />
                  {formatDate(selectedOrder.created_at)}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#64748b' }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-sm font-medium px-4 py-2 rounded-full capitalize"
                  style={{ 
                    backgroundColor: getStatusStyle(selectedOrder.status).bg,
                    color: getStatusStyle(selectedOrder.status).color
                  }}
                >
                  {selectedOrder.status}
                </span>
                <span className="text-xl font-bold text-white">{formatCurrency(selectedOrder.total)}</span>
              </div>

              {/* Customer Info */}
              <div className="rounded-xl p-5" style={{ backgroundColor: '#0f172a' }}>
                <h3 className="text-sm font-semibold text-white mb-4">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#64748b' }}>Name</p>
                    <p className="text-sm text-white">{selectedOrder.shipping_address?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#64748b' }}>Phone</p>
                    <p className="text-sm text-white">{selectedOrder.shipping_address?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs mb-1" style={{ color: '#64748b' }}>Address</p>
                    <p className="text-sm text-white">
                      {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-xl p-5" style={{ backgroundColor: '#0f172a' }}>
                <h3 className="text-sm font-semibold text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #334155' : 'none' }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg overflow-hidden"
                          style={{ backgroundColor: '#334155' }}
                        >
                          {item.image && (
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs" style={{ color: '#64748b' }}>Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-white">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier Options */}
              <div className="rounded-xl p-5" style={{ backgroundColor: '#0f172a' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Truck size={18} />
                  Courier Options
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: '#f97316', color: '#ffffff' }}
                  >
                    Pathao
                  </button>
                  <button 
                    className="py-3 rounded-lg text-sm font-medium transition-colors"
                    style={{ backgroundColor: '#8b5cf6', color: '#ffffff' }}
                  >
                    CarryBe
                  </button>
                </div>
                <p className="text-xs mt-3 text-center" style={{ color: '#64748b' }}>
                  API integration coming soon
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6" style={{ borderTop: '1px solid #334155' }}>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ backgroundColor: '#334155', color: '#94a3b8' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
