'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2 } from 'lucide-react';
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
    images: [],
    // Category specific
    specs: {},
    variants: [],
    available_sizes: [],
    available_colors: [],
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
    sizes: [] // ['100ml', '200ml']
  });
  const [newBeautySize, setNewBeautySize] = useState('');

  // Menswear/Womenswear variants
  const [clothingData, setClothingData] = useState({
    available_sizes: [],
    colors: [] // [{name: 'Red', code: '#FF0000', image: '', stocks: {M: 10, L: 15}}]
  });
  const [newColor, setNewColor] = useState({ name: '', code: '#000000', image: '' });

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
        images: product.images || [],
        specs: product.specs || {},
        variants: product.variants || [],
        available_sizes: product.available_sizes || [],
        available_colors: product.available_colors || [],
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
        setClothingData({
          available_sizes: product.available_sizes || [],
          colors: product.variants?.length > 0 
            ? extractColorsFromVariants(product.variants)
            : []
        });
      }

    } catch (error) {
      toast.error('Failed to load product');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  // Extract unique colors from variants
  const extractColorsFromVariants = (variants) => {
    const colorMap = {};
    variants.forEach(v => {
      if (v.color && !colorMap[v.color]) {
        colorMap[v.color] = {
          name: v.color,
          code: v.color_code || '#000000',
          image: v.color_image || '',
          stocks: {}
        };
      }
      if (v.color && v.size) {
        colorMap[v.color].stocks[v.size] = v.stock || 0;
      }
    });
    return Object.values(colorMap);
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

  // Clothing size handling
  const toggleClothingSize = (size) => {
    const sizes = clothingData.available_sizes.includes(size)
      ? clothingData.available_sizes.filter(s => s !== size)
      : [...clothingData.available_sizes, size];
    setClothingData({ ...clothingData, available_sizes: sizes });
  };

  // Clothing color handling
  const addColor = () => {
    if (!newColor.name.trim()) return;
    const stocks = {};
    clothingData.available_sizes.forEach(size => {
      stocks[size] = 0;
    });
    setClothingData({
      ...clothingData,
      colors: [...clothingData.colors, { ...newColor, stocks }]
    });
    setNewColor({ name: '', code: '#000000', image: '' });
  };

  const removeColor = (index) => {
    const newColors = [...clothingData.colors];
    newColors.splice(index, 1);
    setClothingData({ ...clothingData, colors: newColors });
  };

  const updateColorStock = (colorIndex, size, stock) => {
    const newColors = [...clothingData.colors];
    newColors[colorIndex].stocks[size] = parseInt(stock) || 0;
    setClothingData({ ...clothingData, colors: newColors });
  };

  const updateColorImage = (colorIndex, imageUrl) => {
    const newColors = [...clothingData.colors];
    newColors[colorIndex].image = imageUrl;
    setClothingData({ ...clothingData, colors: newColors });
  };

  // Build variants from colors and sizes
  const buildVariants = () => {
    const variants = [];
    clothingData.colors.forEach(color => {
      clothingData.available_sizes.forEach(size => {
        variants.push({
          size: size,
          color: color.name,
          color_code: color.code,
          color_image: color.image,
          stock: color.stocks[size] || 0,
          is_active: true
        });
      });
    });
    return variants;
  };

  // Calculate total stock from variants
  const calculateTotalStock = () => {
    if (formData.category === 'menswear' || formData.category === 'womenswear') {
      return clothingData.colors.reduce((total, color) => {
        return total + Object.values(color.stocks).reduce((sum, s) => sum + (parseInt(s) || 0), 0);
      }, 0);
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
        images: formData.images
      };

      // Category specific data
      if (formData.category === 'watch') {
        data.specs = watchSpecs;
        data.stock = parseInt(formData.stock) || 0;
        data.variants = [];
        data.available_sizes = [];
        data.available_colors = [];
      } 
      else if (formData.category === 'beauty') {
        data.skin_type = beautySpecs.skin_type;
        data.available_sizes = beautySpecs.sizes;
        data.stock = parseInt(formData.stock) || 0;
        data.specs = {};
        data.variants = [];
        data.available_colors = [];
      }
      else if (formData.category === 'menswear' || formData.category === 'womenswear') {
        data.available_sizes = clothingData.available_sizes;
        data.available_colors = clothingData.colors.map(c => c.name);
        data.variants = buildVariants();
        data.stock = calculateTotalStock();
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
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Short Description</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14, resize: 'vertical' }}
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
                  style={{ flex: 1, padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                />
                <button
                  type="button"
                  onClick={addImage}
                  style={{ padding: '12px 16px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
                >
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
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Model</label>
                    <input
                      type="text"
                      value={watchSpecs.model}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, model: e.target.value })}
                      placeholder="e.g., FS6054"
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Movement</label>
                    <select
                      value={watchSpecs.movement}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, movement: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      <option value="">Select Movement</option>
                      {movementOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Case Size</label>
                    <select
                      value={watchSpecs.case_size}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, case_size: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      <option value="">Select Case Size</option>
                      {caseSizeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Case Material</label>
                    <select
                      value={watchSpecs.case_material}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, case_material: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      <option value="">Select Case Material</option>
                      {caseMaterialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Band Material</label>
                    <select
                      value={watchSpecs.band_material}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, band_material: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      <option value="">Select Band Material</option>
                      {bandMaterialOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Water Resistance</label>
                    <select
                      value={watchSpecs.water_resistance}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, water_resistance: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      <option value="">Select Water Resistance</option>
                      {waterResistanceOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Warranty</label>
                    <select
                      value={watchSpecs.warranty}
                      onChange={(e) => setWatchSpecs({ ...watchSpecs, warranty: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
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
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Skin Type</label>
                    <select
                      value={beautySpecs.skin_type}
                      onChange={(e) => setBeautySpecs({ ...beautySpecs, skin_type: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      <option value="">Select Skin Type</option>
                      {skinTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Available Sizes (e.g., 100ml, 200ml)</label>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                      <input
                        type="text"
                        value={newBeautySize}
                        onChange={(e) => setNewBeautySize(e.target.value)}
                        placeholder="Enter size (e.g., 100ml)"
                        style={{ flex: 1, padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                      />
                      <button
                        type="button"
                        onClick={addBeautySize}
                        style={{ padding: '12px 16px', backgroundColor: '#3b82f6', color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    
                    {beautySpecs.sizes.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {beautySpecs.sizes.map((size, index) => (
                          <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 12px', backgroundColor: '#374151', borderRadius: 6, color: '#fff', fontSize: 13 }}>
                            {size}
                            <button
                              type="button"
                              onClick={() => removeBeautySize(index)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ============ CLOTHING VARIANTS (Menswear/Womenswear) ============ */}
            {isClothing && (
              <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>
                  👕 Size & Color Variants
                </h2>
                
                {/* Available Sizes */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>Available Sizes</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {clothingSizes.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleClothingSize(size)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: 8,
                          border: clothingData.available_sizes.includes(size) ? '2px solid #3b82f6' : '1px solid #374151',
                          backgroundColor: clothingData.available_sizes.includes(size) ? '#3b82f6' : '#111827',
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Color */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 12 }}>Add Color Variant</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newColor.name}
                      onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                      placeholder="Color name (e.g., Red)"
                      style={{ flex: 1, padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                    <input
                      type="color"
                      value={newColor.code}
                      onChange={(e) => setNewColor({ ...newColor, code: e.target.value })}
                      style={{ width: 50, height: 44, padding: 0, border: '1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
                    />
                    <button
                      type="button"
                      onClick={addColor}
                      disabled={clothingData.available_sizes.length === 0}
                      style={{ padding: '12px 16px', backgroundColor: clothingData.available_sizes.length > 0 ? '#3b82f6' : '#374151', color: '#fff', borderRadius: 8, border: 'none', cursor: clothingData.available_sizes.length > 0 ? 'pointer' : 'not-allowed' }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  {clothingData.available_sizes.length === 0 && (
                    <p style={{ fontSize: 12, color: '#f59e0b', marginTop: 8 }}>⚠️ Select sizes first before adding colors</p>
                  )}
                </div>

                {/* Color List with Stock per Size */}
                {clothingData.colors.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {clothingData.colors.map((color, colorIndex) => (
                      <div key={colorIndex} style={{ backgroundColor: '#111827', borderRadius: 8, padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: color.code, border: '2px solid #fff' }} />
                            <span style={{ color: '#fff', fontWeight: 500 }}>{color.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeColor(colorIndex)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        {/* Color Image */}
                        <div style={{ marginBottom: 12 }}>
                          <input
                            type="url"
                            value={color.image}
                            onChange={(e) => updateColorImage(colorIndex, e.target.value)}
                            placeholder="Color variant image URL (optional)"
                            style={{ width: '100%', padding: '10px 12px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6, color: '#fff', fontSize: 13 }}
                          />
                        </div>

                        {/* Stock per Size */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                          {clothingData.available_sizes.map(size => (
                            <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 13, color: '#9ca3af', width: 50 }}>{size}:</span>
                              <input
                                type="number"
                                value={color.stocks[size] || 0}
                                onChange={(e) => updateColorStock(colorIndex, size, e.target.value)}
                                min="0"
                                style={{ width: 70, padding: '8px 10px', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 6, color: '#fff', fontSize: 13, textAlign: 'center' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Total Stock Display */}
                    <div style={{ padding: 16, backgroundColor: '#059669', borderRadius: 8, textAlign: 'center' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>
                        Total Stock: {calculateTotalStock()} units
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Pricing */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Pricing</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Price (৳) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Compare Price (৳)</label>
                  <input
                    type="number"
                    value={formData.compare_price}
                    onChange={(e) => setFormData({ ...formData, compare_price: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
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
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '', brand: '' })}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
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
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map((sub) => (
                        <option key={sub._id} value={sub.slug}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>
                    Brand {isWatch && <span style={{ color: '#ef4444' }}>*</span>}
                  </label>
                  <select
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    required={isWatch}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand) => (
                      <option key={brand._id} value={brand.slug}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="new, featured, sale"
                    style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                  />
                </div>
              </div>
            </div>

            {/* Inventory - Only for Watch & Beauty */}
            {(isWatch || isBeauty || (!isWatch && !isBeauty && !isClothing)) && (
              <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Inventory</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Stock *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Status */}
            <div style={{ backgroundColor: '#1f2937', borderRadius: 12, padding: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Status</h2>
              
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: '#111827', border: '1px solid #374151', borderRadius: 8, color: '#fff', fontSize: 14 }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

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
