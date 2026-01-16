'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Download, Eye, X, Phone, MapPin, Mail, User, Calendar,
  ShoppingBag, TrendingUp, Crown, Star, Users, Gift, 
  FileText, RefreshCw, Edit2, Check, Package, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const SEGMENT_COLORS = {
  general: { bg: '#6B7280', text: '#FFFFFF', label: 'General', icon: User },
  preferred: { bg: '#3B82F6', text: '#FFFFFF', label: 'Preferred', icon: Star },
  elite: { bg: '#B08B5C', text: '#FFFFFF', label: 'Elite', icon: Crown }
};

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', color: '#92400E' },
  confirmed: { bg: '#DBEAFE', color: '#1E40AF' },
  processing: { bg: '#E0E7FF', color: '#3730A3' },
  shipped: { bg: '#D1FAE5', color: '#065F46' },
  delivered: { bg: '#10B981', color: '#FFFFFF' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' }
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [filterSegment, setFilterSegment] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [sortBy, setSortBy] = useState('spent');
  const [stats, setStats] = useState({
    total_customers: 0, general_count: 0, preferred_count: 0, elite_count: 0,
    with_account: 0, guests: 0, total_revenue: 0, new_this_month: 0
  });
  
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingBirthday, setEditingBirthday] = useState(false);
  const [editingSegment, setEditingSegment] = useState(false);
  const [tempNotes, setTempNotes] = useState('');
  const [tempBirthday, setTempBirthday] = useState('');
  const [tempSegment, setTempSegment] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => { fetchCustomers(); }, [filterSegment, filterAccount, sortBy]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = { limit: 100, sort: sortBy };
      if (filterSegment !== 'all') params.segment = filterSegment;
      if (filterAccount === 'registered') params.has_account = true;
      if (filterAccount === 'guest') params.has_account = false;
      if (searchQuery) params.search = searchQuery;
      
      const res = await api.get('/customers', { params });
      setCustomers(res.data.customers || []);
      setStats(res.data.stats || stats);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (customerId) => {
    try {
      setLoadingDetail(true);
      const res = await api.get(`/customers/${customerId}`);
      setCustomerDetail(res.data);
    } catch (error) {
      toast.error('Failed to load customer details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const openCustomerModal = (customer) => {
    setSelectedCustomer(customer);
    setCustomerDetail(null);
    fetchCustomerDetail(customer.customer_id || customer._id);
  };

  const syncCustomers = async () => {
    try {
      setSyncing(true);
      await api.post('/customers/sync');
      toast.success('Customers synced from orders');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to sync customers');
    } finally {
      setSyncing(false);
    }
  };

  const updateCustomer = async (customerId, data) => {
    try {
      const res = await api.put(`/customers/${customerId}`, data);
      toast.success('Customer updated');
      setCustomers(prev => prev.map(c => c.customer_id === customerId ? { ...c, ...res.data } : c));
      if (customerDetail?.customer_id === customerId) {
        setCustomerDetail({ ...customerDetail, ...res.data });
      }
      setEditingNotes(false);
      setEditingBirthday(false);
      setEditingSegment(false);
    } catch (error) {
      toast.error('Failed to update customer');
    }
  };

  const downloadCustomers = async (segment = null) => {
    try {
      const url = segment ? `/customers/download/csv?segment=${segment}` : '/customers/download/csv';
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `customers_${segment || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const formatCurrency = (amount) => '৳' + (amount || 0).toLocaleString('en-BD');
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-BD', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return customer.name?.toLowerCase().includes(q) || customer.phone?.includes(q) || customer.email?.toLowerCase().includes(q) || customer.customer_id?.toLowerCase().includes(q);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Customers</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage customer segments, notes, and download data</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={syncCustomers} disabled={syncing} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: syncing ? 'not-allowed' : 'pointer', opacity: syncing ? 0.7 : 1 }}>
            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing...' : 'Sync Orders'}
          </button>
          <button onClick={() => downloadCustomers()} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            <Download size={16} /> Export All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} style={{ color: '#9ca3af' }} /></div>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Total Customers</p>
          </div>
          <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{stats.total_customers}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{stats.new_this_month} new this month</p>
        </div>
        {['general', 'preferred', 'elite'].map(seg => {
          const segData = SEGMENT_COLORS[seg];
          const Icon = segData.icon;
          const count = stats[`${seg}_count`] || 0;
          return (
            <div key={seg} onClick={() => setFilterSegment(filterSegment === seg ? 'all' : seg)} style={{ backgroundColor: filterSegment === seg ? '#374151' : '#1f2937', borderRadius: 12, padding: 20, cursor: 'pointer', border: filterSegment === seg ? `2px solid ${segData.bg}` : '2px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: segData.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} style={{ color: '#fff' }} /></div>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>{segData.label}</p>
              </div>
              <p style={{ fontSize: 32, fontWeight: 700, color: segData.bg }}>{count}</p>
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{seg === 'general' ? '1 order' : seg === 'preferred' ? '2 orders' : '3+ orders'}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input type="text" placeholder="Search by name, phone, email, or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchCustomers()} style={{ width: '100%', padding: '12px 12px 12px 44px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
        </div>
        <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} style={{ padding: '12px 20px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Types</option>
          <option value="registered">Registered</option>
          <option value="guest">Guest</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '12px 20px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', cursor: 'pointer' }}>
          <option value="spent">Sort: Highest Spent</option>
          <option value="orders">Sort: Most Orders</option>
          <option value="recent">Sort: Most Recent</option>
          <option value="name">Sort: Name A-Z</option>
        </select>
        <select onChange={(e) => { if (e.target.value) { downloadCustomers(e.target.value === 'all' ? null : e.target.value); e.target.value = ''; } }} style={{ padding: '12px 20px', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: 10, color: '#fff', fontSize: 14, cursor: 'pointer' }}>
          <option value="">Download CSV...</option>
          <option value="all">All Customers</option>
          <option value="general">General Only</option>
          <option value="preferred">Preferred Only</option>
          <option value="elite">Elite Only</option>
        </select>
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
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Customer ID</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Email</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Segment</th>
                <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Orders</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Spent</th>
                <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const segment = SEGMENT_COLORS[customer.segment] || SEGMENT_COLORS.general;
                const SegmentIcon = segment.icon;
                return (
                  <tr key={customer._id} style={{ borderTop: '1px solid #374151' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#9ca3af', backgroundColor: '#374151', padding: '4px 8px', borderRadius: 4 }}>{customer.customer_id}</span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: segment.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>{customer.name?.charAt(0).toUpperCase() || 'C'}</div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{customer.name}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <span style={{ fontSize: 12, color: '#9ca3af' }}>{customer.phone}</span>
                            <span style={{ fontSize: 10, padding: '2px 6px', backgroundColor: customer.has_account ? '#10b98120' : '#f59e0b20', color: customer.has_account ? '#10b981' : '#f59e0b', borderRadius: 10 }}>{customer.has_account ? 'Registered' : 'Guest'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ fontSize: 13, color: customer.email ? '#9ca3af' : '#4b5563' }}>{customer.email || 'N/A'}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', backgroundColor: segment.bg, color: segment.text, fontSize: 12, fontWeight: 600, borderRadius: 20 }}><SegmentIcon size={14} />{segment.label}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, padding: '6px 14px', backgroundColor: '#374151', color: '#fff', borderRadius: 20 }}>{customer.total_orders}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{formatCurrency(customer.total_spent)}</span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button onClick={() => openCustomerModal(customer)} style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#3b82f6' }}><Eye size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: 80, textAlign: 'center' }}>
            <User size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No customers found</p>
            <p style={{ fontSize: 14, color: '#6b7280' }}>Try syncing from orders or adjusting filters</p>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1f2937', borderRadius: 20 }}>
            {loadingDetail ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 100 }}>
                <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : customerDetail ? (
              <>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: SEGMENT_COLORS[customerDetail.segment]?.bg || '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 24 }}>{customerDetail.name?.charAt(0).toUpperCase() || 'C'}</div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>{customerDetail.name}</h2>
                      <p style={{ fontSize: 13, color: '#6b7280' }}>{customerDetail.customer_id} • Since {formatDate(customerDetail.join_date)}</p>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedCustomer(null); setCustomerDetail(null); }} style={{ padding: 12, backgroundColor: '#374151', borderRadius: 10, border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
                </div>

                <div style={{ padding: 24 }}>
                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                      <ShoppingBag size={24} style={{ color: '#3b82f6', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Orders</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{customerDetail.total_orders}</p>
                    </div>
                    <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                      <TrendingUp size={24} style={{ color: '#10b981', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Total Spent</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{formatCurrency(customerDetail.total_spent)}</p>
                    </div>
                    <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                      <Calendar size={24} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Avg Order</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{formatCurrency(Math.round(customerDetail.total_spent / (customerDetail.total_orders || 1)))}</p>
                    </div>
                    <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 20, textAlign: 'center', position: 'relative' }}>
                      {editingSegment ? (
                        <div>
                          <select value={tempSegment} onChange={(e) => setTempSegment(e.target.value)} style={{ width: '100%', padding: 8, backgroundColor: '#374151', border: 'none', borderRadius: 6, color: '#fff', marginBottom: 8 }}>
                            <option value="general">General</option>
                            <option value="preferred">Preferred</option>
                            <option value="elite">Elite</option>
                          </select>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                            <button onClick={() => updateCustomer(customerDetail.customer_id, { segment: tempSegment })} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}><Check size={14} /></button>
                            <button onClick={() => setEditingSegment(false)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}><X size={14} /></button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Crown size={24} style={{ color: SEGMENT_COLORS[customerDetail.segment]?.bg || '#6B7280', margin: '0 auto 8px' }} />
                          <p style={{ fontSize: 12, color: '#6b7280' }}>Segment</p>
                          <p style={{ fontSize: 20, fontWeight: 700, color: SEGMENT_COLORS[customerDetail.segment]?.bg || '#6B7280' }}>{SEGMENT_COLORS[customerDetail.segment]?.label || 'General'}</p>
                          <button onClick={() => { setEditingSegment(true); setTempSegment(customerDetail.segment); }} style={{ position: 'absolute', top: 10, right: 10, padding: 6, backgroundColor: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={12} /></button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Contact Info</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Phone size={18} style={{ color: '#3b82f6' }} />
                        <span style={{ color: '#fff' }}>{customerDetail.phone}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Mail size={18} style={{ color: '#10b981' }} />
                        <span style={{ color: customerDetail.email ? '#fff' : '#6b7280' }}>{customerDetail.email || 'Not provided'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, gridColumn: 'span 2' }}>
                        <MapPin size={18} style={{ color: '#f59e0b', marginTop: 2 }} />
                        <div>
                          <span style={{ color: customerDetail.address?.address ? '#fff' : '#6b7280' }}>
                            {customerDetail.address?.address || 'No address'}
                            {customerDetail.address?.area ? `, ${customerDetail.address.area}` : ''}
                            {customerDetail.address?.district ? `, ${customerDetail.address.district}` : ''}
                          </span>
                          {customerDetail.address?.delivery_zone && (
                            <span style={{ display: 'block', fontSize: 12, color: '#6b7280', marginTop: 4 }}>Zone: {customerDetail.address.delivery_zone}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Birthday */}
                  <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><Gift size={18} style={{ color: '#ec4899' }} />Birthday</h3>
                      {!editingBirthday && <button onClick={() => { setEditingBirthday(true); setTempBirthday(customerDetail.birthday || ''); }} style={{ padding: 8, backgroundColor: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={14} /></button>}
                    </div>
                    {editingBirthday ? (
                      <div style={{ display: 'flex', gap: 12 }}>
                        <input type="text" value={tempBirthday} onChange={(e) => setTempBirthday(e.target.value)} placeholder="DD-MM or YYYY-MM-DD" style={{ flex: 1, padding: '10px 12px', backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: 8, color: '#fff', fontSize: 14 }} />
                        <button onClick={() => updateCustomer(customerDetail.customer_id, { birthday: tempBirthday })} style={{ padding: '10px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditingBirthday(false)} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#9ca3af', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    ) : (
                      <p style={{ fontSize: 15, color: customerDetail.birthday ? '#fff' : '#6b7280' }}>{customerDetail.birthday || 'Not set'}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18} style={{ color: '#8b5cf6' }} />Admin Notes</h3>
                      {!editingNotes && <button onClick={() => { setEditingNotes(true); setTempNotes(customerDetail.notes || ''); }} style={{ padding: 8, backgroundColor: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={14} /></button>}
                    </div>
                    {editingNotes ? (
                      <div>
                        <textarea value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} placeholder="Add notes..." style={{ width: '100%', padding: 12, backgroundColor: '#374151', border: '1px solid #4b5563', borderRadius: 8, color: '#fff', fontSize: 14, minHeight: 80, resize: 'vertical' }} />
                        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                          <button onClick={() => updateCustomer(customerDetail.customer_id, { notes: tempNotes })} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Save</button>
                          <button onClick={() => setEditingNotes(false)} style={{ padding: '10px 20px', backgroundColor: '#374151', color: '#9ca3af', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: customerDetail.notes ? '#d1d5db' : '#6b7280', whiteSpace: 'pre-wrap' }}>{customerDetail.notes || 'No notes'}</p>
                    )}
                  </div>

                  {/* Order History */}
                  <div style={{ backgroundColor: '#111827', borderRadius: 14, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Package size={18} style={{ color: '#3b82f6' }} />
                      Order History ({customerDetail.orders?.length || 0})
                    </h3>
                    {customerDetail.orders?.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {customerDetail.orders.map((order, i) => {
                          const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                          const isExpanded = expandedOrder === order._id;
                          return (
                            <div key={i} style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden' }}>
                              <div onClick={() => setExpandedOrder(isExpanded ? null : order._id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, cursor: 'pointer' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <div>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>#{order.order_number}</p>
                                    <p style={{ fontSize: 12, color: '#6b7280' }}>{formatDateTime(order.created_at)}</p>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                  <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>{formatCurrency(order.total)}</p>
                                    <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 20, backgroundColor: statusStyle.bg, color: statusStyle.color, textTransform: 'capitalize' }}>{order.status}</span>
                                  </div>
                                  {isExpanded ? <ChevronUp size={20} style={{ color: '#6b7280' }} /> : <ChevronDown size={20} style={{ color: '#6b7280' }} />}
                                </div>
                              </div>
                              {isExpanded && (
                                <div style={{ padding: '0 16px 16px', borderTop: '1px solid #374151' }}>
                                  <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: '12px 0 8px', textTransform: 'uppercase' }}>Products</p>
                                  {order.items?.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < order.items.length - 1 ? '1px solid #374151' : 'none' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {item.image && <img src={item.image} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />}
                                        <div>
                                          <p style={{ fontSize: 13, color: '#fff' }}>{item.name}</p>
                                          <p style={{ fontSize: 11, color: '#6b7280' }}>
                                            {item.variant?.size && `Size: ${item.variant.size}`}
                                            {item.variant?.color && ` • Color: ${item.variant.color}`}
                                          </p>
                                        </div>
                                      </div>
                                      <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 13, color: '#fff' }}>{formatCurrency(item.price)} × {item.quantity}</p>
                                        <p style={{ fontSize: 12, color: '#10b981' }}>{formatCurrency(item.price * item.quantity)}</p>
                                      </div>
                                    </div>
                                  ))}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid #374151' }}>
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>Payment: {order.payment_method?.toUpperCase()}</span>
                                    <span style={{ fontSize: 12, color: order.payment_status === 'paid' ? '#10b981' : '#f59e0b' }}>
                                      {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ color: '#6b7280', textAlign: 'center', padding: 20 }}>No orders found</p>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}
