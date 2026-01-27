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
    header_logo: '',
    header_logo_white: '',
    footer_logo: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    facebook_url: '',
    instagram_url: '',
    tiktok_url: '',
    youtube_url: '',
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
        header_logo: res.data.header_logo || '',
        header_logo_white: res.data.header_logo_white || '',
        footer_logo: res.data.footer_logo || '',
        contact_phone: res.data.contact_phone || '',
        contact_email: res.data.contact_email || '',
        contact_address: res.data.contact_address || '',
        facebook_url: res.data.facebook_url || '',
        instagram_url: res.data.instagram_url || '',
        tiktok_url: res.data.tiktok_url || '',
        youtube_url: res.data.youtube_url || '',
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

  const inputStyle = {
    width: '100%',
    padding: 14,
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: 8,
    color: '#fff',
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: '#9ca3af',
    marginBottom: 8
  };

  // Logo Preview Box Component
  const LogoPreviewBox = ({ label, description, field, bgColor }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{description}</p>
      <input
        type="url"
        value={settings[field]}
        onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
        placeholder="https://res.cloudinary.com/..."
        style={{ ...inputStyle, marginBottom: 12 }}
      />
      {settings[field] ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ padding: 16, backgroundColor: bgColor, borderRadius: 8, display: 'inline-block' }}>
            <img src={settings[field]} alt={label} style={{ height: 40, width: 'auto', maxWidth: 160 }} onError={(e) => e.target.style.display = 'none'} />
          </div>
          <button
            onClick={() => setSettings({ ...settings, [field]: '' })}
            style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, backgroundColor: '#ef4444', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ padding: '20px', backgroundColor: '#374151', borderRadius: 8, textAlign: 'center' }}>
          <ImageIcon size={24} style={{ color: '#6b7280', marginBottom: 8 }} />
          <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>Paste Cloudinary URL above</p>
        </div>
      )}
    </div>
  );

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
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', backgroundColor: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        
        {/* Logo Settings */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24, gridColumn: 'span 2' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Logo Settings</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>Paste Cloudinary URLs for your brand logos</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <LogoPreviewBox 
              label="Header Logo (Dark)"
              description="For navigation on white background"
              field="header_logo"
              bgColor="#f5f5f5"
            />
            <LogoPreviewBox 
              label="Header Logo (White)"
              description="For transparent header on hero"
              field="header_logo_white"
              bgColor="#1a1a1a"
            />
            <LogoPreviewBox 
              label="Footer Logo"
              description="For dark footer background"
              field="footer_logo"
              bgColor="#1a1a1a"
            />
          </div>
          
          <div style={{ marginTop: 20, padding: 12, backgroundColor: '#374151', borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
              <strong>Tip:</strong> Upload PNG with transparent background to Cloudinary, then paste the URL here. Recommended size: 400x130px
            </p>
          </div>
        </div>

        {/* General Settings */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>General Settings</h2>
          
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Site Name</label>
            <input type="text" value={settings.site_name} onChange={(e) => setSettings({ ...settings, site_name: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Logo Text (Fallback)</label>
            <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Shown if logo image fails to load</p>
            <input type="text" value={settings.logo_text} onChange={(e) => setSettings({ ...settings, logo_text: e.target.value })} style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Footer About Text</label>
            <textarea value={settings.footer_text} onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })} rows={3} placeholder="Short description about your brand..." style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Contact Information</h2>
          
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Phone</label>
            <input type="text" value={settings.contact_phone} onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })} placeholder="+880 1XXX-XXXXXX" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Email</label>
            <input type="email" value={settings.contact_email} onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })} placeholder="info@prismin.com" style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Address</label>
            <textarea value={settings.contact_address} onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })} placeholder="Dhaka, Bangladesh" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
        </div>

        {/* Social Links */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Social Links</h2>
          
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Facebook URL</label>
            <input type="url" value={settings.facebook_url} onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })} placeholder="https://facebook.com/..." style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Instagram URL</label>
            <input type="url" value={settings.instagram_url} onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })} placeholder="https://instagram.com/..." style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>TikTok URL</label>
            <input type="url" value={settings.tiktok_url} onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })} placeholder="https://tiktok.com/@..." style={inputStyle} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>YouTube URL</label>
            <input type="url" value={settings.youtube_url} onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })} placeholder="https://youtube.com/..." style={inputStyle} />
          </div>
        </div>

        {/* Auth Image */}
        <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Login/Signup Image</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Displayed on login and signup pages</p>
          
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Image URL</label>
            <input type="url" value={settings.auth_image} onChange={(e) => setSettings({ ...settings, auth_image: e.target.value })} placeholder="https://res.cloudinary.com/..." style={inputStyle} />
          </div>

          {settings.auth_image ? (
            <div style={{ position: 'relative' }}>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Preview:</p>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '75%', backgroundColor: '#374151', borderRadius: 8, overflow: 'hidden' }}>
                <img src={settings.auth_image} alt="Auth Preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <button onClick={() => setSettings({ ...settings, auth_image: '' })} style={{ position: 'absolute', top: 32, right: 8, width: 32, height: 32, backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ width: '100%', paddingBottom: '60%', backgroundColor: '#374151', borderRadius: 8, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                <ImageIcon size={40} strokeWidth={1.5} />
                <p style={{ marginTop: 12, fontSize: 13 }}>Paste image URL above</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
