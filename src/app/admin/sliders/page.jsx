'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Monitor, Smartphone, Link as LinkIcon, X, GripVertical } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSlidersPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    desktop_image: '',
    mobile_image: '',
    link: '',
    is_active: true
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const slides = settings?.hero_slides || [];
      
      if (editingSlide !== null) {
        // Update existing slide
        slides[editingSlide] = {
          ...slides[editingSlide],
          ...formData
        };
      } else {
        // Add new slide
        slides.push(formData);
      }

      await api.put('/settings', { hero_slides: slides });
      toast.success(editingSlide !== null ? 'Slider updated' : 'Slider added');
      setShowModal(false);
      setEditingSlide(null);
      setFormData({ desktop_image: '', mobile_image: '', link: '', is_active: true });
      fetchSettings();
    } catch (error) {
      toast.error('Failed to save slider');
    }
  };

  const handleEdit = (index) => {
    const slide = settings.hero_slides[index];
    setFormData({
      desktop_image: slide.desktop_image || slide.image_url || '',
      mobile_image: slide.mobile_image || '',
      link: slide.link || '',
      is_active: slide.is_active !== false
    });
    setEditingSlide(index);
    setShowModal(true);
  };

  const handleDelete = async (index) => {
    if (!confirm('Delete this slider?')) return;

    try {
      const slides = [...(settings?.hero_slides || [])];
      slides.splice(index, 1);
      
      await api.put('/settings', { hero_slides: slides });
      toast.success('Slider deleted');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to delete slider');
    }
  };

  const toggleActive = async (index) => {
    try {
      const slides = [...(settings?.hero_slides || [])];
      slides[index].is_active = !slides[index].is_active;
      
      await api.put('/settings', { hero_slides: slides });
      toast.success('Status updated');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const slides = settings?.hero_slides || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wide">Home Sliders</h1>
          <p className="text-sm text-muted mt-1">Manage hero section sliders</p>
        </div>
        <button
          onClick={() => {
            setEditingSlide(null);
            setFormData({ desktop_image: '', mobile_image: '', link: '', is_active: true });
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
        >
          <Plus size={18} />
          Add Slider
        </button>
      </div>

      {/* Size Info */}
      <div className="bg-blue-50 border border-blue-200 p-4 mb-6 text-sm">
        <p className="font-medium text-blue-800 mb-2">Recommended Image Sizes:</p>
        <div className="flex gap-8 text-blue-700">
          <div className="flex items-center gap-2">
            <Monitor size={18} />
            <span>Desktop: <strong>1920 x 800 px</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={18} />
            <span>Mobile: <strong>768 x 1000 px</strong></span>
          </div>
        </div>
      </div>

      {/* Sliders List */}
      {slides.length > 0 ? (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`bg-white border ${slide.is_active ? 'border-primary-200' : 'border-red-200 bg-red-50/30'} p-4`}
            >
              <div className="flex items-start gap-4">
                {/* Drag Handle */}
                <div className="pt-2 text-muted cursor-move">
                  <GripVertical size={20} />
                </div>

                {/* Images Preview */}
                <div className="flex gap-4 flex-1">
                  {/* Desktop Preview */}
                  <div className="flex-1">
                    <p className="text-xs text-muted mb-2 flex items-center gap-1">
                      <Monitor size={14} />
                      Desktop
                    </p>
                    <div className="aspect-[1920/800] bg-primary-100 rounded overflow-hidden">
                      {(slide.desktop_image || slide.image_url) ? (
                        <img 
                          src={slide.desktop_image || slide.image_url}
                          alt="Desktop"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mobile Preview */}
                  <div className="w-32">
                    <p className="text-xs text-muted mb-2 flex items-center gap-1">
                      <Smartphone size={14} />
                      Mobile
                    </p>
                    <div className="aspect-[768/1000] bg-primary-100 rounded overflow-hidden">
                      {slide.mobile_image ? (
                        <img 
                          src={slide.mobile_image}
                          alt="Mobile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => toggleActive(index)}
                    className={`px-3 py-1 text-xs border rounded ${
                      slide.is_active 
                        ? 'border-green-500 text-green-600' 
                        : 'border-red-500 text-red-600'
                    }`}
                  >
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleEdit(index)}
                    className="px-3 py-1 text-xs border border-primary-300 hover:border-focus"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="px-3 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Link */}
              {slide.link && (
                <div className="mt-3 pt-3 border-t border-primary-100">
                  <p className="text-xs text-muted flex items-center gap-1">
                    <LinkIcon size={12} />
                    {slide.link}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-primary-200 p-12 text-center">
          <Monitor size={48} className="mx-auto mb-4 text-muted opacity-50" />
          <p className="text-muted mb-4">No sliders yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2 bg-focus text-white text-sm hover:bg-gold transition-colors"
          >
            Add First Slider
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-light">
                {editingSlide !== null ? 'Edit Slider' : 'Add Slider'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-focus">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Desktop Image */}
              <div>
                <label className="block text-sm mb-2 flex items-center gap-2">
                  <Monitor size={16} />
                  Desktop Image URL
                  <span className="text-muted">(1920 x 800 px)</span>
                </label>
                <input
                  type="url"
                  value={formData.desktop_image}
                  onChange={(e) => setFormData({ ...formData, desktop_image: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="input-field"
                  required
                />
                {formData.desktop_image && (
                  <div className="mt-2 aspect-[1920/800] bg-primary-100 rounded overflow-hidden max-h-40">
                    <img 
                      src={formData.desktop_image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Mobile Image */}
              <div>
                <label className="block text-sm mb-2 flex items-center gap-2">
                  <Smartphone size={16} />
                  Mobile Image URL
                  <span className="text-muted">(768 x 1000 px)</span>
                </label>
                <input
                  type="url"
                  value={formData.mobile_image}
                  onChange={(e) => setFormData({ ...formData, mobile_image: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="input-field"
                />
                {formData.mobile_image && (
                  <div className="mt-2 aspect-[768/1000] bg-primary-100 rounded overflow-hidden max-h-40 w-24">
                    <img 
                      src={formData.mobile_image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm mb-2 flex items-center gap-2">
                  <LinkIcon size={16} />
                  Link (Optional)
                </label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/shop or https://..."
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
                <label htmlFor="is_active" className="text-sm">Active (Show on homepage)</label>
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
                  {editingSlide !== null ? 'Update' : 'Add Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
