'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, Heart, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/slug/${params.slug}`);
      setProduct(res.data);
      
      // Fetch related products
      if (res.data.category) {
        const relatedRes = await api.get(`/products?category=${res.data.category}&limit=4`);
        const filtered = (relatedRes.data.products || []).filter(p => p._id !== res.data._id);
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      router.push('/shop');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: quantity,
      variant: {
        size: selectedSize,
        color: product.color
      }
    });
    
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: quantity,
      variant: {
        size: selectedSize,
        color: product.color
      }
    });
    
    router.push('/checkout');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi, I'm interested in ${product.name} - ৳${product.price}`);
    window.open(`https://wa.me/8801XXXXXXXXX?text=${message}`, '_blank');
  };

  const handleImageHover = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const nextImage = () => {
    if (product?.images?.length > 1) {
      setSelectedImage((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (product?.images?.length > 1) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  const formatPrice = (price) => '৳ ' + (price || 0).toLocaleString('en-BD');

  const getCategoryName = (category) => {
    const names = {
      'menswear': 'Menswear',
      'womenswear': 'Womenswear',
      'beauty': 'Beauty & Care',
      'watch': 'Watch'
    };
    return names[category] || category;
  };

  // Size Chart Data
  const sizeChartData = {
    menswear: [
      { size: 'M', chest: '38-40', length: '28', shoulder: '17' },
      { size: 'L', chest: '40-42', length: '29', shoulder: '18' },
      { size: 'XL', chest: '42-44', length: '30', shoulder: '19' }
    ],
    womenswear: [
      { size: 'M', bust: '34-36', waist: '28-30', hip: '36-38' },
      { size: 'L', bust: '36-38', waist: '30-32', hip: '38-40' },
      { size: 'XL', bust: '38-40', waist: '32-34', hip: '40-42' }
    ]
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Product not found</p>
      </div>
    );
  }

  const sizes = product.sizes?.length > 0 ? product.sizes : ['M', 'L', 'XL'];
  const currentSizeChart = sizeChartData[product.category] || sizeChartData.menswear;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Spacer for header */}
      <div style={{ height: 70 }} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <Link href={`/${product.category}`} style={{ color: '#6B7280', textDecoration: 'none' }}>{getCategoryName(product.category)}</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ color: '#0C0C0C' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          
          {/* Left - Images */}
          <div>
            {/* Main Image - 4:5 Aspect Ratio (smaller) */}
            <div 
              style={{ 
                position: 'relative', 
                aspectRatio: '4/5', 
                backgroundColor: '#F9FAFB', 
                borderRadius: 4,
                overflow: 'hidden',
                cursor: isZoomed ? 'zoom-out' : 'zoom-in',
                maxHeight: 550
              }}
              onClick={() => setIsZoomed(!isZoomed)}
              onMouseMove={handleImageHover}
              onMouseLeave={() => setIsZoomed(false)}
            >
              {product.images?.[selectedImage]?.url ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.name}
                  fill
                  style={{ 
                    objectFit: 'cover',
                    transform: isZoomed ? 'scale(2)' : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    transition: isZoomed ? 'none' : 'transform 0.3s'
                  }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontSize: 14 }}>
                  No Image
                </div>
              )}

              {/* Navigation Arrows */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    style={{
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    <ChevronLeft size={20} color="#0C0C0C" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                  >
                    <ChevronRight size={20} color="#0C0C0C" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: 70,
                      height: 85,
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: selectedImage === index ? '2px solid #0C0C0C' : '1px solid #E5E7EB',
                      padding: 0,
                      cursor: 'pointer',
                      backgroundColor: '#F9FAFB'
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={`${product.name} ${index + 1}`}
                      width={70}
                      height={85}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div>
            {/* Title */}
            <h1 style={{ 
              fontSize: 24, 
              fontWeight: 500, 
              color: '#0C0C0C', 
              lineHeight: 1.3,
              margin: 0
            }}>
              {product.name}
            </h1>

            {/* SKU, Availability, Product Type */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                SKU: <span style={{ color: '#374151' }}>{product.sku || 'N/A'}</span>
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                Availability:{' '}
                <span style={{ color: product.stock > 0 ? '#059669' : '#DC2626', fontWeight: 500 }}>
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                Product Type: <span style={{ color: '#374151' }}>{getCategoryName(product.category)}</span>
              </div>
            </div>

            {/* Price */}
            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: '#0C0C0C' }}>
                {formatPrice(product.price)}
              </span>
              {product.compare_price > product.price && (
                <span style={{ fontSize: 16, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 12 }}>
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>

            {/* Color */}
            {product.color && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>
                  Color: <span style={{ color: '#0C0C0C', fontWeight: 500 }}>{product.color}</span>
                </div>
                <div 
                  style={{ 
                    width: 28, 
                    height: 28, 
                    borderRadius: '50%', 
                    backgroundColor: product.color_code || '#0C0C0C',
                    border: '2px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }} 
                />
              </div>
            )}

            {/* Size */}
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Size</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      border: selectedSize === size ? '2px solid #0C0C0C' : '1px solid #D1D5DB',
                      backgroundColor: selectedSize === size ? '#0C0C0C' : '#FFFFFF',
                      color: selectedSize === size ? '#FFFFFF' : '#374151',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity + Add to Cart */}
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Quantity Selector */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid #E5E7EB', 
                borderRadius: 4
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: 38,
                    height: 42,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Minus size={16} color="#374151" />
                </button>
                <span style={{ 
                  width: 38, 
                  height: 42, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#0C0C0C',
                  borderLeft: '1px solid #E5E7EB',
                  borderRight: '1px solid #E5E7EB'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: 38,
                    height: 42,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={16} color="#374151" />
                </button>
              </div>

              {/* Add to Cart Button - Border Style */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  flex: 1,
                  height: 44,
                  backgroundColor: 'transparent',
                  color: product.stock > 0 ? '#0C0C0C' : '#9CA3AF',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1.5,
                  border: product.stock > 0 ? '1px solid #0C0C0C' : '1px solid #D1D5DB',
                  borderRadius: 4,
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  if (product.stock > 0) {
                    e.currentTarget.style.backgroundColor = '#0C0C0C';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseOut={(e) => {
                  if (product.stock > 0) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#0C0C0C';
                  }
                }}
              >
                Add to Cart
              </button>

              {/* Wishlist Button */}
              <button
                style={{
                  width: 44,
                  height: 44,
                  border: '1px solid #E5E7EB',
                  borderRadius: 4,
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#0C0C0C';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <Heart size={18} color="#374151" />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              style={{
                width: '100%',
                height: 44,
                marginTop: 10,
                backgroundColor: product.stock > 0 ? '#0C0C0C' : '#E5E7EB',
                color: product.stock > 0 ? '#FFFFFF' : '#9CA3AF',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                border: 'none',
                borderRadius: 4,
                cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (product.stock > 0) {
                  e.currentTarget.style.backgroundColor = '#1a1a1a';
                }
              }}
              onMouseOut={(e) => {
                if (product.stock > 0) {
                  e.currentTarget.style.backgroundColor = '#0C0C0C';
                }
              }}
            >
              Buy Now
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsApp}
              style={{
                width: '100%',
                height: 44,
                marginTop: 10,
                backgroundColor: 'transparent',
                color: '#25D366',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 1.5,
                border: '1px solid #25D366',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#25D366';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#25D366';
              }}
            >
              <MessageCircle size={16} />
              WhatsApp
            </button>

            {/* Accordion Sections */}
            <div style={{ marginTop: 32, borderTop: '1px solid #F3F4F6' }}>
              {/* Product Description */}
              <div style={{ borderBottom: '1px solid #F3F4F6' }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Product Description</span>
                  <ChevronDown 
                    size={18} 
                    color="#6B7280"
                    style={{ 
                      transform: openAccordion === 'description' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }} 
                  />
                </button>
                {openAccordion === 'description' && (
                  <div style={{ paddingBottom: 16, fontSize: 13, color: '#4B5563', lineHeight: 1.7 }}>
                    {product.description || 'No description available.'}
                  </div>
                )}
              </div>

              {/* Size Chart */}
              <div style={{ borderBottom: '1px solid #F3F4F6' }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'sizechart' ? '' : 'sizechart')}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Size Chart</span>
                  <ChevronDown 
                    size={18} 
                    color="#6B7280"
                    style={{ 
                      transform: openAccordion === 'sizechart' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }} 
                  />
                </button>
                {openAccordion === 'sizechart' && (
                  <div style={{ paddingBottom: 16 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F9FAFB' }}>
                          <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C', borderBottom: '1px solid #E5E7EB' }}>Size</th>
                          {product.category === 'womenswear' ? (
                            <>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C', borderBottom: '1px solid #E5E7EB' }}>Bust</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C', borderBottom: '1px solid #E5E7EB' }}>Waist</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C', borderBottom: '1px solid #E5E7EB' }}>Hip</th>
                            </>
                          ) : (
                            <>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C', borderBottom: '1px solid #E5E7EB' }}>Chest</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C', borderBottom: '1px solid #E5E7EB' }}>Length</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C', borderBottom: '1px solid #E5E7EB' }}>Shoulder</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {currentSizeChart.map((row, index) => (
                          <tr key={row.size}>
                            <td style={{ padding: '10px 12px', color: '#374151', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>{row.size}</td>
                            {product.category === 'womenswear' ? (
                              <>
                                <td style={{ padding: '10px 12px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.bust}"</td>
                                <td style={{ padding: '10px 12px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.waist}"</td>
                                <td style={{ padding: '10px 12px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.hip}"</td>
                              </>
                            ) : (
                              <>
                                <td style={{ padding: '10px 12px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.chest}"</td>
                                <td style={{ padding: '10px 12px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.length}"</td>
                                <td style={{ padding: '10px 12px', color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>{row.shoulder}"</td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Wash Guide */}
              <div style={{ borderBottom: '1px solid #F3F4F6' }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'washguide' ? '' : 'washguide')}
                  style={{
                    width: '100%',
                    padding: '16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Wash Guide</span>
                  <ChevronDown 
                    size={18} 
                    color="#6B7280"
                    style={{ 
                      transform: openAccordion === 'washguide' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }} 
                  />
                </button>
                {openAccordion === 'washguide' && (
                  <div style={{ paddingBottom: 16, fontSize: 13, color: '#4B5563', lineHeight: 1.8 }}>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      <li style={{ marginBottom: 6 }}>Machine wash cold with similar colors</li>
                      <li style={{ marginBottom: 6 }}>Do not bleach</li>
                      <li style={{ marginBottom: 6 }}>Tumble dry low</li>
                      <li style={{ marginBottom: 6 }}>Iron on low heat if needed</li>
                      <li>Do not dry clean</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ backgroundColor: '#F7F7F7', padding: '50px 0' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
            <h2 style={{ 
              fontSize: 20, 
              fontWeight: 500, 
              letterSpacing: 3, 
              textAlign: 'center', 
              marginBottom: 32,
              color: '#0C0C0C',
              textTransform: 'uppercase'
            }}>
              Related Products
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
