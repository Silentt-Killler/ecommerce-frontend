'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, isMobile = false }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const primaryImage = product.images?.find(img => img.is_primary)?.url 
    || product.images?.[0]?.url 
    || null;

  const discount = product.compare_price 
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const formatPrice = (price) => '৳' + (price || 0).toLocaleString('en-BD');

  const getProductLink = () => {
    if (product.category === 'beauty') return `/beauty/${product.slug}`;
    if (product.category === 'watch') return `/watch/${product.slug}`;
    return `/product/${product.slug}`;
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: primaryImage,
      quantity: 1,
      variant: null
    });
    
    toast.success('Added to cart!');
    router.push('/checkout');
  };

  // ============================================
  // MOBILE VERSION - Premium Luxury Design
  // ============================================
  if (isMobile) {
    return (
      <Link href={getProductLink()} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Image Container - 3:4, Full Width, No Rounded Corners */}
        <div style={{
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: '#F7F7F7',
          overflow: 'hidden'
        }}>
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="50vw"
              style={{ 
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease'
              }}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#BDBDBD',
              fontSize: 12
            }}>
              No Image
            </div>
          )}

          {/* Discount Badge - Minimal */}
          {discount > 0 && (
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#0C0C0C',
              color: '#FFFFFF',
              padding: '6px 10px',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 1
            }}>
              -{discount}%
            </div>
          )}

          {/* Out of Stock */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#FFFFFF',
              padding: '8px',
              fontSize: 11,
              fontWeight: 500,
              textAlign: 'center',
              letterSpacing: 1,
              textTransform: 'uppercase'
            }}>
              Sold Out
            </div>
          )}
        </div>

        {/* Product Info - Minimal & Clean */}
        <div style={{ 
          padding: '14px 4px 8px',
          textAlign: 'center'
        }}>
          {/* Product Name */}
          <h3 style={{
            fontSize: 13,
            fontWeight: 400,
            color: '#0C0C0C',
            marginBottom: 6,
            lineHeight: 1.5,
            letterSpacing: 0.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>

          {/* Price */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 8 
          }}>
            <span style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: '#0C0C0C',
              letterSpacing: 0.5
            }}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price > product.price && (
              <span style={{
                fontSize: 12,
                color: '#999999',
                textDecoration: 'line-through'
              }}>
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ============================================
  // DESKTOP VERSION - Original Code (Buy Now Hover)
  // ============================================
  return (
    <Link 
      href={getProductLink()} 
      className="block group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Image Container - 3:4 Aspect Ratio */}
        <div className="relative aspect-[3/4] bg-[#F5F5F5] overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              className={`object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gold text-white px-2.5 py-1.5 text-[11px] font-semibold tracking-wide">
              -{discount}%
            </div>
          )}

          {/* Out of Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 right-3 bg-gray-500 text-white px-2.5 py-1.5 text-[11px] font-semibold">
              Out of Stock
            </div>
          )}

          {/* Buy Now Button - Shows on Hover (DESKTOP ONLY) */}
          <div 
            className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className={`w-full py-4 px-5 text-white text-[14px] font-semibold tracking-[1.5px] uppercase transition-colors ${product.stock === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-focus hover:bg-gray-800'}`}
            >
              {product.stock === 0 ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-6">
          {/* Brand - Only show for Watch category */}
          {product.brand?.name && product.category === 'watch' && (
            <p className="text-[11px] font-medium text-muted uppercase tracking-[1px] mb-1.5">
              {product.brand.name}
            </p>
          )}

          {/* Product Name */}
          <h3 style={{ 
            fontSize: '15px', 
            fontWeight: '500', 
            color: '#0C0C0C',
            marginTop: '20px',
            marginBottom: '8px',
            lineHeight: '1.4'
          }}>
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2.5">
            <span className="text-[16px] font-semibold text-focus">
              {formatPrice(product.price)}
            </span>
            
            {product.compare_price > product.price && (
              <span className="text-[13px] text-muted line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
