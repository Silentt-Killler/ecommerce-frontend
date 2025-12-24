'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
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

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart
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

  return (
    <Link 
      href={`/product/${product.slug}`} 
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: 'relative' }}>
        {/* Image Container - 3:4 Aspect Ratio */}
        <div style={{ 
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: '#F5F5F5',
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              style={{ 
                objectFit: 'cover',
                transition: 'transform 0.4s ease',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                opacity: imageLoaded ? 1 : 0
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
              color: '#CCC'
            }}>
              No Image
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#B08B5C',
              color: '#FFFFFF',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5
            }}>
              -{discount}%
            </div>
          )}

          {/* Out of Stock Badge */}
          {product.stock === 0 && (
            <div style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: '#919191',
              color: '#FFFFFF',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 600
            }}>
              Out of Stock
            </div>
          )}

          {/* Buy Now Button - Shows on Hover */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s ease'
          }}>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              style={{
                width: '100%',
                padding: '14px 20px',
                backgroundColor: product.stock === 0 ? '#919191' : '#0C0C0C',
                color: '#FFFFFF',
                border: 'none',
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              {product.stock === 0 ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div style={{ paddingTop: 16 }}>
          {/* Brand - Only show for Watch category */}
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

          {/* Product Name */}
          <h3 style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#0C0C0C',
            marginBottom: 8,
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#0C0C0C'
            }}>
              {formatPrice(product.price)}
            </span>
            
            {product.compare_price > product.price && (
              <span style={{
                fontSize: 13,
                color: '#919191',
                textDecoration: 'line-through'
              }}>
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
