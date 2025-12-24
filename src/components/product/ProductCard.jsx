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
      className="block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        {/* Image Container - 3:4 Aspect Ratio */}
        <div className="relative aspect-[3/4] bg-[#F5F5F5] rounded-lg overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
              className={`object-cover transition-transform duration-400 ${isHovered ? 'scale-105' : 'scale-100'} ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#CCC]">
              No Image
            </div>
          )}

          {/* Discount Badge New */}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-[#B08B5C] text-white px-2.5 py-1.5 text-[11px] font-semibold tracking-wide">
              -{discount}%
            </div>
          )}

          {/* Out of Stock Badge */}
          {product.stock === 0 && (
            <div className="absolute top-3 right-3 bg-[#919191] text-white px-2.5 py-1.5 text-[11px] font-semibold">
              Out of Stock
            </div>
          )}

          {/* Buy Now Button - Shows on Hover */}
          <div 
            className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
          >
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className={`w-full py-3.5 px-5 text-white text-[13px] font-semibold tracking-[1.5px] uppercase transition-colors ${product.stock === 0 ? 'bg-[#919191] cursor-not-allowed' : 'bg-[#0C0C0C] hover:bg-[#333]'}`}
            >
              {product.stock === 0 ? 'Sold Out' : 'Buy Now'}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-4">
          {/* Brand - Only show for Watch category */}
          {product.brand?.name && product.category === 'watch' && (
            <p className="text-[11px] font-medium text-[#919191] uppercase tracking-[1px] mb-1.5">
              {product.brand.name}
            </p>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-medium text-[#0C0C0C] mb-2 leading-snug line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2.5">
            <span className="text-[15px] font-semibold text-[#0C0C0C]">
              {formatPrice(product.price)}
            </span>
            
            {product.compare_price > product.price && (
              <span className="text-[13px] text-[#919191] line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
