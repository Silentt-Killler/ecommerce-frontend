'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Minus, Plus, MessageCircle } from 'lucide-react';
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
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState('description');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/slug/' + params.slug);
      setProduct(res.data);
      
      if (res.data.category) {
        const relatedRes = await api.get('/products?category=' + res.data.category + '&limit=4');
        const filtered = (relatedRes.data.products || []).filter(p => p._id !== res.data._id);
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      router.push('/');
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
      variant: {
        color: product.color?.name || null
      }
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
      variant: {
        color: product.color?.name || null
      }
    });
    router.push('/checkout');
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi, I am interested in ' + product.name + ' - ৳' + product.price);
    window.open('https://wa.me/8801XXXXXXXXX?text=' + message, '_blank');
  };

  const handleMouseEnter = () => !isMobile && setIsZoomed(true);
  const handleMouseLeave = () => setIsZoomed(false);
  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const formatPrice = (price) => '৳ ' + (price || 0).toLocaleString('en-BD');

  const getCategoryName = (category) => {
    const names = {
      'original-pakistani': 'Original Pakistani',
      'inspired-pakistani': 'Inspired Pakistani',
      'premium-bag': 'Premium Bag',
      'beauty': 'Beauty'
    };
    return names[category] || category;
  };

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

  // ========== MOBILE LAYOUT ==========
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', paddingBottom: 100 }}>
        <div style={{ height: 56 }} />

        {/* Breadcrumb */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #F3F4F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <Link href={'/' + product.category} style={{ color: '#6B7280', textDecoration: 'none' }}>{getCategoryName(product.category)}</Link>
          </div>
        </div>

        {/* Main Image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', backgroundColor: '#F9FAFB' }}>
          {product.images?.[selectedImage]?.url ? (
            <Image src={product.images[selectedImage].url} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB' }}>No Image</div>
          )}

          {/* Dots Indicator */}
          {product.images?.length > 1 && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {product.images.map((_, index) => (
                <div key={index} style={{ width: selectedImage === index ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: selectedImage === index ? '#0C0C0C' : 'rgba(255,255,255,0.7)', transition: 'all 0.2s' }} />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Images */}
        {product.images?.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto' }} className="hide-scrollbar">
            {product.images.map((img, index) => (
              <button key={index} onClick={() => setSelectedImage(index)} style={{ width: 60, height: 75, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: selectedImage === index ? '2px solid #0C0C0C' : '1px solid #E5E7EB', padding: 0, backgroundColor: '#F9FAFB' }}>
                <Image src={img.url} alt={product.name + ' ' + (index + 1)} width={60} height={75} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        )}

        {/* Product Info */}
        <div style={{ padding: '16px' }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#0C0C0C', lineHeight: 1.4, margin: 0 }}>{product.name}</h1>

          {/* Price */}
          <div style={{ marginTop: 10 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#0C0C0C' }}>{formatPrice(product.price)}</span>
            {product.compare_price > product.price && (
              <span style={{ fontSize: 14, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 10 }}>{formatPrice(product.compare_price)}</span>
            )}
          </div>

          {/* SKU, Availability, Brand */}
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <div style={{ color: '#6B7280' }}>SKU: <span style={{ color: '#374151' }}>{product.sku || 'N/A'}</span></div>
            <div style={{ color: '#6B7280' }}>Availability: <span style={{ color: product.stock > 0 ? '#059669' : '#DC2626', fontWeight: 500 }}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
            {product.brand && <div style={{ color: '#6B7280' }}>Brand: <span style={{ color: '#374151', fontWeight: 500 }}>{product.brand}</span></div>}
          </div>

          {/* Color */}
          {product.color?.name && (
            <div style={{ marginTop: 18 }}>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>Color: <span style={{ color: '#0C0C0C', fontWeight: 500 }}>{product.color.name}</span></p>
              <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: product.color.code || '#0C0C0C', border: '2px solid #E5E7EB' }} />
            </div>
          )}

          {/* Quantity + Add to Cart - Same Line */}
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 6, flexShrink: 0 }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 36, height: 42, border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={16} color="#374151" />
              </button>
              <span style={{ width: 32, textAlign: 'center', fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: 36, height: 42, border: 'none', backgroundColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} color="#374151" />
              </button>
            </div>
            <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ flex: 1, height: 42, backgroundColor: 'transparent', color: product.stock > 0 ? '#0C0C0C' : '#9CA3AF', fontSize: 12, fontWeight: 600, letterSpacing: 1, border: product.stock > 0 ? '1px solid #0C0C0C' : '1px solid #D1D5DB', borderRadius: 6, textTransform: 'uppercase' }}>
              Add to Cart
            </button>
          </div>

          {/* Buy Now + WhatsApp */}
          <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={handleBuyNow} disabled={product.stock === 0} style={{ width: '100%', height: 46, backgroundColor: product.stock > 0 ? '#0C0C0C' : '#E5E7EB', color: product.stock > 0 ? '#FFFFFF' : '#9CA3AF', fontSize: 13, fontWeight: 600, letterSpacing: 1, border: 'none', borderRadius: 6, textTransform: 'uppercase' }}>
              Buy Now
            </button>
            <button onClick={handleWhatsApp} style={{ width: '100%', height: 46, backgroundColor: '#25D366', color: '#FFFFFF', fontSize: 13, fontWeight: 600, letterSpacing: 1, border: 'none', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textTransform: 'uppercase' }}>
              <MessageCircle size={18} />
              WhatsApp
            </button>
          </div>

          {/* Accordions */}
          <div style={{ marginTop: 24, borderTop: '1px solid #F3F4F6' }}>
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <button onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')} style={{ width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Product Description</span>
                <ChevronDown size={20} color="#6B7280" style={{ transform: openAccordion === 'description' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {openAccordion === 'description' && <div style={{ paddingBottom: 16, fontSize: 13, color: '#4B5563', lineHeight: 1.7 }}>{product.description || 'No description available.'}</div>}
            </div>
            <div style={{ borderBottom: '1px solid #F3F4F6' }}>
              <button onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')} style={{ width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Delivery & Return</span>
                <ChevronDown size={20} color="#6B7280" style={{ transform: openAccordion === 'delivery' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {openAccordion === 'delivery' && (
                <div style={{ paddingBottom: 16, fontSize: 13, color: '#4B5563', lineHeight: 1.8 }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 500, color: '#0C0C0C' }}>Delivery:</p>
                  <ul style={{ margin: '0 0 14px 0', paddingLeft: 18 }}>
                    <li style={{ marginBottom: 4 }}>Dhaka City: 1-2 business days</li>
                    <li style={{ marginBottom: 4 }}>Outside Dhaka: 3-5 business days</li>
                    <li>Delivery charge: ৳70 (Dhaka) / ৳120 (Outside)</li>
                  </ul>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 500, color: '#0C0C0C' }}>Return Policy:</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    <li style={{ marginBottom: 4 }}>7 days easy return</li>
                    <li style={{ marginBottom: 4 }}>Product must be unused with tags</li>
                    <li>Exchange available for size issues</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div style={{ padding: '24px 16px', backgroundColor: '#F9FAFB' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1, textAlign: 'center', marginBottom: 20, color: '#0C0C0C', textTransform: 'uppercase' }}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {relatedProducts.map((p) => <ProductCard key={p._id} product={p} isMobile={true} />)}
            </div>
          </div>
        )}

        <style jsx global>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </div>
    );
  }

  // ========== DESKTOP LAYOUT ==========
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <div style={{ height: 70 }} />

      {/* Breadcrumb */}
      <div style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: '14px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}>
            <Link href="/" style={{ color: '#6B7280', textDecoration: 'none' }}>Home</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <Link href={'/' + product.category} style={{ color: '#6B7280', textDecoration: 'none' }}>{getCategoryName(product.category)}</Link>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span style={{ color: '#0C0C0C' }}>{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '40px 40px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'start' }}>
          
          {/* Left - Images */}
          <div>
            <div style={{ position: 'relative', aspectRatio: '4/5', backgroundColor: '#F9FAFB', borderRadius: 4, overflow: 'hidden', cursor: 'crosshair' }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}>
              {product.images?.[selectedImage]?.url ? (
                <Image src={product.images[selectedImage].url} alt={product.name} fill style={{ objectFit: 'cover', transform: isZoomed ? 'scale(2)' : 'scale(1)', transformOrigin: zoomPosition.x + '% ' + zoomPosition.y + '%', transition: isZoomed ? 'none' : 'transform 0.3s' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', fontSize: 14 }}>No Image</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                {product.images.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImage(index)} style={{ width: 75, height: 90, borderRadius: 4, overflow: 'hidden', border: selectedImage === index ? '2px solid #0C0C0C' : '1px solid #E5E7EB', padding: 0, cursor: 'pointer', backgroundColor: '#F9FAFB' }}>
                    <Image src={img.url} alt={product.name + ' ' + (index + 1)} width={75} height={90} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Info */}
          <div style={{ maxWidth: 480 }}>
            <h1 style={{ fontSize: 26, fontWeight: 500, color: '#0C0C0C', lineHeight: 1.3, margin: 0 }}>{product.name}</h1>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontSize: 13, color: '#6B7280' }}>SKU: <span style={{ color: '#374151' }}>{product.sku || 'N/A'}</span></div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>Availability: <span style={{ color: product.stock > 0 ? '#059669' : '#DC2626', fontWeight: 500 }}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
              {product.brand && <div style={{ fontSize: 13, color: '#6B7280' }}>Brand: <span style={{ color: '#374151', fontWeight: 500 }}>{product.brand}</span></div>}
              <div style={{ fontSize: 13, color: '#6B7280' }}>Product Type: <span style={{ color: '#374151' }}>{getCategoryName(product.category)}</span></div>
            </div>

            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 28, fontWeight: 600, color: '#0C0C0C' }}>{formatPrice(product.price)}</span>
              {product.compare_price > product.price && <span style={{ fontSize: 16, color: '#9CA3AF', textDecoration: 'line-through', marginLeft: 12 }}>{formatPrice(product.compare_price)}</span>}
            </div>

            {product.color?.name && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Color: <span style={{ color: '#0C0C0C', fontWeight: 500 }}>{product.color.name}</span></div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', backgroundColor: product.color.code || '#0C0C0C', border: '2px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} />
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E5E7EB', borderRadius: 4 }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: 44, height: 50, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={18} color="#374151" /></button>
                <span style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#0C0C0C', borderLeft: '1px solid #E5E7EB', borderRight: '1px solid #E5E7EB' }}>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} style={{ width: 44, height: 50, border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} color="#374151" /></button>
              </div>
              <button onClick={handleAddToCart} disabled={product.stock === 0} style={{ flex: 1, height: 50, backgroundColor: 'transparent', color: product.stock > 0 ? '#0C0C0C' : '#9CA3AF', fontSize: 13, fontWeight: 600, letterSpacing: 1.5, border: product.stock > 0 ? '1px solid #0C0C0C' : '1px solid #D1D5DB', borderRadius: 4, cursor: product.stock > 0 ? 'pointer' : 'not-allowed', textTransform: 'uppercase', transition: 'all 0.2s' }}
                onMouseOver={(e) => { if (product.stock > 0) { e.currentTarget.style.backgroundColor = '#B08B5C'; e.currentTarget.style.borderColor = '#B08B5C'; e.currentTarget.style.color = '#FFFFFF'; } }}
                onMouseOut={(e) => { if (product.stock > 0) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = '#0C0C0C'; e.currentTarget.style.color = '#0C0C0C'; } }}>
                Add to Cart
              </button>
            </div>

            <button onClick={handleBuyNow} disabled={product.stock === 0} style={{ width: '100%', height: 50, marginTop: 10, backgroundColor: product.stock > 0 ? '#0C0C0C' : '#E5E7EB', color: product.stock > 0 ? '#FFFFFF' : '#9CA3AF', fontSize: 13, fontWeight: 600, letterSpacing: 1.5, border: 'none', borderRadius: 4, cursor: product.stock > 0 ? 'pointer' : 'not-allowed', textTransform: 'uppercase', transition: 'all 0.2s' }}
              onMouseOver={(e) => { if (product.stock > 0) e.currentTarget.style.backgroundColor = '#B08B5C'; }}
              onMouseOut={(e) => { if (product.stock > 0) e.currentTarget.style.backgroundColor = '#0C0C0C'; }}>
              Buy Now
            </button>

            <button onClick={handleWhatsApp} style={{ width: '100%', height: 50, marginTop: 10, backgroundColor: '#25D366', color: '#FFFFFF', fontSize: 13, fontWeight: 600, letterSpacing: 1.5, border: 'none', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textTransform: 'uppercase', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1fb855'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}>
              <MessageCircle size={18} />
              WhatsApp
            </button>

            {/* Accordions */}
            <div style={{ marginTop: 32, borderTop: '1px solid #F3F4F6' }}>
              <div style={{ borderBottom: '1px solid #F3F4F6' }}>
                <button onClick={() => setOpenAccordion(openAccordion === 'description' ? '' : 'description')} style={{ width: '100%', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Product Description</span>
                  <ChevronDown size={20} color="#6B7280" style={{ transform: openAccordion === 'description' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {openAccordion === 'description' && <div style={{ paddingBottom: 16, fontSize: 13, color: '#4B5563', lineHeight: 1.7 }}>{product.description || 'No description available.'}</div>}
              </div>
              <div style={{ borderBottom: '1px solid #F3F4F6' }}>
                <button onClick={() => setOpenAccordion(openAccordion === 'delivery' ? '' : 'delivery')} style={{ width: '100%', padding: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#0C0C0C' }}>Delivery & Return</span>
                  <ChevronDown size={20} color="#6B7280" style={{ transform: openAccordion === 'delivery' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                      <li style={{ marginBottom: 6 }}>7 days easy return</li>
                      <li style={{ marginBottom: 6 }}>Product must be unused with tags</li>
                      <li>Exchange available for size issues</li>
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
            <h2 style={{ fontSize: 20, fontWeight: 500, letterSpacing: 3, textAlign: 'center', marginBottom: 32, color: '#0C0C0C', textTransform: 'uppercase' }}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              {relatedProducts.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
