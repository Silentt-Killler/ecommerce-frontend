'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Shield, User, Check } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const PERMISSIONS = [
  { key: 'dashboard', label: 'View Dashboard' },
  { key: 'products_view', label: 'View Products' },
  { key: 'products_edit', label: 'Add/Edit Products' },
  { key: 'products_delete', label: 'Delete Products' },
  { key: 'orders_view', label: 'View Orders' },
  { key: 'orders_edit', label: 'Update Order Status' },
  { key: 'customers_view', label: 'View Customers' },
  { key: 'customers_export', label: 'Export Customers' },
  { key: 'coupons', label: 'Manage Coupons' },
  { key: 'brands', label: 'Manage Brands' },
  { key: 'sliders', label: 'Manage Sliders' },
  { key: 'settings', label: 'Site Settings' },
  { key: 'admins', label: 'Manage Admins' }
];

const DEFAULT_ROLES = [
  {
    name: 'Super Admin',
    slug: 'super_admin',
    permissions: PERMISSIONS.map(p => p.key),
    is_system: true
  },
  {
    name: 'Manager',
    slug: 'manager',
    permissions: ['dashboard', 'products_view', 'products_edit', 'orders_view', 'orders_edit', 'customers_view'],
    is_system: true
  },
  {
    name: 'Staff',
    slug: 'staff',
    permissions: ['dashboard', 'orders_view'],
    is_system: true
  }
];

export default function AdminRolesPage() {
  const [admins, setAdmins] = useState([]);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [loading, setLoading] = useState(true);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
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

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAdmin) {
        await api.put(`/users/admin/${editingAdmin._id}`, adminForm);
        toast.success('Admin updated');
      } else {
        await api.post('/users/admin/create', adminForm);
        toast.success('Admin created');
      }
      
      setShowAdminModal(false);
      setEditingAdmin(null);
      setAdminForm({ name: '', email: '', password: '', role: 'staff' });
      fetchAdmins();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save admin');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Delete this admin?')) return;
    
    try {
      await api.delete(`/users/admin/${adminId}`);
      toast.success('Admin deleted');
      fetchAdmins();
    } catch (error) {
      toast.error('Failed to delete admin');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-purple-100 text-purple-700';
      case 'manager': return 'bg-blue-100 text-blue-700';
      case 'staff': return 'bg-green-100 text-green-700';
      case 'admin': return 'bg-gold/20 text-gold';
      default: return 'bg-gray-100 text-gray-700';
    }
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Admin Roles</h1>
          <p className="text-sm text-muted mt-1">Manage admin users and permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingAdmin(null);
            setAdminForm({ name: '', email: '', password: '', role: 'staff' });
            setShowAdminModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
        >
          <Plus size={18} />
          Add Admin
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-medium mb-4 flex items-center gap-2">
            <User size={18} />
            Admin Users
          </h2>
          
          {admins.length > 0 ? (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div key={admin._id} className="bg-white border border-primary-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{admin.name}</p>
                      <p className="text-sm text-muted">{admin.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role}
                      </span>
                      <button
                        onClick={() => handleDeleteAdmin(admin._id)}
                        className="text-muted hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-primary-200 p-8 text-center">
              <User size={32} className="mx-auto mb-2 text-muted opacity-50" />
              <p className="text-muted">No admin users yet</p>
            </div>
          )}
        </div>

        <div>
          <h2 className="font-medium mb-4 flex items-center gap-2">
            <Shield size={18} />
            Available Roles
          </h2>
          
          <div className="space-y-3">
            {roles.map((role, index) => (
              <div key={role.slug} className="bg-white border border-primary-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${getRoleBadgeColor(role.slug)}`}>
                      {role.name}
                    </span>
                    {role.is_system && (
                      <span className="text-xs text-muted">(System)</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 4).map((perm) => (
                    <span key={perm} className="text-xs bg-primary-100 px-2 py-0.5 rounded">
                      {PERMISSIONS.find(p => p.key === perm)?.label || perm}
                    </span>
                  ))}
                  {role.permissions.length > 4 && (
                    <span className="text-xs text-muted">+{role.permissions.length - 4} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-light">
                {editingAdmin ? 'Edit Admin' : 'Add Admin'}
              </h2>
              <button onClick={() => setShowAdminModal(false)} className="text-muted hover:text-focus">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">
                  Password {editingAdmin && '(leave empty to keep current)'}
                </label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="input-field"
                  required={!editingAdmin}
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Role</label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  className="input-field"
                >
                  {roles.map((role) => (
                    <option key={role.slug} value={role.slug}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 py-3 border border-primary-300 text-sm hover:border-focus transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-focus text-white text-sm hover:bg-gold transition-colors"
                >
                  {editingAdmin ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
