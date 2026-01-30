'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Eye, Download, X, Truck, Package, Calendar, Phone, MapPin, User, 
  Mail, CreditCard, Clock, CheckCircle, RefreshCw, Send, FileText, Printer, MessageSquare
} from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: '#6b7280' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
  { value: 'processing', label: 'Processing', color: '#8b5cf6' },
  { value: 'shipped', label: 'Shipped', color: '#06b6d4' },
  { value: 'delivered', label: 'Delivered', color: '#10b981' },
  { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
];

const COURIER_OPTIONS = [
  { value: 'steadfast', label: 'Steadfast', color: '#E53E3E' },
  { value: 'pathao', label: 'Pathao', color: '#38A169' }
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({});
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showCourierModal, setShowCourierModal] = useState(false);
  const [courierOrder, setCourierOrder] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState('steadfast');
  const [courierLoading, setCourierLoading] = useState(false);

  useEffect(() => { fetchOrders(); }, [selectedStatus, dateFrom, dateTo]);
  useEffect(() => { const t = setTimeout(() => { if (searchQuery !== '') fetchOrders(); }, 500); return () => clearTimeout(t); }, [searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let url = '/orders/admin/all?limit=50';
      if (selectedStatus !== 'all') url += '&status=' + selectedStatus;
      if (searchQuery) url += '&search=' + encodeURIComponent(searchQuery);
      if (dateFrom) url += '&date_from=' + dateFrom;
      if (dateTo) url += '&date_to=' + dateTo;
      const res = await api.get(url);
      setOrders(res.data.orders || []);
      setStats(res.data.stats || {});
    } catch (e) { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put('/orders/admin/' + orderId + '/status', { status: newStatus });
      toast.success('Status updated');
      fetchOrders();
      if (selectedOrder?._id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
    } catch (e) { toast.error('Failed to update'); }
  };

  const createShipment = async () => {
    if (!courierOrder) return;
    setCourierLoading(true);
    try {
      const s = courierOrder.shipping_address || {};
      const payload = {
        order_id: courierOrder.order_number || courierOrder._id,
        recipient_name: s.name || courierOrder.customer_name || '',
        recipient_phone: s.phone || courierOrder.customer_phone || '',
        recipient_address: (s.address || '') + ', ' + (s.area || '') + ', ' + (s.district || ''),
        cod_amount: courierOrder.cod_amount || courierOrder.total || 0,
        district: s.district || '',
        area: s.area || '',
        note: s.note || courierOrder.notes || '',
        item_quantity: courierOrder.total_quantity || courierOrder.items?.length || 1,
        item_weight: 0.5
      };
      const res = await api.post('/courier/create-shipment?courier=' + selectedCourier, payload);
      if (res.data.success) {
        await api.put('/orders/admin/' + courierOrder._id + '/courier', {
          courier: selectedCourier, consignment_id: res.data.consignment_id, tracking_code: res.data.tracking_code
        });
        toast.success('Shipment created');
        setShowCourierModal(false);
        fetchOrders();
      } else { toast.error(res.data.message || 'Failed'); }
    } catch (e) { toast.error('Failed to create shipment'); }
    finally { setCourierLoading(false); }
  };

  const downloadPDF = async (orderId, type) => {
    try {
      const urls = { invoice: '/orders/admin/' + orderId + '/invoice/pdf', courier: '/orders/admin/' + orderId + '/courier-slip/pdf', packing: '/orders/admin/' + orderId + '/packing-slip/pdf' };
      const res = await api.get(urls[type], { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = type + '_' + orderId + '.pdf'; a.click();
      URL.revokeObjectURL(url);
      toast.success('Downloaded');
    } catch (e) { toast.error('Failed to download'); }
  };

  const resendSMS = async (orderId) => {
    try { await api.post('/orders/admin/' + orderId + '/resend-sms'); toast.success('SMS sent'); } catch (e) { toast.error('Failed'); }
  };

  const resendEmail = async (orderId) => {
    try { await api.post('/orders/admin/' + orderId + '/resend-email'); toast.success('Email sent'); } catch (e) { toast.error('Failed'); }
  };

  const exportOrders = () => {
    const headers = ['Order ID', 'Customer', 'Phone', 'Email', 'Address', 'District', 'Area', 'Amount', 'COD', 'Status', 'Payment', 'Courier', 'Date'];
    const rows = orders.map(o => {
      const s = o.shipping_address || {};
      return [o.order_number || o._id.slice(-8), s.name || o.customer_name || '', s.phone || o.customer_phone || '', s.email || o.customer_email || '', s.address || '', s.district || '', s.area || '', o.total || 0, o.cod_amount || 0, o.status, o.payment_method || 'COD', o.courier || '', new Date(o.created_at).toLocaleDateString()];
    });
    const csv = [headers.join(','), ...rows.map(r => r.map(c => '"' + c + '"').join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'orders.csv'; a.click();
  };

  const formatCurrency = (a) => '৳' + (a || 0).toLocaleString();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const getStatusStyle = (s) => ({ pending: { bg: '#fef3c7', color: '#b45309' }, confirmed: { bg: '#dbeafe', color: '#1d4ed8' }, processing: { bg: '#ede9fe', color: '#7c3aed' }, shipped: { bg: '#cffafe', color: '#0891b2' }, delivered: { bg: '#d1fae5', color: '#059669' }, cancelled: { bg: '#fee2e2', color: '#dc2626' } }[s] || { bg: '#f3f4f6', color: '#6b7280' });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Orders</h1><p style={{ fontSize: 14, color: '#6b7280' }}>Manage orders</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={fetchOrders} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={16} /> Refresh</button>
          <button onClick={exportOrders} style={{ padding: '10px 16px', backgroundColor: '#B08B5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}><Download size={16} /> Export</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, marginBottom: 24 }}>
        {STATUS_OPTIONS.filter(s => s.value !== 'all').map(s => (
          <div key={s.value} onClick={() => setSelectedStatus(s.value === selectedStatus ? 'all' : s.value)} style={{ backgroundColor: selectedStatus === s.value ? s.color : '#1f2937', padding: 16, borderRadius: 12, cursor: 'pointer', border: selectedStatus === s.value ? 'none' : '1px solid #374151' }}>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{stats[s.value] || 0}</p>
            <p style={{ fontSize: 12, color: selectedStatus === s.value ? '#fff' : '#9ca3af' }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by order ID, name, phone, email..." style={{ width: '100%', padding: '12px 12px 12px 44px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none' }} />
        </div>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ padding: '12px 16px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ padding: '12px 16px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }} />
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #374151' }}>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>ORDER</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>CUSTOMER</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>AMOUNT</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>PAYMENT</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>STATUS</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>COURIER</th>
              <th style={{ padding: 16, textAlign: 'left', color: '#9ca3af', fontSize: 12 }}>DATE</th>
              <th style={{ padding: 16, textAlign: 'right', color: '#9ca3af', fontSize: 12 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</td></tr> :
            orders.length === 0 ? <tr><td colSpan={8} style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>No orders</td></tr> :
            orders.map(order => {
              const s = order.shipping_address || {};
              const st = getStatusStyle(order.status);
              return (
                <tr key={order._id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: 16 }}><p style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{order.order_number || order._id.slice(-8)}</p><p style={{ color: '#6b7280', fontSize: 12 }}>{order.items?.length || 0} items</p></td>
                  <td style={{ padding: 16 }}><p style={{ color: '#fff', fontSize: 13 }}>{s.name || order.customer_name || 'N/A'}</p><p style={{ color: '#6b7280', fontSize: 12 }}>{s.phone || order.customer_phone || 'N/A'}</p><p style={{ color: '#4b5563', fontSize: 11 }}>{s.email || order.customer_email || ''}</p></td>
                  <td style={{ padding: 16 }}><p style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{formatCurrency(order.total)}</p>{order.cod_amount > 0 && <p style={{ color: '#f59e0b', fontSize: 11 }}>COD: {formatCurrency(order.cod_amount)}</p>}</td>
                  <td style={{ padding: 16 }}><span style={{ padding: '4px 8px', backgroundColor: order.payment_status === 'paid' ? '#d1fae5' : '#fef3c7', color: order.payment_status === 'paid' ? '#059669' : '#b45309', borderRadius: 4, fontSize: 11 }}>{order.payment_method?.toUpperCase() || 'COD'}</span></td>
                  <td style={{ padding: 16 }}><select value={order.status} onChange={(e) => updateStatus(order._id, e.target.value)} style={{ padding: '6px 10px', backgroundColor: st.bg, color: st.color, border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{STATUS_OPTIONS.filter(x => x.value !== 'all').map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select></td>
                  <td style={{ padding: 16 }}>{order.courier ? <div><span style={{ padding: '4px 8px', backgroundColor: order.courier === 'pathao' ? '#d1fae5' : '#fee2e2', color: order.courier === 'pathao' ? '#059669' : '#dc2626', borderRadius: 4, fontSize: 11 }}>{order.courier?.toUpperCase()}</span>{order.tracking_code && <p style={{ color: '#6b7280', fontSize: 10, marginTop: 4 }}>{order.tracking_code}</p>}</div> : <button onClick={() => { setCourierOrder(order); setShowCourierModal(true); }} style={{ padding: '6px 10px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><Truck size={12} /> Assign</button>}</td>
                  <td style={{ padding: 16 }}><p style={{ color: '#9ca3af', fontSize: 12 }}>{formatDate(order.created_at)}</p></td>
                  <td style={{ padding: 16, textAlign: 'right' }}><button onClick={() => setSelectedOrder(order)} style={{ padding: 8, backgroundColor: '#374151', border: 'none', borderRadius: 6, cursor: 'pointer' }}><Eye size={16} style={{ color: '#9ca3af' }} /></button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ backgroundColor: '#1f2937', borderRadius: 16, width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #374151', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Order #{selectedOrder.order_number || selectedOrder._id.slice(-8)}</h2><p style={{ color: '#6b7280', fontSize: 13 }}>{formatDate(selectedOrder.created_at)}</p></div>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} style={{ color: '#9ca3af' }} /></button>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Customer Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><User size={16} style={{ color: '#B08B5C' }} /><div><p style={{ color: '#6b7280', fontSize: 11 }}>Name</p><p style={{ color: '#fff', fontSize: 13 }}>{selectedOrder.shipping_address?.name || selectedOrder.customer_name || 'N/A'}</p></div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Phone size={16} style={{ color: '#B08B5C' }} /><div><p style={{ color: '#6b7280', fontSize: 11 }}>Phone</p><p style={{ color: '#fff', fontSize: 13 }}>{selectedOrder.shipping_address?.phone || selectedOrder.customer_phone || 'N/A'}</p></div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Mail size={16} style={{ color: '#B08B5C' }} /><div><p style={{ color: '#6b7280', fontSize: 11 }}>Email</p><p style={{ color: '#fff', fontSize: 13 }}>{selectedOrder.shipping_address?.email || selectedOrder.customer_email || 'N/A'}</p></div></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><MapPin size={16} style={{ color: '#B08B5C' }} /><div><p style={{ color: '#6b7280', fontSize: 11 }}>Address</p><p style={{ color: '#fff', fontSize: 13 }}>{selectedOrder.shipping_address?.address || 'N/A'}{selectedOrder.shipping_address?.area && ', ' + selectedOrder.shipping_address.area}{selectedOrder.shipping_address?.district && ', ' + selectedOrder.shipping_address.district}</p></div></div>
                </div>
              </div>

              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Order Items</h3>
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < selectedOrder.items.length - 1 ? '1px solid #374151' : 'none' }}>
                    <div style={{ width: 50, height: 50, backgroundColor: '#374151', borderRadius: 8, overflow: 'hidden' }}>{item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}</div>
                    <div style={{ flex: 1 }}><p style={{ color: '#fff', fontSize: 13 }}>{item.name}</p>{item.variant && <p style={{ color: '#6b7280', fontSize: 11 }}>{Object.entries(item.variant).map(([k, v]) => k + ': ' + v).join(', ')}</p>}</div>
                    <div style={{ textAlign: 'right' }}><p style={{ color: '#fff', fontSize: 13 }}>{formatCurrency(item.price)} × {item.quantity}</p><p style={{ color: '#B08B5C', fontSize: 13, fontWeight: 600 }}>{formatCurrency(item.subtotal || item.price * item.quantity)}</p></div>
                  </div>
                ))}
              </div>

              <div style={{ backgroundColor: '#111827', borderRadius: 12, padding: 20, marginBottom: 20 }}>
                <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Payment Summary</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280', fontSize: 13 }}>Subtotal</span><span style={{ color: '#fff', fontSize: 13 }}>{formatCurrency(selectedOrder.subtotal)}</span></div>
                {selectedOrder.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#10b981', fontSize: 13 }}>Discount</span><span style={{ color: '#10b981', fontSize: 13 }}>-{formatCurrency(selectedOrder.discount)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#6b7280', fontSize: 13 }}>Delivery</span><span style={{ color: '#fff', fontSize: 13 }}>{formatCurrency(selectedOrder.delivery_charge || selectedOrder.shipping_cost)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #374151', marginTop: 8 }}><span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Total</span><span style={{ color: '#B08B5C', fontSize: 18, fontWeight: 700 }}>{formatCurrency(selectedOrder.total)}</span></div>
                {selectedOrder.payment_type === 'partial' && <><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}><span style={{ color: '#6b7280', fontSize: 12 }}>Advance Paid</span><span style={{ color: '#10b981', fontSize: 12 }}>{formatCurrency(selectedOrder.advance_paid)}</span></div><div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280', fontSize: 12 }}>COD Amount</span><span style={{ color: '#f59e0b', fontSize: 12 }}>{formatCurrency(selectedOrder.cod_amount)}</span></div></>}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <button onClick={() => downloadPDF(selectedOrder._id, 'invoice')} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><FileText size={16} /> Invoice PDF</button>
                <button onClick={() => downloadPDF(selectedOrder._id, 'courier')} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><Truck size={16} /> Courier Slip</button>
                <button onClick={() => downloadPDF(selectedOrder._id, 'packing')} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><Package size={16} /> Packing Slip</button>
                <button onClick={() => resendSMS(selectedOrder._id)} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><MessageSquare size={16} /> Resend SMS</button>
                <button onClick={() => resendEmail(selectedOrder._id)} style={{ padding: '10px 16px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}><Mail size={16} /> Resend Email</button>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <select value={selectedOrder.status} onChange={(e) => updateStatus(selectedOrder._id, e.target.value)} style={{ flex: 1, padding: 14, backgroundColor: '#374151', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer' }}>{STATUS_OPTIONS.filter(x => x.value !== 'all').map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select>
                {!selectedOrder.courier && <button onClick={() => { setSelectedOrder(null); setCourierOrder(selectedOrder); setShowCourierModal(true); }} style={{ padding: '14px 24px', backgroundColor: '#B08B5C', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}><Truck size={18} /> Assign Courier</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCourierModal && courierOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ backgroundColor: '#1f2937', borderRadius: 16, width: '100%', maxWidth: 500, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}><h2 style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>Assign Courier</h2><button onClick={() => setShowCourierModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} style={{ color: '#9ca3af' }} /></button></div>
            <div style={{ marginBottom: 20 }}><p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Order</p><p style={{ color: '#fff', fontSize: 14 }}>#{courierOrder.order_number}</p></div>
            <div style={{ marginBottom: 20 }}><p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>Recipient</p><p style={{ color: '#fff', fontSize: 14 }}>{courierOrder.shipping_address?.name || courierOrder.customer_name}</p><p style={{ color: '#9ca3af', fontSize: 13 }}>{courierOrder.shipping_address?.phone || courierOrder.customer_phone}</p></div>
            <div style={{ marginBottom: 20 }}><p style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>COD Amount</p><p style={{ color: '#B08B5C', fontSize: 18, fontWeight: 700 }}>{formatCurrency(courierOrder.cod_amount || courierOrder.total)}</p></div>
            <div style={{ marginBottom: 24 }}><p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>Select Courier</p><div style={{ display: 'flex', gap: 12 }}>{COURIER_OPTIONS.map(c => <button key={c.value} onClick={() => setSelectedCourier(c.value)} style={{ flex: 1, padding: 16, backgroundColor: selectedCourier === c.value ? c.color : '#374151', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: selectedCourier === c.value ? 1 : 0.7 }}>{c.label}</button>)}</div></div>
            <button onClick={createShipment} disabled={courierLoading} style={{ width: '100%', padding: 16, backgroundColor: '#B08B5C', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: courierLoading ? 'not-allowed' : 'pointer', opacity: courierLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{courierLoading ? 'Creating...' : <><Send size={18} /> Create Shipment</>}</button>
          </div>
        </div>
      )}
    </div>
  );
}
