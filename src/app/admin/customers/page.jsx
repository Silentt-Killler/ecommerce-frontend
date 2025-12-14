'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, X, ShoppingBag, Phone, MapPin, Mail, Calendar, User, DollarSign, Package, TrendingUp } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const ordersRes = await api.get('/orders/admin/all?limit=500');
      const orders = ordersRes.data.orders || [];
      
      // Extract unique customers with their purchase details
      const customerMap = new Map();
      orders.forEach(order => {
        const oderId = order.user_id || order.shipping_address?.phone;
        if (!oderId) return;
        
        if (!customerMap.has(oderId)) {
          customerMap.set(oderId, {
            _id: oderId,
            name: order.shipping_address?.name || 'Unknown',
            email: order.user_email || order.shipping_address?.email || '',
            phone: order.shipping_address?.phone || '',
            address: order.shipping_address?.address || '',
            city: order.shipping_address?.city || '',
            order_count: 0,
            total_spent: 0,
            last_order_date: order.created_at,
            first_order_date: order.created_at,
            orders: []
          });
        }
        
        const customer = customerMap.get(oderId);
        customer.order_count++;
        customer.total_spent += order.total || 0;
        customer.orders.push(order);
        
        if (new Date(order.created_at) > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at;
        }
        if (new Date(order.created_at) < new Date(customer.first_order_date)) {
          customer.first_order_date = order.created_at;
        }
      });
      
      const customerList = Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent);
      setCustomers(customerList);

      // Calculate stats
      const totalRevenue = customerList.reduce((sum, c) => sum + c.total_spent, 0);
      const totalOrders = customerList.reduce((sum, c) => sum + c.order_count, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newCustomers = customerList.filter(c => new Date(c.first_order_date) >= thisMonth).length;

      setStats({
        totalCustomers: customerList.length,
        totalRevenue: totalRevenue,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        newThisMonth: newCustomers
      });

    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewCustomerDetails = (customer) => {
    setSelectedCustomer(customer);
    setCustomerOrders(customer.orders || []);
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

  const exportCustomers = () => {
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'Total Orders', 'Total Spent', 'First Order', 'Last Order'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.email,
      c.phone,
      c.address,
      c.city,
      c.order_count,
      c.total_spent,
      formatDate(c.first_order_date),
      formatDate(c.last_order_date)
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Customers exported successfully');
  };

  const exportSingleCustomer = (customer) => {
    const data = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: `${customer.address}, ${customer.city}`,
      total_orders: customer.order_count,
      total_spent: customer.total_spent,
      orders: customer.orders.map(o => ({
        order_id: o.order_number || o._id.slice(-8),
        amount: o.total,
        status: o.status,
        date: formatDate(o.created_at)
      }))
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer-${customer.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Customer data exported');
  };

  const filteredCustomers = customers.filter(c =>
    (c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Customers</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>View and manage your customers</p>
        </div>
        <button
          onClick={exportCustomers}
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
          Export All
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Total Customers</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.totalCustomers}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#3b82f620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Total Revenue</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#10b98120', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Avg. Order Value</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{formatCurrency(stats.avgOrderValue)}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#f59e0b20', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>New This Month</p>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.newThisMonth}</p>
            </div>
            <div style={{ width: 48, height: 48, backgroundColor: '#8b5cf620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              backgroundColor: '#111827',
              border: '1px solid #374151',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Customers Table */}
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
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Orders</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Spent</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Order</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => (
                  <tr key={customer._id} style={{ borderTop: '1px solid #374151' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: 16
                        }}>
                          {customer.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{customer.name}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>Customer</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, color: '#fff', marginBottom: 2 }}>{customer.phone}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>{customer.email || 'No email'}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, color: '#9ca3af' }}>{customer.city || 'N/A'}</p>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: 14,
                        fontWeight: 600,
                        padding: '6px 14px',
                        backgroundColor: '#374151',
                        color: '#fff',
                        borderRadius: 20
                      }}>
                        {customer.order_count}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{formatCurrency(customer.total_spent)}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: 14, color: '#9ca3af' }}>{formatDate(customer.last_order_date)}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                        <button
                          onClick={() => viewCustomerDetails(customer)}
                          style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex' }}
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => exportSingleCustomer(customer)}
                          style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#10b981', display: 'flex' }}
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} style={{ padding: 80, textAlign: 'center' }}>
                      <User size={64} style={{ color: '#374151', marginBottom: 16 }} />
                      <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No customers found</p>
                      <p style={{ fontSize: 14, color: '#6b7280' }}>Customers will appear here once they make purchases</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1f2937', borderRadius: 20 }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 24
                }}>
                  {selectedCustomer.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{selectedCustomer.name}</h2>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>Customer since {formatDate(selectedCustomer.first_order_date)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => exportSingleCustomer(selectedCustomer)}
                  style={{ padding: 10, backgroundColor: '#10b981', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#fff', display: 'flex' }}
                >
                  <Download size={20} />
                </button>
                <button onClick={() => setSelectedCustomer(null)} style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              {/* Customer Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Total Orders</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{selectedCustomer.order_count}</p>
                </div>
                <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Total Spent</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#10b981' }}>{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
                <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Avg. Order</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{formatCurrency(Math.round(selectedCustomer.total_spent / selectedCustomer.order_count))}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Contact Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, backgroundColor: '#374151', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={18} style={{ color: '#3b82f6' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Phone</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, backgroundColor: '#374151', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={18} style={{ color: '#10b981' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Email</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{selectedCustomer.email || 'Not provided'}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, gridColumn: 'span 2' }}>
                    <div style={{ width: 40, height: 40, backgroundColor: '#374151', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={18} style={{ color: '#f59e0b' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Address</p>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{selectedCustomer.address}, {selectedCustomer.city}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Order History</h3>
                {customerOrders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {customerOrders.map((order, index) => {
                      const statusStyle = getStatusStyle(order.status);
                      return (
                        <div key={order._id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 16,
                          backgroundColor: '#1f2937',
                          borderRadius: 10
                        }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                              #{order.order_number || order._id.slice(-8)}
                            </p>
                            <p style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(order.created_at)}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{formatCurrency(order.total)}</p>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: '4px 10px',
                              borderRadius: 20,
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              textTransform: 'capitalize'
                            }}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ textAlign: 'center', color: '#6b7280', padding: 24 }}>No orders found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
