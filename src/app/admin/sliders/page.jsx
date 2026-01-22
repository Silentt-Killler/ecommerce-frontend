'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Monitor, Smartphone, X, GripVertical, Image as ImageIcon } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSlidersPage() {
  const [activeTab, setActiveTab] = useState('desktop');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({ image_url: '', link: '', type: 'desktop' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlides = (type) => {
    const slides = settings?.hero_slides || [];
    return slides.filter(s => (s.type || 'desktop') === type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const slides = [...(settings?.hero_slides || [])];
      // FIXED: Use formData.type instead of activeTab
      const newSlide = { 
        image_url: formData.image_url,
        link: formData.link,
        type: formData.type,  // This ensures correct type is saved
        is_active: true 
      };

      if (editingIndex !== null) {
        const allSlides = settings?.hero_slides || [];
        const typeSlides = allSlides.filter(s => (s.type || 'desktop') === formData.type);
        const actualIndex = allSlides.indexOf(typeSlides[editingIndex]);
        slides[actualIndex] = { ...slides[actualIndex], ...newSlide };
      } else {
        slides.push(newSlide);
      }

      await api.put('/settings', { hero_slides: slides });
      toast.success(editingIndex !== null ? 'Slider updated' : 'Slider added');
      setShowModal(false);
      setEditingIndex(null);
      setFormData({ image_url: '', link: '', type: activeTab });
      fetchSettings();
    } catch (error) {
      toast.error('Failed to save slider');
    }
  };

  const handleDelete = async (index) => {
    if (!confirm('Delete this slider?')) return;
    try {
      const allSlides = [...(settings?.hero_slides || [])];
      const typeSlides = allSlides.filter(s => (s.type || 'desktop') === activeTab);
      const actualIndex = allSlides.indexOf(typeSlides[index]);
      allSlides.splice(actualIndex, 1);
      await api.put('/settings', { hero_slides: allSlides });
      toast.success('Slider deleted');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to delete slider');
    }
  };

  // FIXED: Pass type directly instead of relying on activeTab state
  const openAddModal = (type) => {
    setActiveTab(type);
    setEditingIndex(null);
    setFormData({ image_url: '', link: '', type: type });  // Directly use passed type
    setShowModal(true);
  };

  const openEditModal = (index) => {
    const slides = getSlides(activeTab);
    setEditingIndex(index);
    setFormData({
      image_url: slides[index].image_url || slides[index].desktop_image || '',
      link: slides[index].link || '',
      type: activeTab
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  const currentSlides = getSlides(activeTab);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Home Sliders</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Manage hero section sliders for desktop and mobile</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {/* FIXED: Pass type directly to openAddModal */}
          <button
            onClick={() => openAddModal('desktop')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}
          >
            <Monitor size={18} />
            Add Desktop
          </button>
          <button
            onClick={() => openAddModal('mobile')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', backgroundColor: '#10b981', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}
          >
            <Smartphone size={18} />
            Add Mobile
          </button>
        </div>
      </div>

      {/* Tabs new */}
      <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 8, marginBottom: 24, display: 'inline-flex', gap: 4 }}>
        <button
          onClick={() => setActiveTab('desktop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 24px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeTab === 'desktop' ? '#3b82f6' : 'transparent',
            color: activeTab === 'desktop' ? '#fff' : '#9ca3af',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Monitor size={18} />
          Desktop Sliders ({getSlides('desktop').length})
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 24px',
            borderRadius: 10,
            border: 'none',
            backgroundColor: activeTab === 'mobile' ? '#10b981' : 'transparent',
            color: activeTab === 'mobile' ? '#fff' : '#9ca3af',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Smartphone size={18} />
          Mobile Sliders ({getSlides('mobile').length})
        </button>
      </div>

      {/* Size Info */}
      <div style={{ backgroundColor: activeTab === 'desktop' ? '#1e3a5f' : '#064e3b', border: `1px solid ${activeTab === 'desktop' ? '#3b82f6' : '#10b981'}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <p style={{ fontSize: 14, color: activeTab === 'desktop' ? '#93c5fd' : '#6ee7b7' }}>
          <strong>Recommended Size:</strong> {activeTab === 'desktop' ? '1920 x 800 pixels (Landscape)' : '768 x 1000 pixels (Portrait)'}
        </p>
      </div>

      {/* Sliders Grid */}
      {currentSlides.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'desktop' ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 20 }}>
          {currentSlides.map((slide, index) => (
            <div key={index} style={{ backgroundColor: '#1f2937', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ 
                aspectRatio: activeTab === 'desktop' ? '1920/800' : '768/1000',
                backgroundColor: '#374151',
                position: 'relative'
              }}>
                {(slide.image_url || slide.desktop_image) ? (
                  <img 
                    src={slide.image_url || slide.desktop_image}
                    alt="Slider"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={48} style={{ color: '#6b7280' }} />
                  </div>
                )}
                {/* Type Badge */}
                <div style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  padding: '4px 10px',
                  backgroundColor: (slide.type || 'desktop') === 'mobile' ? '#10b981' : '#3b82f6',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#fff',
                  textTransform: 'uppercase'
                }}>
                  {slide.type || 'desktop'}
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEditModal(index)}
                    style={{ flex: 1, padding: 12, backgroundColor: '#374151', color: '#fff', fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    style={{ padding: 12, backgroundColor: '#374151', color: '#ef4444', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: '#1f2937', borderRadius: 16, padding: 80, textAlign: 'center' }}>
          {activeTab === 'desktop' ? <Monitor size={64} style={{ color: '#374151', marginBottom: 16 }} /> : <Smartphone size={64} style={{ color: '#374151', marginBottom: 16 }} />}
          <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 8 }}>No {activeTab} sliders</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Add your first {activeTab} slider to get started</p>
          <button
            onClick={() => openAddModal(activeTab)}
            style={{ padding: '12px 24px', backgroundColor: activeTab === 'desktop' ? '#3b82f6' : '#10b981', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}
          >
            Add {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Slider
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: '100%', maxWidth: 500, backgroundColor: '#1f2937', borderRadius: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottom: '1px solid #374151' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {formData.type === 'mobile' ? <Smartphone size={20} style={{ color: '#10b981' }} /> : <Monitor size={20} style={{ color: '#3b82f6' }} />}
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
                  {editingIndex !== null ? 'Edit' : 'Add'} {formData.type === 'desktop' ? 'Desktop' : 'Mobile'} Slider
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ padding: 8, backgroundColor: '#374151', borderRadius: 8, border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {/* Type indicator */}
              <div style={{ 
                marginBottom: 20, 
                padding: 12, 
                backgroundColor: formData.type === 'mobile' ? '#064e3b' : '#1e3a5f', 
                borderRadius: 8,
                border: `1px solid ${formData.type === 'mobile' ? '#10b981' : '#3b82f6'}`
              }}>
                <p style={{ fontSize: 13, color: formData.type === 'mobile' ? '#6ee7b7' : '#93c5fd', margin: 0 }}>
                  Adding slider for: <strong>{formData.type === 'mobile' ? 'Mobile' : 'Desktop'}</strong>
                  <br />
                  <span style={{ fontSize: 12, opacity: 0.8 }}>
                    Recommended: {formData.type === 'desktop' ? '1920 x 800 px' : '768 x 1000 px'}
                  </span>
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  required
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

              {formData.image_url && (
                <div style={{ 
                  marginBottom: 20,
                  aspectRatio: formData.type === 'desktop' ? '1920/800' : '768/1000',
                  maxHeight: 200,
                  backgroundColor: '#374151',
                  borderRadius: 10,
                  overflow: 'hidden'
                }}>
                  <img src={formData.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 8 }}>
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/shop or https://..."
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

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ flex: 1, padding: 14, backgroundColor: '#374151', color: '#9ca3af', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: 14, backgroundColor: formData.type === 'mobile' ? '#10b981' : '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 600, borderRadius: 10, border: 'none', cursor: 'pointer' }}
                >
                  {editingIndex !== null ? 'Update' : 'Add'} {formData.type === 'mobile' ? 'Mobile' : 'Desktop'} Slider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
