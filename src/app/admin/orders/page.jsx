'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, Download, X, Truck, Package } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['all', 'pending', 'processing', 'delivered', 'cancelled'];

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
      toast.success('Status updated');
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      confirmed: 'bg-blue-500/20 text-blue-400',
      processing: 'bg-purple-500/20 text-purple-400',
      shipped: 'bg-indigo-500/20 text-indigo-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
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
    
    toast.success('Orders exported');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-white">Orders Management</h1>
        <button
          onClick={exportOrders}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
            className={`px-4 py-2 rounded text-sm capitalize transition-colors ${
              selectedStatus === status
                ? 'bg-blue-600 text-white'
                : 'bg-[#232a3b] text-gray-400 hover:text-white'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-[#232a3b] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Order ID</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Date</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Customer</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Amount</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Payment</th>
                <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                <th className="text-right p-4 text-gray-400 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-700/50 hover:bg-white/5">
                    <td className="p-4 text-white font-mono text-sm">
                      #{order.order_number || order._id.slice(-8)}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="p-4">
                      <p className="text-white text-sm">{order.shipping_address?.name || 'N/A'}</p>
                      <p className="text-gray-500 text-xs">{order.shipping_address?.phone}</p>
                    </td>
                    <td className="p-4 text-white font-medium">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300">
                        {order.payment_method || 'COD'}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#232a3b] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">
                Order #{selectedOrder.order_number || selectedOrder._id.slice(-8)}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-sm px-3 py-1 rounded ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <span className="text-gray-400 text-sm">{formatDate(selectedOrder.created_at)}</span>
              </div>

              {/* Customer Info */}
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="text-white">{selectedOrder.shipping_address?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="text-white">{selectedOrder.shipping_address?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500">Address</p>
                    <p className="text-white">
                      {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.city}
                    </p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-700 rounded">
                          {item.image && (
                            <img src={item.image} alt="" className="w-full h-full object-cover rounded" />
                          )}
                        </div>
                        <div>
                          <p className="text-white text-sm">{item.name}</p>
                          <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-white text-sm">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <span className="text-white font-medium">Total</span>
                <span className="text-xl font-semibold text-white">{formatCurrency(selectedOrder.total)}</span>
              </div>

              {/* Courier Options */}
              <div className="bg-[#1a1f2e] rounded-lg p-4">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Truck size={18} />
                  Courier Options
                </h3>
                <div className="flex gap-3">
                  <button className="flex-1 py-2 bg-orange-500/20 text-orange-400 rounded text-sm hover:bg-orange-500/30">
                    Pathao
                  </button>
                  <button className="flex-1 py-2 bg-purple-500/20 text-purple-400 rounded text-sm hover:bg-purple-500/30">
                    CarryBe
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-2">API integration coming soon</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
