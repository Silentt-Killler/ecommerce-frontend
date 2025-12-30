'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2, Star } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== 'new';
  
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  
  // Main form data
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: '',
    compare_price: '',
    category: '',
    subcategory: '',
    brand: '',
    stock: '',
    sku: '',
    tags: '',
    status: 'active',
    is_featured: false,
    images: [],
    // Content fields
    wash_guide: '',
    delivery_return: '',
    size_chart: '',
    how_to_use: '',
    // Category specific
    specs: {},
    variants: [],
    available_sizes: [],
    color: null, // Single color object {name, code, image}
    skin_type: ''
  });

  // Watch specs
  const [watchSpecs, setWatchSpecs] = useState({
    model: '',
    movement: '',
    case_size: '',
    case_material: '',
    band_material: '',
    water_resistance: '',
    warranty: ''
  });

  // Beauty specs  
  const [beautySpecs, setBeautySpecs] = useState({
    skin_type: '',
    sizes: []
  });
  const [newBeautySize, setNewBeautySize] = useState('');

  // Menswear/Womenswear data
  const [clothingData, setClothingData] = useState({
    sizes: {}, // {M: 10, L: 15, XL: 0}
    color: { name: '', code: '#000000', image: '' }
  });

  // Dropdown options
  const movementOptions = ['Quartz', 'Automatic', 'Mechanical', 'Solar', 'Kinetic'];
  const caseSizeOptions = ['28mm', '32mm', '36mm', '38mm', '40mm', '42mm', '44mm', '46mm'];
  const caseMaterialOptions = ['Stainless Steel', 'Gold', 'Rose Gold', 'Titanium', 'Ceramic', 'Plastic'];
  const bandMaterialOptions = ['Leather', 'Stainless Steel', 'Rubber', 'Silicone', 'Nylon', 'Canvas', 'Metal'];
  const waterResistanceOptions = ['30m', '50m', '100m', '200m', '300m', 'Not Water Resistant'];
  const warrantyOptions = ['1 Year', '2 Years', '3 Years', '5 Years', 'Lifetime'];
  const skinTypeOptions = ['All Skin Types', 'Oily', 'Dry', 'Normal', 'Combination', 'Sensitive'];
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    if (isEdit) {
      fetchProduct();
    }
  }, []);

  useEffect(() => {
    if (formData.category) {
      fetchSubcategories(formData.category);
      fetchBrandsByCategory(formData.category);
    }
  }, [formData.category]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await api.get('/brands');
      setBrands(res.data || []);
    } catch (error) {
      setBrands([]);
    }
  };

  const fetchBrandsByCategory = async (category) => {
    try {
      const res = await api.get(`/brands?category=${category}`);
      setBrands(res.data || []);
    } catch (error) {
      setBrands([]);
    }
  };

  const fetchSubcategories = async (category) => {
    try {
      const res = await api.get(`/subcategories?category=${category}`);
      setSubcategories(res.data || []);
    } catch (error) {
      setSubcategories([]);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      const product = res.data;
      
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        short_description: product.short_description || '',
        price: product.price?.toString() || '',
        compare_price: product.compare_price?.toString() || '',
        category: product.category || '',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        stock: product.stock?.toString() || '',
        sku: product.sku || '',
        tags: product.tags?.join(', ') || '',
        status: product.status || 'active',
        is_featured: product.is_featured || false,
        images: product.images || [],
        wash_guide: product.wash_guide || '',
        delivery_return: product.delivery_return || '',
        size_chart: product.size_chart || '',
        how_to_use: product.how_to_use || '',
        specs: product.specs || {},
        variants: product.variants || [],
        available_sizes: product.available_sizes || [],
        color: product.color || null,
        skin_type: product.skin_type || ''
      });

      // Load category specific data
      if (product.category === 'watch' && product.specs) {
        setWatchSpecs({
          model: product.specs.model || '',
          movement: product.specs.movement || '',
          case_size: product.specs.case_size || '',
          case_material: product.specs.case_material || '',
          band_material: product.specs.band_material || '',
          water_resistance: product.specs.water_resistance || '',
          warranty: product.specs.warranty || ''
        });
      }

      if (product.category === 'beauty') {
        setBeautySpecs({
          skin_type: product.skin_type || '',
          sizes: product.available_sizes || []
        });
      }

      if (product.category === 'menswear' || product.category === 'womenswear') {
        // Extract size-wise stock from variants
        const sizeStock = {};
        if (product.variants?.length > 0) {
          product.variants.forEach(v => {
            if (v.size) {
              sizeStock[v.size] = v.stock || 0;
            }
          });
        }
        
        setClothingData({
          sizes: sizeStock,
          color: product.color || { name: '', code: '#000000', image: '' }
        });
      }

    } catch (error) {
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData({
      ...formData,
      name,
      slug: isEdit ? formData.slug : generateSlug(name)
    });
  };

  // Image handling
  const addImage = () => {
    if (!imageUrl.trim()) return;
    setFormData({
      ...formData,
      images: [...formData.images, { url: imageUrl, public_id: '', is_primary: formData.images.length === 0 }]
    });
    setImageUrl('');
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
      newImages[0].is_primary = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  // Beauty size handling
  const addBeautySize = () => {
    if (!newBeautySize.trim()) return;
    setBeautySpecs({
      ...beautySpecs,
      sizes: [...beautySpecs.sizes, newBeautySize.trim()]
    });
    setNewBeautySize('');
  };

  const removeBeautySize = (index) => {
    const newSizes = [...beautySpecs.sizes];
    newSizes.splice(index, 1);
    setBeautySpecs({ ...beautySpecs, sizes: newSizes });
  };

  // Clothing size handling - toggle size and set stock
  const toggleClothingSize = (size) => {
    const newSizes = { ...clothingData.sizes };
    if (newSizes.hasOwnProperty(size)) {
      delete newSizes[size];
    } else {
      newSizes[size] = 0;
    }
    setClothingData({ ...clothingData, sizes: newSizes });
  };

  const updateSizeStock = (size, stock) => {
    setClothingData({
      ...clothingData,
      sizes: {
        ...clothingData.sizes,
        [size]: parseInt(stock) || 0
      }
    });
  };

  // Build variants from sizes (for backend)
  const buildVariants = () => {
    const variants = [];
    Object.entries(clothingData.sizes).forEach(([size, stock]) => {
      variants.push({
        size: size,
        color: clothingData.color?.name || null,
        color_code: clothingData.color?.code || null,
        color_image: clothingData.color?.image || null,
        stock: stock,
        is_active: true
      });
    });
    return variants;
  };

  // Calculate total stock
  const calculateTotalStock = () => {
    if (formData.category === 'menswear' || formData.category === 'womenswear') {
      return Object.values(clothingData.sizes).reduce((sum, s) => sum + (parseInt(s) || 0), 0);
    }
    return parseInt(formData.stock) || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      let data = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        short_description: formData.short_description,
        price: parseFloat(formData.price),
        compare_price: formData.compare_price ? parseFloat(formData.compare_price) : null,
        category: formData.category,
        subcategory: formData.subcategory || null,
        brand: formData.brand || null,
        sku: formData.sku || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        status: formData.status,
        is_featured: formData.is_featured,
        images: formData.images,
        delivery_return: formData.delivery_return || null
      };

      // Category specific data
      if (formData.category === 'watch') {
        data.specs = watchSpecs;
        data.stock = parseInt(formData.stock) || 0;
        data.variants = [];
        data.available_sizes = [];
        data.color = null;
      } 
      else if (formData.category === 'beauty') {
        data.skin_type = beautySpecs.skin_type;
        data.available_sizes = beautySpecs.sizes;
        data.stock = parseInt(formData.stock) || 0;
        data.how_to_use = formData.how_to_use || null;
        data.specs = {};
        data.variants = [];
        data.color = null;
      }
      else if (formData.category === 'menswear' || formData.category === 'womenswear') {
        data.available_sizes = Object.keys(clothingData.sizes);
        data.variants = buildVariants();
        data.stock = calculateTotalStock();
        data.color = clothingData.color?.name ? clothingData.color : null;
        data.wash_guide = formData.wash_guide || null;
        data.size_chart = formData.size_chart || null;
        data.specs = {};
      }
      else {
        data.stock = parseInt(formData.stock) || 0;
      }

      if (isEdit) {
        await api.put(`/products/${params.id}`, data);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data);
        toast.success('Product created successfully');
      }
      router.push('/admin/products');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const isWatch = formData.category === 'watch';
  const isBeauty = formData.category === 'beauty';
  const isClothing = formData.category === 'menswear' || formData.category === 'womenswear';

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <Link href="/admin/products" style={{ color: '#9ca3af', display: 'flex' }}>
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>
            {formData.category ? `Category: ${formData.category}` : 'Select a category to see specific fields'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Basic Info */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Basic Information</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    style={inputStyle}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Short Description</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Images</h2>
              
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Enter image URL (Cloudinary)"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button type="button" onClick={addImage} style={btnPrimary}>
                  <Plus size={20} />
                </button>
              </div>

              {formData.images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {formData.images.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <div style={{ 
                        aspectRatio: '1', 
                        backgroundColor: '#374151', 
                        borderRadius: 8, 
                        overflow: 'hidden',
                        border: img.is_primary ? '2px solid #3b82f6' : '1px solid #374151'
                      }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={14} />
                      </button>
                      {!img.is_primary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', padding: '4px 8px', borderRadius: 4, border: 'none', cursor: 'pointer' }}
                        >
                          Set Primary
                        </button>
                      )}
                      {img.is_primary && (
                        <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 10, backgroundColor: '#3b82f6', color: '#fff', padding: '4px 8px', borderRadius: 4 }}>
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ border: '2px dashed #374151', borderRadius: 8, padding: 40, textAlign: 'center' }}>
                  <Upload size={32} style={{ color: '#6b7280', marginBottom: 8 }} />
                  <p style={{ color: '#6b7280', fontSize: 14 }}>Add image URLs above</p>
                </div>
              )}
            </div>

            {/* ============ WATCH SPECIFICATIONS ============ */}
            {isWatch && (
              <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>
                  ⌚ Watch Specifications
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Model</label>
                    <input
                      type="text"
                      value={watchSpecs.model}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, model: e.target.value })}
                      placeholder="e.g., FS6054"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Movement</label>
                    <select value={watchSpecs.movement} onChange={(e) => setWatchSpecs({ ...watchSpecs, movement: e.target.value })} style={inputStyle}>
                      <option value="">Select Movement</option>
                      {movementOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Case Size</label>
                    <select value={watchSpecs.case_size} onChange={(e) => setWatchSpecs({ ...watchSpecs, case_size: e.target.value })} style={inputStyle}>
                      <option value="">Select Case Size</option>
                      {caseSizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Case Material</label>
                    <select value={watchSpecs.case_material} onChange={(e) => setWatchSpecs({ ...watchSpecs, case_material: e.target.value })} style={inputStyle}>
                      <option value="">Select Case Material</option>
                      {caseMaterialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Band Material</label>
                    <select value={watchSpecs.band_material} onChange={(e) => setWatchSpecs({ ...watchSpecs, band_material: e.target.value })} style={inputStyle}>
                      <option value="">Select Band Material</option>
                      {bandMaterialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Water Resistance</label>
                    <select value={watchSpecs.water_resistance} onChange={(e) => setWatchSpecs({ ...watchSpecs, water_resistance: e.target.value })} style={inputStyle}>
                      <option value="">Select Water Resistance</option>
                      {waterResistanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Warranty</label>
                    <select value={watchSpecs.warranty} onChange={(e) => setWatchSpecs({ ...watchSpecs, warranty: e.target.value })} style={inputStyle}>
                      <option value="">Select Warranty</option>
                      {warrantyOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ============ BEAUTY SPECIFICATIONS ============ */}
            {isBeauty && (
              <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>
                  💄 Beauty Specifications
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Skin Type</label>
                    <select
                      value={beautySpecs.skin_type}
                      onChange={(e) => setBeautySpecs({ ...beautySpecs, skin_type: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Select Skin Type</option>
                      {skinTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Available Sizes (e.g., 100ml, 200ml)</label>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <input
                        type="text"
                        value={newBeautySize}
                        onChange={(e) => setNewBeautySize(e.target.value)}
                        placeholder="Enter size (e.g., 100ml)"
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <button type="button" onClick={addBeautySize} style={btnPrimary}>
                        <Plus size={20} />
                      </button>
                    </div>
                    
                    {beautySpecs.sizes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {beautySpecs.sizes.map((size, index) => (
                          <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: '#374151', borderRadius: 6, color: '#fff', fontSize: 13 }}>
                            {size}
                            <button type="button" onClick={() => removeBeautySize(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>How to Use</label>
                    <textarea
                      value={formData.how_to_use}
                      onChange={(e) => setFormData({ ...formData, how_to_use: e.target.value })}
                      rows={4}
                      placeholder="Enter how to use instructions..."
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ============ CLOTHING - SIZE & COLOR ============ */}
            {isClothing && (
              <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>
                  👕 Size & Stock
                </h2>
                
                {/* Size Selection with Stock */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Select Sizes & Enter Stock</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                    {clothingSizes.map(size => {
                      const isSelected = clothingData.sizes.hasOwnProperty(size);
                      return (
                        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <button
                            type="button"
                            onClick={() => toggleClothingSize(size)}
                            style={{
                              width: 100,
                              padding: '12px 16px',
                              borderRadius: 8,
                              border: isSelected ? '2px solid #3b82f6' : '1px solid #374151',
                              backgroundColor: isSelected ? '#3b82f6' : '#111827',
                              color: '#fff',
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            {size}
                          </button>
                          
                          {isSelected && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: '#9ca3af', fontSize: 14 }}>Stock:</span>
                              <input
                                type="number"
                                value={clothingData.sizes[size] || 0}
                                onChange={(e) => updateSizeStock(size, e.target.value)}
                                min="0"
                                style={{ width: 100, padding: '10px 12px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, textAlign: 'center' }}
                              />
                              {clothingData.sizes[size] === 0 && (
                                <span style={{ color: '#ef4444', fontSize: 12, fontWeight: 500 }}>Stock Out</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Single Color */}
                <div style={{ marginBottom: 24 }}>
                  <label style={labelStyle}>Product Color (Optional)</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
                    <input
                      type="text"
                      value={clothingData.color.name}
                      onChange={(e) => setClothingData({ ...clothingData, color: { ...clothingData.color, name: e.target.value } })}
                      placeholder="Color name (e.g., Navy Blue)"
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <input
                      type="color"
                      value={clothingData.color.code}
                      onChange={(e) => setClothingData({ ...clothingData, color: { ...clothingData.color, code: e.target.value } })}
                      style={{ width: 50, height: 44, padding: 0, border: '1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
                    />
                  </div>
                  <input
                    type="url"
                    value={clothingData.color.image}
                    onChange={(e) => setClothingData({ ...clothingData, color: { ...clothingData.color, image: e.target.value } })}
                    placeholder="Color variant image URL (optional)"
                    style={{ ...inputStyle, marginTop: 12 }}
                  />
                </div>

                {/* Total Stock Display */}
                <div style={{ padding: 16, backgroundColor: calculateTotalStock() > 0 ? '#059669' : '#dc2626', borderRadius: 8, textAlign: 'center' }}>
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    Total Stock: {calculateTotalStock()} units
                  </span>
                </div>
              </div>
            )}

            {/* ============ CONTENT SECTIONS ============ */}
            {(isClothing || isBeauty) && (
              <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>
                  📝 Product Content
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Wash Guide - Only for Clothing */}
                  {isClothing && (
                    <div>
                      <label style={labelStyle}>Wash Guide</label>
                      <textarea
                        value={formData.wash_guide}
                        onChange={(e) => setFormData({ ...formData, wash_guide: e.target.value })}
                        rows={3}
                        placeholder="Enter wash instructions..."
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>
                  )}

                  {/* Size Chart - Only for Clothing */}
                  {isClothing && (
                    <div>
                      <label style={labelStyle}>Size Chart</label>
                      <textarea
                        value={formData.size_chart}
                        onChange={(e) => setFormData({ ...formData, size_chart: e.target.value })}
                        rows={3}
                        placeholder="Enter size chart details..."
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>
                  )}

                  {/* Delivery & Return */}
                  <div>
                    <label style={labelStyle}>Delivery & Return</label>
                    <textarea
                      value={formData.delivery_return}
                      onChange={(e) => setFormData({ ...formData, delivery_return: e.target.value })}
                      rows={3}
                      placeholder="Enter delivery and return policy..."
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Status & Featured */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Status</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Product Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                {/* Featured Checkbox */}
                <div 
                  onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    padding: 16, 
                    backgroundColor: formData.is_featured ? '#1e3a5f' : '#111827', 
                    border: formData.is_featured ? '2px solid #3b82f6' : '1px solid #374151',
                    borderRadius: 8, 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: formData.is_featured ? '2px solid #3b82f6' : '2px solid #6b7280',
                    backgroundColor: formData.is_featured ? '#3b82f6' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {formData.is_featured && <Star size={14} fill="#fff" color="#fff" />}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 500, fontSize: 14 }}>Featured Product</p>
                    <p style={{ color: '#6b7280', fontSize: 12 }}>Show on homepage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Pricing</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Price (৳) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={inputStyle}
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Compare Price (৳)</label>
                  <input
                    type="number"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                    style={inputStyle}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Organization</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '', brand: '' })}
                    style={inputStyle}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {subcategories.length > 0 && (
                  <div>
                    <label style={labelStyle}>Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      style={inputStyle}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map((sub) => (
                        <option key={sub._id} value={sub.slug}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={labelStyle}>Brand {isWatch && <span style={{ color: '#ef4444' }}>*</span>}</label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={inputStyle}
                    required={isWatch}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand.slug}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="new, featured, sale"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Inventory - Only for Watch & Beauty */}
            {(isWatch || isBeauty || (!isWatch && !isBeauty && !isClothing)) && (
              <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Inventory</h2>
                
                <div>
                  <label style={labelStyle}>Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    style={inputStyle}
                    required
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <Link
                href="/admin/products"
                style={{ flex: 1, padding: 14, textAlign: 'center', color: '#9ca3af', border: '1px solid #374151', borderRadius: 8, textDecoration: 'none' }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                style={{ flex: 1, padding: 14, backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      </form>

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Styles
const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  backgroundColor: '#111827',
  border: '1px solid #374151',
  borderRadius: 8,
  color: '#fff',
  fontSize: 14,
  outline: 'none'
};

const labelStyle = {
  display: 'block',
  fontSize: 14,
  color: '#9ca3af',
  marginBottom: 8
};

const btnPrimary = {
  padding: '12px 16px',
  backgroundColor: '#3b82f6',
  color: '#fff',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer'
};
