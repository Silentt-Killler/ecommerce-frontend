'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Ticket, Percent, DollarSign, Copy, Check } from 'lucide-react';
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
    type: 'percentage', // percentage, fixed
    coupon_type: 'code', // code, flat
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      value: parseFloat(formData.value),
      min_purchase: formData.min_purchase ? parseFloat(formData.min_purchase) : null,
      max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
      usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      expires_at: formData.expires_at || null
    };

    try {
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
      type: coupon.type,
      coupon_type: coupon.coupon_type || 'code',
      value: coupon.value.toString(),
      min_purchase: coupon.min_purchase?.toString() || '',
      max_discount: coupon.max_discount?.toString() || '',
      usage_limit: coupon.usage_limit?.toString() || '',
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
      is_active: coupon.is_active
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
      toast.error('Failed to delete coupon');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (date) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Coupons</h1>
          <p className="text-sm text-muted mt-1">Manage discount coupons</p>
        </div>
        <button
          onClick={() => {
            setEditingCoupon(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
        >
          <Plus size={18} />
          Add Coupon
        </button>
      </div>

      {/* Coupons List */}
      {coupons.length > 0 ? (
        <div className="bg-white border border-primary-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-primary-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium">Code</th>
                <th className="text-left p-4 text-sm font-medium">Type</th>
                <th className="text-left p-4 text-sm font-medium">Discount</th>
                <th className="text-left p-4 text-sm font-medium">Min Purchase</th>
                <th className="text-left p-4 text-sm font-medium">Expires</th>
                <th className="text-left p-4 text-sm font-medium">Status</th>
                <th className="text-right p-4 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-100">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-primary-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-primary-100 px-2 py-1 text-sm font-mono">
                        {coupon.code}
                      </code>
                      <button
                        onClick={() => copyCode(coupon.code)}
                        className="text-muted hover:text-focus"
                      >
                        {copiedCode === coupon.code ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      coupon.coupon_type === 'flat' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {coupon.coupon_type === 'flat' ? 'Flat Discount' : 'Code Required'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {coupon.type === 'percentage' ? (
                        <>
                          <Percent size={14} className="text-muted" />
                          <span>{coupon.value}%</span>
                        </>
                      ) : (
                        <>
                          <span>৳{coupon.value}</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted">
                    {coupon.min_purchase ? `৳${coupon.min_purchase}` : '-'}
                  </td>
                  <td className="p-4 text-sm text-muted">
                    {formatDate(coupon.expires_at)}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      coupon.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(coupon)}
                        className="p-2 text-muted hover:text-focus"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-2 text-muted hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-primary-200 p-12 text-center">
          <Ticket size={48} className="mx-auto mb-4 text-muted opacity-50" />
          <p className="text-muted mb-4">No coupons yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
          >
            Create First Coupon
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-light">
                {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-focus">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Coupon Type */}
              <div>
                <label className="block text-sm mb-2">Coupon Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="coupon_type"
                      value="code"
                      checked={formData.coupon_type === 'code'}
                      onChange={(e) => setFormData({ ...formData, coupon_type: e.target.value })}
                    />
                    <span className="text-sm">Code (User enters code)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="coupon_type"
                      value="flat"
                      checked={formData.coupon_type === 'flat'}
                      onChange={(e) => setFormData({ ...formData, coupon_type: e.target.value })}
                    />
                    <span className="text-sm">Flat (Auto-applied)</span>
                  </label>
                </div>
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm mb-2">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="input-field flex-1 font-mono"
                    placeholder="SAVE20"
                    required
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-4 border border-primary-300 text-sm hover:border-focus"
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm mb-2">Discount Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="percentage"
                      checked={formData.type === 'percentage'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span className="text-sm">Percentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="fixed"
                      checked={formData.type === 'fixed'}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    />
                    <span className="text-sm">Fixed Amount (৳)</span>
                  </label>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm mb-2">
                  Discount Value {formData.type === 'percentage' ? '(%)' : '(৳)'}
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="input-field"
                  placeholder={formData.type === 'percentage' ? '10' : '100'}
                  min="0"
                  required
                />
              </div>

              {/* Min Purchase */}
              <div>
                <label className="block text-sm mb-2">Minimum Purchase (৳) - Optional</label>
                <input
                  type="number"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                  className="input-field"
                  placeholder="500"
                  min="0"
                />
              </div>

              {/* Max Discount (for percentage) */}
              {formData.type === 'percentage' && (
                <div>
                  <label className="block text-sm mb-2">Maximum Discount (৳) - Optional</label>
                  <input
                    type="number"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    className="input-field"
                    placeholder="200"
                    min="0"
                  />
                </div>
              )}

              {/* Usage Limit */}
              <div>
                <label className="block text-sm mb-2">Usage Limit - Optional</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="input-field"
                  placeholder="100"
                  min="1"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm mb-2">Expiry Date - Optional</label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="input-field"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm">Active</label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-primary-300 text-sm hover:border-focus transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-focus text-white text-sm hover:bg-gold transition-colors"
                >
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
