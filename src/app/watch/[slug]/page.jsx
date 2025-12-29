'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronDown, Minus, Plus, MessageCircle } from 'lucide-react';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import ProductCard from '@/components/product/ProductCard';
import toast from 'react-hot-toast';

export default function WatchProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
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
      router.push('/watch');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: quantity,
      variant: null
    });
    
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: quantity,
      variant: null
    });
    
    router.push('/checkout');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hi, I'm interested in ${product.name} - ৳${product.price}`);
    window.open(`https://wa.me/8801XXXXXXXXX?text=${message}`, '_blank');
  };

  // Auto zoom on hover
  const handleMouseEnter = () => setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);
  const handleMouseMove = (e) => {
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

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '2px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Product not found</p>
      </div>
    );
  }

  // Get specs from product
  const specs = product.specs || {};

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      {/* Spacer for header */}
      <div style={{ height: 70 }} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '14px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <Link href="/watch" style={{ color: '#6B7280', textDecoration: 'none' }}>Watch</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ color: '#0C0C0C' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          
          {/* Left - Images */}
          <div>
            {/* Main Image - Auto zoom on hover */}
            <div 
              style={{ 
                position: 'relative', 
                aspectRatio: '4/5', 
                backgroundColor: '#F9FAFB', 
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'crosshair'
              }}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
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
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: 16,
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      zIndex: 10
                    }}
                  >
                    <ChevronLeft size={20} color="#0C0C0C" />
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: 16,
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
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      zIndex: 10
                    }}
                  >
                    <ChevronRight size={20} color="#0C0C0C" />
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
                      width: 75,
                      height: 90,
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
                      width={75}
                      height={90}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div style={{ maxWidth: 480 }}>
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

            {/* Watch Specifications */}
            <div style={{ marginTop: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {/* Brand */}
                  {(product.brand?.name || specs.brand) && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', width: '45%', borderBottom: '1px solid #F3F4F6' }}>
                        Brand
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {product.brand?.name || specs.brand}
                      </td>
                    </tr>
                  )}
                  
                  {/* Model */}
                  {specs.model && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                        Model
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {specs.model}
                      </td>
                    </tr>
                  )}
                  
                  {/* Category */}
                  <tr>
                    <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                      Category
                    </td>
                    <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                      Watch
                    </td>
                  </tr>
                  
                  {/* Movement */}
                  {specs.movement && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                        Movement
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {specs.movement}
                      </td>
                    </tr>
                  )}
                  
                  {/* Case Size */}
                  {specs.case_size && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                        Case Size
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {specs.case_size}
                      </td>
                    </tr>
                  )}
                  
                  {/* Case Material */}
                  {specs.case_material && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                        Case Material
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {specs.case_material}
                      </td>
                    </tr>
                  )}
                  
                  {/* Band Material */}
                  {specs.band_material && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                        Band Material
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {specs.band_material}
                      </td>
                    </tr>
                  )}
                  
                  {/* Water Resistance */}
                  {specs.water_resistance && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                        Water Resistance
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {specs.water_resistance}
                      </td>
                    </tr>
                  )}
                  
                  {/* Warranty */}
                  {specs.warranty && (
                    <tr>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                        Warranty
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: '#0C0C0C', fontWeight: 500, borderBottom: '1px solid #F3F4F6' }}>
                        {specs.warranty}
                      </td>
                    </tr>
                  )}
                  
                  {/* Availability */}
                  <tr>
                    <td style={{ padding: '10px 0', fontSize: 13, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>
                      Availability
                    </td>
                    <td style={{ padding: '10px 0', fontSize: 13, fontWeight: 500, borderBottom: '1px solid #F3F4F6', color: product.stock > 0 ? '#059669' : '#DC2626' }}>
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Price */}
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #F3F4F6' }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: '#0C0C0C' }}>
                {formatPrice(product.price)}
              </span>
              {product.compare_price > product.price && (
                <>
                  <span style={{ fontSize: 16, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 12 }}>
                    {formatPrice(product.compare_price)}
                  </span>
                  <span style={{ 
                    marginLeft: 12, 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: '#FFFFFF', 
                    backgroundColor: '#B08B5C', 
                    padding: '4px 10px',
                    borderRadius: 4
                  }}>
                    -{Math.round((1 - product.price / product.compare_price) * 100)}%
                  </span>
                </>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
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
                    width: 44,
                    height: 50,
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Minus size={18} color="#374151" />
                </button>
                <span style={{ 
                  width: 50, 
                  height: 50, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: 16,
                  fontWeight: 600,
                  color: '#0C0C0C',
                  borderLeft: '1px solid #E5E7EB',
                  borderRight: '1px solid #E5E7EB'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: 44,
                    height: 50,
                    border: 'none',
                    backgroundColor: 'transparent',
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
                  backgroundColor: 'transparent',
                  color: product.stock > 0 ? '#0C0C0C' : '#9CA3AF',
                  fontSize: 13,
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
                    e.currentTarget.style.backgroundColor = '#B08B5C';
                    e.currentTarget.style.borderColor = '#B08B5C';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseOut={(e) => {
                  if (product.stock > 0) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#0C0C0C';
                    e.currentTarget.style.color = '#0C0C0C';
                  }
                }}
              >
                Add to Cart
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              style={{
                width: '100%',
                height: 50,
                marginTop: 10,
                backgroundColor: product.stock > 0 ? '#0C0C0C' : '#E5E7EB',
                color: product.stock > 0 ? '#FFFFFF' : '#9CA3AF',
                fontSize: 13,
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
                  e.currentTarget.style.backgroundColor = '#B08B5C';
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
                height: 50,
                marginTop: 10,
                backgroundColor: '#25D366',
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.5,
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                textTransform: 'uppercase',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1fb855'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>

            {/* Accordion Sections - Only Description & Delivery */}
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

              {/* Delivery & Return */}
              <div style={{ borderBottom: '1px solid #F3F4F6' }}>
                <button
                  onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')}
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
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C' }}>Delivery & Return</span>
                  <ChevronDown 
                    size={18} 
                    color="#6B7280"
                    style={{ 
                      transform: openAccordion === 'delivery' ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s'
                    }} 
                  />
                </button>
                {openAccordion === 'delivery' && (
                  <div style={{ paddingBottom: 16, fontSize: 13, color: '#4B5563', lineHeight: 1.8 }}>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 500, color: '#0C0C0C' }}>Delivery:</p>
                    <ul style={{ margin: '0 0 16px 0', paddingLeft: 18 }}>
                      <li style={{ marginBottom: 6 }}>Dhaka City: 1-2 business days</li>
                      <li style={{ marginBottom: 6 }}>Outside Dhaka: 3-5 business days</li>
                      <li>Delivery charge: ৳70 (Dhaka) / ৳120 (Outside)</li>
                    </ul>
                    <p style={{ margin: '0 0 12px 0', fontWeight: 500, color: '#0C0C0C' }}>Return Policy:</p>
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      <li style={{ marginBottom: 6 }}>7 days easy return for manufacturing defects</li>
                      <li style={{ marginBottom: 6 }}>Product must be unused with original packaging</li>
                      <li>Warranty claims handled separately</li>
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
        <div style={{ backgroundColor: '#FFFFFF', padding: '50px 0' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 40px' }}>
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
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id} product={relProduct} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
