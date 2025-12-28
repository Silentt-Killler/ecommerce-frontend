'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, Heart, Truck, MessageCircle } from 'lucide-react';
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
      const res = await api.get(`/products/${params.slug}`);
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
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F7F7' }}>
      {/* Spacer for header */}
      <div style={{ height: 60 }} />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '16px 40px' }}>
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
      <div style={{ backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '40px 40px 60px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '55% 45%', gap: 60 }}>
            
            {/* Left - Images */}
            <div>
              {/* Main Image */}
              <div 
                style={{ 
                  position: 'relative', 
                  aspectRatio: '3/4', 
                  backgroundColor: '#F9FAFB', 
                  borderRadius: 8,
                  overflow: 'hidden',
                  cursor: isZoomed ? 'zoom-out' : 'zoom-in'
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
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB' }}>
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
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <ChevronLeft size={24} color="#0C0C0C" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImage(); }}
                      style={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <ChevronRight size={24} color="#0C0C0C" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images?.length > 1 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {product.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        width: 80,
                        height: 100,
                        borderRadius: 6,
                        overflow: 'hidden',
                        border: selectedImage === index ? '2px solid #0C0C0C' : '2px solid transparent',
                        padding: 0,
                        cursor: 'pointer',
                        backgroundColor: '#F9FAFB'
                      }}
                    >
                      <Image
                        src={img.url}
                        alt={`${product.name} ${index + 1}`}
                        width={80}
                        height={100}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right - Product Info */}
            <div style={{ paddingTop: 8 }}>
              {/* Title */}
              <h1 style={{ 
                fontSize: 26, 
                fontWeight: 500, 
                color: '#0C0C0C', 
                lineHeight: 1.3,
                margin: 0
              }}>
                {product.name}
              </h1>

              {/* SKU, Availability, Product Type */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  <span>SKU:</span> <span style={{ color: '#374151' }}>{product.sku || 'N/A'}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  <span>Availability:</span>{' '}
                  <span style={{ color: product.stock > 0 ? '#059669' : '#DC2626' }}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  <span>Product Type:</span> <span style={{ color: '#374151' }}>{getCategoryName(product.category)}</span>
                </div>
              </div>

              {/* Price */}
              <div style={{ marginTop: 24 }}>
                <span style={{ fontSize: 28, fontWeight: 600, color: '#0C0C0C' }}>
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Color */}
              {product.color && (
                <div style={{ marginTop: 28 }}>
                  <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>
                    Color: <span style={{ color: '#0C0C0C', fontWeight: 500 }}>{product.color}</span>
                  </div>
                  <div 
                    style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      backgroundColor: product.color_code || '#0C0C0C',
                      border: '2px solid #E5E7EB'
                    }} 
                  />
                </div>
              )}

              {/* Size */}
              <div style={{ marginTop: 28 }}>
                <div style={{ fontSize: 14, color: '#6B7280', marginBottom: 12 }}>Size</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: selectedSize === size ? '2px solid #0C0C0C' : '1px solid #D1D5DB',
                        backgroundColor: selectedSize === size ? '#0C0C0C' : '#FFFFFF',
                        color: selectedSize === size ? '#FFFFFF' : '#374151',
                        fontSize: 14,
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

              {/* Free Shipping */}
              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Truck size={20} color="#6B7280" />
                <span style={{ fontSize: 14, color: '#6B7280' }}>Free Shipping on orders over ৳3,000</span>
              </div>

              {/* Quantity + Add to Cart */}
              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Quantity Selector */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: 6,
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: 44,
                      height: 48,
                      border: 'none',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Minus size={18} color="#374151" />
                  </button>
                  <span style={{ 
                    width: 44, 
                    height: 48, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 500,
                    color: '#0C0C0C',
                    borderLeft: '1px solid #D1D5DB',
                    borderRight: '1px solid #D1D5DB'
                  }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      width: 44,
                      height: 48,
                      border: 'none',
                      backgroundColor: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={18} color="#374151" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  style={{
                    flex: 1,
                    height: 50,
                    backgroundColor: product.stock > 0 ? '#0C0C0C' : '#D1D5DB',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: 1,
                    border: 'none',
                    borderRadius: 6,
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    textTransform: 'uppercase',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Add to Cart
                </button>

                {/* Wishlist Button */}
                <button
                  style={{
                    width: 50,
                    height: 50,
                    border: '1px solid #D1D5DB',
                    borderRadius: 6,
                    backgroundColor: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Heart size={22} color="#374151" />
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                style={{
                  width: '100%',
                  height: 50,
                  marginTop: 12,
                  backgroundColor: product.stock > 0 ? '#0C0C0C' : '#D1D5DB',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1,
                  border: 'none',
                  borderRadius: 6,
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  textTransform: 'uppercase'
                }}
              >
                Buy Now
              </button>

              {/* WhatsApp Button */}
              <button
                onClick={handleWhatsApp}
                style={{
                  width: '100%',
                  height: 50,
                  marginTop: 12,
                  backgroundColor: '#25D366',
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontWeight: 600,
                  letterSpacing: 1,
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  textTransform: 'uppercase'
                }}
              >
                <MessageCircle size={20} />
                WhatsApp
              </button>

              {/* Accordion Sections */}
              <div style={{ marginTop: 40, borderTop: '1px solid #E5E7EB' }}>
                {/* Product Description */}
                <div style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')}
                    style={{
                      width: '100%',
                      padding: '20px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C' }}>Product Description</span>
                    <ChevronDown 
                      size={20} 
                      color="#6B7280"
                      style={{ 
                        transform: openAccordion === 'description' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} 
                    />
                  </button>
                  {openAccordion === 'description' && (
                    <div style={{ paddingBottom: 20, fontSize: 14, color: '#4B5563', lineHeight: 1.7 }}>
                      {product.description || 'No description available.'}
                    </div>
                  )}
                </div>

                {/* Size Chart */}
                <div style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'sizechart' ? '' : 'sizechart')}
                    style={{
                      width: '100%',
                      padding: '20px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C' }}>Size Chart</span>
                    <ChevronDown 
                      size={20} 
                      color="#6B7280"
                      style={{ 
                        transform: openAccordion === 'sizechart' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} 
                    />
                  </button>
                  {openAccordion === 'sizechart' && (
                    <div style={{ paddingBottom: 20 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                          <tr style={{ backgroundColor: '#F3F4F6' }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C' }}>Size</th>
                            {product.category === 'womenswear' ? (
                              <>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C' }}>Bust (inch)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C' }}>Waist (inch)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C' }}>Hip (inch)</th>
                              </>
                            ) : (
                              <>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C' }}>Chest (inch)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C' }}>Length (inch)</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#0C0C0C' }}>Shoulder (inch)</th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {currentSizeChart.map((row, index) => (
                            <tr key={row.size} style={{ backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }}>
                              <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 500 }}>{row.size}</td>
                              {product.category === 'womenswear' ? (
                                <>
                                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{row.bust}</td>
                                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{row.waist}</td>
                                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{row.hip}</td>
                                </>
                              ) : (
                                <>
                                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{row.chest}</td>
                                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{row.length}</td>
                                  <td style={{ padding: '12px 16px', color: '#6B7280' }}>{row.shoulder}</td>
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
                <div style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <button
                    onClick={() => setOpenAccordion(openAccordion === 'washguide' ? '' : 'washguide')}
                    style={{
                      width: '100%',
                      padding: '20px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#0C0C0C' }}>Wash Guide</span>
                    <ChevronDown 
                      size={20} 
                      color="#6B7280"
                      style={{ 
                        transform: openAccordion === 'washguide' ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.2s'
                      }} 
                    />
                  </button>
                  {openAccordion === 'washguide' && (
                    <div style={{ paddingBottom: 20, fontSize: 14, color: '#4B5563', lineHeight: 1.7 }}>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        <li style={{ marginBottom: 8 }}>Machine wash cold with similar colors</li>
                        <li style={{ marginBottom: 8 }}>Do not bleach</li>
                        <li style={{ marginBottom: 8 }}>Tumble dry low</li>
                        <li style={{ marginBottom: 8 }}>Iron on low heat if needed</li>
                        <li>Do not dry clean</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ backgroundColor: '#F7F7F7', padding: '60px 0' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 40px' }}>
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 400, 
              letterSpacing: 4, 
              textAlign: 'center', 
              marginBottom: 40,
              color: '#0C0C0C',
              textTransform: 'uppercase'
            }}>
              Related Products
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 30 }}>
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
