'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (filterStatus) params.append('status', filterStatus);

      const response = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.pages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
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

  const getStatusColor = (status) => {
    return statusOptions.find(s => s.value === status)?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        
        {/* Filter */}
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setPage(1);
          }}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          {statusOptions.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-primary-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted">Order #</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted">Date</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted">Customer</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted">Total</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted">Status</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-primary-50">
                  <td className="px-6 py-4 font-medium">{order.order_number}</td>
                  <td className="px-6 py-4 text-muted">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <p>{order.shipping_address?.phone}</p>
                    <p className="text-sm text-muted">{order.shipping_address?.city}</p>
                  </td>
                  <td className="px-6 py-4 font-medium">৳{order.total.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className={`text-sm px-2 py-1 rounded border-0 cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      {statusOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-primary-100 rounded"
                    >
                      <Eye size={18} className="text-blue-600" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted">
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded ${
                  page === p ? 'bg-gold text-white' : 'bg-primary-100 hover:bg-primary-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Order {selectedOrder.order_number}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted hover:text-focus"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <span className="text-muted text-sm">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>

              {/* Items */}
              <div>
                <h3 className="font-medium mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b">
                      <span>{item.name} × {item.quantity}</span>
                      <span>৳{item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-primary-50 p-4 rounded">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>৳{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>৳{selectedOrder.shipping_cost}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-gold">৳{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-medium mb-3">Shipping Address</h3>
                <div className="text-muted">
                  <p>{selectedOrder.shipping_address.street}</p>
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                  <p>{selectedOrder.shipping_address.postal_code}</p>
                  <p className="mt-2 font-medium text-focus">
                    Phone: {selectedOrder.shipping_address.phone}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div>
                <h3 className="font-medium mb-3">Payment</h3>
                <p className="capitalize">{selectedOrder.payment_method}</p>
                <p className="text-sm text-muted capitalize">
                  Status: {selectedOrder.payment_status}
                </p>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-medium mb-3">Notes</h3>
                  <p className="text-muted">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
