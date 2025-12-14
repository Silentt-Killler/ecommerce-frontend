'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Ticket, Copy, Percent, DollarSign, Calendar, Check } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    coupon_type: 'code',
    value: '',
    min_purchase: '',
    max_discount: '',
    usage_limit: '',
    expires_at: '',
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data || []);
    } catch (error) {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        value: parseFloat(formData.value),
        min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : null,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expires_at: formData.expires_at || null
      };

      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, data);
        toast.success('Coupon updated');
      } else {
        await api.post('/coupons', data);
        toast.success('Coupon created');
      }
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save coupon');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      coupon_type: 'code',
      value: '',
      min_purchase: '',
      max_discount: '',
      usage_limit: '',
      expires_at: '',
      is_active: true
    });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type || 'percentage',
      coupon_type: coupon.coupon_type || 'code',
      value: coupon.value?.toString() || '',
      min_purchase: coupon.min_purchase?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete coupon');
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { ...coupon, is_active: !coupon.is_active });
      toast.success(`Coupon ${coupon.is_active ? 'deactivated' : 'activated'}`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to update coupon');
    }
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    resetForm();
    setShowModal(true);
  };

  const formatDate = (date) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const isExpired = (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Coupons</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage discount codes and offers</p>
        </div>
        <button
          onClick={openAddModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 10,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          Add Coupon
        </button>
      </div>

      {/* Coupons Table */}
      {coupons.length > 0 ? (
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#111827' }}>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Discount</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min. Purchase</th>
                  <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expires</th>
                  <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expires_at);
                  return (
                    <tr key={coupon._id} style={{ borderTop: '1px solid #374151' }}>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{
                            fontSize: 14,
                            fontWeight: 700,
                            fontFamily: 'monospace',
                            padding: '8px 14px',
                            backgroundColor: '#374151',
                            color: '#fff',
                            borderRadius: 8,
                            letterSpacing: '0.05em'
                          }}>
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyCode(coupon.code)}
                            style={{
                              padding: 6,
                              backgroundColor: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: copiedCode === coupon.code ? '#10b981' : '#6b7280'
                            }}
                          >
                            {copiedCode === coupon.code ? <Check size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          {coupon.type === 'percentage' ? (
                            <>
                              <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>{coupon.value}%</span>
                              <span style={{ fontSize: 12, color: '#6b7280' }}>OFF</span>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>৳{coupon.value}</span>
                              <span style={{ fontSize: 12, color: '#6b7280' }}>OFF</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 500,
                          padding: '6px 12px',
                          backgroundColor: coupon.coupon_type === 'flat' ? '#8b5cf620' : '#3b82f620',
                          color: coupon.coupon_type === 'flat' ? '#a78bfa' : '#60a5fa',
                          borderRadius: 6,
                          textTransform: 'capitalize'
                        }}>
                          {coupon.coupon_type || 'Code'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ fontSize: 14, color: '#9ca3af' }}>
                          {coupon.min_purchase ? `৳${coupon.min_purchase.toLocaleString()}` : 'None'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{ 
                          fontSize: 14, 
                          color: expired ? '#ef4444' : '#9ca3af'
                        }}>
                          {formatDate(coupon.expires_at)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button
                          onClick={() => toggleActive(coupon)}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            padding: '6px 14px',
                            borderRadius: 20,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: coupon.is_active && !expired ? '#d1fae5' : '#fee2e2',
                            color: coupon.is_active && !expired ? '#059669' : '#dc2626'
                          }}
                        >
                          {expired ? 'Expired' : coupon.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <button
                            onClick={() => handleEdit(coupon)}
                            style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#3b82f6', display: 'flex' }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            style={{ padding: 10, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 80, textAlign: 'center' }}>
          <Ticket size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No coupons yet</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Create your first discount coupon</p>
          <button
            onClick={openAddModal}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Add Coupon
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1f2937', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151', position: 'sticky', top: 0, backgroundColor: '#1f2937' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>
                {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {/* Code */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Coupon Code *
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    required
                    style={{
                      flex: 1,
                      padding: 14,
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    style={{
                      padding: '14px 16px',
                      backgroundColor: '#374151',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 500,
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Coupon Type */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Coupon Type *
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coupon_type: 'code' })}
                    style={{
                      flex: 1,
                      padding: 14,
                      backgroundColor: formData.coupon_type === 'code' ? '#3b82f6' : '#374151',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Code (Manual)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, coupon_type: 'flat' })}
                    style={{
                      flex: 1,
                      padding: 14,
                      backgroundColor: formData.coupon_type === 'flat' ? '#3b82f6' : '#374151',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 10,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Flat (Auto Apply)
                  </button>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 14,
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (৳)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                    Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '10' : '100'}
                    required
                    min="0"
                    style={{
                      width: '100%',
                      padding: 14,
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

              {/* Min Purchase & Max Discount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                    Min. Purchase (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                    placeholder="Optional"
                    min="0"
                    style={{
                      width: '100%',
                      padding: 14,
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                    Max. Discount (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    placeholder="Optional"
                    min="0"
                    style={{
                      width: '100%',
                      padding: 14,
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

              {/* Usage Limit & Expiry */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder="Unlimited"
                    min="0"
                    style={{
                      width: '100%',
                      padding: 14,
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: 10,
                      color: '#fff',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 14,
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

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: 14,
                    backgroundColor: '#374151',
                    color: '#9ca3af',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: 14,
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
