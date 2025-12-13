'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, X, ShoppingBag, Phone, MapPin, Mail, Calendar } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/users/admin/customers');
      setCustomers(res.data || []);
    } catch (error) {
      // Fallback: get unique customers from orders
      try {
        const ordersRes = await api.get('/orders/admin/all?limit=500');
        const orders = ordersRes.data.orders || [];
        
        // Extract unique customers
        const customerMap = new Map();
        orders.forEach(order => {
          if (order.user_id && !customerMap.has(order.user_id)) {
            customerMap.set(order.user_id, {
              _id: order.user_id,
              name: order.shipping_address?.name || 'Unknown',
              email: order.user_email || '',
              phone: order.shipping_address?.phone || '',
              address: order.shipping_address,
              order_count: 0,
              total_spent: 0
            });
          }
          if (order.user_id) {
            const customer = customerMap.get(order.user_id);
            customer.order_count++;
            customer.total_spent += order.total || 0;
          }
        });
        
        setCustomers(Array.from(customerMap.values()));
      } catch (e) {
        setCustomers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    
    try {
      const res = await api.get(`/orders/admin/all?user_id=${customer._id}`);
      setCustomerOrders(res.data.orders || []);
    } catch (error) {
      setCustomerOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const exportCustomers = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'Orders', 'Total Spent'];
    const rows = filteredCustomers.map(c => [
      c.name || '',
      c.email || '',
      c.phone || c.address?.phone || '',
      c.address?.address || '',
      c.address?.city || '',
      c.order_count || 0,
      c.total_spent || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Customers exported');
  };

  const formatCurrency = (amount) => {
    return '৳' + (amount || 0).toLocaleString();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredCustomers = customers.filter(c => 
    (c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Customers</h1>
          <p className="text-sm text-muted mt-1">{customers.length} total customers</p>
        </div>
        <button
          onClick={exportCustomers}
          className="flex items-center gap-2 px-4 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Customers List */}
      {filteredCustomers.length > 0 ? (
        <div className="bg-white border border-primary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Customer</th>
                <th className="text-left p-4 text-sm font-medium hidden md:table-cell">Phone</th>
                <th className="text-left p-4 text-sm font-medium hidden lg:table-cell">Location</th>
                <th className="text-center p-4 text-sm font-medium">Orders</th>
                <th className="text-right p-4 text-sm font-medium">Total Spent</th>
                <th className="text-right p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-primary-50/50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{customer.name || 'Unknown'}</p>
                      <p className="text-sm text-muted">{customer.email}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-muted">
                    {customer.phone || customer.address?.phone || '-'}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-sm text-muted">
                    {customer.address?.city || '-'}
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-primary-100 px-2 py-1 text-sm rounded">
                      {customer.order_count || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium">
                    {formatCurrency(customer.total_spent)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => viewCustomerDetails(customer)}
                      className="p-2 text-muted hover:text-focus"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-primary-200 p-12 text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 text-muted opacity-50" />
          <p className="text-muted">No customers found</p>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-light">Customer Details</h2>
              <button onClick={() => setSelectedCustomer(null)} className="text-muted hover:text-focus">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded">
                  <Mail size={18} className="text-muted" />
                  <div>
                    <p className="text-xs text-muted">Email</p>
                    <p className="text-sm">{selectedCustomer.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded">
                  <Phone size={18} className="text-muted" />
                  <div>
                    <p className="text-xs text-muted">Phone</p>
                    <p className="text-sm">{selectedCustomer.phone || selectedCustomer.address?.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded">
                  <MapPin size={18} className="text-muted" />
                  <div>
                    <p className="text-xs text-muted">Address</p>
                    <p className="text-sm">
                      {selectedCustomer.address?.address ? 
                        `${selectedCustomer.address.address}, ${selectedCustomer.address.city}` : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded">
                  <ShoppingBag size={18} className="text-muted" />
                  <div>
                    <p className="text-xs text-muted">Total Orders</p>
                    <p className="text-sm font-medium">{selectedCustomer.order_count || 0}</p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <h3 className="font-medium mb-4">Order History</h3>
              
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : customerOrders.length > 0 ? (
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div key={order._id} className="border border-primary-200 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm">#{order.order_number || order._id.slice(-8)}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="font-medium text-focus">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center py-4">No orders found</p>
              )}
            </div>

            <div className="p-4 border-t">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-3 border border-primary-300 text-sm hover:border-focus transition-colors"
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
