'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Shield, User, Mail, Eye, EyeOff, UserCog, Users } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { key: 'manage_products', label: 'Manage Products' },
  { key: 'manage_orders', label: 'Manage Orders' },
  { key: 'view_customers', label: 'View Customers' },
  { key: 'manage_brands', label: 'Manage Brands' },
  { key: 'manage_sliders', label: 'Manage Sliders' },
  { key: 'view_analytics', label: 'View Analytics' },
  { key: 'system_settings', label: 'System Settings' },
  { key: 'manage_admins', label: 'Manage Admins' }
];

export default function AdminRolesPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    permissions: []
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/users/admin/list');
      setAdmins(res.data || []);
    } catch (error) {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (key) => {
    const perms = [...formData.permissions];
    const index = perms.indexOf(key);
    if (index > -1) {
      perms.splice(index, 1);
    } else {
      perms.push(key);
    }
    setFormData({ ...formData, permissions: perms });
  };

  const selectAllPermissions = () => {
    setFormData({ ...formData, permissions: PERMISSIONS.map(p => p.key) });
  };

  const clearAllPermissions = () => {
    setFormData({ ...formData, permissions: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      await api.post('/users/admin/create', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'admin',
        permissions: formData.permissions
      });
      toast.success('Admin user created');
      setShowModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create admin');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'admin', permissions: [] });
    setShowPassword(false);
  };

  const handleDelete = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin user?')) return;
    try {
      await api.delete(`/users/admin/${adminId}`);
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete admin');
    }
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Admin Role Management</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage admin users and permissions</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}>
          <Plus size={20} />
          Add Admin User
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Total Admins</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{admins.length || 1}</p>
            </div>
            <div style={{ width: 56, height: 56, backgroundColor: '#3b82f620', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCog size={28} style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Super Admins</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{admins.filter(a => a.permissions?.length === PERMISSIONS.length).length || 1}</p>
            </div>
            <div style={{ width: 56, height: 56, backgroundColor: '#10b98120', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={28} style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>Limited Access</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{admins.filter(a => a.permissions?.length < PERMISSIONS.length).length}</p>
            </div>
            <div style={{ width: 56, height: 56, backgroundColor: '#f59e0b20', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#111827' }}>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>User</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Role</th>
              <th style={{ textAlign: 'center', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '16px 24px', fontSize: 12, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? admins.map((admin, index) => (
              <tr key={admin._id} style={{ borderTop: '1px solid #374151' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 16 }}>
                      {admin.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{admin.name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280' }}>Administrator</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: 14, color: '#9ca3af' }}>{admin.email}</td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', backgroundColor: '#10b98120', color: '#10b981', borderRadius: 20 }}>Super Admin</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', backgroundColor: '#d1fae5', color: '#059669', borderRadius: 20 }}>Active</span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(admin._id)} style={{ padding: 10, backgroundColor: '#374151', color: '#ef4444', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} style={{ padding: 60, textAlign: 'center' }}>
                  <Shield size={64} style={{ color: '#374151', margin: '0 auto 16px' }} />
                  <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No admin users found</p>
                  <p style={{ fontSize: 14, color: '#6b7280' }}>Add admin users to manage your store</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#1f2937', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Add Admin User</h2>
              <button onClick={() => setShowModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={20} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" required style={{ width: '100%', padding: '14px 14px 14px 48px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Email *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={20} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="admin@example.com" required style={{ width: '100%', padding: '14px 14px 14px 48px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={20} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                  <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password" required style={{ width: '100%', padding: '14px 48px 14px 48px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>Permissions</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" onClick={selectAllPermissions} style={{ padding: '6px 12px', fontSize: 12, backgroundColor: '#374151', color: '#10b981', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Select All</button>
                    <button type="button" onClick={clearAllPermissions} style={{ padding: '6px 12px', fontSize: 12, backgroundColor: '#374151', color: '#ef4444', borderRadius: 6, border: 'none', cursor: 'pointer' }}>Clear All</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {PERMISSIONS.map((perm) => (
                    <label key={perm.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, backgroundColor: formData.permissions.includes(perm.key) ? '#3b82f620' : '#111827', border: `1px solid ${formData.permissions.includes(perm.key) ? '#3b82f6' : '#374151'}`, borderRadius: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={formData.permissions.includes(perm.key)} onChange={() => togglePermission(perm.key)} style={{ display: 'none' }} />
                      <div style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: formData.permissions.includes(perm.key) ? '#3b82f6' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {formData.permissions.includes(perm.key) && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize: 13, color: '#fff' }}>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: 14, backgroundColor: '#374151', color: '#9ca3af', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: 14, backgroundColor: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}>Add Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
