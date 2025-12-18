'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [params.slug]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/slug/${params.slug}`);
      setProduct(res.data);
      
      // Set default selections
      if (res.data.available_sizes?.length > 0) {
        setSelectedSize(res.data.available_sizes[0]);
      }
      if (res.data.available_colors?.length > 0) {
        setSelectedColor(res.data.available_colors[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => '৳' + price?.toLocaleString('en-BD');

  const handleQuantityChange = (change) => {
    const newQty = quantity + change;
    if (newQty >= 1 && newQty <= (product?.stock || 10)) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    if (product.available_sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.available_colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
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
        color: selectedColor
      }
    });
    
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (product.available_sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.available_colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
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
        color: selectedColor
      }
    });
    
    // Direct to checkout (guest checkout enabled)
    router.push('/checkout');
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

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #B08B5C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 400 }}>Product not found</h2>
        <Link href="/shop" style={{ color: '#B08B5C', textDecoration: 'underline' }}>Back to Shop</Link>
      </div>
    );
  }

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: 40, paddingBottom: 80 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: 30 }}>
          <Link href="/" style={{ fontSize: 13, color: '#919191', textDecoration: 'none' }}>Home</Link>
          <span style={{ margin: '0 10px', color: '#919191' }}>/</span>
          <Link href="/shop" style={{ fontSize: 13, color: '#919191', textDecoration: 'none' }}>Shop</Link>
          <span style={{ margin: '0 10px', color: '#919191' }}>/</span>
          <span style={{ fontSize: 13, color: '#0C0C0C' }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60 }}>
          
          {/* Left - Images */}
          <div>
            {/* Main Image */}
            <div style={{ position: 'relative', paddingBottom: '125%', backgroundColor: '#F5F5F5', marginBottom: 16 }}>
              {product.images?.[selectedImage]?.url ? (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#999' }}>No Image</span>
                </div>
              )}
              
              {/* Image Navigation */}
              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    style={{
                      position: 'absolute',
                      left: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 44,
                      height: 44,
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={nextImage}
                    style={{
                      position: 'absolute',
                      right: 16,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 44,
                      height: 44,
                      backgroundColor: '#FFFFFF',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {discount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  padding: '6px 12px',
                  backgroundColor: '#B08B5C',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 500
                }}>
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 12 }}>
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    style={{
                      width: 80,
                      height: 100,
                      border: selectedImage === index ? '2px solid #0C0C0C' : '1px solid #E0E0E0',
                      padding: 0,
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <Image src={img.url} alt="" fill style={{ objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div style={{ paddingTop: 20 }}>
            {/* Brand */}
            {product.brand && (
              <p style={{ fontSize: 13, color: '#B08B5C', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
                {product.brand}
              </p>
            )}

            {/* Title */}
            <h1 style={{ fontSize: 28, fontWeight: 400, color: '#0C0C0C', marginBottom: 16, lineHeight: 1.3 }}>
              {product.name}
            </h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: '#0C0C0C' }}>
                {formatPrice(product.price)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span style={{ fontSize: 18, color: '#919191', textDecoration: 'line-through' }}>
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p style={{ fontSize: 15, color: '#666', lineHeight: 1.7, marginBottom: 30 }}>
                {product.short_description}
              </p>
            )}

            {/* Size Selector */}
            {product.available_sizes?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Size
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {product.available_sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: selectedSize === size ? '#0C0C0C' : '#FFFFFF',
                        color: selectedSize === size ? '#FFFFFF' : '#0C0C0C',
                        border: '1px solid #0C0C0C',
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
            )}

            {/* Color Selector */}
            {product.available_colors?.length > 0 && (
              <div style={{ marginBottom: 30 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Color: {selectedColor}
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {product.available_colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: selectedColor === color ? '#0C0C0C' : '#FFFFFF',
                        color: selectedColor === color ? '#FFFFFF' : '#0C0C0C',
                        border: '1px solid #0C0C0C',
                        fontSize: 13,
                        cursor: 'pointer'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: 30 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#0C0C0C', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
                Quantity
              </p>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E0E0E0', width: 'fit-content' }}>
                <button
                  onClick={() => handleQuantityChange(-1)}
                  style={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <Minus size={18} />
                </button>
                <span style={{ width: 60, textAlign: 'center', fontSize: 16, fontWeight: 500 }}>
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  style={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Buttons - Add to Cart & Buy Now */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 30 }}>
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  padding: '16px 32px',
                  backgroundColor: '#FFFFFF',
                  color: '#0C0C0C',
                  border: '1px solid #0C0C0C',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#0C0C0C';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.color = '#0C0C0C';
                }}
              >
                Add to Cart
              </button>

              {/* Buy Now Button */}
              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1,
                  padding: '16px 32px',
                  backgroundColor: '#B08B5C',
                  color: '#FFFFFF',
                  border: '1px solid #B08B5C',
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#8B6B3D';
                  e.currentTarget.style.borderColor = '#8B6B3D';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#B08B5C';
                  e.currentTarget.style.borderColor = '#B08B5C';
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Stock Status */}
            <div style={{ marginBottom: 30 }}>
              {product.stock > 10 ? (
                <p style={{ fontSize: 13, color: '#1E7F4F' }}>✓ In Stock</p>
              ) : product.stock > 0 ? (
                <p style={{ fontSize: 13, color: '#B08B5C' }}>⚠ Only {product.stock} left</p>
              ) : (
                <p style={{ fontSize: 13, color: '#B00020' }}>✕ Out of Stock</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 30 }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Description
                </h3>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.8 }}>
                  {product.description}
                </div>
              </div>
            )}

            {/* Specs (for watches) */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div style={{ borderTop: '1px solid #E0E0E0', paddingTop: 30, marginTop: 30 }}>
                <h3 style={{ fontSize: 14, fontWeight: 500, color: '#0C0C0C', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Specifications
                </h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid #F0F0F0' }}>
                      <span style={{ fontSize: 13, color: '#919191', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                      <span style={{ fontSize: 13, color: '#0C0C0C', fontWeight: 500 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
