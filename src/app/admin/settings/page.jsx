'use client';

import { useState, useEffect } from 'react';
import { Save, Image as ImageIcon, X } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'PRISMIN',
    logo_text: 'PRISMIN',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    footer_text: '',
    auth_image: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings({
        site_name: res.data.site_name || 'PRISMIN',
        logo_text: res.data.logo_text || 'PRISMIN',
        contact_phone: res.data.contact_phone || '',
        contact_email: res.data.contact_email || '',
        contact_address: res.data.contact_address || '',
        facebook_url: res.data.facebook_url || '',
        instagram_url: res.data.instagram_url || '',
        twitter_url: res.data.twitter_url || '',
        footer_text: res.data.footer_text || '',
        auth_image: res.data.auth_image || ''
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Site Settings</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage your website settings and appearance</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 10,
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* General Settings */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>General Settings</h2>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Site Name
            </label>
            <input
              type="text"
              value={settings.site_name}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Logo Text
            </label>
            <input
              type="text"
              value={settings.logo_text}
              onChange={(e) => setSettings({ ...settings, logo_text: e.target.value })}
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Footer Text
            </label>
            <textarea
              value={settings.footer_text}
              onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Contact Information</h2>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Phone
            </label>
            <input
              type="text"
              value={settings.contact_phone}
              onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
              placeholder="+880 1XXX-XXXXXX"
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              placeholder="info@prismin.com"
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Address
            </label>
            <textarea
              value={settings.contact_address}
              onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
              placeholder="Dhaka, Bangladesh"
              rows={2}
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Social Links */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Social Links</h2>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Facebook URL
            </label>
            <input
              type="url"
              value={settings.facebook_url}
              onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
              placeholder="https://facebook.com/..."
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Instagram URL
            </label>
            <input
              type="url"
              value={settings.instagram_url}
              onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
              placeholder="https://instagram.com/..."
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Twitter URL
            </label>
            <input
              type="url"
              value={settings.twitter_url}
              onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
              placeholder="https://twitter.com/..."
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Auth Image */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Login/Signup Image</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            This image will be displayed on the login and signup pages
          </p>
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#9ca3af', marginBottom: 8 }}>
              Image URL
            </label>
            <input
              type="url"
              value={settings.auth_image}
              onChange={(e) => setSettings({ ...settings, auth_image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              style={{
                width: '100%',
                padding: 14,
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          {/* Preview */}
          {settings.auth_image && (
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Preview:</p>
              <div style={{ 
                position: 'relative', 
                width: '100%', 
                paddingBottom: '75%', 
                backgroundColor: '#374151', 
                borderRadius: 8, 
                overflow: 'hidden' 
              }}>
                <img 
                  src={settings.auth_image} 
                  alt="Auth Preview" 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }} 
                />
              </div>
              <button
                onClick={() => setSettings({ ...settings, auth_image: '' })}
                style={{
                  position: 'absolute',
                  top: 32,
                  right: 8,
                  width: 32,
                  height: 32,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {!settings.auth_image && (
            <div style={{
              width: '100%',
              paddingBottom: '60%',
              backgroundColor: '#374151',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <ImageIcon size={40} strokeWidth={1.5} />
                <p style={{ marginTop: 12, fontSize: 13 }}>Paste image URL above</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
