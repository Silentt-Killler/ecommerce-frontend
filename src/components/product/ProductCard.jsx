'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ product, isMobile = false }) {
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

  // Mobile version - clean card without hover effects
  if (isMobile) {
    return (
      <Link href={getProductLink()} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Image Container - 3:4 Aspect Ratio */}
        <div style={{
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: '#F5F5F5',
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
                transition: 'opacity 0.3s'
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

          {/* Discount Badge */}
          {discount > 0 && (
            <div style={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: '#B08B5C',
              color: '#FFFFFF',
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: 0.5
            }}>
              -{discount}%
            </div>
          )}

          {/* Out of Stock */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#FFFFFF',
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 500
            }}>
              Sold Out
            </div>
          )}
        </div>

        {/* Product Info - No border, no shadow */}
        <div style={{ paddingTop: 12 }}>
          {/* Title - 14px, 400 weight, 0.5px letter spacing */}
          <h3 style={{
            fontSize: 14,
            fontWeight: 400,
            letterSpacing: 0.5,
            color: '#0C0C0C',
            marginBottom: 6,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>

          {/* Price - 14px, 600 weight */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: '#0C0C0C' 
            }}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price > product.price && (
              <span style={{
                fontSize: 12,
                color: '#919191',
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

  // Desktop version - with hover effects
  return (
    <Link 
      href={getProductLink()} 
      className="block group"
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

          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-gold text-white px-2.5 py-1.5 text-[11px] font-semibold tracking-wide">
              -{discount}%
            </div>
          )}

          {product.stock === 0 && (
            <div className="absolute top-3 right-3 bg-gray-500 text-white px-2.5 py-1.5 text-[11px] font-semibold">
              Out of Stock
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ paddingTop: 16 }}>
          {product.brand?.name && product.category === 'watch' && (
            <p style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#919191',
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 6
            }}>
              {product.brand.name}
            </p>
          )}

          {/* Title - 14px, 400 weight */}
          <h3 style={{ 
            fontSize: 14, 
            fontWeight: 400, 
            letterSpacing: 0.5,
            color: '#0C0C0C',
            marginBottom: 6,
            lineHeight: 1.4
          }}>
            {product.name}
          </h3>

          {/* Price - 14px, 600 weight */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0C0C0C' }}>
              {formatPrice(product.price)}
            </span>
            
            {product.compare_price > product.price && (
              <span style={{ fontSize: 12, color: '#919191', textDecoration: 'line-through' }}>
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
