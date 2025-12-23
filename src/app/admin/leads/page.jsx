'use client';

import { useState, useEffect } from 'react';
import { Search, Phone, Mail, MapPin, ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, Trash2, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const statusColors = {
  new: { bg: '#FEF3C7', color: '#92400E', label: 'New' },
  contacted: { bg: '#DBEAFE', color: '#1E40AF', label: 'Contacted' },
  converted: { bg: '#D1FAE5', color: '#065F46', label: 'Converted' },
  lost: { bg: '#FEE2E2', color: '#991B1B', label: 'Lost' }
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, lost: 0 });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/leads/all', { params: { limit: 100 } });
      const leadsData = res.data.leads || [];
      setLeads(leadsData);
      
      // Calculate stats
      const newStats = {
        total: leadsData.length,
        new: leadsData.filter(l => l.status === 'new').length,
        contacted: leadsData.filter(l => l.status === 'contacted').length,
        converted: leadsData.filter(l => l.status === 'converted').length,
        lost: leadsData.filter(l => l.status === 'lost').length
      };
      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await api.put(`/orders/leads/${leadId}/status`, { status: newStatus });
      toast.success('Lead status updated');
      fetchLeads();
      setSelectedLead(null);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteLead = async (leadId) => {
    if (!confirm('Delete this lead?')) return;
    
    try {
      await api.delete(`/orders/leads/${leadId}`);
      toast.success('Lead deleted');
      fetchLeads();
      setSelectedLead(null);
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const formatPrice = (price) => '৳' + (price || 0).toLocaleString('en-BD');
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (lead.phone || '').includes(searchQuery) ||
      (lead.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && lead.status === filterStatus;
  });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Leads</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>Abandoned checkouts - customers who filled form but didn't order</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>Total Leads</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{stats.total}</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertCircle size={16} style={{ color: '#f59e0b' }} />
            <p style={{ fontSize: 13, color: '#9ca3af' }}>New</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{stats.new}</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <MessageCircle size={16} style={{ color: '#3b82f6' }} />
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Contacted</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{stats.contacted}</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <CheckCircle size={16} style={{ color: '#10b981' }} />
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Converted</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{stats.converted}</p>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <XCircle size={16} style={{ color: '#ef4444' }} />
            <p style={{ fontSize: 13, color: '#9ca3af' }}>Lost</p>
          </div>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>{stats.lost}</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: 10,
              color: '#fff',
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '12px 20px',
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 10,
            color: '#fff',
            fontSize: 14,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Leads Table */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Customer</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Contact</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Cart Value</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Date</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 60, textAlign: 'center', color: '#6b7280' }}>
                  {searchQuery || filterStatus !== 'all' ? 'No leads found' : 'No abandoned checkouts yet'}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const status = statusColors[lead.status] || statusColors.new;
                return (
                  <tr 
                    key={lead._id} 
                    style={{ borderBottom: '1px solid #374151', cursor: 'pointer' }}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{lead.name || 'Unknown'}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>{lead.delivery_zone || 'N/A'}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={14} /> {lead.phone}
                      </p>
                      {lead.email && (
                        <p style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Mail size={12} /> {lead.email}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>{formatPrice(lead.cart_total)}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>{lead.cart_items?.length || 0} items</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontSize: 13, color: '#9ca3af' }}>{formatDate(lead.updated_at || lead.created_at)}</p>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        backgroundColor: status.bg,
                        color: status.color,
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 20
                      }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLead(lead._id); }}
                        style={{
                          padding: 8,
                          backgroundColor: '#374151',
                          border: 'none',
                          borderRadius: 6,
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100
          }}
          onClick={() => setSelectedLead(null)}
        >
          <div 
            style={{
              backgroundColor: '#1f2937',
              borderRadius: 16,
              width: '100%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '24px 24px 0' }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Lead Details</h2>
              <p style={{ fontSize: 13, color: '#6b7280' }}>Abandoned checkout information</p>
            </div>

            {/* Customer Info */}
            <div style={{ padding: 24, borderBottom: '1px solid #374151' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', marginBottom: 16 }}>Customer Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Name</p>
                  <p style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>{selectedLead.name || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Phone</p>
                  <p style={{ fontSize: 15, color: '#fff', fontWeight: 500 }}>{selectedLead.phone}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Email</p>
                  <p style={{ fontSize: 15, color: '#fff' }}>{selectedLead.email || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Delivery Zone</p>
                  <p style={{ fontSize: 15, color: '#fff' }}>{selectedLead.delivery_zone || 'N/A'}</p>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Address</p>
                  <p style={{ fontSize: 15, color: '#fff' }}>{selectedLead.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div style={{ padding: 24, borderBottom: '1px solid #374151' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', marginBottom: 16 }}>Cart Items</h3>
              {selectedLead.cart_items?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedLead.cart_items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: 14, color: '#fff' }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>Qty: {item.quantity}</p>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid #374151', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Total</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{formatPrice(selectedLead.cart_total)}</p>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>No cart items</p>
              )}
            </div>

            {/* Status Update */}
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#9ca3af', marginBottom: 16 }}>Update Status</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {Object.entries(statusColors).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => updateLeadStatus(selectedLead._id, key)}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: selectedLead.status === key ? value.bg : '#374151',
                      color: selectedLead.status === key ? value.color : '#9ca3af',
                      border: selectedLead.status === key ? `2px solid ${value.color}` : '1px solid #4b5563',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {value.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '0 24px 24px', display: 'flex', gap: 12 }}>
              <button
                onClick={() => setSelectedLead(null)}
                style={{
                  flex: 1,
                  padding: 14,
                  backgroundColor: '#374151',
                  color: '#9ca3af',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              <a
                href={`tel:${selectedLead.phone}`}
                style={{
                  flex: 1,
                  padding: 14,
                  backgroundColor: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Phone size={18} /> Call Now
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
