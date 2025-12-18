'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';

export default function ProductCard({ product }) {
  const router = useRouter();
  const { addItem } = useCartStore();

  const formatPrice = (price) => {
    return '৳' + price?.toLocaleString('en-BD');
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Add to cart and redirect to checkout
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url,
      quantity: 1,
      variant: null
    });
    
    // Direct to checkout (guest checkout)
    router.push('/checkout');
  };

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div style={{ position: 'relative' }}>
      <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        {/* Product Image - 4:5 aspect ratio */}
        <div 
          style={{ 
            position: 'relative', 
            paddingBottom: '125%', /* 4:5 = 125% */
            backgroundColor: '#F5F5F5', 
            overflow: 'hidden',
            marginBottom: 16
          }}
          className="product-image"
        >
          {product.images?.[0]?.url ? (
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              style={{ 
                objectFit: 'cover',
                transition: 'transform 0.5s ease'
              }}
            />
          ) : (
            <div style={{ 
              position: 'absolute', 
              inset: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#E8E8E8'
            }}>
              <span style={{ color: '#999', fontSize: 13 }}>No Image</span>
            </div>
          )}
          
          {/* Discount Badge */}
          {discount > 0 && (
            <div style={{
              position: 'absolute',
              top: 12,
              left: 12,
              padding: '5px 10px',
              backgroundColor: '#B08B5C',
              color: '#FFFFFF',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 0.5
            }}>
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{ padding: '0 4px' }}>
          {/* Title */}
          <h3 style={{ 
            fontSize: 15, 
            fontWeight: 500, 
            color: '#0C0C0C',
            marginBottom: 6,
            lineHeight: '22px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical'
          }}>
            {product.name}
          </h3>
          
          {/* Description - 1-2 lines */}
          {product.short_description && (
            <p style={{ 
              fontSize: 13, 
              color: '#919191',
              marginBottom: 10,
              lineHeight: '20px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {product.short_description}
            </p>
          )}
          
          {/* Price */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            marginBottom: 14
          }}>
            <span style={{ 
              fontSize: 16, 
              fontWeight: 600, 
              color: '#0C0C0C' 
            }}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price && product.compare_price > product.price && (
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
      </Link>

      {/* Buy Now Button */}
      <button
        onClick={handleBuyNow}
        style={{
          width: 'calc(100% - 8px)',
          margin: '0 4px',
          padding: '12px 0',
          backgroundColor: '#0C0C0C',
          color: '#FFFFFF',
          border: 'none',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#B08B5C';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#0C0C0C';
        }}
      >
        Buy Now
      </button>

      <style jsx global>{`
        .product-image:hover img {
          transform: scale(1.05) !important;
        }
      `}</style>
    </div>
  );
}
