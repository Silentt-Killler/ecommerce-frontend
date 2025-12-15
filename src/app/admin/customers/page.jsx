'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, X, Phone, MapPin, Mail, User, DollarSign, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stats, setStats] = useState({ totalCustomers: 0, totalRevenue: 0, avgOrderValue: 0, newThisMonth: 0 });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const ordersRes = await api.get('/orders/admin/all?limit=1000');
      const orders = ordersRes.data.orders || ordersRes.data || [];
      
      const customerMap = new Map();
      orders.forEach(order => {
        const phone = order.shipping_address?.phone || order.phone || '';
        if (!phone) return;
        
        const customerId = phone.replace(/\D/g, '');
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            _id: customerId,
            name: order.shipping_address?.name || order.customer_name || 'Unknown',
            email: order.shipping_address?.email || order.email || order.user_email || '',
            phone: phone,
            address: order.shipping_address?.address || order.address || '',
            city: order.shipping_address?.city || order.city || '',
            order_count: 0,
            total_spent: 0,
            last_order_date: null,
            first_order_date: null,
            orders: []
          });
        }
        
        const customer = customerMap.get(customerId);
        customer.order_count++;
        customer.total_spent += (order.total || order.grand_total || 0);
        customer.orders.push(order);
        
        const orderDate = new Date(order.created_at || order.createdAt);
        if (!customer.last_order_date || orderDate > new Date(customer.last_order_date)) {
          customer.last_order_date = order.created_at || order.createdAt;
        }
        if (!customer.first_order_date || orderDate < new Date(customer.first_order_date)) {
          customer.first_order_date = order.created_at || order.createdAt;
        }
      });
      
      const customerList = Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent);
      setCustomers(customerList);

      const totalRevenue = customerList.reduce((sum, c) => sum + c.total_spent, 0);
      const totalOrders = customerList.reduce((sum, c) => sum + c.order_count, 0);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newCustomers = customerList.filter(c => c.first_order_date && new Date(c.first_order_date) >= thisMonth).length;

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

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

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

  const exportAllCustomers = () => {
    if (customers.length === 0) return toast.error('No customers to export');
    const headers = ['Name', 'Email', 'Phone', 'Address', 'City', 'Total Orders', 'Total Spent', 'First Order', 'Last Order'];
    const rows = customers.map(c => [c.name, c.email || 'N/A', c.phone, c.address || 'N/A', c.city || 'N/A', c.order_count, c.total_spent, formatDate(c.first_order_date), formatDate(c.last_order_date)]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${customers.length} customers`);
  };

  const exportSingleCustomer = (customer) => {
    const headers = ['Order ID', 'Amount', 'Status', 'Date'];
    const rows = customer.orders.map(o => [o.order_number || o._id?.slice(-8), o.total || 0, o.status || 'pending', formatDate(o.created_at)]);
    let csv = `Customer: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email || 'N/A'}\nTotal Orders: ${customer.order_count}\nTotal Spent: ${formatCurrency(customer.total_spent)}\n\nOrders:\n`;
    csv += [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `customer-${customer.phone}.csv`;
    a.click();
    toast.success('Exported');
  };

  const filteredCustomers = customers.filter(c =>
    (c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery)
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Customers</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>View and manage your customers</p>
        </div>
        <button onClick={exportAllCustomers} disabled={customers.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', backgroundColor: customers.length > 0 ? '#10b981' : '#374151', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: customers.length > 0 ? 'pointer' : 'not-allowed' }}>
          <Download size={20} />
          Export All ({customers.length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Total Customers</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{stats.totalCustomers}</p>
            </div>
            <div style={{ width: 56, height: 56, backgroundColor: '#3b82f620', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Total Revenue</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div style={{ width: 56, height: 56, backgroundColor: '#10b98120', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={28} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Avg. Order Value</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{formatCurrency(stats.avgOrderValue)}</p>
            </div>
            <div style={{ width: 56, height: 56, backgroundColor: '#f59e0b20', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={28} style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>New This Month</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{stats.newThisMonth}</p>
            </div>
            <div style={{ width: 56, height: 56, backgroundColor: '#8b5cf620', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input type="text" placeholder="Search by name, email, or phone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '14px 16px 14px 48px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
        </div>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 80 }}>
            <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : filteredCustomers.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#111827' }}>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Location</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Orders</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Total Spent</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr key={customer._id} style={{ borderTop: '1px solid #374151' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
                        {customer.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{customer.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>Since {formatDate(customer.first_order_date)}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <p style={{ fontSize: 14, color: '#fff' }}>{customer.phone}</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{customer.email || 'No email'}</p>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14, color: '#9ca3af' }}>{customer.city || 'N/A'}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, padding: '8px 16px', backgroundColor: '#374151', color: '#fff', borderRadius: 20 }}>{customer.order_count}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{formatCurrency(customer.total_spent)}</span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                      <button onClick={() => setSelectedCustomer(customer)} style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#3b82f6' }}><Eye size={18} /></button>
                      <button onClick={() => exportSingleCustomer(customer)} style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#10b981' }}><Download size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 80, textAlign: 'center' }}>
            <User size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No customers found</p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Customers will appear here once they make purchases</p>
          </div>
        )}
      </div>

      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1f2937', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24 }}>
                  {selectedCustomer.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{selectedCustomer.name}</h2>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>Customer since {formatDate(selectedCustomer.first_order_date)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => exportSingleCustomer(selectedCustomer)} style={{ padding: 12, backgroundColor: '#10b981', borderRadius: 10, border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}><Download size={18} /> Export</button>
                <button onClick={() => setSelectedCustomer(null)} style={{ padding: 12, backgroundColor: '#374151', borderRadius: 10, border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <ShoppingBag size={24} style={{ color: '#3b82f6', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Total Orders</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{selectedCustomer.order_count}</p>
                </div>
                <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <DollarSign size={24} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Total Spent</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
                <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <TrendingUp size={24} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Avg. Order</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{formatCurrency(Math.round(selectedCustomer.total_spent / selectedCustomer.order_count))}</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Contact Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, backgroundColor: '#1f2937', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={20} style={{ color: '#3b82f6' }} /></div>
                    <div><p style={{ fontSize: 12, color: '#6b7280' }}>Phone</p><p style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{selectedCustomer.phone}</p></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, backgroundColor: '#1f2937', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={20} style={{ color: '#10b981' }} /></div>
                    <div><p style={{ fontSize: 12, color: '#6b7280' }}>Email</p><p style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{selectedCustomer.email || 'Not provided'}</p></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, gridColumn: 'span 2' }}>
                    <div style={{ width: 44, height: 44, backgroundColor: '#1f2937', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={20} style={{ color: '#f59e0b' }} /></div>
                    <div><p style={{ fontSize: 12, color: '#6b7280' }}>Address</p><p style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>{selectedCustomer.address}{selectedCustomer.city ? `, ${selectedCustomer.city}` : ''}</p></div>
                  </div>
                </div>
              </div>
              <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Order History ({selectedCustomer.orders.length})</h3>
                {selectedCustomer.orders.map((order, i) => {
                  const st = getStatusStyle(order.status);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1f2937', borderRadius: 12, marginBottom: 12 }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>#{order.order_number || order._id?.slice(-8)}</p>
                        <p style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} />{formatDate(order.created_at)}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{formatCurrency(order.total)}</p>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, backgroundColor: st.bg, color: st.color, textTransform: 'capitalize' }}>{order.status || 'pending'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
