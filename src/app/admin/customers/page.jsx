'use client';

import { useState, useEffect } from 'react';
import { Search, Download, Eye, X, Phone, MapPin, Mail, User, DollarSign, TrendingUp, ShoppingBag, Calendar, Filter } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('spent');
  const [stats, setStats] = useState({ totalCustomers: 0, totalRevenue: 0, avgOrderValue: 0, newThisMonth: 0 });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      
      // Fetch orders with proper endpoint
      const ordersRes = await api.get('/orders/admin/all', {
        params: { limit: 1000, page: 1 }
      });
      
      // Extract orders array from response
      let orders = ordersRes.data?.orders || ordersRes.data || [];
      
      if (!Array.isArray(orders)) {
        orders = [];
      }

      console.log('Orders fetched:', orders.length);

      // Extract customers from orders
      const customerMap = new Map();

      orders.forEach(order => {
        // Get phone from shipping_address
        const phone = order.shipping_address?.phone || '';
        
        if (!phone || phone.length < 5) return;

        // Clean phone number for unique ID
        const cleanPhone = phone.replace(/\D/g, '').slice(-11);
        
        // Get customer details from order
        const street = order.shipping_address?.street || '';
        const city = order.shipping_address?.city || '';
        const state = order.shipping_address?.state || '';
        
        // Try to get name from notes or use phone as identifier
        const name = order.customer_name || order.notes?.split(',')[0] || `Customer ${cleanPhone.slice(-4)}`;
        
        // Check if guest
        const isGuest = !order.user_id || order.user_id === 'guest';

        if (!customerMap.has(cleanPhone)) {
          customerMap.set(cleanPhone, {
            _id: cleanPhone,
            name: name,
            email: '',
            phone: phone,
            address: street,
            city: city,
            state: state,
            is_guest: isGuest,
            user_id: order.user_id || null,
            order_count: 0,
            total_spent: 0,
            last_order_date: null,
            first_order_date: null,
            orders: [],
            statuses: {
              pending: 0,
              confirmed: 0,
              processing: 0,
              shipped: 0,
              delivered: 0,
              cancelled: 0
            }
          });
        }

        const customer = customerMap.get(cleanPhone);
        
        // Update with better data if available
        if (order.customer_name && customer.name.startsWith('Customer')) {
          customer.name = order.customer_name;
        }
        if (street && !customer.address) customer.address = street;
        if (city && !customer.city) customer.city = city;

        // Count orders and revenue
        customer.order_count++;
        customer.total_spent += (order.total || 0);
        customer.orders.push(order);

        // Track status
        const status = (order.status || 'pending').toLowerCase();
        if (customer.statuses[status] !== undefined) {
          customer.statuses[status]++;
        }

        // Track dates
        const orderDate = new Date(order.created_at);
        if (!isNaN(orderDate)) {
          if (!customer.last_order_date || orderDate > new Date(customer.last_order_date)) {
            customer.last_order_date = order.created_at;
          }
          if (!customer.first_order_date || orderDate < new Date(customer.first_order_date)) {
            customer.first_order_date = order.created_at;
          }
        }
      });

      const customerList = Array.from(customerMap.values());
      console.log('Customers extracted:', customerList.length);

      customerList.sort((a, b) => b.total_spent - a.total_spent);
      setCustomers(customerList);

      // Calculate stats
      const totalRevenue = customerList.reduce((sum, c) => sum + c.total_spent, 0);
      const totalOrders = customerList.reduce((sum, c) => sum + c.order_count, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      const newCustomers = customerList.filter(c => 
        c.first_order_date && new Date(c.first_order_date) >= thisMonth
      ).length;

      setStats({
        totalCustomers: customerList.length,
        totalRevenue: totalRevenue,
        avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
        newThisMonth: newCustomers
      });

    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString();
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d)) return 'N/A';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#b45309' },
      confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
      processing: { bg: '#ede9fe', color: '#7c3aed' },
      shipped: { bg: '#cffafe', color: '#0891b2' },
      delivered: { bg: '#d1fae5', color: '#059669' },
      cancelled: { bg: '#fee2e2', color: '#dc2626' }
    };
    return styles[status?.toLowerCase()] || { bg: '#f3f4f6', color: '#6b7280' };
  };

  const exportAllCustomers = () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers to export');
      return;
    }
    
    const headers = ['Name', 'Phone', 'Address', 'City', 'Type', 'Total Orders', 'Total Spent (BDT)', 'First Order', 'Last Order'];
    const rows = filteredCustomers.map(c => [
      c.name,
      c.phone,
      c.address || 'N/A',
      c.city || 'N/A',
      c.is_guest ? 'Guest' : 'Registered',
      c.order_count,
      c.total_spent,
      formatDate(c.first_order_date),
      formatDate(c.last_order_date)
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success(`Exported ${filteredCustomers.length} customers`);
  };

  const exportSingleCustomer = (customer) => {
    const headers = ['Order ID', 'Amount (BDT)', 'Status', 'Date'];
    const rows = customer.orders.map(o => [
      o.order_number || o._id?.slice(-8) || 'N/A',
      o.total || 0,
      o.status || 'pending',
      formatDate(o.created_at)
    ]);

    let csv = `Customer Details\n`;
    csv += `Name: ${customer.name}\n`;
    csv += `Phone: ${customer.phone}\n`;
    csv += `Address: ${customer.address || 'N/A'}, ${customer.city || ''}\n`;
    csv += `Type: ${customer.is_guest ? 'Guest' : 'Registered'}\n`;
    csv += `Total Orders: ${customer.order_count}\n`;
    csv += `Total Spent: ${formatCurrency(customer.total_spent)}\n\n`;
    csv += `Order History:\n`;
    csv += [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `customer-${customer.phone}.csv`;
    a.click();
    toast.success('Customer data exported');
  };

  // Filter and sort
  let filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      (c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (c.phone || '').includes(searchQuery) ||
      (c.city?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'guest') return matchesSearch && c.is_guest;
    if (filterType === 'registered') return matchesSearch && !c.is_guest;
    if (filterType === 'repeat') return matchesSearch && c.order_count > 1;
    return matchesSearch;
  });

  if (sortBy === 'spent') {
    filteredCustomers.sort((a, b) => b.total_spent - a.total_spent);
  } else if (sortBy === 'orders') {
    filteredCustomers.sort((a, b) => b.order_count - a.order_count);
  } else if (sortBy === 'recent') {
    filteredCustomers.sort((a, b) => new Date(b.last_order_date) - new Date(a.last_order_date));
  } else if (sortBy === 'name') {
    filteredCustomers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Customers</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>All customers from orders</p>
        </div>
        <button onClick={exportAllCustomers} disabled={filteredCustomers.length === 0} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', backgroundColor: filteredCustomers.length > 0 ? '#10b981' : '#374151', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: filteredCustomers.length > 0 ? 'pointer' : 'not-allowed' }}>
          <Download size={20} />
          Export ({filteredCustomers.length})
        </button>
      </div>

      {/* Stats */}
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
              <Calendar size={28} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 250 }}>
            <Search size={20} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input type="text" placeholder="Search by name, phone, city..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '14px 16px 14px 48px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Filter size={18} style={{ color: '#6b7280' }} />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '14px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
              <option value="all">All Customers</option>
              <option value="registered">Registered Only</option>
              <option value="guest">Guests Only</option>
              <option value="repeat">Repeat Customers</option>
            </select>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '14px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
            <option value="spent">Sort: Highest Spent</option>
            <option value="orders">Sort: Most Orders</option>
            <option value="recent">Sort: Most Recent</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Location</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Orders</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Spent</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer, index) => (
                <tr key={customer._id} style={{ borderTop: '1px solid #374151' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
                        {customer.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{customer.name}</p>
                        <span style={{ fontSize: 11, padding: '2px 8px', backgroundColor: customer.is_guest ? '#f59e0b20' : '#10b98120', color: customer.is_guest ? '#f59e0b' : '#10b981', borderRadius: 10 }}>
                          {customer.is_guest ? 'Guest' : 'Registered'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14, color: '#fff' }}>{customer.phone}</td>
                  <td style={{ padding: '16px 24px', fontSize: 14, color: '#9ca3af' }}>{customer.city || 'N/A'}</td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, padding: '6px 14px', backgroundColor: '#374151', color: '#fff', borderRadius: 20 }}>{customer.order_count}</span>
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
            <p style={{ fontSize: 14, color: '#6b7280' }}>Customers will appear here once orders are placed</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1f2937', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24 }}>
                  {selectedCustomer.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{selectedCustomer.name}</h2>
                  <p style={{ fontSize: 13, color: '#6b7280' }}>Since {formatDate(selectedCustomer.first_order_date)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} style={{ padding: 12, backgroundColor: '#374151', borderRadius: 10, border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <ShoppingBag size={24} style={{ color: '#3b82f6', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Orders</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{selectedCustomer.order_count}</p>
                </div>
                <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <DollarSign size={24} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Total Spent</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{formatCurrency(selectedCustomer.total_spent)}</p>
                </div>
                <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                  <TrendingUp size={24} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Avg Order</p>
                  <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{formatCurrency(Math.round(selectedCustomer.total_spent / selectedCustomer.order_count))}</p>
                </div>
              </div>

              {/* Contact */}
              <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Contact Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Phone size={18} style={{ color: '#3b82f6' }} />
                    <span style={{ color: '#fff' }}>{selectedCustomer.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MapPin size={18} style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#9ca3af' }}>{selectedCustomer.address || 'N/A'}{selectedCustomer.city ? `, ${selectedCustomer.city}` : ''}</span>
                  </div>
                </div>
              </div>

              {/* Orders */}
              <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Order History ({selectedCustomer.orders.length})</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedCustomer.orders.map((order, i) => {
                    const st = getStatusStyle(order.status);
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#1f2937', borderRadius: 12 }}>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>#{order.order_number || order._id?.slice(-8)}</p>
                          <p style={{ fontSize: 12, color: '#6b7280' }}>{formatDate(order.created_at)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{formatCurrency(order.total)}</p>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, backgroundColor: st.bg, color: st.color, textTransform: 'capitalize' }}>{order.status || 'pending'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
