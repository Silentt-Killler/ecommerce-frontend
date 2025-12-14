'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Monitor, Smartphone, X, GripVertical } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function AdminSlidersPage() {
  const [activeTab, setActiveTab] = useState('desktop');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    image_url: '',
    link: '',
    type: 'desktop'
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

  const getSlides = (type) => {
    const slides = settings?.hero_slides || [];
    return slides.filter(s => (s.type || 'desktop') === type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const slides = [...(settings?.hero_slides || [])];
      const newSlide = {
        ...formData,
        is_active: true
      };

      if (editingIndex !== null) {
        const allSlides = settings?.hero_slides || [];
        const typeSlides = allSlides.filter(s => (s.type || 'desktop') === activeTab);
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

  const openAddModal = () => {
    setEditingIndex(null);
    setFormData({ image_url: '', link: '', type: activeTab });
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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentSlides = getSlides(activeTab);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold text-white">Home Slider Management</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab('desktop'); openAddModal(); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            <Monitor size={16} />
            Add Desktop Slider
          </button>
          <button
            onClick={() => { setActiveTab('mobile'); openAddModal(); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
          >
            <Smartphone size={16} />
            Add Mobile Slider
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
            activeTab === 'desktop'
              ? 'bg-blue-600 text-white'
              : 'bg-[#232a3b] text-gray-400 hover:text-white'
          }`}
        >
          <Monitor size={16} />
          Desktop Sliders
        </button>
        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded text-sm transition-colors ${
            activeTab === 'mobile'
              ? 'bg-blue-600 text-white'
              : 'bg-[#232a3b] text-gray-400 hover:text-white'
          }`}
        >
          <Smartphone size={16} />
          Mobile Sliders
        </button>
      </div>

      {/* Size Info */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <p className="text-blue-400 text-sm">
          {activeTab === 'desktop' 
            ? 'Recommended size: 1920 x 800 pixels'
            : 'Recommended size: 768 x 1000 pixels'
          }
        </p>
      </div>

      {/* Sliders List */}
      {currentSlides.length > 0 ? (
        <div className="space-y-4">
          {currentSlides.map((slide, index) => (
            <div 
              key={index}
              className="bg-[#232a3b] rounded-lg p-4 flex items-center gap-4"
            >
              <div className="text-gray-600 cursor-move">
                <GripVertical size={20} />
              </div>
              
              <div className={`${activeTab === 'desktop' ? 'w-48 h-20' : 'w-20 h-28'} bg-gray-700 rounded overflow-hidden flex-shrink-0`}>
                {slide.image_url || slide.desktop_image ? (
                  <img 
                    src={slide.image_url || slide.desktop_image}
                    alt="Slider"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">
                  {slide.image_url || slide.desktop_image || 'No image URL'}
                </p>
                {slide.link && (
                  <p className="text-gray-500 text-xs mt-1">Link: {slide.link}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(index)}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-600 rounded hover:border-gray-500 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#232a3b] rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'desktop' ? <Monitor size={32} className="text-gray-500" /> : <Smartphone size={32} className="text-gray-500" />}
          </div>
          <p className="text-gray-400 mb-4">
            No {activeTab} sliders found. Add your first slider!
          </p>
          <button
            onClick={openAddModal}
            className="px-6 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            Add Slider
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#232a3b] w-full max-w-lg rounded-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">
                {editingIndex !== null ? 'Edit' : 'Add'} {activeTab === 'desktop' ? 'Desktop' : 'Mobile'} Slider
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Image URL ({activeTab === 'desktop' ? '1920 x 800' : '768 x 1000'})
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              {formData.image_url && (
                <div className={`${activeTab === 'desktop' ? 'aspect-[1920/800]' : 'aspect-[768/1000] max-w-[200px]'} bg-gray-700 rounded overflow-hidden`}>
                  <img 
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-400 mb-2">Link (Optional)</label>
                <input
                  type="text"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/shop or https://..."
                  className="w-full px-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded text-white placeholder-gray-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 text-sm text-gray-400 border border-gray-600 rounded hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                >
                  {editingIndex !== null ? 'Update' : 'Add'} Slider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
