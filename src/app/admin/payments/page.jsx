'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign, Truck, CreditCard, Search, Download, RefreshCw, CheckCircle,
  Clock, AlertCircle, ChevronDown, X, Filter, Calendar, Check, Phone, MapPin
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'cod', label: 'COD Collection' },
  { id: 'bkash', label: 'bKash / Nagad' }
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  
  // COD Orders
  const [codOrders, setCodOrders] = useState([]);
  const [codTotal, setCodTotal] = useState(0);
  const [codTotals, setCodTotals] = useState({});
  const [codPage, setCodPage] = useState(1);
  
  // bKash Orders
  const [bkashOrders, setBkashOrders] = useState([]);
  const [bkashTotal, setBkashTotal] = useState(0);
  const [bkashPage, setBkashPage] = useState(1);
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [courier, setCourier] = useState('all');
  const [collected, setCollected] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  
  // Selected orders for bulk action
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  useEffect(() => {
    fetchSummary();
  }, [dateFrom, dateTo, courier]);

  useEffect(() => {
    if (activeTab === 'cod') fetchCodOrders();
    if (activeTab === 'bkash') fetchBkashOrders();
  }, [activeTab, codPage, bkashPage, dateFrom, dateTo, courier, collected, status, search]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      let url = '/cod/summary?';
      if (dateFrom) url += `date_from=${dateFrom}&`;
      if (dateTo) url += `date_to=${dateTo}&`;
      if (courier !== 'all') url += `courier=${courier}`;
      
      const res = await api.get(url);
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCodOrders = async () => {
    try {
      let url = `/cod/cod-orders?page=${codPage}&limit=20`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      if (courier !== 'all') url += `&courier=${courier}`;
      if (collected !== 'all') url += `&collected=${collected}`;
      if (status !== 'all') url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await api.get(url);
      setCodOrders(res.data.orders || []);
      setCodTotal(res.data.total || 0);
      setCodTotals(res.data.totals || {});
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBkashOrders = async () => {
    try {
      let url = `/cod/bkash-orders?page=${bkashPage}&limit=20`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      if (status !== 'all') url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await api.get(url);
      setBkashOrders(res.data.orders || []);
      setBkashTotal(res.data.total || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const markCollected = async (orderId) => {
    try {
      await api.put(`/cod/mark-collected/${orderId}`, {});
      toast.success('Marked as collected');
      fetchSummary();
      fetchCodOrders();
    } catch (e) {
      toast.error('Failed');
    }
  };

  const markBulkCollected = async () => {
    if (selectedOrders.length === 0) return;
    try {
      await api.put('/cod/mark-collected-bulk', { order_ids: selectedOrders });
      toast.success(`${selectedOrders.length} orders marked as collected`);
      setSelectedOrders([]);
      setShowBulkModal(false);
      fetchSummary();
      fetchCodOrders();
    } catch (e) {
      toast.error('Failed');
    }
  };

  const exportCSV = async () => {
    try {
      let url = '/cod/export/cod-csv?';
      if (dateFrom) url += `date_from=${dateFrom}&`;
      if (dateTo) url += `date_to=${dateTo}&`;
      if (courier !== 'all') url += `courier=${courier}&`;
      if (collected !== 'all') url += `collected=${collected}&`;
      if (status !== 'all') url += `status=${status}`;
      
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'cod_orders.csv';
      link.click();
      toast.success('Exported');
    } catch (e) {
      toast.error('Export failed');
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const selectAllVisible = () => {
    const uncollectedIds = codOrders.filter(o => !o.cod_collected && o.status === 'delivered').map(o => o._id);
    setSelectedOrders(uncollectedIds);
  };

  const formatCurrency = (a) => '\E0\A7\B3' + (a || 0).toLocaleString();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

  const getStatusStyle = (s) => ({
    pending: { bg: '#fef3c7', color: '#b45309' },
    confirmed: { bg: '#dbeafe', color: '#1d4ed8' },
    processing: { bg: '#ede9fe', color: '#7c3aed' },
    shipped: { bg: '#cffafe', color: '#0891b2' },
    delivered: { bg: '#d1fae5', color: '#059669' },
    cancelled: { bg: '#fee2e2', color: '#dc2626' }
  }[s] || { bg: '#f3f4f6', color: '#6b7280' });

  if (loading && !summary) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Payment & COD Management</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Track COD collection and online payments</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { fetchSummary(); if (activeTab === 'cod') fetchCodOrders(); if (activeTab === 'bkash') fetchBkashOrders(); }} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              backgroundColor: activeTab === tab.id ? '#B08B5C' : '#1f2937',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? 600 : 400,
              fontSize: 14
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
        <select value={courier} onChange={(e) => setCourier(e.target.value)} style={{ padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}>
          <option value="all">All Couriers</option>
          <option value="steadfast">Steadfast</option>
          <option value="pathao">Pathao</option>
        </select>
        {activeTab === 'cod' && (
          <>
            <select value={collected} onChange={(e) => setCollected(e.target.value)} style={{ padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}>
              <option value="all">All Collection Status</option>
              <option value="yes">Collected</option>
              <option value="no">Not Collected</option>
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: '10px 14px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}>
              <option value="all">All Status</option>
              <option value="delivered">Delivered</option>
              <option value="shipped">Shipped</option>
              <option value="processing">Processing</option>
            </select>
          </>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && summary && (
        <div>
          {/* Main Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
            {/* COD Delivered */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, backgroundColor: '#10b98120', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle size={24} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>COD Delivered</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{summary.cod.delivered_count} orders</p>
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>{formatCurrency(summary.cod.delivered_total)}</p>
            </div>

            {/* COD Collected */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, backgroundColor: '#3b82f620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={24} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>COD Collected</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{summary.cod.collected_count} orders</p>
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#3b82f6' }}>{formatCurrency(summary.cod.collected_total)}</p>
            </div>

            {/* COD Due from Courier */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '2px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, backgroundColor: '#f59e0b20', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={24} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>Due from Courier</p>
                  <p style={{ fontSize: 11, color: '#f59e0b' }}>Pending collection</p>
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(summary.cod.due_from_courier)}</p>
            </div>

            {/* COD In Transit */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, backgroundColor: '#8b5cf620', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={24} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280' }}>COD In Transit</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{summary.cod.pending_count} orders</p>
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 700, color: '#8b5cf6' }}>{formatCurrency(summary.cod.pending_total)}</p>
            </div>
          </div>

          {/* Online Payments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* bKash */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #E2136E' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, backgroundColor: '#E2136E', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>bK</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>bKash Payments</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{summary.online.bkash.count} orders</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Received</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{formatCurrency(summary.online.bkash.paid)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Pending</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(summary.online.bkash.pending)}</p>
                </div>
              </div>
            </div>

            {/* Nagad */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #F6921E' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, backgroundColor: '#F6921E', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>N</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>Nagad Payments</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>{summary.online.nagad.count} orders</p>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Received</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#10b981' }}>{formatCurrency(summary.online.nagad.paid)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Pending</p>
                  <p style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{formatCurrency(summary.online.nagad.pending)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Courier Breakdown */}
          <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Courier Wise COD Breakdown</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151' }}>
                    <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>COURIER</th>
                    <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>TOTAL ORDERS</th>
                    <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>DELIVERED</th>
                    <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>PENDING</th>
                    <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>COD AMOUNT</th>
                    <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>COLLECTED</th>
                    <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>DUE</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.courier_breakdown.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: 16 }}>
                        <span style={{ padding: '6px 12px', backgroundColor: c.courier === 'steadfast' ? '#fee2e2' : '#d1fae5', color: c.courier === 'steadfast' ? '#dc2626' : '#059669', borderRadius: 6, fontSize: 13, fontWeight: 600, textTransform: 'uppercase' }}>{c.courier}</span>
                      </td>
                      <td style={{ padding: 16, textAlign: 'center', color: '#fff', fontSize: 14 }}>{c.total_orders}</td>
                      <td style={{ padding: 16, textAlign: 'center', color: '#10b981', fontSize: 14 }}>{c.delivered}</td>
                      <td style={{ padding: 16, textAlign: 'center', color: '#f59e0b', fontSize: 14 }}>{c.pending}</td>
                      <td style={{ padding: 16, textAlign: 'right', color: '#fff', fontSize: 14, fontWeight: 600 }}>{formatCurrency(c.cod_amount)}</td>
                      <td style={{ padding: 16, textAlign: 'right', color: '#10b981', fontSize: 14, fontWeight: 600 }}>{formatCurrency(c.cod_collected)}</td>
                      <td style={{ padding: 16, textAlign: 'right', color: '#f59e0b', fontSize: 14, fontWeight: 700 }}>{formatCurrency(c.cod_due)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daily COD Chart */}
          <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, border: '1px solid #374151', marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Daily COD Collection (Last 14 Days)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
              {summary.daily_cod.map((day, i) => {
                const maxAmount = Math.max(...summary.daily_cod.map(d => d.amount), 1);
                const height = Math.max((day.amount / maxAmount) * 160, 4);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontSize: 10, color: '#6b7280' }}>{formatCurrency(day.amount)}</p>
                    <div style={{ width: '80%', height, backgroundColor: day.amount > 0 ? '#10b981' : '#374151', borderRadius: '4px 4px 0 0' }} />
                    <span style={{ fontSize: 9, color: '#6b7280', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{day.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* COD Orders Tab */}
      {activeTab === 'cod' && (
        <div>
          {/* Search & Actions */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, phone, tracking..." style={{ width: '100%', padding: '12px 12px 12px 44px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
            </div>
            <button onClick={selectAllVisible} style={{ padding: '12px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>Select Uncollected</button>
            {selectedOrders.length > 0 && (
              <button onClick={() => setShowBulkModal(true)} style={{ padding: '12px 20px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Mark {selectedOrders.length} as Collected
              </button>
            )}
            <button onClick={exportCSV} style={{ padding: '12px 16px', backgroundColor: '#B08B5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={16} /> Export
            </button>
          </div>

          {/* Totals Bar */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 20, padding: 16, backgroundColor: '#1f2937', borderRadius: 12 }}>
            <div><span style={{ fontSize: 12, color: '#6b7280' }}>Total: </span><span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatCurrency(codTotals.total_amount)} ({codTotal} orders)</span></div>
            <div><span style={{ fontSize: 12, color: '#6b7280' }}>Collected: </span><span style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>{formatCurrency(codTotals.collected_amount)}</span></div>
            <div><span style={{ fontSize: 12, color: '#6b7280' }}>Pending: </span><span style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>{formatCurrency(codTotals.pending_amount)}</span></div>
          </div>

          {/* Orders Table */}
          <div style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: 16, width: 40 }}></th>
                  <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>ORDER</th>
                  <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>CUSTOMER</th>
                  <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>COURIER</th>
                  <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>AMOUNT</th>
                  <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>STATUS</th>
                  <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>COLLECTED</th>
                  <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {codOrders.map((order, i) => {
                  const st = getStatusStyle(order.status);
                  const s = order.shipping_address || {};
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: 16 }}>
                        {order.status === 'delivered' && !order.cod_collected && (
                          <input type="checkbox" checked={selectedOrders.includes(order._id)} onChange={() => toggleSelectOrder(order._id)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                        )}
                      </td>
                      <td style={{ padding: 16 }}>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{order.order_number}</p>
                        <p style={{ color: '#6b7280', fontSize: 11 }}>{formatDate(order.created_at)}</p>
                      </td>
                      <td style={{ padding: 16 }}>
                        <p style={{ color: '#fff', fontSize: 13 }}>{s.name || order.customer_name}</p>
                        <p style={{ color: '#6b7280', fontSize: 11 }}>{s.phone || order.customer_phone}</p>
                      </td>
                      <td style={{ padding: 16 }}>
                        {order.courier ? (
                          <div>
                            <span style={{ padding: '4px 8px', backgroundColor: order.courier === 'steadfast' ? '#fee2e2' : '#d1fae5', color: order.courier === 'steadfast' ? '#dc2626' : '#059669', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{order.courier}</span>
                            {order.tracking_code && <p style={{ color: '#6b7280', fontSize: 10, marginTop: 4 }}>{order.tracking_code}</p>}
                          </div>
                        ) : <span style={{ color: '#6b7280', fontSize: 12 }}>-</span>}
                      </td>
                      <td style={{ padding: 16, textAlign: 'right' }}>
                        <p style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{formatCurrency(order.total)}</p>
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: st.bg, color: st.color, borderRadius: 4, fontSize: 11, fontWeight: 500, textTransform: 'capitalize' }}>{order.status}</span>
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        {order.cod_collected ? (
                          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><CheckCircle size={16} /> Yes</span>
                        ) : (
                          <span style={{ color: '#f59e0b' }}>No</span>
                        )}
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        {order.status === 'delivered' && !order.cod_collected && (
                          <button onClick={() => markCollected(order._id)} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }}>Mark Collected</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* bKash Tab */}
      {activeTab === 'bkash' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order, phone, transaction ID..." style={{ width: '100%', padding: '12px 12px 12px 44px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
            </div>
          </div>

          <div style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>ORDER</th>
                  <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>CUSTOMER</th>
                  <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>METHOD</th>
                  <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>ADVANCE PAID</th>
                  <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>TOTAL</th>
                  <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>PAYMENT STATUS</th>
                  <th style={{ padding: 16, textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>ORDER STATUS</th>
                </tr>
              </thead>
              <tbody>
                {bkashOrders.map((order, i) => {
                  const st = getStatusStyle(order.status);
                  const s = order.shipping_address || {};
                  return (
                    <tr key={order._id} style={{ borderBottom: '1px solid #374151' }}>
                      <td style={{ padding: 16 }}>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{order.order_number}</p>
                        <p style={{ color: '#6b7280', fontSize: 11 }}>{formatDate(order.created_at)}</p>
                      </td>
                      <td style={{ padding: 16 }}>
                        <p style={{ color: '#fff', fontSize: 13 }}>{s.name || order.customer_name}</p>
                        <p style={{ color: '#6b7280', fontSize: 11 }}>{s.phone || order.customer_phone}</p>
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: order.payment_method === 'bkash' ? '#E2136E' : '#F6921E', color: '#fff', borderRadius: 4, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{order.payment_method}</span>
                      </td>
                      <td style={{ padding: 16, textAlign: 'right' }}>
                        <p style={{ color: '#10b981', fontWeight: 600, fontSize: 14 }}>{formatCurrency(order.advance_paid)}</p>
                      </td>
                      <td style={{ padding: 16, textAlign: 'right' }}>
                        <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{formatCurrency(order.total)}</p>
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: order.payment_status === 'paid' ? '#d1fae5' : '#fef3c7', color: order.payment_status === 'paid' ? '#059669' : '#b45309', borderRadius: 4, fontSize: 11, fontWeight: 500, textTransform: 'capitalize' }}>{order.payment_status}</span>
                      </td>
                      <td style={{ padding: 16, textAlign: 'center' }}>
                        <span style={{ padding: '4px 10px', backgroundColor: st.bg, color: st.color, borderRadius: 4, fontSize: 11, fontWeight: 500, textTransform: 'capitalize' }}>{order.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Mark Modal */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24, width: 400 }}>
            <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Confirm Bulk Collection</h3>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 24 }}>Are you sure you want to mark {selectedOrders.length} orders as COD collected?</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowBulkModal(false)} style={{ flex: 1, padding: 14, backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
              <button onClick={markBulkCollected} style={{ flex: 1, padding: 14, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
